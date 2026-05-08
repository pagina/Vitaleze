// Script para recuperar datos del proyecto viejo de Supabase
const OLD_URL = 'https://ienszeqwyqrvlewoaasv.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnN6ZXF3eXFydmxld29hYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzNTIsImV4cCI6MjA5MTMxNzM1Mn0.4WVf1cCVzThCQaDIdIEDT3LXYzr4EI0CS-HUWaTf6qI';

async function fetchData() {
    const headers = {
        'apikey': OLD_KEY,
        'Authorization': `Bearer ${OLD_KEY}`,
        'Content-Type': 'application/json'
    };

    try {
        console.log('Fetching products...');
        const prodRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_productos?select=*&order=created_at.asc`, { headers });
        const products = await prodRes.json();
        console.log('=== PRODUCTS ===');
        console.log(JSON.stringify(products, null, 2));

        console.log('\nFetching sections...');
        const secRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_secciones?select=*`, { headers });
        const sections = await secRes.json();
        console.log('=== SECTIONS ===');
        console.log(JSON.stringify(sections, null, 2));

        console.log('\nFetching orders...');
        const ordRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_pedidos?select=*&order=fecha.desc`, { headers });
        const orders = await ordRes.json();
        console.log('=== ORDERS ===');
        console.log(JSON.stringify(orders, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

fetchData();
