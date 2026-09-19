/* ==========================================================================
   Wedding invitation — behaviour
   You normally do NOT need to edit this file. Change details in data.js.
   ========================================================================== */
(function () {
  'use strict';

  var d = weddingData;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function firstName(full) { return String(full || '').split(' ')[0]; }

  /* ---------- 1. Fill the page from data.js ---------- */
  $$('[data-text]').forEach(function (el) {
    var value = d[el.getAttribute('data-text')];
    if (value === undefined || value === '') { el.hidden = true; } else { el.textContent = value; }
  });

  $$('[data-maps]').forEach(function (a) { a.href = d.mapsUrl; });

  // Address: one line per comma-separated part
  $$('[data-address]').forEach(function (el) {
    d.venueAddress.split(', ').forEach(function (part, i, arr) {
      if (i > 0) { el.appendChild(document.createElement('br')); }
      el.appendChild(document.createTextNode(i < arr.length - 1 ? part + ',' : part));
    });
  });

  // Footer names keep their "|" separators, styled in gold and kept with the name before them
  var namesEl = $('#footer-names');
  if (namesEl) {
    var parts = d.footerNames.split('|');
    parts.forEach(function (part, i) {
      var span = document.createElement('span');
      span.className = 'name-part';
      span.appendChild(document.createTextNode(part.trim()));
      if (i < parts.length - 1) {
        var bar = document.createElement('span');
        bar.className = 'bar'; bar.textContent = '|'; bar.setAttribute('aria-hidden', 'true');
        span.appendChild(bar);
      }
      if (i > 0) { namesEl.appendChild(document.createTextNode(' ')); }
      namesEl.appendChild(span);
    });
  }

  // Optional photos: only shown when a path is given, and removed if the file is missing
  var photoList = [
    ['bride', d.bride], ['couple', d.bride + ' and ' + d.groom], ['groom', d.groom]
  ].filter(function (p) { return d.photos && d.photos[p[0]]; });
  var photosEl = $('#photos');
  if (photosEl && photoList.length) {
    photoList.forEach(function (p) {
      var fig = document.createElement('figure');
      var img = document.createElement('img');
      img.src = d.photos[p[0]]; img.alt = 'Photo of ' + p[1]; img.loading = 'lazy';
      img.addEventListener('error', function () {
        fig.remove();
        if (!photosEl.children.length) { photosEl.hidden = true; }
      });
      fig.appendChild(img); photosEl.appendChild(fig);
    });
    photosEl.hidden = false;
  }

  /* ---------- 2. Toast + clipboard ---------- */
  var toastEl = $('#toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function copyText(text) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallback(); });
    }
    return Promise.resolve(fallback());
  }

  var copyAddrBtn = $('#copy-address');
  if (copyAddrBtn) {
    copyAddrBtn.addEventListener('click', function () {
      copyText(d.venueName + ', ' + d.venueAddress).then(function (ok) {
        toast(ok ? 'Address copied' : 'Could not copy. Please copy it manually.');
      });
    });
  }

  /* ---------- 3. Countdown ---------- */
  var target = new Date(d.weddingStart).getTime();
  var cdEls = {
    days: $('#cd-days'), hours: $('#cd-hours'), minutes: $('#cd-minutes'), seconds: $('#cd-seconds')
  };
  var cdTimer;

  function setNum(el, value) {
    var text = String(value).padStart(2, '0');
    if (el.textContent === text) { return; }
    el.textContent = text;
    if (!reduceMotion) {
      el.classList.remove('tick');
      void el.offsetWidth;            // restart the animation
      el.classList.add('tick');
    }
  }

  function updateCountdown() {
    var diff = target - Date.now();
    if (diff <= 0) {
      $('#cd').hidden = true;
      $('#cd-done').hidden = false;
      clearInterval(cdTimer);
      return;
    }
    var s = Math.floor(diff / 1000);
    setNum(cdEls.days, Math.floor(s / 86400));
    setNum(cdEls.hours, Math.floor((s % 86400) / 3600));
    setNum(cdEls.minutes, Math.floor((s % 3600) / 60));
    setNum(cdEls.seconds, s % 60);
  }
  updateCountdown();
  cdTimer = setInterval(updateCountdown, 1000);

  /* ---------- 4. Calendar ---------- */
  var venueFull = d.venueName + ', ' + d.venueAddress;
  var coupleShort = firstName(d.bride) + ' & ' + firstName(d.groom);

  var events = {
    reception: {
      key: 'reception',
      title: d.receptionTitle + ' \u2013 ' + coupleShort,
      description: d.receptionTitle + ' of ' + coupleShort + '. ' + d.receptionTime + '. Directions: ' + d.mapsUrl,
      start: d.receptionStart, end: d.receptionEnd
    },
    wedding: {
      key: 'wedding',
      title: d.weddingTitle + ' \u2013 ' + coupleShort,
      description: d.weddingTitle + ' of ' + coupleShort + (d.weddingSubtitle ? ' (' + d.weddingSubtitle + ')' : '') + '. ' + d.weddingTime + '. Directions: ' + d.mapsUrl,
      start: d.weddingStart, end: d.weddingEnd
    }
  };

  // ISO date-time -> 20261122T044700Z
  function stamp(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  function googleCalendarUrl(ev) {
    // No end time supplied -> Google Calendar is given the start time only (no invented duration)
    var dates = stamp(ev.start) + '/' + stamp(ev.end || ev.start);
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(ev.title) +
      '&dates=' + dates +
      '&details=' + encodeURIComponent(ev.description) +
      '&location=' + encodeURIComponent(venueFull);
  }

  function icsEscape(s) {
    return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  function icsFold(line) {           // lines must be 75 characters or fewer
    if (line.length <= 70) { return line; }
    var out = [line.slice(0, 70)];
    for (var i = 70; i < line.length; i += 69) { out.push(' ' + line.slice(i, i + 69)); }
    return out.join('\r\n');
  }

  function buildICS(ev) {
    var lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + ev.key + '-' + stamp(ev.start) + '@wedding-invitation',
      'DTSTAMP:' + stamp(new Date().toISOString()),
      'DTSTART:' + stamp(ev.start)
    ];
    if (ev.end) { lines.push('DTEND:' + stamp(ev.end)); }
    lines.push(
      'SUMMARY:' + icsEscape(ev.title),
      'DESCRIPTION:' + icsEscape(ev.description),
      'LOCATION:' + icsEscape(venueFull),
      'URL:' + d.mapsUrl,
      'END:VEVENT',
      'END:VCALENDAR'
    );
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }

  function downloadICS(ev) {
    var blob = new Blob([buildICS(ev)], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = ev.key + '-invitation.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('Calendar file downloaded');
  }

  $$('[data-gcal]').forEach(function (a) {
    a.href = googleCalendarUrl(events[a.getAttribute('data-gcal')]);
  });
  $$('[data-ics]').forEach(function (btn) {
    btn.addEventListener('click', function () { downloadICS(events[btn.getAttribute('data-ics')]); });
  });

  // Open / close the "Add to Calendar" menus
  function closeMenus(except) {
    $$('.cal-toggle').forEach(function (t) {
      if (t === except) { return; }
      t.setAttribute('aria-expanded', 'false');
      $('#' + t.getAttribute('aria-controls')).hidden = true;
    });
  }
  $$('.cal-toggle').forEach(function (t) {
    t.addEventListener('click', function () {
      var menu = $('#' + t.getAttribute('aria-controls'));
      var open = t.getAttribute('aria-expanded') === 'true';
      closeMenus(t);
      t.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenus(); } });

  /* ---------- 5. Sharing ---------- */
  var pageUrl = d.inviteUrl || window.location.href.split('#')[0];
  var shareBtn = $('#share-btn'), copyLinkBtn = $('#copy-link-btn'), waBtn = $('#wa-btn');

  if (navigator.share) {
    shareBtn.hidden = false;
    shareBtn.addEventListener('click', function () {
      navigator.share({ title: d.shareTitle, text: d.shareText, url: pageUrl }).catch(function (err) {
        if (err && err.name === 'AbortError') { return; }       // person closed the share sheet
        copyText(pageUrl).then(function (ok) { toast(ok ? 'Link copied' : 'Could not share'); });
      });
    });
  } else {
    copyLinkBtn.hidden = false;
    copyLinkBtn.addEventListener('click', function () {
      copyText(pageUrl).then(function (ok) { toast(ok ? 'Link copied' : 'Could not copy the link'); });
    });
  }
  waBtn.href = 'https://wa.me/?text=' + encodeURIComponent(d.shareText + ' ' + pageUrl);

  /* ---------- 6. Scroll reveal ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 7. Floating "Directions" button ---------- */
  var fab = $('#fab'), heroVisible = true, venueVisible = false;
  function updateFab() {
    var show = !heroVisible && !venueVisible;
    fab.classList.toggle('show', show);
    fab.tabIndex = show ? 0 : -1;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; updateFab(); }, { threshold: 0.35 })
      .observe($('.hero'));
    new IntersectionObserver(function (e) { venueVisible = e[0].isIntersecting; updateFab(); }, { threshold: 0.2 })
      .observe($('#venue'));
  }
})();
