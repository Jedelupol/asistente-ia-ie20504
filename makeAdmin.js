/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const dotenv = require('dotenv'); // if exists, else parse manually

function parseEnv() {
    try {
        const file = fs.readFileSync('.env.local', 'utf8');
        file.split('\n').forEach(line => {
            if (line.includes('=')) {
                const parts = line.split('=');
                const key = parts[0].trim();
                let val = parts.slice(1).join('=').trim();
                if (val.startsWith('"') && val.endsWith('"')) {
                    val = val.slice(1, -1);
                }
                process.env[key] = process.env[key] || val;
            }
        });
    } catch (e) { }
}
parseEnv();

const creds = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    initializeApp({ credential: cert(creds) });
}

async function run() {
    const email = 'jesus@gmail.com';
    try {
        console.log(`Buscando al usuario ${email}...`);
        const user = await getAuth().getUserByEmail(email);
        console.log("Usuario encontrado, UID:", user.uid);

        await getFirestore().collection('users').doc(user.uid).set({
            email: user.email,
            role: 'admin',
            isActive: true,
            displayName: user.displayName || 'Lic. Jesús Luna Polanco'
        }, { merge: true });

        console.log("✅ El perfil del usuario en Firestore ha sido actualizado a 'admin'.");
    } catch (e) {
        console.error("❌ Error:", e);
    }
}

run();
