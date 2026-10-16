const seedEvidence = [
  {src:'liquidation-1w.jpeg', title:'清算熱力圖｜1 週', note:'84.7K 一帶存在明顯上方流動性；82K 下方亦有密集區。'},
  {src:'liquidation-3d.jpeg', title:'清算熱力圖｜3 天', note:'短線 84.5K 左右的黃色帶最突出，適合作為逼空第一觀察區。'},
  {src:'liquidation-1m.jpeg', title:'清算熱力圖｜1 個月', note:'更高週期在 87–88K 一帶出現較強流動性。'},
  {src:'tv-4h-scenarios.jpeg', title:'4H 情境草圖', note:'原始推演：可能先上探，也保留回落至 75K 區域的替代路徑。'},
  {src:'tv-1d-context.jpeg', title:'日線結構', note:'反彈自低位延伸後進入高位震盪，82.6K 為短線關鍵水平。'},
  {src:'bingx-3d-macd.jpeg', title:'3 日 MACD', note:'DIF 低於 DEA，死叉初步形成，但仍位於零軸上方。'},
  {src:'bingx-1d-macd.jpeg', title:'日線 MACD', note:'日線 MACD 死叉，且高位動能有背離疑慮。'},
  {src:'bingx-1w-macd.jpeg', title:'週線動能', note:'週線 MACD 尚偏多，但 KDJ 位置偏高，代表反彈延伸與回撤風險同時存在。'},
  {src:'tv-1w-orderblock.jpeg', title:'週線 Order Block', note:'上方灰區約 90–94K 為看跌訂單塊 / 供給區。'}
];

const seedEntries = [
  {
    id:'btc-20261016-mss-fvg',
    title:'BTCUSDT｜MSS 後 FVG 回踩劇本',
    datetime:'2026-10-16T16:25',
    symbol:'BTCUSDT',
    catalyst:'當日結構分析',
    thesis:'昨日市場暴力拉盤後形成 MSS。短線規劃偏向先空後多：等待價格回踩 FVG，同時清洗昨晚追多的右側玩家；若回踩區獲得承接，再觀察重新轉強與向上延伸。',
    levels:'81,655.88 / 80,882.33 / 84,000–85,000 / 87,000',
    invalidation:'回踩後無法止跌並持續跌破 80,882；或反彈結構無法重新形成向上 MSS。',
    tags:['MSS','FVG','短空長多','流動性'],
    images:[]
  },
  {
    id:'btc-cpi-20261014',
    title:'BTCUSDT｜CPI 前流動性劇本',
    datetime:'2026-10-14T20:07',
    symbol:'BTCUSDT',
    catalyst:'US CPI 20:30',
    thesis:'可能先掃 82,600 下方流動性並快速收復，之後利用 84.5K 與 87.368K 上方空單清算做燃料，突破前高後進入 90–94K 週線看跌訂單塊，再觀察是否形成中期反轉。',
    levels:'82,600 / 84,500–85,000 / 87,368 / 90,000–94,000 / 75,000–77,000',
    invalidation:'跌破 82,600 後無法快速收復；反彈無法重新站回關鍵水平；80–81K 有效失守。',
    tags:['CPI','流動性','MACD','週線 OB','事件交易'],
    images:['tv-1w-orderblock.jpeg']
  }
];

const highImpactEvents = [
  {datetime:'2026-10-29T02:00:00+08:00', name:'FOMC 利率決議', risk:'極高', source:'Federal Reserve', note:'02:00 決議；02:30 記者會。建議前後至少 30–60 分鐘避免高槓桿與追價。'},
  {datetime:'2026-10-29T20:30:00+08:00', name:'美國 GDP + PCE', risk:'高', source:'BEA', note:'第三季 GDP 初值與 9 月 Personal Income and Outlays 同時公布。'},
  {datetime:'2026-11-06T21:30:00+08:00', name:'美國非農就業報告 NFP', risk:'極高', source:'BLS', note:'就業、失業率、薪資同時公布，建議避開前後 30–60 分鐘。'},
  {datetime:'2026-11-10T21:30:00+08:00', name:'美國 CPI', risk:'極高', source:'BLS', note:'通膨數據常直接影響降息預期與 BTC 波動。'}
];

const reviewItems = [
  '是否照計畫等待關鍵區，而不是追價？',
  '是否出現 MSS / displacement？',
  'FVG 回踩是否有承接？',
  '關鍵價位是否有效突破或失守？',
  '是否因既有方向產生確認偏誤？'
];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const DB_KEY = 'tradeJournalEntriesV1';
const REVIEW_KEY = 'tradeJournalReviewV1';

function loadEntries(){
  let saved=[];
  try{saved=JSON.parse(localStorage.getItem(DB_KEY)||'[]')}catch(e){saved=[]}
  seedEntries.forEach(seed=>{if(!saved.find(x=>x.id===seed.id)) saved.push(seed)});
  return saved.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
}
function saveEntries(v){localStorage.setItem(DB_KEY,JSON.stringify(v))}
let entries=loadEntries();saveEntries(entries);
function getLatestEntry(){return [...entries].sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0))[0]||seedEntries[0]}
function formatDate(s){if(!s)return'';return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(s))}

function getNextHighImpactEvent(){const now=Date.now();return [...highImpactEvents].filter(e=>new Date(e.datetime).getTime()>now).sort((a,b)=>new Date(a.datetime)-new Date(b.datetime))[0]||null}
function countdownText(datetime){const diff=new Date(datetime)-Date.now();if(diff<=0)return'事件進行中';const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000);return d>0?`倒數 ${d} 天 ${h} 小時`:h>0?`倒數 ${h} 小時 ${m} 分`:`倒數 ${m} 分鐘`}
function renderMacroEvent(){
  const card=$('#dashboard .event-card');if(!card)return;const evt=getNextHighImpactEvent();
  const h3=card.querySelector('h3'),time=card.querySelector('.event-time'),p=card.querySelector('p'),rule=card.querySelector('.event-rule');
  if(!evt){if(h3)h3.textContent='下一個高風險事件';if(time)time.textContent='待更新';if(p)p.textContent='目前沒有內建事件';return}
  const d=new Date(evt.datetime);
  const dateText=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',weekday:'short'}).format(d);
  const timeText=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
  if(h3)h3.textContent=`高風險事件 · ${evt.risk}`;
  if(time)time.textContent=`${dateText} ${timeText}`;
  if(p)p.textContent=`${evt.name}｜${countdownText(evt.datetime)}`;
  if(rule)rule.textContent=`⚠ 台灣時間｜${evt.note}｜來源：${evt.source}`;
}

function renderDashboardLatest(){
  const e=getLatestEntry(),hero=$('#dashboard .hero-card');
  if(hero){
    const badge=hero.querySelector('.status-badge'),title=hero.querySelector('h2'),meta=hero.querySelector('.muted'),priceLabel=hero.querySelector('.price-box span'),priceValue=hero.querySelector('.price-box strong'),thesis=hero.querySelector('.thesis-callout p'),thesisLabel=hero.querySelector('.thesis-callout span');
    if(badge)badge.textContent='最新交易劇本';if(title)title.textContent=e.title||'最新分析';if(meta)meta.textContent=`${formatDate(e.datetime)} · ${e.symbol||'—'}`;if(priceLabel)priceLabel.textContent='最新更新';if(priceValue)priceValue.textContent=(e.datetime||'').slice(5,10).replace('-','/');if(thesisLabel)thesisLabel.textContent='核心邏輯';if(thesis)thesis.textContent=e.thesis||'尚未填寫';
    const row=hero.querySelector('.metric-row');if(row){const lv=(e.levels||'').split(/\s*\/\s*|,|，/).filter(Boolean);row.innerHTML=[['事件 / 催化劑',e.catalyst||'無'],['標的',e.symbol||'—'],['關鍵價位 1',lv[0]||'—'],['關鍵價位 2',lv[1]||'—'],['狀態','最新一期']].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('')}
  }
  renderMacroEvent();
  const logic=$$('#dashboard .logic-step'),data=[['最新觀點',e.thesis||'—'],['關鍵價位',e.levels||'—'],['失效條件',e.invalidation||'—'],['執行原則','以最新價格行為確認，不因舊劇本硬套市場。']];logic.forEach((x,i)=>{if(!data[i])return;const s=x.querySelector('strong'),p=x.querySelector('p');if(s)s.textContent=data[i][0];if(p)p.textContent=data[i][1]});
  const sc=$$('#dashboard .scenario'),sd=[['目前主劇本','核心假設',e.thesis||'—'],['關鍵區域','價位觀察',e.levels||'—'],['風險控制','劇本失效',e.invalidation||'—']];sc.forEach((c,i)=>{if(!sd[i])return;const t=c.querySelector('.tag'),h=c.querySelector('h4'),p=c.querySelector('p');if(t)t.textContent=sd[i][0];if(h)h.textContent=sd[i][1];if(p)p.textContent=sd[i][2]});
}

function openLightbox(src,caption){const img=$('#lightboxImage'),cap=$('#lightboxCaption');if(img)img.src=src;if(cap)cap.textContent=caption;$('#imageDialog')?.showModal()}
function renderEvidence(){
  const root=$('#evidenceGallery');if(!root)return;root.innerHTML='';
  const latest=getLatestEntry();
  const latestImages=(latest.images||[]).filter(Boolean).map((src,i)=>({src,title:`最新分析圖片 ${i+1}`,note:`${latest.title} · ${formatDate(latest.datetime)}`}));
  const all=[...latestImages,...seedEvidence];const seen=new Set();
  all.filter(x=>x.src&&!seen.has(x.src)&&seen.add(x.src)).forEach(item=>{
    const el=document.createElement('div');el.className='evidence';
    el.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="caption"><strong>${item.title}</strong><span>${item.note||''}</span></div>`;
    el.onclick=()=>openLightbox(item.src,item.title+'｜'+(item.note||''));root.appendChild(el);
  });
}

function renderEntries(filter=''){const root=$('#entriesList');root.innerHTML='';const list=entries.filter(e=>JSON.stringify(e).toLowerCase().includes(filter.toLowerCase()));if(!list.length){root.innerHTML='<div class="card muted">沒有符合的紀錄。</div>';return}list.forEach(e=>{const card=document.createElement('article');card.className='entry-card';const img=(e.images&&e.images[0])||'tv-1d-context.jpeg';card.innerHTML=`<img class="entry-thumb" src="${img}" alt="${e.title}"><div><h3>${e.title}</h3><p>${e.thesis||''}</p><div class="entry-meta">${(e.tags||[]).map(t=>`<span class="mini-tag">${t}</span>`).join('')}<span class="mini-tag">${e.levels||''}</span></div></div><div class="entry-date">${formatDate(e.datetime)}<br>${e.catalyst||''}</div>`;root.appendChild(card)})}
function switchView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));const titles={dashboard:'最新交易劇本',entries:'交易紀錄',review:'復盤中心',settings:'資料管理'};$('#pageTitle').textContent=titles[id];if(id==='dashboard'){renderDashboardLatest();renderEvidence()}}
$$('.nav-item').forEach(n=>n.addEventListener('click',()=>switchView(n.dataset.view)));

function renderReview(){let saved={};try{saved=JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')}catch(e){}const root=$('#reviewChecklist');root.innerHTML='';reviewItems.forEach((t,i)=>{const lab=document.createElement('label');lab.className='review-item';lab.innerHTML=`<input type="checkbox" data-i="${i}" ${saved.checked?.[i]?'checked':''}><span>${t}</span>`;root.appendChild(lab)});$('#reviewActual').value=saved.actual||'';$('#reviewExecution').value=saved.execution||'';$('#reviewBias').value=saved.bias||'';$('#reviewNext').value=saved.next||''}
$('#saveReviewBtn')?.addEventListener('click',()=>{const checked={};$$('#reviewChecklist input').forEach(x=>checked[x.dataset.i]=x.checked);localStorage.setItem(REVIEW_KEY,JSON.stringify({checked,actual:$('#reviewActual').value,execution:$('#reviewExecution').value,bias:$('#reviewBias').value,next:$('#reviewNext').value,updatedAt:new Date().toISOString()}));const b=$('#saveReviewBtn'),old=b.textContent;b.textContent='已儲存 ✓';setTimeout(()=>b.textContent=old,1200)});

$('#newEntryBtn')?.addEventListener('click',()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#entryForm [name=datetime]').value=d.toISOString().slice(0,16);$('#entryDialog').showModal()});
const entryDialog=$('#entryDialog'),entryForm=$('#entryForm');entryDialog?.querySelectorAll('button[value="cancel"]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();entryForm.reset();entryDialog.close()}));entryDialog?.addEventListener('click',e=>{if(e.target===entryDialog){entryForm.reset();entryDialog.close()}});
function compressImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,h=img.height;if(w>max){h=Math.round(h*max/w);w=max}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',.72))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
$('#saveEntryBtn')?.addEventListener('click',async e=>{e.preventDefault();const form=$('#entryForm');if(!form.reportValidity())return;const fd=new FormData(form),files=[...form.elements.images.files],images=[];for(const f of files.slice(0,6))images.push(await compressImage(f));const entry={id:'e'+Date.now(),title:fd.get('title'),datetime:fd.get('datetime'),symbol:fd.get('symbol'),catalyst:fd.get('catalyst'),thesis:fd.get('thesis'),levels:fd.get('levels'),invalidation:fd.get('invalidation'),tags:[fd.get('symbol'),fd.get('catalyst')].filter(Boolean),images};entries.unshift(entry);entries.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));saveEntries(entries);renderEntries();renderDashboardLatest();renderEvidence();form.reset();entryDialog.close();switchView('dashboard')});
function exportAll(){const payload={version:1,exportedAt:new Date().toISOString(),entries,review:JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`trading-journal-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
$('#exportBtn')&&( $('#exportBtn').onclick=exportAll );$('#exportBtn2')&&( $('#exportBtn2').onclick=exportAll );
$('#importInput')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(Array.isArray(data.entries)){entries=data.entries.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));saveEntries(entries)}if(data.review)localStorage.setItem(REVIEW_KEY,JSON.stringify(data.review));renderEntries();renderReview();renderDashboardLatest();renderEvidence();alert('匯入完成')}catch(err){alert('匯入失敗：JSON 格式不正確')}});
$('#searchInput')?.addEventListener('input',e=>renderEntries(e.target.value));

// UI hotfix: event date/time should be compact, not oversized.
const style=document.createElement('style');style.textContent=`.event-time{font-size:28px!important;letter-spacing:-.02em!important;margin-top:12px!important}.event-card .card-title h3{font-size:15px!important}.event-card p{font-size:13px!important}@media(max-width:760px){.event-time{font-size:24px!important}}`;document.head.appendChild(style);

renderDashboardLatest();renderEvidence();renderEntries();renderReview();setInterval(renderMacroEvent,60000);
