/* Gig detail page: render a single listing, apply + report */
window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var gigId = new URLSearchParams(window.location.search).get('id');
  var currentGig = null;

  function whatsappLink(contact) {
    // Build a WhatsApp chat link using the first phone number found.
    var digits = (contact || '').replace(/\D/g, '');
    if (digits.length < 9) return null;
    if (digits.length === 9) digits = '254' + digits;
    if (digits.indexOf('0') === 0) digits = '254' + digits.slice(1);
    return 'https://wa.me/' + digits + '?text=' +
      encodeURIComponent('Hello, I am applying for: ' + currentGig.title);
  }

  function render() {
    var mount = document.getElementById('detailMount');
    var g = currentGig;
    var c = window.APP.categoryBySlug(g.category);
    var wa = whatsappLink(g.contact_method);
    var expired = new Date(g.expiry_date).getTime() < Date.now();
    var statusChip = expired
      ? '<span class="chip" style="background:#fbecec;color:var(--error)">Expired</span>'
      : (g.featured ? '<span class="chip" style="background:var(--amber-tint);color:#7A5100">Featured</span>' : '<span class="chip" style="background:var(--primary-light);color:var(--success)">Open</span>');

    mount.innerHTML =
      '<div class="detail-card">' +
        '<div class="detail-head"><h1>' + window.APP.UI.escapeHtml(g.title) + '</h1>' + statusChip + '</div>' +
        '<div class="gig-meta" style="margin-top:8px">' +
          '<span class="chip" style="background:' + c.bg + ';color:' + c.text + '">' + c.name + '</span>' +
          '<span>📍 ' + window.APP.UI.escapeHtml(g.location) + '</span>' +
          '<span>🕒 Needed: ' + window.APP.UI.escapeHtml(g.date_needed) + '</span>' +
          '<span>🗓️ Posted ' + window.APP.UI.timeAgo(g.date_posted) + '</span>' +
        '</div>' +
        '<div class="detail-grid">' +
          field('Pay', g.pay) +
          field('Job type', window.APP.JOB_TYPES.filter(function (t){return t.value===g.job_type;})[0].name) +
          field('Contact', g.contact_method) +
          field('People needed', g.people_needed || '—') +
          field('Duration', g.duration || '—') +
          field('Posted by', g.poster_name) +
        '</div>' +
        '<h3>About this gig</h3><p>' + window.APP.UI.escapeHtml(g.description) + '</p>' +
        '<div class="detail-actions">' +
          (wa
            ? '<a class="btn btn-amber" target="_blank" rel="noopener" href="' + wa + '">Apply on WhatsApp</a>'
            : '<a class="btn btn-primary" href="tel:' + g.contact_method.replace(/[^0-9+]/g, '') + '">Call to apply</a>') +
          '<button class="btn btn-ghost" onclick="APP.Gig.openReport()">⚑ Report this listing</button>' +
        '</div>' +
        '<p class="help-text">⚠️ Never send money or share your ID before meeting the employer in person.</p>' +
      '</div>' +
      reportModal(g);
  }

  function field(label, value) {
    return '<div class="detail-field"><div class="label">' + label + '</div>' +
      '<div class="value">' + window.APP.UI.escapeHtml(value) + '</div></div>';
  }

  function reportModal(g) {
    return '<div id="reportModal" class="hidden" style="background:var(--off-white);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-top:20px">' +
      '<h3>Report this listing</h3>' +
      '<div class="form-group"><label for="rReason">Reason</label>' +
      '<select id="rReason"><option>Scam / fake listing</option><option>Upfront payment request</option>' +
      '<option>Inappropriate content</option><option>Duplicate</option><option>Other</option></select></div>' +
      '<div class="form-group"><label for="rDetails">Details (optional)</label>' +
      '<textarea id="rDetails" placeholder="Tell us more…"></textarea></div>' +
      '<div class="flex gap-2"><button class="btn btn-danger" onclick="APP.Gig.submitReport()">Submit report</button>' +
      '<button class="btn btn-ghost" onclick="APP.Gig.closeReport()">Cancel</button></div>' +
      '</div>';
  }

  function renderRelated() {
    var el = document.getElementById('relatedGrid');
    if (!el || !currentGig) return;
    var related = window.APP.Store.getActiveGigs()
      .filter(function (g) { return g.category === currentGig.category && g.id !== currentGig.id; })
      .slice(0, 3);
    if (!related.length) {
      document.getElementById('relatedMount').classList.add('hidden');
      return;
    }
    el.innerHTML = related.map(window.APP.UI.gigCardHTML).join('');
  }

  function init() {
    if (!gigId) {
      document.getElementById('detailMount').innerHTML =
        '<div class="empty"><span class="icon">🔍</span>No gig selected. <a href="browse.html">Browse gigs</a>.</div>';
      return;
    }
    var g = window.APP.Store.getById(gigId);
    if (!g) {
      document.getElementById('detailMount').innerHTML =
        '<div class="empty"><span class="icon">🚫</span>This gig could not be found. <a href="browse.html">Back to browse</a>.</div>';
      return;
    }
    currentGig = g;
    window.APP.Store.incrementView(gigId);
    render();
    renderRelated();
  }

  APP.Gig = {
    openReport: function () {
      var m = document.getElementById('reportModal');
      if (m) m.classList.remove('hidden');
    },
    closeReport: function () {
      var m = document.getElementById('reportModal');
      if (m) m.classList.add('hidden');
    },
    submitReport: function () {
      var reason = document.getElementById('rReason').value;
      var details = document.getElementById('rDetails').value;
      window.APP.Store.addReport({ gig_id: currentGig.id, reason: reason, details: details })
        .then(function () {
          window.APP.UI.flash('Thank you — report submitted for review.', 'success');
          APP.Gig.closeReport();
        })
        .catch(function () { window.APP.UI.flash('Could not submit report.', 'error'); });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
