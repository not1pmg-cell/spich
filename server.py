"""StarUm server: python server.py"""
import sys, asyncio, json, os, random, re, sqlite3, hmac, hashlib, secrets, time
from urllib.parse import parse_qsl
from aiohttp import web
import bot, wallet, durak, nardy, quick, admin, botadmin

BASE = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.getenv("PORT", "3000")); TOKEN = bot.TOKEN
BOT_NAME = ""; TURN = 40; QTURN = 20
RNG = random.SystemRandom()
BOARD = {"chess", "checkers", "connect4", "gomoku", "reversi", "ttt"}   # mijozda hisoblanadi, natijani ikkalasi tasdiqlaydi
QUICK = {"dice", "rps", "coin", "hilo", "bj", "pen"}
WINS = {"dice": 2, "rps": 2, "pen": 5}   # xona egasi 1..5 tanlaydi: dice/rps — g'alabalar, pen — zarbalar soni
GAMES = BOARD | QUICK | {"durak", "nardy"}
ADMIN_IDS = [x.strip() for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()]

db = sqlite3.connect(os.getenv("DB_PATH") or os.path.join(BASE, "arena.db"), check_same_thread=False); db.row_factory = sqlite3.Row
db.executescript("""CREATE TABLE IF NOT EXISTS users(uid TEXT PRIMARY KEY,name TEXT,star REAL DEFAULT 0,
ton REAL DEFAULT 0,games INT DEFAULT 0,wins INT DEFAULT 0,refs INT DEFAULT 0,ref_by TEXT,guest INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS tx(id TEXT PRIMARY KEY);
CREATE TABLE IF NOT EXISTS log(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INT,uid TEXT,kind TEXT,cur TEXT,amt REAL,note TEXT);
CREATE TABLE IF NOT EXISTS games(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INT,g TEXT,cur TEXT,stake REAL,p0 TEXT,p1 TEXT,w INT);
CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY,v TEXT);
CREATE TABLE IF NOT EXISTS res(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INT,uid TEXT,g TEXT,stake REAL,prize REAL,win INT);
CREATE TABLE IF NOT EXISTS promo(code TEXT PRIMARY KEY,amt REAL,uses INT DEFAULT 0,max INT DEFAULT 1,exp INT DEFAULT 0,ts INT);
CREATE TABLE IF NOT EXISTS promo_used(code TEXT,uid TEXT,ts INT,PRIMARY KEY(code,uid));
CREATE TABLE IF NOT EXISTS wd(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INT,uid TEXT,amt REAL,ton REAL,addr TEXT,status TEXT DEFAULT 'pending',note TEXT DEFAULT '',done INT DEFAULT 0);
CREATE TABLE IF NOT EXISTS gw(id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,prize REAL,winners INT DEFAULT 1,ends INT,min_games INT DEFAULT 0,
 channel TEXT DEFAULT '',status TEXT DEFAULT 'active',created INT,result TEXT DEFAULT '');
CREATE TABLE IF NOT EXISTS gw_join(gid INT,uid TEXT,ts INT,PRIMARY KEY(gid,uid));
CREATE TABLE IF NOT EXISTS lb_awards(id INTEGER PRIMARY KEY AUTOINCREMENT,ts INT,period TEXT,place INT,uid TEXT,amt REAL,val REAL);
CREATE INDEX IF NOT EXISTS res_ts ON res(ts); CREATE INDEX IF NOT EXISTS log_uid ON log(uid);
CREATE INDEX IF NOT EXISTS users_ref ON users(ref_by);
CREATE TABLE IF NOT EXISTS tasks(uid TEXT,tid TEXT,day TEXT,ts INT,PRIMARY KEY(uid,tid,day));""")
for col in ("banned INT DEFAULT 0", "created INT DEFAULT 0", "last INT DEFAULT 0", "daily_ts INT DEFAULT 0",
            "ref_earn REAL DEFAULT 0", "wallet TEXT DEFAULT ''", "vip INT DEFAULT 0", "photo TEXT DEFAULT ''",
            "tok REAL DEFAULT 0", "tokd_ts INT DEFAULT 0"):
    try: db.execute("ALTER TABLE users ADD COLUMN " + col)
    except sqlite3.OperationalError: pass
try: db.execute("ALTER TABLE wd ADD COLUMN method TEXT DEFAULT 'ton'")
except sqlite3.OperationalError: pass
db.commit()
conns, ACTIVE, ROOMS = {}, [], {}

# ---- sozlamalar (admin paneldan o'zgaradi, kv jadvalida JSON bo'lib saqlanadi)
CFG = {"fee": 0.10, "ref": 0.05, "ref1": 0.03, "ref2": 0.02, "ref3": 0.01, "test": 1 if os.getenv("TEST_MODE") == "1" else 0, "maint": 0, "notice": "",
       "free_pvp": 0, "bot_mode": 0, "stakes": [10, 25, 50, 100, 250, 500, 1000], "min_wd": 500, "wd_fee": 0.2,
       "daily": 0, "welcome": 0, "star_usd": 0.015, "rate_manual": 0, "rate_fallback": 200,
       "jp_min": 10, "jp_time": 30, "jp_max": 32, "games_off": [], "hot": ["durak", "nardy", "jackpot"],
       "min_dep_star": 1, "min_dep_ton": 0.1,
       "arena_tiers": [50, 200], "arena_time": 25, "arena_max": 20, "lb_prizes": [1000, 500, 250], "lb_pr_on": 0, "lb_period": "week",
       # referal konkursi (bosh sahifadagi birinchi banner): rc_on, umumiy fond, tugash vaqti (unix ts, 0 — muddatsiz)
       "rc_on": 1, "rc_prize": 1000, "rc_end": 0,
       "lb_metric": "profit", "lb_auto": 0, "feed_min": 20, "wd_star": 1, "min_wd_star": 100,
       "dep_on": 1, "wd_on": 1, "wd_fee_star": 0.2, "force_sub": [],
       # SPC — o'yin tokeni (HOZIRCHA O'CHIQ, admin panel → Токен включён): bepul o'ynash uchun, vazifa va kunlik bonus orqali yig'iladi (pulga almashtirilmaydi)
       "tok_on": 0, "tok_daily": 100, "tok_welcome": 300, "tok_stakes": [10, 50, 100, 500], "tok_ch": "",
       "tk_play": 50, "tk_win": 50, "tk_ref": 300, "tk_sub": 100}
for r in db.execute("SELECT k,v FROM kv"):
    if r["k"] in CFG:
        try: v = json.loads(r["v"])
        except Exception: v = r["v"]
        if isinstance(CFG[r["k"]], (int, float)) and not isinstance(v, (int, float)):
            try: v = float(v)
            except Exception: continue
        CFG[r["k"]] = v
def setcfg(k, v):
    CFG[k] = v; db.execute("INSERT OR REPLACE INTO kv VALUES(?,?)", (k, json.dumps(v))); db.commit()
def logx(uid, kind, cur, amt, note=""):
    db.execute("INSERT INTO log(ts,uid,kind,cur,amt,note) VALUES(?,?,?,?,?,?)", (int(time.time()), uid, kind, cur, amt, note)); db.commit()

# ---- kurs: 1 TON = RATE() Stars (Fragment narxi: star_usd)
TON_USD = 0.0
def RATE():
    if CFG["rate_manual"]: return float(CFG["rate_manual"])
    if TON_USD and CFG["star_usd"]: return round(TON_USD / float(CFG["star_usd"]), 2)
    return float(CFG["rate_fallback"])

def user(uid):
    r = db.execute("SELECT * FROM users WHERE uid=?", (uid,)).fetchone()
    return dict(r) if r else None
def pub(u): return {"star": round(u["star"], 2), "games": u["games"], "wins": u["wins"], "refs": u["refs"],
                    "ref_earn": round(u["ref_earn"] or 0, 2), "tok": round(u.get("tok") or 0, 2), "wallet": u["wallet"] or "", "vip": u["vip"] or 0, "guest": u["guest"], "photo": u.get("photo") or ""}
def add(uid, amt):
    db.execute("UPDATE users SET star=ROUND(star+?,2) WHERE uid=?", (amt, uid)); db.commit()
def bal(uid): return (user(uid) or {}).get("star", 0)
def addt(uid, amt):
    db.execute("UPDATE users SET tok=ROUND(COALESCE(tok,0)+?,2) WHERE uid=?", (amt, uid)); db.commit()
def tbal(uid): return (user(uid) or {}).get("tok") or 0
def pubcfg():
    return {k: CFG[k] for k in ("fee", "ref1", "ref2", "ref3", "stakes", "min_wd", "wd_fee", "daily", "jp_min", "jp_max", "games_off", "hot",
                                "free_pvp", "bot_mode", "test", "min_dep_star", "min_dep_ton", "jp_time",
                                "arena_tiers", "arena_time", "lb_prizes", "lb_period", "lb_metric", "wd_star", "min_wd_star",
                                "dep_on", "wd_on", "wd_fee_star", "tok_on", "tok_daily", "tok_stakes", "rc_on", "rc_prize", "rc_end")} | {"force_sub": bool(CFG["force_sub"])} | {"rate": RATE(), "ref": ref_levels()[0]} | {"lb_prizes": CFG["lb_prizes"] if CFG["lb_pr_on"] else []}

class C:
    def __init__(s, ws): s.ws = ws; s.uid = None; s.name = ""; s.t = None; s.seat = 0; s.room = None
async def send(c, o):
    if c is None: return
    try: await c.ws.send_str(json.dumps(o))
    except Exception: pass
async def bcast(o):
    for c in list(conns.values()): await send(c, o)
async def me(uid, **extra):
    c = conns.get(uid); u = user(uid)
    if c and u: await send(c, {"t": "me", "user": pub(u), **extra})
async def notify(uid, text):
    """Telegram orqali shaxsiy xabar (bot)."""
    if TOKEN and uid.startswith("tg"):
        try: await bot.call("sendMessage", chat_id=uid[2:], text=text)
        except Exception: pass
async def notify_admins(text):
    for a in ADMIN_IDS:
        try: await bot.call("sendMessage", chat_id=a, text=text)
        except Exception: pass

def verify(m):
    init = m.get("init") or ""
    if TOKEN and init:
        d = dict(parse_qsl(init)); h = d.pop("hash", "")
        chk = "\n".join(f"{k}={d[k]}" for k in sorted(d))
        key = hmac.new(b"WebAppData", TOKEN.encode(), hashlib.sha256).digest()
        fresh = time.time() - int(d.get("auth_date") or 0) < 86400
        if fresh and hmac.compare_digest(hmac.new(key, chk.encode(), hashlib.sha256).hexdigest(), h):
            u = json.loads(d.get("user", "{}"))
            if u.get("id"):
                ph = str(u.get("photo_url") or "")
                return "tg%s" % u["id"], u.get("first_name", "Player"), 0, ph if ph.startswith("https://") else ""
    return "g" + re.sub(r"\W", "", str(m.get("uid", "x")))[:20], "", 1, ""   # mehmon: depozit/stavka yo'q

async def credit(uid, cur, amt, txid):
    """Depozit: Stars to'g'ridan-to'g'ri, TON kurs bo'yicha Stars'ga aylanadi."""
    if not user(uid) or db.execute("SELECT 1 FROM tx WHERE id=?", (txid,)).fetchone(): return
    stars = amt if cur == "star" else round(amt * RATE(), 2)
    db.execute("INSERT INTO tx VALUES(?)", (txid,)); db.commit(); add(uid, stars)
    logx(uid, "deposit", cur, amt, f"+{stars}⭐ " + txid[:20])
    c = conns.get(uid)
    if c: await send(c, {"t": "dep", "ok": True, "user": pub(user(uid)), "stars": stars})
    await notify_admins(f"💰 Пополнение: {user(uid)['name']} +{amt} {'⭐' if cur == 'star' else 'TON'}")

# ================= majburiy obuna =================
SUBOK = {}  # uid -> vaqt (tasdiqlangan obuna keshi)
def chan_id(ch):
    ch = str(ch).strip()
    return ch if ch.startswith("@") or ch.lstrip("-").isdigit() else "@" + ch.split("/")[-1]
async def missing_subs(uid):
    """Foydalanuvchi obuna bo'lmagan kanallar ro'yxati (bo'sh — hammasi joyida)."""
    chans = CFG["force_sub"] or []
    if not chans or not TOKEN or not uid.startswith("tg"): return []
    if time.time() - SUBOK.get(uid, 0) < 600: return []
    miss = []
    for ch in chans:
        try:
            r = await bot.call("getChatMember", chat_id=chan_id(ch), user_id=int(uid[2:]))
            if r.get("status") not in ("member", "administrator", "creator", "restricted"): miss.append(ch)
        except Exception as e:
            print("sub:", ch, e)   # bot kanalda admin emas — o'tkazib yuboramiz
    if not miss: SUBOK[uid] = time.time()
    return miss
def chan_link(ch):
    ch = str(ch).strip()
    if ch.startswith("http"): return ch
    return "https://t.me/" + ch.lstrip("@")

async def mass_bonus(amt, note="bonus"):
    """Barcha (ban qilinmagan) foydalanuvchilarga bonus."""
    ids = [r["uid"] for r in db.execute("SELECT uid FROM users WHERE banned=0")]
    for uid in ids: add(uid, amt); logx(uid, "bonus", "star", amt, note)
    for uid in ids:
        c = conns.get(uid)
        if c: await send(c, {"t": "gift", "amt": amt, "why": "🎁 Бонус для всех"}); await me(uid)
    return len(ids)

async def mass_set(amt):
    """Hammaning balansini aniq qiymatga o'rnatish (masalan 0 yoki 100)."""
    rows = db.execute("SELECT uid,star FROM users WHERE banned=0").fetchall()
    for r in rows:
        if round(r["star"], 2) != amt: logx(r["uid"], "admin", "star", round(amt - r["star"], 2), f"set all {amt:g}")
    db.execute("UPDATE users SET star=? WHERE banned=0", (amt,)); db.commit()
    for r in rows:
        if r["uid"] in conns: await me(r["uid"])
    return len(rows)

# ================= jonli yutuqlar lentasi =================
FEED = []
async def feed_push(uid, g, prize, stake):
    u = user(uid)
    if not u or prize - stake < CFG["feed_min"]: return
    it = {"name": u["name"], "ph": u.get("photo") or "", "g": g, "prize": round(prize, 2), "x": round(prize / stake, 2) if stake else 0, "ts": int(time.time())}
    FEED.insert(0, it); del FEED[30:]
    await bcast({"t": "feed", "item": it})

# ================= stol (o'yin) =================
def stop(t):
    tm = t.get("tm")
    if tm and tm is not asyncio.current_task(): tm.cancel()

def ref_levels(): return [float(CFG["ref1"] or 0), float(CFG["ref2"] or 0), float(CFG["ref3"] or 0)]

async def ref_pay(uid, stake, g):
    """3 bosqichli referal: o'yinchining stavkasidan
    1-daraja (uni taklif qilgan) — ref1, 2-daraja (taklif qilganning taklifchisi) — ref2, 3-daraja — ref3."""
    u = user(uid)
    if not u or not u["ref_by"]: return
    seen, cur = {uid}, u["ref_by"]
    for lv, pct in enumerate(ref_levels(), 1):
        if not cur or cur in seen: break          # zanjir tugadi yoki aylana bor
        seen.add(cur); p = user(cur)
        if not p: break
        amt = round(stake * pct, 2)
        if amt > 0:
            add(cur, amt); db.execute("UPDATE users SET ref_earn=ref_earn+? WHERE uid=?", (amt, cur)); db.commit()
            logx(cur, "ref", "star", amt, f"L{lv} · {u['name']} · {g}")
            await me(cur)
        cur = p["ref_by"]

def ref_stats(uid):
    """Har daraja bo'yicha: foiz, odamlar soni, ishlab topilgan summa."""
    l1 = "SELECT uid FROM users WHERE ref_by=?"; l2 = f"SELECT uid FROM users WHERE ref_by IN ({l1})"; l3 = f"SELECT uid FROM users WHERE ref_by IN ({l2})"
    n = [db.execute(f"SELECT COUNT(*) FROM ({q})", (uid,)).fetchone()[0] for q in (l1, l2, l3)]
    e2, e3 = [db.execute("SELECT COALESCE(SUM(amt),0) FROM log WHERE uid=? AND kind='ref' AND note LIKE ?", (uid, f"L{i} %")).fetchone()[0] for i in (2, 3)]
    tot = (user(uid) or {}).get("ref_earn") or 0
    earn = [max(0, tot - e2 - e3), e2, e3]   # eski yozuvlar (L belgisisiz) 1-darajaga kiradi
    return [{"p": p, "n": n[i], "earn": round(earn[i], 2)} for i, p in enumerate(ref_levels())]

async def settle(t, w):
    if t["done"]: return
    t["done"] = True; stop(t); st = t["stake"]; tok = t["cur"] == "tok"; bet = t["cur"] != "free"; paid = t["cur"] == "star"
    if t in ACTIVE: ACTIVE.remove(t)
    ids = [("bot" if u is None else u) for u in t["u"]]
    db.execute("INSERT INTO games(ts,g,cur,stake,p0,p1,w) VALUES(?,?,?,?,?,?,?)", (int(time.time()), t["g"], t["cur"], st, ids[0], ids[1], w)); db.commit()
    if paid and w != -1: logx(t["u"][w], "fee", "star", round(st * 2 * CFG["fee"], 2), t["g"])
    for i, uid in enumerate(t["u"]):
        if uid is None: continue
        amt = 0
        if bet:
            amt = st if w == -1 else round(st * 2 * (1 - CFG["fee"]), 2) if w == i else 0
            if amt: (addt if tok else add)(uid, amt); logx(uid, "win" if w == i else "refund", "tok" if tok else "star", amt, t["g"])
        if paid:
            if w == i: await feed_push(uid, t["g"], amt, st)
            if w != -1: await ref_pay(uid, st, t["g"])
        if not t.get("bot"):
            db.execute("UPDATE users SET games=games+1,wins=wins+? WHERE uid=?", (1 if w == i else 0, uid))
            db.execute("INSERT INTO res(ts,uid,g,stake,prize,win) VALUES(?,?,?,?,?,?)", (int(time.time()), uid, t["g"], st if paid else 0, amt if paid else 0, 1 if w == i else 0))
            db.commit()
        c = conns.get(uid)
        if c: await send(c, {"t": "paid", "user": pub(user(uid)), "amount": amt, "w": w})
    await rooms_bc()

def mk_table(ps, g, cur, st, opts=None, bot_game=False):
    opts = opts or {}
    t = {"id": secrets.token_hex(4), "u": [p.uid if p else None for p in ps], "p": ps, "cur": cur, "stake": st, "done": False,
         "res": {}, "g": g, "bot": bot_game, "opts": opts, "ts": int(time.time())}
    if g == "durak": t["eng"] = durak.Durak(bool(opts.get("tr")), 24 if opts.get("deck") == 24 else 36)
    elif g == "nardy": t["eng"] = nardy.Nardy()
    elif g in QUICK: t["eng"] = quick.Quick(g, opts.get("w"))
    return t

def lvl(uid):
    u = user(uid) or {}; xp = (u.get("games") or 0) * 10 + (u.get("wins") or 0) * 20
    return int((xp / 50) ** .5) + 1

async def begin(t):
    ACTIVE.append(t)
    if t["cur"] != "free":
        tok = t["cur"] == "tok"
        for uid in t["u"]:
            if uid: (addt if tok else add)(uid, -t["stake"]); logx(uid, "bet", "tok" if tok else "star", -t["stake"], t["g"])
    names = [{"name": p.name if p else "🤖 Bot", "lvl": lvl(p.uid) if p else 1} for p in t["p"]]
    for i, p in enumerate(t["p"]):
        if not p: continue
        p.t, p.seat = t, i
        await send(p, {"t": "me", "user": pub(user(p.uid))})
        await send(p, {"t": "start", "seat": i, "players": names, "game": t["g"], "cur": t["cur"], "stake": t["stake"],
                       "opts": t["opts"], "bot": t["bot"], "fee": CFG["fee"]})
    if "eng" in t: await push(t)
    await rooms_bc()

# ---- server-hakam o'yinlar uchun umumiy oqim
def waiting(t):
    e, g = t["eng"], t["g"]
    if g == "durak": w = e.waiting(); return [] if w is None else [w]
    if g == "nardy": return [] if e.winner is not None else [e.turn]
    return e.waiting()
def winner(t):
    e = t["eng"]
    if getattr(e, "draw", False): return -1
    return e.winner

async def push(t, bad=None, extra=None):
    e, g = t["eng"], t["g"]
    if g == "nardy":
        n = 0
        while e.winner is None and not e.legal() and n < 8:
            e.next_turn(); n += 1
            for i, p in enumerate(t["p"]):
                if p: await send(p, {"t": "nv", "v": e.view(i), "pass": 1, "left": TURN})
            await asyncio.sleep(1.2)
        if n >= 8: return await settle(t, -1)
    for i, p in enumerate(t["p"]):
        if not p: continue
        v = e.view(i)
        msg = {"t": {"durak": "dv", "nardy": "nv"}.get(g, "qv"), "v": v, "left": QTURN if g in QUICK else TURN, "bad": bad == i}
        if extra: msg.update(extra)
        await send(p, msg)
    if winner(t) is not None: return await settle(t, winner(t))
    stop(t); t["tm"] = asyncio.create_task(tick(t))

async def tick(t):
    if t["done"]: return
    ws = waiting(t); e, g = t["eng"], t["g"]
    if not ws: return
    bots = [w for w in ws if t["p"][w] is None]
    if bots:
        await asyncio.sleep(RNG.uniform(.9, 1.7) if g != "nardy" else RNG.uniform(.6, 1.1))
        w = bots[0]
        if g == "durak": a = e.bot(w); ok = e.act(w, *a) or e.act(w, *e.auto(w))
        elif g == "nardy": m = e.bot(); ok = m and e.move(w, *m)
        else: e.act(w, e.auto(w))
    else:
        await asyncio.sleep(QTURN if g in QUICK else TURN)
        if t["done"]: return
        for w in waiting(t):
            if g == "durak": a = e.auto(w); e.act(w, *a) or e.act(w, "take") or e.act(w, "done")
            elif g == "nardy":
                m = e.auto()
                if m: e.move(w, *m)
            else: e.act(w, e.auto(w))
    if not t["done"]: await push(t)

# ================= xonalar (lobbi) =================
def room_pub(r):
    return {"id": r["id"], "g": r["g"], "stake": r["stake"], "cur": r.get("cur", "star"), "opts": r["opts"], "host": r["hn"], "hl": r["hl"],
            "n": len(r["ps"]), "max": 2, "ts": r["ts"]}
async def rooms_bc(c=None):
    lst = [room_pub(r) for r in ROOMS.values() if not r["priv"]]
    lst.sort(key=lambda r: -r["ts"])
    live = [{"g": t["g"], "stake": t["stake"], "cur": t["cur"], "p": [(p.name if p else "Bot") for p in t["p"]]} for t in ACTIVE if not t["bot"]]
    msg = {"t": "rooms", "list": lst[:60], "live": live[:30], "nlive": len(live), "online": len(conns)}
    if c: await send(c, msg)
    else: await bcast(msg)

def norm_opts(g, o):
    o = o if isinstance(o, dict) else {}
    if g == "durak": return {"deck": 24 if o.get("deck") == 24 else 36, "tr": 1 if o.get("tr") else 0}
    if g in WINS:
        try: w = int(o.get("w") or WINS[g])
        except (TypeError, ValueError): w = WINS[g]
        return {"w": max(1, min(5, w))}
    return {}

async def validate(c, g, stake, cur="star"):
    if getattr(c, "needsub", False): await send(c, {"t": "err", "code": "sub"}); return None
    if g not in GAMES or g in CFG["games_off"]: await send(c, {"t": "err", "code": "off"}); return None
    if CFG["maint"]: await send(c, {"t": "err", "code": "maint"}); return None
    if c.t and not c.t["done"]: return None
    try: stake = float(stake or 0)
    except (TypeError, ValueError): return None
    if cur == "tok":
        if not CFG["tok_on"]: await send(c, {"t": "err", "code": "off"}); return None
        if stake not in [float(x) for x in CFG["tok_stakes"]]: return None
        if tbal(c.uid) < stake: await send(c, {"t": "err", "code": "tbalance"}); return None
        return stake
    if stake == 0:
        if not CFG["free_pvp"]: await send(c, {"t": "err", "code": "nofree"}); return None
        return 0.0
    if stake not in [float(x) for x in CFG["stakes"]]: return None
    u = user(c.uid)
    if u["guest"] and not CFG["test"]: await send(c, {"t": "err", "code": "guest"}); return None
    if u["star"] < stake: await send(c, {"t": "err", "code": "balance"}); return None
    return stake

async def leave_room(c, bc=True):
    r = ROOMS.get(c.room) if c.room else None; c.room = None
    if not r: return
    if c in r["ps"]: r["ps"].remove(c)
    if not r["ps"]: ROOMS.pop(r["id"], None)
    if bc: await rooms_bc()

async def create_room(c, g, stake, opts, priv=False, cur="star"):
    await leave_room(c, False)
    r = {"id": secrets.token_hex(3), "g": g, "stake": stake, "cur": cur, "opts": norm_opts(g, opts), "host": c.uid, "hn": c.name,
         "hl": lvl(c.uid), "ps": [c], "ts": int(time.time()), "priv": bool(priv)}
    ROOMS[r["id"]] = r; c.room = r["id"]
    await send(c, {"t": "wait", "room": room_pub(r), "priv": r["priv"]})
    await rooms_bc()

async def join_room(c, rid):
    r = ROOMS.get(rid)
    if not r: return await send(c, {"t": "err", "code": "gone"})
    if c in r["ps"]: return
    cur = r.get("cur", "star")
    st = await validate(c, r["g"], r["stake"], cur)
    if st is None: return
    await leave_room(c, False)
    r["ps"].append(c); c.room = rid
    if len(r["ps"]) < 2: return await rooms_bc()
    ROOMS.pop(rid, None)
    ok = [p for p in r["ps"] if r["stake"] == 0 or (tbal(p.uid) if cur == "tok" else bal(p.uid)) >= r["stake"]]
    for p in r["ps"]: p.room = None
    if len(ok) < 2:
        for p in r["ps"]:
            if p not in ok: await send(p, {"t": "err", "code": "tbalance" if cur == "tok" else "balance"})
        for p in ok: await send(p, {"t": "err", "code": "gone"})
        return await rooms_bc()
    await begin(mk_table(ok, r["g"], "tok" if cur == "tok" else "free" if r["stake"] == 0 else "star", r["stake"], r["opts"]))

async def cancel_room(rid, reason="cancel"):
    r = ROOMS.pop(rid, None)
    if not r: return False
    for p in r["ps"]:
        p.room = None; await send(p, {"t": "err", "code": reason})
    await rooms_bc(); return True

# ================= Jackpot va Arena (umumiy bank o'yinlari) =================
class Pot:
    """Bank o'yini: o'yinchilar stavka qo'yadi, taymer tugaganda stavkaga mutanosib ehtimol bilan g'olib tanlanadi.
    kind='jackpot' — g'ildirak, kind='arena' — maydon + to'p. priv=True — do'stlar bilan yopiq arena."""
    def __init__(s, key, kind, mn, priv=False, owner=None):
        s.key, s.kind, s.min, s.priv, s.owner = key, kind, mn, priv, owner
        s.id = 1; s.bets = []; s.st = "wait"; s.end = 0; s.win = None; s.hist = []; s.ts = time.time(); s.top = None
    @property
    def tmax(s): return CFG["jp_max"] if s.kind == "jackpot" else CFG["arena_max"]
    @property
    def ttime(s): return CFG["jp_time"] if s.kind == "jackpot" else CFG["arena_time"]
    def pot(s): return round(sum(b["amt"] for b in s.bets), 2)
    def pub(s):
        return {"t": "pot", "key": s.key, "kind": s.kind, "id": s.id, "bets": s.bets, "pot": s.pot(), "st": s.st,
                "left": max(0, s.end - time.time()), "win": s.win, "hist": s.hist[:15], "min": s.min, "max": s.tmax,
                "time": s.ttime, "fee": CFG["fee"], "priv": s.priv, "top": s.top}
    def summary(s): return {"pot": s.pot(), "n": len(s.bets), "st": s.st, "left": max(0, s.end - time.time()), "min": s.min}
    def calc_top(s):
        r = db.execute("""SELECT u.name,u.photo,r.prize,r.stake FROM res r JOIN users u ON u.uid=r.uid WHERE r.g=? AND r.win=1 AND r.ts>?
                          ORDER BY r.prize DESC LIMIT 1""", (s.kind, time.time() - 86400)).fetchone()
        s.top = {"name": r["name"], "ph": r["photo"] or "", "prize": r["prize"], "ch": round(r["stake"] * (1 - CFG["fee"]) / r["prize"] * 100, 1) if r["prize"] else 0} if r else None

POTS = {}
def pots_sync():
    if "jackpot" not in POTS: POTS["jackpot"] = Pot("jackpot", "jackpot", CFG["jp_min"]); POTS["jackpot"].calc_top()
    POTS["jackpot"].min = CFG["jp_min"]
    tiers = [float(x) for x in CFG["arena_tiers"]]
    for tv in tiers:
        k = "arena:%g" % tv
        if k not in POTS: POTS[k] = Pot(k, "arena", tv); POTS[k].calc_top()
    for k in [k for k, p in POTS.items() if p.kind == "arena" and not p.priv and p.min not in tiers and not p.bets]: POTS.pop(k)
pots_sync()
def pots_sum(): return {k: p.summary() for k, p in POTS.items() if not p.priv}

async def pot_push(p, extra=()):
    full = p.pub(); ids = {b["uid"] for b in p.bets} | set(extra)
    for c in list(conns.values()):
        if getattr(c, "watch", None) == p.key or c.uid in ids: await send(c, full)
    if not p.priv: await bcast({"t": "pots", "sum": pots_sum()})

async def pot_bet(c, key, amt):
    p = POTS.get(key)
    if not p: return await send(c, {"t": "err", "code": "gone"})
    amt = round(float(amt or 0), 2)
    if getattr(c, "needsub", False): return await send(c, {"t": "err", "code": "sub"})
    if p.kind in CFG["games_off"]: return await send(c, {"t": "err", "code": "off"})
    if CFG["maint"]: return await send(c, {"t": "err", "code": "maint"})
    if p.st == "spin": return await send(c, {"t": "err", "code": "spin"})
    u = user(c.uid)
    if u["guest"] and not CFG["test"]: return await send(c, {"t": "err", "code": "guest"})
    if amt < p.min or amt > 1e6: return await send(c, {"t": "err", "code": "min"})
    if u["star"] < amt: return await send(c, {"t": "err", "code": "balance"})
    b = next((x for x in p.bets if x["uid"] == c.uid), None)
    if not b and len(p.bets) >= p.tmax: return await send(c, {"t": "err", "code": "full"})
    add(c.uid, -amt); logx(c.uid, "bet", "star", -amt, p.kind)
    if b: b["amt"] = round(b["amt"] + amt, 2)
    else:
        used = {x["c"] for x in p.bets}
        col = next((i for i in range(24) if i not in used), len(p.bets))
        p.bets.append({"uid": c.uid, "name": c.name, "amt": amt, "c": col, "lvl": lvl(c.uid), "ph": u.get("photo") or "",
                       "seed": int(hashlib.md5((c.uid + str(p.id)).encode()).hexdigest()[:8], 16)})
    await me(c.uid); await send(c, {"t": "betok", "key": key, "amt": amt})
    if len(p.bets) >= 2 and p.st == "wait":
        p.st = "count"; p.end = time.time() + p.ttime; asyncio.create_task(pot_run(p, p.id))
    await pot_push(p)

async def pot_cancel(c, key):
    p = POTS.get(key)
    if not p or p.st != "wait": return
    b = next((x for x in p.bets if x["uid"] == c.uid), None)
    if not b: return
    p.bets.remove(b); add(c.uid, b["amt"]); logx(c.uid, "refund", "star", b["amt"], p.kind)
    await me(c.uid); await pot_push(p)

async def pot_refund(p):
    if p.st == "spin": return False
    for b in p.bets: add(b["uid"], b["amt"]); logx(b["uid"], "refund", "star", b["amt"], p.kind + " admin"); await me(b["uid"])
    p.id += 1; p.bets = []; p.st = "wait"; p.end = 0; p.win = None
    await pot_push(p); return True

async def pot_run(p, rid):
    await asyncio.sleep(max(0, p.end - time.time()))
    if p.id != rid or p.st != "count": return
    bets = p.bets; pot = p.pot()
    x = RNG.random() * pot; acc = 0; wi = len(bets) - 1
    for i, b in enumerate(bets):
        acc += b["amt"]
        if x < acc: wi = i; break
    w = bets[wi]; prize = round(pot * (1 - CFG["fee"]), 2)
    p.st = "spin"; p.win = {"i": wi, "uid": w["uid"], "name": w["name"], "ph": w.get("ph", ""), "prize": prize, "pot": pot,
                            "ch": round(w["amt"] / pot * 100, 1), "off": RNG.uniform(.15, .85), "seed": RNG.randrange(1 << 30)}
    await pot_push(p)
    await asyncio.sleep(7.5 if p.kind == "jackpot" else 8.5)
    add(w["uid"], prize); logx(w["uid"], "win", "star", prize, p.kind); logx(w["uid"], "fee", "star", round(pot - prize, 2), p.kind)
    now = int(time.time())
    for b in bets:
        win = b["uid"] == w["uid"]
        db.execute("UPDATE users SET games=games+1,wins=wins+? WHERE uid=?", (1 if win else 0, b["uid"]))
        db.execute("INSERT INTO res(ts,uid,g,stake,prize,win) VALUES(?,?,?,?,?,?)", (now, b["uid"], p.kind, b["amt"], prize if win else 0, 1 if win else 0))
        await ref_pay(b["uid"], b["amt"], p.kind)
    db.execute("INSERT INTO games(ts,g,cur,stake,p0,p1,w) VALUES(?,?,?,?,?,?,?)", (now, p.kind, "star", pot, w["uid"], f"{len(bets)} игроков", 0)); db.commit()
    for b in bets: await me(b["uid"])
    await feed_push(w["uid"], p.kind, prize, next(b["amt"] for b in bets if b["uid"] == w["uid"]))
    p.hist.insert(0, {"name": w["name"], "ph": w.get("ph", ""), "pot": pot, "prize": prize, "ch": p.win["ch"], "n": len(bets), "ts": now})
    p.calc_top()
    p.id += 1; p.bets = []; p.st = "wait"; p.end = 0; p.win = None
    if p.priv: p.ts = time.time()
    await pot_push(p, [b["uid"] for b in bets])

async def pot_new(c, tier):
    tier = float(tier or 0)
    if tier not in [float(x) for x in CFG["arena_tiers"]]: tier = float(CFG["arena_tiers"][0])
    key = "ap" + secrets.token_hex(3)
    POTS[key] = Pot(key, "arena", tier, True, c.uid); c.watch = key
    await send(c, POTS[key].pub())

# ================= bonuslar, reyting, hamyon =================
def period_start(per, t=None):
    """Joriy davr boshlanishi (server vaqti): day — 00:00, week — dushanba 00:00."""
    lt = time.localtime(t or time.time())
    day0 = time.mktime((lt.tm_year, lt.tm_mon, lt.tm_mday, 0, 0, 0, 0, 0, -1))
    return day0 - lt.tm_wday * 86400 if per == "week" else day0
def period_key(per, t=None):
    return time.strftime("%Y-%m-%d", time.localtime(period_start(per, t)))

# Reyting turlari: profit — sof yutuq (faqat plyusdagilar), dep — depozitlar (⭐, TON kurs bo'yicha),
# ref — taklif qilingan do'stlar soni, wins — g'alabalar. Minus/nol natijali o'yinchilar reytingga tushmaydi.
LB_BY = ("profit", "dep", "ref", "wins")
def lb_sql(by):
    if by == "dep":
        return ("SELECT uid, SUM(CASE WHEN cur='ton' THEN amt*%f ELSE amt END) v, COUNT(*) n, 0 w FROM log "
                "WHERE kind='deposit' AND ts>=? AND ts<? GROUP BY uid" % float(RATE()))
    if by == "ref":
        return ("SELECT ref_by uid, COUNT(*) v, COUNT(*) n, 0 w FROM users "
                "WHERE ref_by IS NOT NULL AND guest=0 AND created>=? AND created<? GROUP BY ref_by")
    col = "SUM(win)" if by == "wins" else "SUM(prize-stake)"
    return f"SELECT uid, {col} v, COUNT(*) n, SUM(win) w FROM res WHERE ts>=? AND ts<? AND stake>0 GROUP BY uid"
def LBX(by):
    return (f"SELECT q.uid,q.v,q.n,q.w,u.name,u.vip,u.photo ph,u.games ug,u.wins uw FROM ({lb_sql(by)}) q "
            "JOIN users u ON u.uid=q.uid WHERE u.banned=0 AND q.v>0")

def lb_top(since, until, by, n=50):
    if by not in LB_BY: by = "profit"
    out = [dict(x) for x in db.execute(f"SELECT * FROM ({LBX(by)}) ORDER BY v DESC, n ASC LIMIT ?", (since, until, n))]
    for r in out: r["v"] = round(r["v"] or 0, 2); r["p"] = r["v"]   # "p" — eski kod (admin) uchun
    return out

def lb(per, by, uid):
    if by not in LB_BY: by = "profit"
    now = time.time() + 1
    since = period_start(per) if per in ("day", "week") else 0
    rows = lb_top(since, now, by)
    for r in rows: r["lvl"] = int(((r.pop("ug") * 10 + r.pop("uw") * 20) / 50) ** .5) + 1; r["me"] = r["uid"] == uid; r.pop("uid")
    mine = db.execute(f"SELECT * FROM ({LBX(by)}) WHERE uid=?", (since, now, uid)).fetchone()
    my = None
    if mine:   # minusdagi o'yinchi o'z o'rnini ham ko'rmaydi
        rank = db.execute(f"SELECT COUNT(*) FROM ({LBX(by)}) WHERE v>?", (since, now, mine["v"])).fetchone()[0] + 1
        my = {"rank": rank, "v": round(mine["v"] or 0, 2), "p": round(mine["v"] or 0, 2), "w": mine["w"], "n": mine["n"]}
    pr = None
    if CFG["lb_pr_on"] and CFG["lb_prizes"] and per == CFG["lb_period"] and by == CFG["lb_metric"]:
        nxt = period_start(per) + (7 if per == "week" else 1) * 86400
        pr = {"list": CFG["lb_prizes"], "left": max(0, nxt - time.time()), "auto": CFG["lb_auto"]}
    last = [dict(r) for r in db.execute("SELECT a.place,a.amt,u.name FROM lb_awards a LEFT JOIN users u ON u.uid=a.uid WHERE a.period=(SELECT period FROM lb_awards ORDER BY id DESC LIMIT 1) ORDER BY a.place")]
    return {"t": "lb", "list": rows, "my": my, "per": per, "by": by, "prizes": pr, "lastw": last}

async def lb_award(since, until, label):
    """Reyting sovrinlarini to'lash: CFG['lb_prizes'] bo'yicha top o'yinchilarga."""
    prizes = [float(x) for x in CFG["lb_prizes"]]; by = CFG["lb_metric"]
    top = lb_top(since, until, by, len(prizes)); paid = []
    for i, r in enumerate(top):
        val = r["v"]
        if (val or 0) <= 0: continue
        amt = prizes[i]; add(r["uid"], amt); logx(r["uid"], "lbprize", "star", amt, f"#{i + 1} {label}")
        db.execute("INSERT INTO lb_awards(ts,period,place,uid,amt,val) VALUES(?,?,?,?,?,?)", (int(time.time()), label, i + 1, r["uid"], amt, val or 0))
        paid.append({"place": i + 1, "name": r["name"], "amt": amt})
        await notify(r["uid"], f"🏆 Вы заняли {i + 1} место в рейтинге! Приз: +{amt:g} ⭐")
        c = conns.get(r["uid"])
        if c: await send(c, {"t": "gift", "amt": amt, "why": f"🏆 #{i + 1}"}); await me(r["uid"])
    db.commit(); return paid

async def lb_loop():
    while True:
        await asyncio.sleep(60)
        try:
            per = CFG["lb_period"]; cur = period_key(per)
            row = db.execute("SELECT v FROM kv WHERE k='lb_last'").fetchone(); last = row["v"] if row else None
            if last != cur:
                if last and CFG["lb_pr_on"] and CFG["lb_auto"] and CFG["lb_prizes"]:
                    until = period_start(per); since = period_start(per, until - 1)
                    await lb_award(since, until, period_key(per, until - 1))
                db.execute("INSERT OR REPLACE INTO kv VALUES('lb_last',?)", (cur,)); db.commit()
        except Exception as e: print("lb:", repr(e))

# ================= konkurslar (giveaway) =================
def gw_list(uid):
    out = []
    for g in db.execute("SELECT * FROM gw WHERE status='active' OR (status='done' AND ends>?) ORDER BY status, ends", (time.time() - 3 * 86400,)):
        d = dict(g); d["n"] = db.execute("SELECT COUNT(*) FROM gw_join WHERE gid=?", (g["id"],)).fetchone()[0]
        d["joined"] = bool(db.execute("SELECT 1 FROM gw_join WHERE gid=? AND uid=?", (g["id"], uid)).fetchone())
        d["left"] = max(0, g["ends"] - time.time()); out.append(d)
    return out

async def gw_check_channel(uid, ch):
    if not ch or not TOKEN or not uid.startswith("tg"): return True
    try:
        r = await bot.call("getChatMember", chat_id=ch if ch.startswith("@") or ch.lstrip("-").isdigit() else "@" + ch, user_id=int(uid[2:]))
        return r.get("status") in ("member", "administrator", "creator", "restricted")
    except Exception: return False

async def gw_finish(g):
    ids = [r["uid"] for r in db.execute("SELECT uid FROM gw_join WHERE gid=?", (g["id"],))]
    win = RNG.sample(ids, min(len(ids), g["winners"])) if ids else []
    names = []
    for uid in win:
        add(uid, g["prize"]); logx(uid, "giveaway", "star", g["prize"], g["title"][:40])
        names.append((user(uid) or {}).get("name", "?"))
        await notify(uid, f"🎉 Вы выиграли в розыгрыше «{g['title']}»: +{g['prize']:g} ⭐")
        c = conns.get(uid)
        if c: await send(c, {"t": "gift", "amt": g["prize"], "why": "🎉 " + g["title"]}); await me(uid)
    db.execute("UPDATE gw SET status='done',result=? WHERE id=?", (json.dumps(names, ensure_ascii=False), g["id"])); db.commit()
    await bcast({"t": "gwdone", "id": g["id"], "title": g["title"], "names": names})
    return names

async def gw_loop():
    while True:
        await asyncio.sleep(15)
        try:
            for g in db.execute("SELECT * FROM gw WHERE status='active' AND ends<=?", (time.time(),)).fetchall(): await gw_finish(dict(g))
            for k in [k for k, p in POTS.items() if p.priv and not p.bets and time.time() - p.ts > 7200]: POTS.pop(k, None)
        except Exception as e: print("gw:", repr(e))

# ================= SPC tokeni: vazifalar va kunlik bonus =================
def tasks_for(uid):
    u = user(uid); d0 = period_start("day"); dk = period_key("day")
    r = db.execute("SELECT COUNT(*) n, COALESCE(SUM(win),0) w FROM res WHERE uid=? AND ts>=?", (uid, d0)).fetchone()
    done = {x["tid"] for x in db.execute("SELECT tid FROM tasks WHERE uid=? AND (day=? OR day='')", (uid, dk))}
    L = [{"id": "play", "p": min(r["n"], 3), "n": 3, "r": CFG["tk_play"], "daily": 1},
         {"id": "win", "p": min(r["w"], 1), "n": 1, "r": CFG["tk_win"], "daily": 1},
         {"id": "ref", "p": min(u["refs"] or 0, 1), "n": 1, "r": CFG["tk_ref"], "daily": 0}]
    if CFG["tok_ch"]: L.append({"id": "sub", "p": 0, "n": 1, "r": CFG["tk_sub"], "daily": 0, "ch": CFG["tok_ch"]})
    L = [x for x in L if x["r"]]
    for x in L: x["done"] = x["id"] in done
    return L

async def send_tasks(c):
    u = user(c.uid)
    await send(c, {"t": "tasks", "list": tasks_for(c.uid), "daily": CFG["tok_daily"], "on": CFG["tok_on"],
                   "next": max(0, (u["tokd_ts"] or 0) + 86400 - time.time())})

async def task_claim(c, tid):
    if not CFG["tok_on"]: return
    x = next((x for x in tasks_for(c.uid) if x["id"] == tid), None)
    if not x: return
    if x["done"]: return await send(c, {"t": "err", "code": "used"})
    if tid == "sub":
        if not await gw_check_channel(c.uid, x["ch"]): return await send(c, {"t": "err", "code": "gwsub", "ch": x["ch"]})
    elif x["p"] < x["n"]: return await send(c, {"t": "err", "code": "task"})
    try: db.execute("INSERT INTO tasks VALUES(?,?,?,?)", (c.uid, tid, period_key("day") if x["daily"] else "", int(time.time()))); db.commit()
    except sqlite3.IntegrityError: return await send(c, {"t": "err", "code": "used"})
    addt(c.uid, x["r"]); logx(c.uid, "task", "tok", x["r"], tid)
    await me(c.uid); await send(c, {"t": "gift", "amt": x["r"], "cur": "tok", "why": "✅"}); await send_tasks(c)

UNAME = re.compile(r"^@?[A-Za-z][A-Za-z0-9_]{3,31}$")
ADDR = re.compile(r"^(EQ|UQ|kQ|0Q)[A-Za-z0-9_\-]{46}$|^-?[01]:[0-9a-fA-F]{64}$")
def clean(s, n=20): return re.sub(r"[<>\x00-\x1f]", "", str(s or ""))[:n]

# ================= xabarlar =================
async def leave(c):
    t = c.t; c.t = None
    if t and not t["done"]:
        o = t["p"][1 - c.seat]
        await send(o, {"t": "opp_left"}); await settle(t, 1 - c.seat)

async def drop(c):
    if not c.uid: return
    await leave_room(c); await leave(c)
    if conns.get(c.uid) is c: del conns[c.uid]
    c.uid = None; await bcast({"t": "online", "n": len(conns)})

async def on_msg(c, m):
    k = m.get("t")
    if k == "hello":
        uid, nm, guest, photo = verify(m)
        name = clean(m.get("name") or nm or "Player") or "Player"
        if (user(uid) or {}).get("banned"): await send(c, {"t": "banned"}); await c.ws.close(); return
        if not user(uid):
            ref = str(m.get("ref") or "")[:24]; okref = ref != uid and user(ref)
            db.execute("INSERT INTO users(uid,name,guest,ref_by,created,last) VALUES(?,?,?,?,?,?)", (uid, name, guest, ref if okref else None, int(time.time()), int(time.time())))
            if okref: db.execute("UPDATE users SET refs=refs+1 WHERE uid=?", (ref,))
            db.commit()
            if CFG["welcome"] and not guest: add(uid, CFG["welcome"]); logx(uid, "bonus", "star", CFG["welcome"], "welcome")
            if CFG["tok_on"] and CFG["tok_welcome"]: addt(uid, CFG["tok_welcome"]); logx(uid, "bonus", "tok", CFG["tok_welcome"], "welcome")
        else: db.execute("UPDATE users SET name=?,last=? WHERE uid=?", (name, int(time.time()), uid)); db.commit()
        if photo: db.execute("UPDATE users SET photo=? WHERE uid=?", (photo, uid)); db.commit()
        old = conns.get(uid)
        if old and old is not c: await drop(old); await old.ws.close()
        c.uid, c.name = uid, name; conns[uid] = c
        await send(c, {"t": "me", "uid": uid, "user": pub(user(uid)), "bot": BOT_NAME, "online": len(conns), "notice": CFG["notice"], "cfg": pubcfg()})
        await send(c, {"t": "pots", "sum": pots_sum()}); await send(c, {"t": "feedall", "list": FEED[:20]}); await rooms_bc(c)
        await send(c, {"t": "gws", "list": gw_list(uid)})
        miss = await missing_subs(uid); c.needsub = bool(miss)
        if miss: await send(c, {"t": "needsub", "ch": [{"name": ch, "url": chan_link(ch)} for ch in miss]})
        rid = str(m.get("room") or "")
        if rid in ROOMS: await send(c, {"t": "invite", "room": room_pub(ROOMS[rid])})
        ak = "ap" + re.sub(r"\W", "", str(m.get("arena") or ""))[:8]
        if ak in POTS: c.watch = ak; await send(c, {**POTS[ak].pub(), "open": 1})
        if m.get("bonus"): await on_msg(c, {"t": "promo", "code": m.get("bonus"), "link": 1})
        await bcast({"t": "online", "n": len(conns)}); return
    if not c.uid: return
    if k == "name":
        c.name = clean(m.get("name")) or c.name
        db.execute("UPDATE users SET name=? WHERE uid=?", (c.name, c.uid)); db.commit()
    elif k == "rooms": await rooms_bc(c)
    elif k == "subcheck":
        SUBOK.pop(c.uid, None); miss = await missing_subs(c.uid); c.needsub = bool(miss)
        await send(c, {"t": "needsub", "ch": [{"name": ch, "url": chan_link(ch)} for ch in miss]} if miss else {"t": "subok"})
    elif k in ("quick", "create"):
        g = m.get("game"); cur = "tok" if m.get("cur") == "tok" else "star"
        st = await validate(c, g, m.get("stake"), cur)
        if st is None: return
        if cur == "tok" and st == 0: cur = "star"
        opts = norm_opts(g, m.get("opts"))
        if k == "quick":
            r = next((r for r in ROOMS.values() if not r["priv"] and r["g"] == g and r["stake"] == st and r.get("cur", "star") == cur and r["opts"] == opts and r["host"] != c.uid and len(r["ps"]) < 2), None)
            if r: return await join_room(c, r["id"])
        await create_room(c, g, st, opts, k == "create" and m.get("priv"), cur)
    elif k == "join": await join_room(c, str(m.get("id")))
    elif k == "cancel": await leave_room(c)
    elif k == "bot":
        g = m.get("game")
        if not CFG["bot_mode"]: return await send(c, {"t": "err", "code": "nobot"})
        if g not in GAMES or g in BOARD or (c.t and not c.t["done"]): return
        await leave_room(c, False)
        await begin(mk_table([c, None], g, "free", 0, norm_opts(g, m.get("opts")), True))
    elif k == "dmove" and c.t and c.t["g"] == "durak" and not c.t["done"]:
        try: ok = c.t["eng"].act(c.seat, str(m.get("a")), int(m["c"]) if m.get("c") is not None else None, int(m["i"]) if m.get("i") is not None else None)
        except Exception: ok = False
        await push(c.t, None if ok else c.seat)
    elif k == "nmove" and c.t and c.t["g"] == "nardy" and not c.t["done"]:
        try: ok = c.t["eng"].move(c.seat, int(m["f"]), int(m["to"]))
        except Exception: ok = False
        await push(c.t, None if ok else c.seat)
    elif k == "qmove" and c.t and c.t["g"] in QUICK and not c.t["done"]:
        ok = c.t["eng"].act(c.seat, str(m.get("v")))
        if ok:
            await push(c.t)
    elif k == "move" and c.t and not c.t["done"] and c.t["g"] in BOARD:
        await send(c.t["p"][1 - c.seat], {"t": "move", "d": m.get("d"), "from": c.seat})
    elif k == "chat" and c.t:
        txt = str(m.get("text", ""))[:20]
        for p in c.t["p"]: await send(p, {"t": "chat", "from": c.seat, "name": c.name, "text": txt})
    elif k == "result" and c.t and not c.t["done"] and c.t["g"] in BOARD:
        w, t = m.get("winner"), c.t
        if w not in (-1, 0, 1): return
        t["res"][c.seat] = w
        if len(t["res"]) == 2: await settle(t, w if t["res"][0] == t["res"][1] else -1)
        else: asyncio.create_task(res_timeout(t))
    elif k == "leave": await leave(c)
    elif k == "lb": await send(c, lb(m.get("per", "all"), m.get("by", "profit"), c.uid))
    elif k == "pot":
        key = str(m.get("key") or ""); c.watch = key
        if key in POTS: await send(c, POTS[key].pub())
        else: await send(c, {"t": "err", "code": "gone"})
    elif k == "unwatch": c.watch = None
    elif k == "potbet": await pot_bet(c, str(m.get("key") or ""), m.get("amount"))
    elif k == "potcancel": await pot_cancel(c, str(m.get("key") or ""))
    elif k == "potnew": await pot_new(c, m.get("tier"))
    elif k == "gws": await send(c, {"t": "gws", "list": gw_list(c.uid)})
    elif k == "gwjoin":
        g = db.execute("SELECT * FROM gw WHERE id=? AND status='active'", (int(m.get("id") or 0),)).fetchone(); u = user(c.uid)
        if not g: return await send(c, {"t": "err", "code": "gone"})
        if u["guest"] and not CFG["test"]: return await send(c, {"t": "err", "code": "guest"})
        if u["games"] < (g["min_games"] or 0): return await send(c, {"t": "err", "code": "gwgames", "n": g["min_games"]})
        if not await gw_check_channel(c.uid, g["channel"]): return await send(c, {"t": "err", "code": "gwsub", "ch": g["channel"]})
        try: db.execute("INSERT INTO gw_join VALUES(?,?,?)", (g["id"], c.uid, int(time.time()))); db.commit()
        except sqlite3.IntegrityError: pass
        await send(c, {"t": "gwok", "id": g["id"]}); await send(c, {"t": "gws", "list": gw_list(c.uid)})
    elif k == "deposit":
        if not CFG["dep_on"]: return await send(c, {"t": "err", "code": "depoff"})
        meth = m.get("method")
        try: amt = round(float(m.get("amount") or 0), 4)
        except Exception: return
        if meth == "star": amt = int(amt)
        if not (CFG["min_dep_star"] if meth == "star" else CFG["min_dep_ton"]) <= amt <= 100000: return await send(c, {"t": "err", "code": "min"})
        if CFG["test"]: return await credit(c.uid, "ton" if meth == "ton" else "star", amt, "test:" + secrets.token_hex(8))
        no = {"t": "dep", "ok": False}
        if not TOKEN or user(c.uid)["guest"]: return await send(c, no)
        if meth == "star":
            link = await wallet.stars_link(c.uid, int(amt)); await send(c, {**no, "link": link} if link else no)
        elif meth == "ton" and wallet.TON_ADDR:
            await send(c, {**no, "ton": {"addr": wallet.TON_ADDR, "comment": "dep:" + c.uid, "amount": amt, "stars": round(amt * RATE(), 2)}})
        else: await send(c, no)
    elif k == "wallet":
        a = str(m.get("addr") or "")[:80]
        db.execute("UPDATE users SET wallet=? WHERE uid=?", (a, c.uid)); db.commit()
    elif k == "wd":
        u = user(c.uid); addr = str(m.get("addr") or "").strip(); meth = "star" if m.get("method") == "star" else "ton"
        try: amt = round(float(m.get("amount") or 0), 2)
        except Exception: return
        if not CFG["wd_on"]: return await send(c, {"t": "err", "code": "wdoff"})
        if u["guest"] and not CFG["test"]: return await send(c, {"t": "err", "code": "guest"})
        if meth == "ton" and not ADDR.match(addr): return await send(c, {"t": "err", "code": "addr"})
        if meth == "star":
            if not CFG["wd_star"]: return await send(c, {"t": "err", "code": "off"})
            if not UNAME.match(addr): return await send(c, {"t": "err", "code": "uname"})
            addr = "@" + addr.lstrip("@"); amt = float(int(amt))
        if amt < (CFG["min_wd_star"] if meth == "star" else CFG["min_wd"]): return await send(c, {"t": "err", "code": "min"})
        if amt > u["star"]: return await send(c, {"t": "err", "code": "balance"})
        if db.execute("SELECT COUNT(*) FROM wd WHERE uid=? AND status='pending'", (c.uid,)).fetchone()[0] >= 3: return await send(c, {"t": "err", "code": "wdmany"})
        out = int(amt * (1 - CFG["wd_fee_star"])) if meth == "star" else round(amt / RATE() * (1 - CFG["wd_fee"]), 4)
        unit = "⭐" if meth == "star" else "TON"
        add(c.uid, -amt); logx(c.uid, "withdraw", "star", -amt, f"{out} {unit} → {addr[:12]}")
        db.execute("INSERT INTO wd(ts,uid,amt,ton,addr,method) VALUES(?,?,?,?,?,?)", (int(time.time()), c.uid, amt, out, addr, meth)); db.commit()
        await me(c.uid); await send(c, {"t": "wdok", "out": out, "unit": unit})
        await notify_admins(f"📤 Заявка на вывод: {u['name']} — {amt}⭐ → {out} {unit} ({addr})")
        await on_msg(c, {"t": "wds"})
    elif k == "wds":
        await send(c, {"t": "wds", "list": [dict(r) for r in db.execute("SELECT id,ts,amt,ton,addr,status,note,method FROM wd WHERE uid=? ORDER BY id DESC LIMIT 20", (c.uid,))]})
    elif k == "hist":
        await send(c, {"t": "hist", "list": [dict(r) for r in db.execute("SELECT ts,kind,cur,amt,note FROM log WHERE uid=? AND kind NOT IN ('fee','audit') ORDER BY id DESC LIMIT 50", (c.uid,))]})
    elif k == "bonus":
        u = user(c.uid)
        await send(c, {"t": "bonus", "daily": CFG["daily"], "next": max(0, (u["daily_ts"] or 0) + 86400 - time.time()),
                       "ref": ref_levels()[0], "lv": ref_stats(c.uid), "refs": u["refs"], "earn": round(u["ref_earn"] or 0, 2),
                       "friends": [dict(r) for r in db.execute("SELECT name,games FROM users WHERE ref_by=? ORDER BY created DESC LIMIT 20", (c.uid,))]})
    elif k == "daily":
        u = user(c.uid)
        if not CFG["daily"] or u["guest"] and not CFG["test"]: return
        if time.time() - (u["daily_ts"] or 0) < 86400: return await send(c, {"t": "err", "code": "early"})
        db.execute("UPDATE users SET daily_ts=? WHERE uid=?", (int(time.time()), c.uid)); db.commit()
        add(c.uid, CFG["daily"]); logx(c.uid, "bonus", "star", CFG["daily"], "daily")
        await me(c.uid); await send(c, {"t": "gift", "amt": CFG["daily"]}); await on_msg(c, {"t": "bonus"})
    elif k == "tasks": await send_tasks(c)
    elif k == "task": await task_claim(c, str(m.get("id") or ""))
    elif k == "tokdaily":
        u = user(c.uid)
        if not CFG["tok_on"] or not CFG["tok_daily"]: return
        if time.time() - (u["tokd_ts"] or 0) < 86400: return await send(c, {"t": "err", "code": "early"})
        db.execute("UPDATE users SET tokd_ts=? WHERE uid=?", (int(time.time()), c.uid)); db.commit()
        addt(c.uid, CFG["tok_daily"]); logx(c.uid, "bonus", "tok", CFG["tok_daily"], "daily")
        await me(c.uid); await send(c, {"t": "gift", "amt": CFG["tok_daily"], "cur": "tok"}); await send_tasks(c)
    elif k == "promo":
        code = re.sub(r"\W", "", str(m.get("code") or "")).upper()[:24]
        p = db.execute("SELECT * FROM promo WHERE code=?", (code,)).fetchone()
        u = user(c.uid)
        if not p or (p["exp"] and p["exp"] < time.time()) or p["uses"] >= p["max"]: return await send(c, {"t": "err", "code": "promo"}) if not m.get("link") or p else None
        if u["guest"] and not CFG["test"]: return await send(c, {"t": "err", "code": "guest"})
        try: db.execute("INSERT INTO promo_used VALUES(?,?,?)", (code, c.uid, int(time.time())))
        except sqlite3.IntegrityError: return await send(c, {"t": "err", "code": "used"})
        db.execute("UPDATE promo SET uses=uses+1 WHERE code=?", (code,)); db.commit()
        add(c.uid, p["amt"]); logx(c.uid, "promo", "star", p["amt"], code)
        await me(c.uid); await send(c, {"t": "gift", "amt": p["amt"], "why": "🎟 " + code})

async def res_timeout(t):
    await asyncio.sleep(15); await settle(t, -1)   # rakib tasdiqlamasa — stavka qaytariladi

async def ws_handler(req):
    ws = web.WebSocketResponse(heartbeat=25); await ws.prepare(req); c = C(ws)
    try:
        async for msg in ws:
            if msg.type != web.WSMsgType.TEXT: continue
            try: await on_msg(c, json.loads(msg.data))
            except Exception as e: print("ws:", repr(e))
    finally: await drop(c)
    return ws

async def rate_loop():
    global TON_USD
    first = True
    while True:
        v = await wallet.ton_usd()
        if v:
            TON_USD = v
            if first: await bcast({"t": "rate", "rate": RATE()})
        if first:   # eski TON balanslarini bir marta Stars'ga o'tkazish
            first = False
            if not db.execute("SELECT 1 FROM kv WHERE k='migr_ton'").fetchone():
                db.execute("UPDATE users SET star=ROUND(star+ton*?,2), ton=0 WHERE ton>0", (RATE(),))
                db.execute("INSERT OR REPLACE INTO kv VALUES('migr_ton','1')"); db.commit()
        await asyncio.sleep(300)

async def on_start(app):
    global BOT_NAME
    app["tasks"] = [asyncio.create_task(rate_loop()), asyncio.create_task(gw_loop()), asyncio.create_task(lb_loop())]
    if TOKEN:
        BOT_NAME = await bot.me() or ""; await bot.setup()
        botadmin.S = sys.modules[__name__]
        app["tasks"] += [asyncio.create_task(bot.poll(credit, botadmin.handle)), asyncio.create_task(wallet.ton_poll(credit))]

async def on_stop(app):
    for t in app.get("tasks", []): t.cancel()

async def health(r): return web.Response(text="ok")

def _ver(name):
    try: return str(int(os.path.getmtime(os.path.join(BASE, "static", name))))
    except OSError: return "0"

async def index(r):
    """index.html: app.js/engines.js ga fayl o'zgargan vaqtini versiya qilib qo'yadi —
    git pull'dan keyin Telegram eski JS'ni keshdan olmaydi."""
    with open(os.path.join(BASE, "static", "index.html"), encoding="utf-8") as f: html = f.read()
    html = re.sub(r'(src="(engines|app)\.js)\?v=[^"]*"', lambda m: f'{m.group(1)}?v={_ver(m.group(2) + ".js")}"', html)
    return web.Response(text=html, content_type="text/html", headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

async def manifest(r):
    url = bot.URL or f"{r.scheme}://{r.host}"
    return web.json_response({"url": url, "name": "StarUm", "iconUrl": url + "/icon.png"}, headers={"Access-Control-Allow-Origin": "*"})

app = web.Application(); app.on_startup.append(on_start); app.on_cleanup.append(on_stop)
admin.setup(app, sys.modules[__name__])
app.add_routes([web.get("/ws", ws_handler), web.get("/health", health), web.get("/", index),
                web.get("/tonconnect-manifest.json", manifest)])
app.router.add_static("/", os.path.join(BASE, "static"))
HOST = os.getenv("HOST", "127.0.0.1")
if __name__ == "__main__":
    print(f"StarUm: http://localhost:{PORT}  TEST_MODE={CFG['test']}"); web.run_app(app, host=HOST, port=PORT)
