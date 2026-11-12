"""Admin panel API: /admin (sahifa) va /api/admin/* . Parol: .env dagi ADMIN_PASSWORD."""
import asyncio, csv, hashlib, hmac, io, json, os, re, secrets, sqlite3, tempfile, time
from aiohttp import web
import bot

PASS = os.getenv("ADMIN_PASSWORD", "")
SECRET = (os.getenv("ADMIN_SECRET") or secrets.token_hex(32)).encode()
BASE = os.path.dirname(os.path.abspath(__file__))
FAILS = {}  # ip -> [vaqtlar]
STARTED = time.time()

def _sign(exp): return hmac.new(SECRET, str(exp).encode(), hashlib.sha256).hexdigest()
def make_token(): exp = int(time.time()) + 12 * 3600; return f"{exp}.{_sign(exp)}"
def ok_token(t):
    try:
        exp, sig = t.split("."); return int(exp) > time.time() and hmac.compare_digest(sig, _sign(exp))
    except Exception: return False
def ip(r): return r.headers.get("X-Real-IP") or r.remote or "?"

# sozlamalar: kalit -> (turi, min, max)
SETTABLE = {"fee": (float, 0, .5), "ref": (float, 0, .5), "test": (int, 0, 1), "maint": (int, 0, 1), "free_pvp": (int, 0, 1),
            "bot_mode": (int, 0, 1), "min_wd": (float, 0, 1e7), "wd_fee": (float, 0, .5), "daily": (float, 0, 1e6),
            "welcome": (float, 0, 1e6), "star_usd": (float, .0001, 1), "rate_manual": (float, 0, 1e6), "rate_fallback": (float, 1, 1e6),
            "jp_min": (float, 1, 1e6), "jp_time": (int, 5, 600), "jp_max": (int, 2, 100), "min_dep_star": (float, 1, 1e6), "min_dep_ton": (float, .01, 1e4),
            "arena_time": (int, 5, 600), "arena_max": (int, 2, 60), "lb_auto": (int, 0, 1), "feed_min": (float, 0, 1e7),
            "wd_star": (int, 0, 1), "min_wd_star": (float, 1, 1e7)}

def setup(app, S):
    db = S.db
    def guard(fn):
        async def w(r):
            if not PASS or not ok_token(r.headers.get("X-Admin", "")): return web.json_response({"error": "auth"}, status=401)
            try: return await fn(r)
            except web.HTTPException: raise
            except Exception as e: return web.json_response({"error": str(e)}, status=400)
        return w
    def rows(q, a=()): return [dict(x) for x in db.execute(q, a)]
    def one(q, a=()): return db.execute(q, a).fetchone()[0] or 0
    def audit(note, uid=""): S.logx(uid, "audit", "", 0, note[:120])
    J = web.json_response

    async def page(r): return web.FileResponse(os.path.join(BASE, "admin", "index.html"), headers={"Cache-Control": "no-store", "X-Robots-Tag": "noindex"})

    async def login(r):
        if not PASS: return J({"error": "ADMIN_PASSWORD не задан в .env"}, status=503)
        now, a = time.time(), ip(r); FAILS[a] = [x for x in FAILS.get(a, []) if now - x < 300]
        if len(FAILS[a]) >= 5: return J({"error": "Слишком много попыток. Подождите 5 минут"}, status=429)
        pw = (await r.json()).get("password", "")
        if not hmac.compare_digest(hashlib.sha256(pw.encode()).digest(), hashlib.sha256(PASS.encode()).digest()):
            FAILS[a].append(now); await asyncio.sleep(1); return J({"error": "Неверный пароль"}, status=401)
        audit(f"login {a}")
        return J({"token": make_token()})

    # ------------------------------------------------ boshqaruv
    @guard
    async def stats(r):
        now = int(time.time()); day = now - 86400; rate = S.RATE()
        days = []
        for i in range(13, -1, -1):
            a, b = now - (i + 1) * 86400, now - i * 86400
            days.append({"d": time.strftime("%d.%m", time.localtime(b)),
                         "games": one("SELECT COUNT(*) FROM games WHERE ts>? AND ts<=?", (a, b)),
                         "users": one("SELECT COUNT(*) FROM users WHERE created>? AND created<=?", (a, b)),
                         "fee": round(one("SELECT SUM(amt) FROM log WHERE kind='fee' AND ts>? AND ts<=?", (a, b)), 2),
                         "ref": round(one("SELECT SUM(amt) FROM log WHERE kind='ref' AND ts>? AND ts<=?", (a, b)), 2),
                         "dep": round(one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='star' AND ts>? AND ts<=?", (a, b))
                                      + one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='ton' AND ts>? AND ts<=?", (a, b)) * rate, 2),
                         "wd": round(-one("SELECT SUM(amt) FROM log WHERE kind='withdraw' AND ts>? AND ts<=?", (a, b)), 2)})
        hours = [one("SELECT COUNT(*) FROM games WHERE ts>? AND ts<=?", (now - (h + 1) * 3600, now - h * 3600)) for h in range(23, -1, -1)]
        top = rows("SELECT g, COUNT(*) n, SUM(stake) vol FROM games GROUP BY g ORDER BY n DESC")
        whales = rows("SELECT uid,name,star FROM users ORDER BY star DESC LIMIT 5")
        today = rows("""SELECT u.name,SUM(r.prize-r.stake) p,COUNT(*) n FROM res r JOIN users u ON u.uid=r.uid WHERE r.ts>? GROUP BY r.uid ORDER BY p DESC LIMIT 5""", (day,))
        recent = rows("SELECT l.ts,l.kind,l.cur,l.amt,l.note,u.name FROM log l LEFT JOIN users u ON u.uid=l.uid WHERE kind IN ('deposit','withdraw','win','promo') ORDER BY l.id DESC LIMIT 12")
        fee = one("SELECT SUM(amt) FROM log WHERE kind='fee'"); refp = one("SELECT SUM(amt) FROM log WHERE kind='ref'")
        return J({"users": one("SELECT COUNT(*) FROM users"), "guests": one("SELECT COUNT(*) FROM users WHERE guest=1"),
                  "banned": one("SELECT COUNT(*) FROM users WHERE banned=1"),
                  "online": len(S.conns), "tables": len(S.ACTIVE), "rooms": len(S.ROOMS),
                  "new24": one("SELECT COUNT(*) FROM users WHERE created>?", (day,)), "dau": one("SELECT COUNT(*) FROM users WHERE last>?", (day,)),
                  "wau": one("SELECT COUNT(*) FROM users WHERE last>?", (now - 7 * 86400,)),
                  "games": one("SELECT COUNT(*) FROM games"), "games24": one("SELECT COUNT(*) FROM games WHERE ts>?", (day,)),
                  "bal": round(one("SELECT SUM(star) FROM users"), 2),
                  "dep_star": one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='star'"), "dep_ton": one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='ton'"),
                  "dep24": round(one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='star' AND ts>?", (day,)) + one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='ton' AND ts>?", (day,)) * rate, 2),
                  "fee": round(fee, 2), "fee24": round(one("SELECT SUM(amt) FROM log WHERE kind='fee' AND ts>?", (day,)), 2),
                  "refpaid": round(refp, 2), "net": round(fee - refp, 2),
                  "wd_paid": round(one("SELECT SUM(amt) FROM wd WHERE status='paid'"), 2), "wd_pending": one("SELECT COUNT(*) FROM wd WHERE status='pending'"),
                  "wd_pending_sum": round(one("SELECT SUM(amt) FROM wd WHERE status='pending'"), 2),
                  "promo_given": round(one("SELECT SUM(amt) FROM log WHERE kind IN ('promo','bonus','giveaway','lbprize')"), 2),
                  "jp": {"pot": round(sum(p.pot() for p in S.POTS.values()), 2), "n": sum(len(p.bets) for p in S.POTS.values()), "st": "", "round": 0},
                  "gw_active": one("SELECT COUNT(*) FROM gw WHERE status='active'"), "lbpaid": round(one("SELECT SUM(amt) FROM lb_awards"), 2),
                  "rate": rate, "ton_usd": S.TON_USD, "uptime": int(time.time() - STARTED),
                  "days": days, "hours": hours, "byGame": top, "whales": whales, "today": today, "recent": recent,
                  "cfg": S.CFG, "bot": S.BOT_NAME, "tg": bool(S.TOKEN), "ton_addr": bool(getattr(S.wallet, "TON_ADDR", ""))})

    # ------------------------------------------------ foydalanuvchilar
    @guard
    async def users(r):
        q = r.query.get("q", "").strip(); pg = max(0, int(r.query.get("page", 0))); sort = r.query.get("sort", "last"); f = r.query.get("f", "")
        order = {"last": "last DESC", "created": "created DESC", "star": "star DESC", "wins": "wins DESC", "games": "games DESC",
                 "refs": "refs DESC", "ref_earn": "ref_earn DESC"}.get(sort, "last DESC")
        cond, a = [], []
        if q: cond.append("(uid LIKE ? OR name LIKE ?)"); a += [f"%{q}%", f"%{q}%"]
        if f == "banned": cond.append("banned=1")
        if f == "vip": cond.append("vip=1")
        if f == "online": cond.append("uid IN (%s)" % ",".join("?" * len(S.conns)) if S.conns else "0"); a += list(S.conns)
        if f == "rich": cond.append("star>0")
        w = ("WHERE " + " AND ".join(cond)) if cond else ""
        total = one(f"SELECT COUNT(*) FROM users {w}", a)
        lst = rows(f"SELECT * FROM users {w} ORDER BY {order} LIMIT 30 OFFSET ?", a + [pg * 30])
        for u in lst: u["online"] = u["uid"] in S.conns
        return J({"total": total, "list": lst})

    @guard
    async def user_info(r):
        uid = r.query.get("uid", ""); u = S.user(uid)
        if not u: return J({"error": "Не найдено"}, status=404)
        u["online"] = uid in S.conns; c = S.conns.get(uid); u["in_game"] = bool(c and c.t and not c.t["done"])
        u["lvl"] = S.lvl(uid)
        return J({"user": u,
                  "log": rows("SELECT ts,kind,cur,amt,note FROM log WHERE uid=? ORDER BY id DESC LIMIT 60", (uid,)),
                  "res": rows("SELECT ts,g,stake,prize,win FROM res WHERE uid=? ORDER BY id DESC LIMIT 40", (uid,)),
                  "refs": rows("SELECT uid,name,games,star,created FROM users WHERE ref_by=? ORDER BY created DESC LIMIT 50", (uid,)),
                  "ref_by": S.user(u["ref_by"]) if u["ref_by"] else None,
                  "wd": rows("SELECT * FROM wd WHERE uid=? ORDER BY id DESC LIMIT 20", (uid,)),
                  "sum": {"dep": round(one("SELECT SUM(amt) FROM log WHERE uid=? AND kind='deposit' AND cur='star'", (uid,)) + one("SELECT SUM(amt) FROM log WHERE uid=? AND kind='deposit' AND cur='ton'", (uid,)) * S.RATE(), 2),
                          "wd": round(-one("SELECT SUM(amt) FROM log WHERE uid=? AND kind='withdraw'", (uid,)), 2),
                          "profit": round(one("SELECT SUM(prize-stake) FROM res WHERE uid=?", (uid,)), 2),
                          "fee": round(one("SELECT SUM(amt) FROM log WHERE uid=? AND kind='fee'", (uid,)), 2)}})

    @guard
    async def user_act(r):
        m = await r.json(); uid = str(m.get("uid")); act = m.get("action"); u = S.user(uid)
        if not u: return J({"error": "Не найдено"}, status=404)
        if act == "adjust":
            amt = float(m.get("amount"))
            if not -1e7 < amt < 1e7: return J({"error": "неверно"}, status=400)
            if u["star"] + amt < 0: return J({"error": "Баланс станет отрицательным"}, status=400)
            S.add(uid, amt); S.logx(uid, "admin", "star", amt, str(m.get("note", ""))[:60])
            if m.get("tell"): await S.notify(uid, f"{'🎁' if amt > 0 else '➖'} Баланс: {'+' if amt > 0 else ''}{amt} ⭐" + (f"\n{m.get('note')}" if m.get("note") else ""))
        elif act == "setbal":
            v = float(m.get("amount"))
            if v < 0: return J({"error": "отрицательно"}, status=400)
            S.add(uid, v - u["star"]); S.logx(uid, "admin", "star", round(v - u["star"], 2), "set " + str(v))
        elif act in ("ban", "unban"):
            db.execute("UPDATE users SET banned=? WHERE uid=?", (1 if act == "ban" else 0, uid)); db.commit()
            c = S.conns.get(uid)
            if act == "ban" and c:
                await S.send(c, {"t": "banned"}); await S.drop(c); await c.ws.close()
        elif act in ("vip", "unvip"):
            db.execute("UPDATE users SET vip=? WHERE uid=?", (1 if act == "vip" else 0, uid)); db.commit()
        elif act == "rename":
            db.execute("UPDATE users SET name=? WHERE uid=?", (S.clean(m.get("name")), uid)); db.commit()
        elif act == "reset":
            db.execute("UPDATE users SET games=0,wins=0 WHERE uid=?", (uid,)); db.execute("DELETE FROM res WHERE uid=?", (uid,)); db.commit()
        elif act == "daily_reset":
            db.execute("UPDATE users SET daily_ts=0 WHERE uid=?", (uid,)); db.commit()
        elif act == "kick":
            c = S.conns.get(uid)
            if c: await S.drop(c); await c.ws.close()
        elif act == "msg":
            text = str(m.get("text", "")).strip()[:1000]
            if not text: return J({"error": "Пустой текст"}, status=400)
            c = S.conns.get(uid)
            if c: await S.send(c, {"t": "notice", "text": text, "pop": 1})
            await S.notify(uid, text)
        else: return J({"error": "action?"}, status=400)
        audit(f"{act} {m.get('amount', '')} {m.get('note', '')}".strip(), uid)
        await S.me(uid)
        return J({"ok": True, "user": S.user(uid)})

    # ------------------------------------------------ tranzaksiyalar
    def log_q(r):
        kind = r.query.get("kind", ""); uid = r.query.get("uid", ""); cond, a = [], []
        if kind: cond.append("kind=?"); a.append(kind)
        if uid: cond.append("(l.uid=? OR u.name LIKE ?)"); a += [uid, f"%{uid}%"]
        return ("WHERE " + " AND ".join(cond)) if cond else "", a
    @guard
    async def log(r):
        pg = max(0, int(r.query.get("page", 0))); w, a = log_q(r)
        return J({"list": rows(f"SELECT l.*,u.name FROM log l LEFT JOIN users u ON u.uid=l.uid {w} ORDER BY l.id DESC LIMIT 50 OFFSET ?", a + [pg * 50]),
                  "sum": round(one(f"SELECT SUM(amt) FROM log l LEFT JOIN users u ON u.uid=l.uid {w}", a), 2)})

    # ------------------------------------------------ o'yinlar, xonalar
    @guard
    async def games(r):
        pg = max(0, int(r.query.get("page", 0))); g = r.query.get("g", "")
        w, a = ("WHERE g.g=?", [g]) if g else ("", [])
        return J({"list": rows(f"""SELECT g.*,a.name n0,b.name n1 FROM games g LEFT JOIN users a ON a.uid=g.p0 LEFT JOIN users b ON b.uid=g.p1
                                  {w} ORDER BY g.id DESC LIMIT 40 OFFSET ?""", a + [pg * 40]),
                  "live": [{"id": t["id"], "g": t["g"], "cur": t["cur"], "stake": t["stake"], "bot": t["bot"], "ts": t["ts"], "opts": t["opts"],
                            "p": [(p.name if p else "Bot") for p in t["p"]]} for t in S.ACTIVE],
                  "rooms": [S.room_pub(x) | {"priv": x["priv"]} for x in S.ROOMS.values()],
                  "pots": [{"key": k, "kind": p.kind, "min": p.min, "priv": p.priv, "st": p.st, "pot": p.pot(), "id": p.id,
                            "bets": [{"name": b["name"], "amt": b["amt"]} for b in p.bets], "left": max(0, p.end - time.time())} for k, p in S.POTS.items()]})

    @guard
    async def table_act(r):
        m = await r.json(); act = m.get("action")
        if act == "cancel_room":
            ok = await S.cancel_room(str(m.get("id")), "admin")
        elif act == "end_table":
            t = next((t for t in S.ACTIVE if t["id"] == m.get("id")), None); ok = bool(t)
            if t:
                for p in t["p"]:
                    if p: await S.send(p, {"t": "notice", "text": "⚠️ Игра остановлена администратором — ставка возвращена", "pop": 1})
                await S.settle(t, -1)
        elif act == "pot_refund":
            p = S.POTS.get(str(m.get("id"))); ok = bool(p) and await S.pot_refund(p)
        else: return J({"error": "action?"}, status=400)
        audit(f"{act} {m.get('id', '')}")
        return J({"ok": bool(ok)})

    # ------------------------------------------------ yechib olish
    @guard
    async def wd(r):
        st = r.query.get("status", "pending"); pg = max(0, int(r.query.get("page", 0)))
        w, a = ("WHERE w.status=?", [st]) if st and st != "all" else ("", [])
        return J({"list": rows(f"SELECT w.*,u.name,u.star bal FROM wd w LEFT JOIN users u ON u.uid=w.uid {w} ORDER BY w.id DESC LIMIT 40 OFFSET ?", a + [pg * 40]),
                  "rate": S.RATE()})

    @guard
    async def wd_act(r):
        m = await r.json(); x = db.execute("SELECT * FROM wd WHERE id=?", (int(m.get("id")),)).fetchone()
        if not x or x["status"] != "pending": return J({"error": "Не найдено или уже обработано"}, status=400)
        note = str(m.get("note", ""))[:120]
        if m.get("action") == "paid":
            db.execute("UPDATE wd SET status='paid',note=?,done=? WHERE id=?", (note, int(time.time()), x["id"])); db.commit()
            unit = "⭐" if (x["method"] if "method" in x.keys() else "ton") == "star" else "TON"
            await S.notify(x["uid"], f"✅ Вывод выполнен: {x['ton']:g} {unit}\n{note}")
            c = S.conns.get(x["uid"])
            if c: await S.send(c, {"t": "notice", "text": f"✅ {x['ton']:g} {unit} отправлено", "pop": 1})
        elif m.get("action") == "reject":
            db.execute("UPDATE wd SET status='rejected',note=?,done=? WHERE id=?", (note, int(time.time()), x["id"])); db.commit()
            S.add(x["uid"], x["amt"]); S.logx(x["uid"], "refund", "star", x["amt"], "withdraw rejected")
            await S.notify(x["uid"], f"❌ Вывод отклонён, {x['amt']} ⭐ возвращено.\n{note}"); await S.me(x["uid"])
        else: return J({"error": "action?"}, status=400)
        audit(f"wd {m.get('action')} #{x['id']} {x['amt']}", x["uid"])
        return J({"ok": True})

    # ------------------------------------------------ promokodlar
    @guard
    async def promo(r):
        if r.method == "POST":
            m = await r.json()
            if m.get("delete"):
                db.execute("DELETE FROM promo WHERE code=?", (m["delete"],)); db.commit(); audit("promo del " + m["delete"]); return J({"ok": True})
            code = re.sub(r"\W", "", str(m.get("code") or "")).upper()[:24] or secrets.token_hex(4).upper()
            amt = float(m.get("amt") or 0); mx = int(m.get("max") or 1); days = float(m.get("days") or 0)
            if amt <= 0 or mx < 1: return J({"error": "Сумма и количество должны быть > 0"}, status=400)
            try: db.execute("INSERT INTO promo(code,amt,max,exp,ts) VALUES(?,?,?,?,?)", (code, amt, mx, int(time.time() + days * 86400) if days else 0, int(time.time())))
            except sqlite3.IntegrityError: return J({"error": "Такой код уже есть"}, status=400)
            db.commit(); audit(f"promo add {code} {amt}x{mx}")
        return J({"list": rows("SELECT * FROM promo ORDER BY ts DESC"),
                  "used": rows("SELECT p.code,p.ts,u.name FROM promo_used p LEFT JOIN users u ON u.uid=p.uid ORDER BY p.ts DESC LIMIT 30")})

    # ------------------------------------------------ sozlamalar
    @guard
    async def settings(r):
        if r.method == "POST":
            m = await r.json()
            for k, v in m.items():
                if k in SETTABLE:
                    typ, lo, hi = SETTABLE[k]; v = typ(float(v) if typ is int else v)
                    if not lo <= v <= hi: return J({"error": f"{k}: {lo}…{hi} — допустимый диапазон"}, status=400)
                    S.setcfg(k, v)
                elif k == "stakes":
                    lst = sorted({round(float(x), 2) for x in (v if isinstance(v, list) else str(v).replace(" ", "").split(",")) if str(x).strip() and float(x) > 0})
                    if not lst: return J({"error": "Нужна хотя бы одна ставка"}, status=400)
                    S.setcfg("stakes", lst[:12])
                elif k in ("games_off", "hot"):
                    S.setcfg(k, [str(x) for x in v][:30])
                elif k in ("arena_tiers", "lb_prizes"):
                    lst = [round(float(x), 2) for x in (v if isinstance(v, list) else str(v).replace(" ", "").split(",")) if str(x).strip() and float(x) > 0]
                    if k == "arena_tiers":
                        lst = sorted(set(lst))[:4]
                        if not lst: return J({"error": "Нужен хотя бы один уровень арены"}, status=400)
                    S.setcfg(k, lst[:20])
                    if k == "arena_tiers": S.pots_sync(); await S.bcast({"t": "pots", "sum": S.pots_sum()})
                elif k == "lb_period" and v in ("day", "week"): S.setcfg(k, v)
                elif k == "lb_metric" and v in ("profit", "wins"): S.setcfg(k, v)
                elif k == "notice":
                    S.setcfg("notice", str(v)[:200]); await S.bcast({"t": "notice", "text": S.CFG["notice"]})
            audit("settings " + ",".join(m.keys()))
            await S.bcast({"t": "cfg", "cfg": S.pubcfg()})
        return J(S.CFG | {"_rate": S.RATE(), "_ton_usd": S.TON_USD})

    # ------------------------------------------------ xabar
    @guard
    async def broadcast(r):
        m = await r.json(); text = str(m.get("text", "")).strip()[:1000]
        if not text: return J({"error": "Пустой текст"}, status=400)
        n = 0
        if m.get("telegram") and S.TOKEN:
            seg = m.get("seg", "all"); q = "SELECT uid FROM users WHERE uid LIKE 'tg%' AND banned=0"
            if seg == "active": q += f" AND last>{int(time.time()) - 7 * 86400}"
            if seg == "payers": q += " AND uid IN (SELECT uid FROM log WHERE kind='deposit')"
            if seg == "sleep": q += f" AND last<{int(time.time()) - 7 * 86400}"
            ids = [x["uid"][2:] for x in rows(q)]
            kb = {"inline_keyboard": [[{"text": str(m.get("btn") or "▶ Играть"), "web_app": {"url": bot.URL}}]]} if m.get("button") and bot.URL.startswith("https") else None
            async def run():
                for i in ids:
                    try: await bot.call("sendMessage", chat_id=i, text=text, **({"reply_markup": kb} if kb else {}))
                    except Exception: pass
                    await asyncio.sleep(.05)
            asyncio.create_task(run()); n = len(ids)
        else:
            for c in list(S.conns.values()): await S.send(c, {"t": "notice", "text": text, "pop": 1})
            n = len(S.conns)
        audit(f"broadcast {n}: {text[:60]}")
        return J({"ok": True, "sent": n})

    # ------------------------------------------------ eksport va zaxira
    @guard
    async def export(r):
        what = r.query.get("what", "users")
        q = {"users": "SELECT uid,name,star,games,wins,refs,ref_by,ref_earn,banned,vip,guest,created,last FROM users ORDER BY created",
             "log": "SELECT l.*,u.name FROM log l LEFT JOIN users u ON u.uid=l.uid ORDER BY l.id DESC LIMIT 50000",
             "wd": "SELECT * FROM wd ORDER BY id DESC", "games": "SELECT * FROM games ORDER BY id DESC LIMIT 50000"}.get(what)
        if not q: return J({"error": "?"}, status=400)
        cur = db.execute(q); buf = io.StringIO(); wr = csv.writer(buf)
        wr.writerow([d[0] for d in cur.description]); wr.writerows(cur.fetchall())
        return web.Response(text=buf.getvalue(), content_type="text/csv", headers={"Content-Disposition": f"attachment; filename={what}.csv"})

    @guard
    async def backup(r):
        fd, path = tempfile.mkstemp(suffix=".db"); os.close(fd)
        dst = sqlite3.connect(path); db.backup(dst); dst.close()
        audit("backup")
        return web.FileResponse(path, headers={"Content-Disposition": f"attachment; filename=spich-{time.strftime('%Y%m%d-%H%M')}.db"})

    # ------------------------------------------------ розыгрыши
    @guard
    async def giveaway(r):
        if r.method == "POST":
            m = await r.json(); act = m.get("action", "create")
            if act == "create":
                title = str(m.get("title") or "").strip()[:80]; prize = float(m.get("prize") or 0); wn = int(m.get("winners") or 1)
                hours = float(m.get("hours") or 24); ch = str(m.get("channel") or "").strip()[:64]; mg = int(m.get("min_games") or 0)
                if not title or prize <= 0 or not 1 <= wn <= 1000: return J({"error": "Заполните название, приз и число победителей"}, status=400)
                cur = db.execute("INSERT INTO gw(title,prize,winners,ends,min_games,channel,created) VALUES(?,?,?,?,?,?,?)",
                                 (title, prize, wn, int(time.time() + hours * 3600), mg, ch, int(time.time())))
                db.commit(); audit(f"giveaway add #{cur.lastrowid} {title} {prize}x{wn}")
                for c in list(S.conns.values()):
                    await S.send(c, {"t": "notice", "text": f"🎉 Новый розыгрыш: {title} — {prize:g} ⭐ × {wn}", "pop": 1}); await S.send(c, {"t": "gws", "list": S.gw_list(c.uid)})
                if m.get("announce") and S.TOKEN:
                    ids = [x["uid"][2:] for x in rows("SELECT uid FROM users WHERE uid LIKE 'tg%' AND banned=0")]
                    kb = {"inline_keyboard": [[{"text": "🎉 Участвовать", "web_app": {"url": bot.URL}}]]} if bot.URL.startswith("https") else None
                    text = f"🎉 РОЗЫГРЫШ: {title}\n\n🏆 Приз: {prize:g} ⭐ × {wn} победител(ей)\n⏱ Итоги через {hours:g} ч" + (f"\n📢 Условие: подписка на {ch}" if ch else "")
                    async def run():
                        for i in ids:
                            try: await bot.call("sendMessage", chat_id=i, text=text, **({"reply_markup": kb} if kb else {}))
                            except Exception: pass
                            await asyncio.sleep(.05)
                    asyncio.create_task(run())
            else:
                g = db.execute("SELECT * FROM gw WHERE id=?", (int(m.get("id") or 0),)).fetchone()
                if not g: return J({"error": "Не найдено"}, status=404)
                if act == "finish" and g["status"] == "active": names = await S.gw_finish(dict(g)); audit(f"giveaway finish #{g['id']}: {', '.join(names)}")
                elif act == "cancel" and g["status"] == "active": db.execute("UPDATE gw SET status='cancel' WHERE id=?", (g["id"],)); db.commit(); audit(f"giveaway cancel #{g['id']}")
                elif act == "delete": db.execute("DELETE FROM gw WHERE id=?", (g["id"],)); db.execute("DELETE FROM gw_join WHERE gid=?", (g["id"],)); db.commit()
        lst = rows("SELECT g.*,(SELECT COUNT(*) FROM gw_join j WHERE j.gid=g.id) n FROM gw g ORDER BY g.id DESC LIMIT 50")
        gid = r.query.get("id")
        parts = rows("SELECT u.name,u.uid,j.ts FROM gw_join j LEFT JOIN users u ON u.uid=j.uid WHERE j.gid=? ORDER BY j.ts DESC LIMIT 300", (int(gid),)) if gid else []
        return J({"list": lst, "parts": parts})

    # ------------------------------------------------ призы рейтинга
    @guard
    async def lbprize(r):
        if r.method == "POST":
            m = await r.json()
            if m.get("action") == "pay":
                per = S.CFG["lb_period"]; since = S.period_start(per)
                paid = await S.lb_award(since, time.time() + 1, S.period_key(per) + " (вручную)")
                audit(f"lb prizes paid manually: {len(paid)}")
                return J({"ok": True, "paid": paid})
        per = S.CFG["lb_period"]; since = S.period_start(per)
        top = S.lb_top(since, time.time() + 1, S.CFG["lb_metric"], max(10, len(S.CFG["lb_prizes"])))
        hist = rows("SELECT a.*,u.name FROM lb_awards a LEFT JOIN users u ON u.uid=a.uid ORDER BY a.id DESC LIMIT 60")
        nxt = since + (7 if per == "week" else 1) * 86400
        return J({"top": [{"name": x["name"], "p": round(x["p"] or 0, 2), "w": x["w"], "n": x["n"]} for x in top], "hist": hist,
                  "cfg": {k: S.CFG[k] for k in ("lb_prizes", "lb_period", "lb_metric", "lb_auto")}, "left": max(0, nxt - time.time())})

    @guard
    async def audit_log(r):
        return J({"list": rows("SELECT l.ts,l.note,u.name,l.uid FROM log l LEFT JOIN users u ON u.uid=l.uid WHERE kind='audit' ORDER BY l.id DESC LIMIT 100")})

    app.add_routes([web.get("/admin", page), web.post("/api/admin/login", login), web.get("/api/admin/stats", stats),
        web.get("/api/admin/users", users), web.get("/api/admin/user", user_info), web.post("/api/admin/user", user_act),
        web.get("/api/admin/log", log), web.get("/api/admin/games", games), web.post("/api/admin/table", table_act),
        web.get("/api/admin/wd", wd), web.post("/api/admin/wd", wd_act),
        web.get("/api/admin/promo", promo), web.post("/api/admin/promo", promo),
        web.get("/api/admin/settings", settings), web.post("/api/admin/settings", settings), web.post("/api/admin/broadcast", broadcast),
        web.get("/api/admin/export", export), web.get("/api/admin/backup", backup), web.get("/api/admin/audit", audit_log),
        web.get("/api/admin/giveaway", giveaway), web.post("/api/admin/giveaway", giveaway),
        web.get("/api/admin/lbprize", lbprize), web.post("/api/admin/lbprize", lbprize)])
