(function () {
  function init(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var loading = document.querySelector("[data-player-loading]");
    var error = document.querySelector("[data-player-error]");
    var hls = null;
    var started = false;

    if (!video || !cover || !videoUrl) {
      return;
    }

    function showLoading(value) {
      if (loading) {
        loading.hidden = !value;
      }
    }

    function showError() {
      showLoading(false);
      if (error) {
        error.hidden = false;
      }
    }

    function hideCover() {
      cover.classList.add("is-hidden");
    }

    function playVideo() {
      hideCover();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    function loadVideo() {
      if (started) {
        playVideo();
        return;
      }

      started = true;
      showLoading(true);

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
        video.addEventListener("loadedmetadata", function () {
          showLoading(false);
          playVideo();
        }, { once: true });
        video.addEventListener("error", showError, { once: true });
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          showLoading(false);
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showError();
        });
        return;
      }

      showError();
    }

    cover.addEventListener("click", loadVideo);
    video.addEventListener("play", hideCover);
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
})();
