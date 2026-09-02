/* =========================================================================
   GigConnect KE — Shared UI (navigation, footer, banner, helpers)
   Renders the nav/footer into mount points so every page stays consistent.
   ========================================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var NAV_ITEMS = [
    { href: 'index.html', label: 'Home', match: ['index.html'] },
    { href: 'browse.html', label: 'Browse Gigs', match: ['browse.html'] },
    { href: 'post.html', label: 'Post a Gig', match: ['post.html'] },
    { href: 'how-it-works.html', label: 'How It Works', match: ['how-it-works.html'] },
    { href: 'about.html', label: 'About', match: ['about.html'] },
    { href: 'testimonials.html', label: 'Testimonials', match: ['testimonials.html'] },
    { href: 'contact.html', label: 'Contact', match: ['contact.html'] }
  ];

  function currentPage() {
    return (window.location.pathname.split('/').pop()) || 'index.html';
  }

  function renderNav(mount) {
    var el = document.getElementById(mount);
    if (!el) return;
    var page = currentPage();
    var links = NAV_ITEMS.map(function (item) {
      var active = item.match.indexOf(page) !== -1 ? ' class="active"' : '';
      return '<li><a href="' + item.href + '"' + active + '>' + item.label + '</a></li>';
    }).join('');
    el.innerHTML =
      '<nav class="navbar"><div class="container navbar-inner">' +
        '<a class="brand" href="index.html">' + window.APP.NAME +
          '<span class="brand-badge">KE</span></a>' +
        '<button class="nav-toggle" aria-label="Menu" onclick="APP.UI.toggleNav(this)">☰</button>' +
        '<ul class="nav-links" id="navLinks">' + links +
          '<li><a class="nav-cta" href="post.html">+ Post a Gig</a></li>' +
        '</ul>' +
      '</div></nav>';
  }

  function toggleNav(btn) {
    var links = document.getElementById('navLinks');
    if (links) links.classList.toggle('open');
  }

  function renderBanner(mount) {
    var el = document.getElementById(mount);
    if (!el) return;
    el.innerHTML =
      '<div class="safety-banner">⚠️ Never send money to apply. Stay safe — ' +
      '<a href="how-it-works.html#safety">read our safety tips</a>.</div>';
  }

  function renderFooter(mount) {
    var el = document.getElementById(mount);
    if (!el) return;
    var cats = window.APP.CATEGORIES.slice(0, 8).map(function (c) {
      return '<a href="categories.html?cat=' + c.slug + '">' + c.name + '</a>';
    }).join(' · ');
    el.innerHTML =
      '<footer class="footer"><div class="container">' +
        '<div class="footer-inner">' +
          '<div><h4>' + window.APP.NAME + '</h4><p>' + window.APP.TAGLINE + '</p></div>' +
          '<div><h4>Categories</h4><p>' + cats + '</p></div>' +
          '<div><h4>Company</h4>' +
            '<p><a href="about.html">About</a> · <a href="testimonials.html">Testimonials</a> · ' +
            '<a href="contact.html">Contact</a><br>' +
            '<a href="how-it-works.html#safety">Report a Scam</a></p></div>' +
        '</div>' +
        '<div class="footer-bottom">© ' + new Date().getFullYear() + ' ' + window.APP.NAME +
          ' · Built from the Sep Two gigs platform spec</div>' +
      '</div></footer>';
  }

  /* ---- Shared rendering helpers used by multiple pages ---- */

  function chipHTML(catSlug) {
    var c = window.APP.categoryBySlug(catSlug);
    return '<span class="chip" style="background:' + c.bg + ';color:' + c.text + '">' + c.name + '</span>';
  }

  function statusBadge(gig) {
    if (gig.featured) return '<span class="badge badge-urgent">Feature</span>';
    var expiring = new Date(gig.expiry_date).getTime() - Date.now() < 2 * 86400000;
    if (expiring) return '<span class="badge badge-closing">Closing soon</span>';
    return '<span class="badge badge-new">New</span>';
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var d = Math.floor(diff / 86400000);
    if (d <= 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 30) return d + ' days ago';
    return new Date(ts).toLocaleDateString();
  }

  function jobTypeName(value) {
    var types = window.APP.JOB_TYPES;
    for (var i = 0; i < types.length; i++) {
      if (types[i].value === value) return types[i].name;
    }
    return value || 'Gig';
  }

  function gigCardHTML(gig) {
    var c = window.APP.categoryBySlug(gig.category);
    return (
      '<div class="gig-card' + (gig.featured ? ' featured' : '') + '">' +
        (gig.featured ? '<div class="ribbon">Featured</div>' : '') +
        '<h3><a href="gig.html?id=' + encodeURIComponent(gig.id) + '">' + escapeHtml(gig.title) + '</a></h3>' +
        '<div><span class="chip" style="background:' + c.bg + ';color:' + c.text + '">' + c.name + '</span> ' + statusBadge(gig) + '</div>' +
        '<div class="gig-meta">' +
          '<span>📍 ' + escapeHtml(gig.location) + '</span>' +
          '<span>🕒 ' + escapeHtml(gig.date_needed) + '</span>' +
          '<span>🗓️ ' + timeAgo(gig.date_posted) + '</span>' +
        '</div>' +
        '<div class="gig-pay">' + escapeHtml(gig.pay) + '</div>' +
        (gig.description ? '<div class="gig-desc">' + escapeHtml(gig.description.slice(0, 110)) + (gig.description.length > 110 ? '…' : '') + '</div>' : '') +
        '<div class="gig-card-footer">' +
          '<span class="chip" style="background:#fff;border:1px solid var(--border)">' + jobTypeName(gig.job_type) + '</span>' +
          '<a class="btn btn-primary btn-sm" href="gig.html?id=' + encodeURIComponent(gig.id) + '">View</a>' +
        '</div>' +
      '</div>'
    );
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function flash(message, type) {
    var el = document.getElementById('flash');
    if (!el) return;
    el.className = 'flash show flash-' + (type || 'success');
    el.textContent = message;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---- Boot: render chrome on every page ---- */

  function init() {
    renderBanner('bannerMount');
    renderNav('navMount');
    renderFooter('footerMount');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  APP.UI = { renderNav: renderNav, renderFooter: renderFooter, toggleNav: toggleNav,
              chipHTML: chipHTML, statusBadge: statusBadge, timeAgo: timeAgo,
              gigCardHTML: gigCardHTML, escapeHtml: escapeHtml, flash: flash };
})();
