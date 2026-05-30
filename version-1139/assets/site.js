(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var value = input ? input.value.trim() : '';
            var target = './search.html';

            if (value) {
                target += '?q=' + encodeURIComponent(value);
            }

            window.location.href = target;
        });
    });

    document.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === heroIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === heroIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showHero(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    var localSearch = document.querySelector('[data-local-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var yearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-year]'));
    var activeCategory = 'all';
    var activeYear = 'all';

    if (localSearch && localSearch.hasAttribute('data-url-query')) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            localSearch.value = q;
        }
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        var query = localSearch ? normalize(localSearch.value) : '';

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-keywords')
            ].join(' '));
            var category = card.getAttribute('data-category') || '';
            var year = card.getAttribute('data-year') || '';
            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesCategory = activeCategory === 'all' || category === activeCategory;
            var matchesYear = activeYear === 'all' || year === activeYear;

            card.style.display = matchesQuery && matchesCategory && matchesYear ? '' : 'none';
        });
    }

    if (localSearch) {
        localSearch.addEventListener('input', applyFilters);
    }

    categoryButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeCategory = button.getAttribute('data-filter-category') || 'all';
            categoryButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    yearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeYear = button.getAttribute('data-filter-year') || 'all';
            yearButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            applyFilters();
        });
    });

    applyFilters();
})();
