'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Header from '@/components/Header';
import ReadingCard from '@/components/ReadingCard';
import { mockReadings, Reading } from '@/data/mockReadings';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, query, where, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Trash2, AlertTriangle, LayoutGrid, List } from 'lucide-react';

function DashboardContent() {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    // Admin Bulk Actions State
    const [selectedReadings, setSelectedReadings] = useState<Set<string>>(new Set());
    const fileUploadRef = React.useRef<HTMLInputElement>(null);

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

    const toggleSelection = (id: string) => {
        setSelectedReadings(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleSelectAllInView = () => {
        if (selectedReadings.size === filteredReadings.length && filteredReadings.length > 0) {
            setSelectedReadings(new Set());
        } else {
            setSelectedReadings(new Set(filteredReadings.map(r => r.id)));
        }
    };

    const handleDownloadSelected = () => {
        const selectedData = allReadings.filter(r => selectedReadings.has(r.id));
        if (selectedData.length === 0) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedData, null, 2));
        const currentDate = new Date().toISOString().split('T')[0];
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `lecturas_exportadas_${currentDate}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        setSelectedReadings(new Set());
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);
                const readingsArray = Array.isArray(parsed) ? parsed : [parsed];

                if (readingsArray.length > 0 && confirm(`Estás a punto de subir ${readingsArray.length} lecturas a la base de datos. ¿Continuar?`)) {
                    setIsDeletingBulk(true); // Re-use loading state
                    let uploadedCount = 0;
                    for (const r of readingsArray) {
                        if (r.titulo && r.actividades) {
                            const { id, ...readingData } = r;
                            await setDoc(doc(collection(db, 'readings')), {
                                ...readingData,
                                createdAt: readingData.createdAt || new Date().toISOString()
                            });
                            uploadedCount++;
                        }
                    }
                    alert(`✅ Éxito: Se han subido ${uploadedCount} lecturas.`);
                    window.location.reload();
                }
            } catch (err) {
                console.error("Error parsing/uploading JSON:", err);
                alert("Error técnico al leer el archivo JSON.");
            } finally {
                setIsDeletingBulk(false);
                if (fileUploadRef.current) fileUploadRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

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
                        className={`flex-1 py-4 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSecundaria ? 'bg-primary-600 text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:bg-slate-300/50 hover:text-slate-700'}`}
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

                {/* Controls Bar: Grade Filters & View Toggle */}
                <div className="mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Grade Filters */}
                    <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
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

                    {/* View Toggle */}
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0 self-start lg:self-auto">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'grid' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            title="Vista Cuadrícula"
                        >
                            <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Muros</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'list' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                            title="Vista Lista"
                        >
                            <List className="w-4 h-4" /> <span className="hidden sm:inline">Filas</span>
                        </button>
                    </div>
                </div>

                {/* --- ADMIN BULK ACTIONS TOOL --- */}
                {isAdmin && (
                    <div className="mb-10 bg-slate-100 border border-slate-300 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                <h2 className="text-xl font-black text-slate-900">Herramientas de Administrador: Acciones Masivas</h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm">{selectedReadings.size} sel.</span>

                                <button
                                    onClick={handleSelectAllInView}
                                    className="text-sm font-bold text-slate-700 hover:text-black bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 transition-colors"
                                >
                                    {selectedReadings.size === filteredReadings.length && filteredReadings.length > 0 ? 'Desmarcar todo' : 'Seleccionar Vistos'}
                                </button>

                                <button
                                    onClick={handleDownloadSelected}
                                    disabled={selectedReadings.size === 0}
                                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md"
                                >
                                    Descargar JSON
                                </button>

                                <input
                                    type="file"
                                    accept=".json"
                                    ref={fileUploadRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileUploadRef.current?.click()}
                                    disabled={isDeletingBulk}
                                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold text-sm px-4 py-2 rounded-lg transition-all shadow-md"
                                >
                                    Subir JSON
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <h3 className="text-sm font-bold text-red-900 mb-2">Borrado Permanente por Rango de Fechas</h3>

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
                    </div>
                )}

                {/* Grid Layout for Reading Cards */}
                {filteredReadings.length > 0 ? (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" : "flex flex-col gap-4"}>
                        {filteredReadings.map((reading) => (
                            <div key={reading.id} className={viewMode === 'grid' ? "h-full" : ""}>
                                <ReadingCard
                                    reading={reading}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    viewMode={viewMode}
                                    selectable={isAdmin}
                                    isSelected={selectedReadings.has(reading.id)}
                                    onSelectToggle={toggleSelection}
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
                                <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-primary-100">
                                    🚀
                                </div>
                                <h3 className="text-2xl font-black text-black mb-4">¡Aún no hay retos de Secundaria!</h3>
                                <p className="text-slate-600 font-medium text-lg">
                                    Estimado (a) docente, ¿listo para crear el primer desafío STEAM de la I.E. 20504?
                                    <br /><span className="text-primary-600 font-bold mt-2 inline-block">¡Dirígete al Copiloto para comenzar!</span>
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
