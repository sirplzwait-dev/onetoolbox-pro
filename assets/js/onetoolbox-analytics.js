(function () {
  'use strict';

  var id = window.ONETOOLBOX_GA4_ID;
  if (!id || id === 'G-XXXXXXXXXX') return;

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
  document.head.appendChild(s);

  function cleanText(value, max) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max || 120);
  }

  function send(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  // Tracks navigation and CTA clicks without collecting typed text or file names.
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a,button,[role="button"]') : null;
    if (!el) return;
    var text = cleanText(el.getAttribute('aria-label') || el.innerText || el.textContent);
    var href = el.getAttribute('href') || '';
    send('user_action', {
      action_type: 'click',
      element_type: el.tagName.toLowerCase(),
      element_id: cleanText(el.id, 80),
      element_text: text,
      destination: href ? href.slice(0, 300) : '',
      page_path: location.pathname
    });
  }, true);

  // Tracks form submission names only; never sends field values.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    send('user_action', {
      action_type: 'form_submit',
      form_id: cleanText(form && form.id, 80),
      form_name: cleanText(form && form.getAttribute('name'), 80),
      page_path: location.pathname
    });
  }, true);

  // Tracks file selection by type/count/size only; file names are never sent.
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input || input.tagName !== 'INPUT' || input.type !== 'file') return;
    var files = Array.from(input.files || []);
    var types = files.map(function (f) { return f.type || 'unknown'; }).slice(0, 10);
    var totalBytes = files.reduce(function (sum, f) { return sum + (f.size || 0); }, 0);
    send('file_selected', {
      file_count: files.length,
      file_types: types.join(',').slice(0, 300),
      total_size_kb: Math.round(totalBytes / 1024),
      page_path: location.pathname
    });
  }, true);

  // Helpful for tool pages: button presses can be seen as actions in GA4.
  window.OneToolBoxAnalytics = { event: send };
})();
