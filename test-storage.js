// Test rápido de Supabase Storage y estado actual de imágenes
const SUPABASE_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
};

async function run() {
    console.log('=== TEST 1: Verificar bucket ===');
    try {
        const bucketRes = await fetch(SUPABASE_URL + '/storage/v1/bucket/vitaleze-images', { headers });
        console.log('Bucket status:', bucketRes.status);
        const bucketData = await bucketRes.text();
        console.log('Bucket response:', bucketData);
    } catch (e) {
        console.log('Bucket error:', e.message);
    }

    console.log('\n=== TEST 2: Subir imagen de prueba ===');
    try {
        // Crear un JPEG mínimo válido (1x1 pixel rojo)
        const jpegHex = 'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc40000ffc4001f0100030101010101010101010000000000000102030405060708090a0bffc40000ffda000c03010002110311003f00fbd4000000ffd9';
        const jpegBytes = new Uint8Array(jpegHex.match(/.{2}/g).map(b => parseInt(b, 16)));
        
        const uploadUrl = SUPABASE_URL + '/storage/v1/object/vitaleze-images/test/test_' + Date.now() + '.jpg';
        console.log('Upload URL:', uploadUrl);
        
        const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'image/jpeg',
                'x-upsert': 'true'
            },
            body: jpegBytes
        });
        console.log('Upload status:', uploadRes.status);
        const uploadData = await uploadRes.text();
        console.log('Upload response:', uploadData);
        
        if (uploadRes.ok) {
            console.log('✅ STORAGE FUNCIONA!');
        } else {
            console.log('❌ STORAGE NO FUNCIONA - Error:', uploadRes.status);
        }
    } catch (e) {
        console.log('❌ Upload error:', e.message);
    }

    console.log('\n=== TEST 3: Ver productos actuales (campo imagen) ===');
    try {
        const prodRes = await fetch(SUPABASE_URL + '/rest/v1/vitaleze_productos?select=id,nombre,imagen&order=created_at.asc', { headers });
        if (prodRes.ok) {
            const products = await prodRes.json();
            console.log('Total productos:', products.length);
            products.forEach((p, i) => {
                const img = p.imagen || '(vacío)';
                let tipo = 'vacío';
                if (img.startsWith('data:')) tipo = 'BASE64 (' + Math.round(img.length / 1024) + ' KB)';
                else if (img.startsWith('http')) tipo = 'URL';
                else if (img.startsWith('./')) tipo = 'RUTA LOCAL';
                console.log(`  [${i+1}] "${p.nombre}" → ${tipo} ${img.startsWith('http') ? img : img.substring(0, 60) + '...'}`);
            });
        } else {
            console.log('Error:', prodRes.status);
        }
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n=== TEST 4: Ver secciones (hero_img, about_img) ===');
    try {
        const secRes = await fetch(SUPABASE_URL + '/rest/v1/vitaleze_secciones?select=clave,imagen_url', { headers });
        if (secRes.ok) {
            const sections = await secRes.json();
            sections.forEach(s => {
                const img = s.imagen_url || '(vacío)';
                let tipo = 'vacío';
                if (img.startsWith('data:')) tipo = 'BASE64 (' + Math.round(img.length / 1024) + ' KB)';
                else if (img.startsWith('http')) tipo = 'URL';
                else if (img.startsWith('./')) tipo = 'RUTA LOCAL';
                console.log(`  "${s.clave}" → ${tipo} ${img.startsWith('http') ? img : img.substring(0, 80)}`);
            });
        }
    } catch (e) {
        console.log('Error:', e.message);
    }
}

run();
