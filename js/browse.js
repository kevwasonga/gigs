/* Browse page: load, filter and render gig listings */
window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var state = { q: '', cat: '', type: '', location: '' };

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  function fillDropdowns() {
    var catSel = document.getElementById('fCategory');
    catSel.innerHTML = '<option value="">All</option>' +
      window.APP.CATEGORIES.map(function (c) {
        return '<option value="' + c.slug + '">' + c.name + '</option>';
      }).join('');

    var typeSel = document.getElementById('fType');
    typeSel.innerHTML = '<option value="">All</option>' +
      window.APP.JOB_TYPES.map(function (t) {
        return '<option value="' + t.value + '">' + t.name + '</option>';
      }).join('');
  }

  function matchesLocation(loc) {
    if (!state.location) return true;
    return (loc || '').toLowerCase().indexOf(state.location.toLowerCase()) !== -1;
  }

  function applyFilters(gigs) {
    return gigs.filter(function (g) {
      var text = (g.title + ' ' + (g.description || '') + ' ' + g.location).toLowerCase();
      var qOk = !state.q || text.indexOf(state.q.toLowerCase()) !== -1;
      var catOk = !state.cat || g.category === state.cat;
      var typeOk = !state.type || g.job_type === state.type;
      return qOk && catOk && typeOk && matchesLocation(g.location);
    });
  }

  function render() {
    var all = window.APP.Store.getActiveGigs();
    var filtered = applyFilters(all);
    var grid = document.getElementById('gigGrid');
    var count = document.getElementById('resultCount');
    var empty = document.getElementById('emptyState');
    var title = document.getElementById('resultTitle');

    var catName = state.cat ? ' · ' + window.APP.categoryBySlug(state.cat).name : '';
    title.textContent = 'Results' + catName;
    count.textContent = filtered.length + ' gig' + (filtered.length === 1 ? '' : 's');

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');
    grid.innerHTML = filtered.map(window.APP.UI.gigCardHTML).join('');
  }

  function bind() {
    var form = document.getElementById('filterForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      state.q = document.getElementById('fSearch').value.trim();
      state.cat = document.getElementById('fCategory').value;
      state.type = document.getElementById('fType').value;
      state.location = document.getElementById('fLocation').value.trim();
      render();
    });
  }

  function init() {
    fillDropdowns();
    // Seed state from URL (index search) or previously stored preferences
    state.q = getParam('q');
    state.cat = getParam('cat');
    document.getElementById('fSearch').value = state.q;
    document.getElementById('fCategory').value = state.cat;
    render();
    bind();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
