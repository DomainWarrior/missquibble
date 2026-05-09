'use strict';
/* ── MissQuibble Post Actions — Like · Save · Share ─────────── */

const sb   = window.MQ?.sb;
const slug = window.__MQ?.slug || location.pathname;
const url  = location.href;
const title = document.title;

const likeBtn   = document.getElementById('mq-like-btn');
const likeCount = document.getElementById('mq-like-count');
const saveBtn   = document.getElementById('mq-save-btn');
const shareBtn  = document.getElementById('mq-share-btn');
const shareMenu = document.getElementById('mq-share-menu');

if (!likeBtn) { /* not a post page */ }

let liked = false;
let saved = false;

/* ── Boot ──────────────────────────────────────────────────── */
async function init() {
  if (!sb || !likeBtn) return;
  await loadPublicCount();
  if (window.MQ?.user) await loadUserState();
  setupShare();
}

document.addEventListener('mq:auth', async () => {
  if (window.MQ?.user) await loadUserState();
  else { setLiked(false); setSaved(false); }
});

document.addEventListener('DOMContentLoaded', init);

/* ── Like count (public) ───────────────────────────────────── */
async function loadPublicCount() {
  const { count } = await sb
    .from('post_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_slug', slug);
  renderCount(count ?? 0);
}

function renderCount(n) {
  if (!likeCount) return;
  likeCount.textContent = n > 0 ? n : '';
}

/* ── User state ────────────────────────────────────────────── */
async function loadUserState() {
  const uid = window.MQ.user.id;
  const [l, s] = await Promise.all([
    sb.from('post_likes').select('id').eq('user_id', uid).eq('post_slug', slug).maybeSingle(),
    sb.from('post_saves').select('id').eq('user_id', uid).eq('post_slug', slug).maybeSingle(),
  ]);
  setLiked(!!l.data);
  setSaved(!!s.data);
}

/* ── Like ──────────────────────────────────────────────────── */
likeBtn?.addEventListener('click', async () => {
  if (!window.MQ?.user) { window.MQ?.openAuth?.('in'); return; }

  const uid  = window.MQ.user.id;
  const next = !liked;
  setLiked(next);

  // Optimistic count update
  const cur = parseInt(likeCount?.textContent || '0', 10) || 0;
  renderCount(Math.max(0, cur + (next ? 1 : -1)));

  if (next) {
    await sb.from('post_likes').insert({ user_id: uid, post_slug: slug });
  } else {
    await sb.from('post_likes').delete().eq('user_id', uid).eq('post_slug', slug);
  }
  // Sync real count from DB
  await loadPublicCount();
});

function setLiked(val) {
  liked = val;
  likeBtn?.setAttribute('aria-pressed', String(val));
  likeBtn?.classList.toggle('active', val);
  const icon = likeBtn?.querySelector('.mq-btn-icon');
  if (icon) icon.textContent = val ? '♥' : '♡';
}

/* ── Save ──────────────────────────────────────────────────── */
saveBtn?.addEventListener('click', async () => {
  if (!window.MQ?.user) { window.MQ?.openAuth?.('in'); return; }

  const uid  = window.MQ.user.id;
  const next = !saved;
  setSaved(next);

  if (next) {
    await sb.from('post_saves').insert({
      user_id:    uid,
      post_slug:  slug,
      post_title: window.__MQ?.title || document.title,
      post_desc:  window.__MQ?.desc  || '',
      post_url:   url,
    });
  } else {
    await sb.from('post_saves').delete().eq('user_id', uid).eq('post_slug', slug);
  }
});

function setSaved(val) {
  saved = val;
  saveBtn?.setAttribute('aria-pressed', String(val));
  saveBtn?.classList.toggle('active', val);
  const label = saveBtn?.querySelector('.mq-btn-label');
  if (label) label.textContent = val ? 'Saved ✓' : 'Save';
}

/* ── Share ─────────────────────────────────────────────────── */
function setupShare() {
  const hiveEl = document.getElementById('mq-share-hive');
  if (hiveEl) hiveEl.href = `https://ecency.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
}

shareBtn?.addEventListener('click', e => {
  e.stopPropagation();
  if (navigator.share) {
    navigator.share({ title, url }).catch(() => {});
    return;
  }
  const open = !shareMenu?.classList.contains('open');
  shareMenu?.classList.toggle('open', open);
  shareBtn?.setAttribute('aria-expanded', String(open));
  shareMenu?.setAttribute('aria-hidden',  String(!open));
});

document.querySelector('[data-share="copy"]')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.querySelector('[data-share="copy"]');
    if (btn) { const t = btn.textContent; btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = t, 2000); }
  } catch {}
  closeShare();
});

document.addEventListener('click', e => {
  if (!shareBtn?.contains(e.target) && !shareMenu?.contains(e.target)) closeShare();
});

function closeShare() {
  shareMenu?.classList.remove('open');
  shareBtn?.setAttribute('aria-expanded', 'false');
  shareMenu?.setAttribute('aria-hidden', 'true');
}
