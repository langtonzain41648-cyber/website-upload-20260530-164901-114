(function () {
  const mobileToggle = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (slides.length > 1) {
      startTimer();
    }
  }

  function setupSearch(container) {
    const input = container.querySelector('[data-search-input]');
    const panel = container.querySelector('[data-search-panel]');
    const button = container.querySelector('[data-search-button]');

    if (!input || !panel) {
      return;
    }

    const data = Array.isArray(window.MOVIE_SEARCH_DATA) ? window.MOVIE_SEARCH_DATA : [];

    function renderResults(query) {
      const keyword = query.trim().toLowerCase();
      panel.innerHTML = '';

      if (!keyword) {
        panel.classList.remove('is-open');
        return;
      }

      const results = data.filter(function (movie) {
        return [movie.title, movie.region, movie.genre, movie.year, movie.category, movie.oneLine]
          .join(' ')
          .toLowerCase()
          .includes(keyword);
      }).slice(0, 10);

      if (!results.length) {
        panel.innerHTML = '<div class="search-result"><div></div><div><strong>没有找到相关影片</strong><span>换一个关键词试试</span></div></div>';
        panel.classList.add('is-open');
        return;
      }

      results.forEach(function (movie) {
        const link = document.createElement('a');
        link.className = 'search-result';
        link.href = movie.url;
        link.innerHTML = [
          '<span class="search-result-poster" data-fallback-title="' + escapeHtml(movie.title) + '">',
          '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
          '</span>',
          '<span>',
          '<strong>' + escapeHtml(movie.title) + '</strong>',
          '<span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</span>',
          '</span>'
        ].join('');
        panel.appendChild(link);
      });

      panel.classList.add('is-open');
      setupImageFallbacks(panel);
    }

    input.addEventListener('input', function () {
      renderResults(input.value);
    });

    input.addEventListener('focus', function () {
      if (input.value.trim()) {
        renderResults(input.value);
      }
    });

    if (button) {
      button.addEventListener('click', function () {
        const first = panel.querySelector('a');
        if (first) {
          window.location.href = first.href;
        } else {
          renderResults(input.value);
        }
      });
    }

    document.addEventListener('click', function (event) {
      if (!container.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  }

  function setupAllSearches() {
    document.querySelectorAll('[data-search-box]').forEach(setupSearch);
  }

  function setupFilters() {
    const filterRoot = document.querySelector('[data-filter-root]');
    if (!filterRoot) {
      return;
    }

    const chips = Array.from(filterRoot.querySelectorAll('[data-filter]'));
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const note = document.querySelector('[data-filter-note]');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const value = chip.getAttribute('data-filter');
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });

        let visible = 0;
        cards.forEach(function (card) {
          const haystack = [
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' ');
          const matched = value === 'all' || haystack.includes(value);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (note) {
          note.textContent = '当前筛选显示 ' + visible + ' 部影片。';
        }
      });
    });
  }

  function setupImageFallbacks(root) {
    const scope = root || document;
    scope.querySelectorAll('img').forEach(function (image) {
      if (image.dataset.fallbackReady === '1') {
        return;
      }

      image.dataset.fallbackReady = '1';
      image.addEventListener('error', function () {
        const fallbackTitle = image.getAttribute('alt') || '精选影片';
        const wrapper = image.parentElement;
        if (wrapper) {
          wrapper.classList.add('image-fallback');
          wrapper.setAttribute('data-fallback-title', fallbackTitle);
        }
      });
    });
  }

  function setupBackTop() {
    const button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 520);
    });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupAllSearches();
    setupFilters();
    setupImageFallbacks(document);
    setupBackTop();
  });
})();
