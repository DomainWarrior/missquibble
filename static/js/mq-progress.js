'use strict';
/* ── Reading progress bar ──────────────────────────────────── */
(function () {
  const bar     = document.getElementById('mq-progress');
  const article = document.querySelector('article.post-single');
  if (!bar || !article) return;

  function update() {
    const rect  = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const gone  = -rect.top;
    const pct   = total > 0 ? Math.min(100, Math.max(0, (gone / total) * 100)) : 0;
    bar.style.width = pct + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
