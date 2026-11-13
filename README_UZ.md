# ⚡ StarUm — Telegram Mini App (VPS ga o'rnatish)

## 1. Bot tokenini yangilang
@BotFather → `/mybots` → botingiz → API Token → **Revoke**. Yangi tokenni `.env` ga yozing. `.env` GitHub'ga **chiqmaydi** (`.gitignore` da).

## 2. VPS (Ubuntu 22/24) — oddiy usul
```bash
sudo apt update && sudo apt install -y python3-venv nginx certbot python3-certbot-nginx git
sudo useradd -m -s /bin/bash arena
sudo git clone https://github.com/SIZNING/REPO.git /opt/arena && sudo chown -R arena: /opt/arena
cd /opt/arena && sudo -u arena python3 -m venv venv && sudo -u arena venv/bin/pip install -r requirements.txt
sudo -u arena cp .env.example .env && sudo -u arena nano .env     # BOT_TOKEN, WEBAPP_URL, ADMIN_PASSWORD
sudo cp deploy/arena.service /etc/systemd/system/ && sudo systemctl enable --now arena
sudo cp deploy/nginx.conf /etc/nginx/sites-available/arena && sudo ln -s /etc/nginx/sites-available/arena /etc/nginx/sites-enabled/
# nginx.conf ichida domenni almashtiring, keyin:
sudo nginx -t && sudo systemctl reload nginx && sudo certbot --nginx -d sizning-domen.uz
```
Domenning A-yozuvi VPS IP'siga qaragan bo'lishi kerak. Telegram faqat **https** ochadi.
Yangilash: `cd /opt/arena && sudo -u arena git pull && sudo systemctl restart arena`
Loglar: `journalctl -u arena -f`

### Docker bilan
```bash
cp .env.example .env && nano .env && docker compose up -d --build
```
(nginx + certbot yuqoridagidek; baza `./data/arena.db` da saqlanadi.)

## 3. Botni Mini App ga ulash
Server ishga tushganda menyu tugmasi o'zi o'rnatiladi (`WEBAPP_URL` to'g'ri bo'lsa). Qo'shimcha: @BotFather → `/newapp` — to'g'ridan-to'g'ri havola uchun.

## 4. Admin panel (rus tilida)
`https://sizning-domen.uz/admin` — parol: `.env` dagi `ADMIN_PASSWORD`.
- **Дашборд**: onlayn, stollar, xonalar, foydalanuvchilar, komissiya, sof foyda, depozitlar, balanslar, kurs, 14 kunlik grafiklar, soatlik o'yinlar, bugungi top, voqealar lentasi
- **Пользователи**: qidiruv, filtrlar (onlayn/VIP/ban), to'liq profil: balans qo'shish/aniq o'rnatish, xabar yuborish, ban, VIP, statistika va kunlik bonusni tiklash, tranzaksiyalar, o'yinlar, referallar, yechishlar
- **Игры и комнаты**: jonli stollar (to'xtatish + stavkani qaytarish), ochiq xonalar (yopish), jackpot stavkalarini qaytarish, tarix
- **Выводы**: yechish so'rovlari — «Выплачено» (TX hash bilan) yoki «Отклонить» (pul qaytadi); foydalanuvchiga bot orqali xabar boradi
- **Транзакции**, **Промокоды** (summa, soni, muddati), **Настройки** (komissiya %, referal %, stavkalar, bonuslar, kurs, min. depozit/yechish, jackpot, o'yinlarni yoqish/o'chirish, HOT belgisi, test/texnik rejim, banner)
- **Рассылка** (ilovaga yoki Telegram'ga, segmentlar, «Играть» tugmasi), **Система**: DB bekap, CSV eksport, admin harakatlari jurnali

## 5. Pul tizimi
- Bitta balans — **Stars (⭐)**. TON bilan to'ldirilsa, Fragment kursi bo'yicha Stars'ga aylanadi: `1 TON = TON narxi ($) ÷ 1⭐ narxi` (standart 0.015$). Kursni admin paneldan qo'lda ham qo'yish mumkin.
- Komissiya: har pullik o'yin bankidan 10% (sozlanadi). Referal: do'stning har stavkasidan 5% taklif qilganga (komissiyadan).
- TON Connect: foydalanuvchi hamyonini ulab, bir tugma bilan to'laydi (izoh avtomatik qo'shiladi). Hamyon ulanmasa — qo'lda manzil + izoh.
- Yechish: foydalanuvchi so'rov yuboradi (⭐ darhol ushlanadi), admin TON'ni qo'lda yuborib «Выплачено» bosadi.
- Stars: `TEST_MODE=0`. TON: `.env` ga `TON_ADDRESS` (+ `TONCENTER_KEY`). Eski TON balanslari birinchi ishga tushishda avtomatik Stars'ga o'tkaziladi.
- **Haqiqiy pulga chiqishdan oldin test rejimini O'CHIRING.**

## 6. Yangiliklar (v2)
- **Arena** (Virus uslubida): 50⭐ / 200⭐ xonalar va «С другом» (yopiq arena, havola orqali). Maydon stavkaga mutanosib bo'linadi, taymer tugaganda o'rtadan oq to'p otiladi — qaysi o'yinchining maydonida to'xtasa, o'sha bankni oladi (10% komissiya).
- **Jackpot** g'ildiragi yangilandi: avatarlar, chiroqlar, ko'rsatkich, «Топ игра / Последняя игра», tarix.
- **21 (Очко)** va **Penalti** o'yinlari qo'shildi.
- Pastki menyu: Главная · Игры · Рейтинг · Кошелёк · **Профиль** (promokod, kunlik bonus, konkurslar, referal, sozlamalar).
- Haqiqiy TON logotipi va Telegram Star belgisi, yangi ovozlar, bannerlar, jonli yutuqlar lentasi.
- **Yechish**: TON (Fragment kursi) yoki **Telegram Stars 1:1** (@username — admin fragment.com orqali yuboradi).
- **Admin**: «Розыгрыши» (konkurs: sovrin, g'oliblar soni, muddat, min. o'yinlar, kanalga obuna sharti, Telegram e'lon), «Призы рейтинга» (o'rinlar bo'yicha sovrinlar, kun/hafta, avto-to'lov), **bonus-havolalar** (`t.me/BOT?start=bonus_KOD` — ochgan odam bonusni avtomatik oladi), Arena sozlamalari.

## 7. O'yinlar
Arena (to'p), Jackpot g'ildirak, Durak (24/36 karta, podkidnoy/perevodnoy), Nardi (uzun), 21 (Очко), Penalti, Zar, Tosh-qaychi-qog'oz, Tanga, Katta/Kichik, Shaxmat, Shashka, 4 qator, Gomoku, Reversi, Krestik-nolik.
Lobbi: tezkor o'yin, xona yaratish (yopiq xona — havola orqali), ochiq lobbilar ro'yxati, faol o'yinlar.

## 8. Zaxira
`arena.db` — butun baza. Admin paneldan «Система → Бэкап базы» yoki kunlik nusxa: `crontab -e` → `0 4 * * * cp /opt/arena/arena.db /opt/arena/arena.$(date +\%a).db`
