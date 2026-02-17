/* ============================================
   NJKVintage — SPA Router & App Init
   ============================================ */
window.App = (function () {
    var app = document.getElementById('app');

    function navigate(hash) {
        hash = hash || window.location.hash || '#/';
        var path = hash.replace('#', '');
        var parts = path.split('/').filter(Boolean);
        var footer = document.getElementById('siteFooter');
        var navbar = document.getElementById('navbar');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Show/hide footer for admin
        var isAdmin = parts[0] === 'admin';
        if (footer) footer.style.display = isAdmin ? 'none' : '';

        // Route
        var html = '';
        if (parts[0] === 'admin') {
            if (parts[1] === 'login') {
                html = AdminPages.loginPage();
            } else if (!Store.isAdmin()) {
                window.location.hash = '#/admin/login';
                return;
            } else if (parts[1] === 'dashboard' || !parts[1]) {
                html = AdminPages.dashboard();
            } else if (parts[1] === 'products') {
                html = AdminPages.productsManagement();
            } else if (parts[1] === 'categories') {
                html = AdminPages.categoriesManagement();
            } else if (parts[1] === 'orders') {
                html = AdminPages.ordersManagement();
            } else if (parts[1] === 'coupons') {
                html = AdminPages.couponsManagement();
            } else if (parts[1] === 'users') {
                html = AdminPages.usersManagement();
            } else if (parts[1] === 'reviews') {
                html = AdminPages.reviewsManagement();
            } else {
                html = AdminPages.dashboard();
            }
        } else if (parts[0] === 'products') {
            html = Pages.productsPage(parts[1] || null);
        } else if (parts[0] === 'product') {
            html = Pages.productDetail(parts[1]);
        } else if (parts[0] === 'cart') {
            html = Pages.cartPage();
        } else if (parts[0] === 'checkout') {
            html = Pages.checkoutPage();
        } else if (parts[0] === 'order-success') {
            html = Pages.orderSuccess(parts[1] || '');
        } else if (parts[0] === 'login' || parts[0] === 'register') {
            html = Pages.loginPage();
        } else if (parts[0] === 'wishlist') {
            html = Pages.wishlistPage();

        } else {
            html = Pages.home();
        }

        app.innerHTML = html;

        // Post-render hooks
        if (parts[0] === 'products') {
            Pages.applyFilters();
            // Show filter toggle on mobile
            var fb = document.getElementById('filterToggleBtn');
            if (fb && window.innerWidth <= 768) fb.style.display = 'inline-flex';
        }
        if (isAdmin && window.innerWidth <= 768) {
            var mb = document.getElementById('adminMenuBtn');
            if (mb) mb.style.display = 'inline-flex';
        }

        // Update badges
        Store.updateBadges();

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(function (link) {
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href === hash || (href === '#/' && hash === '#/') || (href !== '#/' && hash.startsWith(href))) {
                link.classList.add('active');
            }
        });

        // Trigger animations
        requestAnimationFrame(function () {
            document.querySelectorAll('.animate-in').forEach(function (el, i) {
                el.style.animationDelay = (i * 0.08) + 's';
            });
        });
    }

    function init() {
        // Apply saved theme
        Store.setTheme(Store.getTheme());

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', function () {
            Store.toggleTheme();
        });

        // Search
        var searchToggle = document.getElementById('searchToggle');
        var searchOverlay = document.getElementById('searchOverlay');
        var searchInput = document.getElementById('searchInput');
        var searchClose = document.getElementById('searchClose');
        var searchSuggestions = document.getElementById('searchSuggestions');

        searchToggle.addEventListener('click', function () {
            searchOverlay.classList.toggle('active');
            if (searchOverlay.classList.contains('active')) searchInput.focus();
        });
        searchClose.addEventListener('click', function () {
            searchOverlay.classList.remove('active');
            searchInput.value = '';
            searchSuggestions.classList.remove('active');
        });
        searchInput.addEventListener('input', function () {
            var q = this.value.trim().toLowerCase();
            if (q.length < 1) { searchSuggestions.classList.remove('active'); return; }
            var products = Store.getProducts();
            var matches = products.filter(function (p) {
                return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
            }).slice(0, 5);
            if (matches.length) {
                searchSuggestions.innerHTML = matches.map(function (p) {
                    return '<a href="#/product/' + p.id + '" class="search-suggestion-item" onclick="document.getElementById(\'searchOverlay\').classList.remove(\'active\')">' +
                        '<img src="' + p.image + '" alt="">' +
                        '<div><div style="font-weight:500;font-size:0.88rem">' + p.name + '</div><div style="font-size:0.8rem;color:var(--color-text-secondary)">฿' + p.price.toLocaleString() + '</div></div>' +
                        '</a>';
                }).join('');
                searchSuggestions.classList.add('active');
            } else {
                searchSuggestions.innerHTML = '<div style="padding:16px;text-align:center;color:var(--color-text-secondary)">ไม่พบสินค้า "' + q + '"</div>';
                searchSuggestions.classList.add('active');
            }
        });
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                var q = this.value.trim();
                if (q) {
                    searchOverlay.classList.remove('active');
                    window.location.hash = '#/products';
                    setTimeout(function () {
                        var products = Store.getProducts().filter(function (p) {
                            return p.name.toLowerCase().includes(q.toLowerCase()) || p.description.toLowerCase().includes(q.toLowerCase());
                        });
                        var container = document.getElementById('productsContainer');
                        if (container) {
                            container.innerHTML = Components.productGrid(products);
                            var header = document.querySelector('.products-header h1');
                            if (header) header.textContent = 'ผลการค้นหา "' + q + '" (' + products.length + ' รายการ)';
                        }
                    }, 100);
                }
            }
        });

        // Hamburger
        document.getElementById('hamburger').addEventListener('click', function () {
            document.getElementById('navLinks').classList.toggle('open');
            this.classList.toggle('active');
        });

        // Navbar scroll effect
        window.addEventListener('scroll', function () {
            document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
        });

        // Listen to hash changes
        window.addEventListener('hashchange', function () {
            navigate(window.location.hash);
        });

        // Initial navigation
        navigate(window.location.hash);
    }

    // Start app
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { navigate: navigate };
})();
