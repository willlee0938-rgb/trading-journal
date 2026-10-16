// UI hotfix: keep the latest analysis images visible without hiding historical evidence.
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

  // Always retain the historical evidence wall instead of replacing it.
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
    el.onclick = () => {
      if(img.style.display !== 'none') openLightbox(item.src, item.title + '｜' + (item.note || ''));
    };
    root.appendChild(el);
  });
};

renderEvidence();
