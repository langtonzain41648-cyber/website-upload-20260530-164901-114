import { H as Hls } from './hls.js';

function initializeVideo(video) {
  const source = video.getAttribute('data-hls-src');
  const wrapper = video.closest('[data-player-wrap]');
  const overlay = wrapper ? wrapper.querySelector('[data-player-overlay]') : null;
  const message = wrapper ? wrapper.querySelector('[data-player-message]') : null;
  let hls = null;
  let initialized = false;

  function showMessage(text) {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.classList.add('is-visible');
  }

  function hideMessage() {
    if (message) {
      message.classList.remove('is-visible');
    }
  }

  function attachSource() {
    if (initialized || !source) {
      return;
    }

    initialized = true;
    hideMessage();

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          showMessage('网络错误，请检查网络连接后重试。');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          showMessage('媒体错误，正在尝试恢复播放。');
          hls.recoverMediaError();
          return;
        }

        showMessage('无法加载视频，请稍后重试。');
        hls.destroy();
      });
    } else {
      showMessage('您的浏览器不支持 HLS 视频播放。');
    }
  }

  function play() {
    attachSource();
    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        showMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
  }

  if (overlay) {
    overlay.addEventListener('click', function () {
      overlay.classList.add('is-hidden');
      play();
    });
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });

  video.addEventListener('error', function () {
    showMessage('视频播放出现错误，请稍后再试。');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('video[data-hls-src]').forEach(initializeVideo);
});
