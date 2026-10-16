// Phase one only prepares context and opens ChatGPT. No API calls or AI replies.
// Read the existing app's accessor on demand; never replace its renderers or state.
(function () {
  'use strict';

  const root = document.getElementById('aiAssistant');
  if (!root) return;
  const find = id => root.querySelector(`#${id}`);
  const toggle = find('aiAssistantToggle');
  const panel = find('aiAssistantPanel');
  const question = find('aiAssistantQuestion');
  const preview = find('aiAssistantPrompt');
  const open = find('aiAssistantOpen');
  const status = find('aiAssistantStatus');

  function prepare() {
    const entry = typeof getLatestEntry === 'function' ? getLatestEntry() : null;
    find('aiAssistantEntry').textContent = entry?.title || '尚無交易劇本';
    preview.value = [
      '請用繁體中文協助我檢視以下交易劇本，區分已知條件與假設，指出風險及需要補充的資訊。這是歷史紀錄，不代表即時行情；請勿捏造目前價格或保證獲利。',
      `標題：${entry?.title || '未提供'}`,
      `紀錄時間（原始值）：${entry?.datetime || '未提供'}`,
      `標的：${entry?.symbol || '未提供'}`,
      `核心邏輯：${entry?.thesis || '未提供'}`,
      `關鍵價位：${entry?.levels || '未提供'}`,
      `失效條件：${entry?.invalidation || '未提供'}`,
      `我的問題：${question.value.trim() || '（請先輸入問題）'}`
    ].join('\n\n');
    const url = new URL('https://chatgpt.com/');
    url.searchParams.set('q', preview.value);
    // Long custom entries can exceed URL limits; retain every character for copy.
    const tooLong = url.href.length > 7000;
    open.href = tooLong ? 'https://chatgpt.com/' : url.href;
    open.textContent = tooLong ? '開啟 ChatGPT，複製內容後貼上 ↗' : '帶著問題前往 ChatGPT ↗';
    return { entry, tooLong };
  }

  function setExpanded(expanded) {
    panel.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    if (expanded) {
      status.textContent = '';
      prepare();
      question.focus({ preventScroll: true });
    } else toggle.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => setExpanded(panel.hidden));
  find('aiAssistantClose').addEventListener('click', () => setExpanded(false));
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
    }
  });
  question.addEventListener('input', () => {
    status.textContent = '';
    question.setCustomValidity('');
    prepare();
  });
  open.addEventListener('click', event => {
    const { entry, tooLong } = prepare();
    if (!entry || !question.value.trim()) {
      event.preventDefault();
      status.textContent = entry ? '請先輸入想討論的問題。' : '目前沒有可讀取的交易劇本。';
      question.focus();
      return;
    }
    status.textContent = tooLong
      ? '內容較長，請按「複製完整內容」，再到 ChatGPT 貼上。'
      : '已開啟 ChatGPT 連結。若問題未帶入或分頁未開啟，請複製完整內容後貼上。';
  });
  find('aiAssistantCopy').addEventListener('click', async () => {
    prepare();
    try {
      await navigator.clipboard.writeText(preview.value);
      status.textContent = '已複製劇本與問題，可到 ChatGPT 貼上。';
    } catch {
      root.querySelector('details').open = true;
      preview.focus();
      preview.select();
      status.textContent = '無法自動複製，已選取完整內容，請使用系統的複製功能。';
    }
  });

  toggle.hidden = false;
})();
