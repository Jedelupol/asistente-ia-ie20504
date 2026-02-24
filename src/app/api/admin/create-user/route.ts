import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

export async function POST(request: Request) {
    try {
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();

        // Verify authorization header (optional but recommended for production)
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Get user role to ensure they are admin
        const callerDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Solo los administradores pueden crear cuentas' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, displayName } = body;

        if (!email || !password || !displayName) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
        });

        // Add user profile to Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: 'teacher', // default role
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true, // For manual enabling/disabling
        });

        return NextResponse.json({ message: 'Usuario creado exitosamente', uid: userRecord.uid }, { status: 201 });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error creating user:', err);
        return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
    }
}
