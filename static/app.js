/* StarUm — Telegram Mini App */
const tg=window.Telegram?.WebApp;if(tg){tg.ready();tg.expand();try{tg.setHeaderColor('#07060b');tg.setBackgroundColor('#07060b');tg.disableVerticalSwipes&&tg.disableVerticalSwipes()}catch(e){}}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],on=(s,f)=>document.addEventListener('click',e=>{const x=e.target.closest(s);if(x)f(x,e)});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>(+n||0).toLocaleString('ru',{maximumFractionDigits:2}),hap=(k='light')=>{try{tg.HapticFeedback.impactOccurred(k)}catch(e){}};
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
let SND=LS.get('snd','1')!=='0';
const SFX={c:null,nb:null,ctx(){if(!SND)return null;try{this.c=this.c||new(window.AudioContext||window.webkitAudioContext)();if(this.c.state==='suspended')this.c.resume();return this.c}catch(e){return null}},
 tone(f,d,o={}){const c=this.ctx();if(!c)return;const t0=c.currentTime+(o.at||0),os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t0);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(o.v||.08,t0+(o.att||.006));g.gain.exponentialRampToValueAtTime(.0001,t0+d);os.connect(g);g.connect(c.destination);os.start(t0);os.stop(t0+d+.03)},
 noise(d,o={}){const c=this.ctx();if(!c)return;if(!this.nb){const b=c.createBuffer(1,c.sampleRate,c.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;this.nb=b}const t0=c.currentTime+(o.at||0),s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nb;s.loop=true;f.type=o.type||'bandpass';f.frequency.setValueAtTime(o.f||1000,t0);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t0+d);f.Q.value=o.q||1;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(o.v||.1,t0+(o.att||.005));g.gain.exponentialRampToValueAtTime(.0001,t0+d);s.connect(f);f.connect(g);g.connect(c.destination);s.start(t0);s.stop(t0+d+.03)},
 tap(){this.tone(880,.05,{type:'triangle',v:.045})},pop(){this.tone(600,.09,{v:.07,to:1250})},
 coin(){this.tone(1318,.1,{type:'triangle',v:.06});this.tone(1975,.3,{type:'triangle',v:.06,at:.07})},
 tick(){this.tone(1600,.025,{type:'square',v:.018})},count(s){this.tone(s===1?1320:880,.15,{type:'triangle',v:.08})},
 whoosh(){this.noise(.45,{v:.08,f:500,to:3500,q:.7})},launch(){this.noise(.7,{v:.12,f:300,to:4500,q:.6});this.tone(220,.55,{type:'sawtooth',v:.03,to:880})},
 bounce(k=1){this.tone(260*k,.15,{v:.14,to:110});this.noise(.05,{v:.05,f:3000})},card(){this.noise(.09,{v:.14,f:2800,q:.8})},
 dice(){for(let i=0;i<6;i++)this.noise(.035,{v:.09,f:1800+Math.random()*1800,at:i*.065})},
 kick(){this.noise(.1,{v:.3,f:260,type:'lowpass'});this.tone(140,.13,{v:.18,to:55})},
 cheer(){this.noise(1.6,{v:.07,f:1400,q:.35,att:.2});[523,659,784].forEach((f,i)=>this.tone(f,.4,{type:'triangle',v:.05,at:.1+i*.08}))},
 win(){[523,659,784,1047,1319].forEach((f,i)=>this.tone(f,.38,{type:'triangle',v:.065,at:i*.085}));this.tone(2093,.7,{v:.03,at:.42});this.noise(.6,{v:.03,f:6000,at:.4})},
 lose(){[392,330,262,196].forEach((f,i)=>this.tone(f,.3,{type:'sawtooth',v:.025,at:i*.13}))},error(){this.tone(170,.18,{type:'square',v:.04})}};
function beep(f=520,d=.09,ty='triangle',v=.06){SFX.tone(f,d,{type:ty,v})}
const jingle=w=>w?SFX.win():SFX.lose();
const LI={uz:0,ru:1,en:2};let lang=LS.get('lang',null)||({uz:'uz',en:'en'}[(tg?.initDataUnsafe?.user?.language_code||'').slice(0,2)]||'ru');document.documentElement.lang=lang;
/* ======================= tarjimalar */
const D={home:['Asosiy','Главная','Home'],games:['O‘yinlar','Игры','Games'],bonus:['Bonuslar','Бонусы','Bonuses'],top:['Reyting','Рейтинг','Top'],wallet:['Hamyon','Кошелёк','Wallet'],me:['Profil','Профиль','Profile'],
quick:['Tezkor o‘yin','Быстрая игра','Quick game'],quickS:['Raqib avtomatik topiladi','Соперник найдётся автоматически','Auto-match an opponent'],rec:['Tavsiya','Рекомендуем','Recommended'],
lobbies:['Ochiq lobbilar','Открытые лобби','Open lobbies'],create:['Xona yaratish','Создать комнату','Create room'],createS:['O‘z qoidalaring, tayyor stavkalar','Свои правила, готовые ставки','Your rules, set stakes'],
active:['Faol o‘yinlar','Активные игры','Live games'],activeS:['Hozir o‘ynalayotgan stollar','Столы, где идёт игра','Tables in progress'],
noRooms:['Ochiq xona yo‘q — o‘zingniki yarat!','Нет открытых комнат — создай свою!','No open rooms — create one!'],all:['Hammasi','Все','All'],enter:['KIRISH','ВОЙТИ','JOIN'],yours:['SIZNIKI','ВАША','YOURS'],
jp:['Jackpot','Джекпот','Jackpot'],jpS:['G‘ildirak g‘olibni tanlaydi','Колесо выбирает победителя','The wheel picks a winner'],pot:['Bank','Банк','Pot'],players:['O‘yinchilar','Игроки','Players'],
jpWait:['O‘yinchilar kutilmoqda…','Ждём игроков…','Waiting for players…'],jpSpin:['Aylanmoqda!','Крутим!','Spinning!'],jpBet:['Stavka qo‘yish','Сделать ставку','Place bet'],chance:['Imkoniyat','Шанс','Chance'],
jpHist:['Oxirgi g‘oliblar','Последние победители','Recent winners'],jpCancel:['Stavkani qaytarish','Вернуть ставку','Withdraw bet'],jpWin:['G‘olib','Победитель','Winner'],start:['Boshlanishi','Старт через','Starts in'],
hot:['🔥 Ommabop','🔥 Популярное','🔥 Hot'],cat_all:['Hammasi','Все','All'],cat_card:['Kartalar','Карты','Cards'],cat_board:['Stol o‘yinlari','Настольные','Board'],cat_fast:['Tezkor','Быстрые','Instant'],
paid:['Stavkaga','На ставку','For stars'],bot:['Bot bilan','С ботом','vs Bot'],free:['Bepul','Бесплатно','Free'],stake:['Stavka','Ставка','Stake'],prize:['Yutuq','Выигрыш','Prize'],
deck:['Koloda','Колода','Deck'],cards:['karta','карт','cards'],mode:['Rejim','Режим','Mode'],podk:['Podkidnoy','Подкидной','Throw-in'],perev:['Perevodnoy','Переводной','Transfer'],
priv:['🔒 Yopiq xona (faqat havola orqali)','🔒 Приватная (только по ссылке)','🔒 Private (link only)'],playBot:['Bot bilan o‘ynash','Играть с ботом','Play vs bot'],
search:['Raqib qidirilmoqda…','Ищем соперника…','Finding opponent…'],waitOpp:['Raqib kutilmoqda','Ждём соперника','Waiting for opponent'],invite:['Do‘stni chaqirish','Позвать друга','Invite friend'],cancel:['Bekor qilish','Отмена','Cancel'],
invited:['Sizni o‘yinga chaqirishdi','Вас пригласили в игру','You are invited'],
win:['G‘alaba!','Победа!','You won!'],lose:['Mag‘lubiyat','Поражение','You lost'],draw:['Durang','Ничья','Draw'],yourturn:['Sizning yurishingiz','Ваш ход','Your move'],opp:['Raqib o‘ylayapti…','Ходит соперник…','Opponent’s move…'],
yourAtk:['Siz hujumdasiz','Вы атакуете','You attack'],yourDef:['Siz himoyadasiz','Вы защищаетесь','You defend'],take:['Olaman','Беру','Take'],transfer:['Perevod','Перевод','Transfer'],done:['Tayyor','Готово','Done'],bita:['Bita','Бито','Beat'],
resign:['Taslim bo‘lasizmi','Сдаться','Resign'],again:['Yana o‘ynash','Играть ещё','Play again'],menu:['Menyu','Меню','Menu'],left:['Raqib chiqib ketdi','Соперник вышел','Opponent left'],pass:['Yurish yo‘q — o‘tkazildi','Нет ходов — пропуск','No moves — skipped'],
refund:['Stavka qaytarildi','Ставка возвращена','Stake refunded'],
balance:['Balans','Баланс','Balance'],dep:['To‘ldirish','Пополнить','Deposit'],wd:['Yechish','Вывести','Withdraw'],hist:['Tarix','История','History'],
amount:['Summa','Сумма','Amount'],other:['Boshqa summa','Другая сумма','Custom amount'],youGet:['Siz olasiz','Вы получите','You get'],rate:['Kurs','Курс','Rate'],
connect:['Hamyonni ulash','Подключить кошелёк','Connect wallet'],payWallet:['Hamyon orqali to‘lash','Оплатить через кошелёк','Pay with wallet'],manual:['Qo‘lda o‘tkazish','Перевести вручную','Send manually'],
tonsend:['TON yuboring','Отправьте TON','Send TON'],comment:['Izoh (majburiy)','Комментарий (обязательно)','Comment (required)'],openW:['Hamyonni ochish','Открыть кошелёк','Open wallet'],
depOk:['Hisob to‘ldirildi','Счёт пополнен','Balance topped up'],depOff:['Bu usul hozir o‘chiq','Способ недоступен','Method unavailable'],test:['🧪 Test rejimi: to‘ldirish bepul','🧪 Тест-режим: пополнение бесплатно','🧪 Test mode: deposits are free'],
addr:['TON hamyon manzili','Адрес TON-кошелька','TON wallet address'],wdMin:['Minimal','Минимум','Minimum'],wdSend:['Yechishga so‘rov','Запросить вывод','Request withdrawal'],wdOk:['So‘rov yuborildi! Tez orada to‘lanadi','Заявка отправлена! Скоро выплатим','Request sent! Paid soon'],
myWd:['Mening so‘rovlarim','Мои заявки','My requests'],pending:['kutilmoqda','ожидает','pending'],paidS:['to‘landi','выплачено','paid'],rejected:['rad etildi','отклонено','rejected'],
fromWallet:['Ulangan hamyondan','Из подключённого кошелька','From connected wallet'],noHist:['Hali tranzaksiya yo‘q','Пока нет операций','No transactions yet'],
k_deposit:['To‘ldirish','Пополнение','Deposit'],k_withdraw:['Yechish','Вывод','Withdrawal'],k_bet:['Stavka','Ставка','Bet'],k_win:['Yutuq','Выигрыш','Win'],k_refund:['Qaytarish','Возврат','Refund'],k_ref:['Referal','Реферал','Referral'],k_promo:['Promokod','Промокод','Promo'],k_bonus:['Bonus','Бонус','Bonus'],k_admin:['Admin','Корректировка','Adjustment'],
promo:['Promokod','Промокод','Promo code'],promoPh:['Kodni kiriting','Введите код','Enter code'],activate:['Faollashtirish','Активировать','Activate'],gift:['Sovg‘a!','Подарок!','Gift!'],
daily:['Kunlik bonus','Ежедневный бонус','Daily bonus'],claim:['Olish','Забрать','Claim'],nextIn:['Keyingisi','Следующий через','Next in'],
refT:['Do‘stlarni taklif qil','Приглашай друзей','Invite friends'],refS:['Do‘stlar va ularning do‘stlari stavkasidan — umrbod','Со ставок друзей и их друзей — навсегда','From friends’ and their friends’ bets — forever'],
refs:['Do‘stlar','Друзья','Friends'],earned:['Ishlab topildi','Заработано','Earned'],copy:['Nusxalash','Копировать','Copy'],copied:['Nusxalandi','Скопировано','Copied'],share:['Ulashish','Поделиться','Share'],
st1:['Havolani do‘stingizga yuboring','Отправь ссылку другу','Send the link to a friend'],st2:['U StarUm’da o‘ynaydi','Он играет в StarUm','They play StarUm'],st3:['U ham do‘st chaqirsa — 2 va 3-darajadan ham % olasiz','Пригласит своих друзей — получишь % и со 2-го и 3-го уровня','They invite friends — you earn from levels 2 and 3 too'],
shareTxt:['⭐ StarUm’da men bilan o‘yna! Durak, Nardi, Jackpot…','⭐ Играй со мной в StarUm! Дурак, Нарды, Джекпот…','🔥 Play with me in StarUm! Durak, Backgammon, Jackpot…'],
day:['Kun','День','Day'],week:['Hafta','Неделя','Week'],allT:['Hamma vaqt','Всё время','All time'],byP:['Yutuq','Выигрыш','Winnings'],byW:['G‘alabalar','Победы','Wins'],byD:['Depozit','Депозит','Deposits'],rcT:['REFERAL KONKURS','РЕФЕРАЛЬНЫЙ КОНКУРС','REFERRAL CONTEST'],rcB:['Do‘st chaqir — sovrinni ol!','Зови друзей — забирай приз!','Invite friends — win the prize!'],rcF:['Sovrin fondi','Призовой фонд','Prize pool'],rcGo:['Qatnashish','Участвовать','Join'],rcS:['Eng ko‘p do‘st chaqirganlar sovrinni bo‘lishadi','Больше всех пригласил — забираешь приз','Top inviters share the prize'],byR:['Referallar','Рефералы','Referrals'],refsN:['ta do‘st','друзей','friends'],depN:['depozit','пополн.','deposits'],you:['Siz','Вы','You'],
emptyTop:['Hali hech kim yo‘q — birinchi bo‘l!','Пока пусто — стань первым!','Empty — be the first!'],
wins:['G‘alaba','Победы','Wins'],played:['O‘yinlar','Игры','Played'],wr:['G‘alaba %','Винрейт','Win rate'],lvl:['Daraja','Уровень','Level'],xp:['XP','XP','XP'],
lang:['Til','Язык','Language'],sound:['Ovoz','Звук','Sound'],bg:['Fon','Фон','Background'],bg_fire:['Olov','Огонь','Fire'],bg_cosmos:['Koinot','Космос','Cosmos'],bg_snow:['Qor','Снег','Snow'],bg_grid:['Neon','Неон','Neon'],bg_off:['O‘chiq','Выкл','Off'],
conn:['ulanmoqda…','подключение…','connecting…'],online:['onlayn','онлайн','online'],new:['YANGI','НОВОЕ','NEW'],hotL:['HOT','HOT','HOT'],
maint:['Texnik ishlar olib borilmoqda','Технические работы','Maintenance'],
e_balance:['Balans yetarli emas','Недостаточно средств','Not enough balance'],e_off:['Bu o‘yin vaqtincha o‘chirilgan','Игра временно отключена','Game temporarily disabled'],e_nofree:['Bepul o‘yinlar o‘chirilgan','Бесплатные игры отключены','Free games are disabled'],
e_guest:['Telegram orqali kiring','Откройте через Telegram','Open via Telegram'],e_gone:['Xona endi yo‘q','Комната уже закрыта','Room is gone'],e_cancel:['Xona yopildi','Комната закрыта','Room closed'],e_admin:['Xona admin tomonidan yopildi','Комната закрыта администратором','Closed by admin'],
e_spin:['G‘ildirak aylanmoqda, kuting','Колесо крутится, подождите','Wheel is spinning'],e_min:['Summa juda kichik','Слишком маленькая сумма','Amount too small'],e_full:['Raund to‘lgan','Раунд заполнен','Round is full'],
e_addr:['Manzil noto‘g‘ri','Неверный адрес','Invalid address'],e_wdmany:['Faol so‘rovlar juda ko‘p','Слишком много активных заявок','Too many pending requests'],e_promo:['Promokod topilmadi yoki tugagan','Промокод не найден или закончился','Promo not found or expired'],
e_used:['Siz bu kodni ishlatgansiz','Вы уже использовали этот код','Already used'],e_early:['Hali erta','Ещё рано','Too early'],e_nobot:['Bot rejimi o‘chiq','Игра с ботом отключена','Bot mode off'],e_maint:['Texnik ishlar','Технические работы','Maintenance'],
roll:['🎲 Tashlash','🎲 Бросить','🎲 Roll'],waitO:['Raqib kutilmoqda…','Ждём соперника…','Waiting for opponent…'],round:['Raund','Раунд','Round'],firstTo:['g‘alabagacha','до побед','wins to win'],
rWin:['Raund sizniki!','Раунд ваш!','Round is yours!'],rLose:['Raund raqibda','Раунд у соперника','Opponent takes it'],rDraw:['Teng — qayta','Ничья — переигровка','Tie — again'],
heads:['Burgut','Орёл','Heads'],tails:['Raqam','Решка','Tails'],yourSide:['Sizning tomoningiz','Ваша сторона','Your side'],flip:['🪙 Tashlash','🪙 Подбросить','🪙 Flip'],
hi:['⬆ Katta','⬆ Больше','⬆ Higher'],lo:['⬇ Kichik','⬇ Меньше','⬇ Lower'],guess:['Keyingi karta kattami yoki kichik?','Следующая карта больше или меньше?','Is the next card higher or lower?'],ok:['To‘g‘ri!','Верно!','Correct!'],nok:['Xato','Мимо','Wrong'],
offT:['Chiqarildi','Выброшено','Borne off'],bearOff:['Chiqarish','Выбросить','Bear off'],
allGames:['Barcha o‘yinlar','Все игры','All games'],playNow:['O‘ynash','Играть','Play'],bnArena:['To‘p kimga tushsa — o‘sha yutadi!','На кого упадёт шар — тот и забирает!','Where the ball lands — wins!'],
bnJp:['G‘ildirakni aylantir — bankni ol!','Крути колесо — забирай банк!','Spin the wheel — take the pot!'],bnRef:['do‘stlar stavkasidan','со ставок друзей','of friends’ bets'],
gw:['Konkurs','Розыгрыш','Giveaway'],gws:['Konkurslar','Розыгрыши','Giveaways'],gwJoin:['Qatnashish','Участвовать','Join'],gwIn:['Siz qatnashyapsiz','Вы участвуете','You’re in'],gwMinG:['Kamida {n} ta o‘yin','Минимум {n} игр','At least {n} games'],gwSub:['Obuna:','Подписка:','Subscribe:'],partic:['ishtirokchi','участников','joined'],
lbPr:['HAFTA SOVRINLARI','ПРИЗЫ РЕЙТИНГА','LEADERBOARD PRIZES'],lbPrS:['Top o‘yinchilar sovrin oladi!','Топ игроков получают призы!','Top players win prizes!'],ends:['Tugashiga','До конца','Ends in'],lastW:['Oxirgi sovrindorlar','Прошлые победители','Last winners'],
dd:['k','д','d'],hh:['s','ч','h'],mm:['d','м','m'],waiting:['O‘yinchilar kutilmoqda','Ждём игроков','Waiting for players'],spinning:['Aylanmoqda!','Розыгрыш!','Spinning!'],starting:['Boshlanishi','Старт через','Starting'],total:['Jami','Всего','Total'],
placeBet:['Stavka qo‘yish','Сделать ставку','Place bet'],yourBet:['Stavkangiz','Ваша ставка','Your bet'],withFriend:['Do‘st bilan','С другом','With friend'],privTxt:['Yopiq arena — do‘stlarni chaqiring','Приватная арена — позовите друзей','Private arena — invite friends'],
arenaInv:['🟢 Arena’da men bilan o‘yna! To‘p kimga tushsa — o‘sha yutadi','🟢 Сыграй со мной в Арене! На кого упадёт шар — тот забирает банк','🟢 Play Arena with me!'],
topGame:['Top o‘yin','Топ игра','Top game'],lastGame:['Oxirgi o‘yin','Последняя','Last game'],noGames:['hali o‘yin yo‘q','игр пока нет','no games yet'],beFirst:['Birinchi bo‘ling!','Будьте первым!','Be the first!'],
arenaEmpty:['Stavka qo‘ying — maydondan joy oling','Сделайте ставку — займите место на поле','Bet to take a place'],arenaS:['to‘p g‘olibni tanlaydi','шар выбирает победителя','the ball picks the winner'],history:['Tarix','История','History'],
ar1:['Stavka qo‘ying — maydondagi joyingiz stavkangizga teng','Ставка = ваша доля поля: чем больше ставка, тем больше территория','Your bet = your share of the field'],
ar2:['Ikkinchi o‘yinchi qo‘shilgach taymer boshlanadi','Таймер стартует после второго игрока','Timer starts after the 2nd player'],
ar3:['Vaqt tugaganda o‘rtadan oq to‘p otiladi — qaysi joyda to‘xtasa, o‘sha yutadi','Когда время выйдет, из центра вылетает белый шар — на чьей территории остановится, тот выиграл','When time is up a ball is shot — where it stops, that player wins'],
ar4:['G‘olib butun bankni oladi ({f}% komissiya)','Победитель забирает весь банк (комиссия {f}%)','Winner takes the pot ({f}% fee)'],
jp1:['Stavka qo‘ying — g‘ildirakdagi ulushingiz stavkaga teng','Ставка = ваш сектор на колесе','Your bet = your wheel sector'],jp2:['2 ta o‘yinchidan keyin taymer boshlanadi','После 2 игроков стартует таймер','Timer starts after 2 players'],
jp3:['G‘ildirak to‘xtaganda ko‘rsatkich kimga tushsa — o‘sha yutadi','Кому укажет стрелка — тот победил','The pointer picks the winner'],
settings:['Sozlamalar','Настройки','Settings'],uname:['Telegram @username','Telegram @username','Telegram @username'],starWd:['Stars Fragment orqali 1:1 yuboriladi','Звёзды отправим через Fragment 1:1','Stars are sent via Fragment 1:1'],
tonWait:['Tranzaksiya yuborildi, tasdiq kutilmoqda','Транзакция отправлена, ждём подтверждения','Sent, awaiting confirmation'],
hit:['Yana','Ещё','Hit'],stand:['Yetarli','Хватит','Stand'],bust:['Ko‘p!','Перебор!','Bust!'],bjStand:['To‘xtadi','Хватит','Stood'],bjDone:['tayyor','готово','done'],
penKick:['Siz zarba berasiz — burchakni tanlang','Вы бьёте — выберите угол','You kick — pick a corner'],penSave:['Siz darvozabon — qayerga sakraysiz?','Вы вратарь — куда прыгнуть?','You’re the keeper — dive where?'],
pen_l:['Chap','Влево','Left'],pen_c:['Markaz','Центр','Center'],pen_r:['O‘ng','Вправо','Right'],goal:['GOOL! ⚽','ГОООЛ! ⚽','GOAL! ⚽'],save:['SEYV! 🧤','СЕЙВ! 🧤','SAVE! 🧤'],
penShot:['Zarba','Удар','Shot'],penDive:['Darvozabon','Вратарь','Keeper'],yourPick:['Tanlovingiz','Ваш выбор','Your pick'],coinPick:['Tomonni tanlang — kim birinchi tanlasa, o‘sha oladi','Выберите сторону — кто первым выбрал, тот её и получает','Pick a side — first to choose gets it'],coinChose:['tanladi','выбрал первым','chose first'],
e_sub:['Avval kanallarga obuna bo‘ling','Сначала подпишитесь на каналы','Subscribe to the channels first'],e_depoff:['To‘ldirish vaqtincha yopiq','Пополнение временно закрыто','Deposits are temporarily closed'],e_wdoff:['Yechish vaqtincha yopiq','Вывод временно закрыт','Withdrawals are temporarily closed'],
subT:['Kanallarga obuna bo‘ling','Подпишитесь на каналы','Subscribe to channels'],subS:['O‘ynash uchun quyidagi kanallarga obuna bo‘ling','Чтобы играть, подпишитесь на каналы ниже','Subscribe to play'],subCheck:['✅ Obuna bo‘ldim','✅ Я подписался','✅ I subscribed'],
e_uname:['@username noto‘g‘ri','Неверный @username','Invalid @username'],e_gwgames:['Kamida {n} ta o‘yin o‘ynang','Нужно сыграть минимум {n} игр','Play at least {n} games'],e_gwsub:['Avval {ch} ga obuna bo‘ling','Сначала подпишитесь на {ch}','Subscribe to {ch} first'],
k_giveaway:['Konkurs','Розыгрыш','Giveaway'],k_lbprize:['Reyting sovrini','Приз рейтинга','Leaderboard prize'],
rules:['Qoidalar','Правила','Rules'],tokM:['💠 SPC','💠 SPC','💠 SPC'],tokT:['SPC tokeni','Токен SPC','SPC token'],tokS:['Bepul o‘ynash uchun o‘yin tokeni. Vazifa bajarib, kunlik bonus olib yig‘ing','Игровой токен для бесплатной игры. Фармите за задания и ежедневный бонус','Free-play token. Farm it with tasks and the daily bonus'],
tasks:['Vazifalar','Задания','Tasks'],tk_play:['Bugun 3 ta o‘yin o‘ynang','Сыграйте 3 игры сегодня','Play 3 games today'],tk_win:['Bugun 1 ta o‘yinda yuting','Выиграйте 1 игру сегодня','Win 1 game today'],tk_ref:['Do‘stingizni taklif qiling','Пригласите друга','Invite a friend'],tk_sub:['Kanalga obuna bo‘ling','Подпишитесь на канал','Subscribe to the channel'],
tkDaily:['har kuni','каждый день','daily'],tkOnce:['bir marta','один раз','once'],tokDaily:['Kunlik SPC','Ежедневные SPC','Daily SPC'],tokPlay:['SPC bilan o‘ynash','Играть на SPC','Play for SPC'],k_task:['Vazifa','Задание','Task'],
e_tbalance:['SPC yetarli emas — vazifalarni bajaring','Недостаточно SPC — выполните задания','Not enough SPC — complete tasks'],e_task:['Vazifa hali bajarilmagan','Задание ещё не выполнено','Task not completed yet'],winsTo:['G‘alabalar soni','Сколько побед','Wins needed'],kicksL:['Har biriga zarbalar','Ударов каждому','Kicks each'],lvlN:['{n}-daraja','{n} уровень','Level {n}'],ref3:['3 darajali referal','3-уровневая рефералка','3-level referral'],fee:['komissiya','комиссия','fee']};
const t=k=>(D[k]||[k,k,k])[LI[lang]];
/* ======================= o'yinlar katalogi */
const GM={
bj:{n:['21 (Ochko)','21 (Очко)','Blackjack 21'],s:['Kartalar · 21 ga yaqin','Карты · ближе к 21','Cards · closest to 21'],a:'#22c55e',ic:'🂡',cat:'card',wide:1,r:['Ikkalangizga 2 tadan karta. «Yana» yoki «Yetarli». 21 dan oshsa — yutqazdingiz. 21 ga yaqini yutadi.','Обоим по 2 карты. «Ещё» или «Хватит». Перебор больше 21 — проигрыш. Ближе к 21 — победа.','Two cards each. Hit or stand. Over 21 loses, closest to 21 wins.']},
pen:{n:['Penalti','Пенальти','Penalty'],s:['1–5 zarba · futbol','1–5 ударов · футбол','1–5 kicks · football'],a:'#16a34a',ic:'⚽',cat:'fast',wide:1,r:['Navbat bilan penalti (xona egasi 1–5 zarba tanlaydi). Zarbachi burchak tanlaydi, darvozabon sakraydi. Ko‘p gol urgan yutadi.','Пенальти по очереди (создатель комнаты выбирает 1–5 ударов). Бьющий выбирает угол, вратарь прыгает. Кто забил больше — победил.','Penalties in turns (room creator picks 1–5 kicks). Kicker picks a corner, keeper dives. Most goals wins.']},
durak:{n:['Durak','Дурак','Durak'],s:['24/36 karta · podkidnoy/perevodnoy','24/36 карт · подкидной/переводной','24/36 cards · classic/transfer'],a:'#ff3b5c',ic:'🃏',cat:'card',wide:1,r:['Kartalarni birinchi bo‘lib tugatgan yutadi. Hujumchi karta tashlaydi, himoyachi kattaroq yoki kozir bilan uradi.','Побеждает тот, кто первым избавится от карт. Атакующий подкидывает, защищающийся бьёт старшей картой или козырем.','First to get rid of all cards wins. Attacker throws, defender beats with higher or trump.']},
nardy:{n:['Nardi','Нарды','Backgammon'],s:['Uzun nardi · 1 vs 1','Длинные нарды · 1 на 1','Long nardy · 1 vs 1'],a:'#ff9a3d',ic:'🎲',cat:'board',wide:1,r:['Uzun nardi: 15 ta shashkani uyga olib kirib, birinchi chiqargan yutadi. Raqib turgan joyga qo‘yib bo‘lmaydi.','Длинные нарды: проведите 15 шашек в дом и выбросите первым. Нельзя ставить на пункт соперника.','Long nardy: bring 15 checkers home and bear off first. You can’t land on opponent’s point.']},
dice:{n:['Zar','Кости','Dice'],s:['1–5 g‘alaba · tezkor','До 1–5 побед · быстро','First to 1–5 · instant'],a:'#38d9ff',ic:'🎲',cat:'fast',r:['Ikkalangiz 2 ta zar tashlaysiz — yig‘indisi katta bo‘lgan raundni oladi. Xona egasi tanlagan g‘alabalar soniga (1–5) birinchi yetgan yutadi.','Оба бросают 2 кубика — у кого сумма больше, тот берёт раунд. Игра до 1–5 побед — выбирает создатель комнаты.','Both roll 2 dice — higher sum takes the round. First to 1–5 wins (room creator picks).']},
rps:{n:['Tosh-qaychi','Камень-ножницы','Rock-Paper'],s:['1–5 g‘alaba · blef','До 1–5 побед · блеф','First to 1–5 · bluff'],a:'#a855f7',ic:'✊',cat:'fast',r:['Tosh qaychini, qaychi qog‘ozni, qog‘oz toshni yutadi. 1–5 g‘alabagacha (xona egasi tanlaydi).','Камень бьёт ножницы, ножницы — бумагу, бумага — камень. До 1–5 побед (выбирает создатель).','Rock beats scissors, scissors beat paper, paper beats rock. First to 1–5 (creator picks).']},
coin:{n:['Tanga','Монетка','Coin flip'],s:['50/50 · 1 tashlash','50/50 · один бросок','50/50 · one flip'],a:'#ffc83d',ic:'🪙',cat:'fast',r:['Bitta tashlash: Burgut yoki Raqam. Tomoningiz tushsa — bank sizniki.','Один бросок: Орёл или Решка. Выпала ваша сторона — банк ваш.','One flip: Heads or Tails. Your side wins the pot.']},
hilo:{n:['Katta/Kichik','Больше/Меньше','Hi-Lo'],s:['5 savol · intuitsiya','5 вопросов · интуиция','5 guesses · intuition'],a:'#2ee59d',ic:'🂠',cat:'card',r:['Keyingi karta kattami yoki kichikmi? 5 savoldan ko‘p topgan yutadi.','Следующая карта больше или меньше? Из 5 угадавший больше — побеждает.','Higher or lower? Most correct of 5 wins.']},
chess:{n:['Shaxmat','Шахматы','Chess'],a:'#8b7bff',ic:'♟',cat:'board',r:['Klassik shaxmat. Mot — g‘alaba.','Классические шахматы. Мат — победа.','Classic chess. Checkmate wins.']},
checkers:{n:['Shashka','Шашки','Checkers'],a:'#ff9a3d',ic:'⛀',cat:'board',r:['Urish majburiy. Raqib shashkalarini yo‘q qiling.','Бить обязательно. Уничтожьте шашки соперника.','Capturing is mandatory.']},
connect4:{n:['4 qator','4 в ряд','Connect 4'],a:'#ff3d9a',ic:'🔴',cat:'board',r:['4 ta bir qatorga — g‘alaba.','Соберите 4 в ряд.','Line up 4.']},
gomoku:{n:['Gomoku','Гомоку','Gomoku'],a:'#22d3ee',ic:'⚫',cat:'board',r:['5 ta bir qatorga.','Соберите 5 в ряд.','Line up 5.']},
reversi:{n:['Reversi','Реверси','Reversi'],a:'#2ee59d',ic:'⚪',cat:'board',r:['Raqib toshlarini o‘raб aylantiring. Ko‘pi yutadi.','Окружайте и переворачивайте фишки соперника.','Flank and flip. Most discs wins.']},
ttt:{n:['Krestik-nolik','Крестики-нолики','Tic-Tac-Toe'],a:'#fbbf24',ic:'❌',cat:'board',r:['3 ta bir qatorga.','Три в ряд.','Three in a row.']}};
const WINS={dice:2,rps:2,pen:5},cu=c=>c==='tok'?' 💠':' ⭐';
function wTxt(g,n){n=+n;if(g==='pen')return lang==='ru'?`${n} ${n===1?'удар':n<5?'удара':'ударов'}`:lang==='uz'?`${n} ta zarba`:`${n} kick${n>1?'s':''}`;
 return lang==='ru'?`до ${n} ${n===1?'победы':'побед'}`:lang==='uz'?`${n} g‘alabagacha`:`first to ${n}`}
const RL=()=>[CFG.ref1??.03,CFG.ref2??.02,CFG.ref3??.01],pct=x=>+((+x||0)*100).toFixed(1)+'%',refTxt=()=>RL().map(pct).join(' · '),refSum=()=>pct(RL().reduce((a,b)=>a+(+b||0),0));
const wTag=r=>r.opts&&r.opts.w&&WINS[r.g]?`<span class="tag v">${wTxt(r.g,r.opts.w)}</span>`:'';
const SERVER_BOT={durak:1,nardy:1,dice:1,rps:1,coin:1,hilo:1,bj:1,pen:1},QK={dice:1,rps:1,coin:1,hilo:1,bj:1,pen:1};
const gn=g=>g==='jackpot'?t('jp'):g==='arena'?'Arena':(GM[g]?GM[g].n[LI[lang]]:g);
const ART={bj:'<div class="art a-bj"><i>A♠</i><i>K♥</i><b>21</b></div>',pen:'<div class="art a-pn"><u>🧤</u><i>⚽</i></div>',arena:'<div class="art a-ar"><div class="ar-mini"><i></i><i></i><i></i><i></i><u></u></div></div>',durak:'<div class="art a-dk">'+[['-30deg','A♠',0],['0deg','K♥',1],['30deg','Q♦',2]].map(([r,x,k])=>`<i class="${k?'rd':''}" style="--r:${r};--k:${k}">${x}</i>`).join('')+'</div>',
nardy:'<div class="art a-nd">'+[0,1,2,3,4,5].map(i=>`<i class="tri" style="left:${4+i*14}px;top:4px;background:${i%2?'#e9d3a8':'#8b1e1e'}"></i><i class="tri b" style="left:${4+i*14}px;background:${i%2?'#8b1e1e':'#e9d3a8'}"></i>`).join('')+'<i class="ck" style="left:6px;top:6px;--x:40px;--y:0px"></i><i class="ck d" style="left:62px;top:66px;--x:-40px;--y:0px"></i><i class="dc">5</i></div>',
chess:'<div class="art a-ch"><i>♞︎</i><u></u><b></b></div>',checkers:'<div class="art a-ck"><i class="z"></i><i class="y"></i><i class="x"></i></div>',
connect4:'<div class="art a-c4">'+Array.from({length:16},(_,i)=>{const f={5:['r',0],6:['y',.5],9:['y',1],10:['r',1.5],13:['r',2],14:['y',2.5]}[i];return f?`<i class="f ${f[0]}" style="--w:${f[1]}s"></i>`:'<i></i>'}).join('')+'</div>',
gomoku:'<div class="art a-gk">'+[0,1,2,3,4].map(i=>`<i style="--i:${i}"></i>`).join('')+[0,1,2].map(i=>`<i class="k" style="--i:${i}"></i>`).join('')+'</div>',
reversi:'<div class="art a-rv"><i style="--i:0"></i><i style="--i:1"></i><i style="--i:2"></i><i style="--i:3"></i></div>',
ttt:'<div class="art a-tt">'+['x','o','x','','x','o','o','','x'].map((v,i)=>`<i class="${v}" style="--i:${i}">${v==='x'?'✕':v==='o'?'◯':''}</i>`).join('')+'</div>',
dice:'<div class="art a-di">'+[[5,6,10],[3,46,40]].map(([n,x,y],k)=>`<div class="die" style="position:absolute;left:${x}px;top:${y}px;width:40px;height:40px;animation:dic 2.4s ease-in-out infinite ${k*-.9}s">${Array.from({length:9},(_,i)=>[[0,2,4,6,8],[0,4,8]][k].includes(i)?'<i></i>':'<span></span>').join('')}</div>`).join('')+'</div>',
rps:'<div class="art a-rp"><i style="--i:0">✊</i><i style="--i:1">✌️</i><i style="--i:2">✋</i></div>',
coin:'<div class="art a-cn"><i>₿</i></div>',hilo:'<div class="art a-hl"><i>7♠</i><i>K♥</i><u>⇅</u></div>',
jackpot:'<div class="art a-jp"><i></i><u></u></div>'};
/* ======================= ikonkalar: haqiqiy Telegram Star va TON */
const SI='<svg class="si" viewBox="0 0 24 24"><path fill="url(#sgold)" stroke="#d97706" stroke-width=".6" d="M12 1.9c.46 0 .88.26 1.08.67l2.63 5.33 5.88.86c.99.14 1.38 1.36.67 2.05l-4.26 4.15 1 5.86c.17.98-.86 1.73-1.74 1.27L12 19.32l-5.26 2.77c-.88.46-1.91-.29-1.74-1.27l1-5.86-4.26-4.15c-.71-.69-.32-1.91.67-2.05l5.88-.86 2.63-5.33c.2-.41.62-.67 1.08-.67z"/><path fill="#fff" opacity=".5" d="M12 4.4 10.3 8l-3.9.6 1.6 1.4c1.2-.9 2.6-1.3 4-1.4z"/></svg>';
const TI='<svg class="ti" viewBox="0 0 56 56"><circle cx="28" cy="28" r="28" fill="#0098EA"/><path fill="#fff" d="M37.56 15.63H18.44c-3.52 0-5.75 3.8-3.98 6.86l11.8 20.45c.77 1.34 2.7 1.34 3.47 0l11.8-20.45c1.77-3.06-.46-6.86-3.97-6.86zM26.25 36.8l-2.57-4.97-6.2-11.09c-.41-.71.1-1.62.96-1.62h7.8v17.68zm12.27-16.07-6.2 11.1-2.57 4.97V19.12h7.8c.86 0 1.37.9.97 1.61z"/></svg>';
const ICO={'⭐':SI,'💎':TI},IRX=/⭐|💎/;
function iconize(root){if(!root||!root.ownerDocument&&root!==document)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>IRX.test(n.nodeValue)&&n.parentNode&&!n.parentNode.closest('script,style,textarea,title,option')?1:2});const ns=[];while(w.nextNode())ns.push(w.currentNode);
 for(const n of ns){const f=document.createElement('span');f.innerHTML=esc(n.nodeValue).replace(/⭐|💎/g,m=>ICO[m]);n.replaceWith(...f.childNodes)}}
new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData'){if(IRX.test(m.target.nodeValue)&&m.target.parentNode)iconize(m.target.parentNode);continue}for(const n of m.addedNodes){if(n.nodeType===3){if(IRX.test(n.nodeValue)&&n.parentNode)iconize(n.parentNode)}else if(n.nodeType===1)iconize(n)}}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
const fmtK=n=>{n=+n||0;return Math.abs(n)>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':Math.abs(n)>=1e4?(n/1e3).toFixed(1).replace(/\.0$/,'')+'k':fmt(n)};
const AVC=['linear-gradient(135deg,#ff8a1a,#ff2e63)','linear-gradient(135deg,#a855f7,#6366f1)','linear-gradient(135deg,#38d9ff,#2563eb)','linear-gradient(135deg,#2ee59d,#0d9488)','linear-gradient(135deg,#ffc83d,#f97316)','linear-gradient(135deg,#f472b6,#a855f7)'];
const avc=s=>AVC[[...String(s||'?')].reduce((a,c)=>a+c.charCodeAt(0),0)%AVC.length];
const avH=(name,ph,cls='')=>`<span class="avx ${cls}" style="background:${avc(name)}"><b>${esc([...(name||'?')][0].toUpperCase())}</b>${ph?`<img src="${esc(ph)}" loading="lazy" onerror="this.remove()">`:''}</span>`;
const SVGI={back:'<svg viewBox="0 0 24 24"><path d="m15 5-7 7 7 7"/></svg>',clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',info:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
 snd:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',mute:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',share:'<svg viewBox="0 0 24 24"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>'};
/* ======================= holat */
let TASKS=null,ws,U={tok:0,star:0,games:0,wins:0,refs:0,ref_earn:0,wallet:'',photo:''},CFG={stakes:[10,25,50,100,250,500],fee:.1,ref:.05,rate:200,games_off:[],hot:[],bot_mode:1,free_pvp:0,min_wd:500,wd_fee:0,daily:0,jp_min:10,jp_time:30,arena_tiers:[50,200],arena_time:25,lb_prizes:[],lb_period:'week',lb_metric:'profit',wd_star:1,min_wd_star:100,min_dep_star:1,min_dep_ton:.1};
const SEENR=new Set();let CFGJ='',LBC={},LBSIG='',myUid='',BOT='',G=null,SH=null,ONL=0,LASTQ=null,ROOMS=[],LIVE=[],NLIVE=0,POTSUM={},PS=null,PKEY=null,WANTPRIV=0,MYROOM=null,CUR='home',RF='',GC='all',LBQ=null,WT='dep',DM='star',WM='ton',BONUS=null,WDS=[],HIST=[],FEED=[],GWS=[],TG='top';
const myName=()=>tg?.initDataUnsafe?.user?.first_name||'Player',myPhoto=()=>U.photo||tg?.initDataUnsafe?.user?.photo_url||'';
const gid=LS.get('gid',null)||(()=>{const v=Math.random().toString(36).slice(2,12);LS.set('gid',v);return v})();
const S=o=>{if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))};
const qp=new URLSearchParams(location.search),sp=tg?.initDataUnsafe?.start_param||'';
const ROOMQ=qp.get('room')||(sp.match(/room_([0-9a-f]+)/)||[])[1]||'',REFQ=qp.get('ref')||(sp.match(/ref_([A-Za-z0-9]+)/)||[])[1]||'';
const ARENAQ=qp.get('arena')||(sp.match(/arena_([0-9a-f]+)/)||[])[1]||'';let BONUSQ=qp.get('bonus')||(sp.match(/bonus_([A-Za-z0-9]+)/)||[])[1]||'';
function connect(){ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');
 ws.onopen=()=>{S({t:'hello',uid:gid,name:myName(),init:tg?.initData||'',ref:REFQ,room:ROOMQ,arena:ARENAQ,bonus:BONUSQ});BONUSQ='';if(PKEY)S({t:'pot',key:PKEY})};
 ws.onclose=()=>{ONL=-1;chips();setTimeout(connect,2000)};ws.onmessage=e=>onMsg(JSON.parse(e.data))}
const lvlOf=u=>{const xp=(u.games||0)*10+(u.wins||0)*20,l=Math.floor(Math.sqrt(xp/50))+1,a=50*(l-1)**2,b=50*l*l;return{l,xp,p:Math.round((xp-a)/(b-a)*100),next:b}};
const toTon=s=>(+s||0)/(CFG.rate||200);
function onMsg(m){switch(m.t){
 case'me':{const old=U.star;if(m.user)U=m.user;if(m.uid)myUid=m.uid;if('bot'in m)BOT=m.bot;if('notice'in m)notice(m.notice);let cfgCh=false;if(m.cfg){const js=JSON.stringify(m.cfg);cfgCh=js!==CFGJ;CFGJ=js;CFG=m.cfg;if(!LBQ)LBQ={per:CFG.lb_period,by:CFG.lb_metric}}if('online'in m)ONL=m.online;chips(old);if(cfgCh)redraw();if($('#pot').classList.contains('on'))potBal();break}
 case'cfg':CFG=m.cfg;chips();redraw();break;
 case'rate':CFG.rate=m.rate;chips();break;
 case'online':ONL=m.n;chips();break;
 case'err':if(SH&&SH.q){SH.q=0;drawSheet()}if(['gone','cancel','admin'].includes(m.code)){MYROOM=null;if(SH&&SH.wait){SH.wait=null;drawSheet()}}
  toast('⚠️ '+esc(t('e_'+m.code)).replace('{n}',m.n||'').replace('{ch}',esc(m.ch||'')));SFX.error();break;
 case'notice':notice(m.text,m.pop);break;
 case'banned':document.body.innerHTML='<div style="padding:40vh 24px;text-align:center;font:700 18px Unbounded,system-ui;color:#fff">⛔ Banned</div>';break;
 case'rooms':ROOMS=m.list;LIVE=m.live;NLIVE=m.nlive;if(m.online)ONL=m.online;if(CUR==='home')drawRoomsOnly();break;
 case'wait':MYROOM=m.room.id;if(!SH||SH.g!==m.room.g)sheet(m.room.g);SH.wait=m.room;SH.q=0;drawSheet();SFX.whoosh();break;
 case'invite':showInvite(m.room);break;
 case'start':MYROOM=null;startGame(m);break;
 case'move':recv(m.d);break;
 case'dv':if(G&&G.g==='durak')renderDk(m);break;
 case'nv':if(G&&G.g==='nardy')renderNd(m);break;
 case'qv':if(G&&QK[G.g])renderQ(m);break;
 case'chat':fly(m.text,m.from===G?.seat);SFX.pop();break;
 case'opp_left':if(G&&!G.over){G.over=1;G.w=G.seat;bars()}toast(t('left'));break;
 case'paid':paid(m);break;
 case'lb':{const k=m.per+'|'+m.by,js=JSON.stringify(m);LBC[k]=m;const q=lbq();if(q.per===m.per&&(q.by===m.by||!['profit','dep','ref'].includes(q.by))&&js!==LBSIG){LBSIG=js;drawTop(m)}break}
 case'dep':depRes(m);break;
 case'pots':POTSUM=m.sum;if(CUR==='home'){drawLiveCards();drawBanners(1)}break;
 case'pot':if(m.priv&&WANTPRIV&&m.key!==PKEY){WANTPRIV=0;PKEY=m.key;PS=m;drawPot(true);break}if(m.open){openPot(m.key)}if(m.key===PKEY){PS=m;drawPot()}break;
 case'betok':SFX.coin();hap('medium');break;
 case'feedall':FEED=m.list||[];drawTicker();break;
 case'feed':FEED.unshift(m.item);FEED=FEED.slice(0,30);drawTicker();break;
 case'gws':GWS=m.list||[];if(CUR==='me'&&!document.activeElement?.matches('input'))drawMe();if(CUR==='home')drawBanners(1);break;
 case'gwok':SFX.coin();toast('✅ '+t('gwIn'));break;
 case'gwdone':toast('🎉 '+esc(m.title)+': '+(m.names||[]).map(esc).join(', '));S({t:'gws'});break;
 case'bonus':BONUS=m;if(CUR==='me'&&!document.activeElement?.matches('input'))drawMe();break;
 case'gift':giftFx(m.amt,m.why,m.cur);break;case'tasks':TASKS=m;if(CUR==='me'&&!document.activeElement?.matches('input'))drawMe();break;
 case'wds':WDS=m.list;if(CUR==='wallet'&&WT==='wd')drawWallet();break;
 case'hist':HIST=m.list;if(CUR==='wallet'&&WT==='hist')drawWallet();break;
 case'wdok':toast('✅ '+t('wdOk'));SFX.win();break;
 case'needsub':showSub(m.ch);break;
 case'subok':$('#res').classList.remove('on');toast('✅');SFX.win();break}}
function showSub(ch){$('#res').classList.add('on');$('#resc').innerHTML=`<div class="trophy" style="font-size:56px">📢</div><div class="rt" style="font-size:20px">${t('subT')}</div><p style="color:var(--mu);margin-bottom:12px">${t('subS')}</p>${ch.map(c=>`<button class="btn" data-chan="${esc(c.url)}">📢 ${esc(c.name)}</button>`).join('')}<button class="btn go" id="subchk">${t('subCheck')}</button>`}
function notice(x,pop){if(pop){toast('📢 '+esc(x));SFX.pop();return}const n=$('#notice');n.textContent=x||'';n.style.display=x?'block':'none'}
function toast(x){$$('.toast').forEach(e=>e.remove());const d=document.createElement('div');d.className='toast';d.innerHTML=x;document.body.appendChild(d);setTimeout(()=>d.remove(),2800)}
function fly(x,mine){const d=document.createElement('div');d.className='fly';d.textContent=x;d.style.left=(mine?'22%':'68%');document.body.appendChild(d);setTimeout(()=>d.remove(),1600)}
let shownStar=0;
function chips(old){const L=lvlOf(U),ph=myPhoto();$('#hnm').textContent=myName();$('#avl').innerHTML=esc(myName()[0].toUpperCase())+(ph?`<img src="${esc(ph)}" onerror="this.remove()">`:'');$('#lv').textContent=L.l;$('#ava').style.setProperty('--p',L.p);
 $('#onl').innerHTML=ONL<0?t('conn'):`<i class="ldot"></i>${fmt(ONL)} ${t('online')}`;$('#ct').textContent=fmt(toTon(U.star).toFixed(2));
 const to=+U.star||0,from=shownStar,el=$('#cs');if(Math.abs(to-from)>.001){const bp=$('.balp');bp.classList.remove('bump');void bp.offsetWidth;if(old!==undefined&&to>from){bp.classList.add('bump');SFX.coin()}
  const t0=performance.now(),f=n=>{const k=Math.min(1,(n-t0)/800),v=from+(to-from)*(1-Math.pow(1-k,3));el.textContent=fmt(Math.round(v*100)/100);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f);shownStar=to}
 else el.textContent=fmt(to);
 if(CUR==='wallet'&&WT!=='hist'&&!document.activeElement?.matches('input'))drawWallet();if(CUR==='me'&&!document.activeElement?.matches('input'))drawMe()}
/* ======================= navigatsiya */
const NAV=[['home','<path d="M3 11 12 3l9 8M5 9.5V20h5v-6h4v6h5V9.5"/>'],['games','<rect x="2" y="7" width="20" height="11" rx="4"/><path d="M7 10v5M4.5 12.5h5"/><circle cx="16" cy="11" r=".6"/><circle cx="18" cy="14" r=".6"/>'],['top','<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>'],['wallet','<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="16.5" cy="13.5" r="1"/>'],['me','<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>']];
function drawNav(cur){const dot=(CFG.daily&&BONUS&&!BONUS.next)||GWS.some(g=>g.status==='active'&&!g.joined);
 $('#nav').innerHTML=NAV.map(([v,i])=>`<button data-v="${v}" class="${v===cur?'on':''}"><svg viewBox="0 0 24 24">${i}</svg><span>${t(v)}</span>${v==='me'&&dot?'<i class="dotb"></i>':''}</button>`).join('')}
let STILLT=null;function show(v){if(v==='bonus')v='me';CUR=v;$$('section').forEach(s=>{s.classList.toggle('on',s.id==='v-'+v);s.classList.remove('still')});clearTimeout(STILLT);STILLT=setTimeout(()=>{const e=$('#v-'+v);if(e)e.classList.add('still')},700);drawNav(v);window.scrollTo({top:0});
 if(v==='home'){drawHome();S({t:'rooms'})}if(v==='games')drawGames();if(v==='wallet'){drawWallet();loadTC();if(WT!=='dep')S({t:WT==='wd'?'wds':'hist'})}if(v==='top'){drawTop(null);S({t:'lb',...lbq()})}if(v==='me'){drawMe();S({t:'bonus'});S({t:'gws'});S({t:'tasks'})}hap();SFX.tap()}
function redraw(){if(CUR==='home')drawHome();if(CUR==='games')drawGames();if(CUR==='wallet')drawWallet();if(CUR==='me')drawMe();drawNav(CUR)}
const enabled=g=>!(CFG.games_off||[]).includes(g),isHot=g=>(CFG.hot||[]).includes(g),lbq=()=>LBQ||{per:CFG.lb_period||'week',by:CFG.lb_metric||'profit'};
const arenaKey=()=>'arena:'+(+((CFG.arena_tiers||[50])[0])).toString();
/* ======================= ASOSIY */
function gameCard(g,i,wide){const o=GM[g];return`<button class="game ${wide&&o.wide?'wide':''}" style="--g1:${o.a};--n:${i}" data-g="${g}">${isHot(g)?`<span class="nw">🔥 HOT</span>`:''}${ART[g]}${wide&&o.wide?`<div class="tx"><b>${gn(g)}</b><small>${o.s?o.s[LI[lang]]:'1 vs 1'}</small></div>`:`<b>${gn(g)}</b><small>${o.s?o.s[LI[lang]]:'1 vs 1'}</small>`}</button>`}
function drawHome(){const gs=Object.keys(GM).filter(enabled);
 $('#v-home').innerHTML=`<div class="car" id="car"></div><div class="cdots" id="cdots"></div>
 <div class="tk" id="tick"></div>
 <div class="duo" id="duo"></div>
 <button class="hero" data-pick="quick"><div class="ic">⚡</div><div class="tx"><small>★ ${t('rec')}</small><b>${t('quick')}</b><p>${t('quickS')}</p></div><div class="ar">›</div></button>
 <div class="tiles"><button class="tile" style="--n:1;--tg:#ff6a1a" data-pick="create"><div class="ti">➕</div><b>${t('create')}</b><small>${t('createS')}</small></button>
 <button class="tile" style="--n:2;--tg:#2ee59d" id="livebtn"><em id="nlive">${NLIVE}</em><div class="ti">🎮</div><b>${t('active')}</b><small>${t('activeS')}</small></button></div>
 <div class="card lob" style="margin-top:12px;--n:3"><h2>🚪 ${t('lobbies')}<span class="r" id="nrooms"></span></h2><div class="chips" style="padding:0 4px 2px" id="rfil"></div><div id="rlist"></div></div>
 <h2>🎮 ${t('allGames')}<button class="r lnk" data-v="games">${t('all')} ›</button></h2>
 <div class="g3">${[...(enabled('arena')?['arena']:[]),...(enabled('jackpot')?['jackpot']:[]),...gs].map((g,i)=>{const o=GM[g]||(g==='arena'?{a:'#22c55e',ic:'🟢'}:{a:'#a855f7',ic:'🎡'});return`<button class="gt" style="--ga:${o.a};--n:${i}" ${g==='arena'?`data-pot="${arenaKey()}"`:g==='jackpot'?'data-pot="jackpot"':`data-g="${g}"`}>${isHot(g)?'<em>HOT</em>':''}<span class="gti">${o.ic}</span><b>${gn(g)}</b></button>`}).join('')}</div>
 <button class="tile reft" data-v="me"><div class="ti" style="margin:0">👥</div><div style="flex:1"><b>${t('refT')} · ${refTxt()}</b><small>${t('refS')}</small></div><span style="font-size:20px">›</span></button>`;
 drawBanners();drawTicker();drawLiveCards();drawRoomsOnly()}
let CARI=0,CART=null;
function drawBanners(soft){const c=$('#car');if(!c)return;const ar=Object.entries(POTSUM).filter(([k])=>k.startsWith('arena:')).reduce((a,[,v])=>a+v.pot,0),jp=(POTSUM.jackpot||{}).pot||0,gw=GWS.find(g=>g.status==='active');
 const sl=[];if(CFG.rc_on)sl.push(`<button class="bn bn-rc" data-rc="1"><div class="bnt"><small>👥 ${t('rcT')}</small><b>${t('rcB')}</b><p>${t('rcF')}: <span class="rcv">${fmt(CFG.rc_prize||0)} ⭐</span>${CFG.rc_end?` · ⏱ <span data-rcl>${fmtLeft(CFG.rc_end-Date.now()/1000)}</span>`:''}</p><span class="bnb">${t('rcGo')} ›</span></div><div class="bna rc-mini"><svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="rcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset=".5" stop-color="#ffc83d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs><path d="M18 8h28v6h8c0 10-5 17-13 18-2 5-5 8-7 9v7h8v6H22v-6h8v-7c-2-1-5-4-7-9-8-1-13-8-13-18h8zm-3 12c1 5 3 8 5 9l-1-9zm34 0h-4l-1 9c2-1 4-4 5-9z" fill="url(#rcg)" stroke="#b45309" stroke-width="1.2"/><path d="M32 16l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" fill="#fff" opacity=".9"/></svg><em>${fmtK(CFG.rc_prize||0)}</em></div></button>`);if(enabled('arena'))sl.push(`<button class="bn bn-ar" data-pot="${arenaKey()}"><div class="bnt"><small>🟢 ARENA · LIVE</small><b>${t('bnArena')}</b><p>${t('pot')}: ${fmtK(ar)} ⭐</p><span class="bnb">${t('playNow')} ›</span></div><div class="bna ar-mini"><i></i><i></i><i></i><i></i><u></u></div></button>`);
 if(enabled('jackpot'))sl.push(`<button class="bn bn-jp" data-pot="jackpot"><div class="bnt"><small>🎡 JACKPOT</small><b>${t('bnJp')}</b><p>${t('pot')}: ${fmtK(jp)} ⭐</p><span class="bnb">${t('playNow')} ›</span></div><div class="bna"><div class="jpw-mini"></div></div></button>`);
 if(gw)sl.push(`<button class="bn bn-gw" data-v="me"><div class="bnt"><small>🎉 ${t('gw').toUpperCase()}</small><b>${esc(gw.title)}</b><p>${fmtK(gw.prize)} ⭐ × ${gw.winners} · ${gw.n} ${t('partic')}</p><span class="bnb">${gw.joined?'✓ '+t('gwIn'):t('gwJoin')} ›</span></div><div class="bna gift3">🎁</div></button>`);
 if((CFG.lb_prizes||[]).length)sl.push(`<button class="bn bn-lb" data-v="top"><div class="bnt"><small>🏆 ${t('lbPr')}</small><b>${t('lbPrS')}</b><p>🥇 ${fmtK(CFG.lb_prizes[0])} ⭐ ${CFG.lb_prizes[1]?'· 🥈 '+fmtK(CFG.lb_prizes[1])+' ⭐':''}</p><span class="bnb">${t('top')} ›</span></div><div class="bna cup3">🏆</div></button>`);
 sl.push(`<button class="bn bn-rf" data-v="me"><div class="bnt"><small>👥 ${t('refT').toUpperCase()}</small><b>${refSum()} ${t('bnRef')}</b><p>${t('ref3')}: ${refTxt()}</p><span class="bnb">${t('invite')} ›</span></div><div class="bna pc3">${refSum()}</div></button>`);
 const sx=c.scrollLeft;c.innerHTML=sl.join('');$('#cdots').innerHTML=sl.map((_,i)=>`<i class="${i===CARI%sl.length?'on':''}"></i>`).join('');if(soft)c.scrollLeft=sx;
 c.onscroll=()=>{const i=Math.round(c.scrollLeft/c.clientWidth);if(i!==CARI){CARI=i;$$('#cdots i').forEach((d,k)=>d.classList.toggle('on',k===i))}};
 clearInterval(CART);CART=setInterval(()=>{const c=$('#car');if(!c||CUR!=='home'||document.hidden)return;const n=c.children.length;if(!n)return;CARI=(CARI+1)%n;c.scrollTo({left:CARI*c.clientWidth,behavior:'smooth'})},5000)}
function drawTicker(){const e=$('#tick');if(!e)return;if(!FEED.length){e.style.display='none';return}e.style.display='';
 const it=FEED.slice(0,14).map(f=>`<span class="ti2">${avH(f.name,f.ph,'xs')}<b>${esc(f.name)}</b><em>+${fmtK(f.prize)} ⭐</em><small>${(GM[f.g]||{ic:f.g==='arena'?'🟢':'🎡'}).ic} ${gn(f.g)}</small></span>`).join('');
 e.innerHTML=`<div class="tkr" style="animation-duration:${Math.max(18,FEED.slice(0,14).length*5)}s">${it}${it}</div>`}
let LVH='';function drawLiveCards(){const e=$('#duo');if(!e)return;const _o=e.innerHTML;const ars=Object.entries(POTSUM).filter(([k])=>k.startsWith('arena:')),ap=ars.reduce((a,[,v])=>a+v.pot,0),an=ars.reduce((a,[,v])=>a+v.n,0),ac=ars.find(([,v])=>v.st!=='wait'),j=POTSUM.jackpot||{pot:0,n:0,st:'wait'};
 const st=v=>v.st==='count'?`⏱ ${Math.ceil(v.left)}s`:v.st==='spin'?'🎯 '+t('spinning'):t('waiting');
 const html=(enabled('arena')?`<button class="lv lv-ar" data-pot="${ac?ac[0]:arenaKey()}"><div class="lvh"><b>ARENA</b><span class="live"><i class="ldot"></i>LIVE</span></div><div class="ar-mini sm"><i></i><i></i><i></i><i></i><u></u></div><div class="lvp">${fmtK(ap)} ⭐</div><small>${an} ${t('players').toLowerCase()} · ${ac?st(ac[1]):t('waiting')}</small></button>`:'')+
 (enabled('jackpot')?`<button class="lv lv-jp" data-pot="jackpot"><div class="lvh"><b>JACKPOT</b><span class="live"><i class="ldot"></i>LIVE</span></div><div class="jpw-mini sm"></div><div class="lvp">${fmtK(j.pot)} ⭐</div><small>${j.n} ${t('players').toLowerCase()} · ${st(j)}</small></button>`:'');if(html!==LVH||!e.children.length){LVH=html;e.innerHTML=html}else{const sm=e.querySelectorAll('small');}}
function drawRoomsOnly(){const f=$('#rfil'),l=$('#rlist');if(!f||!l)return;const gs=[...new Set(ROOMS.map(r=>r.g))];const nr=$('#nrooms');if(nr)nr.innerHTML=`<i class="ldot" style="display:inline-block;margin-right:5px"></i>${fmt(ROOMS.length)}`;
 f.innerHTML=`<button class="chip ${!RF?'on':''}" data-rf="">${t('all')}</button>`+gs.map(g=>`<button class="chip ${RF===g?'on':''}" data-rf="${g}">${GM[g]?.ic||''} ${gn(g)}</button>`).join('');
 const lst=ROOMS.filter(r=>!RF||r.g===RF);let ni=0;
 l.innerHTML=lst.length?lst.slice(0,30).map(r=>{const o=GM[r.g]||{a:'#888',ic:'🎮'},mine=r.id===MYROOM;const nw=!SEENR.has(r.id);SEENR.add(r.id);
  return`<div class="rm" style="${nw?'--n:'+(ni++):'animation:none'};--ga:${o.a}"><div class="gi">${o.ic}</div><div class="g"><b>${esc(r.host)} <small>· ${t('lvl')} ${r.hl}</small></b><div class="tags"><span class="tag ${r.stake?'f':''}">${r.stake?fmt(r.stake)+cu(r.cur):t('free')}</span><span class="tag">${gn(r.g)}</span><span class="tag">${r.n}/${r.max}</span>${r.opts&&r.opts.deck?`<span class="tag v">${r.opts.deck} ${t('cards')}</span><span class="tag c">${r.opts.tr?t('perev'):t('podk')}</span>`:''}${wTag(r)}</div></div>${mine?`<span class="tag g">${t('yours')}</span>`:`<button class="join" data-join="${r.id}">${t('enter')}</button>`}</div>`}).join(''):`<div class="empty"><i>🃏</i>${t('noRooms')}</div>`;
 const n=$('#nlive');if(n)n.textContent=NLIVE}
function liveSheet(){SH=null;$('#sh').classList.add('on');$('#shc').innerHTML=`<h3>🎮 ${t('active')} <span class="tag g">${NLIVE}</span></h3><div style="margin-top:12px">${LIVE.length?LIVE.map((x,i)=>`<div class="rm" style="--n:${i};--ga:${(GM[x.g]||{a:'#888'}).a}"><div class="gi">${(GM[x.g]||{ic:'🎮'}).ic}</div><div class="g"><b>${x.p.map(esc).join(' ⚔️ ')}</b><div class="tags"><span class="tag">${gn(x.g)}</span><span class="tag ${x.stake?'f':''}">${x.stake?fmt(x.stake)+cu(x.cur):t('free')}</span></div></div><i class="ldot"></i></div>`).join(''):`<div class="empty"><i>😴</i>—</div>`}</div><button class="ghost" data-close>OK</button>`;syncBack()}
function pickSheet(mode){SH=null;$('#sh').classList.add('on');const gs=Object.keys(GM).filter(enabled);
 $('#shc').innerHTML=`<h3>${mode==='quick'?'⚡ '+t('quick'):'➕ '+t('create')}</h3><div class="grid" style="margin-top:14px;grid-template-columns:repeat(3,1fr)">${gs.map((g,i)=>`<button class="opt" style="padding:14px 4px;animation:up .35s both;animation-delay:${i*30}ms" data-pg="${g}" data-pm="${mode}"><div style="font-size:30px">${GM[g].ic}</div><small style="font-size:11.5px;color:#fff">${gn(g)}</small></button>`).join('')}</div>`;syncBack()}
/* ======================= O'YINLAR */
function drawGames(){const cats=['all','card','board','fast'];const ks=Object.keys(GM).filter(g=>enabled(g)&&(GC==='all'||GM[g].cat===GC));
 $('#v-games').innerHTML=`<div class="chips" style="margin-bottom:12px">${cats.map(c=>`<button class="chip ${GC===c?'on':''}" data-gc="${c}">${t('cat_'+c)}</button>`).join('')}</div>
 ${GC==='all'||GC==='fast'?`${enabled('arena')?`<button class="game wide" style="--g1:#2ee59d;--n:0;width:100%;margin-bottom:10px" data-pot="${arenaKey()}">${isHot('arena')?'<span class="nw">🔥 HOT</span>':''}${ART.arena}<div class="tx"><b>Arena</b><small>${t('arenaS')} · ${fmtK(Object.entries(POTSUM).filter(([k])=>k.startsWith('arena:')).reduce((a,[,v])=>a+v.pot,0))} ⭐</small></div></button>`:''}
 ${enabled('jackpot')?`<button class="game wide" style="--g1:#a855f7;--n:1;width:100%;margin-bottom:10px" data-pot="jackpot">${isHot('jackpot')?'<span class="nw">🔥 HOT</span>':''}${ART.jackpot}<div class="tx"><b>${t('jp')}</b><small>${t('jpS')} · ${fmtK((POTSUM.jackpot||{}).pot)} ⭐</small></div></button>`:''}`:''}
 <div class="grid">${ks.map((g,i)=>gameCard(g,i+2,1)).join('')}</div>`}

/* ======================= sozlash oynasi */
let WANTTOK=0;function sheet(g,create){if(!enabled(g))return toast(t('e_off'));SH={g,mode:WANTTOK&&CFG.tok_on?'tok':'paid',st:CFG.stakes[0]||10,deck:36,tr:0,w:WINS[g]||0,tst:(CFG.tok_stakes||[10])[0],priv:0,q:0,wait:null,create:!!create};$('#sh').classList.add('on');WANTTOK=0;drawSheet();syncBack()}
function closeSheet(){if(SH&&(SH.q||SH.wait))S({t:'cancel'});MYROOM=null;closeSheetSilent()}
function closeSheetSilent(){SH=null;WANTTOK=0;$('#sh').classList.remove('on');syncBack()}
function drawSheet(){if(!SH)return;const o=GM[SH.g],m=SH.mode;
 if(SH.wait){const r=SH.wait,link=BOT?`https://t.me/${BOT}?start=room_${r.id}${myUid?'__ref_'+myUid:''}`:'';
  $('#shc').innerHTML=`<h3 style="justify-content:center">${o.ic} ${gn(SH.g)}</h3><div class="radar"><div class="sw"></div><div class="ct">${o.ic}</div></div>
  <div style="text-align:center"><b class="B" style="font-size:16px">${t('waitOpp')}<span class="dots"></span></b><div class="row" style="justify-content:center"><span class="tag ${r.stake?'f':''}">${r.stake?fmt(r.stake)+cu(r.cur):t('free')}</span>${r.opts.deck?`<span class="tag v">${r.opts.deck} ${t('cards')}</span><span class="tag c">${r.opts.tr?t('perev'):t('podk')}</span>`:''}${wTag(r)}${r.stake?`<span class="tag g">${t('prize')}: ${fmt(r.stake*2*(1-CFG.fee))}${cu(r.cur)}</span>`:''}</div></div>
  ${link?`<button class="btn" id="invl" data-l="${esc(link)}">📨 ${t('invite')}</button>`:''}<button class="ghost" id="cx">${t('cancel')}</button>`;return}
 const modes=[['paid','⭐ '+t('paid')]];if(CFG.bot_mode)modes.push(['bot','🤖 '+t('bot')]);if(CFG.free_pvp)modes.push(['free','🆓 '+t('free')]);if(CFG.tok_on)modes.push(['tok',t('tokM')]);
 $('#shc').innerHTML=`<div style="display:flex;align-items:center;gap:12px"><div style="transform:scale(.62);margin:-16px -14px -16px -18px">${ART[SH.g]}</div><div style="flex:1"><h3>${gn(SH.g)}</h3><small>${o.s?o.s[LI[lang]]:'1 vs 1'}</small></div><button class="chip" id="rulesb">📖 ${t('rules')}</button></div>
 <div id="rulesx" class="note" style="display:${SH.rules?'block':'none'};word-break:normal;color:var(--mu)">${o.r[LI[lang]]}</div>
 ${modes.length>1?`<div class="seg" style="margin-top:14px">${modes.map(([k,l])=>`<button class="${m===k?'on':''}" data-mode="${k}">${l}</button>`).join('')}</div>`:''}
 ${SH.g==='durak'?`<div class="lbl">${t('deck')}</div><div class="seg">${[24,36].map(d=>`<button class="${SH.deck===d?'on':''}" data-deck="${d}">${d} ${t('cards')}</button>`).join('')}</div><div class="lbl">${t('mode')}</div><div class="seg">${[[0,t('podk')],[1,t('perev')]].map(([k,l])=>`<button class="${SH.tr===k?'on':''}" data-tr="${k}">${l}</button>`).join('')}</div>`:''}
 ${WINS[SH.g]?`<div class="lbl">${SH.g==='pen'?t('kicksL'):t('winsTo')} · <span style="color:#d8b4fe">${wTxt(SH.g,SH.w)}</span></div><div class="seg wseg">${[1,2,3,4,5].map(n=>`<button class="${SH.w===n?'on':''}" data-w="${n}">${n}</button>`).join('')}</div>`:''}
 ${m==='paid'?`<div class="lbl">${t('stake')} · <span style="color:var(--ok)">${t('prize')} ${fmt(SH.st*2*(1-CFG.fee))} ⭐</span></div><div class="row" style="margin-top:0">${CFG.stakes.map(v=>`<button class="opt ${SH.st===v?'on':''}" data-st="${v}" style="min-width:64px;flex:0 0 calc(25% - 6px)">${fmt(v)}<small>⭐</small></button>`).join('')}</div>`:''}
 ${m==='tok'?`<div class="lbl">${t('stake')} · <span style="color:#7dd3fc">${t('prize')} ${fmt(SH.tst*2*(1-CFG.fee))} 💠</span> <span style="float:right;text-transform:none;letter-spacing:0">💠 ${fmt(U.tok)}</span></div><div class="row" style="margin-top:0">${(CFG.tok_stakes||[10,50,100,500]).map(v=>`<button class="opt ${SH.tst===v?'on':''}" data-tst="${v}" style="min-width:64px;flex:0 0 calc(25% - 6px)">${fmt(v)}<small>💠 SPC</small></button>`).join('')}</div>`:''}
 ${m==='bot'?`<button class="btn go" id="gobot" style="margin-top:16px">🤖 ${t('playBot')}</button>`:`<button class="btn go" id="goq" ${SH.q?'disabled':''} style="margin-top:14px">${SH.q?'<span class="sp"></span> '+t('search'):'⚡ '+t('quick')}</button>
 <button class="btn" id="goc">➕ ${t('create')}</button><label class="row" style="justify-content:center;color:var(--mu);font-size:13px;align-items:center;gap:8px"><input type="checkbox" id="priv" ${SH.priv?'checked':''} style="width:18px;height:18px;accent-color:#ff6a1a"> ${t('priv')}</label>`}
 ${SH.q?`<button class="ghost" id="cx">${t('cancel')}</button>`:''}`}
function stakeOK(){if(SH.mode==='tok'&&(+U.tok||0)<SH.tst){toast('⚠️ '+t('e_tbalance'));setTimeout(()=>{closeSheetSilent();show('me')},700);return false}if(SH.mode==='paid'&&(+U.star||0)<SH.st){toast('⚠️ '+t('e_balance'));setTimeout(()=>{closeSheetSilent();show('wallet')},600);return false}return true}
function opts(){return SH.g==='durak'?{deck:SH.deck,tr:SH.tr}:WINS[SH.g]?{w:SH.w}:{}}
function goQuick(){if(!SH||SH.q)return;if(!stakeOK())return;const st=SH.mode==='free'?0:SH.mode==='tok'?SH.tst:SH.st;LASTQ={g:SH.g,mode:SH.mode,st:SH.st,tst:SH.tst,deck:SH.deck,tr:SH.tr,w:SH.w};SH.q=1;drawSheet();S({t:'quick',game:SH.g,stake:st,cur:SH.mode==='tok'?'tok':'star',opts:opts()})}
function goCreate(){if(!SH)return;if(!stakeOK())return;LASTQ={g:SH.g,mode:SH.mode,st:SH.st,tst:SH.tst,deck:SH.deck,tr:SH.tr,w:SH.w};S({t:'create',game:SH.g,cur:SH.mode==='tok'?'tok':'star',stake:SH.mode==='free'?0:SH.mode==='tok'?SH.tst:SH.st,opts:opts(),priv:!!SH.priv})}
function goBot(){if(!SH)return;const g=SH.g;LASTQ={g,mode:'bot',deck:SH.deck,tr:SH.tr,w:SH.w};if(SERVER_BOT[g]){S({t:'bot',game:g,opts:opts()})}else{closeSheetSilent();startLocal(g)}}
function showInvite(r){SH=null;$('#res').classList.add('on');const o=GM[r.g]||{ic:'🎮'};$('#resc').innerHTML=`<div style="font-size:54px;animation:bob 2s infinite">${o.ic}</div><div class="rt" style="font-size:18px">${t('invited')}</div><b>${esc(r.host)}</b><div class="row" style="justify-content:center"><span class="tag">${gn(r.g)}</span><span class="tag ${r.stake?'f':''}">${r.stake?fmt(r.stake)+cu(r.cur):t('free')}</span>${wTag(r)}</div><button class="btn go" data-join="${r.id}" id="ijoin">${t('enter')}</button><button class="btn" id="rclose">${t('cancel')}</button>`}
/* ======================= ARENA va JACKPOT ekrani */
const PC=['#22c55e','#8b5cf6','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#eab308','#6366f1','#f97316','#06b6d4','#a3e635','#d946ef','#0ea5e9','#fb7185','#84cc16','#c084fc','#f43f5e','#10b981','#fbbf24','#60a5fa','#e879f9','#2dd4bf','#facc15'];
let PT=null,PSIG='',AL=null,BALL={raf:0,id:0},WSPUN=0,WROT=0,PWIN=null,LASTSEC=-1;
function potTitle(k){return k==='jackpot'?t('jp'):'Arena'}
function openPot(key){PKEY=key;PS=null;PSIG='';AL=null;$('#pot').classList.add('on');S({t:'pot',key});drawPot(true);syncBack();clearInterval(PT);PT=setInterval(potTick,250);SFX.whoosh()}
function closePot(){if(!$('#pot').classList.contains('on'))return;$('#pot').classList.remove('on');S({t:'unwatch'});PKEY=null;PS=null;clearInterval(PT);cancelAnimationFrame(BALL.raf);syncBack()}
const closeJp=closePot;
function potBal(){const b=$('#pbal');if(b)b.textContent=fmt(U.star)}
function potTick(){if(!PS||PS.st!=='count')return;PS.left=Math.max(0,PS.left-.25);const s=Math.ceil(PS.left),e=$('#pcd');if(e)e.textContent='00:'+String(s).padStart(2,'0');const b=$('#pbar');if(b)b.style.width=(PS.left/(PS.time||30)*100)+'%';
 if(s!==LASTSEC){LASTSEC=s;if(s<=5&&s>0){SFX.count(s);e&&e.parentNode.classList.add('hurry')}}}
function potStatus(){const p=PS;if(!p)return'…';if(p.st==='count')return`${t('starting')} <b id="pcd" class="num">00:${String(Math.ceil(p.left)).padStart(2,'0')}</b>`;if(p.st==='spin')return`<b class="spin-t">🎯 ${t('spinning')}</b>`;return`<span class="mu">⏳ ${t('waiting')} (${p.bets.length}/2)</span>`}
function drawPot(first){const key=PKEY,kind=key==='jackpot'?'jackpot':'arena',p=PS;
 if(first||!$('#pfield')||$('#pot').dataset.kind!==kind||$('#pot').dataset.key!==key){$('#pot').dataset.kind=kind;$('#pot').dataset.key=key;PSIG='';AL=null;
  const tiers=(CFG.arena_tiers||[50,200]);
  $('#pot').innerHTML=`<div class="ptop"><button class="ib" id="potx">${SVGI.back}</button><button class="ib" id="poth">${SVGI.clock}</button><button class="ib" id="poti">${SVGI.info}</button><button class="ib" id="potsnd">${SND?SVGI.snd:SVGI.mute}</button><h3>${potTitle(key)}</h3><button class="bchip" data-v="wallet">⭐ <b id="pbal">${fmt(U.star)}</b><i>+</i></button></div>
  ${kind==='arena'?`<div class="tiers">${tiers.map(tv=>`<button class="tier ${key==='arena:'+(+tv)?'on':''}" data-pot="arena:${+tv}">${fmt(tv)} ⭐</button>`).join('')}<button class="tier fr ${key.startsWith('ap')?'on':''}" id="potfr">👥 ${t('withFriend')}</button></div>`:''}
  <div id="pinv"></div>
  <div class="tg2"><button class="${TG==='top'?'on':''}" data-tg="top">${t('topGame')}</button><button class="${TG==='last'?'on':''}" data-tg="last">${t('lastGame')}</button></div><div class="tgc" id="tgc"></div>
  <div class="ptot"><span>${t('total')} <b class="num" id="ptotal">0</b> ⭐</span><span id="pstat"></span></div><div class="pbarw"><i id="pbar"></i></div>
  <div id="pfield">${kind==='arena'?`<div class="af" id="af"><canvas id="afc"></canvas><div id="afav"></div><canvas id="afb"></canvas><div class="afe" id="afe"><b>🟢</b>${t('arenaEmpty')}</div></div>`:
   `<div class="wheel2" id="wh"><div class="lights">${Array.from({length:28},(_,i)=>`<i style="--k:${i}"></i>`).join('')}</div><div class="wr2" id="wr"><svg viewBox="-100 -100 200 200" id="wsv"></svg><div id="wav"></div></div><div class="pt2" id="pt2"></div><div class="hub2"><small>${t('pot')}</small><b id="hubp" class="num">0</b><span>⭐</span></div></div>`}</div>
  <div id="pwin"></div>
  <div class="betc"><div class="row" id="pq" style="margin:0 0 8px"></div><div style="display:flex;gap:8px"><input class="inp" id="pamt" type="number" inputmode="decimal"><button class="btn go sm pbtn" id="pbet">${t('placeBet')}</button></div><div id="pmy"></div></div>
  <h2>👥 ${t('players')} <span class="r" id="pcnt"></span></h2><div id="plist"></div>`;LASTSEC=-1}
 if(!p){$('#pstat').innerHTML='<span class="sp"></span>';return}
 const mn=p.min||10,tot=p.pot||0;$('#ptotal').textContent=fmt(tot);$('#pstat').innerHTML=potStatus();$('#pbar').style.width=p.st==='count'?(p.left/(p.time||30)*100)+'%':'0%';
 const pa=$('#pamt');if(!pa.value)pa.value=LS.get('pa_'+kind,'')||mn;pa.placeholder=`${t('amount')} (min ${fmt(mn)})`;
 $('#pq').innerHTML=[1,2,5,10].map(k=>`<button class="opt" data-pq="${mn*k}">${fmtK(mn*k)}</button>`).join('')+`<button class="opt" data-pq="max">MAX</button>`;
 $('#pbet').disabled=p.st==='spin';
 const myB=p.bets.find(b=>b.uid===myUid);$('#pmy').innerHTML=myB?`<div class="pmy">${t('yourBet')}: <b>${fmt(myB.amt)} ⭐</b> · ${t('chance')} <b style="color:var(--ok)">${(myB.amt/tot*100).toFixed(1)}%</b>${p.st==='wait'?` <button class="chip" id="pcan">${t('jpCancel')}</button>`:''}</div>`:'';
 // inv
 $('#pinv').innerHTML=p.priv&&BOT?`<div class="pinv"><span>👥 ${t('privTxt')}</span><button class="btn go sm" id="pshare" data-l="https://t.me/${BOT}?start=arena_${key.slice(2)}${myUid?'__ref_'+myUid:''}">${SVGI.share} ${t('invite')}</button></div>`:'';
 drawTg();
 // o'yinchilar
 const sorted=p.bets.map((b,i)=>({...b,i})).sort((a,b)=>b.amt-a.amt);$('#pcnt').textContent=`${p.bets.length}/${p.max}`;
 $('#plist').innerHTML=sorted.length?sorted.map((b,i)=>`<div class="li pl2 ${b.uid===myUid?'mine':''}" style="--n:${i};--pc:${PC[b.c%PC.length]}"><i class="sw2"></i>${avH(b.name,b.ph)}<div class="g"><b>${esc(b.name)} <small>· ${t('lvl')} ${b.lvl||1}</small></b><small>${fmt(b.amt)} ⭐</small></div><b class="num chn">${(b.amt/tot*100).toFixed(1)}%</b></div>`).join(''):`<div class="empty"><i>${kind==='arena'?'🟢':'🎡'}</i>${t('beFirst')}</div>`;
 // maydon
 const sig=p.id+':'+p.bets.map(b=>b.uid+'='+b.amt).join(',');
 const keep=!p.bets.length&&PWIN&&PWIN.key===key&&Date.now()<PWIN.until;
 if(kind==='arena'){if(sig!==PSIG&&!keep){PSIG=sig;drawArena()}if(p.st==='spin'&&p.win&&BALL.id!==p.id){BALL.id=p.id;launchBall()}}
 else{if(sig!==PSIG&&!keep){PSIG=sig;drawWheel()}if(p.st==='spin'&&p.win&&WSPUN!==p.id){WSPUN=p.id;spinWheel()}}
 if(p.st!=='spin'&&PWIN&&PWIN.key===key&&Date.now()<PWIN.until)$('#pwin').innerHTML=winBox(PWIN);else if(p.st!=='spin')$('#pwin').innerHTML=''}
function drawTg(){const p=PS;if(!p)return;const x=TG==='top'?p.top:(p.hist||[])[0];
 $('#tgc').innerHTML=x?`<div class="tgcard">${avH(x.name,x.ph)}<b>${esc(x.name)}</b><small>${t('chance')} ${x.ch}%</small><em>+${fmtK(x.prize)} ⭐</em></div>`:`<div class="tgcard mu">— ${t('noGames')}</div>`}
const winBox=w=>`<div class="winb">${avH(w.name,w.ph,'lg')}<div><small>👑 ${t('jpWin')}</small><b>${esc(w.name)}</b><div class="num">+${fmt(w.prize)} ⭐</div><small>${t('chance')} ${w.ch}%</small></div></div>`;
function potHist(){const h=(PS&&PS.hist)||[];SH=null;$('#sh').classList.add('on');$('#shc').innerHTML=`<h3>🕘 ${t('history')}</h3><div style="margin-top:12px">${h.length?h.map((x,i)=>`<div class="li" style="--n:${i}">${avH(x.name,x.ph)}<div class="g"><b>${esc(x.name)}</b><small>${t('chance')} ${x.ch}% · ${x.n} ${t('players').toLowerCase()} · ${new Date(x.ts*1000).toLocaleTimeString(lang,{hour:'2-digit',minute:'2-digit'})}</small></div><b class="num" style="color:var(--ok)">+${fmtK(x.prize)} ⭐</b></div>`).join(''):`<div class="empty"><i>🕘</i>${t('noGames')}</div>`}</div><button class="ghost" data-close>OK</button>`;syncBack()}
function potInfo(){const ar=PKEY!=='jackpot';SH=null;$('#sh').classList.add('on');$('#shc').innerHTML=`<h3>ⓘ ${potTitle(PKEY)}</h3><div class="steps" style="margin:14px 0">${(ar?['ar1','ar2','ar3','ar4']:['jp1','jp2','jp3','ar4']).map((k,i)=>`<div><i>${i+1}</i>${t(k).replace('{f}',Math.round((CFG.fee||.1)*100))}</div>`).join('')}</div><button class="btn go" data-close>OK</button>`;syncBack()}
/* ---- arena maydoni: quvvat diagrammasi (maydon ulushi = stavka ulushi) */
function mulb(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function arenaLayout(bets){const n=bets.length,AR=1.75,pot=bets.reduce((a,b)=>a+b.amt,0);
 const P=bets.map(b=>{const r=mulb(b.seed);return{x:.15*AR+r()*.7*AR,y:.15+r()*.7,w:0,t:b.amt/pot}});
 for(let it=0;it<40;it++)for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const dx=P[j].x-P[i].x,dy=P[j].y-P[i].y,d=Math.hypot(dx,dy)||.01,m=.5/Math.sqrt(n);if(d<m){const k=(m-d)/d*.5;P[i].x-=dx*k;P[i].y-=dy*k;P[j].x+=dx*k;P[j].y+=dy*k}}
 P.forEach(p=>{p.x=Math.min(AR-.05,Math.max(.05,p.x));p.y=Math.min(.95,Math.max(.05,p.y))});
 const GX=70,GY=40,tot=GX*GY;const own=i=>0;
 const pick=(x,y)=>{let bi=0,bv=1e9;for(let i=0;i<n;i++){const v=(x-P[i].x)**2+(y-P[i].y)**2-P[i].w;if(v<bv){bv=v;bi=i}}return bi};
 let cnt,cx,cy;const pass=()=>{cnt=new Float64Array(n);cx=new Float64Array(n);cy=new Float64Array(n);for(let gy=0;gy<GY;gy++)for(let gx=0;gx<GX;gx++){const x=(gx+.5)/GX*AR,y=(gy+.5)/GY,i=pick(x,y);cnt[i]++;cx[i]+=x;cy[i]+=y}};
 for(let it=0;it<60;it++){pass();for(let i=0;i<n;i++){P[i].w+=(P[i].t-cnt[i]/tot)*.9;if(it%6===5&&cnt[i]){P[i].x=P[i].x*.6+cx[i]/cnt[i]*.4;P[i].y=P[i].y*.6+cy[i]/cnt[i]*.4}}}
 pass();P.forEach((p,i)=>{p.cx=cnt[i]?cx[i]/cnt[i]:p.x;p.cy=cnt[i]?cy[i]/cnt[i]:p.y;p.area=cnt[i]/tot});return{P,AR,pick}}
function hexA(h,a){const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function drawArena(){const p=PS,af=$('#af');if(!af)return;const cv=$('#afc'),bv=$('#afb'),dpr=Math.min(2,devicePixelRatio||1),Wc=af.clientWidth,Hc=af.clientHeight;
 cv.width=bv.width=Math.round(Wc*dpr);cv.height=bv.height=Math.round(Hc*dpr);const cx=cv.getContext('2d');bv.getContext('2d').clearRect(0,0,bv.width,bv.height);
 $('#afe').style.display=p.bets.length?'none':'';$('#afav').innerHTML='';AL=null;if(!p.bets.length){cx.clearRect(0,0,cv.width,cv.height);return}
 const L=arenaLayout(p.bets);AL=L;const W=cv.width,H=cv.height,img=cx.createImageData(W,H),D=img.data,own=new Uint8Array(W*H),cols=p.bets.map(b=>hexA(PC[b.c%PC.length]));
 const s=1;for(let y=0;y<H;y+=s)for(let x=0;x<W;x+=s){const i=L.pick(x/W*L.AR,y/H);for(let yy=y;yy<Math.min(H,y+s);yy++)for(let xx=x;xx<Math.min(W,x+s);xx++)own[yy*W+xx]=i}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=y*W+x,i=own[k],c=cols[i],P=L.P[i],dx=x/W*L.AR-P.cx,dy=y/H-P.cy,sh=1.08-Math.min(.32,Math.sqrt(dx*dx+dy*dy)*.55);
  const edge=(x>1&&own[k-2]!==i)||(y>1&&own[k-2*W]!==i)||(x<W-2&&own[k+2]!==i)||(y<H-2&&own[k+2*W]!==i),o=k*4;
  if(edge){D[o]=13;D[o+1]=11;D[o+2]=18}else{D[o]=Math.min(255,c[0]*sh);D[o+1]=Math.min(255,c[1]*sh);D[o+2]=Math.min(255,c[2]*sh)}D[o+3]=255}
 cx.putImageData(img,0,0);L.own=own;L.W=W;L.H=H;
 $('#afav').innerHTML=L.P.map((P,i)=>{const b=p.bets[i],sz=Math.max(26,Math.min(Hc*.42,Math.sqrt(P.area*L.AR)*Hc*.55));return`<div class="aav ${b.uid===myUid?'me':''}" data-i="${i}" style="left:${P.cx/L.AR*100}%;top:${P.cy*100}%;width:${sz}px;height:${sz}px;font-size:${sz*.42}px">${avH(b.name,b.ph)}${P.area>.07?`<em>${(P.t*100).toFixed(0)}%</em>`:''}</div>`}).join('')}
function launchBall(){const p=PS,L=AL,af=$('#af');if(!L||!af||!p.win)return;const w=p.win,P=L.P[w.i],r=mulb(w.seed||7),bv=$('#afb'),cx=bv.getContext('2d'),W=bv.width,H=bv.height;
 let tx=P.cx,ty=P.cy;for(let k=0;k<30;k++){const jx=P.cx+(r()-.5)*.3,jy=P.cy+(r()-.5)*.3;if(jx>.06&&jx<L.AR-.06&&jy>.08&&jy<.92&&L.pick(jx,jy)===w.i){tx=jx;ty=jy;break}}
 const pts=[[L.AR/2,.5]];for(let k=0;k<8;k++){const e=k%4;pts.push(e===0?[.04+r()*.1,.1+r()*.8]:e===1?[.2+r()*(L.AR-.4),.04+r()*.08]:e===2?[L.AR-.04-r()*.1,.1+r()*.8]:[.2+r()*(L.AR-.4),.96-r()*.08])}pts.push([tx,ty]);
 const segs=[];let tt=0;for(let k=1;k<pts.length;k++){const len=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]),sp=3.4*Math.pow(.8,k-1),d=Math.max(.18,len/sp)*1000;segs.push({a:pts[k-1],b:pts[k],t0:tt,d});tt+=d}
 const trail=[],t0=performance.now();let si=0,last=-1;SFX.launch();$$('.aav').forEach(e=>e.classList.remove('won','dim'));
 const ease=x=>1-Math.pow(1-x,3);
 const frame=n=>{const el=n-t0;while(si<segs.length-1&&el>segs[si].t0+segs[si].d){si++;SFX.bounce(1+Math.random()*.4);hap('light')}
  const g=segs[si],k=Math.min(1,(el-g.t0)/g.d),kk=si===segs.length-1?ease(k):k,x=g.a[0]+(g.b[0]-g.a[0])*kk,y=g.a[1]+(g.b[1]-g.a[1])*kk,px=x/L.AR*W,py=y*H;
  trail.push([px,py]);if(trail.length>16)trail.shift();cx.clearRect(0,0,W,H);
  for(let i=1;i<trail.length;i++){cx.strokeStyle=`rgba(255,255,255,${i/trail.length*.5})`;cx.lineWidth=(i/trail.length)*10*(W/360);cx.lineCap='round';cx.beginPath();cx.moveTo(...trail[i-1]);cx.lineTo(...trail[i]);cx.stroke()}
  const R=10*(W/360),gr=cx.createRadialGradient(px-R*.35,py-R*.35,R*.1,px,py,R);gr.addColorStop(0,'#fff');gr.addColorStop(1,'#cfd3e6');cx.shadowColor='#fff';cx.shadowBlur=R*2;cx.fillStyle=gr;cx.beginPath();cx.arc(px,py,R,0,6.29);cx.fill();cx.shadowBlur=0;
  const cur=L.pick(x,y);if(cur!==last){last=cur;$$('.aav').forEach(e=>e.classList.toggle('hot',+e.dataset.i===cur));SFX.tick()}
  if(el<tt)BALL.raf=requestAnimationFrame(frame);else arenaWon(px,py,R)};
 cancelAnimationFrame(BALL.raf);BALL.raf=requestAnimationFrame(frame)}
function arenaWon(px,py,R){const p=PS,L=AL,w=p&&p.win;if(!w||!L)return;const bv=$('#afb'),cx=bv.getContext('2d'),W=bv.width,H=bv.height,img=cx.getImageData(0,0,W,H),D=img.data;
 for(let k=0;k<W*H;k++)if(L.own[k]!==w.i&&D[k*4+3]<200){D[k*4]=7;D[k*4+1]=6;D[k*4+2]=11;D[k*4+3]=170}
 cx.putImageData(img,0,0);$$('.aav').forEach(e=>{e.classList.remove('hot');e.classList.add(+e.dataset.i===w.i?'won':'dim')});potResult(w)}
function potResult(w){PWIN={...w,key:PKEY,until:Date.now()+14000};$('#pwin').innerHTML=winBox(w);if(w.uid===myUid){SFX.win();confetti(70);try{tg.HapticFeedback.notificationOccurred('success')}catch(e){}}else{SFX.lose()}}
/* ---- jackpot g'ildiragi */
function drawWheel(){const p=PS,sv=$('#wsv'),av=$('#wav');if(!sv)return;$('#hubp').textContent=fmtK(p.pot||0);
 if(!p.bets.length){sv.innerHTML=Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2-Math.PI/2,e=(i+1)/12*Math.PI*2-Math.PI/2;return`<path d="M0 0L${96*Math.cos(a)} ${96*Math.sin(a)}A96 96 0 0 1 ${96*Math.cos(e)} ${96*Math.sin(e)}Z" fill="${i%2?'#1f1a2b':'#29223a'}"/>`}).join('');av.innerHTML='';$('#wh').classList.add('idle');return}
 $('#wh').classList.remove('idle');const tot=p.pot;let acc=0;let svg='';let avs='';
 p.bets.forEach((b,i)=>{const a0=acc/tot,a1=(acc+b.amt)/tot;acc+=b.amt;b._a=a0;b._e=a1;const col=PC[b.c%PC.length],A=a0*Math.PI*2-Math.PI/2,E=a1*Math.PI*2-Math.PI/2;
  svg+=p.bets.length===1?`<circle r="96" fill="${col}"/>`:`<path d="M0 0L${96*Math.cos(A)} ${96*Math.sin(A)}A96 96 0 ${a1-a0>.5?1:0} 1 ${96*Math.cos(E)} ${96*Math.sin(E)}Z" fill="${col}" stroke="#0d0b12" stroke-width="1.6"/>`;
  if(a1-a0>.045){const m=(a0+a1)/2*360,R=($('#wr').clientWidth||300)*.32,sz=Math.max(24,Math.min(50,(a1-a0)*200));avs+=`<div class="wav" style="transform:translate(-50%,-50%) rotate(${m}deg) translateY(-${R}px) rotate(${-m}deg);width:${sz}px;height:${sz}px">${avH(b.name,b.ph)}</div>`}});
 svg+='<circle r="96" fill="url(#wshade)"/>';sv.innerHTML=svg;av.innerHTML=avs}
function spinWheel(){const p=PS,w=p.win,b=p.bets[w.i];if(!b||b._a==null)drawWheel();const bb=p.bets[w.i],f=bb._a+(bb._e-bb._a)*w.off,wr=$('#wr');if(!wr)return;
 const target=WROT-(WROT%360)+360*7+(360-f*360);wr.style.transition='none';wr.style.transform=`rotate(${WROT}deg)`;void wr.offsetWidth;wr.style.transition='';WROT=target;wr.style.transform=`rotate(${target}deg)`;SFX.launch();
 let k=0,d=60;const tick=()=>{if(!PS||PS.st!=='spin')return;SFX.tick();const pt=$('#pt2');if(pt){pt.classList.remove('wob');void pt.offsetWidth;pt.classList.add('wob')}d*=1.075;if(++k<55&&d<900)setTimeout(tick,d)};tick();
 setTimeout(()=>potResult(w),7100)}
/* ======================= REYTING */
function fmtLeft(s){s=Math.max(0,s|0);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?`${d}${t('dd')} ${h}${t('hh')}`:`${h}${t('hh')} ${m}${t('mm')}`}
function drawTop(m){if(!m){const c=LBC[lbq().per+'|'+lbq().by];if(c){LBSIG=JSON.stringify(c);m=c}else LBSIG=''}const q=lbq(),by=['profit','dep','ref'].includes(q.by)?q.by:'profit',vv=r=>r.v??r.p??0,val=r=>by==='ref'?fmt(vv(r))+' 👥':by==='dep'?fmtK(vv(r))+' ⭐':'+'+fmtK(vv(r))+' ⭐',sub=r=>by==='ref'?`${fmt(vv(r))} ${t('refsN')}`:by==='dep'?`${r.n} ${t('depN')}`:`${r.n} ${t('played').toLowerCase()}`;
 let h=`<div class="seg" style="margin-bottom:8px">${[['day',t('day')],['week',t('week')],['all',t('allT')]].map(([k,l])=>`<button class="${q.per===k?'on':''}" data-per="${k}">${l}</button>`).join('')}</div>
 <div class="lbtabs">${[['profit','💰 '+t('byP')],['dep','💳 '+t('byD')],['ref','👥 '+t('byR')]].map(([k,l])=>`<button class="lbt ${by===k?'on':''}" data-by="${k}">${l}</button>`).join('')}</div>`;
 if(!m){$('#v-top').innerHTML=h+'<div class="empty"><span class="sp"></span></div>';return}
 if(by==='ref'&&CFG.rc_on)h+=`<div class="rcbox"><div><small>👥 ${t('rcT')}</small><b>${t('rcF')}: ${fmt(CFG.rc_prize||0)} ⭐</b><span>${t('rcS')}</span></div>${CFG.rc_end?`<div class="rct"><small>${t('ends')}</small><b data-rcl>${fmtLeft(CFG.rc_end-Date.now()/1000)}</b></div>`:''}</div>`;
 const pr=m.prizes,prz=i=>pr&&pr.list[i]?`<span class="przb">🎁 ${fmtK(pr.list[i])} ⭐</span>`:'';
 if(pr)h+=`<div class="lbpr"><div><small>🏆 ${t('lbPr')}</small><b>${t('ends')} ${fmtLeft(pr.left)}</b></div><div class="lbpl">${pr.list.slice(0,5).map((v,i)=>`<span><i>${['🥇','🥈','🥉'][i]||i+1}</i>${fmtK(v)} ⭐</span>`).join('')}</div></div>`;
 const L=m.list;if(!L.length){$('#v-top').innerHTML=h+`<div class="empty"><i>🏆</i>${t('emptyTop')}</div>`;return}
 const P=[L[1],L[0],L[2]],cls=['p2','p1','p3'],col=['#c0c8d8','#ffc83d','#e4945a'];
 h+=`<div class="pod">${P.map((r,i)=>r?`<div class="pd ${cls[i]}" style="--pr:${col[i]};--d:${[1,0,2][i]}">${i===1?'<div class="cr">👑</div>':''}<div class="pa">${avH(r.name,r.ph)}</div><b>${esc(r.name)}${r.vip?' 👑':''}</b><div class="pv">${val(r)}</div>${prz([1,0,2][i])}<div class="st">${[2,1,3][i]}</div></div>`:'<div></div>').join('')}</div>`;
 h+=L.slice(3).map((r,i)=>`<div class="lbr ${r.me?'mine':''}" style="--n:${i}"><span class="rk">${i+4}</span>${avH(r.name,r.ph)}<div class="g"><b>${esc(r.name)}${r.vip?' 👑':''}</b><small>${t('lvl')} ${r.lvl} · ${sub(r)}</small></div>${prz(i+3)}<span class="val" style="color:${by==='ref'?'#d8b4fe':by==='dep'?'var(--gold)':'var(--ok)'}">${val(r)}</span></div>`).join('');
 if(m.lastw&&m.lastw.length)h+=`<h2>🎖 ${t('lastW')}</h2><div class="card">${m.lastw.map(x=>`<div class="lw"><span>${['🥇','🥈','🥉'][x.place-1]||'#'+x.place}</span><b>${esc(x.name)}</b><em>+${fmtK(x.amt)} ⭐</em></div>`).join('')}</div>`;
 if(m.my)h+=`<div class="lbr mine myrank"><span class="rk">#${m.my.rank}</span>${avH(myName(),myPhoto())}<div class="g"><b>${t('you')}</b><small>${sub(m.my)}</small></div><span class="val">${val(m.my)}</span></div>`;
 $('#v-top').innerHTML=h}
/* ======================= HAMYON */
let TC=null,TCload=0;
function loadTC(){if(TC||TCload)return;TCload=1;const s=document.createElement('script');s.src='https://unpkg.com/@tonconnect/ui@2.0.9/dist/tonconnect-ui.min.js';
 s.onload=()=>{try{TC=new TON_CONNECT_UI.TonConnectUI({manifestUrl:location.origin+'/tonconnect-manifest.json'});if(BOT)TC.uiOptions={twaReturnUrl:`https://t.me/${BOT}`};
  TC.onStatusChange(w=>{if(w){let a=w.account.address;try{a=TON_CONNECT_UI.toUserFriendlyAddress(a)}catch(e){}if(a!==U.wallet){U.wallet=a;S({t:'wallet',addr:a})}}if(CUR==='wallet')drawWallet()})}catch(e){console.warn(e)}};document.head.appendChild(s)}
const tcOn=()=>TC&&TC.connected;
function commentBoc(text){const d=[0,0,0,0,...new TextEncoder().encode(text)].slice(0,127),n=d.length;
 const b=[0xb5,0xee,0x9c,0x72,0x41,0x01,0x01,0x01,0x00,2+n,0x00,0x00,2*n,...d];let c=~0;for(const x of b){c^=x;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0x82f63b78:c>>>1}c=~c>>>0;b.push(c&255,c>>>8&255,c>>>16&255,c>>>24&255);
 return btoa(String.fromCharCode(...b))}
async function tonPay(x){try{await TC.sendTransaction({validUntil:Math.floor(Date.now()/1000)+600,messages:[{address:x.addr,amount:String(Math.round(x.amount*1e9)),payload:commentBoc(x.comment)}]});toast('⏳ '+t('tonWait'))}catch(e){toast('✖ '+esc((e&&e.message||'cancel').slice(0,60)))}}
const DEP={star:[50,100,250,500,1000,2500],ton:[.5,1,2,5,10,25]};let DSEL={star:100,ton:1};
function drawWallet(){
 let h=`<div class="wcard"><div class="wtop"><small>💼 ${t('balance')}</small><span class="wfr">Fragment</span></div><div class="bb"><span id="wbb">${fmt(U.star)}</span> ${SI}</div><div class="tn">${TI} ≈ ${fmt(toTon(U.star).toFixed(3))} TON</div>
 <div class="rt"><span>${TI} 1 TON = ${fmt(CFG.rate)} ⭐</span><span>⭐ 1 = 1 Telegram Star</span></div></div>
 ${CFG.test?`<div class="note" style="color:var(--gold);word-break:normal">${t('test')}</div>`:''}
 <div class="seg" style="margin-top:14px">${[['dep','⬇ '+t('dep')],['wd','⬆ '+t('wd')],['hist','🧾 '+t('hist')]].map(([k,l])=>`<button class="${WT===k?'on':''}" data-wt="${k}">${l}</button>`).join('')}</div>`;
 if(WT==='dep'&&CFG.dep_on===0)h+=`<div class="empty"><i>🔒</i>${t('e_depoff')}</div>`;
 if(WT==='wd'&&CFG.wd_on===0)h+=`<div class="empty"><i>🔒</i>${t('e_wdoff')}</div>`;
 if(WT==='dep'&&CFG.dep_on!==0){const ton=DM==='ton',v=DSEL[DM];
  h+=`<div class="card" style="margin-top:12px"><div class="seg">${[['star','⭐ Stars'],['ton','💎 TON']].map(([k,l])=>`<button class="${DM===k?'on':''}" data-dm="${k}">${l}</button>`).join('')}</div>
  <div class="row">${DEP[DM].map(a=>`<button class="opt ${v===a?'on':''}" data-da="${a}" style="flex:0 0 calc(33.3% - 6px)">${ton?'💎 ':'⭐ '}${fmt(a)}<small>${ton?'≈ '+fmtK(Math.round(a*CFG.rate))+' ⭐':'1:1'}</small></button>`).join('')}</div>
  <input class="inp" id="damt" type="number" inputmode="decimal" placeholder="${t('other')} (${ton?'TON':'Stars'})" value="${DEP[DM].includes(v)?'':v}">
  <div id="dhint" class="hint">${ton?`${t('youGet')}: <b>≈ ${fmt(Math.round(v*CFG.rate))} ⭐</b>`:`${t('youGet')}: <b>${fmt(v)} ⭐</b> · 1:1`}</div>
  ${ton?(tcOn()?`<button class="btn ton" id="dgo">${TI} ${t('payWallet')} · ${fmt(v)} TON</button><div style="text-align:center;margin-top:6px"><small class="mono">${esc((U.wallet||'').slice(0,6)+'…'+(U.wallet||'').slice(-6))}</small> <button class="chip" id="tcoff" style="padding:3px 9px">✕</button></div>`:`<button class="btn ton" id="tcon">${TI} ${t('connect')}</button><button class="btn" id="dgo">${t('manual')}</button>`):`<button class="btn go" id="dgo">⭐ ${t('dep')} ${fmt(v)} Stars</button>`}
  <div id="depr"></div></div>`}
 if(WT==='wd'&&CFG.wd_on!==0){const st=WM==='star',mn=st?CFG.min_wd_star:CFG.min_wd,a=LS.get('wda','')||'';
  h+=`<div class="card" style="margin-top:12px">${CFG.wd_star?`<div class="seg" style="margin-bottom:12px">${[['ton','💎 TON'],['star','⭐ Stars']].map(([k,l])=>`<button class="${WM===k?'on':''}" data-wm="${k}">${l}</button>`).join('')}</div>`:''}
  <div class="lbl" style="margin-top:0">${t('amount')} (⭐) · ${t('wdMin')} ${fmt(mn)}</div><div style="display:flex;gap:8px"><input class="inp" id="wamt" type="number" inputmode="decimal" placeholder="${fmt(mn)}" value="${esc(a)}"><button class="chip" id="wmax">MAX</button></div>
  ${st?`<div class="lbl">${t('uname')}</div><input class="inp" id="waddr" placeholder="@username" value="${esc(LS.get('wduser','')||(tg?.initDataUnsafe?.user?.username?'@'+tg.initDataUnsafe.user.username:''))}"><div class="hint">⭐ ${t('starWd')}</div>`
  :`<div class="lbl">${t('addr')}</div><input class="inp" id="waddr" placeholder="UQ… / EQ…" value="${esc(LS.get('wdaddr','')||U.wallet||'')}" style="font-size:13px">${U.wallet?`<button class="chip" id="wfill" style="margin-top:8px">💎 ${t('fromWallet')}</button>`:''}`}
  <div id="wget" class="hint">${wdGet(+a||0)}</div><button class="btn go" id="wgo">⬆ ${t('wdSend')}</button></div>
  <h2>${t('myWd')}</h2><div class="hist">${WDS.length?WDS.map((w,i)=>`<div class="li" style="--n:${i}"><div class="ic">${w.method==='star'?'⭐':'💎'}</div><div class="g"><b>${fmt(w.amt)} ⭐ → ${fmt(w.ton)} ${w.method==='star'?'Stars':'TON'}</b><small>${esc(w.addr.slice(0,14))} · ${new Date(w.ts*1000).toLocaleString(lang,{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div><span class="wst tag ${w.status==='paid'?'g':w.status==='rejected'?'':'f'}">${t(w.status==='paid'?'paidS':w.status)}</span></div>`).join(''):`<div class="empty" style="padding:14px">—</div>`}</div>`}
 if(WT==='hist'){const IC={task:'✅',deposit:'⬇️',withdraw:'⬆️',bet:'🎲',win:'🏆',refund:'↩️',ref:'👥',promo:'🎟',bonus:'🎁',admin:'🛠',giveaway:'🎉',lbprize:'🥇'};
  h+=`<div class="hist" style="margin-top:12px">${HIST.length?HIST.map((l,i)=>`<div class="li" style="--n:${i}"><div class="ic">${IC[l.kind]||'•'}</div><div class="g"><b>${t('k_'+l.kind)}</b><small>${esc(['bet','win','refund'].includes(l.kind)?gn(l.note.split(' ')[0]):l.note.split(' ').slice(0,3).join(' '))} · ${new Date(l.ts*1000).toLocaleString(lang,{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div><b class="num" style="color:${l.amt>=0?'var(--ok)':'var(--red)'}">${l.amt>0?'+':''}${fmt(l.amt)} ${l.cur==='ton'?'💎':l.cur==='tok'?'💠':'⭐'}</b></div>`).join(''):`<div class="empty"><i>🧾</i>${t('noHist')}</div>`}</div>`}
 $('#v-wallet').innerHTML=h}
const wdGet=a=>WM==='star'?`${t('youGet')}: <b>${fmt(Math.floor(a*(1-(CFG.wd_fee_star??.2))))} ⭐ Stars</b>${CFG.wd_fee_star?` <small>(${t('fee')} ${Math.round(CFG.wd_fee_star*100)}%)</small>`:''}`:`${t('youGet')}: <b style="color:var(--ton)">≈ ${fmt((a/CFG.rate*(1-CFG.wd_fee)).toFixed(4))} 💎 TON</b>${CFG.wd_fee?` <small>(${t('fee')} ${Math.round(CFG.wd_fee*100)}%)</small>`:''}`;
function depRes(m){if(m.ok){U=m.user||U;chips(0);SFX.win();confetti(24);return toast('✅ '+t('depOk')+(m.stars?' +'+fmt(m.stars)+' ⭐':''))}
 if(m.link){try{tg.openInvoice(m.link,st=>{if(st==='paid'){toast('✅ '+t('depOk'));SFX.win()}})}catch(e){window.open(m.link,'_blank')}return}
 if(m.ton){const x=m.ton;if(tcOn())return tonPay(x);const n=Math.round(x.amount*1e9),b=$('#depr');
  if(b)b.innerHTML=`<div class="note"><b>💎 ${t('tonsend')}: ${esc(x.amount)} TON</b> <small>(≈ ${fmt(x.stars)} ⭐)</small><br><br><small>Address</small><br><code>${esc(x.addr)}</code><br><br><small>${t('comment')}</small><br><code>${esc(x.comment)}</code><div class="row"><button class="opt" data-cpy="${esc(x.addr)}">⧉ Address</button><button class="opt" data-cpy="${esc(x.comment)}">⧉ Comment</button></div><a class="btn ton" style="text-decoration:none" href="ton://transfer/${esc(x.addr)}?amount=${n}&text=${encodeURIComponent(x.comment)}">${t('openW')}</a></div>`;return}
 toast(t('depOff'))}
/* ======================= PROFIL (promokod, bonus, konkurslar, referal, sozlamalar) */
function fmtT(s){s=Math.max(0,Math.floor(s));return`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
let BT=null;const BGS=['fire','cosmos','snow','grid','off'];let BGM=LS.get('bg','fire');
function gwCard(g,i){const done=g.status==='done';let names=[];try{names=JSON.parse(g.result||'[]')}catch(e){}
 return`<div class="gwc ${done?'done':''}" style="--n:${i}"><div class="gwh"><span class="gwi">${done?'🏁':'🎁'}</span><div class="g"><b>${esc(g.title)}</b><small>${g.n} ${t('partic')}${done?'':` · ⏱ <span data-gwl="${g.ends}">${fmtLeft(g.left)}</span>`}</small></div><div class="gwp">${fmtK(g.prize)} ⭐<small>× ${g.winners}</small></div></div>
 ${g.min_games||g.channel?`<div class="gwr">${g.min_games?`<span>🎮 ${t('gwMinG').replace('{n}',g.min_games)}</span>`:''}${g.channel?`<span>📢 ${t('gwSub')} ${esc(g.channel)}</span>`:''}</div>`:''}
 ${done?`<div class="gww">🏆 ${names.length?names.map(esc).join(', '):'—'}</div>`:g.joined?`<button class="btn" disabled>✓ ${t('gwIn')}</button>`:`<div style="display:flex;gap:8px">${g.channel?`<button class="btn sm" style="flex:1" data-chan="${esc(g.channel)}">📢 ${t('gwSub')}</button>`:''}<button class="btn go sm" style="flex:2" data-gw="${g.id}">🎉 ${t('gwJoin')}</button></div>`}</div>`}
function drawMe(){const L=lvlOf(U),wr=U.games?Math.round(U.wins/U.games*100):0,b=BONUS||{refs:U.refs,earn:U.ref_earn,friends:[],daily:CFG.daily,next:0,ref:RL()[0]},lv=b.lv||RL().map(p=>({p,n:0,earn:0})),link=BOT?`https://t.me/${BOT}?start=ref_${myUid}`:'',un=tg?.initDataUnsafe?.user?.username;
 $('#v-me').innerHTML=`<div class="pcard"><div class="pbg"></div><div class="ava big" style="--p:${L.p}"><b>${esc(myName()[0].toUpperCase())}${myPhoto()?`<img src="${esc(myPhoto())}" onerror="this.remove()">`:''}</b><i>${L.l}</i></div>
 <h3 class="B">${esc(myName())}${U.vip?' <span class="vipb">VIP</span>':''}</h3><small>${un?'@'+esc(un)+' · ':''}ID ${esc(myUid.replace(/^tg/,''))} <button class="chip cpid" data-cpy="${esc(myUid.replace(/^tg/,''))}">⧉</button></small>
 <div class="xpb"><i style="width:${L.p}%"></i></div><small>${t('lvl')} ${L.l} · ${fmt(L.xp)} / ${fmt(L.next)} XP</small>
 <div class="pst">${[[t('played'),U.games,'🎮'],[t('wins'),U.wins,'🏆'],[t('wr'),wr+'%','📈'],[t('refs'),U.refs,'👥']].map(([l,v,ic],i)=>`<div style="--n:${i}"><span>${ic}</span><b class="num">${v}</b><small>${l}</small></div>`).join('')}</div>
 <div class="pbtns"><button class="btn go sm" data-v="wallet">⬇ ${t('dep')}</button><button class="btn sm" data-wt2="wd">⬆ ${t('wd')}</button><button class="btn sm" data-wt2="hist">🧾 ${t('hist')}</button></div></div>
 <div class="card promo" style="margin-top:12px"><b class="B" style="font-size:15px">🎟 ${t('promo')}</b><div style="display:flex;gap:8px;margin-top:10px"><input class="inp" id="pcode" placeholder="${t('promoPh')}" style="text-transform:uppercase;letter-spacing:.08em"><button class="btn go sm" id="pgo" style="padding:0 16px">${t('activate')}</button></div></div>

 ${TASKS&&TASKS.on?`<h2>💠 ${t('tokT')}</h2><div class="tokc"><div class="tokh"><div><small>${t('balance')}</small><b class="num">${fmt(U.tok)} 💠</b></div><button class="btn go sm" id="tplay">🎮 ${t('tokPlay')}</button></div><small class="toks">${t('tokS')}</small>
 ${TASKS.daily?`<div class="tkr2"><span class="tki">🎁</span><div class="g"><b>${t('tokDaily')}</b><small>+${fmt(TASKS.daily)} 💠 · ${t('tkDaily')}</small></div>${TASKS.next>0?`<span class="tag" id="tnext">${fmtT(TASKS.next)}</span>`:`<button class="btn go sm" id="tclaim">${t('claim')}</button>`}</div>`:''}
 <div class="lbl">✅ ${t('tasks')}</div>${TASKS.list.map(x=>`<div class="tkr2 ${x.done?'dn':''}"><span class="tki">${{play:'🎮',win:'🏆',ref:'👥',sub:'📢'}[x.id]||'✅'}</span><div class="g"><b>${t('tk_'+x.id)}${x.ch?' '+esc(x.ch):''}</b><small>+${fmt(x.r)} 💠 · ${x.daily?t('tkDaily'):t('tkOnce')}${x.id!=='sub'?` · ${x.p}/${x.n}`:''}</small>${x.id!=='sub'?`<div class="tkp"><i style="width:${x.done?100:x.p/x.n*100}%"></i></div>`:''}</div>${x.done?'<span class="tdone">✓</span>':x.id==='sub'?`<button class="chip" data-chan="${esc(x.ch)}">↗</button><button class="btn go sm" data-task="sub">${t('claim')}</button>`:`<button class="btn ${x.p>=x.n?'go':''} sm" data-task="${x.id}" ${x.p>=x.n?'':'disabled'}>${t('claim')}</button>`}</div>`).join('')}</div>`:''}
 ${b.daily?`<div class="daily" style="margin-top:12px"><div class="gb">🎁</div><div style="flex:1"><b class="B">${t('daily')}</b><div style="color:var(--gold);font:800 18px var(--H)">+${fmt(b.daily)} ⭐</div>${b.next>0?`<small>${t('nextIn')} <span id="dnext">${fmtT(b.next)}</span></small>`:''}</div><button class="btn go sm" id="dclaim" ${b.next>0?'disabled':''}>${t('claim')}</button></div>`:''}
 ${GWS.length?`<h2>🎉 ${t('gws')}</h2>${GWS.map(gwCard).join('')}`:''}
 <h2>👥 ${t('refT')}</h2><div class="refc"><div style="display:flex;align-items:center;gap:14px"><div class="refpc">${refSum()}</div><div style="flex:1;color:#cdeee2"><b style="display:block;color:#fff">${t('ref3')}</b>${t('refS')}</div></div>
 <div class="rlv">${lv.map((x,i)=>`<div style="--n:${i}"><small>${t('lvlN').replace('{n}',i+1)}</small><b class="num">${pct(x.p)}</b><span>👥 ${fmt(x.n)}</span><em>+${fmtK(x.earn)} ⭐</em></div>`).join('')}</div>
 <div class="grid" style="margin:12px 0"><div class="note" style="margin:0"><small>${t('refs')}</small><div class="num big">${fmt(b.refs)}</div></div><div class="note" style="margin:0"><small>${t('earned')}</small><div class="num big" style="color:var(--ok)">${fmt(b.earn)} ⭐</div></div></div>
 ${link?`<div class="note" style="font-size:12px"><code>${esc(link)}</code></div><div class="row"><button class="btn sm" style="flex:1" data-cpy="${esc(link)}">⧉ ${t('copy')}</button><button class="btn go sm" style="flex:1" id="shr" data-l="${esc(link)}">${SVGI.share} ${t('share')}</button></div>`:''}
 <div class="steps">${['st1','st2','st3'].map((k,i)=>`<div><i>${i+1}</i>${t(k)}</div>`).join('')}</div>
 ${b.friends&&b.friends.length?`<div style="margin-top:12px">${b.friends.slice(0,8).map(f=>`<div class="frow">${avH(f.name,'','xs')}<b>${esc(f.name)}</b><small>${f.games} ${t('played').toLowerCase()}</small></div>`).join('')}</div>`:''}</div>
 <h2>⚙️ ${t('settings')}</h2><div class="card"><div class="lbl" style="margin-top:0">🎨 ${t('bg')}</div><div class="grid" style="grid-template-columns:repeat(5,1fr);gap:6px">${BGS.map(k=>`<button class="opt ${BGM===k?'on':''}" data-bg="${k}" style="padding:10px 2px;font-size:20px">${{fire:'🔥',cosmos:'🌌',snow:'❄️',grid:'🌆',off:'⚫'}[k]}<small>${t('bg_'+k)}</small></button>`).join('')}</div>
 <div class="lbl">🌐 ${t('lang')}</div><div class="seg">${[['uz','🇺🇿 UZ'],['ru','🇷🇺 RU'],['en','🇬🇧 EN']].map(([l,n])=>`<button class="${l===lang?'on':''}" data-lang="${l}">${n}</button>`).join('')}</div>
 <div class="lbl">🔊 ${t('sound')}</div><div class="seg"><button class="${SND?'on':''}" data-snd="1">🔊 ON</button><button class="${SND?'':'on'}" data-snd="0">🔇 OFF</button></div></div>
 <p style="text-align:center;color:var(--mu);font-size:11px;margin-top:18px">⭐ StarUm</p>`;
 clearInterval(BT);BT=setInterval(()=>{if(CUR!=='me')return clearInterval(BT);if(TASKS&&TASKS.next>0){TASKS.next--;const e=$('#tnext');if(e)e.textContent=fmtT(TASKS.next);if(TASKS.next<=0)drawMe()}if(b.next>0){b.next--;const e=$('#dnext');if(e)e.textContent=fmtT(b.next);if(b.next<=0)drawMe()}$$('[data-gwl]').forEach(e=>e.textContent=fmtLeft(+e.dataset.gwl-Date.now()/1000))},1000)}
function giftFx(a,why,cur){SFX.win();confetti(70);$('#res').classList.add('on');$('#resc').innerHTML=`<div class="trophy">🎁</div><div class="rt">${t('gift')}</div>${why?`<div style="color:var(--mu);margin-bottom:6px">${esc(why)}</div>`:''}<div class="num" style="font-size:30px;color:var(--gold)">+${fmt(a)}${cu(cur)}</div><button class="btn go" id="rclose">OK</button>`}

/* ======================= O'YIN STOLI */
function openTable(){$('#res').classList.remove('on');$('#table').classList.add('on');$('#table').style.setProperty('--tc',(GM[G.g]||{a:'#a855f7'}).a+'66');
 $('#board').style.display=G.e?'':'none';$('#dk').classList.toggle('on',G.g==='durak');$('#nd').classList.toggle('on',G.g==='nardy');$('#qk').classList.toggle('on',!!QK[G.g]);
 $('#dkt').style.display=G.e?'none':'';$('#rs').style.display=QK[G.g]?'none':'';$('#table').dataset.gm=G.g;$('#tti').innerHTML=`<span>${(GM[G.g]||{ic:''}).ic}</span>${gn(G.g)}`;$('#tpot').innerHTML=G.cur==='free'?(G.bot||G.botg?'🤖 '+t('bot'):t('free')):`🏆 ${fmt(G.stake*2*(1-(G.fee??CFG.fee)))}${cu(G.cur)}`;G.bjm=G.bjo=0;syncBack()}
function startGame(m){closeSheetSilent();closePot();const e=E[m.game];
 G={g:m.game,e,s:e&&e.init(),seat:m.seat,pl:m.players.map(p=>p.name),lv:m.players.map(p=>p.lvl),cur:m.cur,stake:m.stake,sel:null,anim:0,over:0,w:null,botg:m.bot,fl:!!(e&&e.flip)&&m.seat===1,opts:m.opts||{},fee:m.fee??CFG.fee};
 openTable();if(e)draw();else{if(G.g==='nardy')$('#nd').innerHTML='';if(QK[G.g])$('#qk').innerHTML='';bars()}beep(660,.1);hap('medium')}
function startLocal(g){const e=E[g];G={g,e,s:e.init(),seat:0,pl:[myName(),'🤖 Bot'],lv:[lvlOf(U).l,1],cur:'free',stake:0,sel:null,anim:0,over:0,w:null,bot:1,fl:false};openTable();draw()}
function draw(){const e=G.e,s=G.s,R=e.R,C=e.C,fl=G.fl,mine=s.turn===G.seat&&!G.over,ms=mine?e.moves(s):[],hint=new Set();
 if(e.from){if(G.sel)ms.forEach(m=>{if(m[0]===G.sel[0]&&m[1]===G.sel[1])hint.add(m[m.length-2]+','+m[m.length-1])})}else if(e.hint)ms.forEach(m=>hint.add(m[0]+','+m[1]));
 const ex=e.extra?e.extra(s):new Set(),ln=new Set((s.line||[]).map(x=>x+'')),A=G.anim;let h='';
 for(let dr=0;dr<R;dr++)for(let dc=0;dc<C;dc++){const r=fl?R-1-dr:dr,c=fl?C-1-dc:dc,k=r+','+c,p=e.pc(r,c,s);let cls='cell '+e.bg(r,c);
  if(G.sel&&G.sel[0]===r&&G.sel[1]===c)cls+=' sel';if(hint.has(k))cls+=' hint';
  if(s.lm&&((s.lm[0]===r&&s.lm[1]===c)||(s.fr&&s.fr[0]===r&&s.fr[1]===c)))cls+=' lm';if(ex.has(k))cls+=' chk';if(ln.has(k))cls+=' wl';
  let pie='';if(p){let a='',st='';
   if(A&&s.lm&&s.lm[0]===r&&s.lm[1]===c){a=e.anim;if(a==='mv')st=`--dx:${(fl?C-1-s.fr[1]:s.fr[1])-dc};--dy:${(fl?R-1-s.fr[0]:s.fr[0])-dr}`;if(a==='drop')st=`--dy:${-(r+1)}`}
   else if(A&&s.fl&&s.fl.some(x=>x[0]===r&&x[1]===c))a='flip';
   pie=`<i class="pc ${p[0]} ${a}" style="${st}">${p[1]}</i>`}
  h+=`<div class="${cls}" data-r="${r}" data-c="${c}">${pie}</div>`}
 const B=$('#board');B.className='b-'+G.g;B.style.cssText=`--n:${C};--rw:${R};--g:${GM[G.g].a}`;B.innerHTML=h;G.anim=0;bars()}
function bars(){const me=G.pl[G.seat]||'?',op=G.pl[1-G.seat]||'?',lv=G.lv||[1,1];$('#pbn').innerHTML=esc(me)+`<small>${t('lvl')} ${lv[G.seat]||1}</small>`;$('#ptn').innerHTML=esc(op)+`<small>${t('lvl')} ${lv[1-G.seat]||1}</small>`;$('#pba').textContent=me[0];$('#pta').textContent=[...op][0];
 $('#pta').style.background=avc(op);let my,sc=['',''],st;
 if(G.g==='durak'){const v=G.dv;my=v&&v.w===G.seat;if(v){sc=[v.h.length,v.o];st=v.win!=null?'…':my?(v.at===G.seat?t('yourAtk'):t('yourDef')):t('opp')}else st='…'}
 else if(G.g==='nardy'){const v=G.nv;my=v&&v.turn===G.seat&&v.win==null;if(v)sc=[v.off[G.seat]+'/15',v.off[1-G.seat]+'/15'];st=v?(my?t('yourturn'):t('opp')):'…'}
 else if(QK[G.g]){const v=G.qv;my=v&&!v.me&&v.win==null;if(v)sc=G.g==='bj'?[v.tot,(v.win!=null||v.draw)&&v.last?v.last.tot[1-G.seat]:'?']:[v.sc[G.seat],v.sc[1-G.seat]];st=v?`${t('round')} ${G.g==='hilo'?Math.min(v.rd,v.need)+'/'+v.need:v.rd}`:'…'}
 else{const s=G.s;my=s.turn===G.seat&&!G.over;if(G.g==='reversi'){const a=[0,1].map(k=>s.b.flat().filter(v=>v===k).length);sc=[a[G.seat],a[1-G.seat]]}st=G.over?'…':my?t('yourturn'):t('opp')}
 $('#pbs').textContent=sc[0];$('#pts').textContent=sc[1];$('#pb').classList.toggle('turn',!!my&&!G.over);$('#pt').classList.toggle('turn',!my&&!G.over&&!QK[G.g]);
 $('#status').textContent=st}
function tap(r,c){if(!G||!G.e||G.over||G.s.turn!==G.seat)return;const e=G.e,ms=e.moves(G.s);
 if(e.from){const sl=G.sel,mm=sl&&ms.find(m=>m[0]===sl[0]&&m[1]===sl[1]&&m[m.length-2]===r&&m[m.length-1]===c);if(mm)return play(mm);G.sel=ms.some(m=>m[0]===r&&m[1]===c)?[r,c]:null;hap();beep(700,.04)}
 else{const mm=ms.find(m=>e.hit(m,r,c));if(mm)return play(mm)}draw()}
function play(m){if(!G.bot)S({t:'move',d:m});step(m)}
function step(m){G.s=G.e.apply(G.s,m);G.sel=null;G.anim=1;hap();beep(G.s.turn===G.seat?420:520,.07);draw();if(G.s.pass)toast(t('pass'));
 const w=G.e.over(G.s);
 if(w!==null&&!G.over){G.over=1;G.w=w;bars();if(G.bot)return setTimeout(()=>showRes(w===-1?'draw':w===0?'win':'lose',''),700);S({t:'result',winner:w})}
 else if(G.bot&&!G.over&&G.s.turn===1)setTimeout(botMove,550+Math.random()*500)}
function botMove(){if(!G||!G.bot||G.over||G.s.turn!==1)return;const m=aiPick(G.g,G.s);if(m)step(m)}
function recv(d){if(!G||!G.e||G.over||G.s.turn===G.seat||!Array.isArray(d))return;const k=JSON.stringify(d);if(G.e.moves(G.s).some(m=>JSON.stringify(m)===k))step(d)}
function paid(m){if(m.user){U=m.user;chips(0)}if(!G)return;G.over=1;let r;
 if(G.cur!=='free'){r=m.amount>G.stake?'win':m.amount===G.stake&&m.w===-1?'draw':'lose'}else r=m.w===-1?'draw':m.w===G.seat?'win':'lose';
 const amt=G.cur==='free'?'':r==='win'?`+${fmt(m.amount-G.stake)}${cu(G.cur)}`:r==='draw'?t('refund'):`-${fmt(G.stake)}${cu(G.cur)}`;
 const delay={coin:3300,dice:1700,rps:1800,hilo:1100,bj:1500,pen:1700}[G.g]||(G.g==='nardy'?900:300);setTimeout(()=>G&&showRes(r,amt),delay)}
function showRes(r,amt){clearInterval(G&&G.iv);$('#resc').innerHTML=`<div class="trophy">${r==='win'?'🏆':r==='draw'?'🤝':'😵'}</div><div class="rt" style="${r==='win'?'background:var(--fire);-webkit-background-clip:text;background-clip:text;color:transparent':''}">${t(r)}</div><div class="num" style="font-size:22px;margin-bottom:12px;color:${r==='win'?'var(--ok)':r==='lose'?'var(--red)':'#fff'}">${amt}</div><button class="btn go" id="again">🔁 ${t('again')}</button><button class="btn" id="rok">${t('menu')}</button>`;
 $('#res').classList.add('on');jingle(r==='win');if(r==='win')confetti();try{tg.HapticFeedback.notificationOccurred(r==='win'?'success':'warning')}catch(e){}}
function confetti(n=50){const C=['#ffb11a','#ff6a1a','#ff2e63','#a855f7','#38d9ff','#2ee59d','#ffc83d'];for(let i=0;i<n;i++){const d=document.createElement('i');d.className='cf';d.style.cssText=`left:${Math.random()*100}vw;background:${C[i%C.length]};animation-delay:${Math.random()*.8}s;animation-duration:${2+Math.random()*1.4}s;border-radius:${Math.random()<.4?'50%':'2px'}`;document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}}
const ask=(q,f)=>tg&&tg.showConfirm&&tg.platform!=='unknown'?tg.showConfirm(q,f):f(confirm(q));
function endTable(){clearInterval(G&&G.iv);$('#res').classList.remove('on');$('#table').classList.remove('on');G=null;syncBack()}
function startTimer(left,mine){G.dl=Date.now()+left*1000;G.tl=left;clearInterval(G.iv);G.iv=setInterval(()=>{if(!G)return;const f=Math.max(0,(G.dl-Date.now())/(G.tl*1000)),i=$('#dkt i');i.style.width=f*100+'%';i.style.background=mine?(f<.25?'var(--red)':'var(--ok)'):'#94a3b8'},200)}
/* ---------- durak */
const SU=['♠','♥','♦','♣'],cs_=c=>c/9|0,cr=c=>6+c%9,RK=r=>({11:'J',12:'Q',13:'K',14:'A'}[r]||r);
const cardH=(id,cls='')=>{const s=SU[cs_(id)],r=RK(cr(id));return`<div class="cd ${cs_(id)%3?'red':''} ${cls}" data-id="${id}"><b>${r}<br>${s}</b><u>${s}</u><b class="br">${r}<br>${s}</b></div>`};
const beats=(a,d,tr)=>(cs_(a)===cs_(d)&&cr(d)>cr(a))||(cs_(d)===tr&&cs_(a)!==tr);
const und=v=>v.tb.map((p,i)=>p[1]==null?i:-1).filter(i=>i>=0),rks=v=>new Set(v.tb.flat().filter(x=>x!=null).map(cr));
const canAdd=(v,c)=>v.tb.length<v.cap&&(!v.tb.length||rks(v).has(cr(c)));
const canTr=(v,c)=>v.tr&&!v.tk&&v.tb.length&&v.tb.every(p=>p[1]==null)&&cr(c)===cr(v.tb[0][0])&&v.tb.length+1<=v.o;
const tgts=(v,c)=>und(v).filter(i=>beats(v.tb[i][0],c,v.ts));
function fan(sel,n){const el=$(sel),c0=el.querySelector('.cd');if(!c0)return;const w=el.clientWidth||300,cw=c0.offsetWidth,step=Math.min(cw+8,(w-cw-4)/Math.max(1,n-1));[...el.children].forEach((c,i)=>c.style.marginLeft=i?(step-cw)+'px':'0')}
function flip(fn){const old={},els={};$$('#dk .cd[data-id]').forEach(e=>{old[e.dataset.id]=e.getBoundingClientRect();els[e.dataset.id]=e.cloneNode(true)});
 const R=s=>$(s).getBoundingClientRect(),oppR=R('#dkopp'),deckR=R('#dkdeck'),discR=R('#dkdisc');fn();let k=0;const seen=new Set();
 $$('#dk .cd[data-id]').forEach(e=>{const id=e.dataset.id;seen.add(id);const n=e.getBoundingClientRect();let o=old[id],d=0;
  if(!o){o=e.closest('#dkme')?deckR:e.closest('#dktable')?oppR:deckR;d=(k++)*80}
  const dx=o.left+o.width/2-(n.left+n.width/2),dy=o.top+o.height/2-(n.top+n.height/2);
  if(Math.abs(dx)+Math.abs(dy)>3)e.animate([{transform:`translate(${dx}px,${dy}px) scale(${Math.min(1.5,o.width/n.width)})`},{transform:getComputedStyle(e).transform==='none'?'none':getComputedStyle(e).transform}],{duration:430,delay:d,easing:'cubic-bezier(.2,.9,.25,1)',fill:'backwards'})});
 const toDisc=(G.dv.ds||0)>(G.dsPrev||0);
 for(const id in old){if(seen.has(id))continue;const g=els[id],o=old[id],T=toDisc?discR:oppR;g.style.cssText=`position:fixed;left:${o.left}px;top:${o.top}px;width:${o.width}px;--cw:${o.width}px;margin:0;z-index:60;pointer-events:none`;document.body.appendChild(g);
  g.animate([{transform:'none',opacity:1},{transform:`translate(${T.left+T.width/2-o.left-o.width/2}px,${T.top+T.height/2-o.top-o.height/2}px) scale(.55) rotate(${toDisc?220:0}deg)`,opacity:toDisc?.15:.9}],{duration:520,easing:'ease-in'}).onfinish=()=>g.remove()}}
function renderDk(m){const v=m.v;G.dsPrev=G.dv?G.dv.ds:0;G.dv=v;if(m.bad)beep(160,.15);else beep(520,.05);
 if(G.dsel!=null&&!v.h.includes(G.dsel))G.dsel=null;if(v.w!==G.seat)G.dsel=null;
 const me=G.seat,att=v.at===me,tg_=G.dsel!=null&&v.w===me&&!att?tgts(v,G.dsel):[];
 flip(()=>{$('#dkopp').innerHTML=Array.from({length:v.o},(_,i)=>`<div class="cd back" data-id="o${i}"></div>`).join('');
  $('#dkdeck').innerHTML=v.dk?`<div class="tcw">${cardH(v.tc,'tr')}</div><div class="pile">${'<div class="cd back"></div>'.repeat(Math.min(3,v.dk))}<em>${v.dk}</em></div>`:`<div class="tsu ${cs_(v.ts)%3?'r':''}">${SU[v.ts]}</div>`;
  $('#dkdisc').innerHTML=v.ds?`<div class="pile">${'<div class="cd back"></div>'.repeat(Math.min(3,Math.ceil(v.ds/4)))}<em>${v.ds}</em></div>`:'';
  $('#dktable').innerHTML=v.tb.map((p,i)=>`<div class="pair" data-i="${i}">${cardH(p[0],tg_.includes(i)?'tgt':'')}${p[1]!=null?cardH(p[1],'dfn'):''}</div>`).join('');
  $('#dkme').innerHTML=v.h.map(c=>{let ok=false;if(v.win==null){if(att)ok=canAdd(v,c);else if(v.w===me)ok=tgts(v,c).length>0||!!canTr(v,c)}
   return cardH(c,(ok?'ok ':'dim ')+(G.dsel===c?'sel':''))}).join('');
  fan('#dkme',v.h.length);fan('#dkopp',v.o)});
 $('#dkact').innerHTML=v.win!=null?'':v.w===me?(!att?`<button class="btn" data-dk="take">✋ ${t('take')}</button>`+(G.dsel!=null&&canTr(v,G.dsel)?`<button class="btn go" data-dk="tr">↪ ${t('transfer')}</button>`:''):(v.tb.length&&(v.tk||!und(v).length)?`<button class="btn go" data-dk="done">${v.tk?t('done'):t('bita')}</button>`:'')):'';
 if(v.win!=null)G.w=v.win;else startTimer(m.left||40,v.w===me);bars()}
function dkSend(a,c,i){S({t:'dmove',a,c,i})}
function dkTap(id){const v=G.dv;if(!v||v.win!=null)return;const me=G.seat;
 if(v.at===me){if(canAdd(v,id)){hap();dkSend('att',id)}return}
 if(v.w!==me)return;const tg_=tgts(v,id),tr=canTr(v,id);
 if(tg_.length===1&&!tr)return dkSend('def',id,tg_[0]);if(!tg_.length&&tr)return dkSend('tr',id);
 if(tg_.length||tr){G.dsel=G.dsel===id?null:id;renderDk({v,left:Math.max(1,(G.dl-Date.now())/1000)})}}
/* ---------- nardi */
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const dieH=(n,cls='')=>`<div class="die ${cls}">${Array.from({length:9},(_,i)=>PIPS[n].includes(i)?'<i></i>':'<span></span>').join('')}</div>`;
function renderNd(m){const v=m.v,me=G.seat,S0=me===0?0:12,prev=G.nv;G.nv=v;if(m.bad)beep(160,.15);
 if(m.pass){toast(v.turn===me?t('pass'):'⏭ '+t('pass'))}
 const key=v.turn+':'+v.rolled.join(',')+':'+(prev&&prev.turn!==v.turn||!prev?Date.now():G.nkey&&G.nkey.split(':')[2]);const rolledNew=!prev||prev.turn!==v.turn||m.pass;
 if(G.nsel!=null&&!v.moves.some(x=>x[0]===G.nsel))G.nsel=null;
 const srcs=new Set(v.moves.map(x=>x[0])),tg_=new Set(v.moves.filter(x=>x[0]===G.nsel).map(x=>x[1]));
 const myCol=me===0?'w':'k',opCol=me===0?'k':'w';
 const pt=(abs,dn)=>{const c=v.pts[abs],n=Math.abs(c),own=c>0?0:1,col=own===0?'w':'k',pc=prev?Math.abs(prev.pts[abs]):n;
  let cs='';for(let i=0;i<Math.min(n,5);i++){const last=i===Math.min(n,5)-1;cs+=`<i class="nc ${col} ${last&&n>pc?'nw':''}">${last&&n>5?`<em>${n}</em>`:''}</i>`}
  return`<div class="np ${dn?'dn':''} ${srcs.has(abs)&&v.turn===me?'src':''} ${G.nsel===abs?'sel':''} ${tg_.has(abs)?'tgt':''}" data-p="${abs}">${cs}</div>`};
 const top=[],bot=[];for(let k=12;k<24;k++)top.push((k+S0)%24);for(let k=11;k>=0;k--)bot.push((k+S0)%24);
 const row=(arr,dn)=>arr.slice(0,6).map(a=>pt(a,dn)).join('')+'<div class="bar"></div>'+arr.slice(6).map(a=>pt(a,dn)).join('');
 const total=v.rolled[0]===v.rolled[1]?4:2,used=total-v.dice.length;
 let dz='';if(total===4)dz=[0,1,2,3].map(i=>dieH(v.rolled[0],(i<used?'used ':'')+(rolledNew?'roll':''))).join('');
 else{const rem=v.dice.slice();dz=v.rolled.map(d=>{const u=!rem.includes(d);if(!u)rem.splice(rem.indexOf(d),1);return dieH(d,(u?'used ':'')+(rolledNew?'roll':''))}).join('')}
 $('#nd').innerHTML=`<div class="nb"><div class="nf"><div class="nrow">${row(top,0)}</div><div class="nmid">${dz}</div><div class="nrow b">${row(bot,1)}</div></div></div>
 <div class="noff"><button disabled>${opCol==='w'?'⚪':'⚫'} ${t('offT')}: ${v.off[1-me]}/15</button><button class="${tg_.has(24)?'tgt':''}" data-p="24">${myCol==='w'?'⚪':'⚫'} ${tg_.has(24)?'⬆ '+t('bearOff'):t('offT')+': '+v.off[me]+'/15'}</button></div>`;
 if(rolledNew){beep(300,.05,'square');setTimeout(()=>beep(420,.05,'square'),120)}else beep(520,.05);
 if(v.win==null)startTimer(m.left||40,v.turn===me);else G.w=v.win;bars()}
function ndTap(p){const v=G&&G.nv;if(!v||v.win!=null||v.turn!==G.seat)return;
 if(G.nsel!=null&&v.moves.some(x=>x[0]===G.nsel&&x[1]===p)){const f=G.nsel;G.nsel=null;hap();S({t:'nmove',f,to:p});return}
 if(v.moves.some(x=>x[0]===p)){G.nsel=G.nsel===p?null:p;const ts=v.moves.filter(x=>x[0]===p);hap();beep(700,.04);renderNd({v,left:Math.max(1,(G.dl-Date.now())/1000)});return}
 G.nsel=null;renderNd({v,left:Math.max(1,(G.dl-Date.now())/1000)})}
/* ---------- tezkor o'yinlar */
const FACE={1:[0,0],2:[0,-90],3:[-90,0],4:[90,0],5:[0,90],6:[0,180]};let SPINC=0;
const cubeH=(id)=>`<div class="cube" id="${id}">${[1,2,3,4,5,6].map(n=>`<i class="f${n}">${Array.from({length:9},(_,i)=>PIPS[n].includes(i)?'<b></b>':'<span></span>').join('')}</i>`).join('')}</div>`;
const HANDS={r:'✊',s:'✌️',p:'✋'};
const penLine=L=>{const A={l:'⬅ '+t('pen_l'),c:'⬆ '+t('pen_c'),r:'➡ '+t('pen_r')};return`⚽ ${t('penShot')}: <b>${A[L.pen[0]]}</b> · 🧤 ${t('penDive')}: <b>${A[L.pen[1]]}</b>`};
const hiloCard=(r,s=0)=>{const su=SU[s%4],rk={11:'J',12:'Q',13:'K',14:'A'}[r]||r;return`<div class="cd ${s%4%3?'red':''}"><b>${rk}<br>${su}</b><u>${su}</u><b class="br">${rk}<br>${su}</b></div>`};
function renderQ(m){const v=m.v,me=G.seat,op=1-me,k=v.k,prev=G.qv,newRes=v.last&&JSON.stringify(v.last)!==JSON.stringify(prev&&prev.last);G.qv=v;
 const myName_=G.pl[me],opName=G.pl[op];let h='',msg='';
 const resTxt=w=>w===-1?t('rDraw'):w===me?t('rWin'):t('rLose');
 if(k==='dice'){h=`<div class="qarena"><div class="qside" id="qsL"><small>${esc(myName_)}</small><div class="dice3">${cubeH('c0')}${cubeH('c1')}</div><b class="num" id="qsum0">${v.last?v.last.dice[me][0]+v.last.dice[me][1]:'–'}</b></div><div class="qvs">VS</div><div class="qside" id="qsR"><small>${esc(opName)}</small><div class="dice3">${cubeH('c2')}${cubeH('c3')}</div><b class="num" id="qsum1">${v.last?v.last.dice[op][0]+v.last.dice[op][1]:'–'}</b></div></div>
  <div class="qmsg" id="qmsg"></div><div class="qbtns"><button class="btn go" data-q="roll" ${v.me||v.win!=null?'disabled':''}>${v.me?t('waitO'):t('roll')}</button></div>`}
 else if(k==='rps'){h=`<div class="qarena"><div class="qside" id="qsL"><small>${esc(myName_)}</small><span class="hand me" id="hm">${v.last&&!newRes?HANDS[v.last.rps[me]]:'✊'}</span></div><div class="qvs">VS</div><div class="qside" id="qsR"><small>${esc(opName)}</small><span class="hand" id="ho">${v.last&&!newRes?HANDS[v.last.rps[op]]:'✊'}</span></div></div>
  <div class="qmsg" id="qmsg">${v.me?t('waitO'):''}</div><div class="rpsb">${['r','p','s'].map(x=>`<button data-q="${x}" class="${G.qpick===x&&v.me?'on':''}" ${v.me||v.win!=null?'disabled':''}>${HANDS[x]}</button>`).join('')}</div>`}
 else if(k==='coin'){const L=v.last,picked=L&&L.picks,mine=picked?picked[me]:null;h=`<div style="perspective:800px;margin:10px 0"><div class="coin3" id="coin" style="transform:rotateY(${G.coinR||0}deg)"><i class="h"><div><span>🦅</span>${t('heads')}</div></i><i class="t"><div><span>①</span>${t('tails')}</div></i></div></div>
  <div class="qmsg">${mine?`${t('yourSide')}: <span style="color:${mine==='h'?'var(--gold)':'var(--ton)'}">${mine==='h'?'🦅 '+t('heads'):'① '+t('tails')}</span>${L.by===me?'':` <small>(${esc(opName)} ${t('coinChose')})</small>`}`:t('coinPick')}</div><div class="qmsg" id="qmsg"></div>
  <div class="qbtns">${picked?'':`<button class="btn go" data-q="h">🦅 ${t('heads')}</button><button class="btn ton" data-q="t">① ${t('tails')}</button>`}</div>`}
 else if(k==='hilo'){const L=v.last;h=`<div class="qmsg" style="color:var(--mu)">${t('guess')}</div><div class="hlc">${L&&newRes?hiloCard(L.hilo[0],1)+'<span style="font-size:26px">→</span>'+`<div id="hnew">${hiloCard(L.hilo[1],(L.hilo[1]*7)%4)}</div>`:hiloCard(v.card,(v.card*7)%4)}</div>
  <div class="qmsg" id="qmsg"></div><div class="qbtns"><button class="btn go" data-q="hi" ${v.me||v.win!=null?'disabled':''}>${t('hi')}</button><button class="btn" data-q="lo" ${v.me||v.win!=null?'disabled':''} style="background:linear-gradient(135deg,#38d9ff,#6366f1);color:#fff;border:0">${t('lo')}</button></div>
  <small>${t('round')} ${Math.min(v.rd,v.need)}/${v.need}${v.me&&v.win==null?' · '+t('waitO'):''}</small>`}
 else if(k==='bj'){const end=v.win!=null||v.draw,oh=v.oh||[],mh=v.hand||[],pm=G.bjm||0,po=G.bjo||0;G.bjm=mh.length;G.bjo=oh.length;
  const card=(c,i,p,wasHidden)=>c?hiloCard(c[0],c[1]).replace('class="cd','class="cd'+(i>=p?' deal':'')+(wasHidden?' fl':'')):`<div class="cd back${i>=p?' deal':''}"></div>`;
  const otot=end&&v.last?v.last.tot[op]:null,bust=v.tot>21;
  h=`<div class="bjt"><div class="bjrow"><div class="bjn"><small>${esc(opName)}</small>${v.odone&&!end?`<span class="tag">${t('bjDone')}</span>`:''}${otot!=null?`<span class="bjtot ${otot>21?'bust':otot===21?'bj':''}">${otot}</span>`:''}</div><div class="bjh">${oh.map((c,i)=>card(c,i,po,end&&prev&&prev.oh&&!prev.oh[i])).join('')}</div></div>
  <div class="bjmid"><span>21</span></div>
  <div class="bjrow"><div class="bjh">${mh.map((c,i)=>card(c,i,pm)).join('')}</div><div class="bjn"><small>${esc(myName_)}</small><span class="bjtot ${bust?'bust':v.tot===21?'bj':''}">${v.tot}</span>${bust?`<span class="tag" style="background:#ff4d6d33;color:var(--red)">${t('bust')}</span>`:v.stood&&!end?`<span class="tag">${t('bjStand')}</span>`:''}</div></div></div>
  <div class="qmsg" id="qmsg">${end?(v.draw?t('draw'):v.win===me?t('rWin'):t('rLose')):v.me?t('waitO'):''}</div>
  <div class="qbtns"><button class="btn go" data-q="hit" ${v.me||end?'disabled':''}>➕ ${t('hit')}</button><button class="btn" data-q="stand" ${v.me||end?'disabled':''}>✋ ${t('stand')}</button></div>`;
  if(mh.length+oh.length>pm+po)SFX.card()}
 else if(k==='pen'){G.penKeep=(!newRes&&G.penLock&&Date.now()<G.penLock)?$('#qk .pitch'):null;G.penKeepR=G.penKeep?$('#pres')?.innerHTML:'';const iK=v.kicker===me,gl=v.goals||[[],[]];const dots=i=>{const g=gl[i];let s='';for(let j=0;j<Math.max(v.n||5,g.length);j++)s+=`<i class="${g[j]===1?'g':g[j]===0?'m':''}"></i>`;return s};
  h=`<div class="pens"><div><small>${esc(myName_)}</small><div class="pdots">${dots(me)}</div></div><div><small>${esc(opName)}</small><div class="pdots">${dots(op)}</div></div></div>
  <div class="pitch"><div class="goal"><div class="net"></div><div class="keeper" id="kp">🧤</div></div><div class="pball" id="pball">⚽</div><div class="ptxt" id="ptx"></div></div><div class="pres" id="pres">${v.last&&!newRes?penLine(v.last):''}</div>
  <div class="qmsg" id="qmsg">${v.win!=null?'':v.me?(G.qpick&&'lcr'.includes(G.qpick)?t('yourPick')+': '+{l:'⬅ '+t('pen_l'),c:'⬆ '+t('pen_c'),r:'➡ '+t('pen_r')}[G.qpick]+' · ':'')+t('waitO'):iK?t('penKick'):t('penSave')}</div>
  <div class="qbtns pen3">${[['l','⬅'],['c','⬆'],['r','➡']].map(([x,a])=>`<button class="btn ${iK?'go':''}" data-q="${x}" ${v.me||v.win!=null?'disabled':''}>${a} ${t('pen_'+x)}</button>`).join('')}</div>`}
 $('#qk').innerHTML=(k==='bj'||k==='pen'?'':`<div class="qs"><b style="color:var(--ok)">${v.sc[me]}</b><span>:</span><b style="color:var(--red)">${v.sc[op]}</b></div><small>${k==='hilo'?'':`${t('round')} ${v.rd} · ${wTxt(k,v.need)}`}</small>`)+h;
 // animatsiyalar
 if(k==='dice'){const set=(id,n,anim)=>{const c=$('#'+id);if(!c)return;const[x,y]=FACE[n];const s=anim?++SPINC*720:0;if(!anim)c.style.transition='none';c.style.transform=`rotateX(${x+s}deg) rotateY(${y+s}deg)`};
  if(v.last){const d=v.last.dice;[[d[me][0],'c0'],[d[me][1],'c1'],[d[op][0],'c2'],[d[op][1],'c3']].forEach(([n,id])=>{set(id,1,0);if(newRes)requestAnimationFrame(()=>requestAnimationFrame(()=>{$('#'+id).style.transition='';set(id,n,1)}));else set(id,n,0)});
   if(newRes){['qsum0','qsum1'].forEach(i=>$('#'+i).style.opacity=0);beep(250,.3,'sawtooth',.03);setTimeout(()=>{['qsum0','qsum1'].forEach(i=>{const e=$('#'+i);if(e)e.style.opacity=1});const w=v.last.w;const q=$('#qmsg');if(q)q.textContent=resTxt(w);if(w>=0){const e=$(w===me?'#qsL':'#qsR');if(e)e.classList.add('win')}beep(w===me?880:w===-1?440:220,.15)},1150)}
   else{const q=$('#qmsg');if(q)q.textContent=resTxt(v.last.w)}}}
 if(k==='rps'&&v.last&&newRes){const hm=$('#hm'),ho=$('#ho');hm.textContent=ho.textContent='✊';hm.classList.add('shake');ho.classList.add('shake');[0,450,900].forEach(d=>setTimeout(()=>beep(330,.06),d));
  setTimeout(()=>{hm.classList.remove('shake');ho.classList.remove('shake');hm.textContent=HANDS[v.last.rps[me]];ho.textContent=HANDS[v.last.rps[op]];const w=v.last.w,q=$('#qmsg');if(q&&!v.me)q.textContent=resTxt(w);if(w>=0){const e=$(w===me?'#qsL':'#qsR');if(e)e.classList.add('win')}beep(w===me?880:w===-1?440:220,.15)},1400)}
 if(k==='coin'&&v.last&&newRes){const side=v.last.coin,base=(G.coinR||0)-((G.coinR||0)%360)+360*8+(side?180:0);G.coinR=base;requestAnimationFrame(()=>requestAnimationFrame(()=>{const c=$('#coin');if(c)c.style.transform=`rotateY(${base}deg)`}));
  let i=0;const tk=setInterval(()=>{beep(900,.02,'square',.03);if(++i>16)clearInterval(tk)},150);setTimeout(()=>{const q=$('#qmsg');if(q)q.textContent=(side?'① '+t('tails'):'🦅 '+t('heads'))+'!';beep(v.last.w===me?880:220,.2)},3050)}
 if(k==='hilo'&&v.last&&newRes){const n=$('#hnew .cd');if(n)n.classList.add('fl');const ok=v.last.ok[me],q=$('#qmsg');if(q)q.innerHTML=`<span style="color:${ok?'var(--ok)':'var(--red)'}">${ok?'✅ '+t('ok'):'❌ '+t('nok')}</span> <small>· ${esc(opName)}: ${v.last.ok[op]?'✅':'❌'}</small>`;beep(ok?880:220,.15);
  if(v.win==null)setTimeout(()=>{if(G&&G.qv===v)renderQ({v:{...v,last:v.last},left:m.left})},1300)}
 if(k==='pen'&&G.penKeep){const np=$('#qk .pitch');if(np)np.replaceWith(G.penKeep);const pr=$('#pres');if(pr)pr.innerHTML=G.penKeepR;G.penKeep=null}
 if(k==='pen'&&v.last&&newRes){const Lr=v.last,pb=$('#pball'),kp=$('#kp'),tx=$('#ptx');G.penLock=Date.now()+1900;SFX.kick();requestAnimationFrame(()=>requestAnimationFrame(()=>{pb&&pb.classList.add('to-'+Lr.pen[0]);kp&&kp.classList.add('dv-'+Lr.pen[1])}));
  setTimeout(()=>{if(!tx)return;tx.textContent=Lr.goal?t('goal'):t('save');tx.className='ptxt show '+(Lr.goal?'g':'s');const pr=$('#pres');if(pr)pr.innerHTML=penLine(Lr);if(Lr.goal){SFX.cheer();const n=$('.net');n&&n.classList.add('shake')}else SFX.bounce(.7);hap('medium')},620)}
 if(k==='dice'&&v.last&&newRes)SFX.dice();if(k==='coin'&&v.last&&newRes)SFX.launch();if(k==='hilo'&&v.last&&newRes)SFX.card();
 if(v.win==null&&!v.draw)startTimer(m.left||15,!v.me);bars()}
/* ======================= hodisalar */
on('[data-g]',x=>sheet(x.dataset.g));
on('[data-pot]',x=>{const k=x.dataset.pot;if(k==='jackpot'?!enabled('jackpot'):!enabled('arena'))return toast(t('e_off'));if($('#pot').classList.contains('on')&&PKEY!==k){S({t:'unwatch'});PKEY=k;PS=null;S({t:'pot',key:k});drawPot(true);SFX.tap();return}openPot(k)});
on('[data-pick]',x=>pickSheet(x.dataset.pick));
on('[data-pg]',x=>{const m=x.dataset.pm;sheet(x.dataset.pg,m==='create')});
on('[data-mode]',x=>{SH.mode=x.dataset.mode;SFX.tap();drawSheet()});on('[data-deck]',x=>{SH.deck=+x.dataset.deck;SFX.tap();drawSheet()});on('[data-tr]',x=>{SH.tr=+x.dataset.tr;SFX.tap();drawSheet()});
on('#tplay',()=>{WANTTOK=1;pickSheet('quick')});on('#tclaim',()=>{hap('heavy');S({t:'tokdaily'})});on('[data-task]',x=>{hap('medium');S({t:'task',id:x.dataset.task})});on('[data-rc]',()=>{LBQ={...lbq(),by:'ref'};show('top');SFX.tap()});on('[data-tst]',x=>{SH.tst=+x.dataset.tst;hap();SFX.tap();drawSheet()});on('[data-w]',x=>{SH.w=+x.dataset.w;hap();SFX.tap();drawSheet()});on('[data-st]',x=>{SH.st=+x.dataset.st;hap();SFX.tap();drawSheet()});on('#rulesb',()=>{SH.rules=!SH.rules;drawSheet()});on('#priv',x=>{SH.priv=x.checked?1:0});
on('#goq',goQuick);on('#goc',goCreate);on('#gobot',goBot);on('#cx',()=>{S({t:'cancel'});MYROOM=null;if(SH){SH.q=0;SH.wait=null;drawSheet()}});
on('#sh',(x,e)=>{if(e.target===x)closeSheet()});on('[data-close]',closeSheetSilent);
const shareL=(l,txt)=>{const u='https://t.me/share/url?url='+encodeURIComponent(l)+'&text='+encodeURIComponent(txt||t('shareTxt'));tg&&tg.openTelegramLink?tg.openTelegramLink(u):window.open(u)};
on('#invl',x=>shareL(x.dataset.l));on('#pshare',x=>shareL(x.dataset.l,t('arenaInv')));on('#shr',x=>shareL(x.dataset.l));
on('[data-join]',x=>{$('#res').classList.remove('on');hap('medium');SFX.tap();S({t:'join',id:x.dataset.join})});on('[data-rf]',x=>{RF=x.dataset.rf;drawRoomsOnly()});
on('#livebtn',liveSheet);on('#potx',closePot);on('#poth',potHist);on('#poti',potInfo);
on('#potsnd',x=>{SND=!SND;LS.set('snd',SND?1:0);x.innerHTML=SND?SVGI.snd:SVGI.mute;SFX.tap()});
on('#potfr',()=>{if(PKEY&&PKEY.startsWith('ap'))return;WANTPRIV=1;S({t:'unwatch'});S({t:'potnew',tier:PKEY&&PKEY.startsWith('arena:')?+PKEY.split(':')[1]:(CFG.arena_tiers||[50])[0]});SFX.whoosh()});
on('[data-tg]',x=>{TG=x.dataset.tg;$$('[data-tg]').forEach(b=>b.classList.toggle('on',b===x));drawTg();SFX.tap()});
on('[data-pq]',x=>{const v=x.dataset.pq==='max'?Math.floor(U.star):x.dataset.pq;$('#pamt').value=v;hap();SFX.tap()});
on('#pbet',()=>{const a=+$('#pamt').value;if(!a)return toast(t('amount')+'?');if(a>(+U.star||0)){toast('⚠️ '+t('e_balance'));SFX.error();return}LS.set('pa_'+(PKEY==='jackpot'?'jackpot':'arena'),a);hap('medium');S({t:'potbet',key:PKEY,amount:a})});
on('#pcan',()=>S({t:'potcancel',key:PKEY}));
on('[data-v]',x=>{if($('#pot').classList.contains('on'))closePot();show(x.dataset.v)});on('[data-gc]',x=>{GC=x.dataset.gc;SFX.tap();drawGames()});
on('[data-wt2]',x=>{WT=x.dataset.wt2;show('wallet')});
on('[data-per]',x=>{LBQ={...lbq(),per:x.dataset.per};drawTop(null);S({t:'lb',...LBQ});SFX.tap()});on('[data-by]',x=>{LBQ={...lbq(),by:x.dataset.by};drawTop(null);S({t:'lb',...LBQ});SFX.tap()});
on('[data-wt]',x=>{WT=x.dataset.wt;if(WT==='wd')S({t:'wds'});if(WT==='hist')S({t:'hist'});SFX.tap();drawWallet()});on('[data-dm]',x=>{DM=x.dataset.dm;SFX.tap();drawWallet()});on('[data-da]',x=>{DSEL[DM]=+x.dataset.da;hap();SFX.tap();drawWallet()});
on('[data-wm]',x=>{WM=x.dataset.wm;SFX.tap();drawWallet()});
document.addEventListener('input',e=>{if(e.target.id==='damt'){const v=+e.target.value;if(v>0)DSEL[DM]=v;const h=$('#dhint');if(h)h.innerHTML=DM==='ton'?`${t('youGet')}: <b>≈ ${fmt(Math.round(DSEL.ton*CFG.rate))} ⭐</b>`:`${t('youGet')}: <b>${fmt(DSEL.star)} ⭐</b> · 1:1`;const b=$('#dgo');if(b&&DM==='star')b.textContent=`⭐ ${t('dep')} ${fmt(DSEL.star)} Stars`}
 if(e.target.id==='wamt'){LS.set('wda',e.target.value);const g=$('#wget');if(g)g.innerHTML=wdGet(+e.target.value||0)}if(e.target.id==='waddr')LS.set(WM==='star'?'wduser':'wdaddr',e.target.value.trim())});
on('#dgo',()=>{const v=DSEL[DM];if(!(v>0))return;hap('medium');SFX.tap();S({t:'deposit',method:DM,amount:v})});
on('#tcon',()=>{if(!TC){loadTC();return toast('…')}TC.openModal()});on('#tcoff',()=>{TC&&TC.disconnect();U.wallet='';drawWallet()});
on('#wmax',()=>{$('#wamt').value=Math.floor(U.star);$('#wamt').dispatchEvent(new Event('input',{bubbles:true}))});on('#wfill',()=>{$('#waddr').value=U.wallet;LS.set('wdaddr',U.wallet)});
on('#wgo',()=>{const a=+$('#wamt').value,ad=$('#waddr').value.trim(),st=WM==='star',mn=st?CFG.min_wd_star:CFG.min_wd;if(a<mn)return toast(t('wdMin')+' '+fmt(mn)+' ⭐');if(a>U.star)return toast('⚠️ '+t('e_balance'));
 if(st?!/^@?[A-Za-z][A-Za-z0-9_]{3,31}$/.test(ad):!/^(EQ|UQ|kQ|0Q)[A-Za-z0-9_-]{46}$/.test(ad))return toast('⚠️ '+t(st?'e_uname':'e_addr'));
 ask(`${t('wd')} ${fmt(a)} ⭐ → ${st?ad:ad.slice(0,6)+'…'+ad.slice(-4)}?`,ok=>{if(ok)S({t:'wd',amount:a,addr:ad,method:WM})})});
on('#pgo',()=>{const c=$('#pcode').value.trim();if(c){hap('medium');S({t:'promo',code:c})}});on('#dclaim',()=>{hap('heavy');S({t:'daily'})});
on('[data-gw]',x=>{hap('medium');SFX.tap();S({t:'gwjoin',id:+x.dataset.gw})});
on('#subchk',()=>{S({t:'subcheck'});SFX.tap()});
on('[data-chan]',x=>{const c=x.dataset.chan;const u=c.startsWith('http')?c:'https://t.me/'+c.replace(/^@/,'');tg&&tg.openTelegramLink?tg.openTelegramLink(u):window.open(u)});
on('[data-cpy]',x=>{try{navigator.clipboard.writeText(x.dataset.cpy)}catch(e){}toast('⧉ '+t('copied'));hap();SFX.tap()});
on('[data-lang]',x=>{lang=x.dataset.lang;LS.set('lang',lang);document.documentElement.lang=lang;chips();redraw();drawMe()});
on('[data-bg]',x=>{BGM=x.dataset.bg;LS.set('bg',BGM);applyBg();drawMe()});on('[data-snd]',x=>{SND=x.dataset.snd==='1';LS.set('snd',SND?1:0);drawMe();SFX.coin()});
on('[data-rx]',x=>{if(G&&!G.bot)S({t:'chat',text:x.dataset.rx});else fly(x.dataset.rx,true);SFX.pop()});
const resign=()=>{if(G&&!G.over)ask(t('resign')+'?',ok=>{if(!ok||!G)return;if(G.bot){G.over=1;showRes('lose','')}else{G.w=1-G.seat;S({t:'leave'})}});else if(G)endTable()};
on('#rs',resign);on('#tback',resign);
on('#rok',()=>{endTable();show('home')});on('#rclose',()=>$('#res').classList.remove('on'));
on('#again',()=>{const q=LASTQ||{},lb=G&&G.bot;endTable();if(!q.g)return show('home');if(lb)return startLocal(q.g);sheet(q.g);SH.mode=q.mode||'paid';SH.st=q.st||SH.st;SH.deck=q.deck||36;SH.tr=q.tr||0;SH.w=q.w||SH.w;SH.tst=q.tst||SH.tst;drawSheet();if(SH.mode==='bot')goBot();else goQuick()});
on('[data-dk]',x=>{const a=x.dataset.dk;if(a==='tr')dkSend('tr',G.dsel);else dkSend(a)});
on('[data-q]',x=>{if(!G||!G.qv)return;G.qpick=x.dataset.q;hap('medium');SFX.tap();S({t:'qmove',v:x.dataset.q})});
on('[data-p]',x=>{if(G&&G.g==='nardy')ndTap(+x.dataset.p)});
$('#board').addEventListener('click',ev=>{const x=ev.target.closest('.cell');if(x)tap(+x.dataset.r,+x.dataset.c)});
$('#dkme').addEventListener('click',ev=>{const x=ev.target.closest('.cd');if(x)dkTap(+x.dataset.id)});
$('#dktable').addEventListener('click',ev=>{const x=ev.target.closest('.pair');if(!x||G.dsel==null)return;const i=+x.dataset.i;if(tgts(G.dv,G.dsel).includes(i)){const c=G.dsel;G.dsel=null;dkSend('def',c,i)}});
/* Telegram orqaga tugmasi */
function syncBack(){if(!tg||!tg.BackButton)return;const any=$('#sh').classList.contains('on')||$('#pot').classList.contains('on')||$('#table').classList.contains('on');any?tg.BackButton.show():tg.BackButton.hide()}
if(tg&&tg.BackButton)tg.BackButton.onClick(()=>{if($('#res').classList.contains('on')&&!G)return $('#res').classList.remove('on');if($('#sh').classList.contains('on'))return closeSheet();if($('#table').classList.contains('on'))return resign();if($('#pot').classList.contains('on'))return closePot()});

/* ======================= fon effektlari */
function applyBg(){document.body.className='bg-'+BGM}
(function(){const cv=$('#fx'),cx=cv.getContext('2d');let W,H,P=[],dpr=Math.min(devicePixelRatio||1,2),mode=null,shoot=null;
 const rs=()=>{W=cv.width=innerWidth*dpr;H=cv.height=innerHeight*dpr};rs();addEventListener('resize',rs);
 const mk=(y)=>{const m=BGM;if(m==='fire')return{x:Math.random()*W,y:y??H+Math.random()*H*.3,r:(.8+Math.random()*2.2)*dpr,v:(.35+Math.random()*1.1)*dpr,d:Math.random()*6.28,l:1,h:15+Math.random()*35};
  if(m==='cosmos')return{x:Math.random()*W,y:Math.random()*H,r:(.3+Math.random()*1.4)*dpr,tw:Math.random()*6.28,s:.01+Math.random()*.04};
  if(m==='grid')return{x:Math.random()*W,y:y??H+10,r:(.6+Math.random()*1.4)*dpr,v:(.3+Math.random()*.7)*dpr,d:0,l:1,h:180+Math.random()*140};
  return{x:Math.random()*W,y:y??Math.random()*H,r:(.6+Math.random()*1.9)*dpr,v:(.25+Math.random()*.8)*dpr,d:Math.random()*6.28,o:.25+Math.random()*.55}};
 (function f(){requestAnimationFrame(f);if(mode!==BGM){mode=BGM;P=[];const n={fire:55,cosmos:120,snow:50,grid:30,off:0}[mode]||0;for(let i=0;i<n;i++)P.push(mk(mode==='fire'||mode==='grid'?Math.random()*H:undefined))}
  cx.clearRect(0,0,W,H);if(mode==='off'||document.hidden||$('#table').classList.contains('on'))return;
  for(const s of P){if(mode==='fire'||mode==='grid'){s.y-=s.v;s.d+=.02;s.x+=Math.sin(s.d)*.5*dpr;s.l=Math.min(1,s.y/H*1.3);if(s.y<-10)Object.assign(s,mk(H+10));
    cx.beginPath();cx.fillStyle=`hsla(${s.h},100%,${55+s.l*15}%,${.25+s.l*.6})`;cx.shadowColor=`hsl(${s.h},100%,55%)`;cx.shadowBlur=s.r*5;cx.arc(s.x,s.y,s.r*(.5+s.l*.6),0,6.28);cx.fill()}
   else if(mode==='cosmos'){s.tw+=s.s;cx.beginPath();cx.fillStyle=`rgba(255,255,255,${.25+Math.abs(Math.sin(s.tw))*.7})`;cx.shadowBlur=0;cx.arc(s.x,s.y,s.r,0,6.28);cx.fill()}
   else{s.y+=s.v;s.d+=.012;s.x+=Math.sin(s.d)*.35*dpr;if(s.y>H+4)Object.assign(s,mk(-4));cx.beginPath();cx.fillStyle='rgba(255,255,255,'+s.o+')';cx.shadowColor='#fff';cx.shadowBlur=s.r*3;cx.arc(s.x,s.y,s.r,0,6.28);cx.fill()}}
  if(mode==='cosmos'){if(!shoot&&Math.random()<.006)shoot={x:Math.random()*W*.7,y:Math.random()*H*.4,vx:(7+Math.random()*5)*dpr,vy:(3+Math.random()*2)*dpr,l:1};
   if(shoot){const g=cx.createLinearGradient(shoot.x,shoot.y,shoot.x-shoot.vx*12,shoot.y-shoot.vy*12);g.addColorStop(0,`rgba(255,255,255,${shoot.l})`);g.addColorStop(1,'rgba(255,255,255,0)');cx.strokeStyle=g;cx.lineWidth=2*dpr;cx.beginPath();cx.moveTo(shoot.x,shoot.y);cx.lineTo(shoot.x-shoot.vx*12,shoot.y-shoot.vy*12);cx.stroke();shoot.x+=shoot.vx;shoot.y+=shoot.vy;shoot.l-=.012;if(shoot.l<=0||shoot.x>W)shoot=null}}})();
})();
iconize(document.body);applyBg();drawNav('home');drawHome();chips();connect();
setInterval(()=>{if(CFG.rc_end)$$('[data-rcl]').forEach(e=>e.textContent=fmtLeft(CFG.rc_end-Date.now()/1000))},1000);
setInterval(()=>{for(const v of Object.values(POTSUM))if(v.st==='count')v.left=Math.max(0,v.left-1);if(CUR==='home')drawLiveCards()},1000);
