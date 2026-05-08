// Script completo de limpieza y migración final
const NEW_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';
const OLD_URL = 'https://ienszeqwyqrvlewoaasv.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnN6ZXF3eXFydmxld29hYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzNTIsImV4cCI6MjA5MTMxNzM1Mn0.4WVf1cCVzThCQaDIdIEDT3LXYzr4EI0CS-HUWaTf6qI';

function h(key) {
    return { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' };
}

async function run() {
    // 1. Obtener todos los productos del nuevo
    console.log('--- Buscando duplicados en productos ---');
    const r = await fetch(`${NEW_URL}/rest/v1/vitaleze_productos?select=id,nombre,created_at&order=created_at.asc`, { headers: h(NEW_KEY) });
    const prods = await r.json();
    console.log(`Total productos: ${prods.length}`);

    // Encontrar duplicados: quedarse con el primero, borrar los demás
    const seen = {};
    const toDelete = [];
    for (const p of prods) {
        if (seen[p.nombre]) {
            toDelete.push(p.id);
        } else {
            seen[p.nombre] = p.id;
        }
    }

    console.log(`Duplicados a borrar: ${toDelete.length}`);
    if (toDelete.length > 0) {
        for (const id of toDelete) {
            const del = await fetch(`${NEW_URL}/rest/v1/vitaleze_productos?id=eq.${id}`, {
                method: 'DELETE',
                headers: h(NEW_KEY)
            });
            if (del.ok) {
                console.log(`  ✅ Borrado: ${id}`);
            } else {
                console.log(`  ❌ Error borrando ${id}: ${await del.text()}`);
            }
        }
    }

    // Verificar
    const r2 = await fetch(`${NEW_URL}/rest/v1/vitaleze_productos?select=nombre,categoria&order=created_at.asc`, { headers: h(NEW_KEY) });
    const final = await r2.json();
    console.log(`\nProductos finales: ${final.length}`);
    final.forEach((p, i) => console.log(`  ${i+1}. ${p.nombre} (${p.categoria})`));

    // 2. Pedidos
    console.log('\n--- Migrando pedidos ---');
    const ordRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_pedidos?select=*&order=fecha.desc`, { headers: h(OLD_KEY) });
    const orders = await ordRes.json();

    for (const o of orders) {
        const ins = await fetch(`${NEW_URL}/rest/v1/vitaleze_pedidos`, {
            method: 'POST',
            headers: h(NEW_KEY),
            body: JSON.stringify({
                cliente: o.cliente,
                telefono: o.telefono,
                direccion: o.direccion,
                productos: o.productos,
                total: o.total,
                estado: o.estado,
                fecha: o.fecha
            })
        });
        if (ins.ok) {
            console.log(`  ✅ Pedido: ${o.cliente}`);
        } else {
            console.log(`  ❌ Error pedido ${o.cliente}: ${await ins.text()}`);
        }
    }

    console.log('\n=== LIMPIEZA Y MIGRACIÓN COMPLETA ===');
}

run().catch(e => console.error('Error:', e));
