const fs = require('fs');
const path = require('path');
const { Jimp } = require('jimp');

const OLD_DATA_FILE = 'old-data-utf8.txt';
const IMAGES_DIR = 'imagenes';
const SUPABASE_URL = 'https://obtowengfikyyvekywyh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9idG93ZW5nZmlreXl2ZWt5d3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTQzNDEsImV4cCI6MjA5MzgzMDM0MX0.2CDTT-Zfp7cdx5U23V0SmCWNKpHZxkcZSzdo5zEGocM';

// Get credentials from CLI arguments (if provided for authentication)
const args = process.argv.slice(2);
let adminEmail = '';
let adminPassword = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
        adminEmail = args[i + 1];
    }
    if (args[i] === '--password' && args[i + 1]) {
        adminPassword = args[i + 1];
    }
}

// Helper to normalize names to safe filenames
function getCleanFilename(name, extension = 'jpg') {
    return name
        .toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove accent marks
        .replace(/[^a-z0-9]/g, '_') // replace non-alphanumeric with _
        .replace(/_+/g, '_') // collapse multiple underscores
        .replace(/(^_|_$)/g, '') // strip leading/trailing underscores
        + '.' + extension;
}

async function run() {
    console.log('=== STARTING IMAGE OPTIMIZATION ===\n');

    // Ensure output directory exists
    if (!fs.existsSync(IMAGES_DIR)) {
        fs.mkdirSync(IMAGES_DIR);
    }

    // 1. Read the local product dump
    if (!fs.existsSync(OLD_DATA_FILE)) {
        console.error(`Error: Dump file ${OLD_DATA_FILE} not found!`);
        process.exit(1);
    }

    console.log(`Reading dump from ${OLD_DATA_FILE}...`);
    const rawContent = fs.readFileSync(OLD_DATA_FILE, 'utf8');
    const jsonStart = rawContent.indexOf('[');
    const jsonEnd = rawContent.indexOf(']') + 1;
    if (jsonStart === -1 || jsonEnd === 0) {
        console.error('Could not find JSON array brackets in the dump file.');
        process.exit(1);
    }

    const jsonText = rawContent.substring(jsonStart, jsonEnd);
    const products = JSON.parse(jsonText);
    console.log(`Loaded ${products.length} products to process.\n`);

    const updatePlan = [];

    // 2. Process each product image
    for (let idx = 0; idx < products.length; idx++) {
        const product = products[idx];
        const name = product.nombre;
        const imgVal = product.imagen || '';
        const cleanName = getCleanFilename(name);
        const outputPath = path.join(IMAGES_DIR, cleanName);
        const webPath = `./imagenes/${cleanName}`;

        console.log(`[${idx + 1}/${products.length}] Processing product: "${name}"`);

        if (imgVal.startsWith('data:')) {
            // BASE64 IMAGE
            console.log(`  - Image type: Base64 string`);
            try {
                // Extract base64 payload
                const parts = imgVal.split(';base64,');
                if (parts.length !== 2) {
                    console.log(`  - WARNING: Invalid base64 format, skipping.`);
                    continue;
                }
                const base64Data = parts[1];
                const imageBuffer = Buffer.from(base64Data, 'base64');

                console.log(`  - Decoding base64 buffer (${(imageBuffer.length / 1024).toFixed(2)} KB)...`);
                const image = await Jimp.read(imageBuffer);

                console.log(`  - Resizing & compressing to JPEG (max 600px)...`);
                image.scaleToFit({ w: 600, h: 600 });
                const buf = await image.getBuffer('image/jpeg', { quality: 75 });
                fs.writeFileSync(outputPath, buf);

                console.log(`  - Saved to ${outputPath} (${(buf.length / 1024).toFixed(2)} KB) ✓`);

                updatePlan.push({
                    nombre: name,
                    old_img: imgVal,
                    new_img: webPath
                });
            } catch (err) {
                console.error(`  - ERROR processing base64 image:`, err.message);
            }
        } else if (imgVal.startsWith('./imagenes/') || imgVal.startsWith('imagenes/')) {
            // LOCAL FILE
            const localFile = imgVal.startsWith('./') ? imgVal.slice(2) : imgVal;
            console.log(`  - Image type: Local file path (${localFile})`);

            if (!fs.existsSync(localFile)) {
                console.log(`  - WARNING: Local file ${localFile} does not exist! Using fallback logo.`);
                updatePlan.push({
                    nombre: name,
                    old_img: imgVal,
                    new_img: './imagenes/logo.png'
                });
                continue;
            }

            try {
                const initialSize = fs.statSync(localFile).size;
                console.log(`  - Loading local image (${(initialSize / 1024).toFixed(2)} KB)...`);
                const image = await Jimp.read(localFile);

                console.log(`  - Resizing & compressing to JPEG (max 600px)...`);
                image.scaleToFit({ w: 600, h: 600 });
                const buf = await image.getBuffer('image/jpeg', { quality: 75 });
                fs.writeFileSync(outputPath, buf);

                console.log(`  - Saved optimized copy to ${outputPath} (${(buf.length / 1024).toFixed(2)} KB) ✓`);

                updatePlan.push({
                    nombre: name,
                    old_img: imgVal,
                    new_img: webPath
                });
            } catch (err) {
                console.error(`  - ERROR processing local file image:`, err.message);
            }
        } else {
            console.log(`  - Image type: External URL or empty (${imgVal || '(none)'})`);
            // Keep original if it's a URL or empty, but if empty, use fallback logo
            updatePlan.push({
                nombre: name,
                old_img: imgVal,
                new_img: imgVal || './imagenes/logo.png'
            });
        }
        console.log('');
    }

    console.log('=== LOCAL OPTIMIZATION COMPLETED ===\n');
    console.log(`Ready to update ${updatePlan.length} products.`);

    // 3. Update Supabase Database
    await updateDatabase(updatePlan);
}

async function updateDatabase(plans) {
    console.log('=== UPDATING SUPABASE DATABASE ===');
    
    let headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
    };

    // If credentials are provided, perform login
    if (adminEmail && adminPassword) {
        console.log(`Attempting login for ${adminEmail} to get authentication token...`);
        try {
            const loginRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: adminEmail, password: adminPassword })
            });

            if (loginRes.ok) {
                const session = await loginRes.json();
                console.log('✅ Logged in successfully!');
                headers['Authorization'] = `Bearer ${session.access_token}`;
            } else {
                console.error(`❌ Login failed! Status: ${loginRes.status}. Proceeding with anon key...`);
                headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
            }
        } catch (authErr) {
            console.error('❌ Authentication request failed:', authErr.message);
            headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
        }
    } else {
        headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
        console.log('No credentials provided. Using anonymous authorization...');
    }

    // Process updates
    for (let plan of plans) {
        // Find product ID by name in the live database first
        console.log(`Updating product: "${plan.nombre}"...`);
        try {
            const selectRes = await fetch(`${SUPABASE_URL}/rest/v1/vitaleze_productos?nombre=eq.${encodeURIComponent(plan.nombre)}&select=id`, {
                headers
            });

            if (!selectRes.ok) {
                console.error(`  - Failed to select product "${plan.nombre}". Status: ${selectRes.status}`);
                continue;
            }

            const matchedProducts = await selectRes.json();
            if (matchedProducts.length === 0) {
                console.log(`  - Product "${plan.nombre}" not found in database. Skipping.`);
                continue;
            }

            const productId = matchedProducts[0].id;
            console.log(`  - Found product ID: ${productId}`);

            // Update the image path
            const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/vitaleze_productos?id=eq.${productId}`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({ imagen: plan.new_img })
            });

            if (updateRes.ok) {
                console.log(`  - Successfully updated image path to: "${plan.new_img}" ✓`);
            } else {
                const errMsg = await updateRes.text();
                console.error(`  - FAILED to update product. Status: ${updateRes.status}. Error: ${errMsg}`);
            }
        } catch (e) {
            console.error(`  - Network/API error:`, e.message);
        }
        console.log('');
    }

    console.log('=== DATABASE UPDATE COMPLETED ===');
}

run().catch(err => {
    console.error('Fatal error:', err);
});
