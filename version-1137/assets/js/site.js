(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-menu-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === active);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        inputs.forEach(function (input) {
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
            function apply(value) {
                var terms = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var matched = terms.every(function (term) {
                        return haystack.indexOf(term) !== -1;
                    });
                    card.classList.toggle("is-hidden", !matched);
                });
            }
            input.addEventListener("input", function () {
                apply(input.value);
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (input.hasAttribute("data-query-input") && q) {
                input.value = q;
                apply(q);
            }
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video.movie-player");
            var button = shell.querySelector("[data-play-button]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream") || "";
            var hlsInstance = null;

            if (stream && window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else if (stream && video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            }

            function playVideo() {
                var attempt = video.play();
                if (attempt && typeof attempt.then === "function") {
                    attempt.then(function () {
                        shell.classList.add("is-playing");
                    }).catch(function () {
                        shell.classList.remove("is-playing");
                    });
                } else {
                    shell.classList.add("is-playing");
                }
            }

            if (button) {
                button.addEventListener("click", playVideo);
            }
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            video.addEventListener("pause", function () {
                shell.classList.remove("is-playing");
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
