// ==============================================
// MIGRACIÓN: Convertir TODAS las imágenes base64 a Supabase Storage
// y actualizar la DB con URLs públicas
// ==============================================

const SUPABASE_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';
const fs = require('fs');
const path = require('path');

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
};

function cleanName(name) {
    return name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/(^_|_$)/g, '');
}

async function uploadToStorage(buffer, fileName) {
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/vitaleze-images/productos/${fileName}`;
    
    const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            ...headers,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
        },
        body: buffer
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Upload failed ${res.status}: ${errText}`);
    }
    
    return `${SUPABASE_URL}/storage/v1/object/public/vitaleze-images/productos/${fileName}`;
}

async function updateProductImage(productId, imageUrl) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/vitaleze_productos?id=eq.${productId}`, {
        method: 'PATCH',
        headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({ imagen: imageUrl })
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Update failed ${res.status}: ${errText}`);
    }
    return true;
}

async function run() {
    console.log('=== MIGRACIÓN DE IMÁGENES A SUPABASE STORAGE ===\n');
    
    // 1. Cargar todos los productos
    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/vitaleze_productos?select=id,nombre,imagen&order=created_at.asc`, { headers });
    const products = await prodRes.json();
    console.log(`Total productos: ${products.length}\n`);
    
    let migrated = 0;
    let localFixed = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const img = p.imagen || '';
        const cleanFileName = cleanName(p.nombre) + '.jpg';
        
        console.log(`[${i+1}/${products.length}] "${p.nombre}"`);
        
        if (img.startsWith('data:')) {
            // BASE64 → Extraer y subir a Storage
            console.log(`  Tipo: BASE64 (${Math.round(img.length / 1024)} KB)`);
            try {
                const base64Data = img.split(',')[1];
                if (!base64Data || base64Data.length < 100) {
                    console.log('  ⚠️ Base64 corrupto/vacío, saltando');
                    errors++;
                    continue;
                }
                const buffer = Buffer.from(base64Data, 'base64');
                console.log(`  Subiendo ${(buffer.length / 1024).toFixed(1)} KB a Storage...`);
                
                const publicUrl = await uploadToStorage(buffer, cleanFileName);
                console.log(`  ✅ Subido: ${publicUrl}`);
                
                await updateProductImage(p.id, publicUrl);
                console.log(`  ✅ DB actualizada`);
                migrated++;
            } catch (e) {
                console.log(`  ❌ Error: ${e.message}`);
                errors++;
            }
        } else if (img.startsWith('./imagenes/') || img.startsWith('imagenes/')) {
            // RUTA LOCAL → Intentar leer el archivo local y subir a Storage
            const localPath = img.startsWith('./') ? img.substring(2) : img;
            console.log(`  Tipo: RUTA LOCAL (${localPath})`);
            
            if (fs.existsSync(localPath)) {
                try {
                    const buffer = fs.readFileSync(localPath);
                    console.log(`  Subiendo ${(buffer.length / 1024).toFixed(1)} KB a Storage...`);
                    
                    const publicUrl = await uploadToStorage(buffer, cleanFileName);
                    console.log(`  ✅ Subido: ${publicUrl}`);
                    
                    await updateProductImage(p.id, publicUrl);
                    console.log(`  ✅ DB actualizada`);
                    localFixed++;
                } catch (e) {
                    console.log(`  ❌ Error: ${e.message}`);
                    errors++;
                }
            } else {
                console.log(`  ⚠️ Archivo local NO existe, no se puede migrar`);
                skipped++;
            }
        } else if (img.startsWith('http')) {
            console.log(`  Tipo: URL (ya migrado) ✓`);
            skipped++;
        } else {
            console.log(`  Tipo: vacío/desconocido`);
            skipped++;
        }
        console.log('');
    }
    
    console.log('=== RESULTADO ===');
    console.log(`  Migrados (base64 → Storage): ${migrated}`);
    console.log(`  Migrados (local → Storage):   ${localFixed}`);
    console.log(`  Saltados (ya URL/vacío):       ${skipped}`);
    console.log(`  Errores:                       ${errors}`);
    console.log('');
    
    // Verificar resultado final
    console.log('=== VERIFICACIÓN FINAL ===');
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/vitaleze_productos?select=id,nombre,imagen&order=created_at.asc`, { headers });
    const updatedProducts = await checkRes.json();
    updatedProducts.forEach((p, i) => {
        const img = p.imagen || '(vacío)';
        let icon = '✅';
        if (img.startsWith('data:')) icon = '❌ BASE64';
        else if (img.startsWith('./')) icon = '⚠️ LOCAL';
        else if (!img || img === '(vacío)') icon = '⚠️ VACÍO';
        console.log(`  ${icon} "${p.nombre}" → ${img.substring(0, 80)}${img.length > 80 ? '...' : ''}`);
    });
}

run().catch(e => console.error('Fatal:', e));
