// Wellness Gym — motion layer (GSAP + ScrollTrigger + SplitText + Lenis) on top of a page that works without it.
(function () {
  "use strict";
  window.__wg = true;
  var doc = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Basics that never depend on GSAP ---------- */
  var nav = $("#nav");
  var toggle = $(".nav__toggle");
  var menu = $("#menu");
  var lenis = null;

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector("span").textContent = open ? "Tutup" : "Menu";
    menu.hidden = !open;
    document.body.classList.toggle("menu-open", open);
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && window.gsap && !reduce) {
      gsap.from(menu.querySelectorAll(".menu__links a, .menu .btn, .menu__meta"), { yPercent: 60, opacity: 0, duration: .7, stagger: .06, ease: "expo.out" });
    }
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
  });

  // Today's column in the week grid (Senin = index 0)
  var dayCols = $$(".week__day");
  var today = (new Date().getDay() + 6) % 7;
  if (dayCols[today]) dayCols[today].classList.add("is-today");

  // Tap-to-copy address
  var copyBtn = $(".copy");
  var toast = $(".toast");
  if (copyBtn) copyBtn.addEventListener("click", function () {
    var text = copyBtn.dataset.copy;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        toast.textContent = "Alamat disalin.";
        setTimeout(function () { toast.textContent = ""; }, 2500);
      }, function () { toast.textContent = text; });
    } else {
      toast.textContent = text;
    }
  });

  // Mobile dock + solid nav once past the hero
  var dock = $(".dock");
  var hero = $("#top");
  if (hero && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var past = !entries[0].isIntersecting;
      dock.classList.toggle("is-visible", past);
    }, { threshold: 0.05 }).observe(hero);
  }
  function solidNav() {
    nav.classList.toggle("is-solid", window.scrollY > 40);
    if (!hero) dock.classList.toggle("is-visible", window.scrollY > 420);
  }
  window.addEventListener("scroll", solidNav, { passive: true });
  solidNav();

  // Spotlight borders follow the cursor
  $$("[data-spot]").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  if (!window.gsap || !window.ScrollTrigger) { doc.classList.remove("pending"); return; } // CDN blocked: static page still complete
  // Split text only after webfonts settle (capped so a slow font CDN never stalls the page)
  var fontsReady = Promise.race([
    new Promise(function (r) { document.readyState === "complete" ? r() : window.addEventListener("load", r); })
      .then(function () { return document.fonts ? Promise.all([document.fonts.load('600 1em "Clash Display"'), document.fonts.load('400 1em Satoshi'), document.fonts.load('500 1em "Geist Mono"')]).then(function () { return document.fonts.ready; }) : null; })
      .catch(function () {}),
    new Promise(function (r) { setTimeout(r, 2500); })
  ]);
  fontsReady.then(motion);

  function motion() {
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = !!window.SplitText;
  if (hasSplit) gsap.registerPlugin(SplitText);

  /* ---------- Smooth scroll with inertia ---------- */
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        var target = id.length > 1 && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#top" ? 0 : -70, duration: 1.4 });
        history.replaceState(null, "", id);
      });
    });
  }

  // Active nav link
  var spy = { "membership/": "#membership", "kelas/": "#classes", "personal-trainer/": "#personal-trainer", "fasilitas/": "#facilities", "lokasi/": "#location" };
  if (hero) $$(".nav__links a").forEach(function (a) {
    var sec = $(spy[a.getAttribute("href")] || "#none");
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: "top 45%", end: "bottom 45%",
      onToggle: function (self) { a.classList.toggle("is-active", self.isActive); }
    });
  });

  var mm = gsap.matchMedia();

  /* ---------- Why: pinned horizontal scroll on desktop ---------- */
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", function () {
    var why = $(".why");
    if (!why) return;
    var track = $(".why__track");
    why.classList.add("is-horizontal");
    var title = $(".why__title");
    var chars = hasSplit ? SplitText.create(title, { type: "words,chars" }).chars : [title];
    var dist = function () { return Math.max(0, track.scrollWidth - (window.innerWidth - 2 * track.getBoundingClientRect().left)); };
    var tl = gsap.timeline({
      scrollTrigger: { trigger: ".why__pin", start: "top 8%", end: function () { return "+=" + (dist() + window.innerHeight * .4); }, scrub: 1, pin: true, invalidateOnRefresh: true }
    });
    tl.fromTo(chars, { opacity: .12 }, { opacity: 1, stagger: .02, duration: .3, ease: "none" })
      .to(track, { x: function () { return -dist(); }, ease: "none", duration: 1 }, .1);
    return function () { why.classList.remove("is-horizontal"); };
  });

  mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", function () {
    if (!$(".why__track")) return;
    gsap.from(".why__card", {
      y: 60, opacity: 0, duration: 1, stagger: .1, ease: "expo.out",
      scrollTrigger: { trigger: ".why__track", start: "top 85%" }
    });
  });

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var expo = "expo.out";
    // Guarded tweens: pages share one script but not every page has every section.
    var from = function (sel, vars) { if ($(sel)) gsap.from(sel, vars); };
    var fromTo = function (sel, a, c) { if ($(sel)) gsap.fromTo(sel, a, c); };

    /* ---------- Loader + hero intro ---------- */
    if (hero) {
    // Loader plays once per browser session; returning visitors go straight to the hero reveal.
    var seen = false;
    try { seen = !!sessionStorage.getItem("wg-seen"); sessionStorage.setItem("wg-seen", "1"); } catch (e) {}
    var loader = null;
    if (!seen) {
      loader = document.createElement("div");
      loader.className = "loader";
      loader.setAttribute("aria-hidden", "true");
      loader.innerHTML = '<div class="loader__panel loader__panel--top"></div><div class="loader__panel loader__panel--bot"></div>' +
        '<div class="loader__inner"><img class="loader__logo" src="logo-320.webp" alt="" width="72" height="72"><div class="loader__bar"><span></span></div><p class="loader__count">000</p></div>';
      document.body.appendChild(loader);
    }
    var count = { v: 0 };
    var heroTitle = $(".hero__title");
    var heroLines = hasSplit ? SplitText.create(heroTitle, { type: "lines", mask: "lines", linesClass: "split-line" }).lines : $$(".line", heroTitle);

    gsap.set(heroLines, { yPercent: 110 });
    gsap.set(".hero .kicker, .hero .hero__ctas > *, .hero__loc", { y: 24, opacity: 0 });
    gsap.set(".hero__sub", { y: 24 }); // stays painted so the paragraph counts as an early LCP candidate
    gsap.set(".hero__frame", { scale: 1.25 });
    gsap.set(nav, { yPercent: -100 });
    doc.classList.remove("pending");

    var intro = gsap.timeline({ defaults: { ease: expo } });
    if (loader) {
      intro
        .to(count, { v: 100, duration: .8, ease: "power2.inOut", onUpdate: function () { loader.querySelector(".loader__count").textContent = String(Math.round(count.v)).padStart(3, "0"); } })
        .to(".loader__bar span", { scaleX: 1, duration: .8, ease: "power2.inOut" }, 0)
        .to(".loader__inner", { opacity: 0, y: -20, duration: .3, ease: "power2.in" })
        .to(".loader__panel--top", { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=.05")
        .to(".loader__panel--bot", { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<");
    }
    intro
      .to(".hero__frame", { scale: 1, duration: 2, ease: "expo.out" }, loader ? "<" : 0)
      .to(heroLines, { yPercent: 0, duration: 1.3, stagger: .12 }, "<.35")
      .to(".hero .kicker", { y: 0, opacity: 1, duration: 1 }, "<.1")
      .to(".hero__sub", { y: 0, duration: 1 }, "<.25")
      .to(".hero .hero__ctas > *, .hero__loc", { y: 0, opacity: 1, duration: 1, stagger: .08 }, "<")
      .to(nav, { yPercent: 0, duration: 1 }, "<")
      .add(function () { if (loader) loader.remove(); });

    // Hero recedes into a framed plate while scrolling away
    gsap.to(".hero__frame", {
      clipPath: "inset(0% 3% 8% 3% round 6px)", ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true }
    });
    gsap.to(".hero__content", {
      yPercent: -18, opacity: .2, ease: "none",
      scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true }
    });

    } else {
      doc.classList.remove("pending");
      from(".phead__in > :not(h1)", { y: 24, opacity: 0, duration: 1, stagger: .08, delay: .35, ease: expo });
    }

    // Nav hides on scroll down, returns on scroll up
    ScrollTrigger.create({
      start: 200, end: "max",
      onUpdate: function (self) {
        if (!menu.hidden) return;
        gsap.to(nav, { yPercent: self.direction === 1 ? -100 : 0, duration: .5, ease: "power3.out", overwrite: "auto" });
      }
    });

    /* ---------- Velocity-reactive infinite marquee ---------- */
    var loops = $$(".marquee__track").map(function (track, i) {
      track.parentElement.appendChild(track.cloneNode(true));
      var both = track.parentElement.children;
      return gsap.fromTo(both, { xPercent: i ? -100 : 0 }, { xPercent: i ? 0 : -100, duration: 28 + i * 6, ease: "none", repeat: -1 });
    });
    // Photo ribbon joins the same velocity-driven loop
    var ribbon = $(".ribbon");
    var skew = null;
    if (ribbon) {
      ribbon.classList.add("is-looping");
      ribbon.scrollLeft = 0;
      ribbon.appendChild($(".ribbon__track").cloneNode(true)).setAttribute("aria-hidden", "true");
      loops.push(gsap.fromTo(ribbon.children, { xPercent: 0 }, { xPercent: -100, duration: 45, ease: "none", repeat: -1 }));
      skew = gsap.quickTo(".ribbon__item", "skewX", { duration: .5, ease: "power3.out" });
    }

    var boost = { v: 1 };
    var setBoost = function () { loops.forEach(function (l) { l.timeScale(boost.v); }); };
    if (loops.length) ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var v = gsap.utils.clamp(-6, 6, self.getVelocity() / 300);
        var dir = self.direction;
        if (skew) { skew(gsap.utils.clamp(-8, 8, -v * 2)); gsap.delayedCall(.3, function () { skew(0); }); }
        gsap.to(boost, { v: (Math.abs(v) + 1) * dir, duration: .25, overwrite: true, onUpdate: setBoost });
        gsap.to(boost, { v: dir, duration: 1.2, delay: .25, ease: "power2.out", onUpdate: setBoost });
      }
    });

    /* ---------- Quick info ---------- */
    from(".quick__item", {
      y: 40, opacity: 0, duration: 1, stagger: .08, ease: expo,
      scrollTrigger: { trigger: ".quick", start: "top 85%" }
    });

    /* ---------- Section titles: masked char rise ---------- */
    // Split lazily, just before each title nears the viewport, so first load stays light.
    $$("[data-split]").forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: "top 150%", once: true,
        onEnter: function () {
          (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
          var chars = hasSplit ? SplitText.create(el, { type: "lines,chars", mask: "lines", linesClass: "split-line" }).chars : [el];
          gsap.from(chars, {
            yPercent: 110, duration: 1.1, stagger: .025, ease: expo,
            scrollTrigger: { trigger: el, start: "top 85%" }
          });
          });
        }
      });
    });

    /* ---------- Count-up prices & rating ---------- */
    $$("[data-count]").forEach(function (el) {
      var final = el.textContent;
      var target = parseFloat(el.dataset.count);
      var dec = parseInt(el.dataset.decimals || "0", 10);
      var o = { v: 0 };
      gsap.to(o, {
        v: target, duration: 1.6, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
        onUpdate: function () {
          el.textContent = dec ? o.v.toFixed(dec) : "Rp" + (Math.round(o.v / 1000) * 1000).toLocaleString("id-ID");
        },
        onComplete: function () { el.textContent = final; }
      });
    });

    /* ---------- Membership tiles ---------- */
    from(".tile", {
      clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, stagger: .1, ease: "expo.inOut",
      scrollTrigger: { trigger: ".bento", start: "top 80%" }
    });

    /* ---------- Facilities: rising shutter + image settle ---------- */
    $$(".fac__item").forEach(function (item, i) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 88%" } });
      tl.from(item, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut", delay: (i % 2) * .08 })
        .from(item.querySelector(".fac__media"), { scale: 1.35, duration: 1.6, ease: expo }, "<.2")
        .from(item.querySelector("h3"), { y: 20, opacity: 0, duration: .8, ease: expo }, "<.4");
    });

    /* ---------- Classes banner: reveal + parallax ---------- */
    from(".classes__banner", {
      clipPath: "inset(0% 50% 0% 50%)", duration: 1.4, ease: "expo.inOut",
      scrollTrigger: { trigger: ".classes__banner", start: "top 85%" }
    });
    fromTo(".classes__img", { yPercent: -15 }, {
      yPercent: 0, ease: "none",
      scrollTrigger: { trigger: ".classes__banner", start: "top bottom", end: "bottom top", scrub: true }
    });

    /* ---------- Classes rows ---------- */
    from(".class-row", {
      x: -80, opacity: 0, duration: 1.1, stagger: .08, ease: expo,
      scrollTrigger: { trigger: ".classes", start: "top 80%" }
    });

    /* ---------- FAQ ---------- */
    from(".faq__item", {
      y: 40, opacity: 0, duration: 1, stagger: .06, ease: expo,
      scrollTrigger: { trigger: ".faq__list", start: "top 85%" }
    });

    /* ---------- Week grid ---------- */
    from(".week__day", {
      y: 50, opacity: 0, duration: .9, stagger: .06, ease: expo,
      scrollTrigger: { trigger: ".week", start: "top 85%" }
    });

    /* ---------- PT: stacked cards shrink as the next one lands ---------- */
    var tiers = $$(".tier");
    tiers.forEach(function (t, i) {
      var next = tiers[i + 1];
      if (!next) return;
      gsap.to(t, {
        scale: .93, filter: "brightness(.55)", ease: "none",
        scrollTrigger: { trigger: next, start: "top 70%", end: function () { return "top " + parseFloat(getComputedStyle(next).top) + "px"; }, scrub: true, invalidateOnRefresh: true }
      });
    });
    from(".spin", {
      scale: 0, rotate: -120, duration: 1.4, ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".pt", start: "top 75%" }
    });

    /* ---------- Reviews wall ---------- */
    from(".wall__item", {
      y: 90, opacity: 0, duration: 1.2, stagger: .12, ease: expo,
      scrollTrigger: { trigger: ".wall", start: "top 85%" }
    });

    /* ---------- Location ---------- */
    from(".loc__info > *:not(h2), .loc__map", {
      y: 40, opacity: 0, duration: 1, stagger: .07, ease: expo,
      scrollTrigger: { trigger: ".loc", start: "top 78%" }
    });

    /* ---------- Final CTA ---------- */
    var finalTitle = $(".final__title");
    var finalLines = hasSplit ? SplitText.create(finalTitle.children, { type: "lines", mask: "lines", linesClass: "split-line", aria: "none" }).lines : finalTitle.children;
    gsap.from(finalLines, {
      yPercent: 110, duration: 1.3, stagger: .12, ease: expo,
      scrollTrigger: { trigger: finalTitle, start: "top 80%" }
    });
    from(".final__copy, .final .hero__ctas > *, .final__contact", {
      y: 30, opacity: 0, duration: 1, stagger: .08, ease: expo,
      scrollTrigger: { trigger: ".final__copy", start: "top 90%" }
    });

    /* ---------- Footer wordmark rises with scroll ---------- */
    from(".footer__word", {
      yPercent: 70, ease: "none",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true }
    });

    /* ---------- Magnetic primary buttons ---------- */
    if (finePointer) {
      $$(".btn--gold, .spin").forEach(function (el) {
        var xTo = gsap.quickTo(el, "x", { duration: .6, ease: "power3.out" });
        var yTo = gsap.quickTo(el, "y", { duration: .6, ease: "power3.out" });
        el.addEventListener("pointermove", function (e) {
          var r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * .3);
          yTo((e.clientY - r.top - r.height / 2) * .3);
        });
        el.addEventListener("pointerleave", function () {
          gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" });
        });
      });
    }

    return function () { if (loader) loader.remove(); };
  });

  /* ---------- Cursor with contextual label ---------- */
  if (finePointer && !reduce) {
    var cursor = $(".cursor");
    var label = $(".cursor__label");
    var cx = gsap.quickTo(cursor, "x", { duration: .35, ease: "power3.out" });
    var cy = gsap.quickTo(cursor, "y", { duration: .35, ease: "power3.out" });
    window.addEventListener("pointermove", function (e) { cx(e.clientX); cy(e.clientY); cursor.classList.add("is-on"); }, { passive: true });
    document.addEventListener("pointerleave", function () { cursor.classList.remove("is-on"); });
    $$("[data-cursor]").forEach(function (el) {
      el.addEventListener("pointerenter", function () { label.textContent = el.dataset.cursor; cursor.classList.add("is-label"); });
      el.addEventListener("pointerleave", function () { cursor.classList.remove("is-label"); });
    });
  }

  doc.classList.remove("pending");
  ScrollTrigger.refresh();
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
