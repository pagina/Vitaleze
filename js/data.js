// Datos por defecto (Seed Data) v7
const defaultProducts = [
    {
        id: "prod_2",
        nombre: "Galletitas y Barras",
        categoria: "Galletas",
        descripcion: "Galletas crocantes y barras llenas de energía con chips de chocolate amargo.",
        ingredientes: "Avena arrollada, harina integral, chips 70% cacao, pasta de maní.",
        imagen: "./assets/galletas.png"
    },
    {
        id: "prod_6",
        nombre: "Donuts sin azucar",
        categoria: "Alfajores",
        descripcion: "rosquilla tipo donut elaboradas sin azucar añadidas,pensadas como una opcion mas saludable o apta para personas que buscan reducir el consumo de azucar.",
        ingredientes: "Harina de trigo,huevo,leche,aceite vegetal,edulcorantes,polvo de hornear,cobertura de chocolate sin azucar.",
        imagen: "./assets/dona.png"
    },
    {
        id: "prod_7",
        nombre: "Pan Integral",
        categoria: "Panadería",
        descripcion: "Pan artesanal elaborado con harina integral 100%. Textura suave por dentro y crocante por fuera, perfecto para tus desayunos y meriendas saludables.",
        ingredientes: "Harina integral, levadura natural, aceite de oliva, semillas de lino, sal marina, agua purificada.",
        imagen: "./assets/pan integral.png"
    },
    {
        id: "prod_8",
        nombre: "Pan de Almendras",
        categoria: "Panadería",
        descripcion: "Pan bajo en carbohidratos elaborado con harina de almendras. Ideal para dietas keto y celíacos. Liviano, esponjoso y con un sabor único.",
        ingredientes: "Harina de almendras, huevos, aceite de coco, polvo de hornear, sal rosada.",
        imagen: "./assets/pan de almendras.png"
    },
    {
        id: "prod_9",
        nombre: "Granola Artesanal",
        categoria: "Cereales",
        descripcion: "Mezcla crocante de avena, frutos secos y semillas, horneada lentamente con miel pura. Perfecta para acompañar yogur, leche o comer como snack.",
        ingredientes: "Avena arrollada, almendras, nueces, semillas de girasol, semillas de chía, miel orgánica, aceite de coco, canela.",
        imagen: "./assets/granola.png"
    },
    {
        id: "prod_10",
        nombre: "Pan Nube",
        categoria: "Panadería",
        descripcion: "Ultraliviano y esponjoso, el pan nube es la alternativa sin harina perfecta. Con solo 3 ingredientes, es ideal para quienes buscan opciones bajas en carbohidratos.",
        ingredientes: "Queso crema, huevos, cremor tártaro.",
        imagen: "./assets/pan nube.png"
    },
    {
        id: "prod_11",
        nombre: "Almohaditas de ½ kg",
        categoria: "Cereales",
        descripcion: "Crujientes almohaditas rellenas de chocolate, ideales para un desayuno completo o merienda dulce. Presentación de medio kilo para que te dure toda la semana.",
        ingredientes: "Harina integral, relleno de chocolate semiamargo, azúcar mascabo, aceite vegetal, extracto de malta.",
        imagen: "./assets/almohaditas de 1,2 kg.png"
    },
    {
        id: "prod_12",
        nombre: "Pan Nube Keto",
        categoria: "Panadería",
        descripcion: "Liviano, proteico y 100% libre de harinas. Una opción ideal para quienes siguen una dieta keto o baja en carbohidratos.",
        ingredientes: "Huevo, leche en polvo descremada, ajo y aditivos permitidos.",
        imagen: "./assets/pan nube keto.jpg"
    },
    {
        id: "prod_13",
        nombre: "Frutos Secos ½ kg",
        categoria: "Frutos secos",
        descripcion: "Mezcla premium de frutos secos en presentación de medio kilo. Perfectos para snackear sano, agregar a tus comidas o disfrutar en cualquier momento del día.",
        ingredientes: "Nueces, almendras, castañas de cajú, maní tostado, pasas de uva.",
        imagen: "./assets/fruto secos 1,2 kg.jpg"
    }
];

// Gestión de Datos
class DataManager {
    static init() {
        // Usamos una nueva clave (v7) para asegurar que tome los nuevos datos e ignore los viejos
        if (!localStorage.getItem('vitaleze_productos_v7')) {
            localStorage.setItem('vitaleze_productos_v7', JSON.stringify(defaultProducts));
        }
    }

    // --- PRODUCTOS ---
    static getProducts() {
        return JSON.parse(localStorage.getItem('vitaleze_productos_v7')) || [];
    }

    static saveProduct(product) {
        const products = this.getProducts();
        if (product.id) {
            // Update
            const index = products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                products[index] = product;
            } else {
                products.push(product); // fallback
            }
        } else {
            // Create
            product.id = 'prod_' + Date.now();
            products.push(product);
        }
        localStorage.setItem('vitaleze_productos_v7', JSON.stringify(products));
        return product;
    }

    static deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('vitaleze_productos_v7', JSON.stringify(products));
    }

    static getCategories() {
        const products = this.getProducts();
        const categories = new Set(products.map(p => p.categoria));
        return Array.from(categories);
    }
}

// Inicializar al cargar el script
DataManager.init();
