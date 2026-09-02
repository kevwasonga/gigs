/* Post a Gig: validation, submission and auto-expiry */
window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  function fillSelects() {
    var cat = document.getElementById('category');
    cat.innerHTML = window.APP.CATEGORIES.map(function (c) {
      return '<option value="' + c.slug + '">' + c.name + '</option>';
    }).join('');

    var type = document.getElementById('jobType');
    type.innerHTML = window.APP.JOB_TYPES.map(function (t) {
      return '<option value="' + t.value + '">' + t.name + '</option>';
    }).join('');
  }

  function validate() {
    var ok = true;
    var required = ['title', 'location', 'pay', 'contact', 'dateNeeded', 'posterName', 'description'];
    required.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('form-error');
        ok = false;
      } else {
        el.classList.remove('form-error');
      }
    });

    var contact = document.getElementById('contact').value.trim();
    if (contact && !/^[+]?[\d\s()-]{9,}$/.test(contact)) {
      document.getElementById('contact').classList.add('form-error');
      document.getElementById('contact').setAttribute('data-msg', 'Enter a valid phone/WhatsApp number.');
      ok = false;
    }

    return ok;
  }

  function flash(msg, type) {
    var el = document.getElementById('formFlash');
    el.className = 'flash show flash-' + (type || 'success');
    el.textContent = msg;
  }

  function submit(e) {
    e.preventDefault();
    if (!validate()) {
      flash('Please fix the highlighted fields.', 'error');
      return;
    }

    var data = {
      title: document.getElementById('title').value.trim(),
      category: document.getElementById('category').value,
      location: document.getElementById('location').value.trim(),
      job_type: document.getElementById('jobType').value,
      pay: document.getElementById('pay').value.trim(),
      contact_method: document.getElementById('contact').value.trim(),
      date_needed: document.getElementById('dateNeeded').value.trim(),
      poster_name: document.getElementById('posterName').value.trim(),
      people_needed: document.getElementById('peopleNeeded').value,
      duration: document.getElementById('duration').value.trim(),
      description: document.getElementById('description').value.trim()
    };

    var btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = 'Posting…';

    window.APP.Store.createGig(data)
      .then(function (gig) {
        var expiry = new Date(gig.expiry_date).toLocaleDateString();
        flash('🎉 Your gig is live! It will auto-expire on ' + expiry + '.', 'success');
        btn.textContent = 'Post gig for free';
        btn.disabled = false;
        e.target.reset();
        setTimeout(function () {
          window.location.href = 'gig.html?id=' + encodeURIComponent(gig.id);
        }, 1600);
      })
      .catch(function (err) {
        flash('Something went wrong: ' + err.message, 'error');
        btn.textContent = 'Post gig for free';
        btn.disabled = false;
      });
  }

  function init() {
    fillSelects();
    document.getElementById('gigForm').addEventListener('submit', submit);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
