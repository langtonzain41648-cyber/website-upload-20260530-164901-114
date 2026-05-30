(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === index);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var genreSelect = panel.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-result]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query && input && !input.value) {
      input.value = query;
    }

    function matches(card) {
      var q = text(input && input.value);
      var y = yearSelect && yearSelect.value;
      var r = regionSelect && regionSelect.value;
      var g = genreSelect && genreSelect.value;
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-category")
      ].map(text).join(" ");

      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (y && card.getAttribute("data-year") !== y) {
        return false;
      }
      if (r && text(card.getAttribute("data-region")).indexOf(text(r)) === -1) {
        return false;
      }
      if (g) {
        var genre = text(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
        if (genre.indexOf(text(g)) === -1) {
          return false;
        }
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, yearSelect, regionSelect, genreSelect].forEach(function (node) {
      if (!node) {
        return;
      }
      node.addEventListener("input", apply);
      node.addEventListener("change", apply);
    });

    apply();
  }

  ready(function () {
    initNav();
    initHero();
    initFilters();
  });
})();
