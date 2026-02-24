import * as admin from 'firebase-admin';

export const getFirebaseAdminApp = () => {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    // Handle newlines in the private key if it's passed as a single line string
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        } catch (error: unknown) {
            const err = error as Error;
            console.error('Firebase admin initialization error', err.stack);
            throw err;
        }
    }
    return admin;
};

export const getAdminAuth = () => getFirebaseAdminApp().auth();
export const getAdminDb = () => getFirebaseAdminApp().firestore();
