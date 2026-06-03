-- =============================================
-- VITALEZE 🌾 - STORAGE PARA IMÁGENES
-- Proyecto: obtowengfikyyvekywyh
-- =============================================
-- Copiá TODO y pegalo en:
-- https://supabase.com/dashboard/project/obtowengfikyyvekywyh/sql/new
-- Clickeá RUN → tiene que decir "Success"
-- =============================================

-- 1. Crear el bucket de imágenes (público para que cualquiera pueda ver las fotos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vitaleze-images',
    'vitaleze-images',
    true,
    5242880,  -- 5MB máximo por imagen
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Borrar políticas viejas si existen
DROP POLICY IF EXISTS "vitaleze_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "vitaleze_images_anon_upload" ON storage.objects;
DROP POLICY IF EXISTS "vitaleze_images_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "vitaleze_images_anon_delete" ON storage.objects;

-- 3. Permitir que TODOS puedan VER las imágenes (público)
CREATE POLICY "vitaleze_images_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'vitaleze-images');

-- 4. Permitir subir imágenes (con la API key anon, para que funcione desde el admin)
CREATE POLICY "vitaleze_images_anon_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vitaleze-images');

-- 5. Permitir actualizar/reemplazar imágenes
CREATE POLICY "vitaleze_images_anon_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vitaleze-images');

-- 6. Permitir borrar imágenes
CREATE POLICY "vitaleze_images_anon_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'vitaleze-images');
