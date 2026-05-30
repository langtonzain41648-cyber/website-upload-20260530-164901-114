(function () {
    function attachPlayer(player) {
        var video = player.querySelector('video[data-src]');
        var button = player.querySelector('[data-play-button]');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-src');
        var hlsInstance = null;
        var prepared = false;

        function prepareAndPlay() {
            if (!source) {
                return;
            }

            player.classList.add('is-loading');
            video.controls = true;

            if (!prepared) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play().catch(function () {});
                    }, { once: true });
                } else {
                    video.src = source;
                    video.play().catch(function () {});
                }

                prepared = true;
            } else {
                video.play().catch(function () {});
            }

            player.classList.add('is-playing');
            player.classList.remove('is-loading');
        }

        button.addEventListener('click', prepareAndPlay);
        video.addEventListener('click', function () {
            if (video.paused) {
                prepareAndPlay();
            } else {
                video.pause();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();
