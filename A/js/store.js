/* ============================================
   NJKVintage — State Management (localStorage)
   ============================================ */
window.Store = (function () {
    function get(key, fallback) {
        try { const v = localStorage.getItem('njkvintage_' + key); return v ? JSON.parse(v) : fallback; }
        catch (e) { return fallback; }
    }
    function set(key, val) { localStorage.setItem('njkvintage_' + key, JSON.stringify(val)); }

    // Cart
    function getCart() { return get('cart', []); }
    function addToCart(product, size, color, qty) {
        const cart = getCart();
        const existing = cart.find(i => i.productId === product.id && i.size === size && i.color === color);
        if (existing) { existing.qty += qty; }
        else { cart.push({ productId: product.id, name: product.name, image: product.image, price: product.price, originalPrice: product.originalPrice, size, color, qty }); }
        set('cart', cart); updateBadges(); return cart;
    }
    function updateCartQty(index, qty) {
        const cart = getCart();
        if (qty <= 0) { cart.splice(index, 1); } else { cart[index].qty = qty; }
        set('cart', cart); updateBadges(); return cart;
    }
    function removeFromCart(index) {
        const cart = getCart(); cart.splice(index, 1); set('cart', cart); updateBadges(); return cart;
    }
    function clearCart() { set('cart', []); updateBadges(); }
    function getCartTotal() {
        return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
    }
    function getCartCount() {
        return getCart().reduce((sum, i) => sum + i.qty, 0);
    }

    // Wishlist
    function getWishlist() { return get('wishlist', []); }
    function toggleWishlist(productId) {
        let wl = getWishlist();
        const idx = wl.indexOf(productId);
        if (idx >= 0) { wl.splice(idx, 1); } else { wl.push(productId); }
        set('wishlist', wl); updateBadges(); return wl;
    }
    function isInWishlist(productId) { return getWishlist().includes(productId); }

    // Auth
    function getUser() { return get('user', null); }
    function login(email, password) {
        const users = get('users', []);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) { set('user', { id: user.id, name: user.name, email: user.email }); return { success: true, user }; }
        return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    function register(name, email, password) {
        const users = get('users', []);
        if (users.find(u => u.email === email)) return { success: false, message: 'อีเมลนี้ถูกใช้แล้ว' };
        const user = { id: Date.now(), name, email, password, joinDate: new Date().toISOString().split('T')[0] };
        users.push(user); set('users', users);
        set('user', { id: user.id, name: user.name, email: user.email });
        return { success: true, user };
    }
    function logout() { set('user', null); }

    // Admin Auth
    function adminLogin(username, password) {
        if (username === 'admin' && password === 'admin123') {
            set('admin', { loggedIn: true, name: 'Admin' }); return true;
        }
        return false;
    }
    function isAdmin() { const a = get('admin', null); return a && a.loggedIn; }
    function adminLogout() { set('admin', null); }

    // Theme
    function getTheme() { return get('theme', 'light'); }
    function setTheme(theme) { set('theme', theme); document.documentElement.setAttribute('data-theme', theme); }
    function toggleTheme() {
        const t = getTheme() === 'light' ? 'dark' : 'light';
        setTheme(t); return t;
    }

    // Orders
    function getOrders() { return get('orders', AppData.sampleOrders); }
    function addOrder(order) { const orders = getOrders(); orders.unshift(order); set('orders', orders); return orders; }
    function updateOrderStatus(orderId, status) {
        const orders = getOrders();
        const order = orders.find(o => o.id === orderId);
        if (order) { order.status = status; set('orders', orders); }
        return orders;
    }

    // Coupons
    function getCoupons() { return get('coupons', AppData.sampleCoupons); }
    function applyCoupon(code, orderTotal) {
        const coupons = getCoupons();
        const c = coupons.find(cp => cp.code === code.toUpperCase() && cp.active);
        if (!c) return { success: false, message: 'คูปองไม่ถูกต้องหรือหมดอายุ' };
        if (orderTotal < c.minOrder) return { success: false, message: `ยอดขั้นต่ำ ฿${c.minOrder.toLocaleString()}` };
        let discount = c.type === 'percent' ? Math.min(orderTotal * c.discount / 100, c.maxDiscount) : c.discount;
        return { success: true, discount, coupon: c };
    }
    function saveCoupons(coupons) { set('coupons', coupons); }

    // Reviews
    function getReviews() { return get('reviews', AppData.sampleReviews); }
    function addReview(review) { const r = getReviews(); r.push({ ...review, id: Date.now() }); set('reviews', r); return r; }
    function deleteReview(id) { const r = getReviews().filter(rv => rv.id !== id); set('reviews', r); return r; }

    // Products (admin)
    function getProducts() { return get('products', AppData.products); }
    function saveProducts(products) { set('products', products); }

    // Badges
    function updateBadges() {
        const cartBadge = document.getElementById('cartBadge');
        const wishBadge = document.getElementById('wishlistBadge');
        if (cartBadge) { const c = getCartCount(); cartBadge.textContent = c; cartBadge.style.display = c > 0 ? 'flex' : 'none'; }
        if (wishBadge) { const w = getWishlist().length; wishBadge.textContent = w; wishBadge.style.display = w > 0 ? 'flex' : 'none'; }
    }

    // Toast
    function toast(message, type) {
        type = type || 'success';
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        const t = document.createElement('div');
        t.className = 'toast ' + type;
        t.innerHTML = '<span>' + (icons[type] || '') + '</span><span>' + message + '</span>';
        container.appendChild(t);
        setTimeout(function () { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; setTimeout(function () { t.remove(); }, 300); }, 3000);
    }

    return {
        getCart, addToCart, updateCartQty, removeFromCart, clearCart, getCartTotal, getCartCount,
        getWishlist, toggleWishlist, isInWishlist,
        getUser, login, register, logout,
        adminLogin, isAdmin, adminLogout,
        getTheme, setTheme, toggleTheme,
        getOrders, addOrder, updateOrderStatus,
        getCoupons, applyCoupon, saveCoupons,
        getReviews, addReview, deleteReview,
        getProducts, saveProducts,
        updateBadges, toast
    };
})();
