/* Tech Paradise Hub — agency-style variant */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var SITE = window.SITE || { contact: {}, stats: {}, mentors: [], testimonials: [] };
  var HUES = ["red", "purple", "green", "blue"];

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ================= Site data (contact, stats, mentors, quotes) ================= */
  var C = SITE.contact || {};
  var waText = encodeURIComponent("Hi Tech Paradise Hub, I would like to know more about your courses.");
  var links = {
    whatsapp: "https://wa.me/" + (C.whatsapp || "") + "?text=" + waText,
    phone: "tel:" + (C.phone || ""),
    email: "mailto:" + (C.email || ""),
    instagram: C.instagram || "#", facebook: C.facebook || "#", telegram: C.telegram || "#"
  };
  $$("[data-contact]").forEach(function (a) {
    var k = a.getAttribute("data-contact");
    if (links[k]) a.setAttribute("href", links[k]);
    if (/^https?:/.test(links[k])) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); }
  });
  $$("[data-contact-text]").forEach(function (n) {
    var k = n.getAttribute("data-contact-text");
    var t = k === "phone" ? C.phoneDisplay : k === "email" ? C.email : "";
    if (t) n.textContent = t;
  });
  $$("[data-stat]").forEach(function (n) {
    var v = (SITE.stats || {})[n.getAttribute("data-stat")];
    if (v != null) n.setAttribute("data-count", v);
  });

  $$("[data-render='mentors']").forEach(function (box) {
    var limit = parseInt(box.getAttribute("data-limit"), 10) || 99;
    (SITE.mentors || []).slice(0, limit).forEach(function (m, i) {
      var card = el("article", "mentor hue-" + (m.hue || HUES[i % 4]));
      var photo = el("div", "photo");
      if (m.photo) { var im = el("img"); im.src = m.photo; im.alt = m.name; im.loading = "lazy"; photo.appendChild(im); }
      else { photo.textContent = (m.name || "M").charAt(0); photo.setAttribute("aria-hidden", "true"); }
      card.appendChild(photo);
      card.appendChild(el("h3", "", m.name));
      card.appendChild(el("p", "role", m.role + (m.experience ? " · " + m.experience : "")));
      var sk = el("div", "skills");
      (m.skills || []).forEach(function (s) { sk.appendChild(el("span", "", s)); });
      card.appendChild(sk);
      box.appendChild(card);
    });
  });

  $$("[data-render='quotes']").forEach(function (track) {
    (SITE.testimonials || []).forEach(function (t, i) {
      var s = el("figure", "slide quote hue-" + (t.hue || HUES[i % 4]));
      s.style.margin = "0";
      s.appendChild(el("blockquote", "", "“" + t.quote + "”"));
      var f = el("footer");
      var av = el("div", "avatar", (t.name || "S").charAt(0)); av.setAttribute("aria-hidden", "true");
      var who = el("div");
      who.appendChild(el("b", "", t.name));
      who.appendChild(el("span", "", t.course + (t.detail ? " · " + t.detail : "")));
      f.appendChild(av); f.appendChild(who);
      s.appendChild(f);
      track.appendChild(s);
    });
  });

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ================= Split headline ================= */
  $$(".split").forEach(function (h) {
    var text = h.textContent.trim().replace(/\s+/g, " ");
    h.setAttribute("aria-label", text);
    h.textContent = "";
    var i = 0;
    text.split(" ").forEach(function (word, wi, arr) {
      var w = el("span", "word"); w.setAttribute("aria-hidden", "true");
      word.split("").forEach(function (ch) {
        var c = el("span", "char", ch); c.style.setProperty("--i", i++); w.appendChild(c);
      });
      h.appendChild(w);
      if (wi < arr.length - 1) h.appendChild(document.createTextNode(" "));
    });
  });
  function startIntro() {
    $$(".split").forEach(function (h) { h.classList.add("in"); });
    $$(".reveal.intro").forEach(function (n) { n.classList.add("in"); });
  }

  /* ================= Curtain: preloader + page transitions ================= */
  var curtain = $(".curtain");
  var seen = false;
  try { seen = sessionStorage.getItem("tph-seen") === "1"; sessionStorage.setItem("tph-seen", "1"); } catch (e) {}

  function curtainOpen() {
    if (!curtain) return startIntro();
    $$("i", curtain).forEach(function (i) { i.style.transform = ""; i.style.transition = ""; });
    curtain.style.animation = "none";
    curtain.classList.add("is-ready");
    setTimeout(startIntro, 450);
  }
  if (reduce || !curtain) {
    if (curtain) curtain.remove();
    startIntro();
  } else {
    var loaded = new Promise(function (res) {
      if (document.readyState === "complete") res(); else window.addEventListener("load", res);
    });
    var wait = new Promise(function (res) { setTimeout(res, seen ? 250 : 1000); });
    Promise.all([loaded, wait]).then(curtainOpen);
    window.addEventListener("pageshow", function (e) { if (e.persisted) curtainOpen(); });
  }

  function leaveTo(url) {
    var strips = $$("i", curtain);
    curtain.style.animation = "none";
    strips.forEach(function (i) { i.style.transition = "none"; i.style.transform = "translateY(101%)"; });
    curtain.classList.remove("is-ready");
    void curtain.offsetWidth;
    strips.forEach(function (i) { i.style.transition = ""; i.style.transform = "translateY(0)"; });
    setTimeout(function () { window.location.href = url; }, 750);
  }

  /* ================= Delegated clicks: drawer + transitions ================= */
  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-drawer]");
    if (opener && drawer) {
      e.preventDefault();
      var course = opener.getAttribute("data-course");
      if (course) { var sel = $('select[name="course"]', drawer); if (sel) sel.value = course; }
      closeMenu(true);
      openDrawer(opener);
      return;
    }
    var a = e.target.closest("a[href]");
    if (!a || reduce || !curtain) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    var u;
    try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.protocol !== location.protocol || u.host !== location.host) return;
    if (u.pathname === location.pathname) return; // same page: native anchor scroll
    e.preventDefault();
    leaveTo(u.href);
  });

  /* ================= Header ================= */
  var header = $(".site-header");
  var lastY = 0;
  function headerState() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    header.classList.toggle("is-hidden", y > lastY && y > 160 && !menuOpen);
    lastY = y;
  }

  /* ================= Menu overlay ================= */
  var overlay = $("#overlay");
  var menuBtn = $(".menu-btn");
  var menuOpen = false;
  function openMenu() {
    menuOpen = true; overlay.classList.add("is-open"); document.body.classList.add("no-scroll");
    menuBtn.setAttribute("aria-expanded", "true");
    var f = $("#menu-close"); if (f) f.focus();
  }
  function closeMenu(silent) {
    if (!menuOpen) return;
    menuOpen = false; overlay.classList.remove("is-open");
    if (!drawerOpen) document.body.classList.remove("no-scroll");
    menuBtn.setAttribute("aria-expanded", "false");
    if (!silent) menuBtn.focus();
  }
  if (overlay && menuBtn) {
    menuBtn.addEventListener("click", openMenu);
    $("#menu-close").addEventListener("click", function () { closeMenu(); });
    $$("a", overlay).forEach(function (a) { a.addEventListener("click", function () { if (a.pathname === location.pathname) closeMenu(true); }); });
  }

  /* ================= Drawer ================= */
  var drawer = $("#drawer");
  var scrim = $("#scrim");
  var drawerOpen = false;
  var lastFocus = null;
  function openDrawer(from) {
    lastFocus = from || document.activeElement;
    drawerOpen = true; drawer.classList.add("is-open"); scrim.classList.add("is-open");
    document.body.classList.add("no-scroll");
    setTimeout(function () { var f = $("input, select, textarea", drawer); if (f) f.focus(); }, 350);
  }
  function closeDrawer() {
    if (!drawerOpen) return;
    drawerOpen = false; drawer.classList.remove("is-open"); scrim.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (drawer) {
    $$("[data-close-drawer]").forEach(function (b) { b.addEventListener("click", closeDrawer); });
    scrim.addEventListener("click", closeDrawer);
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); closeMenu(); return; }
    if (e.key === "Tab" && drawerOpen) {
      var f = $$("a[href], button:not([disabled]), input:not(.hp input), select, textarea", drawer).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ================= Custom cursor ================= */
  var cursor = $(".cursor");
  if (cursor && finePointer && !reduce) {
    root.classList.add("has-cursor");
    var ring = $(".cursor-ring", cursor), label = $("span", ring);
    var tx = -100, ty = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("mouseleave", function () { cursor.classList.add("is-hidden"); });
    document.addEventListener("pointerover", function (e) {
      var t = e.target.closest("[data-cursor]");
      var hot = e.target.closest("a, button, summary, label, input, select, textarea");
      cursor.classList.toggle("is-link", !!t);
      cursor.classList.toggle("is-hot", !t && !!hot);
      if (t) label.textContent = t.getAttribute("data-cursor");
    });
    (function follow() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ================= Hero parallax ================= */
  var hero = $(".hero");
  if (hero && !reduce && finePointer) {
    var mark = $(".hero-mark"), blobs = $$(".blob", hero);
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      if (mark) { mark.style.setProperty("--px", (nx * -40).toFixed(1) + "px"); mark.style.setProperty("--py", (ny * -30).toFixed(1) + "px"); }
      blobs.forEach(function (b, i) { var d = (i + 1) * 18; b.style.transform = "translate3d(" + (nx * d).toFixed(1) + "px," + (ny * d).toFixed(1) + "px,0)"; });
    }, { passive: true });
  }

  /* ================= Reveal + counters ================= */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add("in"); io.unobserve(x.target);
        if (x.target.classList.contains("card")) setTimeout(function () { x.target.classList.remove("reveal", "in"); }, 1200);
      });
    }, { threshold: 0.15 });
    $$(".reveal:not(.intro)").forEach(function (n, i) { if (n.dataset.delay) n.style.setProperty("--d", n.dataset.delay); io.observe(n); });

    var co = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        co.unobserve(x.target); countUp(x.target);
      });
    }, { threshold: 0.4 });
    $$("[data-count]").forEach(function (n) { co.observe(n); });
  } else {
    $$(".reveal").forEach(function (n) { n.classList.add("in"); });
    $$("[data-count]").forEach(countUp);
  }
  function countUp(n) {
    var target = parseFloat(n.getAttribute("data-count")) || 0;
    var suffix = n.getAttribute("data-suffix") || "";
    if (reduce) { n.textContent = target.toLocaleString("en-IN") + suffix; return; }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1500, 0, 1), e = 1 - Math.pow(1 - p, 3);
      n.textContent = Math.round(target * e).toLocaleString("en-IN") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ================= Word-by-word statements ================= */
  var statements = $$(".statement");
  statements.forEach(function (s) {
    var words = s.textContent.trim().split(/\s+/);
    s.setAttribute("aria-label", words.join(" "));
    s.textContent = "";
    words.forEach(function (w, i) {
      var sp = el("span", "w", w); sp.setAttribute("aria-hidden", "true");
      s.appendChild(sp); if (i < words.length - 1) s.appendChild(document.createTextNode(" "));
    });
    s._w = $$(".w", s);
    if (reduce) s._w.forEach(function (x) { x.classList.add("lit"); });
  });
  function statementState() {
    if (reduce) return;
    var vh = window.innerHeight;
    statements.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var n = Math.round(clamp((vh * 0.88 - r.top) / (vh * 0.5), 0, 1) * s._w.length);
      s._w.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { headerState(); statementState(); ticking = false; });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  headerState(); statementState();

  /* ================= Card glow + tilt ================= */
  if (finePointer && !reduce) {
    $$(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (x * 100) + "%"); c.style.setProperty("--my", (y * 100) + "%");
        c.style.transform = "perspective(900px) rotateX(" + ((0.5 - y) * 6).toFixed(2) + "deg) rotateY(" + ((x - 0.5) * 8).toFixed(2) + "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () { c.style.transform = ""; });
    });
  }

  /* ================= Sliders (drag, arrows, counter) ================= */
  $$(".slider").forEach(function (sl) {
    var track = $(".s-track", sl), count = $(".s-count", sl);
    var prev = $("[data-prev]", sl), next = $("[data-next]", sl);
    function slides() { return $$(".slide", track); }
    function index() {
      var items = slides(), best = 0, d = Infinity;
      items.forEach(function (it, i) { var x = Math.abs(it.offsetLeft - track.offsetLeft - track.scrollLeft); if (x < d) { d = x; best = i; } });
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) best = items.length - 1;
      return best;
    }
    function update() {
      if (!count) return;
      count.textContent = "";
      count.appendChild(document.createTextNode(pad(index() + 1)));
      count.appendChild(el("span", "", " / " + pad(slides().length)));
    }
    function go(i) {
      var items = slides(); i = clamp(i, 0, items.length - 1);
      track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: reduce ? "auto" : "smooth" });
    }
    track.addEventListener("scroll", function () { requestAnimationFrame(update); }, { passive: true });
    if (prev) prev.addEventListener("click", function () { go(index() - 1); });
    if (next) next.addEventListener("click", function () { go(index() + 1); });
    track.setAttribute("tabindex", "0");
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); go(index() + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(index() - 1); }
    });
    var down = false, sx = 0, sl0 = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl0 = track.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      if (moved) track.scrollLeft = sl0 - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return; down = false;
      if (moved) { track.classList.remove("is-dragging"); go(index()); }
    });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    window.addEventListener("resize", update);
    update();
    setTimeout(update, 300);
  });

  /* ================= Pick your pace ================= */
  var PACE = {
    days: {
      title: "Take a 5-day crash course",
      text: "Learn the essentials of one subject in a single working week and finish with a small project.",
      items: [["Excel crash course", "crash-courses.html#crash-excel", "5 days"], ["SQL crash course", "crash-courses.html#crash-sql", "5 days"], ["Power BI crash course", "crash-courses.html#crash-power-bi", "5 days"], ["Python Basic crash course", "crash-courses.html#crash-python-basic", "5 days"], ["See all 8 crash courses", "crash-courses.html", ""]]
    },
    weeks: {
      title: "Pick a 5 to 6 week course",
      text: "Go deep on one tool at a steady pace, with hands-on classes and a project to finish.",
      items: [["Excel: Basic to Advanced", "courses.html#excel", "6 weeks"], ["SQL", "courses.html#sql", "6 weeks"], ["Power BI", "courses.html#power-bi", "6 weeks"], ["Tableau", "courses.html#tableau", "6 weeks"], ["Python Basic", "courses.html#python-basic", "5 weeks"], ["Python Intermediate", "courses.html#python-intermediate", "6 weeks"]]
    },
    career: {
      title: "Build a full data career path",
      text: "Combine tools into a job-ready skill set with longer courses and portfolio projects.",
      items: [["Data Analytics", "courses.html#data-analytics", "10 weeks"], ["Data Science", "courses.html#data-science", "16 weeks"], ["Compare prices", "pricing.html", ""]]
    }
  };
  var paceBtns = $$("[data-pace]"), paceOut = $("#pace-result");
  function showPace(k) {
    var d = PACE[k]; if (!d || !paceOut) return;
    paceBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.pace === k)); });
    paceOut.textContent = "";
    paceOut.appendChild(el("h3", "", d.title));
    paceOut.appendChild(el("p", "dim", d.text));
    var ul = el("ul");
    d.items.forEach(function (it) {
      var li = el("li"), a = el("a"); a.href = it[1];
      a.appendChild(el("b", "", it[0])); a.appendChild(el("span", "", it[2]));
      li.appendChild(a); ul.appendChild(li);
    });
    paceOut.appendChild(ul);
    var cta = el("a", "btn btn--grad", "Talk to a mentor"); cta.href = "contact.html"; cta.setAttribute("data-open-drawer", "");
    paceOut.appendChild(cta);
  }
  paceBtns.forEach(function (b) { b.addEventListener("click", function () { showPace(b.dataset.pace); }); });
  if (paceBtns.length) showPace("weeks");

  /* ================= Course filter + pricing tabs ================= */
  var filterBtns = $$("[data-filter]"), details = $$(".course-detail");
  filterBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      filterBtns.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      details.forEach(function (d) { d.hidden = !(b.dataset.filter === "all" || d.dataset.track === b.dataset.filter); });
    });
  });
  var tabBtns = $$("[data-price-tab]");
  function showTab(id) {
    tabBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.priceTab === id)); });
    $$(".price-grid").forEach(function (g) { g.hidden = g.id !== id; });
  }
  tabBtns.forEach(function (b) { b.addEventListener("click", function () { showTab(b.dataset.priceTab); }); });
  if (tabBtns.length && location.hash === "#crash") showTab("crash");

  function openHashDetails() {
    if (!location.hash) return;
    var t = $(location.hash);
    if (t && t.tagName === "DETAILS") { t.open = true; t.scrollIntoView(); }
  }
  window.addEventListener("hashchange", openHashDetails);
  openHashDetails();

  /* ================= Forms ================= */
  var RL = { key: "tph-form-sends", max: 3, windowMs: 10 * 60 * 1000, gapMs: 30 * 1000 };
  function sends() {
    try { var a = JSON.parse(localStorage.getItem(RL.key) || "[]"), n = Date.now(); return a.filter(function (t) { return typeof t === "number" && n - t < RL.windowMs; }); } catch (e) { return []; }
  }
  function recordSend() { try { var a = sends(); a.push(Date.now()); localStorage.setItem(RL.key, JSON.stringify(a)); } catch (e) {} }
  function rateLimited() {
    var a = sends(), n = Date.now();
    if (a.length && n - a[a.length - 1] < RL.gapMs) return Math.ceil((RL.gapMs - (n - a[a.length - 1])) / 1000) + " seconds";
    if (a.length >= RL.max) return Math.ceil((RL.windowMs - (n - a[0])) / 60000) + " minutes";
    return "";
  }
  // strip control chars and angle brackets so nothing HTML-like is ever sent or rendered
  function clean(v) { return String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/[<>]/g, "").replace(/\s+$/g, "").replace(/^\s+/, ""); }

  function initForm(form) {
    var statusEl = $(".form-status", form), btn = $('button[type="submit"]', form);
    var f = form.elements, shownAt = Date.now(), busy = false;
    var allowed = $$("#" + f["course"].id + " option", form).map(function (o) { return o.value; }).filter(Boolean);
    function setErr(field, msg) {
      var w = field.closest(".field"), o = $(".error-msg", w);
      w.classList.toggle("has-error", !!msg);
      field.setAttribute("aria-invalid", msg ? "true" : "false");
      if (o) { o.id = o.id || field.id + "-err"; field.setAttribute("aria-describedby", o.id); o.textContent = msg || ""; }
    }
    var rules = {
      name: function (v) { if (v.length < 2) return "Enter your full name (at least 2 characters)."; if (v.length > 80) return "Name must be 80 characters or fewer."; if (!/^[\p{L}][\p{L}\s.'’-]*$/u.test(v)) return "Use letters, spaces, dots, hyphens or apostrophes only."; return ""; },
      email: function (v) { if (!v) return "Enter your email address."; if (v.length > 120 || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(v)) return "Enter a valid email address, like name@example.com."; return ""; },
      phone: function (v) { if (!v) return ""; if (!/^\+?[\d\s()-]+$/.test(v)) return "Use digits only (you can add +, spaces or hyphens)."; var d = v.replace(/\D/g, ""); if (d.length < 10 || d.length > 13) return "Enter a phone number with 10 to 13 digits, or leave it blank."; return ""; },
      course: function (v) { if (!v) return "Choose the course you are asking about."; if (allowed.indexOf(v) < 0) return "Choose a course from the list."; return ""; },
      message: function (v) { if (v.length < 10) return "Write at least 10 characters so we can answer properly."; if (v.length > 1000) return "Message must be 1000 characters or fewer."; if ((v.match(/https?:\/\//gi) || []).length > 2) return "Please include no more than 2 links."; return ""; }
    };
    function validateField(k) { return rules[k] ? (function () { var m = rules[k](clean(f[k].value)); setErr(f[k], m); return !m; })() : true; }
    function validate() {
      var ok = true;
      Object.keys(rules).forEach(function (k) { if (!validateField(k)) ok = false; });
      var c = !f["consent"].checked; setErr(f["consent"], c ? "Tick this box so we can reply to you." : ""); if (c) ok = false;
      return ok;
    }
    Object.keys(rules).forEach(function (k) {
      f[k].addEventListener("blur", function () { validateField(k); });
      f[k].addEventListener(k === "course" ? "change" : "input", function () { if (f[k].closest(".field").classList.contains("has-error")) validateField(k); });
    });
    f["consent"].addEventListener("change", function () { setErr(f["consent"], f["consent"].checked ? "" : "Tick this box so we can reply to you."); });
    function status(kind, text) { statusEl.className = "form-status " + kind; statusEl.textContent = text; }
    form.addEventListener("submit", function (e) {
      e.preventDefault(); statusEl.className = "form-status";
      if (busy) return;
      if (!validate()) {
        status("is-err", "Fix the highlighted fields and send again.");
        var bad = $(".has-error input, .has-error select, .has-error textarea", form); if (bad) bad.focus();
        return;
      }
      // bots: filled honeypot or submitted faster than a human could type
      if ((f["_honey"] && f["_honey"].value) || Date.now() - shownAt < 3000) { form.reset(); status("is-ok", "Message sent. We will reply to your email within one working day."); return; }
      var wait = rateLimited();
      if (wait) { status("is-err", "Too many messages from this device. Please wait " + wait + " before sending another, or message us on WhatsApp."); return; }
      var data = {
        name: clean(f["name"].value), email: clean(f["email"].value), phone: clean(f["phone"].value),
        course: clean(f["course"].value), message: clean(f["message"].value),
        _subject: "New enquiry from Tech Paradise Hub website", _template: "table", _captcha: "false", _honey: ""
      };
      busy = true; btn.disabled = true; btn.textContent = "Sending…";
      var ctl = window.AbortController ? new AbortController() : null, to = setTimeout(function () { if (ctl) ctl.abort(); }, 15000);
      fetch(form.action, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data), credentials: "omit", referrerPolicy: "no-referrer", signal: ctl ? ctl.signal : undefined })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (r) {
          if (r.ok && (r.body.success === true || r.body.success === "true")) { recordSend(); form.reset(); shownAt = Date.now(); status("is-ok", "Message sent. We will reply to your email within one working day."); }
          else throw new Error("failed");
        })
        .catch(function () { status("is-err", "Your message was not sent. Check your connection and try again, or message us on WhatsApp."); })
        .finally(function () { clearTimeout(to); busy = false; btn.disabled = false; btn.textContent = "Send message"; });
    });
  }
  $$("form[data-form]").forEach(initForm);
  var qp = new URLSearchParams(location.search).get("course");
  if (qp) $$('select[name="course"]').forEach(function (s) { if ($$("option", s).some(function (o) { return o.value === qp; })) s.value = qp; });
})();
