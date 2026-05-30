(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function bindMobileMenu() {
    var button = qs('[data-mobile-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function bindHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[type="search"], input[name="q"]', form);
        var keyword = input ? input.value.trim() : '';
        if (!keyword) {
          return;
        }
        window.location.href = 'search.html?q=' + encodeURIComponent(keyword);
      });
    });
  }

  function bindListingFilter() {
    var area = qs('[data-listing]');
    if (!area) {
      return;
    }
    var input = qs('[data-filter-input]');
    var sort = qs('[data-sort-select]');
    var cards = qsa('.movie-card', area);
    var empty = qs('[data-empty]');

    function apply() {
      var keyword = normalize(input && input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    function reorder() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var visibleCards = cards.slice();
      visibleCards.sort(function (a, b) {
        if (value === 'title') {
          return normalize(a.getAttribute('data-title')).localeCompare(normalize(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        if (value === 'score') {
          return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        }
        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
      });
      visibleCards.forEach(function (card) {
        area.appendChild(card);
      });
      cards = qsa('.movie-card', area);
      apply();
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', reorder);
      reorder();
    }

    apply();
  }

  window.initMoviePlayer = function (streamUrl) {
    var shell = qs('[data-player]');
    if (!shell) {
      return;
    }
    var video = qs('video', shell);
    var layer = qs('[data-player-layer]', shell);
    var button = qs('[data-player-button]', shell);
    var started = false;

    function start() {
      if (!video || started) {
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = streamUrl;
        video.load();
        video.play().catch(function () {});
      }
      if (layer) {
        layer.classList.add('is-hidden');
      }
    }

    if (layer) {
      layer.addEventListener('click', start);
    }
    if (button) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        start();
      });
    }
    if (video) {
      video.addEventListener('click', start);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileMenu();
    bindHero();
    bindSearchForms();
    bindListingFilter();
  });
})();
