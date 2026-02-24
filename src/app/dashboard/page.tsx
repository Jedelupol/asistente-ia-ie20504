'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Header from '@/components/Header';
import ReadingCard from '@/components/ReadingCard';
import { mockReadings, Reading } from '@/data/mockReadings';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const nivel = searchParams.get('nivel') || 'primaria';
    const isSecundaria = nivel === 'secundaria';

    const [selectedGrade, setSelectedGrade] = useState<number | 'all'>('all');

    // Dynamic Grades Array based on Level
    const GRADES: { id: number | 'all', label: string }[] = isSecundaria ? [
        { id: 'all', label: 'Todos' },
        { id: 1, label: '1° Grado' },
        { id: 2, label: '2° Grado' },
        { id: 3, label: '3° Grado' },
        { id: 4, label: '4° Grado' },
        { id: 5, label: '5° Grado' },
    ] : [
        { id: 'all', label: 'Todos' },
        { id: 1, label: '1° Grado' },
        { id: 2, label: '2° Grado' },
        { id: 3, label: '3° Grado' },
        { id: 4, label: '4° Grado' },
        { id: 5, label: '5° Grado' },
        { id: 6, label: '6° Grado' },
    ];

    const [dbReadings, setDbReadings] = useState<Reading[]>([]);

    useEffect(() => {
        const fetchDbReadings = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'readings'));
                const fetched = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Reading));
                setDbReadings(fetched);
            } catch (err) {
                console.error("Error fetching AI readings:", err);
            }
        };
        fetchDbReadings();
    }, []);

    const handleEdit = (id: string) => {
        router.push(`/dashboard/reading/${id}/edit`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta lectura? Esta acción no se puede deshacer.')) return;
        try {
            await setDoc(doc(db, 'readings', id), { isDeleted: true }, { merge: true });
            setDbReadings(prev => {
                const existing = prev.find(r => r.id === id);
                if (existing) {
                    return prev.map(r => r.id === id ? { ...r, isDeleted: true } : r);
                } else {
                    return [...prev, { id, isDeleted: true } as unknown as Reading];
                }
            });
        } catch (error) {
            console.error('Error deleting reading:', error);
            alert('Error al intentar eliminar la lectura.');
        }
    };

    const mergedReadings = mockReadings.filter(mr => !dbReadings.some(dbr => dbr.id === mr.id));
    const allReadings = [...dbReadings, ...mergedReadings];

    const filteredReadings = allReadings.filter(r => {
        // @ts-ignore - isDeleted might be present in dbReadings
        if (r.isDeleted) return false;
        const itemNivel = r.nivel || 'primaria';
        if (itemNivel !== nivel) return false;
        if (selectedGrade !== 'all' && r.grado !== selectedGrade) return false;
        return true;
    });

    return (
        <main className="flex-grow bg-slate-50 relative overflow-hidden min-h-screen">
            {/* Subtle Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="mb-8 sm:mb-10 fade-in">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight capitalize">
                        Catálogo de Lecturas - {nivel}
                    </h1>
                    <p className="mt-3 text-lg text-black max-w-2xl">
                        Selecciona una lectura para iniciar el proceso de evaluación
                        según los estándares del <span className="font-semibold text-primary-700">CNEB</span>.
                    </p>
                </div>

                {/* Grade Filters */}
                <div className="mb-10 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-3 min-w-max">
                        {GRADES.map(grade => (
                            <button
                                key={grade.id}
                                onClick={() => setSelectedGrade(grade.id)}
                                className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm ${selectedGrade === grade.id
                                    ? 'bg-primary-600 text-black translate-y-[-2px] shadow-md'
                                    : 'bg-white text-black hover:bg-primary-50 hover:text-primary-700 border border-slate-200'
                                    }`}
                            >
                                {grade.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Layout for Reading Cards */}
                {filteredReadings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {filteredReadings.map((reading) => (
                            <div key={reading.id} className="h-full">
                                <ReadingCard
                                    reading={reading}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                        <h3 className="text-xl font-bold text-black mb-2">No se encontraron lecturas</h3>
                        <p className="text-black">Aún no hay lecturas publicadas en {nivel} para {GRADES.find(g => g.id === selectedGrade)?.label}.</p>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function DashboardPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-primary-600 font-bold">Cargando Catálogo...</div>}>
                <DashboardContent />
            </Suspense>
        </>
    );
}
