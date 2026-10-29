/* Zarenkov Gallery — интерактив одностраничника */
(function () {
  'use strict';

  var body = document.body;

  /* ---------- шапка при скролле ---------- */
  var top = document.querySelector('.top');
  function onScroll() {
    if (top) top.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- мобильное меню ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  var navLinks = document.querySelectorAll('.nav a');

  if (burger && nav) {
    if (!nav.querySelector('.nav-top')) {
      var navTop = document.createElement('div');
      navTop.className = 'nav-top';
      navTop.innerHTML = '<span>Меню</span><button class="nav-close" type="button" aria-label="Закрыть меню">✕</button>';
      nav.insertBefore(navTop, nav.firstChild);
      navTop.querySelector('.nav-close').addEventListener('click', closeMenu);
    }

    function closeMenu() {
      body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }

    burger.addEventListener('click', function () {
      var open = body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    navLinks.forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (!body.classList.contains('menu-open')) return;
      if (e.target.closest('.nav') || e.target.closest('.burger')) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 1060) closeMenu();
    });
  }

  /* ---------- появление блоков ---------- */
  var revealEls = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -70px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- подсветка текущего раздела в меню ---------- */
  var sectionLinks = {};
  navLinks.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#' && href.length > 1) sectionLinks[href.slice(1)] = a;
  });

  var sections = Object.keys(sectionLinks)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('on'); });
        var link = sectionLinks[entry.target.id];
        if (link) link.classList.add('on');
      });
    }, { rootMargin: '-42% 0px -52% 0px', threshold: 0 });
    sections.forEach(function (section) { spy.observe(section); });
  }

  // у самого верха подсвечиваем первый пункт меню
  var firstNavLink = navLinks[0];
  function markTop() {
    if (window.scrollY > 160) return;
    navLinks.forEach(function (a) { a.classList.remove('on'); });
    if (firstNavLink) firstNavLink.classList.add('on');
  }
  window.addEventListener('scroll', markTop, { passive: true });
  markTop();

  /* ---------- плавающая кнопка: показываем после первого экрана ---------- */
  var floatCta = document.querySelector('.float-cta');
  var contactSection = document.getElementById('contact');
  var contactInView = false;

  function toggleFloatCta() {
    if (!floatCta) return;
    floatCta.classList.toggle('is-visible', window.scrollY > 480 && !contactInView);
  }

  if (floatCta) {
    window.addEventListener('scroll', toggleFloatCta, { passive: true });
    toggleFloatCta();

    if (contactSection && 'IntersectionObserver' in window) {
      var ctaObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          contactInView = entry.isIntersecting;
          toggleFloatCta();
        });
      }, { threshold: 0.08 });
      ctaObserver.observe(contactSection);
    }
  }

  /* ---------- текущий год и дата ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  var todayEl = document.querySelector('[data-today]');
  if (todayEl) {
    try {
      todayEl.textContent = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    } catch (e) { /* оставляем текст из разметки */ }
  }

  /* ---------- фильтр доски ---------- */
  var chips = document.querySelectorAll('.chip');
  var notes = Array.prototype.slice.call(document.querySelectorAll('.note'));

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');
      var filter = chip.getAttribute('data-filter');
      notes.forEach(function (note) {
        note.hidden = filter !== 'all' && note.getAttribute('data-tag') !== filter;
      });
    });
  });

  /* ---------- подстановка темы и текста в форму ---------- */
  var topicSelect = document.getElementById('f-topic');
  var messageField = document.getElementById('f-message');
  var nameField = document.getElementById('f-name');

  document.querySelectorAll('.js-prefill').forEach(function (link) {
    link.addEventListener('click', function () {
      var subject = link.getAttribute('data-subject');
      var message = link.getAttribute('data-message') || '';

      if (topicSelect && subject) topicSelect.value = subject;
      if (messageField && message) messageField.value = message;

      if (nameField) {
        window.setTimeout(function () {
          try { nameField.focus({ preventScroll: true }); } catch (e) { nameField.focus(); }
        }, 450);
      }
    });
  });

  /* ---------- отправка формы: Netlify Forms + локальное демо ---------- */
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var ok = form.querySelector('.form-ok');
      var original = button ? button.innerHTML : '';

      if (ok) {
        ok.hidden = true;
        ok.classList.remove('form-ok--error');
      }

      function showSuccess() {
        form.classList.add('is-sent');
        form.querySelectorAll('input, select, textarea, button').forEach(function (el) {
          el.disabled = true;
        });
        if (button) button.innerHTML = 'Отправлено ✓';
        if (ok) {
          ok.hidden = false;
          try { ok.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (err) {}
        }
      }

      // Локальный просмотр (file://) — показываем демо-подтверждение.
      if (location.protocol === 'file:') {
        showSuccess();
        return;
      }

      if (button) {
        button.disabled = true;
        button.innerHTML = 'Отправляем…';
      }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showSuccess();
      }).catch(function () {
        if (button) {
          button.disabled = false;
          button.innerHTML = original;
        }
        if (ok) {
          ok.hidden = false;
          ok.classList.add('form-ok--error');
          ok.textContent = 'Не удалось отправить. Напишите на info@zarenkov-gallery.com или позвоните +7 (904) 550-55-22.';
        }
      });
    });
  });
})();
