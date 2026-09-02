/* Home page rendering */
window.APP = window.APP || {};

(function () {
  'use strict';

  function renderCategories() {
    var grid = document.getElementById('categoryGrid');
    if (!grid) return;
    grid.innerHTML = window.APP.CATEGORIES.map(function (c) {
      return '<a class="cat-card" href="categories.html?cat=' + c.slug + '">' +
        '<span class="cat-icon">' + c.icon + '</span>' +
        '<span class="cat-name">' + c.name + '</span>' +
        '<span class="chip" style="background:' + c.bg + ';color:' + c.text + ';margin-top:8px">' +
        window.APP.Store.getByCategory(c.slug).length + ' open</span></a>';
    }).join('');
  }

  function fillSelect() {
    var sel = document.getElementById('searchCat');
    if (!sel) return;
    sel.innerHTML = '<option value="">All categories</option>' +
      window.APP.CATEGORIES.map(function (c) {
        return '<option value="' + c.slug + '">' + c.name + '</option>';
      }).join('');
  }

  function renderStats() {
    var s = window.APP.Store.getStats();
    var t = document.getElementById('statTotal');
    var a = document.getElementById('statActive');
    if (t) t.textContent = s.total;
    if (a) a.textContent = s.active;
  }

  function renderFeatured() {
    var el = document.getElementById('featuredGrid');
    if (!el) return;
    var feats = window.APP.Store.getFeaturedGigs();
    if (!feats.length) { el.innerHTML = '<div class="empty">No featured gigs yet.</div>'; return; }
    el.innerHTML = feats.slice(0, 6).map(window.APP.UI.gigCardHTML).join('');
  }

  function renderRecent() {
    var el = document.getElementById('recentGrid');
    if (!el) return;
    var active = window.APP.Store.getActiveGigs().slice(0, 6);
    if (!active.length) { el.innerHTML = '<div class="empty">No gigs yet — <a href="post.html">post the first one</a>.</div>'; return; }
    el.innerHTML = active.map(window.APP.UI.gigCardHTML).join('');
  }

  function bindSearch() {
    var form = document.getElementById('searchForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = document.getElementById('searchQ').value.trim();
      var cat = document.getElementById('searchCat').value;
      var url = 'browse.html?';
      if (q) url += 'q=' + encodeURIComponent(q) + '&';
      if (cat) url += 'cat=' + encodeURIComponent(cat);
      window.location.href = url;
    });
  }

  function init() {
    fillSelect();
    renderCategories();
    renderStats();
    renderFeatured();
    renderRecent();
    bindSearch();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
