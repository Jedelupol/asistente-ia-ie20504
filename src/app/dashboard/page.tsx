'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Header from '@/components/Header';
import ReadingCard from '@/components/ReadingCard';
import { mockReadings, Reading } from '@/data/mockReadings';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, where, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Trash2, AlertTriangle } from 'lucide-react';

function DashboardContent() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    // Persistent state initialization
    const [activeNivel, setActiveNivel] = useState<'primaria' | 'secundaria'>('primaria');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Read from localStorage on mount
        const savedNivel = localStorage.getItem('dashboard_nivel') as 'primaria' | 'secundaria';
        if (savedNivel) {
            setActiveNivel(savedNivel);
        }
        setIsInitialized(true);
    }, []);

    const handleNivelChange = (newNivel: 'primaria' | 'secundaria') => {
        setActiveNivel(newNivel);
        localStorage.setItem('dashboard_nivel', newNivel);
        setSelectedGrade('all'); // Reset grade filter when changing levels
    };

    const isSecundaria = activeNivel === 'secundaria';

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
        // @ts-expect-error - isDeleted might be present in dbReadings
        if (r.isDeleted) return false;
        const itemNivel = r.nivel || 'primaria';
        if (itemNivel !== activeNivel) return false;
        if (selectedGrade !== 'all' && r.grado !== selectedGrade) return false;
        return true;
    });

    if (!isInitialized) return <div className="min-h-screen flex items-center justify-center text-primary-600 font-bold">Cargando Catálogo...</div>;

    return (
        <main className="flex-grow bg-slate-50 relative overflow-hidden min-h-screen">
            {/* Subtle Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -z-10 -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

                {/* GLOBAL LEVEL TABS */}
                <div className="flex bg-slate-200/50 p-1.5 rounded-2xl mb-10 max-w-2xl mx-auto border border-slate-200 shadow-inner">
                    <button
                        onClick={() => handleNivelChange('primaria')}
                        className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${!isSecundaria ? 'bg-orange-500 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
                    >
                        Vista Primaria
                    </button>
                    <button
                        onClick={() => handleNivelChange('secundaria')}
                        className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSecundaria ? 'bg-blue-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
                    >
                        Vista Secundaria
                    </button>
                </div>

                <div className="mb-8 sm:mb-10 text-center fade-in">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
                        Catálogo de Lecturas - {activeNivel}
                    </h1>
                    <p className="mt-3 text-lg text-black max-w-2xl mx-auto font-medium">
                        Selecciona o gestiona el material generado por IA para la I.E. 20504 alineado al <span className="font-bold text-orange-600">CNEB</span>.
                    </p>
                </div>

                {/* Grade Filters */}
                <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 sm:gap-3 min-w-max">
                        {GRADES.map((grade) => (
                            <button
                                key={grade.id}
                                onClick={() => setSelectedGrade(grade.id)}
                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-300 ${selectedGrade === grade.id
                                    ? 'bg-slate-900 text-white shadow-md scale-105'
                                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                                    }`}
                            >
                                {grade.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- ADMIN BULK DELETE TOOL --- */}
                {isAdmin && (
                    <div className="mb-10 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            <h2 className="text-xl font-black text-red-900">Herramienta de Administrador: Borrado Masivo</h2>
                        </div>
                        <p className="text-sm text-red-800 mb-4 font-medium">Permite eliminar permanentemente múltiples lecturas generadas por IA dentro de un rango de fechas. Usa esta herramienta con precaución para no agotar la cuota de Firebase.</p>

                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                            <div className="flex-1 w-full relative">
                                <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-white border border-red-200 text-red-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-3 shadow-sm z-10 relative cursor-text"
                                    onClick={(e) => {
                                        if ('showPicker' in HTMLInputElement.prototype) {
                                            (e.target as HTMLInputElement).showPicker();
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-1 w-full relative">
                                <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Fecha Final</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white border border-red-200 text-red-900 text-sm rounded-xl focus:ring-red-500 focus:border-red-500 block p-3 shadow-sm z-10 relative cursor-text"
                                    onClick={(e) => {
                                        if ('showPicker' in HTMLInputElement.prototype) {
                                            (e.target as HTMLInputElement).showPicker();
                                        }
                                    }}
                                />
                            </div>
                            <button
                                onClick={async () => {
                                    if (!startDate || !endDate) {
                                        alert("Por favor selecciona ambas fechas.");
                                        return;
                                    }
                                    const start = new Date(startDate);
                                    start.setHours(0, 0, 0, 0);
                                    const end = new Date(endDate);
                                    end.setHours(23, 59, 59, 999);

                                    if (start > end) {
                                        alert("La fecha de inicio no puede ser posterior a la fecha final.");
                                        return;
                                    }

                                    if (!confirm(`⚠️ ALERTA CRÍTICA: Estás a punto de borrar PERMANENTEMENTE TODAS las lecturas creadas entre ${start.toLocaleDateString()} y ${end.toLocaleDateString()}.\n\nEsta acción NO SE PUEDE DESHACER.\n\n¿Estás absolutamente seguro?`)) return;

                                    setIsDeletingBulk(true);
                                    try {
                                        const readingsRef = collection(db, 'readings');
                                        const q = query(
                                            readingsRef,
                                            where('createdAt', '>=', start.toISOString()),
                                            where('createdAt', '<=', end.toISOString())
                                        );
                                        const snapshot = await getDocs(q);

                                        if (snapshot.empty) {
                                            alert("No se encontraron documentados generados en este rango de fechas.");
                                            setIsDeletingBulk(false);
                                            return;
                                        }

                                        let deletedCount = 0;
                                        // Execute in batches or sequentially to avoid limits if large
                                        for (const document of snapshot.docs) {
                                            await deleteDoc(doc(db, 'readings', document.id));
                                            deletedCount++;
                                        }

                                        alert(`✅ Éxito: Se han borrado permanentemente ${deletedCount} lecturas.`);

                                        // Update UI State
                                        const deletedIds = snapshot.docs.map(d => d.id);
                                        setDbReadings(prev => prev.filter(r => !deletedIds.includes(r.id)));

                                    } catch (err) {
                                        console.error("Bulk delete failed:", err);
                                        alert("Ocurrió un error general durante el borrado masivo. Comprueba la consola.");
                                    } finally {
                                        setIsDeletingBulk(false);
                                    }
                                }}
                                disabled={isDeletingBulk}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md"
                            >
                                {isDeletingBulk ? 'Borrando...' : <><Trash2 className="w-5 h-5" /> Borrar Rango</>}
                            </button>
                        </div>
                    </div>
                )}
                {/* ------------------------------- */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 shadow-sm max-w-3xl mx-auto">
                        {!isSecundaria ? (
                            <>
                                <h3 className="text-2xl font-black text-black mb-4">No se encontraron lecturas</h3>
                                <p className="text-slate-600 font-medium text-lg">Aún no hay lecturas publicadas en Primaria para {GRADES.find(g => g.id === selectedGrade)?.label}.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-blue-100">
                                    🚀
                                </div>
                                <h3 className="text-2xl font-black text-black mb-4">¡Aún no hay retos de Secundaria!</h3>
                                <p className="text-slate-600 font-medium text-lg">
                                    Estimado (a) docente, ¿listo para crear el primer desafío STEAM de la I.E. 20504?
                                    <br /><span className="text-blue-600 font-bold mt-2 inline-block">¡Dirígete al Copiloto para comenzar!</span>
                                </p>
                            </>
                        )}
                        <button
                            onClick={() => router.push('/copiloto')}
                            className="mt-8 bg-black hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg"
                        >
                            Ir al Copiloto Pedagógico
                        </button>
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
