"""Uzun nardi (Длинные нарды), 2 o'yinchi. Server — hakam, zarlar serverda tashlanadi.

Doska: 24 punkt (0..23, absolyut). 0-o'yinchining "boshi" 0-punktda, 1-o'yinchiniki 12-punktda.
Ikkalasi ham bir yo'nalishda yuradi: nisbiy pozitsiya r = (i - start) % 24 o'sib boradi.
Uy: r = 18..23. Hamma shashka uyda bo'lsa — chiqarish (bear off). 15 tasini birinchi chiqargan yutadi.
Qoidalar: raqib turgan punktga qo'yib bo'lmaydi; boshdan bitta (birinchi yurishda 6-6, 4-4, 3-3 — ikkita);
oldida raqib shashkasi bo'lmasa 6 ta ketma-ket "to'siq" qurib bo'lmaydi; zarlardan maksimal foydalanish shart.
"""
import random

RNG = random.SystemRandom()
START = (0, 12)
OFF = 24  # "chiqarish" maqsadi


def rel(p, i): return (i - START[p]) % 24
def ab(p, r): return (r + START[p]) % 24


class Nardy:
    def __init__(s):
        s.pts = [0] * 24                 # >0: 0-o'yinchi soni, <0: 1-o'yinchi soni
        s.pts[0], s.pts[12] = 15, -15
        s.off = [0, 0]
        s.turn = RNG.randrange(2)
        s.first = [True, True]           # birinchi yurish (boshdan 2 ta olish imkoniyati)
        s.winner = None
        s.dice = []; s.rolled = []; s.head = 0
        s.roll()

    # ---------- yordamchilar
    def own(s, p, i): return s.pts[i] > 0 if p == 0 else s.pts[i] < 0
    def cnt(s, i): return abs(s.pts[i])
    def foe(s, p, i): return s.own(1 - p, i)

    def roll(s):
        a, b = RNG.randint(1, 6), RNG.randint(1, 6)
        s.rolled = [a, b]; s.dice = [a] * 4 if a == b else [a, b]; s.head = 0
        s._legal = None

    def home_ready(s, p, pts=None):
        pts = pts or s.pts
        for i in range(24):
            v = pts[i]
            if (v > 0 if p == 0 else v < 0) and rel(p, i) < 18: return False
        return True

    def head_limit(s, p):
        if s.first[p] and len(s.rolled) == 2 and s.rolled[0] == s.rolled[1] and s.rolled[0] in (3, 4, 6): return 2
        return 1

    # ---------- bitta qadam
    def _steps(s, st, p):
        """st = (pts tuple, dice tuple, head_used). Mumkin bo'lgan (from, to, die) qadamlar (to'siq qoidasisiz)."""
        pts, dice, hu = st
        out = []; sign = 1 if p == 0 else -1
        ready = None
        hl = s.head_limit(p)
        for d in set(dice):
            for i in range(24):
                v = pts[i]
                if v * sign <= 0: continue
                r = rel(p, i)
                if r == 0 and hu >= hl: continue
                t = r + d
                if t < 24:
                    j = ab(p, t)
                    if pts[j] * sign < 0: continue
                    out.append((i, j, d))
                else:
                    if ready is None: ready = s.home_ready(p, pts)
                    if not ready: continue
                    if t == 24: out.append((i, OFF, d))
                    else:  # katta zar: faqat eng uzoqdagi shashka bo'lsa
                        if not any(pts[k] * sign > 0 and rel(p, k) < r for k in range(24) if rel(p, k) >= 18):
                            out.append((i, OFF, d))
        return out

    def _apply(s, st, p, m):
        pts, dice, hu = st
        f, t, d = m; sign = 1 if p == 0 else -1
        L = list(pts); L[f] -= sign
        if t != OFF: L[t] += sign
        D = list(dice); D.remove(d)
        return (tuple(L), tuple(D), hu + (1 if rel(p, f) == 0 else 0))

    def _block_ok(s, pts, p):
        """6 ta ketma-ket o'z punkti bo'lsa, oldida raqib shashkasi bo'lishi shart."""
        sign = 1 if p == 0 else -1; q = 1 - p; run = 0
        for r in range(24):
            i = ab(p, r)
            run = run + 1 if pts[i] * sign > 0 else 0
            if run >= 6:
                blk = [ab(p, x) for x in range(r - 5, r + 1)]
                qr = [rel(q, i) for i in blk]
                if max(qr) - min(qr) != 5: continue    # raqib yo'lida bo'linib ketgan — to'smaydi
                hi = max(qr)
                if not any(pts[k] * -sign > 0 and rel(q, k) > hi for k in range(24)): return False
        return True

    def _depth(s, st, p, memo):
        if st in memo: return memo[st]
        best = 0
        if st[1]:
            for m in s._steps(st, p):
                n = s._apply(st, p, m)
                if not s._block_ok(n[0], p): continue
                best = max(best, 1 + s._depth(n, p, memo))
                if best == len(st[1]): break
        memo[st] = best
        return best

    def legal(s):
        """Hozirgi o'yinchi uchun ruxsat etilgan qadamlar: [(from, to, die)]."""
        if s._legal is not None: return s._legal
        p = s.turn; st = (tuple(s.pts), tuple(s.dice), s.head); memo = {}
        cand = []
        for m in s._steps(st, p):
            n = s._apply(st, p, m)
            if not s._block_ok(n[0], p): continue
            cand.append((m, 1 + s._depth(n, p, memo)))
        if not cand: s._legal = []; return []
        L = max(c[1] for c in cand)
        res = [m for m, d in cand if d == L]
        if L == 1 and len(s.dice) == 2 and s.dice[0] != s.dice[1]:   # bitta zar ishlatilsa — kattasi
            big = [m for m in res if m[2] == max(s.dice)]
            if big: res = big
        # bir xil (from,to) — bir marta
        seen, uniq = set(), []
        for m in res:
            if (m[0], m[1]) not in seen: seen.add((m[0], m[1])); uniq.append(m)
        s._legal = uniq
        return uniq

    def move(s, who, f, t):
        if s.winner is not None or who != s.turn: return False
        m = next((m for m in s.legal() if m[0] == f and m[1] == t), None)
        if not m: return False
        st = s._apply((tuple(s.pts), tuple(s.dice), s.head), who, m)
        s.pts, s.dice, s.head = list(st[0]), list(st[1]), st[2]
        if t == OFF: s.off[who] += 1
        s._legal = None
        if s.off[who] == 15: s.winner = who; return True
        if not s.dice or not s.legal(): s.next_turn()
        return True

    def next_turn(s):
        s.first[s.turn] = False
        s.turn = 1 - s.turn
        s.roll()
        # yurish imkoni yo'q bo'lsa — o'tkazib yuboriladi (view'da "pass" ko'rinadi)
        s.passed = 0
        if not s.legal():
            s.passed = 1

    def skip_if_stuck(s):
        """Yurish yo'q bo'lsa navbatni o'tkazadi. True — o'tkazildi."""
        if s.winner is None and not s.legal():
            s.next_turn(); return True
        return False

    def view(s, i):
        lg = s.legal() if s.turn == i and s.winner is None else []
        return {"pts": s.pts, "off": s.off, "turn": s.turn, "dice": s.dice, "rolled": s.rolled,
                "moves": [[m[0], m[1]] for m in lg], "win": s.winner}

    # ---------- avtomatik / bot
    def auto(s):
        lg = s.legal()
        return lg[0][:2] if lg else None

    def bot(s):
        p = s.turn; lg = s.legal()
        if not lg: return None
        def score(m):
            f, t, d = m
            if t == OFF: return 100
            r0 = rel(p, f); sc = (24 - r0) * .6 + d
            if r0 == 0: sc += 6                       # boshdan chiqarish foydali
            if s.cnt(f) == 2: sc -= 2                 # yolg'iz qoldirmaslik
            if s.cnt(t) == 0: sc += 2                 # yangi punkt egallash
            return sc + RNG.random() * 2
        return max(lg, key=score)[:2]
