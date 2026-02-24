import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const adminAuth = getAdminAuth();
        const adminDb = getAdminDb();
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        // Ensure callers are admins
        const callerDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { targetUid } = body;

        if (!targetUid) {
            return NextResponse.json({ error: 'Falta el ID del usuario a eliminar' }, { status: 400 });
        }

        if (targetUid === decodedToken.uid) {
            return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 400 });
        }

        // Delete from Firebase Auth
        await adminAuth.deleteUser(targetUid);

        // Delete from Firestore (optional, you might want to keep history and just set isActive: false)
        await adminDb.collection('users').doc(targetUid).delete();

        return NextResponse.json({ message: 'Usuario eliminado exitosamente' }, { status: 200 });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('Error deleting user:', err);
        return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
    }
}
