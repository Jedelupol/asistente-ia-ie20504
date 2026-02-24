import fs from 'fs';

let content = fs.readFileSync('src/data/mockReadings.ts', 'utf8');

// 1. YouTube URLs: Replace all with a verified kids story / educational video ID to avoid broken links.
// Using a safe, verified ID.
content = content.replace(/youtubeUrl:\s*['"].*?['"]/g, "youtubeUrl: 'https://www.youtube.com/watch?v=d_b0wO5_Z0E'");

// 2. Images: Pattern match by ID or title to give highly specific coherent images.
const imageMap = {
    '1-plaza': 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600', // Plaza
    '1-mercado': 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=600', // Mercado
    '1-rio': 'https://images.unsplash.com/photo-1437482078695-73f5ca6c9688?auto=format&fit=crop&q=80&w=600', // Rio
    '2-aviso-mascota': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600', // CAT!
    '2-alfajores': 'https://upload.wikimedia.org/wikipedia/commons/0/05/Alfajores_de_maicena.jpg', // WIKIMEDIA ALFAJORES
    '2-invitacion': 'https://images.unsplash.com/photo-1530103862676-de8892bb6bf4?auto=format&fit=crop&q=80&w=600', // Fiesta/Invitacion
    '3-paramonga': 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600', // Fortaleza/Cerro
    '3-misterio-mercado': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600', // Mercado misterio
    '3-valle-rio': 'https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600', // Valle Verde
    '4-bolivar': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=600', // Simon Bolivar / Historia
    '4-guia-turismo': 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=600', // Guia turismo
    '4-carta-pescador': 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600', // Pescador bote
    '5-caral': 'https://images.unsplash.com/photo-1619446864816-c95663bd20ac?auto=format&fit=crop&q=80&w=600', // RUINAS CARAL
    '5-opinion-plaza': 'https://images.unsplash.com/photo-1596443686812-2f45229eebc3?auto=format&fit=crop&q=80&w=600', // Plaza arboles
    '5-mito-cerro': 'https://images.unsplash.com/photo-1590001158193-79ef94784405?auto=format&fit=crop&q=80&w=600', // Cerro
    '6-fortaleza': 'https://images.unsplash.com/photo-1531968455001-5c5277a9b127?auto=format&fit=crop&q=80&w=600', // Rio/Huayco
    '6-ensayo-pesca': 'https://images.unsplash.com/photo-1516086884617-f3c955a5b546?auto=format&fit=crop&q=80&w=600', // Pescadores
    '6-entrevista-cocinera': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600' // Cocina tradicional
};

for (const [id, url] of Object.entries(imageMap)) {
    // Replace the exact portadaUrl for the object matching the ID
    const regex = new RegExp(`(id:\\s*['"]${id}['"],(?:.|\\n)*?portadaUrl:\\s*)['"].*?['"](.*(?:\\n|\\r))`, 'gm');
    content = content.replace(regex, `$1'${url}'$2`);
}

// 3. Situación de Contexto (Consigna):
// Currently they start with '<i>*Contexto: [text]*</i>\n\n'
const contextReplacement = `<div class=\"bg-amber-50 p-5 rounded-2xl border border-amber-200 mb-6 shadow-sm\"><h4 class=\"text-amber-800 font-extrabold flex items-center gap-2 mb-2 uppercase tracking-wide text-sm\"><span class=\"text-xl\">🎯</span> Situación de Contexto (Consigna)</h4><p class=\"text-amber-950 font-medium leading-relaxed\">$1</p></div>\n\n`;
content = content.replace(/<i>\*Contexto:\s*(.*?)\*<\/i>\n\n/g, contextReplacement);

fs.writeFileSync('src/data/mockReadings.ts', content, 'utf8');
console.log('Patched mockReadings.ts successfully!');
