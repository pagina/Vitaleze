// =============================================
// VITALEZE 🌾 — CAPA DE DATOS
// Supabase (primario) + fallback local
// Proyecto: joojnfeficesvoupwmsw
// =============================================

var SUPABASE_URL = 'https://joojnfeficesvoupwmsw.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impvb2puZmVmaWNlc3ZvdXB3bXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDQ3NTcsImV4cCI6MjA5MDgyMDc1N30.ZNRK_M8HcI6py1smNMSXyQ4sXrLDnQmtN7wTt_U49lE';

// Contraseña local de emergencia (siempre funciona)
var LOCAL_PASS = 'vitaleze2026';

// ---- Inicializar Supabase ----
var sb = null;
try {
    if (typeof window !== 'undefined' && window.supabase) {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado a: ' + SUPABASE_URL);
    } else {
        console.warn('⚠️ Supabase SDK no se cargó');
    }
} catch (e) {
    console.warn('⚠️ Error Supabase:', e);
}

// ---- Datos locales de respaldo ----
var FALLBACK_PRODUCTS = [
    { id: 'f1', nombre: 'Dona de Chocolate Keto', categoria: 'Keto', descripcion: 'Exquisita dona keto, esponjosa y bañada en auténtico chocolate 70% cacao. El equilibrio perfecto entre sabor y nutrición.', ingredientes: 'Chocolate 70% cacao, harina de almendra, stevia.', imagen: './imagenes/dona.png' },
    { id: 'f2', nombre: 'Pan de Almendras (Keto)', categoria: 'Panadería, Keto', descripcion: 'Nuestro pan de almendras destaca por su textura noble y gran aporte nutricional. Una opción premium para realzar tus desayunos.', ingredientes: 'Harina de almendras, huevo, sal marina.', imagen: './imagenes/pan de almendras.png' },
    { id: 'f3', nombre: 'Pan Nube Keto', categoria: 'Panadería, Keto', descripcion: 'Ligero como el aire. Este pan keto sin carbohidratos es la opción más liviana y deliciosa para acompañar tus comidas diarias sin culpa.', ingredientes: 'Huevo, leche en polvo descremada y ajo.', imagen: './imagenes/pan nube keto.jpg' },
    { id: 'f4', nombre: 'Pan Nube Tradicional', categoria: 'Panadería', descripcion: 'Descubrí la textura única de nuestro pan tradicional. Increíblemente esponjoso, aireado al paladar y sumamente versátil.', ingredientes: 'Huevo, queso crema seleccionado.', imagen: './imagenes/pan nube.png' },
    { id: 'f5', nombre: 'Galletas de Avena y Pasas', categoria: 'Snacks', descripcion: 'Galletas crujientes horneadas pacientemente, elaboradas con avena 100% integral. El snack natural, dulce y repleto de fibra.', ingredientes: 'Avena integral, pasas de uva, miel natural.', imagen: './imagenes/galletas.png' },
    { id: 'f6', nombre: 'Pan Integral de Masa Madre', categoria: 'Panadería', descripcion: 'Pan artesanal con fermentación natural prolongada. Realza los sabores auténticos y favorece la digestión. Un clásico indispensable.', ingredientes: 'Harina integral, semillas de lino, chía, masa madre.', imagen: './imagenes/pan integral.png' },
    { id: 'f7', nombre: 'Granola', categoria: 'Snacks', descripcion: 'Exclusiva mezcla de cereales tostados a la perfección. Aporta ese toque dulce y crujiente ideal para tus bowls y yogures diarios.', ingredientes: 'Avena, nueces, almendras, miel.', imagen: './imagenes/granola.png' },
    { id: 'f8', nombre: 'Almohaditas Rellenas (1/2kg)', categoria: 'Frutos Secos, Snacks', descripcion: 'Pequeñas delicias de cereal crocante con un corazón suave y sabroso. En formato ideal para disfrutar como snack dulce o desayuno.', ingredientes: 'Cereal de trigo, relleno variado.', imagen: './imagenes/almohaditas de 1,2 kg.png' },
    { id: 'f9', nombre: 'Frutos Secos 1/2 kg', categoria: 'Frutos Secos', descripcion: 'Selección premium de los mejores frutos: nueces enteras, almendras tostadas, maní y pasas dulces. Energía 100% natural, lista para consumir.', ingredientes: 'Nueces, almendras, maní, pasas de uva.', imagen: './imagenes/fruto secos 1,2 kg.jpg' }
];

var FALLBACK_SECTIONS = {
    hero_h1: { valor: 'Alimentación saludable a <span class="text-gradient">tu alcance</span>' },
    hero_p: { valor: 'Opciones nutritivas para tu día a día.' },
    hero_img: { valor: '', imagen_url: './imagenes/hero-demo.jpg' },
    about_h2: { valor: 'Sobre Nosotros' },
    about_p1: { valor: '<strong>Vitaleze 🌾</strong> es un lugar pensado para acercarte opciones saludables y nutritivas.' },
    about_img: { valor: '', imagen_url: './imagenes/about-demo.jpg' }
};

// =============================================
// DATA MANAGER
// =============================================
class DataManager {

    // ===== PRODUCTOS =====
    static async getProducts() {
        if (sb) {
            try {
                var r = await sb.from('vitaleze_productos').select('*').order('created_at', { ascending: true });
                if (!r.error && r.data && r.data.length > 0) return r.data;
            } catch (e) { console.warn('getProducts error:', e); }
        }
        return FALLBACK_PRODUCTS;
    }

    static async getCategories() {
        var products = await this.getProducts();
        var cats = [];
        products.forEach(function(p) {
            if (p.categoria) {
                p.categoria.split(',').forEach(function(c) {
                    var trimmed = c.trim();
                    if (trimmed && cats.indexOf(trimmed) === -1) cats.push(trimmed);
                });
            }
        });
        return cats;
    }

    static async saveProduct(productData) {
        if (!sb) throw new Error('Supabase no conectado. Ejecutá el SQL primero.');
        var payload = {};
        for (var key in productData) { payload[key] = productData[key]; }
        if (!payload.id || payload.id === '') delete payload.id;

        var r = await sb.from('vitaleze_productos').upsert([payload], { onConflict: 'id' }).select();
        if (r.error) throw new Error(r.error.message);
        return r.data;
    }

    static async deleteProduct(id) {
        if (!sb) throw new Error('Supabase no conectado');
        var r = await sb.from('vitaleze_productos').delete().eq('id', id);
        if (r.error) throw new Error(r.error.message);
    }

    // ===== SECCIONES =====
    static async getSections() {
        if (sb) {
            try {
                var r = await sb.from('vitaleze_secciones').select('*');
                if (!r.error && r.data && r.data.length > 0) {
                    var obj = {};
                    r.data.forEach(function(row) {
                        obj[row.clave] = { valor: row.valor, imagen_url: row.imagen_url };
                    });
                    return obj;
                }
            } catch (e) { console.warn('getSections error:', e); }
        }
        return FALLBACK_SECTIONS;
    }

    static async updateSection(clave, valor, imagenUrl) {
        if (!sb) throw new Error('Supabase no conectado');
        var payload = { clave: clave, valor: valor || '' };
        if (imagenUrl !== undefined) payload.imagen_url = imagenUrl;
        var r = await sb.from('vitaleze_secciones').upsert([payload], { onConflict: 'clave' });
        if (r.error) throw new Error(r.error.message);
    }

    // ===== PEDIDOS =====
    static async saveOrder(order) {
        if (sb) {
            try {
                await sb.from('vitaleze_pedidos').insert([{
                    cliente: order.cliente || 'Cliente Web',
                    productos: order.productos,
                    estado: 'Pendiente'
                }]);
            } catch (e) { /* no bloquear */ }
        }
    }

    static async getOrders() {
        if (!sb) return [];
        var r = await sb.from('vitaleze_pedidos').select('*').order('fecha', { ascending: false });
        if (r.error) throw new Error(r.error.message);
        return r.data || [];
    }

    static async updateOrderStatus(id, estado) {
        if (!sb) throw new Error('Sin conexión');
        var r = await sb.from('vitaleze_pedidos').update({ estado: estado }).eq('id', id);
        if (r.error) throw new Error(r.error.message);
    }

    static async deleteOrder(id) {
        if (!sb) throw new Error('Sin conexión');
        var r = await sb.from('vitaleze_pedidos').delete().eq('id', id);
        if (r.error) throw new Error(r.error.message);
    }

    // ===== AUTENTICACIÓN =====
    // Intenta Supabase → si falla por CUALQUIER motivo → contraseña local

    static async getSession() {
        // Supabase session
        if (sb) {
            try {
                var result = await sb.auth.getSession();
                if (result.data && result.data.session) {
                    console.log('✅ Sesión Supabase activa');
                    return result.data.session;
                }
            } catch (e) {
                console.warn('getSession error:', e);
            }
        }
        // Local session
        if (localStorage.getItem('vz_logged') === 'true') {
            return { local: true, user: { email: localStorage.getItem('vz_email') || 'Admin' } };
        }
        return null;
    }

    static async login(email, password) {
        console.log('--- LOGIN ---');
        console.log('Supabase SDK cargado:', !!sb);
        console.log('URL:', SUPABASE_URL);

        var supabaseOk = false;

        // 1. Intentar Supabase Auth
        if (sb) {
            try {
                console.log('Probando Supabase Auth...');
                var result = await sb.auth.signInWithPassword({ email: email, password: password });
                console.log('Supabase respondió:', result);

                if (result.data && result.data.session) {
                    console.log('✅ Login Supabase OK');
                    localStorage.setItem('vz_logged', 'true');
                    localStorage.setItem('vz_email', email);
                    return { ok: true };
                }

                if (result.error) {
                    console.warn('Supabase error:', result.error.message);
                    // Mostrar el error real de Supabase al usuario
                    supabaseOk = true; // Supabase respondió (no es error de red)
                }
            } catch (e) {
                console.warn('Excepción Supabase:', e);
            }
        }

        // 2. SIEMPRE intentar contraseña local como fallback
        if (password === LOCAL_PASS) {
            console.log('✅ Login local OK (contraseña: ' + LOCAL_PASS + ')');
            localStorage.setItem('vz_logged', 'true');
            localStorage.setItem('vz_email', email || 'Admin');
            return { ok: true };
        }

        // 3. Si nada funcionó
        if (supabaseOk) {
            return { ok: false, msg: 'Email o contraseña de Supabase incorrectos. También podés entrar con la contraseña: ' + LOCAL_PASS };
        }
        return { ok: false, msg: 'No se pudo conectar a Supabase. Usá la contraseña: ' + LOCAL_PASS };
    }

    static async logout() {
        localStorage.removeItem('vz_logged');
        localStorage.removeItem('vz_email');
        if (sb) {
            try { await sb.auth.signOut(); } catch (e) { /* ok */ }
        }
    }
}
