// Hotfixes loaded after app.js

// 1) Correct today's key levels and persist the correction over stale localStorage data.
const todayEntryId = 'btc-20261016-mss-fvg';
const correctedTodayLevels = '81,600 / 80,800 / 84,000–85,000 / 87,000';
const todayEntry = entries.find(x => x.id === todayEntryId);
if (todayEntry) {
  todayEntry.levels = correctedTodayLevels;
  saveEntries(entries);
}
const todaySeed = seedEntries.find(x => x.id === todayEntryId);
if (todaySeed) todaySeed.levels = correctedTodayLevels;

// 2) Re-render dashboard with slash-only level parsing so commas remain thousands separators.
renderDashboardLatest = function(){
  const e = getLatestEntry();
  const hero = document.querySelector('#dashboard .hero-card');
  if(hero){
    const badge=hero.querySelector('.status-badge'),title=hero.querySelector('h2'),meta=hero.querySelector('.muted'),priceLabel=hero.querySelector('.price-box span'),priceValue=hero.querySelector('.price-box strong'),thesis=hero.querySelector('.thesis-callout p'),thesisLabel=hero.querySelector('.thesis-callout span');
    if(badge) badge.textContent='最新交易劇本';
    if(title) title.textContent=e.title||'最新分析';
    if(meta) meta.textContent=`${formatDate(e.datetime)} · ${e.symbol||'—'}`;
    if(priceLabel) priceLabel.textContent='最新更新';
    if(priceValue) priceValue.textContent=(e.datetime||'').slice(5,10).replace('-','/');
    if(thesisLabel) thesisLabel.textContent='核心邏輯';
    if(thesis) thesis.textContent=e.thesis||'尚未填寫';

    const row=hero.querySelector('.metric-row');
    if(row){
      const lv=(e.levels||'').split(/\s*\/\s*/).map(x=>x.trim()).filter(Boolean);
      row.innerHTML=[
        ['事件 / 催化劑',e.catalyst||'無'],
        ['標的',e.symbol||'—'],
        ['關鍵價位 1',lv[0]||'—'],
        ['關鍵價位 2',lv[1]||'—'],
        ['狀態','最新一期']
      ].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
    }
  }

  renderMacroEvent();

  const logic=document.querySelectorAll('#dashboard .logic-step');
  const data=[
    ['最新觀點',e.thesis||'—'],
    ['關鍵價位',e.levels||'—'],
    ['失效條件',e.invalidation||'—'],
    ['執行原則','以最新價格行為確認，不因舊劇本硬套市場。']
  ];
  [...logic].forEach((x,i)=>{if(!data[i])return;const s=x.querySelector('strong'),p=x.querySelector('p');if(s)s.textContent=data[i][0];if(p)p.textContent=data[i][1]});

  const sc=document.querySelectorAll('#dashboard .scenario');
  const sd=[
    ['目前主劇本','核心假設',e.thesis||'—'],
    ['關鍵區域','價位觀察',e.levels||'—'],
    ['風險控制','劇本失效',e.invalidation||'—']
  ];
  [...sc].forEach((c,i)=>{if(!sd[i])return;const t=c.querySelector('.tag'),h=c.querySelector('h4'),p=c.querySelector('p');if(t)t.textContent=sd[i][0];if(h)h.textContent=sd[i][1];if(p)p.textContent=sd[i][2]});
};

// 3) Keep latest images and all historical evidence together.
renderEvidence = function(){
  const root = document.querySelector('#evidenceGallery');
  if(!root) return;
  root.innerHTML = '';
  const latest = getLatestEntry();
  const latestImages = (latest.images || []).filter(Boolean).map((src, i) => ({
    src,
    title: `最新分析圖片 ${i + 1}`,
    note: `${latest.title || '最新分析'} · ${formatDate(latest.datetime)}`,
    latest: true
  }));
  const historical = seedEvidence.map(item => ({...item, latest:false}));
  const seen = new Set();
  const items = [...latestImages, ...historical].filter(item => {
    if(!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'evidence' + (item.latest ? ' latest-evidence' : '');
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title;
    img.loading = 'lazy';
    img.onerror = () => {
      el.classList.add('image-error');
      img.style.display = 'none';
      const fallback = el.querySelector('.image-fallback');
      if(fallback) fallback.style.display = 'grid';
    };
    const fallback = document.createElement('div');
    fallback.className = 'image-fallback';
    fallback.style.display = 'none';
    fallback.textContent = '圖片載入失敗';
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.innerHTML = `<strong>${item.title}</strong><span>${item.note || ''}</span>`;
    el.appendChild(img);
    el.appendChild(fallback);
    el.appendChild(caption);
    el.onclick = () => { if(img.style.display !== 'none') openLightbox(item.src, item.title + '｜' + (item.note || '')); };
    root.appendChild(el);
  });
};

renderDashboardLatest();
renderEvidence();
