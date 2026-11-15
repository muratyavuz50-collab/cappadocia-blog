// The supplied widget UUIDs select Booking's saved widget configuration.
// Verified against https://www.booking.com/affiliate/prelanding_sdk on 2026-11-15.
const SDK_URL = 'https://www.booking.com/affiliate/prelanding_sdk';
const WIDGETS = Object.freeze({
  'bookingAffiliateWidget_386d39d7-2d08-41b5-af0f-0fc2c536b862': {
    type: 'accommodation',
    creative: '17323528',
  },
  'bookingAffiliateWidget_39c24ef3-3091-43e9-a903-e1857048b61e': {
    type: 'flights',
    creative: '17323529',
  },
  'bookingAffiliateWidget_e893728b-511b-4a33-a796-65c92eaae72a': {
    type: 'accommodation',
    creative: '17388448',
  },
});
const SDK_TIMEOUT_MS = 12000;
const WIDGET_TIMEOUT_MS = 20000;
const sectionsSeen = new WeakSet();
const selectorsReserved = new Set();
const selectorsStarted = new Set();
let sdkPromise;
let viewportObserver;
const waitingSections = new WeakMap();

function loadSDK() {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window.Booking?.AffiliateWidget === 'function') {
      resolve(window.Booking.AffiliateWidget);
      return;
    }

    let script = [...document.scripts].find((item) => item.src === SDK_URL);
    const needsAppend = !script;
    if (!script) {
      script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.dataset.bookingSdk = 'true';
    }

    let settled = false;
    const finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (error) reject(error);
      else resolve(window.Booking.AffiliateWidget);
    };
    const onLoad = () => {
      if (typeof window.Booking?.AffiliateWidget === 'function') finish();
      else finish(new Error('Booking widget SDK is unavailable'));
    };
    const onError = () => finish(new Error('Booking widget SDK could not load'));
    const timer = setTimeout(onError, SDK_TIMEOUT_MS);
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (needsAppend) document.head.append(script);
  });
  return sdkPromise;
}

function updateStatus(record, state) {
  record.section.dataset.bookingState = state;
  if (!record.status) return;
  const text = state === 'ready'
    ? record.status.dataset.bookingReadyText
    : record.status.dataset.bookingFallbackText;
  // All visitor-facing text comes from the page's own locale. Never leave a
  // permanent loading message after failure, or claim an iframe load is success.
  record.status.hidden = !text;
  if (text) record.status.textContent = text;
}

function clearPending(record) {
  if (record.timer) clearTimeout(record.timer);
  record.timer = undefined;
  if (record.onMessage) window.removeEventListener('message', record.onMessage);
  record.onMessage = undefined;
  if (record.onFrameError && record.frame) {
    record.frame.removeEventListener('error', record.onFrameError);
  }
  record.onFrameError = undefined;
}

function fallback(record) {
  if (record.state === 'ready' || record.state === 'fallback') return;
  record.state = 'fallback';
  clearPending(record);
  if (record.mount) {
    record.mount.hidden = true;
    record.mount.removeAttribute('aria-busy');
    record.mount.replaceChildren();
  }
  updateStatus(record, 'fallback');
  // The server-rendered affiliate link and supplied impression pixel are
  // outside the mount and remain untouched, including when third parties fail.
}

function validDestination(value, creative) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:'
      && url.hostname === 'www.jdoqocy.com'
      && !url.port && !url.username && !url.password && !url.hash
      && url.pathname === `/click-101906092-${creative}`
      && url.searchParams.getAll('sid').length === 1
      && [...url.searchParams.keys()].every((key) => key === 'sid')
      && /^[A-Za-z0-9._-]{0,100}$/.test(url.searchParams.get('sid'));
  } catch {
    return false;
  }
}

function widgetSettings(record) {
  const data = record.section.dataset;
  const settings = { destinationurloverride: record.destination };
  const language = (data.bookingLanguagecode || document.documentElement.lang || '').toLowerCase();
  const languageMap = {
    en: 'en-us', 'en-us': 'en-us', 'en-gb': 'en-gb',
    tr: 'tr', es: 'es', de: 'de', fr: 'fr', it: 'it', ru: 'ru', ja: 'ja',
    ar: 'ar', ko: 'ko', pt: 'pt-pt', 'pt-pt': 'pt-pt', 'pt-br': 'pt-br',
    zh: 'zh-cn', 'zh-cn': 'zh-cn', 'zh-hans': 'zh-cn',
    'zh-tw': 'zh-tw', 'zh-hant': 'zh-tw',
  };
  settings.languagecode = languageMap[language] || languageMap[language.split('-')[0]] || 'default';
  if (data.bookingCurrency && /^[A-Z]{3}$/.test(data.bookingCurrency)) {
    settings.selected_currency = data.bookingCurrency;
  }
  const search = data.bookingSearch?.trim();
  if (record.type === 'accommodation' && search && search.length <= 150 && !/[\u0000-\u001f\u007f]/.test(search)) {
    settings.ss = search;
  }
  if (data.bookingClickLabel && /^[A-Za-z0-9._-]{1,100}$/.test(data.bookingClickLabel)) {
    settings.clickLabel = data.bookingClickLabel;
  }
  // Dates stay under the traveller's control; no example dates are forwarded.
  return settings;
}

async function startWidget(record) {
  if (record.state !== 'waiting') return;
  if (!record.section.isConnected || !record.mount.isConnected) {
    fallback(record);
    return;
  }
  record.state = 'loading';
  record.section.dataset.bookingState = 'loading';
  record.mount.hidden = false;
  record.mount.setAttribute('aria-busy', 'true');
  record.timer = setTimeout(() => fallback(record), WIDGET_TIMEOUT_MS);

  try {
    const AffiliateWidget = await loadSDK();
    if (record.state !== 'loading') return;
    if (!record.mount.isConnected || document.getElementById(record.selector) !== record.mount
      || selectorsStarted.has(record.selector)) {
      fallback(record);
      return;
    }

    record.onMessage = (event) => {
      // The SDK's real readiness signal is emitted by the widget iframe.
      // A 404/challenge page can emit "load", but cannot satisfy this check.
      if (record.state !== 'loading'
        || !record.frame
        || event.source !== record.frame.contentWindow
        || event.origin !== 'https://www.booking.com'
        || !event.data || typeof event.data !== 'object'
        || event.data.type !== 'WasabiWidget:Load') return;
      record.state = 'ready';
      clearPending(record);
      record.mount.removeAttribute('aria-busy');
      updateStatus(record, 'ready');
    };
    window.addEventListener('message', record.onMessage);
    selectorsStarted.add(record.selector);
    new AffiliateWidget({
      iframeSettings: { selector: record.selector, responsive: true },
      widgetSettings: widgetSettings(record),
    });
    record.frame = record.mount.querySelector('iframe');
    if (!record.frame) {
      fallback(record);
      return;
    }
    // Our viewport observer already provides lazy loading. Loading the inner
    // iframe now prevents a second lazy threshold from consuming its deadline.
    record.frame.loading = 'eager';
    record.onFrameError = () => fallback(record);
    record.frame.addEventListener('error', record.onFrameError, { once: true });
  } catch {
    fallback(record);
  }
}

function observeWidget(record) {
  if (typeof window.IntersectionObserver !== 'function') {
    void startWidget(record);
    return;
  }
  if (!viewportObserver) {
    viewportObserver = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        viewportObserver.unobserve(entry.target);
        const pending = waitingSections.get(entry.target);
        waitingSections.delete(entry.target);
        if (pending) void startWidget(pending);
      }
    }, { rootMargin: '300px' });
  }
  waitingSections.set(record.section, record);
  viewportObserver.observe(record.section);
}

export function initBookingWidgets() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  for (const section of document.querySelectorAll('[data-booking-widget]')) {
    if (sectionsSeen.has(section)) continue;
    sectionsSeen.add(section);
    const config = Object.prototype.hasOwnProperty.call(WIDGETS, section.dataset.bookingSelector)
      ? WIDGETS[section.dataset.bookingSelector] : null;
    const record = {
      section,
      mount: section.querySelector('.booking-widget-mount'),
      status: section.querySelector('[data-booking-status]'),
      selector: section.dataset.bookingSelector,
      destination: section.dataset.bookingDestination,
      type: section.dataset.bookingType,
      state: 'waiting',
    };
    if (!config || record.type !== config.type || !record.mount
      || record.mount.id !== record.selector
      || document.getElementById(record.selector) !== record.mount
      || selectorsReserved.has(record.selector)
      || !validDestination(record.destination, config.creative)) {
      fallback(record);
      continue;
    }
    selectorsReserved.add(record.selector);
    record.mount.hidden = true;
    section.dataset.bookingState = 'waiting';
    observeWidget(record);
  }
}
