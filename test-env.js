const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('--- INICIANDO DIAGNÓSTICO DEL ENTORNO ---');
console.log('1. Versión de Node.js:', process.version);

// Leer package.json
try {
    const pkgPath = path.join(__dirname, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    console.log('2. Versión instalada de @google/generative-ai:', pkg.dependencies['@google/generative-ai'] || 'No encontrada');
} catch (e) {
    console.log('2. Error leyendo package.json:', e.message);
}

// Leer API Key de .env.local
let apiKey = '';
try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        const match = envFile.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
        }
    }
} catch (e) {
    console.log('3. Error leyendo .env.local:', e.message);
}

if (!apiKey) {
    apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
}

if (apiKey) {
    console.log(`3. API Key detectada (primeros 5 caracteres): ${apiKey.substring(0, 5)}...`);
} else {
    console.log('3. API Key NO ENCONTRADA en el sistema.');
}

async function testGemini() {
    console.log('4. Intentando conexión mínima con Gemini 1.5 Flash (prompt: "Hola")...');
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('   Enviando solicitud...');
        const result = await model.generateContent('Hola');
        const response = await result.response;
        console.log('   [ÉXITO] Respuesta recibida:', response.text().trim());
    } catch (err) {
        console.error('\n!!! ERROR EXACTO CAPTURADO !!!');
        console.error(err);
        if (err.status) console.error('STATUS HTTP:', err.status);
        if (err.statusText) console.error('STATUS TEXT:', err.statusText);
    }
}

testGemini();
