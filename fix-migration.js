// Fix: insertar secciones y pedidos que fallaron
const NEW_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const NEW_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';
const OLD_URL = 'https://ienszeqwyqrvlewoaasv.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnN6ZXF3eXFydmxld29hYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzNTIsImV4cCI6MjA5MTMxNzM1Mn0.4WVf1cCVzThCQaDIdIEDT3LXYzr4EI0CS-HUWaTf6qI';

function makeHeaders(key) {
    return {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };
}

async function fix() {
    // 1. Verificar secciones en nuevo
    console.log('--- Verificando secciones ---');
    const secCheck = await fetch(`${NEW_URL}/rest/v1/vitaleze_secciones?select=*`, { headers: makeHeaders(NEW_KEY) });
    const existingSec = await secCheck.json();
    console.log(`Secciones ya existentes en nuevo: ${existingSec.length}`);
    if (existingSec.length > 0) {
        existingSec.forEach(s => console.log(`  - ${s.clave}: ${s.valor ? s.valor.substring(0, 50) : '(vacío)'}...`));
        console.log('✅ Secciones ya están OK\n');
    }

    // 2. Verificar productos en nuevo
    console.log('--- Verificando productos ---');
    const prodCheck = await fetch(`${NEW_URL}/rest/v1/vitaleze_productos?select=nombre,categoria&order=created_at.asc`, { headers: makeHeaders(NEW_KEY) });
    const existingProd = await prodCheck.json();
    console.log(`Productos en nuevo: ${existingProd.length}`);
    existingProd.forEach((p, i) => console.log(`  ${i+1}. ${p.nombre} (${p.categoria})`));

    // 3. Pedidos - necesitamos SELECT con anon key (la policy dice TO authenticated)
    // Mejor los listamos del viejo para confirmar
    console.log('\n--- Pedidos del viejo ---');
    const ordRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_pedidos?select=cliente,telefono,direccion,estado,fecha&order=fecha.desc`, { headers: makeHeaders(OLD_KEY) });
    const orders = await ordRes.json();
    console.log(`Pedidos: ${orders.length}`);
    orders.forEach((o, i) => console.log(`  ${i+1}. ${o.cliente} | ${o.telefono} | ${o.estado} | ${o.fecha}`));
    
    console.log('\n⚠️  Los pedidos necesitan política SELECT+INSERT para anon.');
    console.log('Ejecutá este SQL en el nuevo proyecto:');
    console.log('');
    console.log('CREATE POLICY "pedidos_anon_select" ON vitaleze_pedidos FOR SELECT USING (true);');
    console.log('');
    console.log('Después volvé a correr este script.');
}

fix().catch(e => console.error('Error:', e));
