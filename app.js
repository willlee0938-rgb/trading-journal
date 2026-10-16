const seedEvidence = [
  {src:'liquidation-1w.jpeg', title:'清算熱力圖｜1 週', note:'84.7K 一帶存在明顯上方流動性；82K 下方亦有密集區。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'liquidation-3d.jpeg', title:'清算熱力圖｜3 天', note:'短線 84.5K 左右的黃色帶最突出，適合作為逼空第一觀察區。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'liquidation-1m.jpeg', title:'清算熱力圖｜1 個月', note:'更高週期在 87–88K 一帶出現較強流動性。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-4h-scenarios.jpeg', title:'4H 情境草圖', note:'原始推演：可能先上探，也保留回落至 75K 區域的替代路徑。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-1d-context.jpeg', title:'日線結構', note:'反彈自低位延伸後進入高位震盪，82.6K 為短線關鍵水平。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-3d-macd.jpeg', title:'3 日 MACD', note:'DIF 低於 DEA，死叉初步形成，但仍位於零軸上方。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-1d-macd.jpeg', title:'日線 MACD', note:'日線 MACD 死叉，且高位動能有背離疑慮。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-1w-macd.jpeg', title:'週線動能', note:'週線 MACD 尚偏多，但 KDJ 位置偏高。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-1w-orderblock.jpeg', title:'週線 Order Block', note:'上方灰區約 90–94K 為看跌訂單塊 / 供給區。', uploadedAt:'2026-10-14T20:07:00+08:00'}
];

const seedEntries = [
  {
    id:'btc-20261016-mss-fvg',
    title:'BTCUSDT｜MSS 後 FVG 回踩劇本',
    datetime:'2026-10-16T16:25',
    symbol:'BTCUSDT',
    catalyst:'當日結構分析',
    thesis:'昨日市場暴力拉盤後形成 MSS。短線規劃偏向先空後多：等待價格回踩 FVG，同時清洗昨晚追多的右側玩家；若回踩區獲得承接，再觀察重新轉強與向上延伸。',
    levels:'81,600 / 80,800 / 84,000–85,000 / 87,000',
    invalidation:'回踩後無法止跌並持續跌破 80,800；或反彈結構無法重新形成向上 MSS。',
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
    images:seedEvidence.map(x=>({src:x.src,uploadedAt:x.uploadedAt,title:x.title,note:x.note}))
  }
];

const highImpactEvents = [
  {datetime:'2026-10-29T02:00:00+08:00', name:'FOMC 利率決議', risk:'極高', source:'Federal Reserve', note:'02:00 決議；02:30 記者會。建議前後至少 30–60 分鐘避免高槓桿與追價。'},
  {datetime:'2026-10-29T20:30:00+08:00', name:'美國 GDP + PCE', risk:'高', source:'BEA', note:'第三季 GDP 初值與 9 月 Personal Income and Outlays 同時公布。'},
  {datetime:'2026-11-06T21:30:00+08:00', name:'美國非農就業報告 NFP', risk:'極高', source:'BLS', note:'就業、失業率、薪資同時公布，建議避開前後 30–60 分鐘。'},
  {datetime:'2026-11-10T21:30:00+08:00', name:'美國 CPI', risk:'極高', source:'BLS', note:'通膨數據常直接影響降息預期與 BTC 波動。'}
];

const reviewItems = ['是否照計畫等待關鍵區，而不是追價？','是否出現 MSS / displacement？','FVG 回踩是否有承接？','關鍵價位是否有效突破或失守？','是否因既有方向產生確認偏誤？'];
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const DB_KEY='tradeJournalEntriesV2';
const OLD_DB_KEY='tradeJournalEntriesV1';
const REVIEW_KEY='tradeJournalReviewV1';

function formatDate(s){if(!s)return'';return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(s))}
function formatDay(s){if(!s)return'';return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date(s))}
function normalizeImage(img,fallbackTime){if(typeof img==='string')return{src:img,uploadedAt:fallbackTime||new Date().toISOString()};return{...img,uploadedAt:img.uploadedAt||fallbackTime||new Date().toISOString()}}
function normalizeEntry(e){return{...e,images:(e.images||[]).map(img=>normalizeImage(img,e.datetime))}}
function loadEntries(){
  let saved=[];
  try{saved=JSON.parse(localStorage.getItem(DB_KEY)||'[]')}catch(e){}
  if(!saved.length){try{saved=JSON.parse(localStorage.getItem(OLD_DB_KEY)||'[]')}catch(e){}}
  saved=saved.map(normalizeEntry);
  seedEntries.forEach(seed=>{const i=saved.findIndex(x=>x.id===seed.id);if(i<0)saved.push(normalizeEntry(seed));else saved[i]={...saved[i],...seed,images:saved[i].images?.length?saved[i].images:normalizeEntry(seed).images}});
  const today=saved.find(x=>x.id==='btc-20261016-mss-fvg');if(today){today.levels='81,600 / 80,800 / 84,000–85,000 / 87,000';today.invalidation='回踩後無法止跌並持續跌破 80,800；或反彈結構無法重新形成向上 MSS。'}
  return saved.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
}
function saveEntries(v){localStorage.setItem(DB_KEY,JSON.stringify(v))}
let entries=loadEntries();saveEntries(entries);
function getLatestEntry(){return entries[0]||seedEntries[0]}

function getNextHighImpactEvent(){const now=Date.now();return [...highImpactEvents].filter(e=>new Date(e.datetime)>now).sort((a,b)=>new Date(a.datetime)-new Date(b.datetime))[0]||null}
function countdownText(datetime){const diff=new Date(datetime)-Date.now();if(diff<=0)return'事件進行中';const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000);return d>0?`倒數 ${d} 天 ${h} 小時`:h>0?`倒數 ${h} 小時 ${m} 分`:`倒數 ${m} 分鐘`}
function renderMacroEvent(){const card=$('#dashboard .event-card');if(!card)return;const evt=getNextHighImpactEvent(),h3=card.querySelector('h3'),time=card.querySelector('.event-time'),p=card.querySelector('p'),rule=card.querySelector('.event-rule');if(!evt){h3.textContent='高風險事件';time.textContent='待更新';p.textContent='目前沒有內建事件';return}const d=new Date(evt.datetime),dateText=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',weekday:'short'}).format(d),timeText=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);h3.textContent=`高風險事件 · ${evt.risk}`;time.textContent=`${dateText} ${timeText}`;p.textContent=`${evt.name}｜${countdownText(evt.datetime)}`;rule.textContent=`⚠ 台灣時間｜${evt.note}｜來源：${evt.source}`}

function renderDashboardLatest(){
  const e=getLatestEntry(),hero=$('#dashboard .hero-card');if(!hero)return;
  hero.querySelector('.status-badge').textContent='最新交易劇本';hero.querySelector('h2').textContent=e.title||'最新分析';hero.querySelector('.muted').textContent=`${formatDate(e.datetime)} · ${e.symbol||'—'}`;hero.querySelector('.price-box span').textContent='最新更新';hero.querySelector('.price-box strong').textContent=(e.datetime||'').slice(5,10).replace('-','/');hero.querySelector('.thesis-callout span').textContent='核心邏輯';hero.querySelector('.thesis-callout p').textContent=e.thesis||'尚未填寫';
  const lv=(e.levels||'').split(/\s*\/\s*/).map(x=>x.trim()).filter(Boolean);
  hero.querySelector('.metric-row').innerHTML=[['事件 / 催化劑',e.catalyst||'無'],['標的',e.symbol||'—'],['關鍵價位 1',lv[0]||'—'],['關鍵價位 2',lv[1]||'—'],['狀態','最新一期']].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  renderMacroEvent();
  const logic=$$('#dashboard .logic-step'),data=[['最新觀點',e.thesis||'—'],['關鍵價位',e.levels||'—'],['失效條件',e.invalidation||'—'],['執行原則','以最新價格行為確認，不因舊劇本硬套市場。']];logic.forEach((x,i)=>{if(!data[i])return;x.querySelector('strong').textContent=data[i][0];x.querySelector('p').textContent=data[i][1]});
}

function imageInfo(img,index,entry){const n=normalizeImage(img,entry?.datetime);return{...n,title:n.title||`分析圖片 ${index+1}`,note:n.note||''}}
function openLightbox(src,caption){$('#lightboxImage').src=src;$('#lightboxCaption').textContent=caption;$('#imageDialog')?.showModal()}
function renderEvidence(){
  const root=$('#evidenceGallery');if(!root)return;root.innerHTML='';const seen=new Set();
  const items=[];entries.forEach(entry=>(entry.images||[]).forEach((img,i)=>{const info=imageInfo(img,i,entry);if(info.src&&!seen.has(info.src)){seen.add(info.src);items.push({...info,entryTitle:entry.title})}}));
  if(!items.length)seedEvidence.forEach(x=>items.push(x));
  items.forEach(item=>{const el=document.createElement('div');el.className='evidence';const uploaded=`上傳時間：${formatDate(item.uploadedAt)}`;el.innerHTML=`<img src="${item.src}" alt="${item.title}" loading="lazy"><div class="caption"><strong>${item.title}</strong><span>${item.note||item.entryTitle||''}</span><span class="upload-time">${uploaded}</span></div>`;el.onclick=()=>openLightbox(item.src,`${item.title}｜${uploaded}`);root.appendChild(el)});
}

function getDayKey(s){const d=new Date(s);return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function getFirstImageSrc(e){const img=e.images?.[0];return typeof img==='string'?img:img?.src||'tv-1d-context.jpeg'}
function renderEntries(filter=''){
  const root=$('#entriesList');root.innerHTML='';const list=entries.filter(e=>JSON.stringify(e).toLowerCase().includes(filter.toLowerCase()));if(!list.length){root.innerHTML='<div class="card muted">沒有符合的紀錄。</div>';return}
  const groups={};list.forEach(e=>{const k=getDayKey(e.datetime);(groups[k]??=[]).push(e)});
  Object.keys(groups).sort((a,b)=>b.localeCompare(a)).forEach(day=>{const section=document.createElement('section');section.className='day-group';section.innerHTML=`<div class="day-heading"><strong>${formatDay(groups[day][0].datetime)}</strong><span>${groups[day].length} 筆分析</span></div>`;groups[day].forEach(e=>{const card=document.createElement('article');card.className='entry-card clickable';card.innerHTML=`<img class="entry-thumb" src="${getFirstImageSrc(e)}" alt="${e.title}"><div><h3>${e.title}</h3><p>${e.thesis||''}</p><div class="entry-meta">${(e.tags||[]).map(t=>`<span class="mini-tag">${t}</span>`).join('')}<span class="mini-tag">${e.levels||''}</span></div></div><div class="entry-date">${formatDate(e.datetime)}<br>${e.catalyst||''}<br><b>點擊查看完整分析 →</b></div>`;card.addEventListener('click',()=>openEntryDetail(e.id));section.appendChild(card)});root.appendChild(section)});
}

function ensureDetailDialog(){if($('#entryDetailDialog'))return;const d=document.createElement('dialog');d.id='entryDetailDialog';d.className='detail-dialog';d.innerHTML=`<button class="image-close" id="detailClose">✕</button><div id="entryDetailContent"></div>`;document.body.appendChild(d);$('#detailClose').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target===d)d.close()})}
function openEntryDetail(id){ensureDetailDialog();const e=entries.find(x=>x.id===id);if(!e)return;const images=(e.images||[]).map((img,i)=>imageInfo(img,i,e));const html=`<div class="detail-head"><span class="status-badge">${formatDay(e.datetime)}</span><h2>${e.title}</h2><p class="muted">${formatDate(e.datetime)} · ${e.symbol||'—'} · ${e.catalyst||'無事件'}</p></div><div class="detail-block"><h3>核心分析邏輯</h3><p>${e.thesis||'—'}</p></div><div class="detail-grid"><div class="detail-block"><h3>關鍵價位</h3><p>${e.levels||'—'}</p></div><div class="detail-block"><h3>失效條件</h3><p>${e.invalidation||'—'}</p></div></div><div class="detail-block"><h3>當下上傳圖片</h3>${images.length?`<div class="detail-gallery">${images.map((x,i)=>`<figure data-src="${x.src}"><img src="${x.src}" alt="${x.title}"><figcaption><strong>${x.title}</strong><span>上傳時間：${formatDate(x.uploadedAt)}</span></figcaption></figure>`).join('')}</div>`:'<p class="muted">這筆分析當時沒有上傳圖片。</p>'}</div>`;$('#entryDetailContent').innerHTML=html;$$('#entryDetailContent figure').forEach(f=>f.addEventListener('click',()=>openLightbox(f.dataset.src,f.querySelector('figcaption').innerText.replace('\n','｜'))));$('#entryDetailDialog').showModal()}

function switchView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));const titles={dashboard:'最新交易劇本',entries:'交易紀錄',review:'復盤中心',settings:'資料管理'};$('#pageTitle').textContent=titles[id];if(id==='dashboard'){renderDashboardLatest();renderEvidence()}if(id==='entries')renderEntries($('#searchInput')?.value||'')}
$$('.nav-item').forEach(n=>n.addEventListener('click',()=>switchView(n.dataset.view)));

function renderReview(){let saved={};try{saved=JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')}catch(e){}const root=$('#reviewChecklist');root.innerHTML='';reviewItems.forEach((t,i)=>{const lab=document.createElement('label');lab.className='review-item';lab.innerHTML=`<input type="checkbox" data-i="${i}" ${saved.checked?.[i]?'checked':''}><span>${t}</span>`;root.appendChild(lab)});$('#reviewActual').value=saved.actual||'';$('#reviewExecution').value=saved.execution||'';$('#reviewBias').value=saved.bias||'';$('#reviewNext').value=saved.next||''}
$('#saveReviewBtn')?.addEventListener('click',()=>{const checked={};$$('#reviewChecklist input').forEach(x=>checked[x.dataset.i]=x.checked);localStorage.setItem(REVIEW_KEY,JSON.stringify({checked,actual:$('#reviewActual').value,execution:$('#reviewExecution').value,bias:$('#reviewBias').value,next:$('#reviewNext').value,updatedAt:new Date().toISOString()}));const b=$('#saveReviewBtn'),old=b.textContent;b.textContent='已儲存 ✓';setTimeout(()=>b.textContent=old,1200)});

$('#newEntryBtn')?.addEventListener('click',()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#entryForm [name=datetime]').value=d.toISOString().slice(0,16);$('#entryDialog').showModal()});
const entryDialog=$('#entryDialog'),entryForm=$('#entryForm');entryDialog?.querySelectorAll('button[value="cancel"]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();entryForm.reset();entryDialog.close()}));entryDialog?.addEventListener('click',e=>{if(e.target===entryDialog){entryForm.reset();entryDialog.close()}});
function compressImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,h=img.height;if(w>max){h=Math.round(h*max/w);w=max}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',.72))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
$('#saveEntryBtn')?.addEventListener('click',async e=>{e.preventDefault();const form=$('#entryForm');if(!form.reportValidity())return;const fd=new FormData(form),files=[...form.elements.images.files],images=[];const uploadedAt=new Date().toISOString();for(const f of files.slice(0,6))images.push({src:await compressImage(f),uploadedAt,title:f.name});const entry={id:'e'+Date.now(),title:fd.get('title'),datetime:fd.get('datetime'),symbol:fd.get('symbol'),catalyst:fd.get('catalyst'),thesis:fd.get('thesis'),levels:fd.get('levels'),invalidation:fd.get('invalidation'),tags:[fd.get('symbol'),fd.get('catalyst')].filter(Boolean),images};entries.unshift(entry);entries.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));saveEntries(entries);form.reset();entryDialog.close();switchView('entries')});

function exportAll(){const payload={version:2,exportedAt:new Date().toISOString(),entries,review:JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`trading-journal-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
$('#exportBtn')&&( $('#exportBtn').onclick=exportAll );$('#exportBtn2')&&( $('#exportBtn2').onclick=exportAll );
$('#importInput')?.addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;try{const data=JSON.parse(await f.text());if(Array.isArray(data.entries)){entries=data.entries.map(normalizeEntry).sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));saveEntries(entries)}if(data.review)localStorage.setItem(REVIEW_KEY,JSON.stringify(data.review));renderEntries();renderReview();renderDashboardLatest();renderEvidence();alert('匯入完成')}catch(err){alert('匯入失敗：JSON 格式不正確')}});
$('#searchInput')?.addEventListener('input',e=>renderEntries(e.target.value));

const style=document.createElement('style');style.textContent=`
.event-time{font-size:28px!important;letter-spacing:-.02em!important;margin-top:12px!important}.event-card .card-title h3{font-size:15px!important}.event-card p{font-size:13px!important}
#dashboard .content-grid{grid-template-columns:1fr!important}#dashboard .content-grid>.card:not(.span-2){display:none!important}#dashboard .content-grid .span-2{grid-column:auto!important}#dashboard>.card:has(.scenario-grid){display:none!important}
.upload-time{display:block!important;margin-top:6px!important;color:var(--accent2)!important}.day-group{display:grid;gap:10px;margin-bottom:24px}.day-heading{display:flex;justify-content:space-between;align-items:center;padding:4px 2px;color:var(--text)}.day-heading span{font-size:12px;color:var(--muted)}.entry-card.clickable{cursor:pointer;transition:.2s}.entry-card.clickable:hover{transform:translateY(-2px);border-color:#466080}.detail-dialog{width:min(980px,94vw);max-height:90vh;overflow:auto;padding:26px}.detail-head h2{margin:10px 0 4px}.detail-block{border:1px solid var(--line);background:var(--panel2);border-radius:14px;padding:16px;margin-top:14px}.detail-block h3{margin:0 0 8px}.detail-block p{margin:0;line-height:1.8;color:var(--muted)}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detail-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.detail-gallery figure{margin:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;cursor:pointer;background:var(--panel)}.detail-gallery img{width:100%;height:260px;object-fit:cover;display:block}.detail-gallery figcaption{padding:10px}.detail-gallery figcaption strong,.detail-gallery figcaption span{display:block}.detail-gallery figcaption span{font-size:11px;color:var(--accent2);margin-top:4px}
@media(max-width:760px){.event-time{font-size:24px!important}.detail-grid,.detail-gallery{grid-template-columns:1fr}.detail-gallery img{height:210px}}
`;document.head.appendChild(style);

renderDashboardLatest();renderEvidence();renderEntries();renderReview();setInterval(renderMacroEvent,60000);
