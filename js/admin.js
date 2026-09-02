/* =========================================================================
   GigConnect KE — Admin dashboard
   Authentication (Supabase or localStorage demo), listing management,
   bulk actions, and reported-queue.
   ========================================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var DEMO_SESSION_KEY = 'gigconnect_admin_session';
  var tab = 'active';
  var selected = {};

  var VIEWS = { login: 'loginView', dash: 'dashView' };

  /* --------------------------- Auth helpers ---------------------------- */

  function supabaseClient() {
    if (window.APP.supabaseConfigured() && typeof createClient === 'function') {
      return createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
    }
    return null;
  }

  function isDemoSession() { return localStorage.getItem(DEMO_SESSION_KEY) === '1'; }

  function isAuthed() {
    if (window.APP.supabaseConfigured()) {
      // Supabase session is tracked via onAuthStateChange; also allow a demo fallback.
      return isDemoSession();
    }
    return isDemoSession();
  }

  function guard() {
    if (isAuthed()) { show(VIEWS.dash); boot(); return true; }
    show(VIEWS.login);
    var demo = document.getElementById('demoHint');
    if (demo) {
      demo.textContent = window.APP.supabaseConfigured()
        ? 'Supabase auth configured. Use your admin account (or any credentials in demo fallback if enabled).'
        : 'Demo mode: enter any non-empty email + password to sign in.';
    }
    return false;
  }

  function show(viewId) {
    Object.keys(VIEWS).forEach(function (k) {
      document.getElementById(VIEWS[k]).classList.toggle('hidden', VIEWS[k] !== viewId);
    });
  }

  function doLogin(email, pass) {
    var sb = supabaseClient();
    if (sb) {
      return sb.auth.signInWithPassword({ email: email, password: pass })
        .then(function (res) {
          if (res.error) throw res.error;
          localStorage.setItem(DEMO_SESSION_KEY, '1'); // allow refresh persistence
          return res;
        });
    }
    // localStorage demo login: any non-empty credentials
    if (!email || !pass) return Promise.reject(new Error('Enter email and password'));
    localStorage.setItem(DEMO_SESSION_KEY, '1');
    return Promise.resolve();
  }

  /* ----------------------------- Dashboard ----------------------------- */

  function counts() {
    var all = window.APP.Store.getGigs();
    var now = Date.now();
    var active = all.filter(function (g) { return g.status === 'active'; });
    var expiring = active.filter(function (g) {
      return new Date(g.expiry_date).getTime() - now < 2 * 86400000;
    });
    var reports = window.APP.Store.getReports().filter(function (r) { return !r.resolved; });
    byId('countActive').textContent = active.length;
    byId('countTotal').textContent = all.length;
    byId('countExpiring').textContent = expiring.length;
    byId('countReports').textContent = reports.length;
  }

  function byId(id) { return document.getElementById(id); }

  function statusOf(g) {
    if (g.status === 'filled') return 'filled';
    if (g.status === 'removed') return 'removed';
    if (new Date(g.expiry_date).getTime() < Date.now()) return 'expired';
    return 'active';
  }

  function tabSets() {
    var all = window.APP.Store.getGigs();
    switch (tab) {
      case 'active':   return all.filter(function (g) { return statusOf(g) === 'active'; });
      case 'expired':  return all.filter(function (g) { return statusOf(g) === 'expired'; });
      case 'filled':   return all.filter(function (g) { return statusOf(g) === 'filled'; });
      default:         return all;
    }
  }

  function renderReported() {
    var reports = window.APP.Store.getReports().filter(function (r) { return !r.resolved; });
    var tbody = byId('adminTbody');
    if (!reports.length) {
      tbody.innerHTML = '';
      byId('adminEmpty').classList.remove('hidden');
      setBulkDisabled(true);
      return;
    }
    byId('adminEmpty').classList.add('hidden');
    tbody.innerHTML = reports.map(function (r) {
      var g = window.APP.Store.getById(r.gig_id);
      return '<tr><td colspan="8"><div class="report-item">' +
        '<strong>Reported:</strong> ' + window.APP.UI.escapeHtml(g ? g.title : 'Removed gig') +
        ' <span class="muted">(' + window.APP.UI.escapeHtml(r.reason) + ')</span><br>' +
        (r.details ? window.APP.UI.escapeHtml(r.details) + '<br>' : '') +
        '<span class="muted">' + new Date(r.created_at).toLocaleString() + '</span><br>' +
        '<div class="row-actions mt-1">' +
          '<button class="btn btn-success btn-sm" onclick="APP.Admin.resolveReport(\'' + r.id + '\')" style="background:var(--success);color:#fff">Mark resolved</button>' +
          (g ? '<button class="btn btn-danger btn-sm" onclick="APP.Admin.removeGig(\'' + g.id + '\')">Remove listing</button>' : '') +
        '</div></div></td></tr>';
    }).join('');
    setBulkDisabled(true);
  }

  function renderTable() {
    var q = (byId('adminSearch').value || '').toLowerCase().trim();
    var rows = tabSets().filter(function (g) {
      if (!q) return true;
      var text = (g.title + ' ' + (g.contact_method || '') + ' ' + g.category).toLowerCase();
      return text.indexOf(q) !== -1;
    });

    var tbody = byId('adminTbody');
    if (!rows.length) {
      tbody.innerHTML = '';
      byId('adminEmpty').classList.remove('hidden');
      setBulkDisabled(true);
      return;
    }
    byId('adminEmpty').classList.add('hidden');

    tbody.innerHTML = rows.map(function (g) {
      var st = statusOf(g);
      var chip = { active: '', expired: ' style="background:#fbecec;color:var(--error)"',
                   filled: ' style="background:var(--primary-light);color:var(--success)"',
                   removed: ' style="background:#eee;color:var(--slate-muted)"' }[st];
      var stLabel = st.charAt(0).toUpperCase() + st.slice(1);
      selected[g.id] = !!selected[g.id];
      return '<tr>' +
        '<td><input type="checkbox" class="rowCheck" data-id="' + g.id + '" ' + (selected[g.id] ? 'checked' : '') + '>' + (g.featured ? ' ⭐' : '') + '</td>' +
        '<td><a href="gig.html?id=' + encodeURIComponent(g.id) + '" target="_blank">' + window.APP.UI.escapeHtml(g.title) + '</a></td>' +
        '<td>' + window.APP.categoryBySlug(g.category).name + '</td>' +
        '<td>' + window.APP.UI.escapeHtml(g.location) + '</td>' +
        '<td>' + new Date(g.date_posted).toLocaleDateString() + '</td>' +
        '<td>' + new Date(g.expiry_date).toLocaleDateString() + '</td>' +
        '<td><span class="chip"' + chip + '>' + stLabel + '</span></td>' +
        '<td><div class="row-actions">' +
          '<button class="btn btn-ghost btn-sm" onclick="APP.Admin.toggleFeatured(\'' + g.id + '\')">' + (g.featured ? 'Unfeature' : 'Feature') + '</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="APP.Admin.markFilled(\'' + g.id + '\')">Filled</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="APP.Admin.extend(\'' + g.id + '\')">Extend</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="APP.Admin.editGig(\'' + g.id + '\')">Edit</button>' +
          '<button class="btn btn-danger btn-sm" onclick="APP.Admin.removeGig(\'' + g.id + '\')">Delete</button>' +
        '</div></td></tr>';
    }).join('');
    setBulkDisabled(Object.keys(selected).filter(function (k) { return selected[k]; }).length === 0);
    updateRowChecks();
  }

  function updateRowChecks() {
    var checks = document.querySelectorAll('.rowCheck');
    checks.forEach(function (c) {
      c.checked = !!selected[c.getAttribute('data-id')];
      c.addEventListener('change', function () {
        selected[c.getAttribute('data-id')] = c.checked;
        setBulkDisabled(Object.keys(selected).filter(function (k) { return selected[k]; }).length === 0);
      });
    });
  }

  function setBulkDisabled(disabled) {
    byId('bulkDelete').disabled = disabled;
    byId('bulkExpire').disabled = disabled;
  }

  function boot() {
    counts();
    if (tab === 'reports') renderReported(); else renderTable();
  }

  /* ------------------------------ Actions ------------------------------ */

  function refresh() { boot(); window.APP.UI.flash && window.APP.UI.flash('Updated.', 'success'); }

  function removeGig(id) {
    if (!confirm('Delete this listing permanently?')) return;
    window.APP.Store.removeGig(id).then(function () { boot(); });
  }

  function markFilled(id) {
    window.APP.Store.updateGig(id, { status: 'filled' }).then(boot);
  }

  function extend(id) {
    var g = window.APP.Store.getById(id);
    var days = prompt('Extend expiry by how many days?', '7');
    if (!days) return;
    var nd = new Date(g.expiry_date).getTime() + Number(days) * 86400000;
    window.APP.Store.updateGig(id, { expiry_date: nd }).then(function () {
      boot(); window.APP.UI.flash('Expiry extended.', 'success');
    });
  }

  function toggleFeatured(id) {
    var g = window.APP.Store.getById(id);
    window.APP.Store.updateGig(id, { featured: !g.featured }).then(boot);
  }

  function editGig(id) {
    var g = window.APP.Store.getById(id);
    var title = prompt('Title', g.title);
    if (title === null) return;
    var pay = prompt('Pay', g.pay);
    if (pay === null) return;
    window.APP.Store.updateGig(id, { title: title, pay: pay }).then(function () {
      boot(); window.APP.UI.flash('Listing updated.', 'success');
    });
  }

  function resolveReport(id) {
    window.APP.Store.resolveReport(id).then(boot);
  }

  function bulkAction(action) {
    var ids = Object.keys(selected).filter(function (k) { return selected[k]; });
    if (!ids.length) return;
    var verb = action === 'delete' ? 'delete' : 'expire';
    if (!confirm('' + verb.charAt(0).toUpperCase() + verb.slice(1) + ' ' + ids.length + ' selected listing(s)?')) return;
    if (action === 'delete') {
      Promise.all(ids.map(function (id) { return window.APP.Store.removeGig(id); })).then(function () {
        selected = {}; boot(); window.APP.UI.flash(ids.length + ' listing(s) deleted.', 'success');
      });
    } else {
      Promise.all(ids.map(function (id) {
        var g = window.APP.Store.getById(id);
        return window.APP.Store.updateGig(id, { expiry_date: Date.now() - 1 });
      })).then(function () { selected = {}; boot(); window.APP.UI.flash(ids.length + ' listing(s) expired.', 'success'); });
    }
  }

  function toggleAll(cb) {
    document.querySelectorAll('.rowCheck').forEach(function (c) {
      c.checked = cb.checked;
      selected[c.getAttribute('data-id')] = cb.checked;
    });
    setBulkDisabled(!cb.checked);
  }

  function clearFilters() {
    byId('adminSearch').value = '';
    selected = {};
    boot();
  }

  /* ------------------------------- Bind -------------------------------- */

  function bindTabs() {
    document.querySelectorAll('.admin-tabs a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.admin-tabs a').forEach(function (x) { x.classList.remove('active'); });
        a.classList.add('active');
        tab = a.getAttribute('data-tab');
        selected = {};
        boot();
      });
    });
    byId('adminSearch').addEventListener('input', function () { renderTable(); });
  }

  function bindLogin() {
    byId('loginForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = byId('aEmail').value.trim();
      var pass = byId('aPass').value;
      var flash = byId('loginFlash');
      flash.className = 'flash show';
      doLogin(email, pass).then(function () {
        flash.textContent = 'Signed in.';
        flash.className = 'flash show flash-success';
        guard();
      }).catch(function (err) {
        flash.textContent = 'Login failed: ' + (err.message || err.error_description || 'invalid credentials');
        flash.className = 'flash show flash-error';
      });
    });
  }

  function init() {
    bindTabs();
    bindLogin();
    if (!guard()) return;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  APP.Admin = {
    guard: guard, logout: function () {
      localStorage.removeItem(DEMO_SESSION_KEY);
      var sb = supabaseClient();
      var p = sb ? sb.auth.signOut() : Promise.resolve();
      p.then(function () { show(VIEWS.login); });
    },
    removeGig: removeGig, markFilled: markFilled, extend: extend,
    toggleFeatured: toggleFeatured, editGig: editGig,
    resolveReport: resolveReport, bulkAction: bulkAction,
    toggleAll: toggleAll, clearFilters: clearFilters
  };
})();
