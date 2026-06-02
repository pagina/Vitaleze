-- ====================================================================
-- VITALEZE 🌾 - SQL PARA ACTUALIZAR IMÁGENES OPTIMIZADAS
-- Proyecto: obtowengfikyyvekywyh
-- ====================================================================
-- Copiá este código y pegalo en el Editor SQL de tu Dashboard de Supabase:
-- https://supabase.com/dashboard/project/obtowengfikyyvekywyh/sql/new
-- Luego presioná el botón "Run".
-- ====================================================================

-- 1. Actualizar productos con rutas locales optimizadas (anteriormente pesados o en Base64)
UPDATE vitaleze_productos SET imagen = './imagenes/galletas_de_avena_y_pasas.jpg' WHERE nombre = 'Galletas de Avena y Pasas';
UPDATE vitaleze_productos SET imagen = './imagenes/pan_integral_de_masa_madre.jpg' WHERE nombre = 'Pan Integral de Masa Madre';
UPDATE vitaleze_productos SET imagen = './imagenes/frutos_secos_1_2_kg.jpg' WHERE nombre = 'Frutos Secos 1/2 kg';
UPDATE vitaleze_productos SET imagen = './imagenes/dona_de_chocolate_keto.jpg' WHERE nombre = 'Dona de Chocolate Keto';
UPDATE vitaleze_productos SET imagen = './imagenes/pan_de_almendras.jpg' WHERE nombre = 'Pan de Almendras';
UPDATE vitaleze_productos SET imagen = './imagenes/granola.jpg' WHERE nombre = 'Granola';
UPDATE vitaleze_productos SET imagen = './imagenes/almohaditas_rellenas_1_2kg.jpg' WHERE nombre = 'Almohaditas Rellenas (1/2kg)';
UPDATE vitaleze_productos SET imagen = './imagenes/pan_nube_keto.jpg' WHERE nombre = 'Pan Nube Keto';
UPDATE vitaleze_productos SET imagen = './imagenes/pan_nube_tradicional.jpg' WHERE nombre = 'Pan Nube Tradicional';
UPDATE vitaleze_productos SET imagen = './imagenes/alfajor_de_avena.jpg' WHERE nombre = 'Alfajor de avena';
UPDATE vitaleze_productos SET imagen = './imagenes/yogurt_natural_280cc.jpg' WHERE nombre = 'Yogurt natural 280cc';
UPDATE vitaleze_productos SET imagen = './imagenes/yogurt_natural_360cc.jpg' WHERE nombre = 'Yogurt natural 360cc';
UPDATE vitaleze_productos SET imagen = './imagenes/barrita_proteica.jpg' WHERE nombre = 'Barrita proteica';
UPDATE vitaleze_productos SET imagen = './imagenes/palitos_palmersano_y_albahaca.jpg' WHERE nombre = 'Palitos palmersano y albahaca';
UPDATE vitaleze_productos SET imagen = './imagenes/pepas.jpg' WHERE nombre = 'Pepas';

-- 2. Limpiar caché viejo o actualizar secciones de forma segura (por si acaso)
-- Esto asegurará que todas las imágenes grandes de la base de datos se reemplacen por rutas ligeras.
