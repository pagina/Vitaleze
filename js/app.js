document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM Principales
    const productGrid = document.getElementById('product-grid');
    const productFilters = document.getElementById('product-filters');
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    // Inicializar UI
    initFilters();
    renderProducts('all');

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
    function initFilters() {
        // Limpiamos siempre primero
        productFilters.innerHTML = '<button class="filter-btn active" data-filter="all">Todos</button>';
        
        const categories = DataManager.getCategories();
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.filter = cat;
            btn.textContent = cat;
            productFilters.appendChild(btn);
        });

        // Eventos de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts(e.target.dataset.filter);
            });
        });
    }

    function renderProducts(filter) {
        productGrid.innerHTML = '';
        const allProducts = DataManager.getProducts();
        const filtered = filter === 'all' ? allProducts : allProducts.filter(p => p.categoria === filter);

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p class="text-muted text-center w-100" style="grid-column: 1/-1;">No hay productos en esta categoría.</p>';
            return;
        }

        filtered.forEach(p => {
            const el = document.createElement('div');
            el.className = 'product-card';
            
            // Format WhatsApp Message
            const waText = encodeURIComponent(`Hola Vitaleze, quiero encargar: ${p.nombre} 🌾`);
            const waLink = `https://wa.me/5493512755594?text=${waText}`;

            el.innerHTML = `
                <div class="product-img-wrapper">
                    <span class="product-category-tag">${p.categoria}</span>
                    <img src="${p.imagen}" alt="${p.nombre}" class="product-img" loading="lazy">
                </div>
                <div class="product-content">
                    <h3 class="product-title">${p.nombre}</h3>
                    <p class="product-desc">${p.descripcion}</p>
                    ${p.ingredientes ? `<div class="product-ingredients"><strong>Ingredientes:</strong> ${p.ingredientes}</div>` : ''}
                    <a href="${waLink}" target="_blank" class="btn btn-primary w-100 mt-2">
                        <i class="fa-brands fa-whatsapp"></i> Pedir
                    </a>
                </div>
            `;
            productGrid.appendChild(el);
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
