// Gestión de Datos VITALEZE 🌾 - MODO 100% LOCAL
// Este archivo carga los datos directamente sin depender de servidores externos.

class DataManager {
    // 1. Catálogo Completo de Productos (Basado en carpeta /imagenes)
    static products = [
        { 
            id: 'p1', 
            nombre: 'Dona de Chocolate Keto', 
            categoria: 'Keto', 
            descripcion: 'Dona húmeda bañada en chocolate 70% cacao.', 
            ingredientes: 'Chocolate, harina de almendra, stevia.', 
            imagen: './imagenes/dona.png' 
        },
        { 
            id: 'p2', 
            nombre: 'Pan de Almendras (Keto)', 
            categoria: 'Keto', 
            descripcion: 'Pan denso y nutritivo, ideal para tostadas.', 
            ingredientes: 'Harina de almendras, huevo, sal.', 
            imagen: './imagenes/pan de almendras.png' 
        },
        { 
            id: 'p3', 
            nombre: 'Pan Nube Keto', 
            categoria: 'Keto', 
            descripcion: 'Pan ultra liviano sin carbohidratos.', 
            ingredientes: 'Huevo, queso crema, polvo horneado.', 
            imagen: './imagenes/pan nube keto.jpg' 
        },
        { 
            id: 'p4', 
            nombre: 'Pan Nube Tradicional', 
            categoria: 'Keto', 
            descripcion: 'La versión original del famoso Cloud Bread.', 
            ingredientes: 'Huevo, queso crema.', 
            imagen: './imagenes/pan nube.png' 
        },
        { 
            id: 'p5', 
            nombre: 'Galletas de Avena y Pasas', 
            categoria: 'Panadería', 
            descripcion: 'Súper crocantes y nutritivas.', 
            ingredientes: 'Avena, pasas de uva, miel.', 
            imagen: './imagenes/galletas.png' 
        },
        { 
            id: 'p6', 
            nombre: 'Pan Integral de Masa Madre', 
            categoria: 'Panadería', 
            descripcion: 'Pan artesanal con mix de 7 semillas.', 
            ingredientes: 'Harina integral, semillas, masa madre.', 
            imagen: './imagenes/pan integral.png' 
        },
        { 
            id: 'p7', 
            nombre: 'Granola Crunchy', 
            categoria: 'Desayunos', 
            descripcion: 'Mix de cereales y frutos secos para tus desayunos.', 
            ingredientes: 'Avena, nueces, miel.', 
            imagen: './imagenes/granola.png' 
        },
        { 
            id: 'p8', 
            nombre: 'Mix Vitalidad', 
            categoria: 'Frutos Secos', 
            descripcion: 'Nueces, almendras y castañas de cajú seleccionadas.', 
            ingredientes: 'Nueces, almendras, castañas.', 
            imagen: './imagenes/mix.png' 
        },
        { 
            id: 'p9', 
            nombre: 'Almohaditas Rellenas (1.2kg)', 
            categoria: 'Frutos Secos', 
            descripcion: 'Formato familiar de almohaditas crocantes y nutritivas.', 
            ingredientes: 'Cereal, relleno variado.', 
            imagen: './imagenes/almohaditas de 1,2 kg.png' 
        },
        { 
            id: 'p10', 
            nombre: 'Mix Familiar (1.2kg)', 
            categoria: 'Frutos Secos', 
            descripcion: 'Mix grande de frutos secos seleccionado para compartir.', 
            ingredientes: 'Nueces, almendras, maní, pasas.', 
            imagen: './imagenes/fruto secos 1,2 kg.jpg' 
        }
    ];

    // 2. Secciones del Sitio (Textos Principales)
    static sections = {
        'hero_h1': { valor: 'Alimentación saludable a <span class="text-gradient">tu alcance</span>', imagen_url: './imagenes/hero-demo.jpg' },
        'hero_p': { valor: 'Opciones nutritivas para tu día a día. Budines, barras proteicas, panadería integral y más, listos para recargar tu energía.', imagen_url: null },
        'about_h2': { valor: 'Sobre Nosotros', imagen_url: './imagenes/about-demo.jpg' },
        'about_p1': { valor: '<strong>Vitaleze 🌾</strong> es un lugar pensado para acercarte opciones saludables y nutritivas. Ofrecemos productos ideales para desayunos, meriendas o esos momentos donde necesitas un plus de energía.', imagen_url: null }
    };

    // --- MÉTODOS DE ACCESO ---
    
    static async getProducts() {
        // En modo local siempre devolvemos el catálogo estático de inmediato
        return this.products;
    }

    static async getCategories() {
        const categories = new Set(this.products.map(p => p.categoria));
        return Array.from(categories).filter(c => c);
    }

    static async getSections() {
        return this.sections;
    }

    // El guardado de pedidos ahora se hace solo por WhatsApp, 
    // pero podemos guardar un log local si se desea.
    static async saveOrder(order) {
        console.log('Pedido registrado localmente:', order);
        return { success: true };
    }

    static async getOrders() {
        return [];
    }

    // Métodos de Admin (Desactivados en modo lectura local pura)
    static async saveProduct() { return null; }
    static async updateSection() { return null; }
    static async deleteProduct() { return null; }
}
