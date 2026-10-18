// Stable lightweight dashboard helper. No MutationObserver, no tight intervals.
(function(){
  const BASE='/trading-journal/';
  const PRIMARY_PAYLOAD=BASE+'primary-chart-20261016.b64.txt?v=20261016-10';
  const historical=[
    ['liquidation-1w.jpeg','清算熱力圖｜1 週','84.7K 一帶存在明顯上方流動性；82K 下方亦有密集區。','2026-10-14T20:07:00+08:00'],
    ['liquidation-3d.jpeg','清算熱力圖｜3 天','短線 84.5K 左右的黃色帶最突出。','2026-10-14T20:07:00+08:00'],
    ['liquidation-1m.jpeg','清算熱力圖｜1 個月','更高週期在 87–88K 一帶出現較強流動性。','2026-10-14T20:07:00+08:00'],
    ['tv-4h-scenarios.jpeg','4H 情境草圖','當時的 4H 走勢推演。','2026-10-14T20:07:00+08:00'],
    ['tv-1d-context.jpeg','日線結構','當時的日線市場結構。','2026-10-14T20:07:00+08:00'],
    ['bingx-3d-macd.jpeg','3 日 MACD','3 日級別動能觀察。','2026-10-14T20:07:00+08:00'],
    ['bingx-1d-macd.jpeg','日線 MACD','日線級別動能觀察。','2026-10-14T20:07:00+08:00'],
    ['bingx-1w-macd.jpeg','週線動能','週線 MACD / KDJ 動能觀察。','2026-10-14T20:07:00+08:00'],
    ['tv-1w-orderblock.jpeg','週線 Order Block','90–94K 週線供給區觀察。','2026-10-14T20:07:00+08:00']
  ];

  const fmt=v=>{try{return new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(e){return v}};

  function openImage(src,caption){
    const d=document.getElementById('imageDialog'),i=document.getElementById('lightboxImage'),c=document.getElementById('lightboxCaption');
    if(!d||!i)return;i.src=src;if(c)c.textContent=caption;if(d.showModal)d.showModal();
  }

  function renderGallery(){
    const root=document.getElementById('evidenceGallery');if(!root)return;
    root.innerHTML='';
    historical.forEach(([file,title,note,time])=>{
      const src=BASE+file+'?v=20261016-10';
      const card=document.createElement('div');card.className='evidence';
      card.innerHTML=`<img src="${src}" alt="${title}" loading="lazy"><div class="caption"><strong>${title}</strong><span>${note}</span><span style="display:block;margin-top:6px;color:var(--accent2)">上傳時間：${fmt(time)}</span></div>`;
      card.onclick=()=>openImage(src,`${title}｜上傳時間：${fmt(time)}`);
      root.appendChild(card);
    });
  }

  function renderEvent(){
    const card=document.querySelector('#dashboard .event-card');if(!card)return;
    card.style.display='flex';card.style.visibility='visible';card.style.opacity='1';
    const events=[
      ['2026-10-29T02:00:00+08:00','FOMC 利率決議','極高','02:00 決議；02:30 記者會。前後 30–60 分鐘避免高槓桿與追價。'],
      ['2026-10-29T20:30:00+08:00','美國 GDP + PCE','高','GDP 與 PCE 同時公布，可能放大美元與 BTC 波動。'],
      ['2026-11-06T21:30:00+08:00','美國非農 NFP','極高','就業、失業率、薪資同時公布。'],
      ['2026-11-10T21:30:00+08:00','美國 CPI','極高','通膨數據可能直接影響降息預期與 BTC 波動。']
    ];
    const now=Date.now();const e=events.find(x=>new Date(x[0]).getTime()>now)||events.at(-1);const d=new Date(e[0]);
    const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',weekday:'short'}).format(d);
    const time=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',hour:'2-digit',minute:'2-digit',hour12:false}).format(d);
    const diff=Math.max(0,d-now),days=Math.floor(diff/86400000),hrs=Math.floor(diff%86400000/3600000),mins=Math.floor(diff%3600000/60000);
    const count=days?`倒數 ${days} 天 ${hrs} 小時`:hrs?`倒數 ${hrs} 小時 ${mins} 分`:`倒數 ${mins} 分鐘`;
    card.querySelector('h3').textContent=`高風險事件 · ${e[2]}`;card.querySelector('.event-time').textContent=`${date} ${time}`;card.querySelector('p').textContent=`${e[1]}｜${count}`;card.querySelector('.event-rule').textContent=`⚠ 台灣時間｜${e[3]}`;
  }

  async function restorePrimary(){
    const img=document.getElementById('heroPrimaryImage'),card=document.getElementById('primaryAnalysisCard');if(!img)return;
    const latest=typeof getLatestEntry==='function'?getLatestEntry():null;
    if(latest&&latest.id!=='btc-20261016-mss-fvg'){
      if(card){card.style.display='none';card.setAttribute('aria-hidden','true')}
      return;
    }
    if(card){card.style.display='';card.removeAttribute('aria-hidden')}
    try{const r=await fetch(PRIMARY_PAYLOAD,{cache:'no-store'});if(!r.ok)return;const b64=(await r.text()).trim();if(!b64)return;const src='data:image/jpeg;base64,'+b64;img.src=src;if(card)card.onclick=()=>openImage(src,'BTCUSDT｜MSS 後 FVG 回踩主分析圖｜2026/10/16 16:25');}catch(e){}
  }

  function run(){renderEvent();renderGallery();restorePrimary();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',()=>{renderEvent();restorePrimary();},{once:true});
})();
