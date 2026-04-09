-- =============================================
-- VITALEZE 🌾 - SQL PARA SUPABASE
-- Proyecto: joojnfeficesvoupwmsw
-- =============================================
--
-- INSTRUCCIONES:
-- 1. Copiá TODO este archivo
-- 2. Andá a: https://supabase.com/dashboard/project/joojnfeficesvoupwmsw/sql/new
-- 3. Pegá todo y dale RUN
-- 4. Tiene que decir "Success"
--
-- DESPUÉS de ejecutar esto:
-- 5. Andá a Authentication > Providers > Email > Desactivá "Confirm email"
-- 6. Andá a Authentication > Users > Add user
--    → Poné tu email y tu contraseña
--    → Marcá "Auto Confirm User"
-- =============================================

-- Borrar tablas si existen (para empezar limpio)
DROP TABLE IF EXISTS vitaleze_pedidos CASCADE;
DROP TABLE IF EXISTS vitaleze_productos CASCADE;
DROP TABLE IF EXISTS vitaleze_secciones CASCADE;

-- ==========================================
-- TABLA: PRODUCTOS
-- ==========================================
CREATE TABLE vitaleze_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    ingredientes TEXT,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: PEDIDOS
-- ==========================================
CREATE TABLE vitaleze_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente TEXT NOT NULL DEFAULT 'Cliente Web',
    telefono TEXT,
    productos JSONB,
    total NUMERIC DEFAULT 0,
    estado TEXT DEFAULT 'Pendiente',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: SECCIONES (textos e imágenes de la web)
-- ==========================================
CREATE TABLE vitaleze_secciones (
    id SERIAL PRIMARY KEY,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT,
    imagen_url TEXT
);

-- ==========================================
-- DATOS INICIALES - PRODUCTOS
-- ==========================================
INSERT INTO vitaleze_productos (nombre, categoria, descripcion, ingredientes, imagen) VALUES
('Dona de Chocolate Keto', 'Keto', 'Exquisita dona keto, esponjosa y bañada en auténtico chocolate 70% cacao. El equilibrio perfecto entre sabor y nutrición.', 'Chocolate 70% cacao, harina de almendra, stevia.', './imagenes/dona.png'),
('Pan de Almendras (Keto)', 'Panadería, Keto', 'Nuestro pan de almendras destaca por su textura noble y gran aporte nutricional. Una opción premium para realzar tus desayunos.', 'Harina de almendras, huevo, sal marina.', './imagenes/pan de almendras.png'),
('Pan Nube Keto', 'Panadería, Keto', 'Ligero como el aire. Este pan keto sin carbohidratos es la opción más liviana y deliciosa para acompañar tus comidas diarias sin culpa.', 'Huevo, leche en polvo descremada y ajo.', './imagenes/pan nube keto.jpg'),
('Pan Nube Tradicional', 'Panadería', 'Descubrí la textura única de nuestro pan tradicional. Increíblemente esponjoso, aireado al paladar y sumamente versátil.', 'Huevo, queso crema seleccionado.', './imagenes/pan nube.png'),
('Galletas de Avena y Pasas', 'Snacks', 'Galletas crujientes horneadas pacientemente, elaboradas con avena 100% integral. El snack natural, dulce y repleto de fibra.', 'Avena integral, pasas de uva, miel natural.', './imagenes/galletas.png'),
('Pan Integral de Masa Madre', 'Panadería', 'Pan artesanal con fermentación natural prolongada. Realza los sabores auténticos y favorece la digestión. Un clásico indispensable.', 'Harina integral, semillas de lino, chía, masa madre.', './imagenes/pan integral.png'),
('Granola', 'Snacks', 'Exclusiva mezcla de cereales tostados a la perfección. Aporta ese toque dulce y crujiente ideal para tus bowls y yogures diarios.', 'Avena, nueces, almendras, miel.', './imagenes/granola.png'),
('Almohaditas Rellenas (1/2kg)', 'Frutos Secos, Snacks', 'Pequeñas delicias de cereal crocante con un corazón suave y sabroso. En formato ideal para disfrutar como snack dulce o desayuno.', 'Cereal de trigo, relleno variado.', './imagenes/almohaditas de 1,2 kg.png'),
('Frutos Secos 1/2 kg', 'Frutos Secos', 'Selección premium de los mejores frutos: nueces enteras, almendras tostadas, maní y pasas dulces. Energía 100% natural, lista para consumir.', 'Nueces, almendras, maní, pasas de uva.', './imagenes/fruto secos 1,2 kg.jpg');

-- ==========================================
-- DATOS INICIALES - SECCIONES
-- ==========================================
INSERT INTO vitaleze_secciones (clave, valor, imagen_url) VALUES
('hero_h1', 'Alimentación saludable a <span class="text-gradient">tu alcance</span>', NULL),
('hero_p', 'Opciones nutritivas para tu día a día. Panadería saludable, frutos secos, mix de tierra y muchos más, para recargar tu energía.', NULL),
('hero_img', '', './imagenes/hero-demo.jpg'),
('about_h2', 'Sobre Nosotros', NULL),
('about_p1', '<strong>Vitaleze 🌾</strong> es un lugar pensado para acercarte opciones saludables y nutritivas.', NULL),
('about_img', '', './imagenes/about-demo.jpg')
ON CONFLICT (clave) DO NOTHING;

-- ==========================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Activar RLS en todas las tablas
ALTER TABLE vitaleze_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_secciones ENABLE ROW LEVEL SECURITY;

-- PRODUCTOS: Todos pueden ver. Solo usuarios autenticados pueden editar.
CREATE POLICY "productos_ver" ON vitaleze_productos
    FOR SELECT USING (true);
CREATE POLICY "productos_crear" ON vitaleze_productos
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "productos_editar" ON vitaleze_productos
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "productos_borrar" ON vitaleze_productos
    FOR DELETE TO authenticated USING (true);

-- PEDIDOS: Cualquiera puede crear. Solo autenticados ven/editan/borran.
CREATE POLICY "pedidos_crear" ON vitaleze_pedidos
    FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos_ver" ON vitaleze_pedidos
    FOR SELECT TO authenticated USING (true);
CREATE POLICY "pedidos_editar" ON vitaleze_pedidos
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pedidos_borrar" ON vitaleze_pedidos
    FOR DELETE TO authenticated USING (true);

-- SECCIONES: Todos pueden ver. Solo autenticados editan.
CREATE POLICY "secciones_ver" ON vitaleze_secciones
    FOR SELECT USING (true);
CREATE POLICY "secciones_crear" ON vitaleze_secciones
    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "secciones_editar" ON vitaleze_secciones
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "secciones_borrar" ON vitaleze_secciones
    FOR DELETE TO authenticated USING (true);

-- ==========================================
-- ✅ LISTO! Ahora:
-- 1. Andá a Authentication > Providers > Email > "Confirm email" → OFF
-- 2. Andá a Authentication > Users > Add user
--    Email: lo que vos quieras
--    Password: lo que vos quieras
--    ✅ Auto Confirm User
-- 3. Abrí admin.html y logueate con eso
-- ==========================================
