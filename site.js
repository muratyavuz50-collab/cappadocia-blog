import {initialiseTravelPlanner} from './travel-planner.mjs';
import { onCLS,onINP,onLCP } from 'web-vitals';
(() => {
  initialiseTravelPlanner();
  const measured=document.body.dataset.publicPage==='true'&&navigator.doNotTrack!=='1'&&!navigator.globalPrivacyControl;
  const report=(input)=>{
    if(!measured)return;
    const payload=JSON.stringify({path:location.pathname,...input});
    try{if(navigator.sendBeacon('/api/metrics',new Blob([payload],{type:'application/json'})))return;}catch{}
    fetch('/api/metrics',{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true,credentials:'omit'}).catch(()=>{});
  };
  let source='direct';
  try{if(document.referrer){const from=new URL(document.referrer);source=from.origin===location.origin?'internal':/(^|\.)google\.[a-z.]+$/.test(from.hostname)?'google':/(^|\.)bing\.com$/.test(from.hostname)?'bing':/(^|\.)(facebook|instagram|tiktok|pinterest|linkedin|twitter|x)\.com$/.test(from.hostname)?'social':'referral';}}catch{}
  report({kind:'view',source});
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link)return;
    try{const url=new URL(link.href);if((url.hostname==='getyourguide.com'||url.hostname.endsWith('.getyourguide.com'))&&url.searchParams.get('partner_id')==='GTS1OZ5'){report({kind:'affiliate',product:url.pathname.match(/-t(\d+)\/?$/)?.[1]||'browse'});}}catch{}
  });
  // Sample actual browser Web Vitals. Values are aggregated as threshold bands, not fabricated scores.
  if(measured&&Math.random()<0.2){const sent=new Set();const vital=m=>{if(!sent.has(m.id)){sent.add(m.id);report({kind:'vital',metric:m.name,value:m.value});}};onCLS(vital);onINP(vital);onLCP(vital);}
  let partnerLoaded=false;
  const loadPartner=()=>{if(partnerLoaded)return;partnerLoaded=true;const script=document.createElement('script');script.src='https://widget.getyourguide.com/dist/pa.umd.production.min.js';script.async=true;script.defer=true;script.dataset.gygPartnerId='GTS1OZ5';document.head.append(script);};
  const widgets=[...document.querySelectorAll('[data-experience-widget]')];
  if('IntersectionObserver' in window){const lazy=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){loadPartner();lazy.disconnect();}},{rootMargin:'300px'});widgets.forEach(w=>lazy.observe(w));}
  else if(widgets.length)loadPartner();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-faq-accordion]').forEach((detail) => {
    const summary = detail.querySelector('summary');
    const answer = detail.querySelector('.faq-answer');
    let animation;
    let expanded = detail.open;
    summary.addEventListener('click', (event) => {
      event.preventDefault();
      const start = detail.getBoundingClientRect().height;
      animation?.cancel();
      expanded = !expanded;
      if (reducedMotion.matches || !detail.animate) {
        detail.open = expanded;
        detail.style.height = '';
        detail.style.overflow = '';
        return;
      }
      detail.style.height = `${start}px`;
      detail.style.overflow = 'hidden';
      detail.open = true;
      const border = parseFloat(getComputedStyle(detail).borderBottomWidth) || 0;
      const end = summary.getBoundingClientRect().height + border + (expanded ? answer.getBoundingClientRect().height : 0);
      animation = detail.animate({ height: [`${start}px`, `${end}px`] }, { duration: 240, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animation.onfinish = () => {
        detail.open = expanded;
        detail.style.height = '';
        detail.style.overflow = '';
        animation = undefined;
      };
    });
  });
  document.querySelectorAll('[data-experience-widget]').forEach((container) => {
    const status = container.querySelector('.widget-status');
    const trackFrame = () => {
      const frame = container.querySelector('iframe');
      if (!frame) return;
      frame.title ||= 'GetYourGuide dates, availability and booking options';
      frame.addEventListener('load', () => { if (status) status.hidden = true; }, { once: true });
      if (status) status.hidden = true;
      observer.disconnect();
    };
    const observer = new MutationObserver(trackFrame);
    observer.observe(container, { childList: true, subtree: true });
    trackFrame();
    setTimeout(() => {
      if (status && !status.hidden) status.textContent = 'Open the booking link above for current prices and availability.';
    }, 15000);
    window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
  });
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.querySelector('#mobile-menu');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      mobileMenu.hidden = open;
      document.body.classList.toggle('menu-open', !open);
    });
  }

  const search = document.querySelector('#guide-search');
  const cards = [...document.querySelectorAll('[data-article-card]')];
  const chips = [...document.querySelectorAll('[data-filter]')];
  const resultCount = document.querySelector('.results-count strong');
  const empty = document.querySelector('.empty-state');
  let category = 'all';

  const applyFilters = () => {
    if (!cards.length) return;
    const query = (search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const matchesText = !query || (card.dataset.search || '').includes(query);
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const show = matchesText && matchesCategory;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (resultCount) resultCount.textContent = String(visible);
    if (empty) empty.hidden = visible !== 0;
  };

  if (search) {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    const selectedCategory = params.get('category');
    if (selectedCategory && chips.some((chip) => chip.dataset.filter === selectedCategory)) category = selectedCategory;
    search.addEventListener('input', applyFilters);
  }

  chips.forEach((chip) => {
    const selected = chip.dataset.filter === category;
    chip.classList.toggle('active', selected);
    chip.setAttribute('aria-pressed', String(selected));
    chip.addEventListener('click', () => {
      category = chip.dataset.filter || 'all';
      chips.forEach((item) => {
        const active = item === chip;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyFilters();
    });
  });

  document.querySelector('[data-clear-search]')?.addEventListener('click', () => {
    category = 'all';
    if (search) search.value = '';
    chips.forEach((item) => {
      const active = item.dataset.filter === 'all';
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
    search?.focus();
  });
  applyFilters();

  document.querySelector('[data-share]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    try {
      if (navigator.share) await navigator.share({ title: document.title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        const previous = button.textContent;
        button.textContent = 'Link copied';
        setTimeout(() => { button.textContent = previous; }, 1800);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') location.hash = 'main';
    }
  });
})();
