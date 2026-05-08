-- =============================================
-- VITALEZE 🌾 - SQL PARA SUPABASE (NUEVO PROYECTO)
-- Proyecto: obtowengfikyyvekywyh
-- =============================================
-- Copiá TODO y pegalo en:
-- https://supabase.com/dashboard/project/obtowengfikyyvekywyh/sql/new
-- Clickeá RUN → tiene que decir "Success"
-- =============================================

-- ==========================================
-- TABLA: PRODUCTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS vitaleze_productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    categoria TEXT,
    descripcion TEXT,
    ingredientes TEXT,
    precio NUMERIC DEFAULT 0,
    imagen TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna precio si la tabla ya existe
ALTER TABLE vitaleze_productos ADD COLUMN IF NOT EXISTS precio NUMERIC DEFAULT 0;

-- ==========================================
-- TABLA: PEDIDOS
-- ==========================================
CREATE TABLE IF NOT EXISTS vitaleze_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente TEXT NOT NULL DEFAULT 'Cliente Web',
    telefono TEXT,
    direccion TEXT,
    productos JSONB,
    total NUMERIC DEFAULT 0,
    estado TEXT DEFAULT 'Pendiente',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- TABLA: SECCIONES
-- ==========================================
CREATE TABLE IF NOT EXISTS vitaleze_secciones (
    id SERIAL PRIMARY KEY,
    clave TEXT UNIQUE NOT NULL,
    valor TEXT,
    imagen_url TEXT
);

-- ==========================================
-- ACTIVAR RLS
-- ==========================================
ALTER TABLE vitaleze_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_secciones ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- BORRAR POLÍTICAS VIEJAS (por si ya existen)
-- ==========================================
DROP POLICY IF EXISTS "productos_ver" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_crear" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_editar" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_borrar" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_anon_insert" ON vitaleze_productos;

DROP POLICY IF EXISTS "pedidos_crear" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_ver" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_editar" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_borrar" ON vitaleze_pedidos;

DROP POLICY IF EXISTS "secciones_ver" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_crear" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_editar" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_borrar" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_anon_insert" ON vitaleze_secciones;

-- ==========================================
-- CREAR POLÍTICAS
-- ==========================================

-- PRODUCTOS: Todos ven. Cualquiera inserta. Autenticados editan/borran.
CREATE POLICY "productos_ver" ON vitaleze_productos FOR SELECT USING (true);
CREATE POLICY "productos_crear" ON vitaleze_productos FOR INSERT WITH CHECK (true);
CREATE POLICY "productos_editar" ON vitaleze_productos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "productos_borrar" ON vitaleze_productos FOR DELETE TO authenticated USING (true);

-- PEDIDOS: Cualquiera crea. Autenticados ven/editan/borran.
CREATE POLICY "pedidos_crear" ON vitaleze_pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos_ver" ON vitaleze_pedidos FOR SELECT TO authenticated USING (true);
CREATE POLICY "pedidos_editar" ON vitaleze_pedidos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "pedidos_borrar" ON vitaleze_pedidos FOR DELETE TO authenticated USING (true);

-- SECCIONES: Todos ven. Cualquiera inserta. Autenticados editan/borran.
CREATE POLICY "secciones_ver" ON vitaleze_secciones FOR SELECT USING (true);
CREATE POLICY "secciones_crear" ON vitaleze_secciones FOR INSERT WITH CHECK (true);
CREATE POLICY "secciones_editar" ON vitaleze_secciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "secciones_borrar" ON vitaleze_secciones FOR DELETE TO authenticated USING (true);
