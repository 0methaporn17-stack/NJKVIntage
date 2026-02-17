/* ============================================
   NJKVintage — Admin Panel Pages
   ============================================ */
window.AdminPages = (function () {

    function sidebar(active) {
        var items = [
            { id: 'dashboard', icon: '📊', label: 'Dashboard' },
            { id: 'products', icon: '📦', label: 'จัดการสินค้า' },
            { id: 'categories', icon: '📁', label: 'หมวดหมู่' },
            { id: 'orders', icon: '🛒', label: 'คำสั่งซื้อ' },
            { id: 'coupons', icon: '🏷️', label: 'คูปอง' },
            { id: 'users', icon: '👥', label: 'ผู้ใช้' },
            { id: 'reviews', icon: '⭐', label: 'รีวิว' }
        ];
        return '<div class="admin-sidebar" id="adminSidebar">' +
            '<div class="admin-sidebar-header"><h3>🛠️ Admin Panel</h3><p>NJKVintage Management</p></div>' +
            items.map(function (item) {
                return '<a href="#/admin/' + item.id + '" class="admin-nav-item ' + (active === item.id ? 'active' : '') + '">' + item.icon + ' ' + item.label + '</a>';
            }).join('') +
            '<div style="padding:12px 20px;margin-top:20px;border-top:1px solid var(--color-border)">' +
            '<button class="btn btn-sm btn-secondary" style="width:100%" onclick="AdminPages.logout()">🚪 ออกจากระบบ</button>' +
            '</div>' +
            '</div>';
    }

    function layout(active, content) {
        return '<div class="admin-layout">' + sidebar(active) +
            '<div class="admin-content">' +
            '<button class="btn btn-sm btn-secondary" style="margin-bottom:16px;display:none" id="adminMenuBtn" onclick="document.getElementById(\'adminSidebar\').classList.toggle(\'open\')">☰ เมนู</button>' +
            content +
            '</div></div>';
    }

    /* ---- LOGIN ---- */
    function loginPage() {
        return '<div class="admin-login"><div class="admin-login-card animate-in">' +
            '<h1>🔐 Admin Login</h1><p>เข้าสู่ระบบผู้ดูแล</p>' +
            '<form class="auth-form" onsubmit="AdminPages.doLogin(event)">' +
            '<div class="form-group"><label>Username</label><input type="text" id="adminUser" value="admin" required></div>' +
            '<div class="form-group"><label>Password</label><input type="password" id="adminPass" placeholder="admin123" required></div>' +
            '<button type="submit" class="btn btn-primary" style="width:100%">เข้าสู่ระบบ</button>' +
            '</form>' +
            '<p style="margin-top:16px;font-size:0.78rem;color:var(--color-text-secondary);text-align:center">Demo: admin / admin123</p>' +
            '</div></div>';
    }
    function doLogin(e) {
        e.preventDefault();
        var u = document.getElementById('adminUser').value;
        var p = document.getElementById('adminPass').value;
        if (Store.adminLogin(u, p)) { Store.toast('เข้าสู่ระบบแอดมินสำเร็จ', 'success'); window.location.hash = '#/admin/dashboard'; }
        else { Store.toast('Username หรือ Password ไม่ถูกต้อง', 'error'); }
    }
    function logout() { Store.adminLogout(); window.location.hash = '#/admin/login'; Store.toast('ออกจากระบบแล้ว', 'info'); }

    /* ---- DASHBOARD ---- */
    function dashboard() {
        var orders = Store.getOrders();
        var products = Store.getProducts();
        var totalSales = orders.reduce(function (s, o) { return s + o.total; }, 0);
        var lowStock = products.filter(function (p) { return p.stock < 15; });
        var topProducts = products.slice().sort(function (a, b) { return b.sold - a.sold; }).slice(0, 5);
        var statusCount = { pending: 0, paid: 0, shipping: 0, delivered: 0 };
        orders.forEach(function (o) { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

        var months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'];
        var salesData = [12400, 18900, 24500, 16700, 28300, 32100, 38500];
        var maxSale = Math.max.apply(null, salesData);

        return layout('dashboard',
            '<h1>📊 Dashboard</h1>' +
            '<div class="stats-grid">' +
            statCard('💰', '฿' + totalSales.toLocaleString(), 'ยอดขายรวม', '↑ 12.5%', 'up') +
            statCard('🛒', orders.length + ' ออเดอร์', 'จำนวนคำสั่งซื้อ', '↑ 8.3%', 'up') +
            statCard('📦', products.length + ' รายการ', 'สินค้าทั้งหมด', lowStock.length + ' สต๊อกต่ำ', 'down') +
            statCard('⭐', '4.7', 'คะแนนรีวิวเฉลี่ย', 'จาก ' + Store.getReviews().length + ' รีวิว', 'up') +
            '</div>' +

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">' +
            '<div class="admin-chart"><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:16px">📈 ยอดขายรายเดือน</h3>' +
            '<div class="chart-bars">' +
            months.map(function (m, i) {
                var h = Math.round(salesData[i] / maxSale * 160);
                return '<div class="chart-bar" style="height:' + h + 'px"><span class="chart-bar-label">' + m + '</span><span class="chart-bar-value">' + Math.round(salesData[i] / 1000) + 'K</span></div>';
            }).join('') +
            '</div>' +
            '</div>' +
            '<div class="admin-chart"><h3 style="font-size:0.95rem;font-weight:600;margin-bottom:16px">📊 สถานะออเดอร์</h3>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:20px 0">' +
            miniStat('รอชำระ', statusCount.pending, '#FF9800') +
            miniStat('ชำระแล้ว', statusCount.paid, '#4CAF50') +
            miniStat('กำลังจัดส่ง', statusCount.shipping, '#2196F3') +
            miniStat('ส่งสำเร็จ', statusCount.delivered, '#9C27B0') +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">' +
            '<div class="admin-table-wrap"><div class="admin-table-header"><h3>🏆 สินค้าขายดี</h3></div>' +
            '<table class="admin-table"><thead><tr><th>สินค้า</th><th>ยอดขาย</th><th>สต๊อก</th></tr></thead><tbody>' +
            topProducts.map(function (p) {
                return '<tr><td style="display:flex;align-items:center;gap:10px"><img src="' + p.image + '" style="width:36px;height:36px;border-radius:6px;object-fit:cover">' + p.name + '</td><td>' + p.sold + '</td><td><span style="color:' + (p.stock < 15 ? 'var(--color-danger)' : 'var(--color-success)') + '">' + p.stock + '</span></td></tr>';
            }).join('') +
            '</tbody></table></div>' +

            '<div class="admin-table-wrap"><div class="admin-table-header"><h3>⚠️ สินค้าสต๊อกต่ำ</h3></div>' +
            '<table class="admin-table"><thead><tr><th>สินค้า</th><th>คงเหลือ</th><th>สถานะ</th></tr></thead><tbody>' +
            (lowStock.length ? lowStock.map(function (p) {
                return '<tr><td>' + p.name + '</td><td style="color:var(--color-danger);font-weight:600">' + p.stock + '</td><td><span class="status-badge status-pending">ต้องเติม</span></td></tr>';
            }).join('') : '<tr><td colspan="3" style="text-align:center;color:var(--color-text-secondary)">ไม่มีสินค้าสต๊อกต่ำ</td></tr>') +
            '</tbody></table></div>' +
            '</div>'
        );
    }
    function statCard(icon, value, label, change, dir) {
        return '<div class="stat-card animate-in"><div class="stat-icon">' + icon + '</div><div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div><div class="stat-change ' + dir + '">' + change + '</div></div>';
    }
    function miniStat(label, count, color) {
        return '<div style="text-align:center;padding:16px;background:var(--color-surface-alt);border-radius:8px"><div style="font-size:1.6rem;font-weight:700;color:' + color + '">' + count + '</div><div style="font-size:0.8rem;color:var(--color-text-secondary);margin-top:4px">' + label + '</div></div>';
    }

    /* ---- PRODUCTS MANAGEMENT ---- */
    function productsManagement() {
        var products = Store.getProducts();
        return layout('products',
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
            '<h1 style="margin:0">📦 จัดการสินค้า</h1>' +
            '<button class="btn btn-primary btn-sm" onclick="AdminPages.showAddProduct()">+ เพิ่มสินค้า</button>' +
            '</div>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>รูป</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>สต๊อก</th><th>ยอดขาย</th><th>จัดการ</th></tr></thead><tbody>' +
            products.map(function (p) {
                var cat = AppData.categories.find(function (c) { return c.id === p.category; });
                return '<tr><td><img src="' + p.image + '" style="width:48px;height:48px;border-radius:8px;object-fit:cover"></td>' +
                    '<td><strong>' + p.name + '</strong>' + (p.isNew ? ' <span class="product-badge badge-new" style="font-size:0.65rem">NEW</span>' : '') + (p.isSale ? ' <span class="product-badge badge-sale" style="font-size:0.65rem">SALE</span>' : '') + '</td>' +
                    '<td>' + (cat ? cat.name : p.category) + '</td>' +
                    '<td>฿' + p.price.toLocaleString() + (p.originalPrice ? ' <s style="color:var(--color-text-secondary);font-size:0.8rem">฿' + p.originalPrice.toLocaleString() + '</s>' : '') + '</td>' +
                    '<td><span style="color:' + (p.stock < 15 ? 'var(--color-danger)' : 'var(--color-success)') + '">' + p.stock + '</span></td>' +
                    '<td>' + p.sold + '</td>' +
                    '<td><button class="btn btn-sm btn-secondary" onclick="AdminPages.editProduct(' + p.id + ')" style="margin-right:4px">✏️</button><button class="btn btn-sm" style="color:var(--color-danger)" onclick="AdminPages.deleteProduct(' + p.id + ')">🗑️</button></td></tr>';
            }).join('') +
            '</tbody></table></div>' +
            '<div id="productModal"></div>'
        );
    }
    function showAddProduct() {
        showProductModal({ id: null, name: '', category: 'tops', price: 0, originalPrice: null, image: '', sizes: ['S', 'M', 'L', 'XL'], colors: ['ดำ'], colorCodes: ['#1A1A1A'], rating: 0, reviews: 0, isNew: true, isSale: false, stock: 0, sold: 0, description: '' });
    }
    function editProduct(id) {
        var p = Store.getProducts().find(function (x) { return x.id === id; });
        if (p) showProductModal(p);
    }
    function showProductModal(p) {
        var isEdit = !!p.id;
        document.getElementById('productModal').innerHTML =
            '<div class="modal-overlay" onclick="if(event.target===this)this.remove()">' +
            '<div class="modal"><h2>' + (isEdit ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่') + '</h2>' +
            '<form class="auth-form" onsubmit="AdminPages.saveProduct(event,' + (p.id || 'null') + ')">' +
            '<div class="form-group"><label>ชื่อสินค้า</label><input type="text" id="pName" value="' + p.name + '" required></div>' +
            '<div class="form-group"><label>หมวดหมู่</label><select id="pCat">' + AppData.categories.map(function (c) { return '<option value="' + c.id + '"' + (c.id === p.category ? ' selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="form-group"><label>ราคา (฿)</label><input type="number" id="pPrice" value="' + p.price + '" required></div>' +
            '<div class="form-group"><label>ราคาเดิม (฿)</label><input type="number" id="pOrigPrice" value="' + (p.originalPrice || '') + '" placeholder="ไม่ลด"></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="form-group"><label>สต๊อก</label><input type="number" id="pStock" value="' + p.stock + '" required></div>' +
            '<div class="form-group"><label>ยอดขาย</label><input type="number" id="pSold" value="' + p.sold + '"></div>' +
            '</div>' +
            '<div class="form-group"><label>URL รูปภาพ</label><input type="text" id="pImage" value="' + p.image + '" placeholder="https://..."></div>' +
            '<div class="form-group"><label>คำอธิบาย</label><textarea id="pDesc" rows="3">' + p.description + '</textarea></div>' +
            '<div style="display:flex;gap:12px;align-items:center">' +
            '<label><input type="checkbox" id="pNew" ' + (p.isNew ? 'checked' : '') + '> สินค้ามาใหม่</label>' +
            '<label><input type="checkbox" id="pSale" ' + (p.isSale ? 'checked' : '') + '> ลดราคา</label>' +
            '</div>' +
            '<div style="display:flex;gap:8px;margin-top:8px"><button type="submit" class="btn btn-primary" style="flex:1">' + (isEdit ? 'บันทึก' : 'เพิ่มสินค้า') + '</button><button type="button" class="btn btn-secondary" onclick="document.querySelector(\'.modal-overlay\').remove()">ยกเลิก</button></div>' +
            '</form></div></div>';
    }
    function saveProduct(e, editId) {
        e.preventDefault();
        var products = Store.getProducts();
        var data = {
            name: document.getElementById('pName').value,
            category: document.getElementById('pCat').value,
            price: parseInt(document.getElementById('pPrice').value),
            originalPrice: parseInt(document.getElementById('pOrigPrice').value) || null,
            stock: parseInt(document.getElementById('pStock').value),
            sold: parseInt(document.getElementById('pSold').value) || 0,
            image: document.getElementById('pImage').value || 'https://via.placeholder.com/500x600?text=Product',
            images: [document.getElementById('pImage').value || 'https://via.placeholder.com/500x600?text=Product'],
            description: document.getElementById('pDesc').value,
            isNew: document.getElementById('pNew').checked,
            isSale: document.getElementById('pSale').checked,
            sizes: ['S', 'M', 'L', 'XL'], colors: ['ดำ', 'ขาว'], colorCodes: ['#1A1A1A', '#F5F5F5'],
            rating: 4.5, reviews: 0
        };
        if (editId) {
            var idx = products.findIndex(function (p) { return p.id === editId; });
            if (idx >= 0) { data.id = editId; products[idx] = Object.assign(products[idx], data); }
        } else {
            data.id = Date.now();
            products.push(data);
        }
        Store.saveProducts(products);
        Store.toast(editId ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มสินค้าแล้ว', 'success');
        window.App.navigate(window.location.hash);
    }
    function deleteProduct(id) {
        if (!confirm('ต้องการลบสินค้านี้?')) return;
        var products = Store.getProducts().filter(function (p) { return p.id !== id; });
        Store.saveProducts(products);
        Store.toast('ลบสินค้าแล้ว', 'info');
        window.App.navigate(window.location.hash);
    }

    /* ---- CATEGORIES ---- */
    function categoriesManagement() {
        return layout('categories',
            '<h1>📁 จัดการหมวดหมู่</h1>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>ไอคอน</th><th>ชื่อหมวดหมู่</th><th>ID</th><th>จำนวนสินค้า</th></tr></thead><tbody>' +
            AppData.categories.map(function (c) {
                var count = Store.getProducts().filter(function (p) { return p.category === c.id; }).length;
                return '<tr><td style="font-size:1.5rem">' + c.icon + '</td><td><strong>' + c.name + '</strong></td><td><code>' + c.id + '</code></td><td>' + count + ' รายการ</td></tr>';
            }).join('') +
            '</tbody></table></div>'
        );
    }

    /* ---- ORDERS ---- */
    function ordersManagement() {
        var orders = Store.getOrders();
        var statusLabels = { pending: 'รอชำระ', paid: 'ชำระแล้ว', shipping: 'กำลังจัดส่ง', delivered: 'ส่งสำเร็จ' };
        var statusClasses = { pending: 'status-pending', paid: 'status-paid', shipping: 'status-shipping', delivered: 'status-delivered' };
        var payLabels = { promptpay: 'พร้อมเพย์', credit: 'บัตรเครดิต', cod: 'เก็บเงินปลายทาง', paypal: 'PayPal' };
        return layout('orders',
            '<h1>🛒 จัดการคำสั่งซื้อ</h1>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>หมายเลข</th><th>วันที่</th><th>สินค้า</th><th>ยอดรวม</th><th>การชำระ</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>' +
            orders.map(function (o) {
                return '<tr><td><strong>' + o.id + '</strong></td><td>' + o.date + '</td>' +
                    '<td>' + o.items.map(function (i) { return i.name; }).join(', ') + '</td>' +
                    '<td>฿' + o.total.toLocaleString() + '</td>' +
                    '<td>' + (payLabels[o.payment] || o.payment) + '</td>' +
                    '<td><span class="status-badge ' + (statusClasses[o.status] || '') + '">' + (statusLabels[o.status] || o.status) + '</span></td>' +
                    '<td><select onchange="AdminPages.updateStatus(\'' + o.id + '\',this.value)" style="padding:6px 10px;border:1px solid var(--color-border);border-radius:6px;background:var(--color-surface);color:var(--color-text);font-size:0.8rem">' +
                    Object.keys(statusLabels).map(function (s) { return '<option value="' + s + '"' + (s === o.status ? ' selected' : '') + '>' + statusLabels[s] + '</option>'; }).join('') +
                    '</select></td></tr>';
            }).join('') +
            '</tbody></table></div>'
        );
    }
    function updateStatus(orderId, status) {
        Store.updateOrderStatus(orderId, status);
        Store.toast('อัปเดตสถานะเป็น ' + { pending: 'รอชำระ', paid: 'ชำระแล้ว', shipping: 'กำลังจัดส่ง', delivered: 'ส่งสำเร็จ' }[status], 'success');
        window.App.navigate(window.location.hash);
    }

    /* ---- COUPONS ---- */
    function couponsManagement() {
        var coupons = Store.getCoupons();
        return layout('coupons',
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
            '<h1 style="margin:0">🏷️ คูปองส่วนลด</h1>' +
            '<button class="btn btn-primary btn-sm" onclick="AdminPages.showAddCoupon()">+ เพิ่มคูปอง</button>' +
            '</div>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>โค้ด</th><th>ส่วนลด</th><th>ขั้นต่ำ</th><th>ใช้แล้ว</th><th>หมดอายุ</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>' +
            coupons.map(function (c) {
                return '<tr><td><strong style="font-family:monospace">' + c.code + '</strong></td>' +
                    '<td>' + (c.type === 'percent' ? c.discount + '%' : '฿' + c.discount) + '</td>' +
                    '<td>฿' + c.minOrder.toLocaleString() + '</td>' +
                    '<td>' + c.usedCount + ' ครั้ง</td>' +
                    '<td>' + c.expiryDate + '</td>' +
                    '<td><span class="status-badge ' + (c.active ? 'status-paid' : 'status-pending') + '">' + (c.active ? 'ใช้งาน' : 'ปิดใช้') + '</span></td>' +
                    '<td><button class="btn btn-sm" onclick="AdminPages.toggleCoupon(' + c.id + ')">' + (c.active ? '⏸️' : '▶️') + '</button> <button class="btn btn-sm" style="color:var(--color-danger)" onclick="AdminPages.deleteCoupon(' + c.id + ')">🗑️</button></td></tr>';
            }).join('') +
            '</tbody></table></div>' +
            '<div id="couponModal"></div>'
        );
    }
    function showAddCoupon() {
        document.getElementById('couponModal').innerHTML =
            '<div class="modal-overlay" onclick="if(event.target===this)this.remove()"><div class="modal"><h2>➕ เพิ่มคูปองใหม่</h2>' +
            '<form class="auth-form" onsubmit="AdminPages.saveCoupon(event)">' +
            '<div class="form-group"><label>โค้ด</label><input type="text" id="cpCode" required placeholder="เช่น SAVE20" style="text-transform:uppercase"></div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="form-group"><label>ส่วนลด</label><input type="number" id="cpDiscount" required></div>' +
            '<div class="form-group"><label>ประเภท</label><select id="cpType"><option value="percent">เปอร์เซ็นต์ (%)</option><option value="fixed">จำนวนเงิน (฿)</option></select></div>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
            '<div class="form-group"><label>ยอดขั้นต่ำ (฿)</label><input type="number" id="cpMin" value="500"></div>' +
            '<div class="form-group"><label>ลดสูงสุด (฿)</label><input type="number" id="cpMax" value="500"></div>' +
            '</div>' +
            '<div class="form-group"><label>หมดอายุ</label><input type="date" id="cpExpiry" required></div>' +
            '<div style="display:flex;gap:8px"><button type="submit" class="btn btn-primary" style="flex:1">เพิ่มคูปอง</button><button type="button" class="btn btn-secondary" onclick="document.querySelector(\'.modal-overlay\').remove()">ยกเลิก</button></div>' +
            '</form></div></div>';
    }
    function saveCoupon(e) {
        e.preventDefault();
        var coupons = Store.getCoupons();
        coupons.push({
            id: Date.now(),
            code: document.getElementById('cpCode').value.toUpperCase(),
            discount: parseInt(document.getElementById('cpDiscount').value),
            type: document.getElementById('cpType').value,
            minOrder: parseInt(document.getElementById('cpMin').value),
            maxDiscount: parseInt(document.getElementById('cpMax').value),
            active: true, usedCount: 0,
            expiryDate: document.getElementById('cpExpiry').value
        });
        Store.saveCoupons(coupons);
        Store.toast('เพิ่มคูปองแล้ว', 'success');
        window.App.navigate(window.location.hash);
    }
    function toggleCoupon(id) {
        var coupons = Store.getCoupons();
        var c = coupons.find(function (x) { return x.id === id; });
        if (c) { c.active = !c.active; Store.saveCoupons(coupons); Store.toast(c.active ? 'เปิดใช้คูปอง' : 'ปิดใช้คูปอง', 'info'); }
        window.App.navigate(window.location.hash);
    }
    function deleteCoupon(id) {
        if (!confirm('ลบคูปองนี้?')) return;
        Store.saveCoupons(Store.getCoupons().filter(function (c) { return c.id !== id; }));
        Store.toast('ลบคูปองแล้ว', 'info');
        window.App.navigate(window.location.hash);
    }

    /* ---- USERS ---- */
    function usersManagement() {
        var users = AppData.sampleUsers;
        return layout('users',
            '<h1>👥 จัดการผู้ใช้</h1>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>#</th><th>ชื่อ</th><th>อีเมล</th><th>โทร</th><th>สมัครเมื่อ</th><th>ออเดอร์</th><th>ยอดซื้อรวม</th></tr></thead><tbody>' +
            users.map(function (u) {
                return '<tr><td>' + u.id + '</td><td><strong>' + u.name + '</strong></td><td>' + u.email + '</td><td>' + u.phone + '</td><td>' + u.joinDate + '</td><td>' + u.orders + '</td><td>฿' + u.totalSpent.toLocaleString() + '</td></tr>';
            }).join('') +
            '</tbody></table></div>'
        );
    }

    /* ---- REVIEWS ---- */
    function reviewsManagement() {
        var reviews = Store.getReviews();
        var products = Store.getProducts();
        return layout('reviews',
            '<h1>⭐ จัดการรีวิว</h1>' +
            '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>สินค้า</th><th>ผู้รีวิว</th><th>คะแนน</th><th>ความเห็น</th><th>วันที่</th><th>จัดการ</th></tr></thead><tbody>' +
            reviews.map(function (r) {
                var p = products.find(function (x) { return x.id === r.productId; });
                return '<tr><td>' + (p ? p.name : 'ไม่ทราบ') + '</td><td>' + r.user + '</td><td><span class="stars">' + Components.starsHtml(r.rating) + '</span></td><td style="max-width:250px">' + r.text + '</td><td>' + r.date + '</td>' +
                    '<td><button class="btn btn-sm" style="color:var(--color-danger)" onclick="AdminPages.removeReview(' + r.id + ')">🗑️</button></td></tr>';
            }).join('') +
            '</tbody></table></div>'
        );
    }
    function removeReview(id) {
        if (!confirm('ลบรีวิวนี้?')) return;
        Store.deleteReview(id);
        Store.toast('ลบรีวิวแล้ว', 'info');
        window.App.navigate(window.location.hash);
    }

    return {
        loginPage, doLogin, logout,
        dashboard,
        productsManagement, showAddProduct, editProduct, saveProduct, deleteProduct,
        categoriesManagement,
        ordersManagement, updateStatus,
        couponsManagement, showAddCoupon, saveCoupon, toggleCoupon, deleteCoupon,
        usersManagement,
        reviewsManagement, removeReview
    };
})();
