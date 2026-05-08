// =============================================
// MIGRACIÓN COMPLETA: Viejo Supabase → Nuevo Supabase
// Copia TODOS los datos (productos, secciones, pedidos)
// =============================================

const OLD_URL = 'https://ienszeqwyqrvlewoaasv.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnN6ZXF3eXFydmxld29hYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzNTIsImV4cCI6MjA5MTMxNzM1Mn0.4WVf1cCVzThCQaDIdIEDT3LXYzr4EI0CS-HUWaTf6qI';

const NEW_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';

function makeHeaders(key) {
    return {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
}

async function migrate() {
    console.log('=== MIGRANDO DATOS ===\n');

    // 1. Productos
    console.log('--- PRODUCTOS ---');
    const prodRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_productos?select=*&order=created_at.asc`, { headers: makeHeaders(OLD_KEY) });
    const products = await prodRes.json();
    console.log(`Encontrados: ${products.length} productos en el viejo proyecto`);

    if (products.length > 0) {
        // Limpiar IDs para que Supabase genere nuevos
        const cleanProducts = products.map(p => ({
            nombre: p.nombre,
            categoria: p.categoria,
            descripcion: p.descripcion,
            ingredientes: p.ingredientes,
            imagen: p.imagen,
            created_at: p.created_at
        }));

        const insertRes = await fetch(`${NEW_URL}/rest/v1/vitaleze_productos`, {
            method: 'POST',
            headers: makeHeaders(NEW_KEY),
            body: JSON.stringify(cleanProducts)
        });

        if (insertRes.ok) {
            const inserted = await insertRes.json();
            console.log(`✅ Insertados: ${inserted.length} productos`);
        } else {
            const err = await insertRes.text();
            console.log(`❌ Error insertando productos: ${err}`);
        }
    }

    // 2. Secciones
    console.log('\n--- SECCIONES ---');
    const secRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_secciones?select=*`, { headers: makeHeaders(OLD_KEY) });
    const sections = await secRes.json();
    console.log(`Encontradas: ${sections.length} secciones`);

    if (sections.length > 0) {
        const cleanSections = sections.map(s => ({
            clave: s.clave,
            valor: s.valor,
            imagen_url: s.imagen_url
        }));

        const insertSecRes = await fetch(`${NEW_URL}/rest/v1/vitaleze_secciones`, {
            method: 'POST',
            headers: makeHeaders(NEW_KEY),
            body: JSON.stringify(cleanSections)
        });

        if (insertSecRes.ok) {
            const inserted = await insertSecRes.json();
            console.log(`✅ Insertadas: ${inserted.length} secciones`);
        } else {
            const err = await insertSecRes.text();
            console.log(`❌ Error insertando secciones: ${err}`);
        }
    }

    // 3. Pedidos
    console.log('\n--- PEDIDOS ---');
    const ordRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_pedidos?select=*&order=fecha.desc`, { headers: makeHeaders(OLD_KEY) });
    const orders = await ordRes.json();
    console.log(`Encontrados: ${orders.length} pedidos`);

    if (orders.length > 0) {
        const cleanOrders = orders.map(o => ({
            cliente: o.cliente,
            telefono: o.telefono,
            direccion: o.direccion,
            productos: o.productos,
            total: o.total,
            estado: o.estado,
            fecha: o.fecha
        }));

        const insertOrdRes = await fetch(`${NEW_URL}/rest/v1/vitaleze_pedidos`, {
            method: 'POST',
            headers: makeHeaders(NEW_KEY),
            body: JSON.stringify(cleanOrders)
        });

        if (insertOrdRes.ok) {
            const inserted = await insertOrdRes.json();
            console.log(`✅ Insertados: ${inserted.length} pedidos`);
        } else {
            const err = await insertOrdRes.text();
            console.log(`❌ Error insertando pedidos: ${err}`);
        }
    }

    console.log('\n=== MIGRACIÓN COMPLETA ===');
}

migrate().catch(e => console.error('Error:', e.message));
