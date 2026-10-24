/* theme.js – 主题选择（light / dark / Selenized），保存在 localStorage */
(function () {
  var THEMES = { dark: '深色', light: '浅色', 'sel-dark': 'Selenized 深色', 'sel-light': 'Selenized 浅色' };
  function apply(v) {
    if (v === 'dark') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', v);
  }
  var cur = 'dark';
  try { cur = localStorage.getItem('rtl_theme') || 'dark'; } catch (e) {}
  apply(cur);
  window.RTL_THEMES = THEMES;
  window.applyTheme = function (v) {
    try { localStorage.setItem('rtl_theme', v); } catch (e) {}
    apply(v);
  };
})();
