const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'mockReadings.ts');
let content = fs.readFileSync(filePath, 'utf8');

// The file exports an array of objects `readings: Reading[] = [...]`
// We need to insert a context paragraph at the beginning of each reading's `contenido` array.
// The context should be extracted from the `pregunta` of the `escritura` activity for that same reading.

let currentReadingIndex = -1;
let inReadingsArray = false;

// Let's use simple regex or string splits:
const readingBlocks = content.split(/(?=\n    \{|\n        id: \d+,)/g);

let newContent = readingBlocks.map(block => {
    // Check if this block defines a new reading
    if (block.match(/id: (\d+),/)) {
        // Find the 'escritura' pregunta inside this block
        const escrituraMatch = block.match(/type: 'escritura',\s*pregunta: '([^']+)'/);

        if (escrituraMatch) {
            const contextText = escrituraMatch[1];
            // Format it in italics
            const contextParagraph = `'*Contexto: ${contextText}*',`;

            // Find where `contenido: [` starts and insert as first element
            const contenidoStart = block.indexOf('contenido: [');
            if (contenidoStart !== -1) {
                // Find the first line inside the array
                // e.g., "        contenido: [\n            'Pativilca es un distrito..."

                const arrayContentStart = block.indexOf('\n', contenidoStart) + 1;
                // calculate indent based on next line
                const nextLineMatch = block.substring(arrayContentStart).match(/^(\s*)/);
                const indent = nextLineMatch ? nextLineMatch[1] : '            ';

                const before = block.substring(0, arrayContentStart);
                const after = block.substring(arrayContentStart);

                return before + indent + contextParagraph + '\n' + after;
            }
        }
    }
    return block;
}).join('');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully updated 18 readings with their context preambles.");
