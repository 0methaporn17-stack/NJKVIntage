/* ============================================
   NJKVintage — Shared Components
   ============================================ */
window.Components = (function () {

    function productCard(product) {
        const isWished = Store.isInWishlist(product.id);
        const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
        return '<div class="product-card animate-in">' +
            '<a href="#/product/' + product.id + '" class="product-card-img">' +
            '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy">' +
            '<div class="product-card-badges">' +
            (product.isNew ? '<span class="product-badge badge-new">NEW</span>' : '') +
            (product.isSale ? '<span class="product-badge badge-sale">-' + discount + '%</span>' : '') +
            '</div>' +
            '</a>' +
            '<div class="product-card-actions">' +
            '<button class="product-action-btn ' + (isWished ? 'wishlisted' : '') + '" onclick="event.preventDefault();Components.toggleWish(' + product.id + ',this)" title="Wishlist">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isWished ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' +
            '</button>' +
            '<button class="product-action-btn" onclick="event.preventDefault();Components.quickAdd(' + product.id + ')" title="เพิ่มลงตะกร้า">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
            '</button>' +
            '</div>' +
            '<a href="#/product/' + product.id + '" class="product-card-info">' +
            '<div class="product-card-name">' + product.name + '</div>' +
            '<div class="product-card-price">' +
            '<span class="current">฿' + product.price.toLocaleString() + '</span>' +
            (product.originalPrice ? '<span class="original">฿' + product.originalPrice.toLocaleString() + '</span>' : '') +
            (discount > 0 ? '<span class="discount">-' + discount + '%</span>' : '') +
            '</div>' +
            '<div class="product-card-rating"><span class="stars">' + starsHtml(product.rating) + '</span> <span>(' + product.reviews + ')</span></div>' +
            '</a>' +
            '</div>';
    }

    function starsHtml(rating) {
        let s = '';
        for (let i = 1; i <= 5; i++) {
            s += i <= Math.round(rating) ? '★' : '☆';
        }
        return s;
    }

    function toggleWish(productId, btn) {
        Store.toggleWishlist(productId);
        const isNow = Store.isInWishlist(productId);
        if (btn) {
            btn.classList.toggle('wishlisted', isNow);
            const svg = btn.querySelector('path');
            if (svg) svg.setAttribute('fill', isNow ? 'currentColor' : 'none');
        }
        Store.toast(isNow ? 'เพิ่มลง Wishlist แล้ว' : 'นำออกจาก Wishlist แล้ว', 'info');
    }

    function quickAdd(productId) {
        const products = Store.getProducts();
        const p = products.find(function (x) { return x.id === productId; });
        if (p) {
            Store.addToCart(p, p.sizes[0], p.colors[0], 1);
            Store.toast('เพิ่ม ' + p.name + ' ลงตะกร้าแล้ว', 'success');
        }
    }

    function formatPrice(n) {
        return '฿' + n.toLocaleString();
    }

    function productGrid(products) {
        if (!products.length) return '<div class="no-products"><h3>ไม่พบสินค้า</h3><p>ลองเปลี่ยนตัวกรองหรือคำค้นหา</p></div>';
        return '<div class="products-grid">' + products.map(productCard).join('') + '</div>';
    }

    return { productCard, starsHtml, toggleWish, quickAdd, formatPrice, productGrid };
})();
