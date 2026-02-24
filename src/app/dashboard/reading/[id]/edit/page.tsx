'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { mockReadings, Reading, CompetencyActivity } from '@/data/mockReadings';
import { ArrowLeft, Save, Plus, Trash2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function EditReadingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [reading, setReading] = useState<Reading | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchReading = async () => {
            try {
                // First check Firestore
                const docRef = doc(db, 'readings', resolvedParams.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setReading({ id: docSnap.id, ...docSnap.data() } as Reading);
                } else {
                    // Fallback to mock data
                    const mockReading = mockReadings.find(r => r.id === resolvedParams.id);
                    if (mockReading) {
                        setReading(mockReading);
                    } else {
                        throw new Error('Reading not found');
                    }
                }
            } catch (error) {
                console.error("Error fetching reading for edit:", error);
                alert("No se pudo cargar la lectura para editar.");
            } finally {
                setLoading(false);
            }
        };

        fetchReading();
    }, [resolvedParams.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setReading(prev => prev ? { ...prev, [name]: name === 'grado' ? parseInt(value) || 1 : value } : null);
    };

    const handleActivityChange = (index: number, field: string, value: string) => {
        setReading(prev => {
            if (!prev) return null;
            const newActivities = [...prev.actividades];
            // Update the specific field dynamically
            newActivities[index] = { ...newActivities[index], [field]: value };
            return { ...prev, actividades: newActivities };
        });
    };

    const handleImageSequenceChange = (index: number, value: string) => {
        setReading(prev => {
            if (!prev) return null;
            const newSequence = [...(prev.imagenesSecuencia || [])];
            newSequence[index] = value;
            return { ...prev, imagenesSecuencia: newSequence };
        });
    };

    const addImageToSequence = () => {
        setReading(prev => {
            if (!prev) return null;
            return { ...prev, imagenesSecuencia: [...(prev.imagenesSecuencia || []), ''] };
        });
    };

    const removeImageFromSequence = (index: number) => {
        setReading(prev => {
            if (!prev) return null;
            const newSequence = [...(prev.imagenesSecuencia || [])];
            newSequence.splice(index, 1);
            return { ...prev, imagenesSecuencia: newSequence };
        });
    };

    const handleImagenesReferenciaChange = (index: number, value: string) => {
        setReading(prev => {
            if (!prev) return null;
            const newRefs = [...(prev.imagenesReferencia || [])];
            newRefs[index] = value;
            return { ...prev, imagenesReferencia: newRefs };
        });
    };

    const addImagenReferencia = () => {
        setReading(prev => {
            if (!prev) return null;
            return { ...prev, imagenesReferencia: [...(prev.imagenesReferencia || []), ''] };
        });
    };

    const removeImagenReferencia = (index: number) => {
        setReading(prev => {
            if (!prev) return null;
            const newRefs = [...(prev.imagenesReferencia || [])];
            newRefs.splice(index, 1);
            return { ...prev, imagenesReferencia: newRefs };
        });
    };

    const handleRubricChange = (index: number, level: 'destacado' | 'logrado' | 'proceso' | 'inicio', value: string) => {
        setReading(prev => {
            if (!prev) return null;
            const newActivities = [...prev.actividades];
            newActivities[index] = {
                ...newActivities[index],
                rubricaEvaluacion: {
                    ...newActivities[index].rubricaEvaluacion,
                    [level]: value
                }
            } as CompetencyActivity;
            return { ...prev, actividades: newActivities };
        });
    };

    const handleSave = async () => {
        if (!reading) return;
        setSaving(true);
        try {
            await setDoc(doc(db, 'readings', reading.id), reading);
            alert("¡Lectura guardada correctamente!");
            router.push('/dashboard');
        } catch (error) {
            console.error("Error saving reading:", error);
            alert("Hubo un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-primary-600">Cargando editor...</div>;
    if (!reading) return <div className="min-h-screen flex items-center justify-center font-bold text-red-600">Lectura no encontrada.</div>;

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col">
            <Header />

            <div className="flex-grow max-w-5xl mx-auto w-full px-4 py-8">
                {/* Top Nav */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                    <Link href="/dashboard" className="flex items-center gap-2 text-black hover:text-primary-600 font-medium transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Volver al Catálogo
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-700 text-black px-6 py-2.5 rounded-xl font-bold font-sans shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
                    <h1 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                        <LayoutDashboard className="text-primary-600" />
                        Editar Lectura
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-bold text-black mb-2">Título de la Lectura</label>
                            <input name="titulo" value={reading.titulo} onChange={handleChange} className="w-full text-lg p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-slate-900 bg-white shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-2">Grado</label>
                            <select name="grado" value={reading.grado} onChange={handleChange} className="w-full text-lg p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 bg-white shadow-sm">
                                {[1, 2, 3, 4, 5, 6].map(g => <option key={g} value={g}>{g}° Grado</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-2">URL de Portada</label>
                            <input name="portadaUrl" value={reading.portadaUrl} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white shadow-sm" placeholder="https://..." />
                            {reading.portadaUrl && (
                                <div className="mt-2 relative aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                    <img
                                        src={reading.portadaUrl}
                                        alt="Vista previa"
                                        className="absolute inset-0 w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <span className="absolute bottom-1 right-2 text-[10px] text-slate-400 font-bold">Vista previa</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black mb-2">Enlace de YouTube (opcional)</label>
                            <input name="youtubeUrl" value={reading.youtubeUrl || ''} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white shadow-sm" />
                        </div>
                    </div>

                    <div className="mb-10">
                        <label className="block text-sm font-bold text-black mb-2">Contenido de la Lectura (Soporta HTML)</label>
                        <textarea name="contenido" value={reading.contenido || ''} onChange={handleChange} rows={6} className="w-full p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none font-sans text-slate-900 bg-white shadow-sm leading-relaxed"></textarea>
                    </div>

                    <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={reading.esVisual || false}
                                    onChange={(e) => setReading(prev => prev ? { ...prev, esVisual: e.target.checked } : null)}
                                    className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                                />
                                <span className="font-bold text-black">Esta lectura incluye secuencia de Imágenes Complementarias</span>
                            </label>
                        </div>

                        {reading.esVisual && (
                            <div className="space-y-4 mt-4 pl-8 border-l-2 border-primary-200">
                                <p className="text-sm font-medium text-slate-600 mb-2">Añade enlaces a imágenes (ej. Google Drive terminando en .jpg o .png, Unsplash, Wikimedia)</p>
                                {(reading.imagenesSecuencia || []).map((imgUrl, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <span className="font-bold text-slate-400 w-6">{idx + 1}.</span>
                                        <input
                                            value={imgUrl}
                                            onChange={(e) => handleImageSequenceChange(idx, e.target.value)}
                                            className="flex-grow p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white shadow-sm"
                                            placeholder="https://..."
                                        />
                                        <button
                                            onClick={() => removeImageFromSequence(idx)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                            title="Eliminar Imagen"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addImageToSequence}
                                    className="flex items-center gap-2 mt-4 px-4 py-2 bg-primary-100/50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition-colors text-sm"
                                >
                                    <Plus className="w-4 h-4" /> Añadir Nueva Imagen
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                        <h3 className="font-bold text-black mb-4">Imágenes de Referencia (Unsplash o manual)</h3>
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-600 mb-2">Imágenes referenciales integradas dentro de la lectura.</p>
                            {(reading.imagenesReferencia || []).map((imgUrl, idx) => (
                                <div key={`ref-${idx}`} className="flex items-center gap-3">
                                    <span className="font-bold text-slate-400 w-6">Img.</span>
                                    <input
                                        value={imgUrl}
                                        onChange={(e) => handleImagenesReferenciaChange(idx, e.target.value)}
                                        className="flex-grow p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-900 bg-white shadow-sm"
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <button
                                        onClick={() => removeImagenReferencia(idx)}
                                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                        title="Eliminar Imagen Referencia"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addImagenReferencia}
                                className="flex items-center gap-2 mt-4 px-4 py-2 bg-primary-100/50 hover:bg-primary-100 text-primary-700 font-bold rounded-xl transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" /> Añadir Imagen de Referencia
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-100 my-10" />

                    <h2 className="text-xl font-black text-black mb-6">Actividades y Rúbricas (CNEB)</h2>

                    <div className="space-y-8">
                        {reading.actividades.map((act, idx) => (
                            <div key={act.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative">
                                <span className="absolute -top-3 left-6 bg-primary-100 text-primary-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary-200">
                                    Actividad {idx + 1} ({act.type})
                                </span>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label className="block text-xs font-bold text-black uppercase mb-1">Consigna / Pregunta</label>
                                        <textarea value={act.pregunta} onChange={(e) => handleActivityChange(idx, 'pregunta', e.target.value)} rows={3} className="w-full p-3 rounded-xl border border-slate-300 outline-none text-sm text-slate-900 bg-white focus:border-primary-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-black uppercase mb-1">Respuesta Esperada</label>
                                        <textarea value={act.respuestaEsperada} onChange={(e) => handleActivityChange(idx, 'respuestaEsperada', e.target.value)} rows={3} className="w-full p-3 rounded-xl border border-slate-300 outline-none text-sm text-slate-900 bg-white focus:border-orange-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-black uppercase mb-1">Estrategias Lúdicas</label>
                                        <textarea value={act.estrategiasAplicacion || ''} onChange={(e) => handleActivityChange(idx, 'estrategiasAplicacion', e.target.value)} rows={3} className="w-full p-3 rounded-xl border border-slate-300 outline-none text-sm text-slate-900 bg-white focus:border-amber-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-black uppercase mb-1">Capacidad CNEB</label>
                                        <input value={act.capacidad} onChange={(e) => handleActivityChange(idx, 'capacidad', e.target.value)} className="w-full p-2.5 mb-3 rounded-xl border border-slate-300 outline-none text-sm text-slate-900 bg-white" />
                                        <label className="block text-xs font-bold text-black uppercase mb-1">Estándar</label>
                                        <input value={act.estandar} onChange={(e) => handleActivityChange(idx, 'estandar', e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-300 outline-none text-sm text-slate-900 bg-white" />
                                    </div>
                                </div>

                                {/* Rubric Editor */}
                                {act.rubricaEvaluacion && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">
                                        <h4 className="text-sm font-bold text-black mb-4">Rúbrica Específica</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="bg-white p-3 rounded-xl border border-blue-100">
                                                <div className="text-[10px] font-black uppercase text-blue-600 mb-2">Destacado (AD)</div>
                                                <textarea value={act.rubricaEvaluacion.destacado} onChange={(e) => handleRubricChange(idx, 'destacado', e.target.value)} rows={3} className="w-full text-xs p-2 bg-blue-50/30 text-slate-900 rounded border-0 focus:ring-1 focus:ring-blue-300 outline-none resize-y" />
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-orange-100">
                                                <div className="text-[10px] font-black uppercase text-orange-600 mb-2">Logrado (A)</div>
                                                <textarea value={act.rubricaEvaluacion.logrado} onChange={(e) => handleRubricChange(idx, 'logrado', e.target.value)} rows={3} className="w-full text-xs p-2 bg-orange-50/30 text-slate-900 rounded border-0 focus:ring-1 focus:ring-orange-300 outline-none resize-y" />
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-amber-100">
                                                <div className="text-[10px] font-black uppercase text-amber-600 mb-2">En Proceso (B)</div>
                                                <textarea value={act.rubricaEvaluacion.proceso} onChange={(e) => handleRubricChange(idx, 'proceso', e.target.value)} rows={3} className="w-full text-xs p-2 bg-amber-50/30 text-slate-900 rounded border-0 focus:ring-1 focus:ring-amber-300 outline-none resize-y" />
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border border-rose-100">
                                                <div className="text-[10px] font-black uppercase text-rose-600 mb-2">En Inicio (C)</div>
                                                <textarea value={act.rubricaEvaluacion.inicio} onChange={(e) => handleRubricChange(idx, 'inicio', e.target.value)} rows={3} className="w-full text-xs p-2 bg-rose-50/30 text-slate-900 rounded border-0 focus:ring-1 focus:ring-rose-300 outline-none resize-y" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
