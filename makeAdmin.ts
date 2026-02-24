import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

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
