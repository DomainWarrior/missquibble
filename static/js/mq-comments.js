'use strict';
/* ── MissQuibble Comments ──────────────────────────────────── */

const sb   = window.MQ?.sb;
const slug = window.__MQ?.slug || location.pathname;
const MAX  = 1000;

/* ── Profanity filter ──────────────────────────────────────── */
// Normalise common letter substitutions before checking
function normalise(str) {
  return str.toLowerCase()
    .replace(/[@]/g,  'a')
    .replace(/3/g,    'e')
    .replace(/[!1|]/g,'i')
    .replace(/0/g,    'o')
    .replace(/[5$]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[^\w\s]/g, '')  // strip remaining punctuation
    .replace(/(.)\1{2,}/g, '$1$1'); // collapse 3+ repeated chars → 2
}

const BAD_WORDS = [
  'fuck','shit','cunt','bitch','asshole','bastard','dickhead',
  'motherfucker','faggot','nigger','nigga','whore','slut',
  'cock','pussy','twat','wanker','prick','arse','arsehole',
  'damn','crap','bollocks','tosser','bellend','shithead',
  'dumbass','jackass','retard','spastic','moron','idiot',
  'piss','fag','dyke','tranny','spic','kike','chink','wetback',
  'rape','rapist','pedo','pedophile','groomer',
  'kill yourself','kys','go kill','die bitch','die cunt',
];

const BAD_REGEX = new RegExp(
  BAD_WORDS.map(w => {
    // allow word boundaries — catch "fucking" but not "assassin"
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
    return `(?:^|\\b|\\s)${escaped}(?:\\b|\\s|s?$)`;
  }).join('|'),
  'i'
);

function hasProfanity(text) {
  const n = normalise(text);
  return BAD_REGEX.test(n) || BAD_REGEX.test(text.toLowerCase());
}

/* ── DOM refs ──────────────────────────────────────────────── */
const gate      = document.getElementById('mq-comment-gate');
const form      = document.getElementById('mq-comment-form');
const body      = document.getElementById('mq-cmt-body');
const countEl   = document.getElementById('mq-cmt-count');
const errEl     = document.getElementById('mq-cmt-err');
const list      = document.getElementById('mq-comment-list');
const loading   = document.getElementById('mq-cmt-loading');
const countBadge= document.getElementById('mq-comment-count');
const signinBtn = document.getElementById('mq-comment-signin');
const avatarEl  = document.getElementById('mq-cmt-avatar');
const userEl    = document.getElementById('mq-cmt-user');

/* ── Auth sync ─────────────────────────────────────────────── */
function syncAuth() {
  const user = window.MQ?.user;
  if (user) {
    gate?.classList.add('hidden');
    form?.classList.remove('hidden');
    const initial = user.email?.[0]?.toUpperCase() ?? '◉';
    if (avatarEl) avatarEl.textContent = initial;
    if (userEl)   userEl.textContent   = user.email?.split('@')[0] ?? 'User';
  } else {
    gate?.classList.remove('hidden');
    form?.classList.add('hidden');
  }
}

document.addEventListener('mq:auth', syncAuth);
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(syncAuth, 400); // wait for auth to resolve
  loadComments();
});

signinBtn?.addEventListener('click', () => window.MQ?.openAuth?.('in'));

/* ── Character counter ─────────────────────────────────────── */
body?.addEventListener('input', () => {
  const len = body.value.length;
  if (countEl) countEl.textContent = len;
  countEl?.parentElement?.classList.toggle('mq-chars-warn', len > 900);

  // Real-time profanity hint
  if (hasProfanity(body.value)) {
    showErr('⚠ Your comment contains language that is not allowed.');
  } else {
    clearErr();
  }
});

/* ── Submit ────────────────────────────────────────────────── */
form?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!sb || !window.MQ?.user) return;

  const text = body.value.trim();
  if (!text) { showErr('Please write something first.'); return; }
  if (text.length < 3) { showErr('Comment is too short.'); return; }
  if (text.length > MAX) { showErr(`Max ${MAX} characters.`); return; }
  if (hasProfanity(text)) {
    showErr('⚠ Your comment contains language that is not allowed. Please revise it.');
    return;
  }

  const btn = form.querySelector('button[type=submit]');
  setLoading(btn, true);

  const { data, error } = await sb.from('post_comments').insert({
    user_id:    window.MQ.user.id,
    post_slug:  slug,
    content:    text,
    user_email: window.MQ.user.email,
  }).select().single();

  setLoading(btn, false);

  if (error) {
    showErr('Failed to post comment. Please try again.');
    console.error(error);
    return;
  }

  body.value = '';
  if (countEl) countEl.textContent = '0';
  clearErr();
  prependComment(data);
  updateCount(1);
});

/* ── Load comments ─────────────────────────────────────────── */
async function loadComments() {
  if (!sb) {
    if (loading) loading.textContent = 'Comments unavailable — Supabase not configured.';
    return;
  }

  const { data, error } = await sb
    .from('post_comments')
    .select('id, content, user_email, created_at, user_id')
    .eq('post_slug', slug)
    .order('created_at', { ascending: false });

  if (loading) loading.remove();

  if (error || !data) {
    const p = document.createElement('p');
    p.className = 'mq-cmt-empty';
    p.textContent = 'Could not load comments.';
    list?.appendChild(p);
    return;
  }

  if (data.length === 0) {
    const p = document.createElement('p');
    p.className = 'mq-cmt-empty';
    p.textContent = 'No comments yet. Be the first!';
    list?.appendChild(p);
  } else {
    data.forEach(c => list?.appendChild(buildCard(c)));
  }

  updateCount(data.length, true);
}

/* ── Build comment card ────────────────────────────────────── */
function buildCard(c) {
  const isOwn = window.MQ?.user?.id === c.user_id;
  const name  = c.user_email?.split('@')[0] ?? 'Anonymous';
  const initial = name[0]?.toUpperCase() ?? '?';
  const date  = new Date(c.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const div = document.createElement('div');
  div.className = 'mq-cmt-card';
  div.dataset.id = c.id;
  div.innerHTML = `
    <div class="mq-cmt-card-header">
      <span class="mq-cmt-avatar"  aria-hidden="true">${escHtml(initial)}</span>
      <span class="mq-cmt-name">${escHtml(name)}</span>
      <span class="mq-cmt-date">${date}</span>
      ${isOwn ? `<button class="mq-cmt-delete" data-id="${escHtml(c.id)}" aria-label="Delete comment" title="Delete">✕</button>` : ''}
    </div>
    <p class="mq-cmt-content">${escHtml(c.content)}</p>
  `;

  div.querySelector('.mq-cmt-delete')?.addEventListener('click', () => deleteComment(c.id, div));
  return div;
}

function prependComment(c) {
  const empty = list?.querySelector('.mq-cmt-empty');
  empty?.remove();
  const card = buildCard(c);
  list?.prepend(card);
}

/* ── Delete ────────────────────────────────────────────────── */
async function deleteComment(id, el) {
  if (!sb || !window.MQ?.user) return;
  const { error } = await sb.from('post_comments').delete().eq('id', id).eq('user_id', window.MQ.user.id);
  if (!error) {
    el.remove();
    updateCount(-1);
    if (!list?.querySelector('.mq-cmt-card')) {
      const p = document.createElement('p');
      p.className = 'mq-cmt-empty';
      p.textContent = 'No comments yet. Be the first!';
      list?.appendChild(p);
    }
  }
}

/* ── Helpers ───────────────────────────────────────────────── */
function updateCount(delta, absolute = false) {
  if (!countBadge) return;
  const cur = absolute ? delta : (parseInt(countBadge.dataset.n || '0', 10) + delta);
  countBadge.dataset.n    = cur;
  countBadge.textContent  = cur > 0 ? `(${cur})` : '';
}

function showErr(msg) {
  if (errEl) { errEl.textContent = msg; errEl.style.color = '#ef4444'; }
}

function clearErr() {
  if (errEl) errEl.textContent = '';
}

function setLoading(btn, on) {
  if (!btn) return;
  if (on) { btn.dataset.orig = btn.textContent; btn.textContent = 'Posting…'; }
  else      btn.textContent = btn.dataset.orig || 'Post Comment';
  btn.disabled = on;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
