(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  function initHeroCarousel() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute("data-filter-scope") || "body";
      var scope = document.querySelector(scopeSelector) || document;
      var input = panel.querySelector("[data-filter-input]");
      var category = panel.querySelector("[data-filter-category]");
      var year = panel.querySelector("[data-filter-year]");
      var sort = panel.querySelector("[data-filter-sort]");
      var counter = document.querySelector(panel.getAttribute("data-counter") || "");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
      }

      function apply() {
        var query = normalize(input ? input.value : "");
        var categoryValue = category ? category.value : "";
        var yearValue = year ? year.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchesCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
          var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
          var visible = matchesQuery && matchesCategory && matchesYear;
          card.classList.toggle("hidden-by-filter", !visible);
          if (visible) {
            visibleCount += 1;
          }
        });

        if (sort) {
          var sorted = cards.slice().sort(function (a, b) {
            var mode = sort.value;
            if (mode === "year-desc") {
              return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
            }
            if (mode === "title-asc") {
              return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
            }
            return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
          });
          sorted.forEach(function (card) {
            card.parentNode.appendChild(card);
          });
        }

        if (counter) {
          counter.textContent = "当前显示 " + visibleCount + " 部影片";
        }
      }

      [input, category, year, sort].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function initSearchPage() {
    var searchRoot = document.querySelector("[data-search-page]");
    if (!searchRoot || !window.MOVIE_INDEX) {
      return;
    }

    var input = searchRoot.querySelector("[data-search-input]");
    var category = searchRoot.querySelector("[data-search-category]");
    var sort = searchRoot.querySelector("[data-search-sort]");
    var results = searchRoot.querySelector("[data-search-results]");
    var counter = searchRoot.querySelector("[data-search-counter]");
    var empty = searchRoot.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function buildCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join("");

      return [
        '<article class="movie-card" data-title="' + escapeHtml(item.title) + '" data-year="' + escapeHtml(item.year) + '" data-category="' + escapeHtml(item.categorySlug) + '" data-heat="' + escapeHtml(item.heat) + '">',
        '  <a class="movie-card-inner" href="' + escapeHtml(item.url) + '">',
        '    <div class="poster-frame">',
        '      <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '      <div class="poster-overlay">',
        '        <span class="pill cyan">' + escapeHtml(item.category) + '</span>',
        '        <span class="pill">' + escapeHtml(item.year) + '</span>',
        '      </div>',
        '    </div>',
        '    <div class="card-body">',
        '      <h2 class="card-title">' + escapeHtml(item.title) + '</h2>',
        '      <div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.genre) + '</span></div>',
        '      <p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
        '      <div class="card-tags" style="margin-top: 12px;">' + tags + '</div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join("\n");
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var categoryValue = category ? category.value : "";
      var list = window.MOVIE_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesCategory = !categoryValue || item.categorySlug === categoryValue;
        return matchesQuery && matchesCategory;
      });

      if (sort && sort.value === "year-desc") {
        list.sort(function (a, b) {
          return Number(b.year || 0) - Number(a.year || 0);
        });
      } else if (sort && sort.value === "title-asc") {
        list.sort(function (a, b) {
          return String(a.title || "").localeCompare(String(b.title || ""), "zh-Hans-CN");
        });
      } else {
        list.sort(function (a, b) {
          return Number(b.heat || 0) - Number(a.heat || 0);
        });
      }

      var limited = list.slice(0, 240);
      results.innerHTML = limited.map(buildCard).join("\n");
      counter.textContent = "找到 " + list.length + " 部影片" + (list.length > limited.length ? "，当前展示前 " + limited.length + " 部" : "");
      empty.style.display = list.length ? "none" : "block";
    }

    [input, category, sort].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-video-src]"));
    players.forEach(function (video) {
      var wrap = video.closest(".player-wrap");
      var panel = video.closest(".player-panel");
      var button = wrap ? wrap.querySelector("[data-play-button]") : null;
      var status = panel ? panel.querySelector("[data-player-status]") : null;
      var source = video.getAttribute("data-video-src");
      var hlsInstance = null;
      var started = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playVideo() {
        if (!source) {
          setStatus("暂未检测到可用播放地址。");
          return;
        }

        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        setStatus("正在准备高清播放...");

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().then(function () {
            setStatus("正在播放");
          }).catch(function () {
            setStatus("播放被浏览器拦截，请再次点击播放器开始观看。");
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().then(function () {
              setStatus("正在播放");
            }).catch(function () {
              setStatus("播放被浏览器拦截，请再次点击播放器开始观看。");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放源加载失败，请稍后刷新重试。");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
            }
          });
          return;
        }

        setStatus("当前浏览器不支持该视频格式，请使用新版 Chrome、Edge、Safari 或移动端浏览器。");
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }
      video.addEventListener("click", function () {
        if (!started) {
          playVideo();
        }
      });
    });
  }

  ready(function () {
    initMobileNav();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayers();
  });
}());
