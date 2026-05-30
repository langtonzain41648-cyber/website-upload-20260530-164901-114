(function () {
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');

  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    var showSlide = function (next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var homeSearch = document.querySelector('[data-home-search]');

  if (homeSearch) {
    homeSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = homeSearch.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var url = './movies.html';

      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }

      window.location.href = url;
    });
  }

  var listSearch = document.querySelector('[data-list-search]');
  var cardList = document.querySelector('[data-card-list]');

  if (listSearch && cardList) {
    var searchInput = listSearch.querySelector('input');
    var cards = Array.prototype.slice.call(cardList.querySelectorAll('.js-movie-card'));

    var applyFilter = function () {
      var value = searchInput ? searchInput.value.trim().toLowerCase() : '';

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', value && haystack.indexOf(value) === -1);
      });
    };

    listSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');

      if (q) {
        searchInput.value = q;
        applyFilter();
      }
    }
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var src = player.getAttribute('data-src');
    var ready = false;
    var hls = null;

    var bindVideo = function () {
      if (!video || !src || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }

      ready = true;
    };

    var startVideo = function () {
      bindVideo();
      player.classList.add('is-playing');

      if (video) {
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
