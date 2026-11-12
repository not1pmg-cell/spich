"""Telegram bot ichidagi admin panel (/admin) va majburiy obuna.
Adminlar: .env dagi ADMIN_IDS (Telegram ID, vergul bilan). Hamma matnlar rus tilida (mijoz uchun)."""
import asyncio, json, re, secrets, time
import bot

S = None            # server moduli (server.py on_start da beriladi)
WAIT = {}           # chat_id -> kutilayotgan kiritish (holat)

def is_admin(uid): return str(uid) in (S.ADMIN_IDS if S else [])
def onoff(v): return "🟢 ВКЛ" if v else "🔴 ВЫКЛ"
def kb(rows): return {"inline_keyboard": rows}
def B(text, data): return {"text": text, "callback_data": data}

async def say(chat, text, markup=None, edit=None):
    p = {"chat_id": chat, "text": text, "parse_mode": "HTML", "disable_web_page_preview": True}
    if markup: p["reply_markup"] = markup
    if edit:
        try: return await bot.call("editMessageText", message_id=edit, **p)
        except Exception as e:
            if "not modified" in str(e): return
    return await bot.call("sendMessage", **p)

def esc(s): return str(s or "").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
def one(q, a=()): return S.db.execute(q, a).fetchone()[0] or 0

# ------------------------------------------------ /start va majburiy obuna
def play_url(arg):
    q = []
    for part in (arg or "").split("__"):
        for pre, key in (("ref_", "ref"), ("room_", "room"), ("arena_", "arena"), ("bonus_", "bonus")):
            if part.startswith(pre): q.append(f"{key}={part[len(pre):]}")
    return bot.URL + ("?" + "&".join(q) if q else "")

async def welcome(chat, arg, edit=None):
    await say(chat, "⭐ <b>STARUM</b>\n\n🟢 Арена · 🎡 Джекпот · 🃏 Дурак · 🎲 Нарды · ⚽ Пенальти · 🂡 21 и другие\n\n"
                    "Играй с реальными соперниками и выигрывай ⭐\nПриглашай друзей — 5% с их ставок тебе!",
              kb([[{"text": "▶ Играть", "web_app": {"url": play_url(arg)}}]]), edit)

async def sub_prompt(chat, miss, arg, edit=None):
    rows = [[{"text": f"📢 {ch}", "url": S.chan_link(ch)}] for ch in miss]
    rows.append([B("✅ Я подписался", "chk:" + (arg or "")[:55])])
    await say(chat, "🔒 <b>Подпишитесь на каналы</b>, чтобы играть в STARUM.\n\nПосле подписки нажмите «Я подписался».", kb(rows), edit)

async def on_start(m):
    chat = m["chat"]["id"]; uid = "tg%s" % m["from"]["id"]; arg = m["text"][6:].strip()
    miss = await S.missing_subs(uid)
    if miss: return await sub_prompt(chat, miss, arg)
    await welcome(chat, arg)

# ------------------------------------------------ admin menyusi
def menu_kb():
    C = S.CFG; pend = one("SELECT COUNT(*) FROM wd WHERE status='pending'")
    return kb([
        [B("📊 Статистика", "a:stats"), B(f"📥 Выводы ({pend})", "a:wd")],
        [B(f"💸 Пополнение {onoff(C['dep_on'])}", "a:t:dep_on"), B(f"📤 Вывод {onoff(C['wd_on'])}", "a:t:wd_on")],
        [B(f"🧪 Тест-режим {onoff(C['test'])}", "a:t:test"), B(f"🛠 Техработы {onoff(C['maint'])}", "a:t:maint")],
        [B(f"📢 Обяз. подписка ({len(C['force_sub'])})", "a:subs"), B("🎁 Начислить всем", "a:mass")],
        [B("🟰 Баланс всем = …", "a:setall"), B(f"🏆 Призы рейтинга {onoff(bool(C['lb_prizes']))}", "a:lbp")],
        [B("🎟 Промокод", "a:promo"), B("🔗 Бонус-ссылка", "a:blink")],
        [B("👤 Найти игрока", "a:user"), B("✉️ Рассылка", "a:bc")],
        [B("⚙️ Комиссии и бонусы", "a:fees"), B("🎉 Розыгрыши", "a:gw")],
        [{"text": "🖥 Веб-админка", "url": bot.URL + "/admin"}] if bot.URL.startswith("https") else [B("🔄 Обновить", "a:menu")],
    ])

async def menu(chat, edit=None):
    C = S.CFG
    await say(chat, f"🔥 <b>STARUM · Админ</b>\n\n👥 Онлайн: <b>{len(S.conns)}</b> · 🎮 Столы: <b>{len(S.ACTIVE)}</b>\n"
                    f"💰 Комиссия: <b>{C['fee'] * 100:g}%</b> · Реф: <b>{C['ref'] * 100:g}%</b>\n"
                    f"📤 Вывод ⭐: <b>{C['wd_fee_star'] * 100:g}%</b> · TON: <b>{C['wd_fee'] * 100:g}%</b>\n"
                    f"🎁 Приветственный бонус: <b>{C['welcome']:g} ⭐</b>", menu_kb(), edit)

async def stats(chat, edit):
    now = time.time(); day = now - 86400; rate = S.RATE()
    fee = one("SELECT SUM(amt) FROM log WHERE kind='fee'"); refp = one("SELECT SUM(amt) FROM log WHERE kind='ref'")
    dep24 = one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='star' AND ts>?", (day,)) + one("SELECT SUM(amt) FROM log WHERE kind='deposit' AND cur='ton' AND ts>?", (day,)) * rate
    txt = (f"📊 <b>Статистика</b>\n\n👥 Игроков: <b>{one('SELECT COUNT(*) FROM users')}</b> (+{one('SELECT COUNT(*) FROM users WHERE created>?', (day,))} за 24ч)\n"
           f"🔥 Активны 24ч: <b>{one('SELECT COUNT(*) FROM users WHERE last>?', (day,))}</b> · онлайн <b>{len(S.conns)}</b>\n"
           f"🎮 Игр 24ч: <b>{one('SELECT COUNT(*) FROM games WHERE ts>?', (day,))}</b> · всего {one('SELECT COUNT(*) FROM games')}\n\n"
           f"💰 Комиссия всего: <b>{fee:,.0f} ⭐</b> (24ч: {one('SELECT SUM(amt) FROM log WHERE kind=? AND ts>?', ('fee', day)):,.0f})\n"
           f"🤝 Реф. выплаты: {refp:,.0f} ⭐ · чистыми: <b>{fee - refp:,.0f} ⭐</b>\n"
           f"⬇ Пополнения 24ч: <b>{dep24:,.0f} ⭐</b>\n"
           f"💼 Баланс игроков: <b>{one('SELECT SUM(star) FROM users'):,.0f} ⭐</b>\n"
           f"📥 Заявок на вывод: <b>{one('SELECT COUNT(*) FROM wd WHERE status=?', ('pending',))}</b> на {one('SELECT SUM(amt) FROM wd WHERE status=?', ('pending',)):,.0f} ⭐\n"
           f"💎 Курс: 1 TON = <b>{rate:g} ⭐</b>").replace(",", " ")
    await say(chat, txt, kb([[B("🔄 Обновить", "a:stats"), B("‹ Меню", "a:menu")]]), edit)

# ------------------------------------------------ yechishlar
async def wd_list(chat, edit):
    rows = S.db.execute("SELECT w.*,u.name FROM wd w LEFT JOIN users u ON u.uid=w.uid WHERE status='pending' ORDER BY id LIMIT 8").fetchall()
    if not rows: return await say(chat, "📥 <b>Заявок нет</b> 🎉", kb([[B("‹ Меню", "a:menu")]]), edit)
    await say(chat, f"📥 <b>Заявки на вывод</b> (первые {len(rows)})", kb([[B("‹ Меню", "a:menu")]]), edit)
    for w in rows:
        unit = "⭐ Stars" if (w["method"] or "ton") == "star" else "TON"
        extra = f"\n🛒 <a href=\"https://fragment.com/stars/buy?recipient={w['addr'].lstrip('@')}&quantity={int(w['ton'])}\">Купить на Fragment</a>" if unit.startswith("⭐") else ""
        await say(chat, f"#{w['id']} · <b>{esc(w['name'])}</b> (<code>{w['uid']}</code>)\nСписано: <b>{w['amt']:g} ⭐</b> → к выплате <b>{w['ton']:g} {unit}</b>\n"
                        f"Куда: <code>{esc(w['addr'])}</code>{extra}",
                  kb([[B("✅ Выплачено", f"a:wdp:{w['id']}"), B("❌ Отклонить (вернуть)", f"a:wdr:{w['id']}")]]))

async def wd_do(chat, mid, wid, paid):
    x = S.db.execute("SELECT * FROM wd WHERE id=?", (wid,)).fetchone()
    if not x or x["status"] != "pending": return await say(chat, "Уже обработано", edit=mid)
    unit = "⭐" if (x["method"] or "ton") == "star" else "TON"
    if paid:
        S.db.execute("UPDATE wd SET status='paid',note=?,done=? WHERE id=?", ("bot", int(time.time()), wid)); S.db.commit()
        await S.notify(x["uid"], f"✅ Вывод выполнен: {x['ton']:g} {unit}")
    else:
        S.db.execute("UPDATE wd SET status='rejected',note=?,done=? WHERE id=?", ("bot", int(time.time()), wid)); S.db.commit()
        S.add(x["uid"], x["amt"]); S.logx(x["uid"], "refund", "star", x["amt"], "withdraw rejected"); await S.me(x["uid"])
        await S.notify(x["uid"], f"❌ Вывод отклонён, {x['amt']:g} ⭐ возвращено на баланс")
    S.logx(x["uid"], "audit", "", 0, f"bot wd {'paid' if paid else 'reject'} #{wid}")
    await say(chat, f"#{wid} — {'✅ отмечено «Выплачено»' if paid else '❌ отклонено, средства возвращены'}", edit=mid)

# ------------------------------------------------ majburiy obuna (boshqaruv)
async def subs(chat, edit):
    chans = S.CFG["force_sub"]
    rows = [[B(f"🗑 {ch}", f"a:subdel:{i}")] for i, ch in enumerate(chans)]
    rows += [[B("➕ Добавить канал", "a:subadd")], [B("‹ Меню", "a:menu")]]
    await say(chat, "📢 <b>Обязательная подписка</b>\n\n" + ("\n".join(f"• {esc(c)}" for c in chans) if chans else "Каналов нет — подписка не требуется.") +
              "\n\n⚠️ Бот должен быть <b>администратором</b> каждого канала, иначе проверить подписку невозможно.", kb(rows), edit)

# ------------------------------------------------ o'yinchi
async def user_card(chat, uid, edit=None):
    u = S.user(uid)
    if not u: return await say(chat, "Игрок не найден")
    await say(chat, f"👤 <b>{esc(u['name'])}</b> {'👑 VIP' if u['vip'] else ''}{' ⛔ БАН' if u['banned'] else ''}\nID: <code>{uid}</code>\n"
                    f"💰 Баланс: <b>{u['star']:g} ⭐</b>\n🎮 Игр: {u['games']} · побед: {u['wins']}\n👥 Рефералов: {u['refs']} · доход {u['ref_earn'] or 0:g} ⭐\n"
                    f"{'🟢 онлайн' if uid in S.conns else ''}",
              kb([[B("+100 ⭐", f"a:ua:{uid}:100"), B("+1000 ⭐", f"a:ua:{uid}:1000"), B("−100 ⭐", f"a:ua:{uid}:-100")],
                  [B("✏️ Своя сумма", f"a:uc:{uid}"), B("✉️ Сообщение", f"a:um:{uid}")],
                  [B("✅ Разбанить" if u["banned"] else "⛔ Забанить", f"a:ub:{uid}"), B("‹ Меню", "a:menu")]]), edit)

def find_user(q):
    q = q.strip().lstrip("@")
    if q.isdigit(): q = "tg" + q
    if S.user(q): return q
    r = S.db.execute("SELECT uid FROM users WHERE name LIKE ? ORDER BY last DESC LIMIT 1", (f"%{q}%",)).fetchone()
    return r["uid"] if r else None

# ------------------------------------------------ kiritishni qayta ishlash
PROMPTS = {"mass": "🎁 Сколько ⭐ начислить <b>каждому</b> игроку? Напишите число (например 100).",
           "setall": "🟰 Установить баланс <b>всем</b> игрокам ровно в … ⭐\nНапишите число: <code>0</code> — обнулить всех, <code>100</code> — всем по 100.\n⚠️ Действие нельзя отменить!",
           "lbp": "🏆 Призы рейтинга по местам через запятую, например <code>1000, 500, 250</code>\nНапишите <code>0</code>, чтобы убрать призы.",
           "promo": "🎟 Напишите: <code>КОД СУММА КОЛ-ВО</code>\nнапример <code>STARUM 50 100</code> (50 ⭐, 100 активаций)",
           "blink": "🔗 Напишите: <code>СУММА КОЛ-ВО</code>\nнапример <code>100 500</code> — ссылка на 100 ⭐ для 500 человек",
           "bc": "✉️ Напишите текст рассылки (уйдёт всем в Telegram и в приложение).",
           "user": "👤 Напишите Telegram ID или имя игрока.",
           "subadd": "📢 Напишите канал: <code>@channel</code>\n(бот должен быть админом канала)",
           "fees": "⚙️ Напишите: <code>параметр значение</code>\n\n<code>fee 10</code> — комиссия игр, %\n<code>ref 5</code> — реф. процент, %\n<code>wdstar 20</code> — комиссия вывода ⭐, %\n<code>wdton 0</code> — комиссия вывода TON, %\n<code>welcome 100</code> — бонус новичкам, ⭐\n<code>daily 0</code> — ежедневный бонус, ⭐\n<code>minwd 100</code> — мин. вывод ⭐"}
FEEKEYS = {"fee": ("fee", .01), "ref": ("ref", .01), "wdstar": ("wd_fee_star", .01), "wdton": ("wd_fee", .01),
           "welcome": ("welcome", 1), "daily": ("daily", 1), "minwd": ("min_wd_star", 1)}

async def on_input(chat, text, st):
    WAIT.pop(chat, None); t = text.strip()
    try:
        if st == "mass":
            amt = float(t.replace(",", "."))
            if not 0 < amt <= 100000: raise ValueError
            n = await S.mass_bonus(amt); S.logx("", "audit", "", 0, f"bot mass bonus {amt} x{n}")
            return await say(chat, f"🎁 Начислено по <b>{amt:g} ⭐</b> — <b>{n}</b> игрокам", kb([[B("‹ Меню", "a:menu")]]))
        if st == "setall":
            amt = float(t.replace(",", "."))
            if not 0 <= amt <= 1e7: raise ValueError
            n = await S.mass_set(amt); S.logx("", "audit", "", 0, f"bot set all balances {amt}")
            return await say(chat, f"🟰 Баланс <b>{n}</b> игроков установлен в <b>{amt:g} ⭐</b>", kb([[B("‹ Меню", "a:menu")]]))
        if st == "lbp":
            lst = [] if t.strip() in ("0", "-", "нет") else [float(x) for x in t.replace(" ", "").split(",") if x]
            S.setcfg("lb_prizes", lst[:20]); await S.bcast({"t": "cfg", "cfg": S.pubcfg()})
            return await say(chat, "🏆 Призы рейтинга: " + (", ".join(f"{x:g}" for x in lst) + " ⭐" if lst else "убраны"), kb([[B("‹ Меню", "a:menu")]]))
        if st in ("promo", "blink"):
            p = t.split()
            if st == "blink": p = [secrets.token_hex(4).upper()] + p
            code = re.sub(r"\W", "", p[0]).upper()[:24]; amt = float(p[1]); mx = int(p[2]) if len(p) > 2 else 1
            S.db.execute("INSERT INTO promo(code,amt,max,exp,ts) VALUES(?,?,?,0,?)", (code, amt, mx, int(time.time()))); S.db.commit()
            link = f"https://t.me/{S.BOT_NAME}?start=bonus_{code}"
            return await say(chat, f"✅ Промокод <code>{code}</code> — {amt:g} ⭐ × {mx}\n\n🔗 Бонус-ссылка:\n<code>{link}</code>", kb([[B("‹ Меню", "a:menu")]]))
        if st == "bc":
            ids = [r["uid"][2:] for r in S.db.execute("SELECT uid FROM users WHERE uid LIKE 'tg%' AND banned=0")]
            kbd = kb([[{"text": "▶ Играть", "web_app": {"url": bot.URL}}]]) if bot.URL.startswith("https") else None
            async def run():
                for i in ids:
                    try: await bot.call("sendMessage", chat_id=i, text=t, **({"reply_markup": kbd} if kbd else {}))
                    except Exception: pass
                    await asyncio.sleep(.05)
            asyncio.create_task(run())
            for c in list(S.conns.values()): await S.send(c, {"t": "notice", "text": t, "pop": 1})
            return await say(chat, f"✉️ Рассылка запущена: <b>{len(ids)}</b> получателей", kb([[B("‹ Меню", "a:menu")]]))
        if st == "user":
            uid = find_user(t)
            return await (user_card(chat, uid) if uid else say(chat, "Игрок не найден", kb([[B("🔍 Ещё раз", "a:user"), B("‹ Меню", "a:menu")]])))
        if st == "subadd":
            ch = "@" + t.lstrip("@").split("/")[-1] if not t.lstrip("-").isdigit() else t
            note = ""
            try: await bot.call("getChat", chat_id=ch)
            except Exception as e: note = f"\n\n⚠️ Бот не видит канал: {esc(str(e)[:80])}. Добавьте бота в канал админом."
            S.setcfg("force_sub", (S.CFG["force_sub"] or []) + [ch]); S.SUBOK.clear()
            await S.bcast({"t": "cfg", "cfg": S.pubcfg()})
            return await say(chat, f"✅ Канал {esc(ch)} добавлен{note}", kb([[B("📢 Подписка", "a:subs"), B("‹ Меню", "a:menu")]]))
        if st == "fees":
            k, v = t.split()[:2]; key, mul = FEEKEYS[k.lower()]; val = float(v.replace(",", ".")) * mul
            if val < 0 or (mul == .01 and val > .5): raise ValueError
            S.setcfg(key, val); await S.bcast({"t": "cfg", "cfg": S.pubcfg()})
            return await say(chat, f"✅ {k} = {v}", kb([[B("⚙️ Ещё", "a:fees"), B("‹ Меню", "a:menu")]]))
        if st.startswith("uc:"):
            uid = st[3:]; amt = float(t.replace(",", ".")); u = S.user(uid)
            if u["star"] + amt < 0: return await say(chat, "Баланс станет отрицательным")
            S.add(uid, amt); S.logx(uid, "admin", "star", amt, "bot"); await S.me(uid)
            return await user_card(chat, uid)
        if st.startswith("um:"):
            uid = st[3:]; await S.notify(uid, t); c = S.conns.get(uid)
            if c: await S.send(c, {"t": "notice", "text": t, "pop": 1})
            return await say(chat, "✉️ Отправлено", kb([[B("‹ Меню", "a:menu")]]))
    except Exception as e:
        return await say(chat, f"⚠️ Неверный формат ({esc(str(e)[:60])}). Попробуйте ещё раз.", kb([[B("‹ Меню", "a:menu")]]))

# ------------------------------------------------ tugmalar
async def on_cb(q):
    data = q.get("data") or ""; chat = q["message"]["chat"]["id"]; mid = q["message"]["message_id"]; uid = q["from"]["id"]
    ans = {"callback_query_id": q["id"]}
    if data.startswith("chk:"):
        SUB_U = "tg%s" % uid; S.SUBOK.pop(SUB_U, None); miss = await S.missing_subs(SUB_U)
        if miss:
            return await bot.call("answerCallbackQuery", text="❌ Вы ещё не подписались на все каналы", show_alert=True, **ans)
        await bot.call("answerCallbackQuery", text="✅ Спасибо!", **ans)
        c = S.conns.get(SUB_U)
        if c: c.needsub = False; await S.send(c, {"t": "subok"})
        return await welcome(chat, data[4:], edit=mid)
    if not is_admin(uid): return await bot.call("answerCallbackQuery", **ans)
    await bot.call("answerCallbackQuery", **ans)
    a = data[2:]
    if a == "menu": WAIT.pop(chat, None); return await menu(chat, mid)
    if a == "stats": return await stats(chat, mid)
    if a.startswith("t:"):
        k = a[2:]; S.setcfg(k, 0 if S.CFG[k] else 1); S.logx("", "audit", "", 0, f"bot toggle {k}={S.CFG[k]}")
        await S.bcast({"t": "cfg", "cfg": S.pubcfg()}); return await menu(chat, mid)
    if a == "wd": return await wd_list(chat, mid)
    if a.startswith("wdp:") or a.startswith("wdr:"): return await wd_do(chat, mid, int(a[4:]), a.startswith("wdp"))
    if a == "subs": return await subs(chat, mid)
    if a.startswith("subdel:"):
        lst = list(S.CFG["force_sub"]); i = int(a[7:])
        if 0 <= i < len(lst): lst.pop(i); S.setcfg("force_sub", lst); await S.bcast({"t": "cfg", "cfg": S.pubcfg()})
        return await subs(chat, mid)
    if a in PROMPTS: WAIT[chat] = a; return await say(chat, PROMPTS[a], kb([[B("✖ Отмена", "a:menu")]]))
    if a == "gw":
        g = S.db.execute("SELECT * FROM gw WHERE status='active' ORDER BY ends").fetchall()
        txt = "🎉 <b>Активные розыгрыши</b>\n\n" + ("\n".join(f"#{x['id']} {esc(x['title'])} — {x['prize']:g}⭐×{x['winners']}, участников {one('SELECT COUNT(*) FROM gw_join WHERE gid=?', (x['id'],))}" for x in g) or "Нет активных.") + "\n\nСоздавать розыгрыши удобнее в веб-админке."
        return await say(chat, txt, kb([[B("‹ Меню", "a:menu")]]), mid)
    m = re.match(r"(ua|uc|um|ub):(\w+?)(?::(-?\d+))?$", a)
    if m:
        act, u = m.group(1), m.group(2)
        if act == "ua":
            amt = float(m.group(3)); usr = S.user(u)
            if usr["star"] + amt >= 0: S.add(u, amt); S.logx(u, "admin", "star", amt, "bot"); await S.me(u)
            return await user_card(chat, u, mid)
        if act == "ub":
            usr = S.user(u); S.db.execute("UPDATE users SET banned=? WHERE uid=?", (0 if usr["banned"] else 1, u)); S.db.commit()
            c = S.conns.get(u)
            if c and not usr["banned"]: await S.send(c, {"t": "banned"}); await S.drop(c)
            return await user_card(chat, u, mid)
        WAIT[chat] = f"{act}:{u}"
        return await say(chat, "Введите сумму (например 500 или -200):" if act == "uc" else "Введите текст сообщения:", kb([[B("✖ Отмена", "a:menu")]]))

async def handle(u):
    """bot.poll dan keladigan barcha yangilanishlar (to'lovlardan tashqari)."""
    if S is None: return
    if "callback_query" in u: return await on_cb(u["callback_query"])
    m = u.get("message")
    if not m or "text" not in m or m.get("chat", {}).get("type") != "private": return
    chat = m["chat"]["id"]; text = m["text"]; uid = m["from"]["id"]
    if text.startswith("/start"): return await on_start(m)
    if is_admin(uid):
        if text.startswith("/admin"): WAIT.pop(chat, None); return await menu(chat)
        if chat in WAIT and not text.startswith("/"): return await on_input(chat, text, WAIT[chat])
