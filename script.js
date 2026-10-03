// Wellness Gym — progressive enhancement only. Page is fully usable without this file.
(function () {
  "use strict";
  window.__wg = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // Mobile menu
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
    menu.hidden = !open;
  }
  toggle.addEventListener("click", function () { setMenu(menu.hidden); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); }
  });

  // Mobile dock: visible once the hero is out of view
  var dock = document.querySelector(".dock");
  var hero = document.getElementById("top");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      dock.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(hero);
  } else {
    dock.classList.add("is-visible");
  }

  // Classes accordion: hover/focus expands via CSS; tap/click pins one open
  var slices = document.querySelectorAll(".slice");
  slices.forEach(function (s) {
    function open() { slices.forEach(function (o) { o.classList.toggle("is-open", o === s); }); }
    s.addEventListener("click", open);
    s.addEventListener("focus", open);
  });

  // Schedule tabs (no-JS: all days listed as cards)
  var tablist = document.querySelector(".tabs");
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll(".tab"));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  var rail = tablist.querySelector(".tabs__rail");
  var current = 0;
  tablist.hidden = false;
  tablist.parentElement.classList.add("tabbed");
  panels.forEach(function (p, i) {
    p.setAttribute("role", "tabpanel");
    p.setAttribute("aria-labelledby", tabs[i].id);
    p.tabIndex = 0;
    p.hidden = i !== 0;
  });
  function moveRail() {
    var t = tabs[current];
    rail.style.width = t.offsetWidth + "px";
    rail.style.transform = "translateX(" + t.offsetLeft + "px)";
  }
  function select(i, focus) {
    if (i === current) return;
    panels[i].style.setProperty("--dx", (i > current ? 24 : -24) + "px");
    tabs.forEach(function (t, j) {
      t.setAttribute("aria-selected", String(j === i));
      t.tabIndex = j === i ? 0 : -1;
      panels[j].hidden = j !== i;
    });
    current = i;
    moveRail();
    // Scroll only the chip strip, never the page
    tablist.scrollTo({ left: tabs[i].offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) { t.addEventListener("click", function () { select(i); }); });
  tablist.addEventListener("keydown", function (e) {
    var map = { ArrowRight: current + 1, ArrowLeft: current - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    select((map[e.key] + tabs.length) % tabs.length, true);
  });
  // Default to today's day if it has classes (Senin = index 0)
  var today = (new Date().getDay() + 6) % 7;
  if (today < tabs.length) select(today);
  moveRail();
  window.addEventListener("resize", moveRail);
  if (document.fonts) document.fonts.ready.then(moveRail);

  // Reviews carousel: arrows + mouse drag (touch uses native scroll)
  var track = document.getElementById("track");
  document.querySelectorAll(".carousel__ctrl .round").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var step = track.firstElementChild.offsetWidth + 20;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduce ? "auto" : "smooth" });
    });
  });
  var drag = null;
  track.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse") return;
    drag = { x: e.clientX, left: track.scrollLeft };
    track.classList.add("is-drag");
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", function (e) {
    if (drag) track.scrollLeft = drag.left - (e.clientX - drag.x);
  });
  function endDrag() {
    if (!drag) return;
    drag = null;
    track.classList.remove("is-drag");
  }
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // Tap-to-copy address
  var copyBtn = document.querySelector(".copy");
  var toast = document.querySelector(".toast");
  copyBtn.addEventListener("click", function () {
    var text = copyBtn.dataset.copy;
    var done = function () { toast.textContent = "Alamat disalin."; setTimeout(function () { toast.textContent = ""; }, 2500); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { toast.textContent = text; });
    } else {
      toast.textContent = text;
    }
  });
})();
