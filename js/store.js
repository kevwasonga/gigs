/* =========================================================================
   GigConnect KE — Data layer (store)
   Storage-agnostic: uses Supabase when configured + client available,
   otherwise falls back to localStorage (demo mode).
   ========================================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var APP = window.APP;

  var useSupabase = false;

  function mode() { return useSupabase ? 'supabase' : 'local'; }

  function client() {
    // Supabase client v2 loaded via UMD CDN exposes a global `createClient`.
    if (typeof createClient === 'function') {
      return createClient(window.SUPABASE_CONFIG.url, window.SUPABASE_CONFIG.anonKey);
    }
    return null;
  }

  function detect() {
    useSupabase = window.APP.supabaseConfigured() && typeof createClient === 'function';
    return useSupabase;
  }

  /* ------------------------- localStorage helpers ------------------------- */

  function readLS(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* ----------------------------- Seed data ------------------------------ */

  function seed() {
    var now = Date.now();
    var day = 86400000;
    var s = [
      { id: 'seed-1', title: 'House help needed 3 days this week', category: 'house-help', location: 'Westlands, Nairobi',
        job_type: 'one-off', pay: 'KSh 1,500/day', contact_method: 'WhatsApp 0700 000 111',
        date_needed: 'This week', description: 'Need reliable house help for cleaning and light cooking on Mon, Wed, Fri. Must be trustworthy and punctual.',
        poster_name: 'Jane M.', people_needed: 1, duration: '3 days', featured: true,
        date_posted: now - 2 * day, expiry_date: now + 5 * day, status: 'active', view_count: 42 },
      { id: 'seed-2', title: 'Event decorators for Saturday wedding', category: 'events', location: 'Karen, Nairobi',
        job_type: 'one-off', pay: 'KSh 4,000 (negotiable)', contact_method: 'WhatsApp 0711 222 333',
        date_needed: 'This Saturday', description: 'Need 3 decorators to set up backdrop, table centerpieces and chair covers for a 200-guest wedding.',
        poster_name: 'Events by Wanjiru', business_name: 'Wanjiru Events', people_needed: 3, duration: '1 day',
        featured: true, date_posted: now - 1 * day, expiry_date: now + 6 * day, status: 'active', view_count: 87 },
      { id: 'seed-3', title: 'Part-time cashier – supermarket', category: 'retail', location: 'Kasarani, Nairobi',
        job_type: 'part-time', pay: 'KSh 22,000/month', contact_method: 'Phone 0722 444 555',
        date_needed: 'ASAP', description: 'Retail chain seeks part-time cashier, weekends plus one weekday. Till experience preferred but training offered.',
        poster_name: 'Store Manager', people_needed: 1, duration: 'Ongoing',
        date_posted: now - 3 * day, expiry_date: now + 27 * day, status: 'active', view_count: 130 },
      { id: 'seed-4', title: 'Deep cleaning crew (office)', category: 'cleaning', location: 'Upperhill, Nairobi',
        job_type: 'one-off', pay: 'KSh 3,000', contact_method: 'WhatsApp 0733 666 777',
        date_needed: 'Next week', description: 'Office deep clean: floors, windows, washrooms. Provide own supplies. 4 people for 6 hours.',
        poster_name: 'Office Manager', people_needed: 4, duration: '6 hours',
        date_posted: now - 1 * day, expiry_date: now + 6 * day, status: 'active', view_count: 23 },
      { id: 'seed-5', title: 'Motorbike delivery rider needed', category: 'driving', location: 'Thika',
        job_type: 'full-time', pay: 'KSh 25,000 + fuel', contact_method: 'Phone 0744 888 999',
        date_needed: 'ASAP', description: 'Delivery company needs a rider with own or company bike, valid license, familiar with Thika town routes.',
        poster_name: 'QuickDispatch', business_name: 'QuickDispatch Ltd', people_needed: 2, duration: 'Permanent',
        date_posted: now - 4 * day, expiry_date: now + 26 * day, status: 'active', view_count: 210 }
    ];
    writeLS(window.APP.STORAGE_KEY, s);
    return s;
  }

  function listLS() {
    var l = readLS(window.APP.STORAGE_KEY, null);
    if (!l) { return seed(); }
    return l;
  }

  function saveLS(gigs) { writeLS(window.APP.STORAGE_KEY, gigs); }

  /* ------------------------------ Public API ----------------------------- */

  // Returns all gigs (admin view, includes non-active). mode drives storage.
  function getGigs() { return useSupabase ? getGigsSupabase() : listLS(); }

  function getActiveGigs() {
    var all = getGigs();
    return all.filter(function (g) {
      return g.status === 'active' && new Date(g.expiry_date).getTime() > Date.now();
    });
  }

  function getFeaturedGigs() {
    return getActiveGigs().filter(function (g) { return g.featured; });
  }

  function getById(id) {
    return getGigs().find(function (g) { return g.id === String(id); });
  }

  function getByCategory(slug) {
    return getActiveGigs().filter(function (g) { return g.category === slug; });
  }

  function getStats() {
    var all = getGigs();
    var active = getActiveGigs();
    var now = Date.now();
    var expiring = active.filter(function (g) {
      return new Date(g.expiry_date).getTime() - now < 2 * 86400000;
    });
    return {
      total: all.length,
      active: active.length,
      expiring: expiring.length,
      employers: 12,
      placed: 340
    };
  }

  function createGig(data) {
    var gig = {
      id: 'g-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: data.title,
      category: data.category,
      location: data.location,
      job_type: data.job_type,
      pay: data.pay,
      contact_method: data.contact_method,
      date_needed: data.date_needed,
      description: data.description || '',
      poster_name: data.poster_name || 'Anonymous',
      business_name: data.business_name || '',
      people_needed: data.people_needed ? Number(data.people_needed) : null,
      duration: data.duration || '',
      featured: false,
      date_posted: Date.now(),
      expiry_date: Date.now() + window.APP.expiryDaysForType(data.job_type) * 86400000,
      status: 'active',
      view_count: 0
    };
    if (useSupabase) return createGigSupabase(gig);
    var all = getGigs();
    all.unshift(gig);
    saveLS(all);
    return Promise.resolve(gig);
  }

  function updateGig(id, patch) {
    if (useSupabase) return updateGigSupabase(id, patch);
    var all = getGigs();
    var idx = all.findIndex(function (g) { return g.id === String(id); });
    if (idx === -1) return Promise.reject(new Error('Not found'));
    all[idx] = Object.assign({}, all[idx], patch);
    saveLS(all);
    return Promise.resolve(all[idx]);
  }

  function removeGig(id) {
    if (useSupabase) return removeGigSupabase(id);
    saveLS(getGigs().filter(function (g) { return g.id !== String(id); }));
    return Promise.resolve();
  }

  function incrementView(id) {
    var g = getById(id);
    if (!g) return;
    updateGig(id, { view_count: (g.view_count || 0) + 1 });
  }

  /* ------------------------------- Reports ------------------------------ */

  function getReports() { return useSupabase ? getReportsSupabase() : readLS(window.APP.REPORTS_KEY, []); }

  function addReport(report) {
    var r = {
      id: 'r-' + Date.now().toString(36),
      gig_id: report.gig_id,
      reason: report.reason || 'Spam / inappropriate',
      details: report.details || '',
      resolved: false,
      created_at: Date.now()
    };
    if (useSupabase) return addReportSupabase(r);
    var all = getReports();
    all.unshift(r);
    writeLS(window.APP.REPORTS_KEY, all);
    return Promise.resolve(r);
  }

  function resolveReport(id) {
    if (useSupabase) return resolveReportSupabase(id);
    var all = getReports();
    var idx = all.findIndex(function (r) { return r.id === String(id); });
    if (idx === -1) return Promise.reject(new Error('Not found'));
    all[idx].resolved = true;
    writeLS(window.APP.REPORTS_KEY, all);
    return Promise.resolve(all[idx]);
  }

  /* ------------------------- Supabase table ops -------------------------- */

  function table(name) { return client().from(name); }

  function getGigsSupabase() { return table('gigs').select('*').then(r => r.data || []).catch(() => []); }
  function createGigSupabase(gig) { return table('gigs').insert(gig).select().single().then(r => r.data); }
  function updateGigSupabase(id, patch) { return table('gigs').update(patch).eq('id', id).select().single().then(r => r.data); }
  function removeGigSupabase(id) { return table('gigs').delete().eq('id', id); }
  function getReportsSupabase() { return table('reports').select('*').then(r => r.data || []).catch(() => []); }
  function addReportSupabase(r) { return table('reports').insert(r).select().single().then(d => d.data); }
  function resolveReportSupabase(id) { return table('reports').update({ resolved: true }).eq('id', id); }

  /* ------------------------------ Exports ------------------------------- */

  APP.Store = {
    mode: mode,
    detect: detect,
    getGigs: getGigs,
    getActiveGigs: getActiveGigs,
    getFeaturedGigs: getFeaturedGigs,
    getById: getById,
    getByCategory: getByCategory,
    getStats: getStats,
    createGig: createGig,
    updateGig: updateGig,
    removeGig: removeGig,
    incrementView: incrementView,
    getReports: getReports,
    addReport: addReport,
    resolveReport: resolveReport,
    seed: seed,
    useSupabase: function () { return useSupabase; }
  };

  detect();
})();
