/* ЗВУК N — интерактив сайта (универсальный для всех вариантов) */
(function () {
  "use strict";

  var doc = document;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Шапка: состояние при скролле --- */
  var header = doc.querySelector(".hdr, .site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* --- Полноэкранное меню --- */
  var burger = doc.querySelector(".burger");
  if (burger) {
    burger.addEventListener("click", function () {
      var open = doc.body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", String(open));
      doc.body.style.overflow = open ? "hidden" : "";
    });
    doc.querySelectorAll(".menu__nav a, .mobile-nav a, .menu__foot a").forEach(function (a) {
      a.addEventListener("click", function () {
        doc.body.classList.remove("nav-open");
        doc.body.style.overflow = "";
        burger.setAttribute("aria-expanded", "false");
      });
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && doc.body.classList.contains("nav-open")) {
        doc.body.classList.remove("nav-open");
        doc.body.style.overflow = "";
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Появление блоков --- */
  var pending = Array.prototype.slice.call(doc.querySelectorAll(".rv, .reveal"));

  function revealInView() {
    var h = window.innerHeight || doc.documentElement.clientHeight;
    for (var i = pending.length - 1; i >= 0; i--) {
      var el = pending[i];
      if (el.getBoundingClientRect().top < h * 0.92) {
        el.classList.add("in");
        el.classList.add("is-in");
        pending.splice(i, 1);
      }
    }
  }

  if (reduced) {
    pending.forEach(function (el) { el.classList.add("in"); el.classList.add("is-in"); });
    pending.length = 0;
  } else {
    var ticking = false;
    function requestCheck() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; revealInView(); });
    }
    window.addEventListener("scroll", requestCheck, { passive: true });
    window.addEventListener("resize", requestCheck);
    window.addEventListener("load", revealInView);
    revealInView();
    var fallback = setInterval(function () {
      revealInView();
      if (!pending.length) clearInterval(fallback);
    }, 300);
    setTimeout(function () {
      if (!doc.querySelector(".rv.in, .reveal.is-in")) {
        clearInterval(fallback);
        pending.splice(0).forEach(function (el) { el.classList.add("in"); el.classList.add("is-in"); });
      }
    }, 3000);
  }

  /* --- Волна звука --- */
  doc.querySelectorAll("[data-wave]").forEach(function (el) {
    var bars = parseInt(el.getAttribute("data-wave"), 10) || 48;
    var html = "";
    for (var i = 0; i < bars; i++) {
      var d = (Math.random() * 2.2 + 0.6).toFixed(2);
      var dl = (Math.random() * 2.4).toFixed(2);
      html += '<i style="animation-duration:' + d + 's;animation-delay:' + dl + 's"></i>';
    }
    el.innerHTML = html;
  });

  /* --- Аккордеоны (FAQ и программа курса) --- */
  doc.querySelectorAll(".faq, .prog").forEach(function (group) {
    var items = group.querySelectorAll(".faq__item, .prog__i");
    Array.prototype.forEach.call(items, function (item) {
      var q = item.querySelector(".faq__q, .prog__q");
      var a = item.querySelector(".faq__a, .prog__a");
      if (!q || !a) return;
      q.setAttribute("aria-expanded", "false");
      q.addEventListener("click", function () {
        var open = item.classList.contains("open");
        Array.prototype.forEach.call(items, function (other) {
          if (other === item) return;
          var oa = other.querySelector(".faq__a, .prog__a");
          var oq = other.querySelector(".faq__q, .prog__q");
          if (oa) oa.style.height = "0px";
          if (oq) oq.setAttribute("aria-expanded", "false");
          other.classList.remove("open");
        });
        item.classList.toggle("open", !open);
        q.setAttribute("aria-expanded", String(!open));
        a.style.height = open ? "0px" : a.scrollHeight + "px";
      });
    });
  });

  /* --- Счётчики --- */
  var counters = Array.prototype.slice.call(doc.querySelectorAll("[data-count]"));
  function runCounter(el) {
    if (el.getAttribute("data-done")) return;
    el.setAttribute("data-done", "1");
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduced) { el.textContent = target + suffix; return; }
    var cur = 0;
    var step = Math.max(1, Math.round(target / 40));
    (function tick() {
      cur = Math.min(target, cur + step);
      el.textContent = cur + suffix;
      if (cur < target) setTimeout(tick, 40);
    })();
    setTimeout(function () { el.textContent = target + suffix; }, 1400);
  }
  if (counters.length) {
    function checkCounters() {
      var h = window.innerHeight || doc.documentElement.clientHeight;
      for (var i = counters.length - 1; i >= 0; i--) {
        if (counters[i].getBoundingClientRect().top < h * 0.95) {
          runCounter(counters[i]);
          counters.splice(i, 1);
        }
      }
    }
    window.addEventListener("scroll", checkCounters, { passive: true });
    window.addEventListener("load", checkCounters);
    checkCounters();
    var ct = setInterval(function () { checkCounters(); if (!counters.length) clearInterval(ct); }, 350);
    setTimeout(function () { counters.splice(0).forEach(runCounter); }, 5000);
  }

  /* --- Формы: сбор заявки --- */
  var TG_HANDLE = "natlyone";
  doc.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var status = form.querySelector(".form-status");
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (v, k) {
        if (String(v).trim()) lines.push(k + ": " + v);
      });
      var text = "Заявка с сайта zvukn%0A" + lines.join("%0A");
      if (status) status.textContent = "Открываю Telegram — просто отправьте сообщение.";
      window.open("https://t.me/" + TG_HANDLE + "?start=" + text, "_blank", "noopener");
      form.reset();
    });
  });

  /* --- Год в подвале --- */
  doc.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
