/* Categories page: index grid + per-category listing */
window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var cat = new URLSearchParams(window.location.search).get('cat');

  function renderIndex() {
    var el = document.getElementById('categoryIndex');
    if (!el) return;
    el.innerHTML = window.APP.CATEGORIES.map(function (c) {
      return '<a class="cat-card" href="categories.html?cat=' + c.slug + '">' +
        '<span class="cat-icon">' + c.icon + '</span>' +
        '<span class="cat-name">' + c.name + '</span>' +
        '<span class="chip" style="background:' + c.bg + ';color:' + c.text + ';margin-top:8px">' +
        window.APP.Store.getByCategory(c.slug).length + ' open</span></a>';
    }).join('');
  }

  function renderCategory() {
    var info = window.APP.categoryBySlug(cat);
    var title = document.getElementById('pageTitle');
    var heading = document.getElementById('catHeading');
    var gigsEl = document.getElementById('gigGrid');
    var empty = document.getElementById('emptyState');

    title.textContent = info.name + ' gigs in Kenya';
    document.title = info.name + ' — GigConnect KE';
    if (heading) { heading.textContent = 'Open ' + info.name.toLowerCase() + ' gigs'; }
    document.getElementById('categoryGigs').style.display = 'block';

    var gigs = window.APP.Store.getByCategory(cat);
    if (!gigs.length) {
      gigsEl.innerHTML = '';
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
      gigsEl.innerHTML = gigs.map(window.APP.UI.gigCardHTML).join('');
    }
  }

  function init() {
    renderIndex();
    if (cat) renderCategory();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
