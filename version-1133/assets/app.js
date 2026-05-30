(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  const queryParams = new URLSearchParams(window.location.search);
  const initialQuery = queryParams.get('q') || '';

  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const input = panel.querySelector('.catalog-search-input');
    const selects = Array.from(panel.querySelectorAll('.filter-select'));
    const list = document.querySelector('[data-card-list]');
    const empty = document.querySelector('[data-empty-state]');
    if (!list || !input) return;

    if (initialQuery) {
      input.value = initialQuery;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const apply = () => {
      const text = normalize(input.value);
      const active = {};
      selects.forEach((select) => {
        active[select.dataset.filter] = normalize(select.value);
      });

      let visible = 0;
      cards.forEach((card) => {
        const cardText = normalize(card.dataset.text);
        const matchedText = !text || cardText.includes(text);
        const matchedRegion = !active.region || normalize(card.dataset.region) === active.region;
        const matchedType = !active.type || normalize(card.dataset.type) === active.type;
        const matchedYear = !active.year || normalize(card.dataset.year) === active.year;
        const matched = matchedText && matchedRegion && matchedType && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    input.addEventListener('input', apply);
    selects.forEach((select) => select.addEventListener('change', apply));
    apply();
  });

  const hlsLoader = (() => {
    let promise = null;
    return () => {
      if (window.Hls) return Promise.resolve(window.Hls);
      if (!promise) {
        promise = new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
          script.onload = () => resolve(window.Hls);
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      return promise;
    };
  })();

  document.querySelectorAll('[data-player]').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play]');
    if (!video || !button) return;

    const url = video.dataset.stream;
    let ready = false;

    const start = async () => {
      if (!url) return;
      button.classList.add('is-hidden');

      if (!ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          ready = true;
        } else {
          try {
            const Hls = await hlsLoader();
            if (Hls && Hls.isSupported()) {
              const hls = new Hls({ enableWorker: true });
              hls.loadSource(url);
              hls.attachMedia(video);
              ready = true;
            } else {
              video.src = url;
              ready = true;
            }
          } catch (error) {
            video.src = url;
            ready = true;
          }
        }
      }

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          button.classList.remove('is-hidden');
        });
      }
    };

    button.addEventListener('click', start);
    player.addEventListener('click', (event) => {
      if (event.target === player) start();
    });
  });
})();
