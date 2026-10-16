// Standalone review gallery renderer. It does NOT depend on app.js, localStorage, or app globals.
(function(){
  const VERSION='20261016-5';
  const BASE='/trading-journal/';
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

  function render(){
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
      img.addEventListener('error',()=>{
        img.style.display='none';
        const fail=document.createElement('div');
        fail.textContent=`圖片載入失敗：${item.file}`;
        fail.style.cssText='display:grid;place-items:center;height:190px;padding:12px;color:var(--danger);background:var(--panel2);font-size:12px';
        card.insertBefore(fail,card.firstChild);
      });
      card.addEventListener('click',()=>{if(img.style.display!=='none')openImage(src,`${item.title}｜${uploaded}`)});
      root.appendChild(card);
    });
  }

  // Render multiple times so a broken/late app script cannot erase the gallery.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  window.addEventListener('load',render);
  setTimeout(render,300);
  setTimeout(render,1200);
  window.restoreTradingGallery=render;
})();
