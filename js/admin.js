// Admin Management - Vitaleze 🌾

document.addEventListener('DOMContentLoaded', async () => {
    // --- Auth Check & Login ---
    const loginScreen = document.getElementById('login-screen');
    const dashboardScreen = document.getElementById('dashboard-screen');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Check Current Session
    async function checkSession() {
        if (!supabase) {
            console.error('Supabase client not initialized in admin.js');
            return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showDashboard() {
        loginScreen.style.display = 'none';
        dashboardScreen.style.display = 'block';
        loadTab('orders'); // Default tab
    }

    function showLogin() {
        loginScreen.style.display = 'flex';
        dashboardScreen.style.display = 'none';
    }

    // Toggle Between Login and Sign Up (for first admin setup)
    let isLogin = true;
    const toggleAuthLink = document.getElementById('toggle-auth');
    const authSubmitBtn = document.getElementById('auth-submit-btn');

    toggleAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authSubmitBtn.textContent = isLogin ? 'Iniciar Sesión' : 'Registrar Nuevo Admin';
        toggleAuthLink.textContent = isLogin ? 'No tengo cuenta' : 'Ya tengo cuenta';
        loginError.style.display = 'none';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginSuccess = document.getElementById('login-success');

        loginError.style.display = 'none';
        loginSuccess.style.display = 'none';
        authSubmitBtn.disabled = true;
        authSubmitBtn.textContent = 'Procesando...';

        if (isLogin) {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                loginError.textContent = 'Error: ' + error.message;
                loginError.style.display = 'block';
                authSubmitBtn.disabled = false;
                authSubmitBtn.textContent = 'Iniciar Sesión';
            } else {
                showDashboard();
            }
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                loginError.textContent = 'Error: ' + error.message;
                loginError.style.display = 'block';
            } else {
                loginSuccess.textContent = '¡Registro exitoso! Ya podés iniciar sesión.';
                loginSuccess.style.display = 'block';
                isLogin = true;
                authSubmitBtn.textContent = 'Iniciar Sesión';
                toggleAuthLink.textContent = 'No tengo cuenta';
            }
            authSubmitBtn.disabled = false;
        }
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        showLogin();
    });

    // --- Tab Management ---
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            loadTab(target);
        });
    });

    function loadTab(target) {
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `tab-${target}`) content.classList.add('active');
        });

        if (target === 'orders') fetchOrders();
        if (target === 'products') fetchAdminProducts();
        if (target === 'content') fetchSectionsAdmin();
    }

    // --- Orders Logic ---
    async function fetchOrders() {
        const list = document.getElementById('orders-list');
        list.innerHTML = '<tr><td colspan="4" class="text-center">Cargando...</td></tr>';
        
        const orders = await DataManager.getOrders();
        list.innerHTML = '';

        if (orders.length === 0) {
            list.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay pedidos registrados aún.</td></tr>';
            return;
        }

        orders.forEach(o => {
            const date = new Date(o.fecha).toLocaleString();
            const row = `
                <tr>
                    <td>${date}</td>
                    <td>${o.cliente}</td>
                    <td>${o.productos?.nombre || 'Desconocido'}</td>
                    <td><span class="badge" style="background:#e9f0e4; color:#556b2f;">Pendiente</span></td>
                </tr>
            `;
            list.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- Products CRUD Logic ---
    const adminProductGrid = document.getElementById('admin-product-grid');
    const productFormContainer = document.getElementById('product-form-container');
    const productForm = document.getElementById('product-form');
    const btnAddProduct = document.getElementById('btn-add-product');
    const btnCancelProduct = document.getElementById('btn-cancel-product');

    async function fetchAdminProducts() {
        adminProductGrid.innerHTML = '<div class="text-center"><i class="fa-solid fa-spinner fa-spin"></i></div>';
        const products = await DataManager.getProducts();
        adminProductGrid.innerHTML = '';

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'admin-p-card';
            card.innerHTML = `
                <div class="admin-p-header">
                    <img src="${p.imagen}" class="admin-p-img" onerror="this.src='./imagenes/logo.png'">
                    <div class="admin-p-info">
                        <h4>${p.nombre}</h4>
                        <small class="text-muted">${p.categoria}</small>
                    </div>
                </div>
                <div class="admin-p-actions">
                    <button class="btn btn-outline btn-sm edit-p" data-id="${p.id}"><i class="fa-solid fa-edit"></i> Editar</button>
                    <button class="btn btn-outline btn-sm delete-p" style="color:red; border-color:red;" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            adminProductGrid.appendChild(card);
        });

        // Edit Events
        adminProductGrid.querySelectorAll('.edit-p').forEach(btn => {
            btn.addEventListener('click', () => {
                const p = products.find(prod => prod.id === btn.dataset.id);
                showProductForm(p);
            });
        });

        // Delete Events
        adminProductGrid.querySelectorAll('.delete-p').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de eliminar este producto?')) {
                    await DataManager.deleteProduct(btn.dataset.id);
                    fetchAdminProducts();
                }
            });
        });
    }

    btnAddProduct.addEventListener('click', () => showProductForm());
    btnCancelProduct.addEventListener('click', () => productFormContainer.style.display = 'none');

    function showProductForm(p = null) {
        productFormContainer.style.display = 'block';
        document.getElementById('form-title').textContent = p ? 'Editar Producto' : 'Nuevo Producto';
        
        document.getElementById('p-id').value = p ? p.id : '';
        document.getElementById('p-nombre').value = p ? p.nombre : '';
        document.getElementById('p-categoria').value = p ? p.categoria : '';
        document.getElementById('p-descripcion').value = p ? p.descripcion : '';
        document.getElementById('p-ingredientes').value = p ? p.ingredientes : '';
        document.getElementById('p-imagen').value = p ? p.imagen : '';
        
        productFormContainer.scrollIntoView({ behavior: 'smooth' });
    }

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            id: document.getElementById('p-id').value || undefined,
            nombre: document.getElementById('p-nombre').value,
            categoria: document.getElementById('p-categoria').value,
            descripcion: document.getElementById('p-descripcion').value,
            ingredientes: document.getElementById('p-ingredientes').value,
            imagen: document.getElementById('p-imagen').value
        };

        await DataManager.saveProduct(productData);
        productFormContainer.style.display = 'none';
        fetchAdminProducts();
    });

    // --- Sections Content Logic ---
    async function fetchSectionsAdmin() {
        const sections = await DataManager.getSections();
        
        // Populate inputs
        if (sections['hero_h1']) document.getElementById('sec-hero-h1').value = sections['hero_h1'].valor;
        if (sections['hero_p']) document.getElementById('sec-hero-p').value = sections['hero_p'].valor;
        if (sections['hero_img']) document.getElementById('sec-hero-img').value = sections['hero_img'].imagen_url;

        if (sections['about_h2']) document.getElementById('sec-about-h2').value = sections['about_h2'].valor;
        if (sections['about_p1']) document.getElementById('sec-about-p1').value = sections['about_p1'].valor;
        if (sections['about_img']) document.getElementById('sec-about-img').value = sections['about_img'].imagen_url;
    }

    document.querySelectorAll('.save-section').forEach(btn => {
        btn.addEventListener('click', async () => {
            const zone = btn.dataset.section;
            btn.textContent = 'Guardando...';
            btn.disabled = true;

            if (zone === 'hero') {
                await DataManager.updateSection('hero_h1', document.getElementById('sec-hero-h1').value);
                await DataManager.updateSection('hero_p', document.getElementById('sec-hero-p').value);
                await DataManager.updateSection('hero_img', '', document.getElementById('sec-hero-img').value);
            } else if (zone === 'about') {
                await DataManager.updateSection('about_h2', document.getElementById('sec-about-h2').value);
                await DataManager.updateSection('about_p1', document.getElementById('sec-about-p1').value);
                await DataManager.updateSection('about_img', '', document.getElementById('sec-about-img').value);
            }

            btn.textContent = '¡Guardado!';
            setTimeout(() => {
                btn.textContent = zone === 'hero' ? 'Guardar Cambios Hero' : 'Guardar Cambios Sobre Nosotros';
                btn.disabled = false;
            }, 2000);
        });
    });

    // Initialize Auth session
    if (supabase) {
        checkSession();
    } else {
        console.error('Supabase not initialized. Please check your credentials in data.js.');
    }
});
