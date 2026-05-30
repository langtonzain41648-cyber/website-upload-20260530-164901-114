(function () {
  var hlsLoader = null;

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHls(callback, fail) {
    if (window.Hls) {
      callback(window.Hls);
      return;
    }
    if (hlsLoader) {
      hlsLoader.addEventListener("load", function () {
        callback(window.Hls);
      });
      hlsLoader.addEventListener("error", fail);
      return;
    }
    hlsLoader = document.createElement("script");
    hlsLoader.src = "https://cdn.jsdelivr.net/npm/hls.js@1.6.2/dist/hls.min.js";
    hlsLoader.async = true;
    hlsLoader.onload = function () {
      callback(window.Hls);
    };
    hlsLoader.onerror = fail;
    document.head.appendChild(hlsLoader);
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-play-url]");
    var message = document.querySelector("[data-player-message]");
    if (!video || !button) {
      return;
    }

    var source = button.getAttribute("data-play-url");
    var attached = false;
    var hls = null;

    function setMessage(value) {
      if (message) {
        message.textContent = value || "";
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setMessage("请再次点击播放");
        });
      }
    }

    function attachWithHls(Hls) {
      if (!Hls || !Hls.isSupported()) {
        video.src = source;
        video.load();
        playVideo();
        return;
      }
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage("");
        playVideo();
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage("播放暂时不可用，请稍后再试");
        }
      });
    }

    function attachSource() {
      if (attached || !source) {
        playVideo();
        return;
      }
      attached = true;
      setMessage("正在加载");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        video.load();
        return;
      }

      loadHls(attachWithHls, function () {
        setMessage("播放暂时不可用，请稍后再试");
      });
    }

    function start() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      attachSource();
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (!video.ended && overlay) {
        overlay.classList.remove("is-hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(initPlayer);
})();
