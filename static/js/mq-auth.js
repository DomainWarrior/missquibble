'use strict';
/* ── MissQuibble Auth ──────────────────────────────────────── */

window.MQ = window.MQ || {};

/* ── Supabase client ───────────────────────────────────────── */
const _url = document.querySelector('meta[name="mq-supabase-url"]')?.content;
const _key = document.querySelector('meta[name="mq-supabase-key"]')?.content;
const sb   = _url && _key ? window.supabase?.createClient(_url, _key) : null;

window.MQ.sb   = sb;
window.MQ.user = null;

if (sb) {
  sb.auth.getSession().then(({ data }) => {
    window.MQ.user = data.session?.user ?? null;
    syncWidget();
  });

  sb.auth.onAuthStateChange((_, session) => {
    window.MQ.user = session?.user ?? null;
    syncWidget();
    document.dispatchEvent(new CustomEvent('mq:auth', { detail: window.MQ.user }));
  });
}

/* ── Open modal ────────────────────────────────────────────── */
window.MQ.openAuth = (tab = 'in') => {
  const overlay = document.getElementById('mq-overlay');
  if (!overlay) return;
  overlay.removeAttribute('aria-hidden');
  overlay.classList.add('open');
  document.body.classList.add('mq-no-scroll');
  switchTab(tab);
  setTimeout(() => overlay.querySelector(`#mq-form-${tab} input`)?.focus(), 80);
};

function closeModal() {
  const overlay = document.getElementById('mq-overlay');
  if (!overlay) return;
  overlay.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('open');
  document.body.classList.remove('mq-no-scroll');
  document.querySelectorAll('.mq-err').forEach(el => { el.textContent = ''; });
}

/* ── Modal events ──────────────────────────────────────────── */
document.getElementById('mq-modal-close')?.addEventListener('click', closeModal);
document.getElementById('mq-overlay')?.addEventListener('click', e => {
  if (e.target.id === 'mq-overlay') closeModal();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── Tabs ──────────────────────────────────────────────────── */
function switchTab(name) {
  document.querySelectorAll('.mq-tab').forEach(t => {
    const on = t.dataset.tab === name;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  document.querySelectorAll('.mq-form').forEach(f => {
    f.classList.toggle('active', f.id === `mq-form-${name}`);
  });
}
document.querySelectorAll('.mq-tab').forEach(t =>
  t.addEventListener('click', () => switchTab(t.dataset.tab))
);

/* ── Sign in ───────────────────────────────────────────────── */
document.getElementById('mq-form-in')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!sb) return;
  const btn  = e.target.querySelector('button[type=submit]');
  const err  = document.getElementById('mq-in-err');
  const email = document.getElementById('mq-in-email').value.trim();
  const pw    = document.getElementById('mq-in-pw').value;
  busy(btn, true);
  const { error } = await sb.auth.signInWithPassword({ email, password: pw });
  busy(btn, false);
  if (error) { showErr(err, error.message); return; }
  closeModal();
});

/* ── Sign up ───────────────────────────────────────────────── */
document.getElementById('mq-form-up')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!sb) return;
  const btn  = e.target.querySelector('button[type=submit]');
  const err  = document.getElementById('mq-up-err');
  const email = document.getElementById('mq-up-email').value.trim();
  const pw    = document.getElementById('mq-up-pw').value;
  if (pw.length < 8) { showErr(err, 'Password must be at least 8 characters'); return; }
  busy(btn, true);
  const { error } = await sb.auth.signUp({ email, password: pw });
  busy(btn, false);
  if (error) { showErr(err, error.message); return; }
  showErr(err, '✓ Check your email to confirm your account.', true);
});

/* ── Forgot password ───────────────────────────────────────── */
document.getElementById('mq-forgot')?.addEventListener('click', async () => {
  if (!sb) return;
  const email = document.getElementById('mq-in-email').value.trim();
  const err   = document.getElementById('mq-in-err');
  if (!email) { showErr(err, 'Enter your email above first'); return; }
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/reset-password/`
  });
  showErr(err, error ? error.message : '✓ Reset link sent — check your inbox', !error);
});

/* ── Sign out ──────────────────────────────────────────────── */
document.getElementById('mq-signout')?.addEventListener('click', async () => {
  if (!sb) return;
  await sb.auth.signOut();
  document.getElementById('mq-avatar-menu')?.setAttribute('aria-hidden', 'true');
  document.getElementById('mq-avatar-menu')?.classList.remove('open');
});

/* ── Widget sign-in button ─────────────────────────────────── */
document.getElementById('mq-widget-signin')?.addEventListener('click', () => window.MQ.openAuth('in'));

/* ── Avatar menu ───────────────────────────────────────────── */
const avatarBtn  = document.getElementById('mq-avatar-btn');
const avatarMenu = document.getElementById('mq-avatar-menu');

avatarBtn?.addEventListener('click', e => {
  e.stopPropagation();
  const open = avatarMenu?.classList.toggle('open');
  avatarBtn.setAttribute('aria-expanded', String(open));
  avatarMenu?.setAttribute('aria-hidden', String(!open));
});

document.addEventListener('click', () => {
  avatarMenu?.classList.remove('open');
  avatarBtn?.setAttribute('aria-expanded', 'false');
  avatarMenu?.setAttribute('aria-hidden', 'true');
});

/* ── Sync widget ───────────────────────────────────────────── */
function syncWidget() {
  const loggedIn  = document.getElementById('mq-widget-in');
  const loggedOut = document.getElementById('mq-widget-out');
  const emailEl   = document.getElementById('mq-avatar-email');
  const charEl    = document.getElementById('mq-avatar-char');

  if (window.MQ.user) {
    loggedOut?.classList.add('hidden');
    loggedIn?.classList.remove('hidden');
    if (emailEl) emailEl.textContent = window.MQ.user.email;
    if (charEl)  charEl.textContent  = window.MQ.user.email?.[0]?.toUpperCase() ?? '◉';
  } else {
    loggedOut?.classList.remove('hidden');
    loggedIn?.classList.add('hidden');
  }
}

/* ── Helpers ───────────────────────────────────────────────── */
function showErr(el, msg, ok = false) {
  if (!el) return;
  el.textContent = msg;
  el.style.color = ok ? '#00ff88' : '#ef4444';
}

function busy(btn, on) {
  if (!btn) return;
  if (on) { btn.dataset.orig = btn.textContent; btn.textContent = 'Please wait…'; }
  else      btn.textContent = btn.dataset.orig || btn.textContent;
  btn.disabled = on;
}
