// Force-fix: keep high-risk event visible and restore primary chart.
(function(){
  const BASE='/trading-journal/';
  const PRIMARY_PAYLOAD=BASE+'primary-chart-20261016.b64.txt?v=20261016-9';

  const style=document.createElement('style');
  style.textContent=`
    html body #dashboard.view.active .content-grid > article.card.event-card{
      display:flex!important;
      visibility:visible!important;
      opacity:1!important;
      position:relative!important;
      z-index:5!important;
      min-height:100%!important;
    }
    html body #dashboard.view.active .content-grid{
      display:grid!important;
      grid-template-columns:minmax(0,2.2fr) minmax(250px,.8fr)!important;
      gap:16px!important;
    }
    @media(max-width:900px){html body #dashboard.view.active .content-grid{grid-template-columns:1fr!important}}
  `;
  document.head.appendChild(style);

  function forceEvent(){
    const grid=document.querySelector('#dashboard .content-grid');
    if(!grid)return;
    let card=grid.querySelector('.event-card');
    if(!card){
      card=document.createElement('article');
      card.className='card event-card';
      card.innerHTML='<div class="card-title"><h3>高風險事件</h3><span class="dot live"></span></div><div class="event-time">—</div><p>—</p><div class="event-rule">—</div>';
      grid.appendChild(card);
    }
    card.style.setProperty('display','flex','important');
    card.style.setProperty('visibility','visible','important');
    card.style.setProperty('opacity','1','important');
    card.style.setProperty('position','relative','important');

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

  async function restorePrimary(){
    const img=document.getElementById('heroPrimaryImage');
    if(!img)return;
    try{
      const r=await fetch(PRIMARY_PAYLOAD,{cache:'no-store'});
      const b64=(await r.text()).trim();
      if(b64)img.src='data:image/jpeg;base64,'+b64;
    }catch(e){}
  }

  const run=()=>{forceEvent();restorePrimary();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  window.addEventListener('load',run);
  setTimeout(run,100);
  setTimeout(run,500);
  setTimeout(run,1500);
  setInterval(forceEvent,1000);

  const observer=new MutationObserver(forceEvent);
  const dash=document.getElementById('dashboard');
  if(dash)observer.observe(dash,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
})();
