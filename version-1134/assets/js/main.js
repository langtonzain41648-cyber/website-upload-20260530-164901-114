(() => {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", () => {
            mobilePanel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", mobilePanel.classList.contains("is-open"));
        });
    }

    document.querySelectorAll("[data-search-form]").forEach((form) => {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const input = form.querySelector("input[name='q']");
            const query = input ? input.value.trim() : "";
            const prefix = form.getAttribute("data-prefix") || "./";
            const target = prefix + "search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
            window.location.href = target;
        });
    });

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        const previous = hero.querySelector("[data-hero-prev]");
        const next = hero.querySelector("[data-hero-next]");
        let current = 0;
        let timer = null;

        const activate = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        const start = () => {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(() => activate(current + 1), 5000);
        };

        if (slides.length > 1) {
            previous && previous.addEventListener("click", () => {
                activate(current - 1);
                start();
            });
            next && next.addEventListener("click", () => {
                activate(current + 1);
                start();
            });
            dots.forEach((dot) => {
                dot.addEventListener("click", () => {
                    activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                    start();
                });
            });
            start();
        }
    }

    document.querySelectorAll("[data-card-filter]").forEach((panel) => {
        const section = panel.closest("section") || document;
        const cards = Array.from(section.querySelectorAll(".movie-card"));
        const keywordInput = panel.querySelector("[data-filter-keyword]");
        const typeSelect = panel.querySelector("[data-filter-type]");
        const regionSelect = panel.querySelector("[data-filter-region]");
        const resetButton = panel.querySelector("[data-filter-reset]");
        const empty = section.querySelector("[data-filter-empty]");

        const normalize = (value) => String(value || "").trim().toLowerCase();

        const filter = () => {
            const keyword = normalize(keywordInput && keywordInput.value);
            const type = normalize(typeSelect && typeSelect.value);
            const region = normalize(regionSelect && regionSelect.value);
            let visible = 0;

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" "));
                const typeMatch = !type || normalize(card.dataset.type) === type;
                const regionMatch = !region || normalize(card.dataset.region) === region;
                const keywordMatch = !keyword || haystack.includes(keyword);
                const show = typeMatch && regionMatch && keywordMatch;
                card.hidden = !show;
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        };

        [keywordInput, typeSelect, regionSelect].forEach((element) => {
            if (element) {
                element.addEventListener("input", filter);
                element.addEventListener("change", filter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", () => {
                if (keywordInput) {
                    keywordInput.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                filter();
            });
        }
    });
})();
