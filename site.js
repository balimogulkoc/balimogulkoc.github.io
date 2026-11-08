/* Velaris Labs: shared script for every page on this site.
   Language: #en / #tr in the URL wins, then the visitor's own earlier choice, otherwise English.
   Elements with lang="en" or lang="tr" are shown or hidden by style.css through html[data-ui]. */
(function () {
  var KEY = 'velaris-lang';
  var root = document.documentElement;

  function valid(l) { return l === 'en' || l === 'tr'; }
  function fromHash() {
    var h = (location.hash || '').slice(1).toLowerCase();
    return valid(h) ? h : null;
  }
  function stored() {
    try { var v = localStorage.getItem(KEY); return valid(v) ? v : null; } catch (e) { return null; }
  }
  function apply(lang) {
    root.setAttribute('data-ui', lang);
    root.setAttribute('lang', lang);
    var title = root.getAttribute('data-title-' + lang);
    if (title) document.title = title;
    var buttons = document.querySelectorAll('[data-set-lang]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', String(buttons[i].getAttribute('data-set-lang') === lang));
    }
  }

  // Runs in <head>, before the page paints, so the wrong language never flashes.
  apply(fromHash() || stored() || 'en');

  window.addEventListener('hashchange', function () {
    var h = fromHash();
    if (h) apply(h);
  });

  document.addEventListener('DOMContentLoaded', function () {
    apply(root.getAttribute('data-ui'));

    document.addEventListener('click', function (ev) {
      var t = ev.target;
      var langBtn = t.closest ? t.closest('[data-set-lang]') : null;
      if (langBtn) {
        var lang = langBtn.getAttribute('data-set-lang');
        apply(lang);
        try { localStorage.setItem(KEY, lang); } catch (e) {}
        if (fromHash()) history.replaceState(null, '', location.pathname + location.search + '#' + lang);
        return;
      }

      var copyBtn = t.closest ? t.closest('[data-copy]') : null;
      if (copyBtn) {
        var text = copyBtn.getAttribute('data-copy');
        var done = function () {
          copyBtn.classList.add('copied');
          setTimeout(function () { copyBtn.classList.remove('copied'); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        } else {
          fallbackCopy(text);
          done();
        }
      }
    });

    var year = document.querySelectorAll('[data-year]');
    for (var i = 0; i < year.length; i++) year[i].textContent = String(new Date().getFullYear());
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }
})();
