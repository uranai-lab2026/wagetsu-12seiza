
const signs=window.SIGNS;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let current=6, me=6, other=0, parent=6, child=7;
const elGood=(a,b)=>new Set([a,b]).size===2 && (["火風","風火","水土","土水"].includes(a+b));
const elHard=(a,b)=>["火水","水火","風土","土風"].includes(a+b);
function hash(s){let h=2166136261>>>0;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function score(a,b,type){
 const A=signs[a],B=signs[b]; let base=76;
 if(type==="general"){base=A.pair===B.m?95:a===b?88:elGood(A.el,B.el)?86:A.el===B.el?81:elHard(A.el,B.el)?68:76}
 if(type==="love"){base=A.pair===B.m?96:a===b?84:elGood(A.el,B.el)?89:A.el===B.el?82:elHard(A.el,B.el)?64:76}
 if(type==="friend"){base=a===b?94:A.pair===B.m?91:A.el===B.el?90:elGood(A.el,B.el)?87:elHard(A.el,B.el)?72:80}
 return Math.max(52,Math.min(99,base+(hash(type+"-"+Math.min(a,b)+"-"+Math.max(a,b))%7)-3));
}
function makeButtons(sel,handler,active){const e=$(sel);e.innerHTML=signs.map((s,i)=>`<button data-i="${i}" class="${i===active?'active':''}">${s.m}月<small>${s.name}</small></button>`).join("");e.onclick=ev=>{const b=ev.target.closest("button");if(!b)return;handler(+b.dataset.i);$$(`${sel} button`).forEach(x=>x.classList.toggle("active",x===b))}}
function renderSign(){const s=signs[current];$("#signCard").src=`sign-${String(s.m).padStart(2,"0")}.webp`;$("#signName").textContent=s.name;$("#meta").textContent=`${s.month}｜${s.reading}｜${s.icon} ${s.el}`;$("#catch").textContent=`― ${s.catch} ―`;$("#talent").textContent=s.talent;$("#weak").textContent=s.weak;$("#love").textContent=s.love;$("#work").textContent=s.work;$("#pair").textContent=`${signs[s.pair-1].name}（${s.pair}月）`;$("#action").textContent=s.action;$("#motto").textContent=s.motto}
function relText(a,b,t){const A=signs[a],B=signs[b];if(A.pair===B.m)return"互いの不足を補いやすい運命星座どうし。";if(a===b)return"感覚が似ていて分かり合いやすい関係。";if(elGood(A.el,B.el))return"エレメント同士が互いを育てる好相性。";if(A.el===B.el)return"同じテンポを共有しやすい関係。";if(elHard(A.el,B.el))return"違いが大きいぶん、理解し合うほど強くなる関係。";return"ほどよい違いが刺激になる関係。"}
function renderCompat(){const types=[["総合相性","general"],["❤ 恋愛相性","love"],["◇ 友情相性","friend"]];$("#compatResults").innerHTML=types.map(([n,t])=>`<div class=result><b>${n}</b><div class=score>${score(me,other,t)}%</div><p>${relText(me,other,t)}</p></div>`).join("")}
function parentScore(p,c){const A=signs[p],B=signs[c];let base=A.pair===B.m?94:p===c?87:elGood(A.el,B.el)?89:A.el===B.el?86:elHard(A.el,B.el)?70:79;return Math.max(58,Math.min(98,base+(hash("pc-"+p+"-"+c)%9)-4))}
function renderParent(){const A=signs[parent],B=signs[child],sc=parentScore(parent,child);$("#parentResult").innerHTML=`<div class=result><b>親子相性</b><div class=score>${sc}%</div><p>親：${A.name} × 子：${B.name}</p></div><div class=box><b>この親子の強み</b><br>${relText(parent,child,"parent")} 親の「${A.catch}」性質が、子どもの個性を支える力になります。</div><div class=box><b>ぶつかりやすいところ</b><br>親が良かれと思って先回りしすぎると、子どもが自分で選ぶ余地を失いやすいところに注意。</div><div class=box><b>親へのアドバイス</b><br>答えを出す前に、まず子どもの言葉を一度最後まで聞いてみて。</div>`}
function dayKey(){const d=new Date();return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`}
function rank(v){return v>=78?"◎":v>=58?"○":v>=38?"△":"×"}
function dailyFor(i,cal=""){const s=signs[i],seed=hash(dayKey()+"|"+s.name+"|"+cal);let base=46+seed%31, love=base+(hash("l"+seed)%17)-8,money=base+(hash("m"+seed)%17)-8,work=base+(hash("w"+seed)%17)-8;const ov=Math.round((love+money+work)/3);return{ov:rank(ov),love:rank(love),money:rank(money),work:rank(work),loveBadge:love>=82&&love>=money&&love>=work,moneyBadge:money>=82&&money>=love&&money>=work,color:["水色","若草色","金色","藤色","白","朱色","紺色","山吹色"][hash("c"+seed)%8],food:["おにぎり","白桃","枝豆","そば","ヨーグルト","焼きとうもろこし","冷ややっこ","和菓子"][hash("f"+seed)%8],advice:["今日はひとつだけ丁寧に進めると吉。","言葉にすると流れが動きます。","無理に急がず、今あるものを整えて。","好きなことに少し大胆になって。"][hash("a"+seed)%4]}}
async function updateDaily(){const d=new Date(), label=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;let cal="",calText="暦情報は確認できません";try{const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;const [r,l,s,k]=await Promise.all(["rokuyo","lunar","solar-terms","kanshi"].map(x=>fetch(`https://api.jp-calendar.com/v1/${x}/${date}`,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error();return r.json()})));cal=JSON.stringify([r,l,s,k]);calText=`六曜：${r.rokuyo} ／ 旧暦：${l.lunar.month}月${l.lunar.day}日${s.solar_term?` ／ 二十四節気：${s.solar_term.name}`:""}`;}catch(e){}$("#todayDate").innerHTML=`${label}<br>${calText}`;const f=dailyFor(current,cal);$("#todayResult").innerHTML=`<div class=today-fortunes><div class=box><b>総合</b><div class=luck>${f.ov}</div></div><div class=box><b>恋愛</b><div class=luck>${f.love}</div></div><div class=box><b>金運</b><div class=luck>${f.money}</div></div><div class=box><b>仕事</b><div class=luck>${f.work}</div></div></div><div>${f.loveBadge?'<span class=badge>❤ 恋愛運UP</span>':""}${f.moneyBadge?'<span class=badge>💰 金運UP</span>':""}</div><div class=box><b>今日のワンポイント</b><br>${f.advice}</div><div class=daily-lucky><div class=box><b>ラッキーカラー</b><br>${f.color}</div><div class=box><b>ラッキーフード</b><br>${f.food}</div></div>`}
makeButtons("#months",i=>{current=i;renderSign();updateDaily()},current);
makeButtons("#meButtons",i=>{me=i;renderCompat()},me);makeButtons("#otherButtons",i=>{other=i;renderCompat()},other);
makeButtons("#parentButtons",i=>{parent=i;renderParent()},parent);makeButtons("#childButtons",i=>{child=i;renderParent()},child);
renderSign();renderCompat();renderParent();updateDaily();setInterval(()=>updateDaily(),3600000);
