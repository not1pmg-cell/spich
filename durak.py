"""Durak (24 yoki 36 karta, 2–4 o'yinchi): podkidnoy va perevodnoy. Server — hakam, kartalar yashirin.
Karta id: 0..35, suit=id//9, rank=6+id%9. 24 kartali kolodada faqat 9..A (id%9>=3)."""
import random

def suit(c): return c // 9
def rank(c): return 6 + c % 9

class Durak:
    """N o'yinchi (2..4). att — bosh hujumchi, dfn — himoyachi (att'dan keyingi faol o'yinchi),
    thr — hozir karta tashlash huquqi bor hujumchi (2 o'yinchida har doim att).
    Kartasi tugagan o'yinchi (koloda bo'sh bo'lsa) o'yindan chiqadi; oxirgi qolgan — durak (loser)."""
    def __init__(s, transfer=False, deck=36, n=2):
        s.n = max(2, min(4, int(n or 2)))
        s.tr = transfer; s.size = 24 if deck == 24 else 36
        s.deck = [c for c in range(36) if s.size == 36 or c % 9 >= 3]; random.SystemRandom().shuffle(s.deck)
        s.trump = suit(s.deck[0]); s.tcard = s.deck[0]   # pastdagi karta — kozir
        s.hand = [[] for _ in range(s.n)]
        for _ in range(6):
            for p in range(s.n): s.hand[p].append(s.deck.pop())
        lows = [(rank(c), p) for p in range(s.n) for c in s.hand[p] if suit(c) == s.trump]
        s.att = min(lows)[1] if lows else 0
        s.disc = 0; s.winner = None; s.loser = None; s.out = []
        s._bout()

    # --- yordamchilar
    def nxt(s, i):
        for k in range(1, s.n + 1):
            j = (i + k) % s.n
            if j not in s.out: return j
        return i
    @property
    def dfn(s): return s._dfn
    def _bout(s):
        s.table = []; s.taking = False; s._dfn = s.nxt(s.att); s.thr = s.att; s.passed = set()
        s.dcap = min(6, len(s.hand[s._dfn]))
    def undef(s): return [i for i, p in enumerate(s.table) if p[1] is None]
    def beats(s, a, d):
        return (suit(a) == suit(d) and rank(d) > rank(a)) or (suit(d) == s.trump and suit(a) != s.trump)
    def can_add(s, c):
        if len(s.table) >= s.dcap: return False
        return not s.table or rank(c) in {rank(x) for p in s.table for x in p if x is not None}
    def waiting(s):
        if s.winner is not None: return None
        if s.taking: return s.thr
        return s._dfn if s.undef() else s.thr
    def _k(s, c): return (suit(c) == s.trump, rank(c))
    def attackers(s):
        """Hujum tartibi: bosh hujumchi, keyin soat yo'nalishi bo'yicha qolganlar (himoyachidan tashqari)."""
        o = []; i = s.att
        for _ in range(s.n):
            if i != s._dfn and i not in s.out and i not in o: o.append(i)
            i = (i + 1) % s.n
        return o

    def _end(s):
        if s.deck: return
        for p in range(s.n):
            if p not in s.out and not s.hand[p]: s.out.append(p)
        left = [p for p in range(s.n) if p not in s.out]
        if len(left) <= 1:
            s.loser = left[0] if left else -1
            if s.n == 2: s.winner = -1 if s.loser == -1 else 1 - s.loser
            else: s.winner = -1 if s.loser == -1 else s.out[0]
    def _refill(s):
        order = [p for p in s.attackers()] + [s._dfn]
        for p in order:
            while len(s.hand[p]) < 6 and s.deck: s.hand[p].append(s.deck.pop())
    def _finish(s):
        cards = [x for p in s.table for x in p if x is not None]; s.table = []; d = s._dfn
        if s.taking: s.hand[d] += cards
        else: s.disc += len(cards)
        s._refill(); s._end()
        if s.winner is not None: return
        if s.taking: s.att = s.nxt(d)                      # olgan o'yinchi navbatini o'tkazib yuboradi
        else: s.att = d if d not in s.out else s.nxt(d)
        s._bout()
    def _pass(s):
        """Hozirgi hujumchi 'bo'ldi' dedi: navbat keyingi hujumchiga, hamma o'tkazib yuborsa — raund tugaydi."""
        s.passed.add(s.thr)
        rest = [p for p in s.attackers() if p not in s.passed]
        if rest: s.thr = rest[0]
        else: s._finish()
    def _auto(s):
        guard = 0
        while s.winner is None and guard < 8 and s.table and s.waiting() == s.thr and (s.taking or not s.undef()):
            if any(s.can_add(c) for c in s.hand[s.thr]): break
            tb = len(s.table); s._pass(); guard += 1
            if not s.table or len(s.table) != tb: break

    # --- harakatlar: att / def / tr / take / done
    def act(s, who, a, c=None, i=None):
        if s.winner is not None or who not in range(s.n) or who in s.out: return False
        h = s.hand[who]
        if a == "att":
            if who != s.thr or c not in h or not s.can_add(c): return False
            h.remove(c); s.table.append([c, None]); s.passed = set()
        elif a == "def":
            if who != s._dfn or s.taking or c not in h or i not in s.undef() or not s.beats(s.table[i][0], c): return False
            h.remove(c); s.table[i][1] = c
        elif a == "tr":
            if not s.tr or who != s._dfn or s.taking or c not in h or not s.table or any(p[1] is not None for p in s.table): return False
            nd = s.nxt(who)                                  # yangi himoyachi
            if rank(c) != rank(s.table[0][0]) or len(s.table) + 1 > len(s.hand[nd]): return False
            h.remove(c); s.table.append([c, None]); s.att = who; s._dfn = nd; s.thr = who; s.passed = set()
            s.dcap = min(6, len(s.hand[nd]))
        elif a == "take":
            if who != s._dfn or s.taking or not s.undef(): return False
            s.taking = True
        elif a == "done":
            if who != s.thr or not s.table or (not s.taking and s.undef()): return False
            s._pass(); s._auto(); return True
        else: return False
        s._auto(); return True

    def view(s, i):
        h = sorted(s.hand[i], key=lambda c: (suit(c) == s.trump, suit(c), rank(c)))
        v = {"h": h, "o": len(s.hand[(i + 1) % s.n]) if s.n == 2 else len(s.hand[s._dfn]), "dk": len(s.deck),
             "tc": s.deck[0] if s.deck else None, "ts": s.trump,
             "tb": s.table, "at": s.thr, "tk": s.taking, "w": s.waiting(), "ds": s.disc, "cap": s.dcap,
             "tr": int(s.tr), "win": s.winner, "sz": s.size, "nx": len(s.hand[s.nxt(s._dfn)])}
        if s.n > 2:
            v.update(n=s.n, df=s._dfn, ma=s.att, ps=[{"c": len(x), "out": p in s.out} for p, x in enumerate(s.hand)], lose=s.loser)
            if s.winner is not None and s.loser is not None and s.loser >= 0:
                v["win"] = i if i != s.loser else (s.loser + 1) % s.n   # mijoz uchun: yutdimmi/yutqazdimmi
        return v

    # --- avtomatik harakatlar (taymer va bot)
    def auto(s, w):
        if w == s._dfn and not s.taking and s.undef(): return ("take",)
        if not s.table: return ("att", min(s.hand[w], key=s._k))
        return ("done",)
    def bot(s, w):
        h = s.hand[w]
        if w == s.thr and (w != s._dfn):
            if not s.table: return ("att", min(h, key=s._k))
            adds = [c for c in h if s.can_add(c) and (suit(c) != s.trump or not s.deck)]
            if adds and (s.taking or random.random() < .7): return ("att", min(adds, key=s._k))
            return ("done",)
        if s.tr and not s.taking and all(p[1] is None for p in s.table):
            ts = [c for c in h if rank(c) == rank(s.table[0][0]) and suit(c) != s.trump and len(s.table) + 1 <= len(s.hand[s.nxt(w)])]
            if ts and random.random() < .7: return ("tr", min(ts, key=s._k))
        plan = []
        for i in s.undef():
            cs = [c for c in h if c not in [p for p, _ in plan] and s.beats(s.table[i][0], c)]
            if not cs: return ("take",)
            c = min(cs, key=s._k)
            if suit(c) == s.trump and rank(c) < 11 and len(s.deck) > 3 and suit(s.table[i][0]) != s.trump: return ("take",)
            plan.append((c, i))
        return ("def", plan[0][0], plan[0][1])
