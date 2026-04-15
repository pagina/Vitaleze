// ==========================================
// Limpieza de caché viejo (PWA eliminada)
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

// ==========================================
// FUNCIONALIDAD DEL CATÁLOGO Y CARRITO
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Referencias DOM Principales
    const productGrid = document.getElementById('product-grid');
    const productFilters = document.getElementById('product-filters');
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    // Cargar Contenido Dinámico (Secciones)
    async function loadDynamicSections() {
        try {
            const sections = await DataManager.getSections();
            
            // Hero Section
            if (sections['hero_h1']) {
                const heroH1 = document.querySelector('.hero h1');
                if (heroH1) heroH1.innerHTML = sections['hero_h1'].valor;
            }
            if (sections['hero_p']) {
                const heroP = document.querySelector('.hero-content p');
                if (heroP) heroP.textContent = sections['hero_p'].valor;
            }
            if (sections['hero_img']?.imagen_url) {
                const heroImg = document.getElementById('hero-img');
                if (heroImg) heroImg.src = sections['hero_img'].imagen_url;
            }

            // About Section
            if (sections['about_h2']) {
                const aboutTitle = document.querySelector('.about .section-title');
                if (aboutTitle) aboutTitle.textContent = sections['about_h2'].valor;
            }
            if (sections['about_p1']) {
                const paragraphs = document.querySelectorAll('.about-text p');
                if (paragraphs[0]) paragraphs[0].innerHTML = sections['about_p1'].valor;
            }
            if (sections['about_img']?.imagen_url) {
                const aboutImg = document.getElementById('about-img');
                if (aboutImg) aboutImg.src = sections['about_img'].imagen_url;
            }
        } catch (e) {
            console.warn('Error cargando secciones dinámicas:', e);
        }
    }

    // Inicializar UI con resiliencia y en paralelo
    async function init() {
        const sectionsPromise = loadDynamicSections().catch(e => console.error('Error secciones:', e));
        const filtersPromise = initFilters().catch(e => console.error('Error filtros:', e));
        const productsPromise = renderProducts('all').catch(e => console.error('Error productos:', e));

        await Promise.all([sectionsPromise, filtersPromise, productsPromise]);
    }

    init();

    // 1. Navegación y Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.add('scrolled'); 
        }
    });
    
    // Fuerza fondo blanco por defecto para mejor lectura de logo
    navbar.classList.add('scrolled');

    // Menú móvil
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    // Cerrar menú móvil al hacer click en link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.querySelector('i').classList.add('fa-bars');
            mobileToggle.querySelector('i').classList.remove('fa-times');
        });
    });

    // 2. Renderizado de Productos y Filtros
    async function initFilters() {
        productFilters.innerHTML = '<button class="filter-btn active" data-filter="all">Todos</button>';
        
        const categories = await DataManager.getCategories();
        categories.forEach(cat => {
            if (!cat) return;
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            productFilters.appendChild(btn);
        });

        // Eventos de filtro
        productFilters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                productFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                await renderProducts(e.target.dataset.filter);
            });
        });
    }

    // Helper: crear imagen con fallback
    function createProductImage(src, alt) {
        const img = document.createElement('img');
        img.className = 'product-img';
        img.loading = 'lazy';
        img.alt = alt;
        img.src = src || './imagenes/logo.png';
        
        // Fallback si la imagen no carga
        img.onerror = function() {
            this.onerror = null; // evitar loop
            this.src = './imagenes/logo.png';
            this.style.objectFit = 'contain';
            this.style.padding = '2rem';
            this.style.background = '#f3f4f1';
        };
        
        return img;
    }

    async function renderProducts(filter) {
        productGrid.innerHTML = '<div class="text-center w-100" style="grid-column:1/-1;"><i class="fa-solid fa-spinner fa-spin fa-2x text-green"></i></div>';
        
        const allProducts = await DataManager.getProducts();
        const filtered = filter === 'all' ? allProducts : allProducts.filter(p => {
            const cats = Array.isArray(p.categoria) ? p.categoria : (p.categoria || '').split(',').map(c => c.trim());
            return cats.includes(filter);
        });

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p class="text-muted text-center w-100" style="grid-column: 1/-1;">No hay productos en esta categoría.</p>';
            return;
        }

        filtered.forEach(p => {
            const el = document.createElement('div');
            el.className = 'product-card';
            
            // Crear wrapper de imagen
            const imgWrapper = document.createElement('div');
            imgWrapper.className = 'product-img-wrapper';
            
            // Tag de categoría
            const catTag = document.createElement('span');
            catTag.className = 'product-category-tag';
            catTag.textContent = Array.isArray(p.categoria) ? p.categoria.join(' / ') : (p.categoria || 'Sin categoría');
            imgWrapper.appendChild(catTag);
            
            // Imagen con fallback
            const img = createProductImage(p.imagen, p.nombre);
            imgWrapper.appendChild(img);
            
            el.appendChild(imgWrapper);
            
            // Contenido
            const content = document.createElement('div');
            content.className = 'product-content';
            content.innerHTML = `
                <h3 class="product-title">${p.nombre}</h3>
                <p class="product-desc">${p.descripcion || ''}</p>
                ${p.ingredientes ? `<div class="product-ingredients"><strong>Ingredientes:</strong> ${p.ingredientes}</div>` : ''}
                <button class="btn btn-primary w-100 mt-2 btn-add-cart" data-id="${p.id}" data-nombre="${p.nombre}">
                    <i class="fa-solid fa-cart-shopping"></i> Agregar
                </button>
            `;
            el.appendChild(content);
            
            productGrid.appendChild(el);
        });

        // Eventos de Agregar al Carrito
        productGrid.querySelectorAll('.btn-add-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pId = btn.dataset.id;
                const pNombre = btn.dataset.nombre;
                addToCart(pId, pNombre);
                
                // Efecto de feedback visual rápido
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';
                btn.classList.add('btn-success');
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                }, 1000);
            });
        });
    }

    // Efecto sutil en hover
    const heroBg = document.querySelector('.hero-bg-shapes');
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        if(heroBg) {
            heroBg.style.transform = `translate(-${x * 30}px, -${y * 30}px)`;
        }
    });

    // -------------------------------------------------------------
    // 3. Lógica del Carrito de Compras
    // -------------------------------------------------------------
    let cart = [];
    
    const cartFloatingBtn = document.getElementById('cart-floating-btn');
    const cartCount = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const checkoutForm = document.getElementById('checkout-form');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartFloatingBtn && closeCartBtn && cartSidebar) {
        cartFloatingBtn.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            if (cartOverlay) cartOverlay.classList.add('active');
        });
        
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            if (cartOverlay) cartOverlay.classList.remove('active');
        });

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => {
                cartSidebar.classList.remove('active');
                cartOverlay.classList.remove('active');
            });
        }
    }

    window.addToCart = function(id, nombre) {
        const existing = cart.find(i => i.id === id);
        if (existing) {
            existing.cantidad++;
        } else {
            cart.push({ id, nombre, cantidad: 1 });
        }
        updateCart();
    };

    function updateCart() {
        if (!cartCount || !cartItemsContainer) return;

        // Actualizar contador
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;

        // Animar el botón del carrito
        cartFloatingBtn.classList.add('bounce');
        setTimeout(() => cartFloatingBtn.classList.remove('bounce'), 300);
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted text-center py-4">Tu carrito está vacío.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.nombre}</span>
                    <span class="cart-item-qty">Cantidad: ${item.cantidad}</span>
                </div>
                <div class="cart-item-actions">
                    <button type="button" class="btn-qty-minus" data-id="${item.id}" aria-label="Restar">-</button>
                    <button type="button" class="btn-qty-plus" data-id="${item.id}" aria-label="Sumar">+</button>
                    <button type="button" class="btn-remove-item" data-id="${item.id}" aria-label="Eliminar"><i class="fa-solid fa-trash text-muted"></i></button>
                </div>
            </div>
        `).join('');

        // Eventos a los botones internos del carrito
        cartItemsContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                cart = cart.filter(i => i.id !== id);
                updateCart();
            });
        });

        cartItemsContainer.querySelectorAll('.btn-qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item) item.cantidad++;
                updateCart();
            });
        });

        cartItemsContainer.querySelectorAll('.btn-qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const item = cart.find(i => i.id === id);
                if (item && item.cantidad > 1) {
                    item.cantidad--;
                } else if (item && item.cantidad === 1) {
                    cart = cart.filter(i => i.id !== id);
                }
                updateCart();
            });
        });
    }

    // -------------------------------------------------------
    // CHECKOUT: Enviar pedido por WhatsApp
    // -------------------------------------------------------
    // Usar el botón por ID directamente (NO buscar por type="submit")
    var btnCheckoutWA = document.getElementById('btn-checkout-wa');
    
    if (btnCheckoutWA) {
        btnCheckoutWA.addEventListener('click', function(e) {
            e.preventDefault();
            
            try {
                // Validar carrito
                if (cart.length === 0) {
                    alert('Agrega al menos un producto al carrito');
                    return;
                }

                // Obtener valores del formulario
                var nombre = document.getElementById('co-nombre') ? document.getElementById('co-nombre').value.trim() : '';
                var telefono = document.getElementById('co-telefono') ? document.getElementById('co-telefono').value.trim() : '';
                var direccion = document.getElementById('co-direccion') ? document.getElementById('co-direccion').value.trim() : '';

                if (!nombre || !telefono || !direccion) {
                    alert('Por favor completá todos los campos');
                    return;
                }

                // Construir mensaje
                var msg = 'Hola Vitaleze 🌾, quisiera confirmar mi pedido!\n\n';
                msg += '*Mis datos:*\n';
                msg += 'Nombre: ' + nombre + '\n';
                msg += 'Tel: ' + telefono + '\n';
                msg += 'Direccion: ' + direccion + '\n\n';
                msg += '*Mi pedido:*\n';
                for (var i = 0; i < cart.length; i++) {
                    msg += '- ' + cart[i].cantidad + 'x ' + cart[i].nombre + '\n';
                }
                msg += '\nAguardo confirmacion, muchas gracias!';

                var waUrl = 'https://wa.me/5493512755594?text=' + encodeURIComponent(msg);

                // Guardar pedido en DB (fire-and-forget, no bloquea nada)
                try {
                    if (typeof DataManager !== 'undefined' && DataManager.saveOrder) {
                        DataManager.saveOrder({
                            cliente: nombre,
                            telefono: telefono,
                            direccion: direccion,
                            productos: cart.slice(),
                            total: 0,
                            fecha: new Date().toISOString()
                        }).catch(function() {});
                    }
                } catch(dbErr) {}

                // Limpiar carrito
                cart = [];
                updateCart();
                if (cartSidebar) cartSidebar.classList.remove('active');
                if (cartOverlay) cartOverlay.classList.remove('active');
                if (checkoutForm) checkoutForm.reset();

                // *** NAVEGAR A WHATSAPP ***
                // Usar window.location.href que es el método más confiable en TODOS los navegadores
                // En móvil abre la app de WhatsApp nativa
                // En desktop redirige a web.whatsapp.com
                window.location.href = waUrl;

            } catch(err) {
                // Si algo falla, al menos mostrar el link para que el usuario lo copie
                alert('Hubo un error. Intentá de nuevo o escribinos directamente al 351-275-5594');
                console.error('Error checkout:', err);
            }
        });
    } else {
        console.error('ERROR: No se encontró el botón #btn-checkout-wa');
    }

});
