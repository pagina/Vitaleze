-- ARREGLO: Borrar políticas viejas y recrearlas
DROP POLICY IF EXISTS "productos_ver" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_crear" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_editar" ON vitaleze_productos;
DROP POLICY IF EXISTS "productos_borrar" ON vitaleze_productos;

DROP POLICY IF EXISTS "pedidos_crear" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_ver" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_editar" ON vitaleze_pedidos;
DROP POLICY IF EXISTS "pedidos_borrar" ON vitaleze_pedidos;

DROP POLICY IF EXISTS "secciones_ver" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_crear" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_editar" ON vitaleze_secciones;
DROP POLICY IF EXISTS "secciones_borrar" ON vitaleze_secciones;

-- Recrear
ALTER TABLE vitaleze_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitaleze_secciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_ver" ON vitaleze_productos FOR SELECT USING (true);
CREATE POLICY "productos_crear" ON vitaleze_productos FOR INSERT WITH CHECK (true);
CREATE POLICY "productos_editar" ON vitaleze_productos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "productos_borrar" ON vitaleze_productos FOR DELETE USING (true);

CREATE POLICY "pedidos_crear" ON vitaleze_pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos_ver" ON vitaleze_pedidos FOR SELECT USING (true);
CREATE POLICY "pedidos_editar" ON vitaleze_pedidos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "pedidos_borrar" ON vitaleze_pedidos FOR DELETE USING (true);

CREATE POLICY "secciones_ver" ON vitaleze_secciones FOR SELECT USING (true);
CREATE POLICY "secciones_crear" ON vitaleze_secciones FOR INSERT WITH CHECK (true);
CREATE POLICY "secciones_editar" ON vitaleze_secciones FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "secciones_borrar" ON vitaleze_secciones FOR DELETE USING (true);
