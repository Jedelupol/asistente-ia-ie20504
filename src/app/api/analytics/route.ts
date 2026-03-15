import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getAdminDb();
        const readingsRef = db.collection('readings');
        
        // Fetch all non-deleted readings to calculate aggregations locally
        const snapshot = await readingsRef.where('isDeleted', '!=', true).get();
        // Since Firebase doesn't always perform well with '!=', doing a soft filtering:
        // Actually, '!=' requires a composite index. Let's just fetch all and filter in memory if needed.
        // Or better yet, just get all docs and filter.
        const allDocsSnapshot = await readingsRef.get();
        
        let totalGeneradas = 0;
        const porArea: Record<string, number> = {};
        const porNivel: Record<string, number> = {};
        const allReadings: any[] = [];

        allDocsSnapshot.forEach(doc => {
            const data = doc.data();
            // Skip deleted from soft delete
            if (data.isDeleted) return;

            totalGeneradas++;
            
            // Area aggregation
            const area = data.area || 'No especificada';
            porArea[area] = (porArea[area] || 0) + 1;

            // Nivel aggregation
            const rawNivel = typeof data.nivel === 'string' ? data.nivel : 'primaria';
            const nivel = rawNivel.toLowerCase();
            porNivel[nivel] = (porNivel[nivel] || 0) + 1;

            allReadings.push({
                id: doc.id,
                titulo: data.titulo,
                createdAt: data.createdAt,
                autor: data.autor || data.creatorName || 'Docente no identificado',
                creatorName: data.creatorName || 'Sistema',
                area: data.area,
                nivel: data.nivel,
                competencia: data.competencia || []
            });
        });

        // Sort by date descending and get top 5
        allReadings.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
        });

        const actividadReciente = allReadings;

        return NextResponse.json({
            totalGeneradas,
            porArea,
            porNivel,
            actividadReciente
        });
        
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
