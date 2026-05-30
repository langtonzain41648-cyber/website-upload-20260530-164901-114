(() => {
    const data = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    const input = document.getElementById("site-search-input");
    const form = document.querySelector("[data-search-page-form]");
    const results = document.getElementById("search-results");
    const empty = document.getElementById("search-empty");
    const typeSelect = document.getElementById("search-type");
    const regionSelect = document.getElementById("search-region");
    const yearSelect = document.getElementById("search-year");

    if (!input || !form || !results || !empty) {
        return;
    }

    const normalize = (value) => String(value || "").trim().toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";

    const fillSelect = (select, values) => {
        if (!select) {
            return;
        }
        values.forEach((value) => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    };

    fillSelect(typeSelect, [...new Set(data.map((item) => item.type).filter(Boolean))].sort());
    fillSelect(regionSelect, [...new Set(data.map((item) => item.region).filter(Boolean))].sort().slice(0, 80));
    fillSelect(yearSelect, [...new Set(data.map((item) => item.year).filter(Boolean))].sort((a, b) => Number(b) - Number(a)).slice(0, 120));

    const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[char]);

    const safeUrl = (value) => String(value || "").replace(/[\r\n<>"']/g, "");

    const cardHtml = (movie) => `
        <article class="movie-card">
            <a class="movie-card-link" href="${safeUrl(movie.href)}">
                <div class="poster-wrap">
                    <img src="${safeUrl(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="poster-gradient"></span>
                    <span class="poster-play">▶</span>
                    <span class="poster-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.type)}</span>
                </div>
                <div class="movie-card-body">
                    <h3>${escapeHtml(movie.title)}</h3>
                    <p>${escapeHtml(movie.oneLine)}</p>
                    <div class="card-meta">
                        <span>${escapeHtml(movie.region)}</span>
                        <span>${escapeHtml(movie.genre)}</span>
                    </div>
                </div>
            </a>
            <a class="card-category" href="${safeUrl(movie.categoryHref)}">${escapeHtml(movie.categoryName)}</a>
        </article>`;

    const render = () => {
        const query = normalize(input.value);
        const type = normalize(typeSelect && typeSelect.value);
        const region = normalize(regionSelect && regionSelect.value);
        const year = normalize(yearSelect && yearSelect.value);

        if (!query && !type && !region && !year) {
            results.innerHTML = "";
            empty.textContent = "输入关键词开始搜索影片";
            empty.classList.add("is-visible");
            return;
        }

        const matched = data.filter((movie) => {
            const haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                movie.tags,
                movie.oneLine
            ].join(" "));
            const keywordMatch = !query || haystack.includes(query);
            const typeMatch = !type || normalize(movie.type) === type;
            const regionMatch = !region || normalize(movie.region) === region;
            const yearMatch = !year || normalize(movie.year) === year;
            return keywordMatch && typeMatch && regionMatch && yearMatch;
        }).slice(0, 120);

        results.innerHTML = matched.map(cardHtml).join("\n");
        empty.textContent = "没有找到匹配影片";
        empty.classList.toggle("is-visible", matched.length === 0);
    };

    input.value = initialQuery;
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = input.value.trim();
        const next = new URL(window.location.href);
        if (query) {
            next.searchParams.set("q", query);
        } else {
            next.searchParams.delete("q");
        }
        window.history.replaceState({}, "", next.toString());
        render();
    });

    [input, typeSelect, regionSelect, yearSelect].forEach((element) => {
        if (element) {
            element.addEventListener("input", render);
            element.addEventListener("change", render);
        }
    });

    render();
})();
