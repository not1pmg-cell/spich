"""Tezkor PvP o'yinlar (server hakam, tasodif serverda):
dice  — Zar duel: har raund ikkalasi 2 ta zar tashlaydi, kattasi raundni oladi. 2 raund yutgan g'olib.
rps   — Tosh/Qaychi/Qog'oz: 2 raund yutgan g'olib.
coin  — Tanga: birinchi tanlagan o'yinchi tomonini oladi (Burgut/Raqam), ikkinchisiga qarama-qarshisi; bitta tashlash.
hilo  — Katta/Kichik: karta ochiladi, keyingisi kattami-kichikmi? 5 savol, ko'p topgan yutadi.
bj    — 21 (Очко): ikkalasiga 2 tadan karta, "yana"/"yetarli". 21 dan oshgan yutqazadi, 21 ga yaqini yutadi.
pen   — Penalti: navbat bilan 5 tadan zarba. Zarbachi burchak tanlaydi, darvozabon sakraydi. Ko'p gol urgan yutadi.
"""
import random
RNG = random.SystemRandom()
BEAT = {"r": "s", "s": "p", "p": "r"}


class Quick:
    def __init__(s, kind):
        s.k = kind; s.score = [0, 0]; s.pick = [None, None]; s.last = None; s.round = 1; s.winner = None
        s.need = 2
        if kind == "coin": s.need = 1
        if kind == "bj":
            s.deck = [(r, su) for r in range(2, 15) for su in range(4)]; RNG.shuffle(s.deck)
            s.hand = [[s.deck.pop(), s.deck.pop()] for _ in (0, 1)]; s.stood = [False, False]
            for i in (0, 1):
                if s.total(i) == 21: s.stood[i] = True
            s._bj_check()
        if kind == "pen":
            s.kick = 0; s.goals = [[], []]
        if kind == "hilo":
            s.need = 5; s.deck = list(range(2, 15)) * 4; RNG.shuffle(s.deck)
            s.card = s.deck.pop(); s.hist = []

    # ---- 21
    def total(s, i):
        t = 0; aces = 0
        for r, _ in s.hand[i]:
            if r == 14: aces += 1; t += 11
            elif r > 10: t += 10
            else: t += r
        while t > 21 and aces: t -= 10; aces -= 1
        return t
    def done(s, i): return s.stood[i] or s.total(i) > 21
    def _bj_check(s):
        if all(s.done(i) for i in (0, 1)):
            a, b = [s.total(i) if s.total(i) <= 21 else -1 for i in (0, 1)]
            s.winner = -1 if a == b else (0 if a > b else 1)
            if s.winner == -1: s.winner = None; s.draw = True    # durang
            s.last = {"bj": [[list(c) for c in h] for h in s.hand], "tot": [s.total(0), s.total(1)], "w": -1 if getattr(s, "draw", False) else s.winner}

    def waiting(s):
        """Kim harakat qilishi kerak: o'rindiqlar ro'yxati."""
        if s.winner is not None or getattr(s, "draw", False): return []
        if s.k == "bj": return [i for i in (0, 1) if s.pick[i] is None and not s.done(i)]
        if s.k == "coin": return [0, 1] if s.pick[0] is None else []
        return [i for i in (0, 1) if s.pick[i] is None]

    def act(s, who, v):
        if s.winner is not None or getattr(s, "draw", False) or who not in (0, 1) or s.pick[who] is not None: return False
        if s.k == "bj":
            if v not in ("hit", "stand") or s.done(who): return False
            s.pick[who] = v
            if all(s.pick[i] is not None or s.done(i) for i in (0, 1)): s._resolve()
            return True
        if s.k == "pen" and v not in ("l", "c", "r"): return False
        if s.k == "dice": v = "roll"
        elif s.k == "rps" and v not in BEAT: return False
        elif s.k == "coin":
            if v not in ("h", "t"): return False
            s.pick[who] = v; s.pick[1 - who] = "t" if v == "h" else "h"; s.chooser = who
            s._resolve(); return True
        elif s.k == "hilo" and v not in ("hi", "lo"): return False
        s.pick[who] = v
        if None not in s.pick: s._resolve()
        return True

    def auto(s, who):
        if s.k == "bj": return "hit" if s.total(who) < 15 else "stand"
        return {"dice": "roll", "rps": RNG.choice("rsp"), "coin": RNG.choice("ht"), "hilo": RNG.choice(["hi", "lo"]), "pen": RNG.choice("lcr")}[s.k]

    def _resolve(s):
        k = s.k; w = -1
        if k == "bj":
            for i in (0, 1):
                if s.pick[i] == "hit": s.hand[i].append(s.deck.pop())
                elif s.pick[i] == "stand": s.stood[i] = True
                if s.total(i) >= 21: s.stood[i] = True
            s.pick = [None, None]; s.round += 1; s._bj_check(); return
        if k == "pen":
            kicker = s.kick % 2; aim, dive = s.pick[kicker], s.pick[1 - kicker]
            goal = aim != dive; s.goals[kicker].append(1 if goal else 0); s.score[kicker] += goal
            s.last = {"pen": [aim, dive], "kicker": kicker, "goal": goal, "n": s.kick}
            s.kick += 1; s.pick = [None, None]; s.round = s.kick // 2 + 1
            a, b = s.score; ka, kb = len(s.goals[0]), len(s.goals[1])
            if s.kick <= 10:
                if a + (5 - ka) < b or b + (5 - kb) < a: s.winner = 0 if a > b else 1
                elif s.kick == 10 and a != b: s.winner = 0 if a > b else 1
            elif s.kick % 2 == 0 and a != b: s.winner = 0 if a > b else 1
            return
        if k == "dice":
            r = [[RNG.randint(1, 6), RNG.randint(1, 6)] for _ in (0, 1)]
            a, b = sum(r[0]), sum(r[1]); w = 0 if a > b else 1 if b > a else -1
            s.last = {"dice": r, "w": w}
        elif k == "rps":
            a, b = s.pick
            w = -1 if a == b else (0 if BEAT[a] == b else 1)
            s.last = {"rps": [a, b], "w": w}
        elif k == "coin":
            side = RNG.choice("ht"); w = 0 if s.pick[0] == side else 1
            s.last = {"coin": 0 if side == "h" else 1, "side": side, "picks": list(s.pick), "by": getattr(s, "chooser", 0), "w": w}
        elif k == "hilo":
            nxt = s.deck.pop(); res = "hi" if nxt > s.card else "lo" if nxt < s.card else "eq"
            ok = [p == res for p in s.pick]
            for i in (0, 1):
                if ok[i]: s.score[i] += 1
            s.last = {"hilo": [s.card, nxt], "ok": ok, "picks": list(s.pick)}
            s.hist.append(nxt); s.card = nxt; s.round += 1; s.pick = [None, None]
            if s.round > s.need:
                a, b = s.score
                if a != b: s.winner = 0 if a > b else 1
                else: s.need += 1          # durang — qo'shimcha savol
            return
        if w >= 0: s.score[w] += 1
        s.round += 1; s.pick = [None, None]
        if max(s.score) >= s.need: s.winner = 0 if s.score[0] > s.score[1] else 1

    def view(s, i):
        v = {"k": s.k, "sc": s.score, "me": s.pick[i] is not None, "op": s.pick[1 - i] is not None,
             "last": s.last, "rd": s.round, "need": s.need, "win": s.winner,
             "card": getattr(s, "card", None)}
        if s.k == "bj":
            end = s.winner is not None or getattr(s, "draw", False)
            v.update(me=s.pick[i] is not None or s.done(i), hand=s.hand[i], tot=s.total(i), stood=s.stood[i],
                     oh=s.hand[1 - i] if end else [s.hand[1 - i][0]] + [None] * (len(s.hand[1 - i]) - 1), odone=s.done(1 - i), draw=getattr(s, "draw", False))
        if s.k == "pen":
            v.update(kick=s.kick, kicker=s.kick % 2, goals=s.goals)
        return v
