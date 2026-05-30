const MoviePlayer = (() => {
    const start = ({ videoId, buttonId, source }) => {
        const video = document.getElementById(videoId);
        const button = document.getElementById(buttonId);
        let attached = false;
        let hls = null;

        if (!video || !button || !source) {
            return;
        }

        const attach = () => {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        };

        const play = () => {
            attach();
            button.classList.add("is-hidden");
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => {
                    button.classList.remove("is-hidden");
                });
            }
        };

        button.addEventListener("click", play);
        video.addEventListener("click", () => {
            if (!attached || video.paused) {
                play();
            }
        });
        video.addEventListener("play", () => button.classList.add("is-hidden"));
        video.addEventListener("pause", () => {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("pagehide", () => {
            if (hls) {
                hls.destroy();
            }
        });
    };

    return { start };
})();
