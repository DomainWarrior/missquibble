(function () {
    var p = localStorage.getItem('pref-theme');
    var h = document.querySelector('html');
    if (p === 'dark') {
        h.dataset.theme = 'dark';
    } else if (p === 'light') {
        h.dataset.theme = 'light';
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        h.dataset.theme = 'dark';
    } else {
        h.dataset.theme = 'light';
    }
}());
