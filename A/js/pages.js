/* ============================================
   NJKVintage — Frontend Pages
   ============================================ */
window.Pages = (function () {

    /* ---- HOME PAGE ---- */
    function home() {
        var products = Store.getProducts();
        var newProducts = products.filter(function (p) { return p.isNew; }).slice(0, 4);
        var saleProducts = products.filter(function (p) { return p.isSale; }).slice(0, 4);
        var bestSellers = products.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 4);
        var categories = AppData.categories;

        return '<div class="hero">' +
            '<div class="hero-bg"></div>' +
            '<div class="hero-content">' +
            '<div class="hero-text animate-in">' +
            '<div class="hero-badge">✨ New Collection 2026</div>' +
            '<h1>สไตล์ที่เป็น<span>คุณ</span></h1>' +
            '<p>ค้นพบคอลเลกชันแฟชั่นพรีเมียม ที่ออกแบบมาเพื่อคุณโดยเฉพาะ ด้วยวัสดุคุณภาพระดับสูงและดีไซน์ที่ทันสมัย</p>' +
            '<div class="hero-buttons">' +
            '<a href="#/products" class="btn btn-primary btn-lg">SHOP NOW</a>' +

            '</div>' +

            '</div>' +
            '<div class="hero-image animate-in">' +
            '<div class="hero-image-card"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<section class="section"><div class="container">' +
            '<div class="section-header"><h2>หมวดหมู่สินค้า</h2><p>เลือกช้อปตามหมวดหมู่ที่คุณชื่นชอบ</p></div>' +
            '<div class="categories-grid">' +
            categories.map(function (c) {
                return '<a href="#/products/' + c.id + '" class="category-card animate-in">' +
                    '<img src="' + c.image + '" alt="' + c.name + '" loading="lazy">' +
                    '<div class="cat-overlay"><div><div class="cat-name">' + c.name + '</div><div class="cat-count">' + c.count + ' รายการ</div></div></div>' +
                    '</a>';
            }).join('') +
            '</div>' +
            '</div></section>' +

            '<section class="section" style="background:var(--color-surface-alt)"><div class="container">' +
            '<div class="section-header"><h2>สินค้ามาใหม่</h2><p>อัปเดตก่อนใคร กับคอลเลกชันล่าสุด</p></div>' +
            Components.productGrid(newProducts) +
            '<div style="text-align:center;margin-top:32px"><a href="#/products/new" class="btn btn-secondary">ดูทั้งหมด →</a></div>' +
            '</div></section>' +

            '<section class="section"><div class="container">' +
            '<div class="section-header"><h2>🔥 สินค้าขายดี</h2><p>สินค้ายอดนิยมที่ลูกค้าเลือกมากที่สุด</p></div>' +
            Components.productGrid(bestSellers) +
            '</div></section>' +

            '<section class="section" style="background:var(--color-surface-alt)"><div class="container">' +
            '<div class="section-header"><h2>🏷️ สินค้าลดราคา</h2><p>ดีลพิเศษ ราคาจัดหนัก ช้อปเลย!</p></div>' +
            Components.productGrid(saleProducts) +
            '<div style="text-align:center;margin-top:32px"><a href="#/products/sale" class="btn btn-accent">ดูสินค้าลดราคาทั้งหมด →</a></div>' +
            '</div></section>' +

            '<section class="section"><div class="container">' +
            '<div class="section-header"><h2>💡 แนะนำสำหรับคุณ</h2><p>AI คัดสรรมาเพื่อคุณโดยเฉพาะ</p></div>' +
            Components.productGrid(getAIRecommendations()) +
            '</div></section>' +

            '<section class="section" style="background:linear-gradient(135deg, #1A1A1A, #2D2620); color:#fff;">' +
            '<div class="container" style="text-align:center;max-width:600px">' +
            '<h2 style="margin-bottom:12px;">รับส่วนลด 10% ทันที</h2>' +
            '<p style="opacity:0.7;margin-bottom:24px">สมัครรับข่าวสาร เพื่อรับโค้ดส่วนลดและอัปเดตคอลเลกชันใหม่ก่อนใคร</p>' +
            '<div style="display:flex;gap:12px;max-width:440px;margin:0 auto">' +
            '<input type="email" placeholder="อีเมลของคุณ" style="flex:1;padding:14px 20px;border:1px solid rgba(255,255,255,0.2);border-radius:50px;background:rgba(255,255,255,0.1);color:#fff;outline:none;">' +
            '<button class="btn btn-accent" onclick="Store.toast(\'สมัครรับข่าวสารสำเร็จ! รับโค้ด WELCOME10\',\'success\')">สมัคร</button>' +
            '</div>' +
            '</div>' +
            '</section>';
    }

    function getAIRecommendations() {
        var products = Store.getProducts();
        var cart = Store.getCart();
        var wishlist = Store.getWishlist();
        var interacted = cart.map(function (c) { return c.productId; }).concat(wishlist);
        var cats = {};
        interacted.forEach(function (pid) {
            var p = products.find(function (x) { return x.id === pid; });
            if (p) cats[p.category] = (cats[p.category] || 0) + 1;
        });
        var sorted;
        if (Object.keys(cats).length) {
            sorted = products.filter(function (p) { return !interacted.includes(p.id); })
                .sort(function (a, b) { return (cats[b.category] || 0) - (cats[a.category] || 0) || b.sold - a.sold; });
        } else {
            sorted = products.slice().sort(function (a, b) { return b.rating - a.rating; });
        }
        return sorted.slice(0, 4);
    }

    /* ---- PRODUCTS PAGE ---- */
    function productsPage(categoryFilter) {
        var products = Store.getProducts();
        var allColors = [];
        var allSizes = [];
        products.forEach(function (p) {
            p.colors.forEach(function (c) { if (allColors.indexOf(c) < 0) allColors.push(c); });
            p.sizes.forEach(function (s) { if (allSizes.indexOf(s) < 0) allSizes.push(s); });
        });

        var title = 'สินค้าทั้งหมด';
        if (categoryFilter === 'new') title = 'สินค้ามาใหม่';
        else if (categoryFilter === 'sale') title = 'สินค้าลดราคา';
        else if (categoryFilter) {
            var cat = AppData.categories.find(function (c) { return c.id === categoryFilter; });
            if (cat) title = cat.name;
        }

        return '<div class="container"><div class="products-layout">' +
            '<aside class="filter-sidebar" id="filterSidebar">' +
            '<h3 style="font-size:1.1rem;font-weight:600;margin-bottom:20px;">ตัวกรอง</h3>' +
            '<div class="filter-group">' +
            '<h4>หมวดหมู่</h4>' +
            AppData.categories.map(function (c) {
                return '<label class="filter-option"><input type="checkbox" name="cat" value="' + c.id + '" ' + (categoryFilter === c.id ? 'checked' : '') + ' onchange="Pages.applyFilters()"> ' + c.name + '</label>';
            }).join('') +
            '</div>' +
            '<div class="filter-group">' +
            '<h4>สี</h4>' +
            '<div class="color-options">' +
            allColors.slice(0, 8).map(function (c) {
                var code = '#999';
                products.forEach(function (p) { var i = p.colors.indexOf(c); if (i >= 0) code = p.colorCodes[i]; });
                return '<div class="color-swatch" style="background:' + code + '" title="' + c + '" data-color="' + c + '" onclick="this.classList.toggle(\'active\');Pages.applyFilters()"></div>';
            }).join('') +
            '</div>' +
            '</div>' +
            '<div class="filter-group">' +
            '<h4>ไซส์</h4>' +
            allSizes.slice(0, 10).map(function (s) {
                return '<label class="filter-option"><input type="checkbox" name="size" value="' + s + '" onchange="Pages.applyFilters()"> ' + s + '</label>';
            }).join('') +
            '</div>' +
            '<div class="filter-group">' +
            '<h4>ราคา</h4>' +
            '<div class="price-range"><input type="number" id="priceMin" placeholder="ต่ำสุด" oninput="Pages.applyFilters()"><span>-</span><input type="number" id="priceMax" placeholder="สูงสุด" oninput="Pages.applyFilters()"></div>' +
            '</div>' +
            '<button class="btn btn-secondary btn-sm" onclick="Pages.clearFilters()" style="width:100%">ล้างตัวกรอง</button>' +
            '</aside>' +
            '<div>' +
            '<div class="products-header">' +
            '<h1>' + title + '</h1>' +
            '<div style="display:flex;gap:12px;align-items:center;">' +
            '<button class="btn btn-sm btn-secondary" onclick="document.getElementById(\'filterSidebar\').classList.toggle(\'open\')" style="display:none;" id="filterToggleBtn">☰ ตัวกรอง</button>' +
            '<select class="sort-select" id="sortSelect" onchange="Pages.applyFilters()">' +
            '<option value="popular">ยอดนิยม</option><option value="newest">ใหม่ล่าสุด</option>' +
            '<option value="price-low">ราคาต่ำ→สูง</option><option value="price-high">ราคาสูง→ต่ำ</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<div id="productsContainer"></div>' +
            '</div>' +
            '</div></div>';
    }

    function applyFilters() {
        var products = Store.getProducts();
        var checkedCats = Array.from(document.querySelectorAll('input[name=cat]:checked')).map(function (el) { return el.value; });
        var activeColors = Array.from(document.querySelectorAll('.color-swatch.active')).map(function (el) { return el.dataset.color; });
        var checkedSizes = Array.from(document.querySelectorAll('input[name=size]:checked')).map(function (el) { return el.value; });
        var minP = parseFloat(document.getElementById('priceMin')?.value) || 0;
        var maxP = parseFloat(document.getElementById('priceMax')?.value) || Infinity;
        var sort = document.getElementById('sortSelect')?.value || 'popular';

        var hash = window.location.hash;
        var isNew = hash.includes('/products/new');
        var isSale = hash.includes('/products/sale');

        var filtered = products.filter(function (p) {
            if (isNew && !p.isNew) return false;
            if (isSale && !p.isSale) return false;
            if (checkedCats.length && checkedCats.indexOf(p.category) < 0) return false;
            if (activeColors.length && !p.colors.some(function (c) { return activeColors.indexOf(c) >= 0; })) return false;
            if (checkedSizes.length && !p.sizes.some(function (s) { return checkedSizes.indexOf(s) >= 0; })) return false;
            if (p.price < minP || p.price > maxP) return false;
            return true;
        });

        if (sort === 'newest') filtered.sort(function (a, b) { return b.isNew - a.isNew || b.id - a.id; });
        else if (sort === 'price-low') filtered.sort(function (a, b) { return a.price - b.price; });
        else if (sort === 'price-high') filtered.sort(function (a, b) { return b.price - a.price; });
        else filtered.sort(function (a, b) { return b.sold - a.sold; });

        var container = document.getElementById('productsContainer');
        if (container) container.innerHTML = Components.productGrid(filtered);
    }

    function clearFilters() {
        document.querySelectorAll('input[name=cat]:checked, input[name=size]:checked').forEach(function (el) { el.checked = false; });
        document.querySelectorAll('.color-swatch.active').forEach(function (el) { el.classList.remove('active'); });
        var minEl = document.getElementById('priceMin'); if (minEl) minEl.value = '';
        var maxEl = document.getElementById('priceMax'); if (maxEl) maxEl.value = '';
        applyFilters();
    }

    /* ---- PRODUCT DETAIL PAGE ---- */
    function productDetail(id) {
        var products = Store.getProducts();
        var p = products.find(function (x) { return x.id === parseInt(id); });
        if (!p) return '<div class="container" style="margin-top:120px;text-align:center"><h2>ไม่พบสินค้า</h2><a href="#/products" class="btn btn-primary" style="margin-top:20px">กลับหน้าสินค้า</a></div>';

        var reviews = Store.getReviews().filter(function (r) { return r.productId === p.id; });
        var related = products.filter(function (x) { return x.category === p.category && x.id !== p.id; }).slice(0, 4);
        var isWished = Store.isInWishlist(p.id);
        var discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
        var catName = '';
        var cat = AppData.categories.find(function (c) { return c.id === p.category; });
        if (cat) catName = cat.name;

        return '<div class="product-detail">' +
            '<div class="product-gallery">' +
            '<div class="product-gallery-main"><img src="' + (p.images ? p.images[0] : p.image) + '" alt="' + p.name + '" id="mainImage"></div>' +
            (p.images && p.images.length > 1 ?
                '<div class="product-gallery-thumbs">' + p.images.map(function (img, i) {
                    return '<div class="thumb ' + (i === 0 ? 'active' : '') + '" onclick="Pages.changeImage(\'' + img + '\',this)"><img src="' + img + '" alt=""></div>';
                }).join('') + '</div>' : '') +
            '</div>' +
            '<div class="product-info">' +
            '<div class="breadcrumb"><a href="#/">หน้าแรก</a> / <a href="#/products/' + p.category + '">' + catName + '</a> / ' + p.name + '</div>' +
            '<h1>' + p.name + '</h1>' +
            '<div class="price-box">' +
            '<span class="price-current">฿' + p.price.toLocaleString() + '</span>' +
            (p.originalPrice ? '<span class="price-original">฿' + p.originalPrice.toLocaleString() + '</span><span style="color:var(--color-danger);font-weight:600">-' + discount + '%</span>' : '') +
            '</div>' +
            '<div class="product-card-rating" style="margin-bottom:20px;font-size:0.95rem"><span class="stars">' + Components.starsHtml(p.rating) + '</span> <span>' + p.rating + ' (' + p.reviews + ' รีวิว)</span></div>' +
            '<p class="description">' + p.description + '</p>' +

            '<div class="size-selector"><h4>ขนาด</h4><div class="size-options">' +
            p.sizes.map(function (s, i) { return '<button class="size-btn ' + (i === 0 ? 'active' : '') + '" onclick="Pages.selectSize(this)">' + s + '</button>'; }).join('') +
            '</div></div>' +

            '<div class="color-selector"><h4>สี: <span id="selectedColorName">' + p.colors[0] + '</span></h4><div class="color-options">' +
            p.colorCodes.map(function (code, i) {
                return '<div class="color-swatch ' + (i === 0 ? 'active' : '') + '" style="background:' + code + '" title="' + p.colors[i] + '" onclick="Pages.selectColor(this,\'' + p.colors[i] + '\')"></div>';
            }).join('') +
            '</div></div>' +

            '<div class="detail-actions">' +
            '<div class="qty-control"><button onclick="Pages.changeQty(-1)">−</button><span id="detailQty">1</span><button onclick="Pages.changeQty(1)">+</button></div>' +
            '<button class="btn btn-primary add-cart-btn" onclick="Pages.addToCartDetail(' + p.id + ')">เพิ่มลงตะกร้า</button>' +
            '<button class="wishlist-btn-detail ' + (isWished ? 'wishlisted' : '') + '" onclick="Pages.toggleWishDetail(' + p.id + ',this)">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (isWished ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '</button>' +
            '</div>' +

            '<div class="product-features">' +
            '<div class="product-feature"><div class="feat-icon">🚚</div>ส่งฟรีเมื่อซื้อ ฿1,500+</div>' +
            '<div class="product-feature"><div class="feat-icon">↩️</div>คืนได้ใน 30 วัน</div>' +
            '<div class="product-feature"><div class="feat-icon">✅</div>สินค้าแท้ 100%</div>' +
            '</div>' +

            '<div style="padding:16px 0;font-size:0.88rem;color:var(--color-text-secondary)">สินค้าคงเหลือ: <strong style="color:' + (p.stock < 10 ? 'var(--color-danger)' : 'var(--color-success)') + '">' + p.stock + '</strong> ชิ้น</div>' +
            '</div>' +
            '</div>' +

            '<div class="related-section">' +
            '<div class="reviews-section"><h2>รีวิวจากลูกค้า (' + reviews.length + ')</h2>' +
            (reviews.length ? reviews.map(function (r) {
                return '<div class="review-item"><div class="review-header"><div><span class="review-author">' + r.user + '</span> <span class="stars" style="margin-left:8px">' + Components.starsHtml(r.rating) + '</span></div><span class="review-date">' + r.date + '</span></div><p class="review-text">' + r.text + '</p></div>';
            }).join('') : '<p style="color:var(--color-text-secondary)">ยังไม่มีรีวิว</p>') +
            '</div>' +
            '</div>' +

            (related.length ? '<div class="related-section"><h2>สินค้าที่เกี่ยวข้อง</h2><div class="related-grid">' + related.map(Components.productCard).join('') + '</div></div>' : '');
    }

    function changeImage(src, thumb) {
        document.getElementById('mainImage').src = src;
        document.querySelectorAll('.product-gallery-thumbs .thumb').forEach(function (t) { t.classList.remove('active'); });
        if (thumb) thumb.classList.add('active');
    }
    function selectSize(btn) {
        document.querySelectorAll('.size-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
    }
    function selectColor(swatch, name) {
        document.querySelectorAll('.color-selector .color-swatch').forEach(function (s) { s.classList.remove('active'); });
        swatch.classList.add('active');
        var nameEl = document.getElementById('selectedColorName');
        if (nameEl) nameEl.textContent = name;
    }
    function changeQty(delta) {
        var el = document.getElementById('detailQty');
        var v = parseInt(el.textContent) + delta;
        if (v < 1) v = 1; if (v > 99) v = 99;
        el.textContent = v;
    }
    function addToCartDetail(productId) {
        var products = Store.getProducts();
        var p = products.find(function (x) { return x.id === productId; });
        var size = document.querySelector('.size-btn.active')?.textContent || p.sizes[0];
        var color = document.getElementById('selectedColorName')?.textContent || p.colors[0];
        var qty = parseInt(document.getElementById('detailQty')?.textContent) || 1;
        Store.addToCart(p, size, color, qty);
        Store.toast('เพิ่ม ' + p.name + ' ลงตะกร้าแล้ว (' + qty + ' ชิ้น)', 'success');
    }
    function toggleWishDetail(productId, btn) {
        Components.toggleWish(productId, null);
        var isNow = Store.isInWishlist(productId);
        btn.classList.toggle('wishlisted', isNow);
        var svg = btn.querySelector('path');
        if (svg) svg.setAttribute('fill', isNow ? 'currentColor' : 'none');
    }

    /* ---- CART PAGE ---- */
    function cartPage() {
        var cart = Store.getCart();
        if (!cart.length) {
            return '<div class="cart-page"><div class="cart-empty"><h2>🛒 ตะกร้าว่างเปล่า</h2><p>ยังไม่มีสินค้าในตะกร้า เริ่มช้อปกันเลย!</p><a href="#/products" class="btn btn-primary">เลือกซื้อสินค้า</a></div></div>';
        }
        var subtotal = Store.getCartTotal();
        var shipping = subtotal >= 1500 ? 0 : 100;

        return '<div class="cart-page"><h1>ตะกร้าสินค้า (' + cart.length + ' รายการ)</h1><div class="cart-layout">' +
            '<div class="cart-items">' + cart.map(function (item, i) {
                return '<div class="cart-item animate-in">' +
                    '<div class="cart-item-img"><img src="' + item.image + '" alt="' + item.name + '"></div>' +
                    '<div class="cart-item-info"><h3>' + item.name + '</h3><div class="item-meta">ไซส์: ' + item.size + ' | สี: ' + item.color + '</div>' +
                    '<div class="qty-control" style="margin-top:8px"><button onclick="Pages.cartUpdateQty(' + i + ',' + (item.qty - 1) + ')">−</button><span>' + item.qty + '</span><button onclick="Pages.cartUpdateQty(' + i + ',' + (item.qty + 1) + ')">+</button></div>' +
                    '<div class="item-price" style="margin-top:12px">฿' + (item.price * item.qty).toLocaleString() + '</div>' +
                    '</div>' +
                    '<button class="cart-item-remove" onclick="Pages.cartRemove(' + i + ')">✕</button>' +
                    '</div>';
            }).join('') + '</div>' +
            '<div class="cart-summary"><h3>สรุปคำสั่งซื้อ</h3>' +
            '<div class="summary-row"><span>ราคาสินค้า</span><span>฿' + subtotal.toLocaleString() + '</span></div>' +
            '<div class="summary-row"><span>ค่าจัดส่ง</span><span>' + (shipping ? '฿' + shipping : 'ฟรี') + '</span></div>' +
            '<div class="coupon-input"><input type="text" id="couponCode" placeholder="โค้ดส่วนลด"><button class="btn btn-sm btn-secondary" onclick="Pages.applyCoupon()">ใช้</button></div>' +
            '<div id="couponDiscount"></div>' +
            '<div class="summary-row total"><span>ยอดรวม</span><span id="cartGrandTotal">฿' + (subtotal + shipping).toLocaleString() + '</span></div>' +
            '<a href="#/checkout" class="btn btn-primary" style="width:100%;margin-top:16px">ดำเนินการชำระเงิน</a>' +
            '<a href="#/products" class="btn btn-secondary" style="width:100%;margin-top:8px">เลือกซื้อต่อ</a>' +
            '</div>' +
            '</div></div>';
    }
    function cartUpdateQty(i, qty) { Store.updateCartQty(i, qty); window.App.navigate(window.location.hash); }
    function cartRemove(i) { Store.removeFromCart(i); Store.toast('นำสินค้าออกจากตะกร้าแล้ว', 'info'); window.App.navigate(window.location.hash); }
    function applyCoupon() {
        var code = document.getElementById('couponCode')?.value;
        if (!code) return;
        var result = Store.applyCoupon(code, Store.getCartTotal());
        var el = document.getElementById('couponDiscount');
        if (result.success) {
            el.innerHTML = '<div class="summary-row" style="color:var(--color-success)"><span>ส่วนลด (' + result.coupon.code + ')</span><span>-฿' + result.discount.toLocaleString() + '</span></div>';
            var shipping = Store.getCartTotal() >= 1500 ? 0 : 100;
            document.getElementById('cartGrandTotal').textContent = '฿' + (Store.getCartTotal() + shipping - result.discount).toLocaleString();
            Store.toast('ใช้คูปอง ' + result.coupon.code + ' สำเร็จ!', 'success');
        } else {
            el.innerHTML = '<div style="color:var(--color-danger);font-size:0.85rem;padding:4px 0">' + result.message + '</div>';
        }
    }

    /* ---- CHECKOUT PAGE ---- */
    function checkoutPage() {
        var cart = Store.getCart();
        if (!cart.length) { window.location.hash = '#/cart'; return ''; }
        var subtotal = Store.getCartTotal();
        var shipping = subtotal >= 1500 ? 0 : 100;
        var total = subtotal + shipping;

        return '<div class="checkout-page"><h1>ชำระเงิน</h1><div class="checkout-layout">' +
            '<div>' +
            '<div class="checkout-section"><h3>📍 ที่อยู่จัดส่ง</h3><div class="form-grid">' +
            '<div class="form-group"><label>ชื่อ-นามสกุล</label><input type="text" id="coName" placeholder="ชื่อ นามสกุล"></div>' +
            '<div class="form-group"><label>เบอร์โทร</label><input type="tel" id="coPhone" placeholder="08x-xxx-xxxx"></div>' +
            '<div class="form-group full"><label>ที่อยู่</label><textarea id="coAddress" rows="2" placeholder="บ้านเลขที่ ซอย ถนน"></textarea></div>' +
            '<div class="form-group"><label>จังหวัด</label><select id="coProvince"><option>กรุงเทพมหานคร</option><option>เชียงใหม่</option><option>ชลบุรี</option><option>นครราชสีมา</option><option>ภูเก็ต</option><option>อื่นๆ</option></select></div>' +
            '<div class="form-group"><label>รหัสไปรษณีย์</label><input type="text" id="coPostal" placeholder="10XXX"></div>' +
            '</div></div>' +

            '<div class="checkout-section"><h3>💳 วิธีชำระเงิน</h3><div class="payment-methods">' +
            '<label class="payment-method active" onclick="Pages.selectPayment(\'promptpay\',this)"><input type="radio" name="payment" value="promptpay" checked><span class="pay-icon">🏦</span><div><strong>โอนเงิน / QR Code</strong><div style="font-size:0.82rem;color:var(--color-text-secondary)">ธนาคารกสิกรไทย</div></div></label>' +
            '<label class="payment-method" onclick="Pages.selectPayment(\'cod\',this)"><input type="radio" name="payment" value="cod"><span class="pay-icon">📦</span><div><strong>เก็บเงินปลายทาง</strong><div style="font-size:0.82rem;color:var(--color-text-secondary)">ชำระเมื่อได้รับสินค้า (+฿30)</div></div></label>' +
            '</div>' +
            '<div id="paymentDetail">' + bankQRHtml(total) + '</div>' +
            '</div>' +
            '</div>' +

            '<div class="cart-summary"><h3>สรุปคำสั่งซื้อ</h3>' +
            cart.map(function (item) {
                return '<div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-border)">' +
                    '<img src="' + item.image + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px">' +
                    '<div style="flex:1"><div style="font-size:0.85rem;font-weight:500">' + item.name + '</div><div style="font-size:0.78rem;color:var(--color-text-secondary)">' + item.size + ' / ' + item.color + ' × ' + item.qty + '</div></div>' +
                    '<div style="font-weight:600;font-size:0.88rem">฿' + (item.price * item.qty).toLocaleString() + '</div></div>';
            }).join('') +
            '<div class="summary-row" style="margin-top:12px"><span>ราคาสินค้า</span><span>฿' + subtotal.toLocaleString() + '</span></div>' +
            '<div class="summary-row"><span>ค่าจัดส่ง</span><span>' + (shipping ? '฿' + shipping : 'ฟรี') + '</span></div>' +
            '<div class="summary-row total"><span>ยอดรวม</span><span>฿' + total.toLocaleString() + '</span></div>' +
            '<button class="btn btn-primary" style="width:100%;margin-top:16px" onclick="Pages.placeOrder()">✓ ยืนยันคำสั่งซื้อ</button>' +
            '</div>' +
            '</div></div>';
    }

    function bankQRHtml(total) {
        var qrUrl = 'https://cdn.discordapp.com/attachments/1385236623372976198/1473369507933323441/IMG_8902.jpg?ex=6995f5c8&is=6994a448&hm=2d4de13f617ce724b10438f6051b82b2a90fcf1fb2c68db3b878dbb5586abc0d';
        return '<div style="text-align:center;padding:24px 0">' +
            '<div style="display:inline-block;background:#fff;padding:16px;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,0.08)">' +
            '<div style="background:#0A8F3D;color:#fff;padding:10px 24px;border-radius:8px;margin-bottom:16px;font-weight:600;font-size:0.95rem">🏦 ธนาคารกสิกรไทย (KBank)</div>' +
            '<img src="' + qrUrl + '" alt="QR Code" style="width:220px;height:220px;border-radius:8px;display:block;margin:0 auto">' +
            '<div style="margin-top:16px;padding:16px;background:#f8f9fa;border-radius:10px;text-align:left">' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem"><span style="color:#666">เลขบัญชี</span><strong style="color:#1A1A1A;font-family:monospace;font-size:1rem;letter-spacing:1px">197-3-87243-1</strong></div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem;border-top:1px solid #eee"><span style="color:#666">ชื่อบัญชี</span><strong style="color:#1A1A1A">เมธาพร ใหม่เลี้ยง</strong></div>' +
            '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.88rem;border-top:1px solid #eee"><span style="color:#666">ยอดชำระ</span><strong style="color:#0A8F3D;font-size:1.1rem">฿' + total.toLocaleString() + '</strong></div>' +
            '</div>' +
            '<p style="font-size:0.78rem;color:#999;margin-top:12px">สแกน QR Code หรือโอนเงินตามข้อมูลด้านบน</p>' +
            '</div></div>';
    }

    function selectPayment(method, el) {
        document.querySelectorAll('.payment-method').forEach(function (m) { m.classList.remove('active'); });
        el.classList.add('active');
        var detail = document.getElementById('paymentDetail');
        var total = Store.getCartTotal() + (Store.getCartTotal() >= 1500 ? 0 : 100) + (method === 'cod' ? 30 : 0);
        if (method === 'promptpay') {
            detail.innerHTML = bankQRHtml(total);
        } else {
            detail.innerHTML = '<div style="margin-top:16px;padding:16px;background:var(--color-surface-alt);border-radius:8px;font-size:0.88rem"><p>💡 ชำระเงินเมื่อได้รับสินค้า</p><p style="color:var(--color-text-secondary);margin-top:4px">มีค่าธรรมเนียมเพิ่ม ฿30</p></div>';
        }
    }

    function placeOrder() {
        var name = document.getElementById('coName')?.value;
        var phone = document.getElementById('coPhone')?.value;
        if (!name || !phone) { Store.toast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
        var cart = Store.getCart();
        var payment = document.querySelector('input[name=payment]:checked')?.value || 'promptpay';
        var order = {
            id: 'ORD-' + Date.now(),
            items: cart,
            total: Store.getCartTotal() + (Store.getCartTotal() >= 1500 ? 0 : 100),
            status: payment === 'cod' ? 'pending' : 'paid',
            date: new Date().toISOString().split('T')[0],
            address: name + ', ' + phone + ', ' + (document.getElementById('coAddress')?.value || ''),
            payment: payment
        };
        Store.addOrder(order);
        Store.clearCart();
        window.location.hash = '#/order-success/' + order.id;
    }

    function orderSuccess(orderId) {
        return '<div class="order-success animate-in"><div class="success-icon">🎉</div><h1>สั่งซื้อสำเร็จ!</h1><p>หมายเลขคำสั่งซื้อ: <strong>' + orderId + '</strong></p><p>ขอบคุณที่เลือกช้อปกับ NJKVintage</p><a href="#/" class="btn btn-primary" style="margin-top:16px">กลับหน้าแรก</a><a href="#/products" class="btn btn-secondary" style="margin-top:8px;margin-left:12px">ช้อปต่อ</a></div>';
    }

    /* ---- AUTH PAGE ---- */
    function loginPage() {
        return '<div class="auth-page"><div class="auth-card animate-in">' +
            '<h1>NJKVintage</h1><p class="auth-subtitle">เข้าสู่ระบบเพื่อประสบการณ์ช้อปปิ้งที่ดีกว่า</p>' +
            '<div class="auth-tabs"><div class="auth-tab active" onclick="Pages.authTab(\'login\',this)">เข้าสู่ระบบ</div><div class="auth-tab" onclick="Pages.authTab(\'register\',this)">สมัครสมาชิก</div></div>' +
            '<div id="authForm">' + loginForm() + '</div>' +
            '</div></div>';
    }
    function loginForm() {
        return '<form class="auth-form" onsubmit="Pages.doLogin(event)">' +
            '<div class="form-group"><label>อีเมล</label><input type="email" id="loginEmail" required placeholder="your@email.com"></div>' +
            '<div class="form-group"><label>รหัสผ่าน</label><input type="password" id="loginPass" required placeholder="••••••••"></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%">เข้าสู่ระบบ</button>' +
            '</form>' +
            '<div class="auth-divider">หรือ</div>' +
            '<a href="#/admin/login" class="btn btn-secondary" style="width:100%">🔑 เข้าสู่ระบบแอดมิน</a>';
    }
    function registerForm() {
        return '<form class="auth-form" onsubmit="Pages.doRegister(event)">' +
            '<div class="form-group"><label>ชื่อ-นามสกุล</label><input type="text" id="regName" required placeholder="ชื่อ นามสกุล"></div>' +
            '<div class="form-group"><label>อีเมล</label><input type="email" id="regEmail" required placeholder="your@email.com"></div>' +
            '<div class="form-group"><label>รหัสผ่าน</label><input type="password" id="regPass" required placeholder="อย่างน้อย 6 ตัวอักษร"></div>' +
            '<div class="form-group"><label>ยืนยันรหัสผ่าน</label><input type="password" id="regPassConfirm" required placeholder="ยืนยันรหัสผ่าน"></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%">สมัครสมาชิก</button>' +
            '</form>';
    }
    function authTab(tab, el) {
        document.querySelectorAll('.auth-tab').forEach(function (t) { t.classList.remove('active'); });
        el.classList.add('active');
        document.getElementById('authForm').innerHTML = tab === 'login' ? loginForm() : registerForm();
    }
    function doLogin(e) {
        e.preventDefault();
        var email = document.getElementById('loginEmail').value;
        var pass = document.getElementById('loginPass').value;
        var result = Store.login(email, pass);
        if (result.success) { Store.toast('เข้าสู่ระบบสำเร็จ!', 'success'); window.location.hash = '#/'; }
        else { Store.toast(result.message, 'error'); }
    }
    function doRegister(e) {
        e.preventDefault();
        var name = document.getElementById('regName').value;
        var email = document.getElementById('regEmail').value;
        var pass = document.getElementById('regPass').value;
        var confirm = document.getElementById('regPassConfirm').value;
        if (pass !== confirm) { Store.toast('รหัสผ่านไม่ตรงกัน', 'error'); return; }
        if (pass.length < 6) { Store.toast('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 'error'); return; }
        var result = Store.register(name, email, pass);
        if (result.success) { Store.toast('สมัครสมาชิกสำเร็จ!', 'success'); window.location.hash = '#/'; }
        else { Store.toast(result.message, 'error'); }
    }

    /* ---- WISHLIST PAGE ---- */
    function wishlistPage() {
        var ids = Store.getWishlist();
        var products = Store.getProducts();
        var items = ids.map(function (id) { return products.find(function (p) { return p.id === id; }); }).filter(Boolean);
        return '<div class="wishlist-page"><h1>❤️ Wishlist (' + items.length + ' รายการ)</h1>' +
            (items.length ? '<div class="wishlist-grid">' + items.map(Components.productCard).join('') + '</div>'
                : '<div class="wishlist-empty"><h2>💔 ยังไม่มีสินค้าใน Wishlist</h2><p style="margin:12px 0 24px">กดรูปหัวใจเพื่อเพิ่มสินค้าที่ชอบ</p><a href="#/products" class="btn btn-primary">เลือกซื้อสินค้า</a></div>') +
            '</div>';
    }

    /* ---- LOOKBOOK PAGE ---- */


    return {
        home, productsPage, applyFilters, clearFilters,
        productDetail, changeImage, selectSize, selectColor, changeQty, addToCartDetail, toggleWishDetail,
        cartPage, cartUpdateQty, cartRemove, applyCoupon,
        checkoutPage, selectPayment, placeOrder, orderSuccess,
        loginPage, authTab, doLogin, doRegister,
        wishlistPage
    };
})();
