'use strict';
/* ============================================================
   MissQuibble Portfolio — Main JS
   ============================================================ */

const GH_USER = 'DomainWarrior';

/* ── Particles ─────────────────────────────────────────────── */
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 70, density: { enable: true, value_area: 800 } },
      color: { value: '#00ff88' },
      shape: { type: 'circle' },
      opacity: { value: 0.4, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1 } },
      size: { value: 2.5, random: true },
      line_linked: { enable: true, distance: 160, color: '#00ff88', opacity: 0.15, width: 1 },
      move: { enable: true, speed: 1.2, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick: { enable: true, mode: 'push' },
        resize: true
      },
      modes: {
        grab: { distance: 180, line_linked: { opacity: 0.4 } },
        push: { particles_nb: 3 }
      }
    },
    retina_detect: true
  });
}

/* ── Typewriter ────────────────────────────────────────────── */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const phrases = [
    'Full Stack Engineer',
    'Cybersecurity Specialist',
    'Web Developer',
    'Blockchain Enthusiast',
    'Python Developer',
    'Problem Solver'
  ];
  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = deleting ? phrase.slice(0, --ci) : phrase.slice(0, ++ci);

    if (!deleting && ci === phrase.length) {
      setTimeout(() => { deleting = true; tick(); }, 2200);
      return;
    }
    if (deleting && ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
    }
    setTimeout(tick, deleting ? 45 : 90);
  }
  tick();
}

/* ── Navbar scroll effect ──────────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('pf-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const toggle = document.getElementById('nav-mobile-toggle');
  const links  = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }));
  }
}

/* ── Active nav link on scroll ─────────────────────────────── */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a[href^="#"]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => observer.observe(s));
}

/* ── Counter animation ─────────────────────────────────────── */
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 1800;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initCounters() {
  const items = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.count);
        const suffix = e.target.dataset.suffix || '';
        animateCounter(e.target, target, suffix);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  items.forEach(el => observer.observe(el));
}

/* ── Cyber bars animation ──────────────────────────────────── */
function initCyberBars() {
  const bars = document.querySelectorAll('.cyber-bar-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.width || '80';
        setTimeout(() => { e.target.style.width = w + '%'; }, 200);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
}

/* ── Terminal ──────────────────────────────────────────────── */
function initTerminal() {
  const body  = document.getElementById('terminal-body');
  const input = document.getElementById('terminal-input');
  if (!body || !input) return;

  const COMMANDS = {
    whoami: () => [
      { type: 'out accent', text: 'MissQuibble' },
      { type: 'out', text: '──────────────────────────────────' },
      { type: 'out', text: 'Role     : Full Stack Engineer & Security Specialist' },
      { type: 'out', text: 'GitHub   : github.com/DomainWarrior' },
      { type: 'out', text: 'Location : Available Worldwide (Remote)' },
      { type: 'out success', text: 'Status   : ● Open to opportunities' }
    ],
    skills: () => [
      { type: 'out accent', text: '>> Frontend' },
      { type: 'out', text: '   HTML5 · CSS3 · JavaScript · TypeScript · React · Vue.js · Angular · Tailwind' },
      { type: 'out accent', text: '>> Backend' },
      { type: 'out', text: '   Python · Django · Node.js · PHP · Ruby · REST APIs · GraphQL' },
      { type: 'out accent', text: '>> Security' },
      { type: 'out', text: '   Penetration Testing · OWASP · Burp Suite · Nmap · Wireshark · OSINT' },
      { type: 'out accent', text: '>> Blockchain' },
      { type: 'out', text: '   Hive · Web3 · Smart Contracts · DApps · NFTs · DPoS' },
      { type: 'out accent', text: '>> Tools' },
      { type: 'out', text: '   Git · Docker · Linux · PostgreSQL · Firebase · CI/CD' }
    ],
    projects: () => [
      { type: 'out accent', text: '# Featured Projects' },
      { type: 'out', text: '' },
      { type: 'out success', text: '01. Hive Blockchain DApps' },
      { type: 'out', text: '    Web3 social platform suite built on the Hive blockchain' },
      { type: 'out success', text: '02. Discord Game Bots' },
      { type: 'out', text: '    Python bots — RPG combat system, dice games, multi-command architecture' },
      { type: 'out success', text: '03. Django Web Platform' },
      { type: 'out', text: '    Full-stack web apps, format generators, REST APIs' },
      { type: 'out success', text: '04. Python Security Tools' },
      { type: 'out', text: '    Automation scripts, scrapers, and security audit utilities' },
      { type: 'out success', text: '05. MissQuibble Blog' },
      { type: 'out', text: '    Hugo-powered content platform — 100+ posts, SEO-optimized' },
      { type: 'out', text: '' },
      { type: 'out accent', text: 'type "contact" to work together ↵' }
    ],
    contact: () => [
      { type: 'out', text: 'Initiating secure connection...' },
      { type: 'out success', text: '✓ Connection established' },
      { type: 'out', text: '' },
      { type: 'out accent', text: 'Email    : via contact form ↓' },
      { type: 'out accent', text: 'GitHub   : github.com/DomainWarrior' },
      { type: 'out', text: '' },
      { type: 'out', text: 'Response time: typically within 24 hours' }
    ],
    help: () => [
      { type: 'out', text: 'Available commands:' },
      { type: 'out', text: '' },
      { type: 'out accent', text: '  whoami    → Who is MissQuibble?' },
      { type: 'out accent', text: '  skills    → Tech stack & expertise' },
      { type: 'out accent', text: '  projects  → Featured work' },
      { type: 'out accent', text: '  contact   → Get in touch' },
      { type: 'out accent', text: '  matrix    → 👾' },
      { type: 'out accent', text: '  clear     → Clear terminal' }
    ],
    matrix: () => {
      toggleMatrix();
      return [{ type: 'out success', text: 'Entering the Matrix... (run again to exit)' }];
    },
    clear: () => 'CLEAR'
  };

  function appendLine(type, text) {
    const div = document.createElement('div');
    div.className = 't-line';
    if (type === 'spacer') { div.className = 't-spacer'; }
    else if (type === 'cmd-line') {
      div.innerHTML = `<span class="t-prompt">❯</span> <span class="t-cmd">${escHtml(text)}</span>`;
    } else {
      div.innerHTML = `<span class="${type}">${escHtml(text)}</span>`;
    }
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function runCmd(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    appendLine('cmd-line', cmd.trim());

    if (!trimmed) return;
    const fn = COMMANDS[trimmed];
    if (!fn) {
      appendLine('t-out', `command not found: ${trimmed}. Type 'help' for available commands.`);
      appendLine('spacer');
      return;
    }
    const result = fn();
    if (result === 'CLEAR') { body.innerHTML = ''; return; }
    result.forEach(({ type, text }) => {
      if (text === '') appendLine('spacer');
      else appendLine(type, text);
    });
    appendLine('spacer');
  }

  // Boot sequence
  async function boot() {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    await delay(400);
    appendLine('t-out accent', 'MissQuibble Portfolio Terminal v2.6.0');
    appendLine('t-out', 'Type "help" for available commands.');
    appendLine('spacer');
    await delay(600);
    runCmd('whoami');
    await delay(300);
    appendLine('spacer');
  }
  boot();

  const cmdHistory = [];
  let histIdx = -1;

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      if (val.trim()) { cmdHistory.unshift(val.trim()); histIdx = -1; }
      input.value = '';
      runCmd(val);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < cmdHistory.length - 1) input.value = cmdHistory[++histIdx];
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      histIdx > 0 ? (input.value = cmdHistory[--histIdx]) : (histIdx = -1, input.value = '');
    }
  });

  // Click terminal to focus input
  document.querySelector('.terminal-window')?.addEventListener('click', () => input.focus());
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── Matrix rain ───────────────────────────────────────────── */
let matrixActive = false;
let matrixRaf;

function toggleMatrix() {
  matrixActive = !matrixActive;
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  canvas.style.opacity = matrixActive ? '0.07' : '0.025';

  if (matrixActive) {
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const cols = Math.floor(canvas.width / 16);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF</>{}[]';

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00ff88';
      ctx.font = '14px JetBrains Mono';
      drops.forEach((y, x) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[x] = 0;
        drops[x]++;
      });
      matrixRaf = requestAnimationFrame(draw);
    }
    draw();
  } else {
    cancelAnimationFrame(matrixRaf);
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

/* ── GitHub stats ──────────────────────────────────────────── */
async function initGitHub() {
  const ids = ['gh-repos', 'gh-followers', 'gh-following', 'gh-gists'];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '…'; });

  try {
    const res = await fetch(`https://api.github.com/users/${GH_USER}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    setEl('gh-repos',     data.public_repos ?? 0);
    setEl('gh-followers', data.followers    ?? 0);
    setEl('gh-following', data.following    ?? 0);
    setEl('gh-gists',     data.public_gists ?? 0);
  } catch (e) {
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '—'; });
    console.warn('GitHub API unavailable:', e.message);
  }
}

/* ── Dark / light mode ─────────────────────────────────────── */
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('pf-theme') || 'dark';
  if (saved === 'light') document.body.classList.add('light');
  btn.textContent = saved === 'light' ? '🌙' : '☀️';

  btn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('pf-theme', isLight ? 'light' : 'dark');
    btn.textContent = isLight ? '🌙' : '☀️';
  });
}

/* ── Contact form ──────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function setFieldError(input, msg) {
    const group = input.closest('.form-group');
    let err = group.querySelector('.field-error');
    if (msg) {
      if (!err) { err = document.createElement('span'); err.className = 'field-error'; group.appendChild(err); }
      err.textContent = msg;
      input.classList.add('input-error');
    } else {
      if (err) err.remove();
      input.classList.remove('input-error');
    }
  }

  function validate() {
    let ok = true;
    const name    = form.querySelector('#cf-name');
    const email   = form.querySelector('#cf-email');
    const message = form.querySelector('#cf-message');
    if (!name.value.trim())    { setFieldError(name,    'Name is required');            ok = false; } else setFieldError(name,    null);
    if (!email.value.trim())   { setFieldError(email,   'Email is required');           ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { setFieldError(email, 'Enter a valid email address'); ok = false; }
    else                       { setFieldError(email,   null); }
    if (!message.value.trim()) { setFieldError(message, 'Message is required');         ok = false; } else setFieldError(message, null);
    return ok;
  }

  form.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', () => setFieldError(el, null)));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;

    const btn     = form.querySelector('button[type="submit"]');
    const origTxt = btn.textContent;
    const formId  = form.dataset.formspreeId;

    btn.textContent = 'Sending…';
    btn.disabled    = true;

    const flash = (text, success) => {
      btn.textContent  = text;
      btn.style.cssText = success
        ? 'background:var(--neon);color:var(--dark);width:100%;justify-content:center;padding:14px;'
        : 'background:#ef4444;color:#fff;width:100%;justify-content:center;padding:14px;';
      setTimeout(() => { btn.textContent = origTxt; btn.disabled = false; btn.style = ''; if (success) form.reset(); }, 4000);
    };

    if (!formId) { flash('Sent! ✓', true); return; }

    try {
      const res = await fetch(`https://formspree.io/f/${formId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.querySelector('#cf-name').value.trim(),
          email:   form.querySelector('#cf-email').value.trim(),
          subject: form.querySelector('#cf-subject').value.trim(),
          message: form.querySelector('#cf-message').value.trim(),
        }),
      });
      res.ok ? flash('Sent! ✓', true) : flash('Error — please try again', false);
    } catch {
      flash('Error — please try again', false);
    }
  });
}

/* ── Init ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypewriter();
  initNavbar();
  initActiveNav();
  initCounters();
  initCyberBars();
  initTerminal();
  initGitHub();
  initTheme();
  initContactForm();

  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out-quart' });
  }
});
