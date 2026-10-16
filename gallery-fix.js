// Stable gallery restoration layer. Loaded after app.js.
(function(){
  const oldRender = typeof renderEvidence === 'function' ? renderEvidence : null;

  renderEvidence = function(){
    const root = document.querySelector('#evidenceGallery');
    if(!root) return;
    root.innerHTML = '';

    const seen = new Set();
    const items = [];

    // Always restore the original historical evidence first.
    (seedEvidence || []).forEach((item, i) => {
      const src = typeof item === 'string' ? item : item.src;
      if(!src || seen.has(src)) return;
      seen.add(src);
      items.push({
        src,
        title: item.title || `歷史分析圖片 ${i+1}`,
        note: item.note || '歷史分析圖片',
        uploadedAt: item.uploadedAt || '2026-10-14T20:07:00+08:00',
        group: '歷史分析'
      });
    });

    // Then append every image from every saved daily analysis.
    (entries || []).forEach(entry => {
      (entry.images || []).forEach((raw, i) => {
        const img = typeof raw === 'string'
          ? {src: raw, uploadedAt: entry.datetime}
          : raw || {};
        if(!img.src || seen.has(img.src)) return;
        seen.add(img.src);
        items.push({
          src: img.src,
          title: img.title || `${entry.title || '分析'}｜圖片 ${i+1}`,
          note: img.note || entry.title || '',
          uploadedAt: img.uploadedAt || entry.datetime,
          group: entry.title || '交易分析'
        });
      });
    });

    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'evidence';
      const uploaded = `上傳時間：${formatDate(item.uploadedAt)}`;
      el.innerHTML = `
        <img src="${item.src}" alt="${item.title}" loading="lazy">
        <div class="caption">
          <strong>${item.title}</strong>
          <span>${item.note || item.group || ''}</span>
          <span class="upload-time">${uploaded}</span>
        </div>`;

      const img = el.querySelector('img');
      img.onerror = () => {
        img.style.display='none';
        const fail=document.createElement('div');
        fail.className='image-fallback';
        fail.textContent='圖片載入失敗';
        fail.style.cssText='display:grid;place-items:center;height:190px;color:var(--muted);background:var(--panel2)';
        el.insertBefore(fail, el.firstChild);
      };
      el.onclick = () => {
        if(img.style.display !== 'none') openLightbox(item.src, `${item.title}｜${uploaded}`);
      };
      root.appendChild(el);
    });

    if(!items.length && oldRender) oldRender();
  };

  renderEvidence();
})();
