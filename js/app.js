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
                <button class="btn btn-primary w-100 mt-2 btn-order" data-id="${p.id}" data-nombre="${p.nombre}">
                    <i class="fa-brands fa-whatsapp"></i> Pedir
                </button>
            `;
            el.appendChild(content);
            
            productGrid.appendChild(el);
        });

        // Eventos de Pedido
        productGrid.querySelectorAll('.btn-order').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const pId = btn.dataset.id;
                const pNombre = btn.dataset.nombre;

                // Guardar pedido
                await DataManager.saveOrder({
                    cliente: 'Cliente Web',
                    productos: { id: pId, nombre: pNombre },
                    fecha: new Date().toISOString()
                });

                // Redirigir a WhatsApp
                const waText = encodeURIComponent(`Hola Vitaleze, quiero encargar: ${pNombre} 🌾`);
                window.open(`https://wa.me/5493512755594?text=${waText}`, '_blank');
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

});
