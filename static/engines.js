/* StarUm — taxta o'yinlar dvigateli (shaxmat, shashka, 4 qator, gomoku, reversi, krestik-nolik) va botlar */
//ENG-START
const inb=(r,c,n=8)=>r>=0&&r<n&&c>=0&&c<n;
const grid=(R,C,v)=>Array.from({length:R},()=>Array(C).fill(v));
const D8=[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
function five(b,r,c,k,R,C,len){for(const[a,e]of[[0,1],[1,0],[1,1],[1,-1]]){const ln=[[r,c]];for(const g of[1,-1]){let rr=r+a*g,cc=c+e*g;while(rr>=0&&rr<R&&cc>=0&&cc<C&&b[rr][cc]===k){ln.push([rr,cc]);rr+=a*g;cc+=e*g}}if(ln.length>=len)return ln}return null}
const empt=(s,R,C)=>{const o=[];for(let r=0;r<R;r++)for(let c=0;c<C;c++)if(s.b[r][c]===-1)o.push([r,c]);return o};
/* shaxmat (rokirovka / en passant yo'q) */
const colr=p=>p===p.toUpperCase()?0:1;
function chPseudo(b,r,c){const p=b[r][c],k=colr(p),y=p.toLowerCase(),o=[];
 const add=(rr,cc)=>{if(inb(rr,cc)&&(!b[rr][cc]||colr(b[rr][cc])!==k))o.push([r,c,rr,cc])};
 if(y==='p'){const d=k?1:-1;if(inb(r+d,c)&&!b[r+d][c]){o.push([r,c,r+d,c]);if(r===(k?1:6)&&!b[r+2*d][c])o.push([r,c,r+2*d,c])}
  for(const dc of[-1,1])if(inb(r+d,c+dc)&&b[r+d][c+dc]&&colr(b[r+d][c+dc])!==k)o.push([r,c,r+d,c+dc])}
 else if(y==='n'){for(const[a,e]of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]])add(r+a,c+e)}
 else if(y==='k'){for(const[a,e]of D8)add(r+a,c+e)}
 else{const dirs=y==='b'?D8.slice(0,4):y==='r'?D8.slice(4):D8;
  for(const[a,e]of dirs){let rr=r+a,cc=c+e;while(inb(rr,cc)){if(!b[rr][cc])o.push([r,c,rr,cc]);else{if(colr(b[rr][cc])!==k)o.push([r,c,rr,cc]);break}rr+=a;cc+=e}}}
 return o}
function chAtt(b,k,r,c){const e=1-k;for(let i=0;i<8;i++)for(let j=0;j<8;j++){const p=b[i][j];if(!p||colr(p)!==e)continue;
 if(p.toLowerCase()==='p'){if(i+(e?1:-1)===r&&Math.abs(j-c)===1)return 1}else if(chPseudo(b,i,j).some(m=>m[2]===r&&m[3]===c))return 1}return 0}
function chKing(b,k){const K=k?'k':'K';for(let i=0;i<8;i++)for(let j=0;j<8;j++)if(b[i][j]===K)return[i,j]}
function chMake(b,m){const n=b.map(r=>r.slice());let p=n[m[0]][m[1]];n[m[0]][m[1]]='';if(p.toLowerCase()==='p'&&(m[2]===0||m[2]===7))p=colr(p)?'q':'Q';n[m[2]][m[3]]=p;return n}
function chMoves(s){const k=s.turn,o=[];for(let i=0;i<8;i++)for(let j=0;j<8;j++){const p=s.b[i][j];if(!p||colr(p)!==k)continue;
 for(const m of chPseudo(s.b,i,j)){const n=chMake(s.b,m),[kr,kc]=chKing(n,k);if(!chAtt(n,k,kr,kc))o.push(m)}}return o}
const GLY={k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
/* shashka (majburiy urish, damka bir qadam) */
const ckc=p=>p==='w'||p==='W'?0:1;
function ckJumps(b,r,c,k,king,path,caps,out){const dirs=king?D8.slice(0,4):k?[[1,1],[1,-1]]:[[-1,1],[-1,-1]];let any=0;
 for(const[a,e]of dirs){const mr=r+a,mc=c+e,lr=r+2*a,lc=c+2*e;
  if(inb(lr,lc)&&b[mr][mc]&&ckc(b[mr][mc])!==k&&!caps.includes(mr*8+mc)&&(!b[lr][lc]||(lr===path[0]&&lc===path[1]))){any=1;
   const np=[...path,lr,lc];if(!king&&lr===(k?7:0))out.push(np);else ckJumps(b,lr,lc,k,king,np,[...caps,mr*8+mc],out)}}
 if(!any&&path.length>2)out.push(path)}
function ckMoves(s){const k=s.turn,J=[],M=[],b=s.b;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p||ckc(p)!==k)continue;
 const king=p===p.toUpperCase();ckJumps(b,r,c,k,king,[r,c],[],J);
 for(const[a,e]of king?D8.slice(0,4):k?[[1,1],[1,-1]]:[[-1,1],[-1,-1]])if(inb(r+a,c+e)&&!b[r+a][c+e])M.push([r,c,r+a,c+e])}
 return J.length?J:M}
/* reversi */
function rvFlips(b,r,c,k){if(b[r][c]!==-1)return[];const f=[];for(const[a,e]of D8){const l=[];let rr=r+a,cc=c+e;while(inb(rr,cc)&&b[rr][cc]===1-k){l.push([rr,cc]);rr+=a;cc+=e}if(l.length&&inb(rr,cc)&&b[rr][cc]===k)f.push(...l)}return f}
const rvHas=(b,k)=>{for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(rvFlips(b,r,c,k).length)return 1;return 0};
const line=(R,C,L,anim)=>({R,C,anim,init:()=>({b:grid(R,C,-1),turn:0}),moves:s=>empt(s,R,C),
 apply:(s,m)=>{const b=s.b.map(r=>r.slice());b[m[0]][m[1]]=s.turn;const ln=five(b,m[0],m[1],s.turn,R,C,L);return{b,turn:1-s.turn,lm:[m[0],m[1]],line:ln,w:ln?s.turn:undefined}},
 over:s=>s.w!==undefined?s.w:s.b.every(r=>r.every(v=>v!==-1))?-1:null,bg:()=>'',hit:(m,r,c)=>m[0]===r&&m[1]===c});
const E={
chess:{R:8,C:8,from:1,flip:1,anim:'mv',
 init:()=>{const b=grid(8,8,''),R='rnbqkbnr';for(let c=0;c<8;c++){b[0][c]=R[c];b[1][c]='p';b[6][c]='P';b[7][c]=R[c].toUpperCase()}return{b,turn:0}},
 moves:chMoves,apply:(s,m)=>({b:chMake(s.b,m),turn:1-s.turn,lm:[m[2],m[3]],fr:[m[0],m[1]]}),
 over:s=>{let n=0;s.b.forEach(r=>r.forEach(p=>{if(p&&p.toLowerCase()!=='k')n++}));if(!n)return -1;
  if(chMoves(s).length)return null;const[kr,kc]=chKing(s.b,s.turn);return chAtt(s.b,s.turn,kr,kc)?1-s.turn:-1},
 pc:(r,c,s)=>{const p=s.b[r][c];return p?[colr(p)?'pb':'pw',GLY[p.toLowerCase()]+'\uFE0E']:null},bg:(r,c)=>(r+c)%2?'d':'l',
 extra:s=>{const[kr,kc]=chKing(s.b,s.turn);return chAtt(s.b,s.turn,kr,kc)?new Set([kr+','+kc]):new Set()}},
checkers:{R:8,C:8,from:1,flip:1,anim:'mv',
 init:()=>{const b=grid(8,8,'');for(let r=0;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2){if(r<3)b[r][c]='b';if(r>4)b[r][c]='w'}return{b,turn:0}},
 moves:ckMoves,
 apply:(s,m)=>{const b=s.b.map(r=>r.slice());let p=b[m[0]][m[1]];b[m[0]][m[1]]='';
  for(let i=0;i+3<m.length;i+=2)if(Math.abs(m[i]-m[i+2])===2)b[(m[i]+m[i+2])/2][(m[i+1]+m[i+3])/2]='';
  const lr=m[m.length-2],lc=m[m.length-1],k=ckc(p);if(p===p.toLowerCase()&&lr===(k?7:0))p=p.toUpperCase();b[lr][lc]=p;
  return{b,turn:1-s.turn,lm:[lr,lc],fr:[m[0],m[1]]}},
 over:s=>ckMoves(s).length?null:1-s.turn,
 pc:(r,c,s)=>{const p=s.b[r][c];if(!p)return null;return['ck'+ckc(p),p===p.toUpperCase()?'♛\uFE0E':'']},bg:(r,c)=>(r+c)%2?'d':'l'},
connect4:{R:6,C:7,anim:'drop',init:()=>({b:grid(6,7,-1),turn:0}),
 moves:s=>{const o=[];for(let c=0;c<7;c++)if(s.b[0][c]===-1)o.push([c]);return o},
 apply:(s,m)=>{const c=m[0],b=s.b.map(r=>r.slice());let r=5;while(b[r][c]!==-1)r--;b[r][c]=s.turn;const ln=five(b,r,c,s.turn,6,7,4);
  return{b,turn:1-s.turn,lm:[r,c],line:ln,w:ln?s.turn:undefined}},
 over:s=>s.w!==undefined?s.w:s.b[0].every(v=>v!==-1)?-1:null,pc:(r,c,s)=>s.b[r][c]===-1?null:['d'+s.b[r][c],''],bg:()=>'',hit:(m,r,c)=>m[0]===c},
gomoku:{...line(15,15,5,'pop'),pc:(r,c,s)=>s.b[r][c]===-1?null:['s'+s.b[r][c],'']},
ttt:{...line(3,3,3,'pop'),pc:(r,c,s)=>s.b[r][c]===-1?null:['x'+s.b[r][c],s.b[r][c]?'◯':'✕']},
reversi:{R:8,C:8,anim:'pop',hint:1,
 init:()=>{const b=grid(8,8,-1);b[3][3]=1;b[4][4]=1;b[3][4]=0;b[4][3]=0;return{b,turn:0}},
 moves:s=>{const o=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(rvFlips(s.b,r,c,s.turn).length)o.push([r,c]);return o},
 apply:(s,m)=>{const b=s.b.map(r=>r.slice()),k=s.turn,f=rvFlips(b,m[0],m[1],k);b[m[0]][m[1]]=k;f.forEach(([r,c])=>b[r][c]=k);
  const n={b,turn:1-k,lm:[m[0],m[1]],fl:f};if(!rvHas(b,1-k)){n.turn=k;n.pass=rvHas(b,k)?1:0}return n},
 over:s=>{if(rvHas(s.b,s.turn)||rvHas(s.b,1-s.turn))return null;const a=s.b.flat().filter(v=>v===0).length,b=s.b.flat().filter(v=>v===1).length;return a>b?0:b>a?1:-1},
 pc:(r,c,s)=>s.b[r][c]===-1?null:['rv'+s.b[r][c],''],bg:()=>'',hit:(m,r,c)=>m[0]===r&&m[1]===c}};
/* botlar (oddiy baholash) */
const PV={p:1,n:3,b:3,r:5,q:9,k:0};
function gsc(b,r,c,k){let t=0;for(const[a,e]of[[0,1],[1,0],[1,1],[1,-1]]){let n=1,o=0;for(const g of[1,-1]){let rr=r+a*g,cc=c+e*g;while(inb(rr,cc,15)&&b[rr][cc]===k){n++;rr+=a*g;cc+=e*g}if(inb(rr,cc,15)&&b[rr][cc]===-1)o++}t+=[0,1,10,100,1500,1e5][Math.min(n,5)]*(o===2?1:o===1?.4:0)}return t}
const HE={
chess:(s,m,n,me)=>{const t=s.b[m[2]][m[3]];let cap=t?PV[t.toLowerCase()]:0,opp=0;
 for(let i=0;i<8;i++)for(let j=0;j<8;j++){const p=n.b[i][j];if(p&&colr(p)!==me)for(const q of chPseudo(n.b,i,j)){const x=n.b[q[2]][q[3]];if(x)opp=Math.max(opp,PV[x.toLowerCase()])}}
 return cap*10-opp*9+(s.b[m[0]][m[1]].toLowerCase()==='p'&&(m[2]===0||m[2]===7)?60:0)+(3.5-Math.abs(3.5-m[3]))*.3},
checkers:(s,m)=>m.length*4+(Math.abs(m[0]-m[m.length-2])===1&&(m[m.length-2]===0||m[m.length-2]===7)?3:0),
connect4:(s,m,n,me)=>{let sc=3-Math.abs(3-m[0]);if(!n.w&&E.connect4.moves(n).some(x=>E.connect4.apply(n,x).w===1-me))sc-=60;return sc},
gomoku:(s,m,n,me)=>{const o=s.b.flat().filter(v=>v!==-1).length;if(!o)return -Math.abs(7-m[0])-Math.abs(7-m[1]);return gsc(s.b,m[0],m[1],me)+gsc(s.b,m[0],m[1],1-me)*.9-(Math.abs(7-m[0])+Math.abs(7-m[1]))*.1},
reversi:(s,m,n)=>{const cor=m[0]%7===0&&m[1]%7===0;return n.fl.length+(cor?30:0)-(!cor&&(m[0]<=1||m[0]>=6)&&(m[1]<=1||m[1]>=6)?8:0)},
ttt:(s,m,n,me)=>(m[0]===1&&m[1]===1?2:0)+(E.ttt.apply({...s,turn:1-me},m).w===1-me?50:0)};
function aiPick(g,s){const e=E[g],ms=e.moves(s);if(!ms.length)return null;const me=s.turn;let best=-1e9,bm=null;
 for(const m of ms){const n=e.apply(s,m),w=e.over(n);if(w===me)return m;const sc=(HE[g]?HE[g](s,m,n,me):0)+Math.random()*1.5-(w===-1?3:0);if(sc>best){best=sc;bm=m}}return bm}
//ENG-END
