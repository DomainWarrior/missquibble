'use strict';

// Menu horizontal scroll persistence
var menu = document.getElementById('menu');
if (menu) {
    var pos = localStorage.getItem('menu-scroll-position');
    if (pos) menu.scrollLeft = parseInt(pos, 10);
    menu.onscroll = function () {
        localStorage.setItem('menu-scroll-position', menu.scrollLeft);
    };
}

// Smooth-scroll anchor links
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        var id = this.getAttribute('href').substr(1);
        var target = document.querySelector('[id=\'' + decodeURIComponent(id) + '\']');
        if (!target) return;
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            target.scrollIntoView({ behavior: 'smooth' });
        } else {
            target.scrollIntoView();
        }
        if (id === 'top') {
            history.replaceState(null, null, ' ');
        } else {
            history.pushState(null, null, '#' + id);
        }
    });
});

// Scroll-to-top button visibility
var topLink = document.getElementById('top-link');
if (topLink) {
    window.onscroll = function () {
        var threshold = window.innerHeight;
        if (document.body.scrollTop > threshold || document.documentElement.scrollTop > threshold) {
            topLink.classList.remove('hidden');
        } else {
            topLink.classList.add('hidden');
        }
    };
}

// Theme toggle button
var themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', function () {
        var html = document.querySelector('html');
        if (html.dataset.theme === 'dark') {
            html.dataset.theme = 'light';
            localStorage.setItem('pref-theme', 'light');
        } else {
            html.dataset.theme = 'dark';
            localStorage.setItem('pref-theme', 'dark');
        }
    });
}
