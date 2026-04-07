// Gestión de Datos VITALEZE 🌾 - MODO 100% LOCAL
// Este archivo carga los datos directamente sin depender de servidores externos.

class DataManager {
    // 1. Catálogo Completo de Productos (Basado en carpeta /imagenes)
    static products = [
        { 
            id: 'p1', 
            nombre: 'Dona de Chocolate Keto', 
            categoria: ['Keto'], 
            descripcion: 'Una delicia irresistible: dona húmeda bañada en chocolate 70% cacao. Perfecta para saciar tus antojos sin salirte de tu dieta.', 
            ingredientes: 'Chocolate 70% cacao, harina de almendra, stevia.', 
            imagen: './imagenes/dona.png' 
        },
        { 
            id: 'p2', 
            nombre: 'Pan de Almendras (Keto)', 
            categoria: ['Panadería', 'Keto'], 
            descripcion: 'El aliado perfecto para tus mañanas. Pan denso, nutritivo y con una textura increíble, ideal para tus tostadas.', 
            ingredientes: 'Harina de almendras, huevo, sal marina.', 
            imagen: './imagenes/pan de almendras.png' 
        },
        { 
            id: 'p3', 
            nombre: 'Pan Nube Keto', 
            categoria: ['Panadería', 'Keto'], 
            descripcion: 'Nuestra opción más liviana y versátil. Pan ultra esponjoso, sin carbohidratos, ideal para sándwiches nutritivos.', 
            ingredientes: 'Huevo, leche en polvo descremada y ajo.', 
            imagen: './imagenes/pan nube keto.jpg' 
        },
        { 
            id: 'p4', 
            nombre: 'Pan Nube Tradicional', 
            categoria: ['Panadería', 'Keto'], 
            descripcion: 'La versión original del famoso Cloud Bread. Esponjoso, aireado y perfecto para cualquier momento del día.', 
            ingredientes: 'Huevo, queso crema seleccionado.', 
            imagen: './imagenes/pan nube.png' 
        },
        { 
            id: 'p5', 
            nombre: 'Galletas de Avena y Pasas', 
            categoria: ['Snacks'], 
            descripcion: 'Súper crocantes y cargadas de sabor natural. Elaboradas con avena integral para darte energía duradera.', 
            ingredientes: 'Avena integral, pasas de uva, miel natural.', 
            imagen: './imagenes/galletas.png' 
        },
        { 
            id: 'p6', 
            nombre: 'Pan Integral de Masa Madre', 
            categoria: ['Panadería'], 
            descripcion: 'Pan artesanal fermentado naturalmente. Con un mix de semillas que aportan fibra y una corteza rústica.', 
            ingredientes: 'Harina integral, semillas de lino, chía, masa madre.', 
            imagen: './imagenes/pan integral.png' 
        },
        { 
            id: 'p7', 
            nombre: 'Granola Crunchy', 
            categoria: ['Snacks'], 
            descripcion: 'El toque perfecto para tu bowl. Mix equilibrado de cereales y frutos secos tostados con un toque de miel.', 
            ingredientes: 'Avena, nueces, almendras, miel.', 
            imagen: './imagenes/granola.png' 
        },
        { 
            id: 'p9', 
            nombre: 'Almohaditas Rellenas (1.2kg)', 
            categoria: ['Frutos Secos', 'Snacks'], 
            descripcion: 'Un clásico para toda la familia en formato grande. Cereal crocante con rellenos deliciosos para tus meriendas.', 
            ingredientes: 'Cereal de trigo, relleno variado.', 
            imagen: './imagenes/almohaditas de 1,2 kg.png' 
        },
        { 
            id: 'p10', 
            nombre: 'Frutos Secos 1/2 kg', 
            categoria: ['Frutos Secos'], 
            descripcion: 'La mejor selección de nuestra tienda. Nueces, almendras, maní y pasas seleccionadas para tu máxima vitalidad.', 
            ingredientes: 'Nueces, almendras, maní, pasas de uva.', 
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
        return this.products;
    }

    static async getCategories() {
        // Obtenemos todas las categorías, manejando tanto strings como arrays
        const allCategories = this.products.flatMap(p => 
            Array.isArray(p.categoria) ? p.categoria : [p.categoria]
        );
        // Devolvemos una lista única de categorías válidas
        return Array.from(new Set(allCategories)).filter(c => c);
    }

    static async getSections() {
        return this.sections;
    }

    static async saveOrder(order) {
        console.log('Pedido registrado localmente:', order);
        return { success: true };
    }

    static async getOrders() { return []; }
    static async saveProduct() { return null; }
    static async updateSection() { return null; }
    static async deleteProduct() { return null; }
}
