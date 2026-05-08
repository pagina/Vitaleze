// =============================================
// ADMIN DASHBOARD - Vitaleze 🌾
// Login: Supabase Auth → fallback contraseña local
// =============================================

document.addEventListener('DOMContentLoaded', async () => {

    // ---- REFS ----
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('dashboard-screen');
    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');
    const authSubmit = document.getElementById('auth-submit');
    const logoutBtn = document.getElementById('logout-btn');
    const sidebar = document.getElementById('admin-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const emailDisplay = document.getElementById('admin-email-display');

    // ---- TOAST ----
    function showToast(msg, type = 'success') {
        const t = document.getElementById('toast');
        const m = document.getElementById('toast-message');
        const i = t.querySelector('i');
        m.textContent = msg;
        t.style.background = type === 'error' ? '#ef4444' : type === 'info' ? '#3b82f6' : '#4A7C59';
        i.className = type === 'error' ? 'fa-solid fa-exclamation-circle' : 'fa-solid fa-check-circle';
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }

    // ---- AUTH ----
    async function checkSession() {
        const session = await DataManager.getSession();
        if (session) {
            enterDashboard(session.user?.email || 'Admin');
        } else {
            loginScreen.style.display = 'flex';
            dashboard.style.display = 'none';
        }
    }

    function enterDashboard(label) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';
        if (emailDisplay) emailDisplay.textContent = label || '';
        loadTab('dashboard');
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.style.display = 'none';

        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;

        authSubmit.disabled = true;
        authSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Ingresando...</span>';

        // Intentar login con Supabase
        const res = await DataManager.login(email, password);

        if (res.ok) {
            enterDashboard(email);
            showToast('¡Bienvenido! 🌾');
        } else {
            authError.textContent = res.msg;
            authError.style.display = 'block';
        }

        authSubmit.disabled = false;
        authSubmit.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> <span>Ingresar</span>';
    });

    logoutBtn.addEventListener('click', async () => {
        await DataManager.logout();
        loginScreen.style.display = 'flex';
        dashboard.style.display = 'none';
        authForm.reset();
        authError.style.display = 'none';
        showToast('Sesión cerrada', 'info');
    });

    // ---- SIDEBAR ----
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        let ov = document.querySelector('.sidebar-overlay');
        if (!ov) {
            ov = document.createElement('div');
            ov.className = 'sidebar-overlay';
            document.body.appendChild(ov);
            ov.addEventListener('click', () => { sidebar.classList.remove('open'); ov.classList.remove('show'); });
        }
        ov.classList.toggle('show', sidebar.classList.contains('open'));
    });

    sidebarBtns.forEach(btn => btn.addEventListener('click', () => {
        sidebarBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadTab(btn.dataset.tab);
        sidebar.classList.remove('open');
        const ov = document.querySelector('.sidebar-overlay');
        if (ov) ov.classList.remove('show');
    }));

    function loadTab(tab) {
        tabPanels.forEach(p => {
            p.classList.remove('active');
            if (p.id === `tab-${tab}`) p.classList.add('active');
        });
        if (tab === 'dashboard') loadDashboard();
        if (tab === 'products') loadProducts();
        if (tab === 'orders') loadOrders();
        if (tab === 'content') loadContent();
    }

    // ---- DASHBOARD ----
    async function loadDashboard() {
        try {
            const products = await DataManager.getProducts();
            const orders = await DataManager.getOrders().catch(() => []);
            const categories = await DataManager.getCategories();
            const pending = orders.filter(o => o.estado === 'Pendiente');

            document.getElementById('stat-products').textContent = products.length;
            document.getElementById('stat-orders').textContent = orders.length;
            document.getElementById('stat-categories').textContent = categories.length;
            document.getElementById('stat-pending').textContent = pending.length;

            const recentEl = document.getElementById('dashboard-recent-orders');
            if (orders.length === 0) {
                recentEl.innerHTML = '<div class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>No hay pedidos aún</p></div>';
            } else {
                recentEl.innerHTML = orders.slice(0, 5).map(o => `
                    <div class="recent-item">
                        <div class="recent-item-info">
                            <span class="recent-item-name">${o.cliente || 'Cliente'}</span>
                            <span class="recent-item-detail">${new Date(o.fecha).toLocaleDateString('es-AR')}</span>
                        </div>
                        <span class="status-badge ${statusClass(o.estado)}">${o.estado}</span>
                    </div>
                `).join('');
            }

            const topEl = document.getElementById('dashboard-top-products');
            if (products.length === 0) {
                topEl.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No hay productos</p></div>';
            } else {
                topEl.innerHTML = products.slice(0, 5).map(p => `
                    <div class="recent-item">
                        <div class="recent-item-info" style="flex-direction:row;gap:.75rem;align-items:center;">
                            <img src="${p.imagen || './imagenes/logo.png'}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover;" onerror="this.src='./imagenes/logo.png'">
                            <div>
                                <span class="recent-item-name">${p.nombre}</span>
                                <span class="recent-item-detail">${p.categoria || ''}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (e) { console.error('Dashboard error:', e); }
    }

    function statusClass(s) {
        if (s === 'En preparación') return 'status-preparing';
        if (s === 'Entregado') return 'status-delivered';
        return 'status-pending';
    }

    // ---- PRODUCTS ----
    const productGrid = document.getElementById('admin-product-grid');
    const productFormWrap = document.getElementById('product-form-wrapper');
    const productForm = document.getElementById('product-form');
    const imgPreview = document.getElementById('image-preview');
    const fileInput = document.getElementById('p-imagen-file');
    const fileNameEl = document.getElementById('file-name-display');

    // File upload → base64
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (fileNameEl) fileNameEl.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('p-imagen').value = ev.target.result;
                imgPreview.src = ev.target.result;
                showToast('Foto cargada ✓');
            };
            reader.readAsDataURL(file);
        });
    }

    document.getElementById('btn-add-product').addEventListener('click', () => openProductForm());
    document.getElementById('btn-cancel-product').addEventListener('click', closeProductForm);
    document.getElementById('btn-close-form').addEventListener('click', closeProductForm);

    function openProductForm(p = null) {
        productFormWrap.style.display = 'block';
        document.getElementById('form-title').innerHTML = p
            ? '<i class="fa-solid fa-edit"></i> Editar Producto'
            : '<i class="fa-solid fa-plus-circle"></i> Nuevo Producto';
        document.getElementById('p-id').value = p ? p.id : '';
        document.getElementById('p-nombre').value = p ? p.nombre : '';
        document.getElementById('p-categoria').value = p ? p.categoria : '';
        document.getElementById('p-descripcion').value = p ? p.descripcion : '';
        document.getElementById('p-ingredientes').value = p ? (p.ingredientes || '') : '';
        document.getElementById('p-precio').value = p ? (p.precio || '') : '';
        document.getElementById('p-imagen').value = p ? (p.imagen || '') : '';
        imgPreview.src = p?.imagen || './imagenes/logo.png';
        imgPreview.onerror = function () { this.onerror = null; this.src = './imagenes/logo.png'; };
        if (fileNameEl) fileNameEl.textContent = 'Ningún archivo seleccionado';
        productFormWrap.scrollIntoView({ behavior: 'smooth' });
    }

    function closeProductForm() {
        productFormWrap.style.display = 'none';
        productForm.reset();
        imgPreview.src = './imagenes/logo.png';
    }

    // Preview on blur
    document.getElementById('p-imagen').addEventListener('blur', function () {
        if (this.value) {
            imgPreview.src = this.value;
            imgPreview.onerror = function () { this.onerror = null; this.src = './imagenes/logo.png'; };
        }
    });

    // Save product
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            nombre: document.getElementById('p-nombre').value.trim(),
            categoria: document.getElementById('p-categoria').value.trim(),
            descripcion: document.getElementById('p-descripcion').value.trim(),
            ingredientes: document.getElementById('p-ingredientes').value.trim(),
            precio: Number(document.getElementById('p-precio').value) || 0,
            imagen: document.getElementById('p-imagen').value.trim()
        };
        const editId = document.getElementById('p-id').value;
        if (editId) data.id = editId;

        if (!data.nombre || !data.categoria) {
            showToast('Completá nombre y categoría', 'error');
            return;
        }

        try {
            await DataManager.saveProduct(data);
            closeProductForm();
            showToast(editId ? 'Producto actualizado ✓' : 'Producto creado ✓');
            loadProducts();
        } catch (err) {
            showToast('Error: ' + (err.message || 'No se pudo guardar'), 'error');
        }
    });

    async function loadProducts() {
        productGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i><p>Cargando...</p></div>';
        try {
            const products = await DataManager.getProducts();
            productGrid.innerHTML = '';

            if (products.length === 0) {
                productGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No hay productos. ¡Agregá el primero!</p></div>';
                return;
            }

            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'admin-p-card';
                card.innerHTML = `
                    <img src="${p.imagen || './imagenes/logo.png'}" alt="${p.nombre}" class="admin-p-card-img" onerror="this.src='./imagenes/logo.png';this.style.objectFit='contain';this.style.padding='2rem';">
                    <div class="admin-p-card-body">
                        <h4>${p.nombre}</h4>
                        <span class="p-cat">${p.categoria || ''}</span>
                        <span class="p-price" style="display:block;font-weight:700;color:#4A7C59;font-size:1.1em;margin:0.25rem 0;">${formatPrecio(p.precio)}</span>
                        <p class="p-desc">${p.descripcion || ''}</p>
                        ${p.ingredientes ? `<div class="p-ingredients"><strong>Ingredientes:</strong> ${p.ingredientes}</div>` : ''}
                        <div class="admin-p-actions">
                            <button class="btn btn-outline btn-sm edit-p" data-id="${p.id}"><i class="fa-solid fa-edit"></i> Editar</button>
                            <button class="btn btn-outline btn-sm btn-delete delete-p" data-id="${p.id}"><i class="fa-solid fa-trash"></i> Eliminar</button>
                        </div>
                    </div>`;
                productGrid.appendChild(card);
            });

            productGrid.querySelectorAll('.edit-p').forEach(btn => btn.addEventListener('click', () => {
                const p = products.find(x => x.id === btn.dataset.id);
                openProductForm(p);
            }));

            productGrid.querySelectorAll('.delete-p').forEach(btn => btn.addEventListener('click', async () => {
                if (!confirm('¿Eliminar este producto?')) return;
                try {
                    await DataManager.deleteProduct(btn.dataset.id);
                    showToast('Producto eliminado ✓');
                    loadProducts();
                } catch (err) {
                    showToast('Error: ' + err.message, 'error');
                }
            }));
        } catch (e) {
            productGrid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-exclamation-triangle"></i><p>Error cargando productos</p></div>';
        }
    }

    // ---- ORDERS ----
    let orderFilter = 'all';

    async function loadOrders() {
        const tbody = document.getElementById('orders-list');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando...</td></tr>';
        try {
            const orders = await DataManager.getOrders();
            const filtered = orderFilter === 'all' ? orders : orders.filter(o => o.estado === orderFilter);
            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center"><div class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>${orderFilter === 'all' ? 'No hay pedidos' : 'Sin pedidos con este estado'}</p></div></td></tr>`;
                return;
            }

            filtered.forEach(o => {
                const d = new Date(o.fecha).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                let pName = 'Pedido';
                if (Array.isArray(o.productos)) {
                    pName = o.productos.map(p => `${p.cantidad}x ${p.nombre}`).join('<br>');
                } else if (o.productos?.nombre) {
                    pName = o.productos.nombre;
                } else if (typeof o.productos === 'string') {
                    pName = o.productos;
                }

                const telDir = `${o.telefono || '-'} <br><small class="text-muted">${o.direccion || '-'}</small>`;

                // Calcular total del pedido
                let orderTotal = Number(o.total) || 0;
                if (!orderTotal && Array.isArray(o.productos)) {
                    orderTotal = o.productos.reduce((sum, p) => sum + ((Number(p.precio) || 0) * (p.cantidad || 1)), 0);
                }
                const totalStr = orderTotal > 0 ? formatPrecio(orderTotal) : '-';

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${d}</td><td>${o.cliente}</td><td>${telDir}</td><td><div style="max-height:80px;overflow-y:auto;font-size:0.85em;">${pName}</div></td>
                    <td style="font-weight:700;color:#4A7C59;white-space:nowrap;">${totalStr}</td>
                    <td><span class="status-badge ${statusClass(o.estado)}">${o.estado}</span></td>
                    <td><div class="order-actions">
                        <select class="order-status-select" data-id="${o.id}">
                            <option value="Pendiente" ${o.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="En preparación" ${o.estado === 'En preparación' ? 'selected' : ''}>En preparación</option>
                            <option value="Entregado" ${o.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                        </select>
                        <button class="delete-order" data-id="${o.id}"><i class="fa-solid fa-trash-can"></i></button>
                    </div></td>`;
                tbody.appendChild(row);
            });

            tbody.querySelectorAll('.order-status-select').forEach(sel => sel.addEventListener('change', async (e) => {
                try { 
                    await DataManager.updateOrderStatus(e.target.dataset.id, e.target.value); 
                    showToast('Estado actualizado ✓'); 
                    loadOrders(); 
                    checkPendingOrdersBadge(); // Actualiza campana
                }
                catch (err) { showToast('Error: ' + err.message, 'error'); }
            }));

            tbody.querySelectorAll('.delete-order').forEach(btn => btn.addEventListener('click', async () => {
                if (!confirm('¿Eliminar pedido?')) return;
                try { 
                    await DataManager.deleteOrder(btn.dataset.id); 
                    showToast('Pedido eliminado ✓'); 
                    loadOrders(); 
                    checkPendingOrdersBadge(); // Actualiza campana
                }
                catch (err) { showToast('Error: ' + err.message, 'error'); }
            }));
        } catch (e) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Error cargando pedidos</td></tr>';
        }
    }

    document.querySelectorAll('.filter-pill').forEach(pill => pill.addEventListener('click', () => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        orderFilter = pill.dataset.orderFilter;
        loadOrders();
    }));

    // ---- CONTENT ----
    function wireFileUpload(fileInputId, textInputId) {
        const fi = document.getElementById(fileInputId);
        if (!fi) return;
        fi.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById(textInputId).value = ev.target.result;
                showToast('Foto cargada ✓');
            };
            reader.readAsDataURL(file);
        });
    }
    wireFileUpload('hero-img-file', 'sec-hero-img');
    wireFileUpload('about-img-file', 'sec-about-img');

    async function loadContent() {
        try {
            const sec = await DataManager.getSections();
            if (sec.hero_h1) document.getElementById('sec-hero-h1').value = sec.hero_h1.valor || '';
            if (sec.hero_p) document.getElementById('sec-hero-p').value = sec.hero_p.valor || '';
            if (sec.hero_img) document.getElementById('sec-hero-img').value = sec.hero_img.imagen_url || '';
            if (sec.about_h2) document.getElementById('sec-about-h2').value = sec.about_h2.valor || '';
            if (sec.about_p1) document.getElementById('sec-about-p1').value = sec.about_p1.valor || '';
            if (sec.about_img) document.getElementById('sec-about-img').value = sec.about_img.imagen_url || '';
        } catch (e) { console.error('Error cargando contenido:', e); }
    }

    document.querySelectorAll('.save-section').forEach(btn => btn.addEventListener('click', async () => {
        const zone = btn.dataset.section;
        const orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
        btn.disabled = true;

        try {
            if (zone === 'hero') {
                await DataManager.updateSection('hero_h1', document.getElementById('sec-hero-h1').value);
                await DataManager.updateSection('hero_p', document.getElementById('sec-hero-p').value);
                await DataManager.updateSection('hero_img', '', document.getElementById('sec-hero-img').value);
            } else if (zone === 'about') {
                await DataManager.updateSection('about_h2', document.getElementById('sec-about-h2').value);
                await DataManager.updateSection('about_p1', document.getElementById('sec-about-p1').value);
                await DataManager.updateSection('about_img', '', document.getElementById('sec-about-img').value);
            }
            showToast(`Sección "${zone}" guardada ✓`);
        } catch (err) {
            showToast('Error: ' + (err.message || ''), 'error');
        }

        btn.innerHTML = orig;
        btn.disabled = false;
    }));

    // ---- INIT ----
    checkSession();

    // ---- NOTIFICACIONES GLOBALES EN TIEMPO REAL (FALSO) ----
    async function checkPendingOrdersBadge() {
        try {
            const orders = await DataManager.getOrders();
            const pending = orders.filter(o => o.estado === 'Pendiente');
            const badge = document.getElementById('sidebar-orders-badge');
            
            if (badge) {
                if (pending.length > 0) {
                    badge.textContent = pending.length;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            }
            
            // Actualizar también los contadores visuales si estamos en el dashboard
            const statPending = document.getElementById('stat-pending');
            if (statPending) statPending.textContent = pending.length;
            
        } catch (e) {
            // silencio
        }
    }

    // Comprobar notificaciones al inicio y luego cada 15 segundos
    checkPendingOrdersBadge();
    setInterval(checkPendingOrdersBadge, 15000);

});
