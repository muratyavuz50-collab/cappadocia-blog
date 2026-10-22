(() => {
  const source = document.querySelector('#locale-interface');
  if (!source) return;
  const {lang = 'en', copy = {}} = JSON.parse(source.textContent);
  const format = (text, values = []) => text.replace(/\{(\d+)\}/g, (_, index) => String(values[index] ?? ''));
  window.Locale = {lang, t: (key, values = []) => format(copy[key] ?? key, values)};
  const isAsset = path => /^\/(?:assets|images|api|admin|signin|signout|\.well-known)(?:\/|[-.])/.test(path) || /\.(?:css|js|mjs|json|svg|png|jpe?g|webp|gif|avif|ico|mp4|woff2?|txt|xml)$/i.test(path);
  const prefix = value => {
    if (!value || value.startsWith('#') || /^(?:mailto|tel|data|javascript):/.test(value)) return value;
    try {
      const url = new URL(value, location.origin);
      if (url.origin !== location.origin || isAsset(url.pathname)) return value;
      const bare = url.pathname.replace(/^\/(tr|es|zh)(?=\/|$)/, '') || '/';
      url.pathname = lang === 'en' ? bare : '/' + lang + bare;
      return value.startsWith('/') ? url.pathname + url.search + url.hash : url.href;
    } catch { return value; }
  };
  const translate = value => {
    const key = value.trim().replace(/\s+/g, ' ');
    return Object.hasOwn(copy, key) ? value.replace(key, copy[key]) : value;
  };
  const skipped = 'script, style, svg, code, pre, textarea, .brand, .wordmark, .locale-switcher, .instagram-media';
  const visit = node => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement?.closest(skipped)) return;
      const next = translate(node.data);
      if (next !== node.data) node.data = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches(skipped)) return;
    for (const name of ['aria-label', 'aria-description', 'title', 'placeholder']) {
      const value = node.getAttribute(name);
      if (value) { const next = translate(value); if (next !== value) node.setAttribute(name, next); }
    }
    for (const name of ['href', 'action']) {
      const value = node.getAttribute(name);
      if (value) { const next = prefix(value); if (next !== value) node.setAttribute(name, next); }
    }
    for (const child of node.childNodes) visit(child);
  };
  visit(document.body);
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'characterData') visit(record.target);
      else if (record.type === 'attributes') visit(record.target);
      else record.addedNodes.forEach(visit);
    }
  });
  observer.observe(document.body, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'aria-description', 'title', 'placeholder', 'href', 'action']});
  // Header height grows naturally with translated labels and the language row.
  const header = document.querySelector('.site-header');
  if (header) {
    const position = () => document.documentElement.style.setProperty('--locale-header-bottom', Math.max(0, header.getBoundingClientRect().bottom) + 'px');
    new ResizeObserver(position).observe(header);
    addEventListener('resize', position);
    addEventListener('scroll', position, {passive: true});
    position();
  }
})();
