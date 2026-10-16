// Standalone fixes for primary chart, risk event card, and stable review gallery.
(function(){
  const VERSION='20261016-8';
  const BASE='/trading-journal/';
  const PRIMARY_PAYLOAD=`${BASE}primary-chart-20261016.b64.txt?v=${VERSION}`;
  const historical=[
    {file:'liquidation-1w.jpeg',title:'清算熱力圖｜1 週',note:'84.7K 一帶存在明顯上方流動性；82K 下方亦有密集區。',time:'2026-10-14T20:07:00+08:00'},
    {file:'liquidation-3d.jpeg',title:'清算熱力圖｜3 天',note:'短線 84.5K 左右的黃色帶最突出。',time:'2026-10-14T20:07:00+08:00'},
    {file:'liquidation-1m.jpeg',title:'清算熱力圖｜1 個月',note:'更高週期在 87–88K 一帶出現較強流動性。',time:'2026-10-14T20:07:00+08:00'},
    {file:'tv-4h-scenarios.jpeg',title:'4H 情境草圖',note:'當時的 4H 走勢推演。',time:'2026-10-14T20:07:00+08:00'},
    {file:'tv-1d-context.jpeg',title:'日線結構',note:'當時的日線市場結構。',time:'2026-10-14T20:07:00+08:00'},
    {file:'bingx-3d-macd.jpeg',title:'3 日 MACD',note:'3 日級別動能觀察。',time:'2026-10-14T20:07:00+08:00'},
    {file:'bingx-1d-macd.jpeg',title:'日線 MACD',note:'日線級別動能觀察。',time:'2026-10-14T20:07:00+08:00'},
    {file:'bingx-1w-macd.jpeg',title:'週線動能',note:'週線 MACD / KDJ 動能觀察。',time:'2026-10-14T20:07:00+08:00'},
    {file:'tv-1w-orderblock.jpeg',title:'週線 Order Block',note:'90–94K 週線供給區觀察。',time:'2026-10-14T20:07:00+08:00'}
  ];

  function fmt(value){
    try{return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));}
    catch(e){return value||'—';}
  }

  function openImage(src,caption){
    const dialog=document.getElementById('imageDialog');
    const img=document.getElementById('lightboxImage');
    const cap=document.getElementById('lightboxCaption');
    if(img)img.src=src;
    if(cap)cap.textContent=caption;
    if(dialog&&dialog.showModal)dialog.showModal();
  }

  async function restorePrimaryChart(){
    const img=document.getElementById('heroPrimaryImage');
    const card=document.getElementById('primaryAnalysisCard');
    if(!img)return;
    try{
      const res=await fetch(PRIMARY_PAYLOAD,{cache:'no-store'});
      if(!res.ok)throw new Error('payload '+res.status);
      const b64=(await res.text()).trim();
      const src='data:image/jpeg;base64,'+b64;
      img.src=src;
      img.style.display='block';
      if(card){
        card.onclick=()=>openImage(src,'BTCUSDT｜MSS 後 FVG 回踩主分析圖｜2026/10/16 16:25');
      }
    }catch(err){
      console.error('Primary chart load failed',err);
      img.alt='主分析圖載入失敗';
    }
  }

  function ensureRiskEvent(){
    const grid=document.querySelector('#dashboard .content-grid');
    if(!grid)return;
    let card=grid.querySelector('.event-card');
    if(!card){
      card=document.createElement('article');
      card.className='card event-card';
      card.innerHTML='<div class="card-title"><h3>高風險事件</h3><span class="dot live"></span></div><div class="event-time">—</div><p>—</p><div class="event-rule">—</div>';
      grid.appendChild(card);
    }
    card.style.display='flex';
    card.style.visibility='visible';
    card.style.opacity='1';

    const events=[
      {t:'2026-10-29T02:00:00+08:00',name:'FOMC 利率決議',risk:'極高',note:'02:00 決議；02:30 記者會。前後 30–60 分鐘避免高槓桿與追價。'},
      {t:'2026-10-29T20:30:00+08:00',name:'美國 GDP + PCE',risk:'高',note:'GDP 與 PCE 同時公布，可能放大美元與 BTC 波動。'},
      {t:'2026-11-06T21:30:00+08:00',name:'美國非農 NFP',risk:'極高',note:'就業、失業率、薪資同時公布。'},
      {t:'2026-11-10T21:30:00+08:00',name:'美國 CPI',risk:'極高',note:'通膨數據可能直接影響降息預期與 BTC 波動。'}
    ];
    const now=Date.now();
    const evt=events.find(x=>new Date(x.t).getTime()>now)||events[events.length-1];
    const d=new Date(evt.t);
    const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',weekday:'short'}).format(d);
    const time=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
    const diff=Math.max(0,d.getTime()-now);
    const days=Math.floor(diff/86400000),hrs=Math.floor((diff%86400000)/3600000),mins=Math.floor((diff%3600000)/60000);
    const countdown=days>0?`倒數 ${days} 天 ${hrs} 小時`:hrs>0?`倒數 ${hrs} 小時 ${mins} 分`:`倒數 ${mins} 分鐘`;
    card.querySelector('h3').textContent=`高風險事件 · ${evt.risk}`;
    card.querySelector('.event-time').textContent=`${date} ${time}`;
    card.querySelector('p').textContent=`${evt.name}｜${countdown}`;
    card.querySelector('.event-rule').textContent=`⚠ 台灣時間｜${evt.note}`;
  }

  function renderGallery(){
    const root=document.getElementById('evidenceGallery');
    if(!root)return;
    root.innerHTML='';
    historical.forEach(item=>{
      const src=`${BASE}${item.file}?v=${VERSION}`;
      const uploaded=`上傳時間：${fmt(item.time)}`;
      const card=document.createElement('div');
      card.className='evidence';
      card.innerHTML=`<img src="${src}" alt="${item.title}" loading="eager"><div class="caption"><strong>${item.title}</strong><span>${item.note}</span><span class="upload-time" style="display:block;margin-top:6px;color:var(--accent2)">${uploaded}</span></div>`;
      const img=card.querySelector('img');
      img.addEventListener('error',()=>{img.style.display='none';const fail=document.createElement('div');fail.textContent=`圖片載入失敗：${item.file}`;fail.style.cssText='display:grid;place-items:center;height:190px;padding:12px;color:var(--danger);background:var(--panel2);font-size:12px';card.insertBefore(fail,card.firstChild);});
      card.addEventListener('click',()=>{if(img.style.display!=='none')openImage(src,`${item.title}｜${uploaded}`)});
      root.appendChild(card);
    });
  }

  function renderAll(){restorePrimaryChart();ensureRiskEvent();renderGallery();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderAll);else renderAll();
  window.addEventListener('load',renderAll);
  setTimeout(renderAll,400);
  setTimeout(renderAll,1500);
  setInterval(ensureRiskEvent,60000);
  window.restoreTradingGallery=renderGallery;
})();
