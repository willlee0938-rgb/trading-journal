const seedEvidence = [
  {src:'liquidation-1w.jpeg', title:'清算熱力圖｜1 週', note:'84.7K 一帶存在明顯上方流動性；82K 下方亦有密集區。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'liquidation-3d.jpeg', title:'清算熱力圖｜3 天', note:'短線 84.5K 左右的黃色帶最突出。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'liquidation-1m.jpeg', title:'清算熱力圖｜1 個月', note:'更高週期在 87–88K 一帶出現較強流動性。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-4h-scenarios.jpeg', title:'4H 情境草圖', note:'當時的 4H 走勢推演。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-1d-context.jpeg', title:'日線結構', note:'當時的日線市場結構。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-3d-macd.jpeg', title:'3 日 MACD', note:'3 日級別動能觀察。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-1d-macd.jpeg', title:'日線 MACD', note:'日線級別動能觀察。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'bingx-1w-macd.jpeg', title:'週線動能', note:'週線 MACD / KDJ 動能觀察。', uploadedAt:'2026-10-14T20:07:00+08:00'},
  {src:'tv-1w-orderblock.jpeg', title:'週線 Order Block', note:'90–94K 週線供給區觀察。', uploadedAt:'2026-10-14T20:07:00+08:00'}
];

const seedEntries = [
  {
    id:'btc-20261016-mss-fvg', title:'BTCUSDT｜MSS 後 FVG 回踩劇本', datetime:'2026-10-16T16:25', symbol:'BTCUSDT', catalyst:'當日結構分析',
    thesis:'昨日市場暴力拉盤後形成 MSS。短線規劃偏向先空後多：等待價格回踩 FVG，同時清洗昨晚追多的右側玩家；若回踩區獲得承接，再觀察重新轉強與向上延伸。',
    levels:'81,600 / 80,800 / 84,000–85,000 / 87,000',
    invalidation:'回踩後無法止跌並持續跌破 80,800；或反彈結構無法重新形成向上 MSS。',
    tags:['MSS','FVG','短空長多','流動性'], images:[]
  },
  {
    id:'btc-cpi-20261014', title:'BTCUSDT｜CPI 前流動性劇本', datetime:'2026-10-14T20:07', symbol:'BTCUSDT', catalyst:'US CPI 20:30',
    thesis:'可能先掃 82,600 下方流動性並快速收復，之後利用 84.5K 與 87.368K 上方空單清算做燃料，突破前高後進入 90–94K 週線看跌訂單塊，再觀察是否形成中期反轉。',
    levels:'82,600 / 84,500–85,000 / 87,368 / 90,000–94,000 / 75,000–77,000',
    invalidation:'跌破 82,600 後無法快速收復；反彈無法重新站回關鍵水平；80–81K 有效失守。',
    tags:['CPI','流動性','MACD','週線 OB','事件交易'], images:seedEvidence.map(x=>({...x}))
  }
];

const highImpactEvents = [
  {datetime:'2026-10-29T02:00:00+08:00', name:'FOMC 利率決議', risk:'極高', source:'Federal Reserve', note:'02:00 決議；02:30 記者會。建議前後至少 30–60 分鐘避免高槓桿與追價。'},
  {datetime:'2026-10-29T20:30:00+08:00', name:'美國 GDP + PCE', risk:'高', source:'BEA', note:'GDP 與 PCE 同時公布，可能放大美元與 BTC 波動。'},
  {datetime:'2026-11-06T21:30:00+08:00', name:'美國非農 NFP', risk:'極高', source:'BLS', note:'就業、失業率、薪資同時公布。'},
  {datetime:'2026-11-10T21:30:00+08:00', name:'美國 CPI', risk:'極高', source:'BLS', note:'通膨數據可能直接影響降息預期與 BTC 波動。'}
];

const reviewItems=['是否照計畫等待關鍵區，而不是追價？','是否出現 MSS / displacement？','FVG 回踩是否有承接？','關鍵價位是否有效突破或失守？','是否因既有方向產生確認偏誤？'];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DB_KEY='tradeJournalEntriesV2', OLD_DB_KEY='tradeJournalEntriesV1', REVIEW_KEY='tradeJournalReviewV1';

function formatDate(s){if(!s)return'';return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(s))}
function formatDay(s){if(!s)return'';return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).format(new Date(s))}
function normImg(img,fallback){return typeof img==='string'?{src:img,uploadedAt:fallback}:{...img,uploadedAt:img.uploadedAt||fallback}}
function normEntry(e){return {...e,images:(e.images||[]).map(x=>normImg(x,e.datetime))}}

function loadEntries(){
  let saved=[];try{saved=JSON.parse(localStorage.getItem(DB_KEY)||'[]')}catch(e){}
  if(!saved.length){try{saved=JSON.parse(localStorage.getItem(OLD_DB_KEY)||'[]')}catch(e){}}
  saved=saved.map(normEntry);
  seedEntries.forEach(seed=>{
    const i=saved.findIndex(x=>x.id===seed.id);
    if(i<0)saved.push(normEntry(seed));
    else{
      const old=saved[i];
      const base=normEntry(seed);
      if(seed.id==='btc-cpi-20261014'){
        const extras=(old.images||[]).filter(x=>!seedEvidence.some(s=>s.src===x.src));
        saved[i]={...old,...base,images:[...base.images,...extras]};
      }else saved[i]={...old,...base,images:old.images||[]};
    }
  });
  return saved.sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
}
function saveEntries(v){localStorage.setItem(DB_KEY,JSON.stringify(v))}
let entries=loadEntries();saveEntries(entries);
function getLatestEntry(){return entries[0]||seedEntries[0]}

function countdownText(datetime){const diff=new Date(datetime)-Date.now();if(diff<=0)return'事件進行中';const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000);return d?`倒數 ${d} 天 ${h} 小時`:h?`倒數 ${h} 小時 ${m} 分`:`倒數 ${m} 分鐘`}
function renderMacroEvent(){
  const card=$('#dashboard .event-card');if(!card)return;
  card.style.setProperty('display','flex','important');card.style.visibility='visible';card.style.opacity='1';
  const evt=highImpactEvents.find(e=>new Date(e.datetime)>new Date())||highImpactEvents.at(-1),d=new Date(evt.datetime);
  const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',weekday:'short'}).format(d);
  const time=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
  card.querySelector('h3').textContent=`高風險事件 · ${evt.risk}`;card.querySelector('.event-time').textContent=`${date} ${time}`;card.querySelector('p').textContent=`${evt.name}｜${countdownText(evt.datetime)}`;card.querySelector('.event-rule').textContent=`⚠ 台灣時間｜${evt.note}｜來源：${evt.source}`;
}

function renderDashboardLatest(){
  const e=getLatestEntry(),hero=$('#dashboard .hero-card');if(!hero)return;
  hero.querySelector('.status-badge').textContent='最新交易劇本';hero.querySelector('h2').textContent=e.title;hero.querySelector('.muted').textContent=`${formatDate(e.datetime)} · ${e.symbol}`;hero.querySelector('.price-box span').textContent='最新更新';hero.querySelector('.price-box strong').textContent=(e.datetime||'').slice(5,10).replace('-','/');hero.querySelector('.thesis-callout p').textContent=e.thesis;
  const lv=(e.levels||'').split(/\s*\/\s*/).filter(Boolean);hero.querySelector('.metric-row').innerHTML=[['事件 / 催化劑',e.catalyst],['標的',e.symbol],['關鍵價位 1',lv[0]||'—'],['關鍵價位 2',lv[1]||'—'],['狀態','最新一期']].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
  const logic=$$('#dashboard .logic-step'),data=[['最新觀點',e.thesis],['關鍵價位',e.levels],['失效條件',e.invalidation],['執行原則','以最新價格行為確認，不因舊劇本硬套市場。']];logic.forEach((x,i)=>{if(data[i]){x.querySelector('strong').textContent=data[i][0];x.querySelector('p').textContent=data[i][1]}});
  renderMacroEvent();
}

function openLightbox(src,caption){const d=$('#imageDialog');if(!d)return;$('#lightboxImage').src=src;$('#lightboxCaption').textContent=caption;d.showModal()}
function renderEvidence(){
  const root=$('#evidenceGallery');if(!root)return;root.innerHTML='';
  const seen=new Set(),items=[];
  seedEvidence.forEach(x=>{seen.add(x.src);items.push({...x})});
  entries.forEach(entry=>(entry.images||[]).forEach((img,i)=>{const x=normImg(img,entry.datetime);if(x.src&&!seen.has(x.src)){seen.add(x.src);items.push({...x,title:x.title||`分析圖片 ${i+1}`,note:x.note||entry.title})}}));
  items.forEach(item=>{
    const el=document.createElement('div');el.className='evidence';const uploaded=`上傳時間：${formatDate(item.uploadedAt)}`;
    el.innerHTML=`<img src="${item.src}?v=20261016-11" alt="${item.title}" loading="lazy"><div class="caption"><strong>${item.title}</strong><span>${item.note||''}</span><span class="upload-time">${uploaded}</span></div>`;
    const img=el.querySelector('img');img.onerror=()=>{img.style.display='none';const f=document.createElement('div');f.style.cssText='height:190px;display:grid;place-items:center;color:var(--danger);background:var(--panel2);font-size:12px';f.textContent=`圖片載入失敗：${item.src}`;el.insertBefore(f,el.firstChild)};
    el.onclick=()=>{if(img.style.display!=='none')openLightbox(img.src,`${item.title}｜${uploaded}`)};root.appendChild(el);
  });
}

function getDayKey(s){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(s))}
function getFirstImageSrc(e){const x=e.images?.[0];return typeof x==='string'?x:(x?.src||'tv-1d-context.jpeg')}
function renderEntries(filter=''){
  const root=$('#entriesList');if(!root)return;root.innerHTML='';const list=entries.filter(e=>JSON.stringify(e).toLowerCase().includes(filter.toLowerCase()));if(!list.length){root.innerHTML='<div class="card muted">沒有符合的紀錄。</div>';return}
  const groups={};list.forEach(e=>(groups[getDayKey(e.datetime)]??=[]).push(e));Object.keys(groups).sort((a,b)=>b.localeCompare(a)).forEach(day=>{const sec=document.createElement('section');sec.className='day-group';sec.innerHTML=`<div class="day-heading"><strong>${formatDay(groups[day][0].datetime)}</strong><span>${groups[day].length} 筆分析</span></div>`;groups[day].forEach(e=>{const c=document.createElement('article');c.className='entry-card clickable';c.innerHTML=`<img class="entry-thumb" src="${getFirstImageSrc(e)}" alt="${e.title}"><div><h3>${e.title}</h3><p>${e.thesis}</p><div class="entry-meta">${(e.tags||[]).map(t=>`<span class="mini-tag">${t}</span>`).join('')}</div></div><div class="entry-date">${formatDate(e.datetime)}<br>${e.catalyst}<br><b>點擊查看完整分析 →</b></div>`;c.onclick=()=>openEntryDetail(e.id);sec.appendChild(c)});root.appendChild(sec)});
}
function ensureDetailDialog(){if($('#entryDetailDialog'))return;const d=document.createElement('dialog');d.id='entryDetailDialog';d.className='detail-dialog';d.innerHTML='<button class="image-close" id="detailClose">✕</button><div id="entryDetailContent"></div>';document.body.appendChild(d);$('#detailClose').onclick=()=>d.close();d.onclick=e=>{if(e.target===d)d.close()}}
function openEntryDetail(id){ensureDetailDialog();const e=entries.find(x=>x.id===id);if(!e)return;const imgs=(e.images||[]).map((x,i)=>({...normImg(x,e.datetime),title:normImg(x,e.datetime).title||`分析圖片 ${i+1}`}));$('#entryDetailContent').innerHTML=`<div class="detail-head"><span class="status-badge">${formatDay(e.datetime)}</span><h2>${e.title}</h2><p class="muted">${formatDate(e.datetime)} · ${e.symbol} · ${e.catalyst}</p></div><div class="detail-block"><h3>核心分析邏輯</h3><p>${e.thesis}</p></div><div class="detail-grid"><div class="detail-block"><h3>關鍵價位</h3><p>${e.levels}</p></div><div class="detail-block"><h3>失效條件</h3><p>${e.invalidation}</p></div></div><div class="detail-block"><h3>當下上傳圖片</h3>${imgs.length?`<div class="detail-gallery">${imgs.map(x=>`<figure data-src="${x.src}"><img src="${x.src}"><figcaption><strong>${x.title}</strong><span>上傳時間：${formatDate(x.uploadedAt)}</span></figcaption></figure>`).join('')}</div>`:'<p class="muted">這筆分析當時沒有上傳圖片。</p>'}</div>`;$$('#entryDetailContent figure').forEach(f=>f.onclick=()=>openLightbox(f.dataset.src,f.innerText));$('#entryDetailDialog').showModal()}

function switchView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));const t={dashboard:'最新交易劇本',entries:'交易紀錄',review:'復盤中心',settings:'資料管理'};$('#pageTitle').textContent=t[id];if(id==='dashboard'){renderDashboardLatest();renderEvidence()}if(id==='entries')renderEntries($('#searchInput')?.value||'')}
$$('.nav-item').forEach(n=>n.onclick=()=>switchView(n.dataset.view));

function renderReview(){let saved={};try{saved=JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')}catch(e){}const root=$('#reviewChecklist');if(!root)return;root.innerHTML='';reviewItems.forEach((t,i)=>{const l=document.createElement('label');l.className='review-item';l.innerHTML=`<input type="checkbox" data-i="${i}" ${saved.checked?.[i]?'checked':''}><span>${t}</span>`;root.appendChild(l)});$('#reviewActual').value=saved.actual||'';$('#reviewExecution').value=saved.execution||'';$('#reviewBias').value=saved.bias||'';$('#reviewNext').value=saved.next||''}
$('#saveReviewBtn')?.addEventListener('click',()=>{const checked={};$$('#reviewChecklist input').forEach(x=>checked[x.dataset.i]=x.checked);localStorage.setItem(REVIEW_KEY,JSON.stringify({checked,actual:$('#reviewActual').value,execution:$('#reviewExecution').value,bias:$('#reviewBias').value,next:$('#reviewNext').value,updatedAt:new Date().toISOString()}));});

$('#newEntryBtn')?.addEventListener('click',()=>{const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());$('#entryForm [name=datetime]').value=d.toISOString().slice(0,16);$('#entryDialog').showModal()});
const entryDialog=$('#entryDialog'),entryForm=$('#entryForm');entryDialog?.querySelectorAll('button[value="cancel"]').forEach(b=>b.onclick=e=>{e.preventDefault();entryForm.reset();entryDialog.close()});entryDialog?.addEventListener('click',e=>{if(e.target===entryDialog){entryForm.reset();entryDialog.close()}});
function compressImage(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const max=1400;let w=img.width,h=img.height;if(w>max){h=Math.round(h*max/w);w=max}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);resolve(c.toDataURL('image/jpeg',.72))};img.onerror=reject;img.src=r.result};r.onerror=reject;r.readAsDataURL(file)})}
$('#saveEntryBtn')?.addEventListener('click',async e=>{e.preventDefault();if(!entryForm.reportValidity())return;const fd=new FormData(entryForm),files=[...entryForm.elements.images.files],images=[],uploadedAt=new Date().toISOString();for(const f of files.slice(0,6))images.push({src:await compressImage(f),uploadedAt,title:f.name});entries.unshift({id:'e'+Date.now(),title:fd.get('title'),datetime:fd.get('datetime'),symbol:fd.get('symbol'),catalyst:fd.get('catalyst'),thesis:fd.get('thesis'),levels:fd.get('levels'),invalidation:fd.get('invalidation'),tags:[fd.get('symbol'),fd.get('catalyst')].filter(Boolean),images});entries.sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));saveEntries(entries);entryForm.reset();entryDialog.close();switchView('entries')});

function exportAll(){const payload={version:2,exportedAt:new Date().toISOString(),entries,review:JSON.parse(localStorage.getItem(REVIEW_KEY)||'{}')};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`trading-journal-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)}
$('#exportBtn')&&($('#exportBtn').onclick=exportAll);$('#exportBtn2')&&($('#exportBtn2').onclick=exportAll);$('#searchInput')?.addEventListener('input',e=>renderEntries(e.target.value));

const style=document.createElement('style');style.textContent=`
#dashboard .content-grid{display:grid!important;grid-template-columns:minmax(0,2.2fr) minmax(250px,.8fr)!important;gap:16px!important}
#dashboard .content-grid>.span-2{grid-column:auto!important}
#dashboard .event-card{display:flex!important;visibility:visible!important;opacity:1!important}
#dashboard>.card:has(.scenario-grid){display:none!important}
.event-time{font-size:25px!important;margin-top:8px!important}.upload-time{display:block!important;margin-top:6px!important;color:var(--accent2)!important}
.day-group{display:grid;gap:10px;margin-bottom:24px}.day-heading{display:flex;justify-content:space-between;padding:4px 2px}.day-heading span{font-size:12px;color:var(--muted)}.entry-card.clickable{cursor:pointer}.detail-dialog{width:min(980px,94vw);max-height:90vh;overflow:auto;padding:26px}.detail-block{border:1px solid var(--line);background:var(--panel2);border-radius:14px;padding:16px;margin-top:14px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.detail-gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.detail-gallery figure{margin:0;border:1px solid var(--line);border-radius:12px;overflow:hidden}.detail-gallery img{width:100%;height:260px;object-fit:cover}.detail-gallery figcaption{padding:10px}.detail-gallery figcaption span{display:block;font-size:11px;color:var(--accent2);margin-top:4px}
@media(max-width:900px){#dashboard .content-grid{grid-template-columns:1fr!important}}
@media(max-width:760px){.detail-grid,.detail-gallery{grid-template-columns:1fr}.detail-gallery img{height:210px}}
`;document.head.appendChild(style);

renderDashboardLatest();renderEvidence();renderEntries();renderReview();setInterval(renderMacroEvent,60000);
