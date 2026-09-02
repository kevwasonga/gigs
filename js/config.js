/* =========================================================================
   GigConnect KE — Build-time configuration
   Categories + chip colors, job types, storage mode detection.
   ========================================================================= */

window.APP = window.APP || {};

(function () {
  'use strict';

  var CATEGORIES = [
    { slug: 'house-help',      name: 'House Help & Domestic',      icon: '🏠', bg: '#E6F5F0', text: '#0F7A5E' },
    { slug: 'events',          name: 'Event Services',             icon: '🎉', bg: '#F9EAFB', text: '#8A2FA3' },
    { slug: 'cleaning',        name: 'Cleaning & Errands',         icon: '🧹', bg: '#FDEEEA', text: '#B5522E' },
    { slug: 'driving',         name: 'Driving & Delivery',         icon: '🚚', bg: '#EAF1FB', text: '#2E5FA3' },
    { slug: 'retail',          name: 'Retail & Supermarket',       icon: '🛒', bg: '#E6F5F0', text: '#0F7A5E' },
    { slug: 'hospitality',     name: 'Hospitality & Food',         icon: '🍽️', bg: '#FFF3DF', text: '#B5760B' },
    { slug: 'skilled-trades',  name: 'Skilled Trades',             icon: '🛠️', bg: '#F4EFEA', text: '#7A5B3F' },
    { slug: 'security',        name: 'Security',                   icon: '🛡️', bg: '#F1EAFB', text: '#6A3FA3' },
    { slug: 'labor',           name: 'General Labor / Casual',     icon: '🧱', bg: '#F4EFEA', text: '#7A5B3F' },
    { slug: 'other',           name: 'Other Gigs',                 icon: '📌', bg: '#EEF0F2', text: '#4A5568' }
  ];

  var JOB_TYPES = [
    { value: 'one-off',     name: 'One-off' },
    { value: 'part-time',   name: 'Part-time' },
    { value: 'full-time',   name: 'Full-time' },
    { value: 'recurring',   name: 'Recurring' }
  ];

  function categoryBySlug(slug) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].slug === slug) return CATEGORIES[i];
    }
    return { name: slug, icon: '📌', bg: '#EEF0F2', text: '#4A5568' };
  }

  function expiryDaysForType(jobType) {
    return jobType === 'one-off' ? 7 : 30;
  }

  function supabaseConfigured() {
    return !!(window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url &&
      window.SUPABASE_CONFIG.anonKey &&
      window.SUPABASE_CONFIG.url.indexOf('YOUR-PROJECT') === -1);
  }

  APP.NAME = 'GigConnect KE';
  APP.TAGLINE = 'Local gigs & jobs — posted fast, hire local';
  APP.CATEGORIES = CATEGORIES;
  APP.JOB_TYPES = JOB_TYPES;
  APP.categoryBySlug = categoryBySlug;
  APP.expiryDaysForType = expiryDaysForType;
  APP.supabaseConfigured = supabaseConfigured;
  APP.STORAGE_KEY = 'gigconnect_gigs_v1';
  APP.REPORTS_KEY = 'gigconnect_reports_v1';
  APP.ADMIN_EMAIL = 'admin@gigconnect.ke';
})();
