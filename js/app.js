// ==========================================
// VITALEZE APP v2026.04.15b
// Limpieza de caché viejo (PWA eliminada)
// ==========================================
console.log('✅ app.js v2026.04.15b cargado');
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
                if (heroImg) {
                    var heroSrc = sections['hero_img'].imagen_url;
                    // Validar base64 truncadas
                    if (heroSrc.startsWith('data:') && heroSrc.length < 200) {
                        console.warn('Hero imagen base64 truncada, usando default');
                    } else {
                        heroImg.onerror = function() { this.onerror = null; this.src = './imagenes/hero-demo.jpg'; };
                        heroImg.src = heroSrc;
                    }
                }
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
                if (aboutImg) {
                    var aboutSrc = sections['about_img'].imagen_url;
                    if (aboutSrc.startsWith('data:') && aboutSrc.length < 200) {
                        console.warn('About imagen base64 truncada, usando default');
                    } else {
                        aboutImg.onerror = function() { this.onerror = null; this.src = './imagenes/about-demo.jpg'; };
                        aboutImg.src = aboutSrc;
                    }
                }
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

        // Mostrar carrito restaurado desde localStorage
        if (cart.length > 0) updateCart();
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

    // Helper: crear imagen con fallback robusto
    // Maneja imágenes base64 corruptas/truncadas que salen negras
    function createProductImage(src, alt) {
        const img = document.createElement('img');
        img.className = 'product-img';
        img.loading = 'lazy';
        img.alt = alt;
        img.style.background = '#f3f4f1'; // fondo claro por defecto para evitar flash negro
        
        // Validar la fuente de la imagen
        let validSrc = './imagenes/logo.png'; // default fallback
        
        if (src && typeof src === 'string') {
            if (src.startsWith('data:image/')) {
                // Es base64 — verificar que no esté truncada/corrupta
                // Un base64 válido de imagen real tiene al menos ~200 chars después del header
                var commaIndex = src.indexOf(',');
                if (commaIndex > 0 && src.length > commaIndex + 100) {
                    validSrc = src;
                } else {
                    console.warn('Imagen base64 truncada para:', alt);
                }
            } else if (src.trim() !== '') {
                // URL normal o ruta de archivo
                validSrc = src;
            }
        }
        
        img.src = validSrc;
        
        // Fallback si la imagen no carga
        img.onerror = function() {
            this.onerror = null; // evitar loop
            this.src = './imagenes/logo.png';
            this.style.objectFit = 'contain';
            this.style.padding = '2rem';
            this.style.background = '#f3f4f1';
        };
        
        // Detectar imágenes que cargan pero son "negras" (1x1 px o muy pequeñas)
        img.onload = function() {
            if (this.naturalWidth <= 1 || this.naturalHeight <= 1) {
                this.onerror = null;
                this.src = './imagenes/logo.png';
                this.style.objectFit = 'contain';
                this.style.padding = '2rem';
                this.style.background = '#f3f4f1';
            }
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
                <span class="product-price">${formatPrecio(p.precio)}</span>
                <p class="product-desc">${p.descripcion || ''}</p>
                ${p.ingredientes ? `<div class="product-ingredients"><strong>Ingredientes:</strong> ${p.ingredientes}</div>` : ''}
                <button class="btn btn-primary w-100 mt-2 btn-add-cart" data-id="${p.id}" data-nombre="${p.nombre}" data-precio="${p.precio || 0}">
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
                const pPrecio = Number(btn.dataset.precio) || 0;
                addToCart(pId, pNombre, pPrecio);
                
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
    const CART_KEY = 'vitaleze_cart';

    function saveCart() {
        try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(_) {}
    }

    function loadCart() {
        try {
            const saved = localStorage.getItem(CART_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch(_) {}
        return [];
    }

    let cart = loadCart();
    
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

    window.addToCart = function(id, nombre, precio) {
        const existing = cart.find(i => i.id === id);
        if (existing) {
            existing.cantidad++;
        } else {
            cart.push({ id, nombre, precio: precio || 0, cantidad: 1 });
        }
        updateCart();
    };

    function updateCart() {
        if (!cartCount || !cartItemsContainer) return;

        // Persistir carrito en localStorage
        saveCart();

        // Actualizar contador
        const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
        cartCount.textContent = totalItems;

        // Animar el botón del carrito
        cartFloatingBtn.classList.add('bounce');
        setTimeout(() => cartFloatingBtn.classList.remove('bounce'), 300);
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-muted text-center py-4">Tu carrito está vacío.</p>';
            // Limpiar total
            const totalEl = document.getElementById('cart-total');
            if (totalEl) totalEl.style.display = 'none';
            return;
        }

        // Calcular total general
        const cartTotal = cart.reduce((sum, item) => sum + (item.precio || 0) * item.cantidad, 0);

        cartItemsContainer.innerHTML = cart.map(item => {
            const subtotal = (item.precio || 0) * item.cantidad;
            const precioStr = item.precio > 0 ? formatPrecio(item.precio) : '';
            const subtotalStr = (item.precio > 0 && item.cantidad > 1) ? `<span class="cart-item-subtotal">Subtotal: ${formatPrecio(subtotal)}</span>` : '';
            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.nombre}</span>
                    <span class="cart-item-qty">Cantidad: ${item.cantidad}${precioStr ? ' × ' + precioStr : ''}</span>
                    ${subtotalStr}
                </div>
                <div class="cart-item-actions">
                    <button type="button" class="btn-qty-minus" data-id="${item.id}" aria-label="Restar">-</button>
                    <button type="button" class="btn-qty-plus" data-id="${item.id}" aria-label="Sumar">+</button>
                    <button type="button" class="btn-remove-item" data-id="${item.id}" aria-label="Eliminar"><i class="fa-solid fa-trash text-muted"></i></button>
                </div>
            </div>`;
        }).join('');

        // Mostrar total general
        let totalEl = document.getElementById('cart-total');
        if (!totalEl) {
            totalEl = document.createElement('div');
            totalEl.id = 'cart-total';
            totalEl.className = 'cart-total';
            cartItemsContainer.parentElement.insertBefore(totalEl, cartItemsContainer.nextSibling);
        }
        if (cartTotal > 0) {
            totalEl.innerHTML = '<strong>Total: ' + formatPrecio(cartTotal) + '</strong>';
            totalEl.style.display = 'block';
        } else {
            totalEl.style.display = 'none';
        }

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
        console.log('✅ Botón checkout encontrado, handler registrado');
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

                // Construir mensaje con precios
                var totalPedido = 0;
                var msg = 'Hola Vitaleze 🌾, quisiera confirmar mi pedido!\n\n';
                msg += '*Mis datos:*\n';
                msg += 'Nombre: ' + nombre + '\n';
                msg += 'Tel: ' + telefono + '\n';
                msg += 'Direccion: ' + direccion + '\n\n';
                msg += '*Mi pedido:*\n';
                for (var i = 0; i < cart.length; i++) {
                    var itemPrecio = Number(cart[i].precio) || 0;
                    var itemSubtotal = itemPrecio * cart[i].cantidad;
                    totalPedido += itemSubtotal;
                    msg += '- ' + cart[i].cantidad + 'x ' + cart[i].nombre;
                    if (itemPrecio > 0) msg += ' (' + formatPrecio(itemPrecio) + ' c/u)';
                    msg += '\n';
                }
                if (totalPedido > 0) {
                    msg += '\n*Total: ' + formatPrecio(totalPedido) + '*';
                }
                msg += '\nAguardo confirmacion, muchas gracias!';

                var waUrl = 'https://wa.me/5493512755594?text=' + encodeURIComponent(msg);

                // ── MAKE.COM: Enviar pedido automáticamente ──
                try {
                    var MAKE_WEBHOOK = 'https://hook.us2.make.com/t0h4fngbbk1tv21hygulft6vv34fpbba';

                    var itemsTexto = cart.map(function(item) {
                        return item.nombre + ' x' + item.cantidad + ' ($' + (item.precio * item.cantidad) + ')';
                    }).join(', ');

                    fetch(MAKE_WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nombre:    nombre,
                            telefono:  telefono,
                            direccion: direccion,
                            productos: itemsTexto,
                            total:     totalPedido,
                            fecha:     new Date().toLocaleString('es-AR')
                        })
                    })
                    .catch(function(err) { console.error('Make webhook error:', err); });
                } catch(makeErr) {
                    console.error('Make webhook error:', makeErr);
                }
                // ── Fin Make.com ──

                // Guardar pedido en DB (fire-and-forget, no bloquea nada)
                try {
                    if (typeof DataManager !== 'undefined' && DataManager.saveOrder) {
                        DataManager.saveOrder({
                            cliente: nombre,
                            telefono: telefono,
                            direccion: direccion,
                            productos: cart.slice(),
                            total: totalPedido,
                            fecha: new Date().toISOString()
                        }).catch(function() {});
                    }
                } catch(dbErr) {}

                // Limpiar carrito
                cart = [];
                saveCart();
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
