// Script para extraer los nombres y categorías de los productos del viejo Supabase
const OLD_URL = 'https://ienszeqwyqrvlewoaasv.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllbnN6ZXF3eXFydmxld29hYXN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDEzNTIsImV4cCI6MjA5MTMxNzM1Mn0.4WVf1cCVzThCQaDIdIEDT3LXYzr4EI0CS-HUWaTf6qI';

async function fetchData() {
    const headers = {
        'apikey': OLD_KEY,
        'Authorization': `Bearer ${OLD_KEY}`,
        'Content-Type': 'application/json'
    };

    const prodRes = await fetch(`${OLD_URL}/rest/v1/vitaleze_productos?select=id,nombre,categoria,descripcion,ingredientes,imagen,created_at&order=created_at.asc`, { headers });
    const products = await prodRes.json();

    console.log(`Total products: ${products.length}`);
    products.forEach((p, i) => {
        const hasBase64 = p.imagen && p.imagen.startsWith('data:');
        console.log(`${i+1}. "${p.nombre}" | cat: "${p.categoria}" | img: ${hasBase64 ? 'BASE64 (' + p.imagen.length + ' chars)' : p.imagen}`);
    });
}

fetchData();
