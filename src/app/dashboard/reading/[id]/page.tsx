'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { mockReadings, Reading } from '@/data/mockReadings';
import { ChevronLeft, MessageCircle, BookOpen, PenTool, Youtube, AlertCircle, Sparkles, CheckCircle2, ChevronRight, Target, Image as ImageIcon, Printer, BookText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import ImageWithFallback from '@/components/ImageWithFallback';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReadingDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [reading, setReading] = useState<Reading | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'oralidad' | 'lectura' | 'escritura'>('lectura');

    useEffect(() => {
        const fetchReading = async () => {
            if (!id) return;
            setIsLoading(true);

            try {
                // PRIMERO BÚSQUEDA EN BASE DE DATOS PARA EDICIONES
                const docRef = doc(db, 'readings', id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setReading({ ...docSnap.data(), id: docSnap.id } as Reading);
                    return;
                }

                // SI NO EXISTE EN DB, VA POR MOCK DATA
                const staticReading = mockReadings.find((r) => r.id === id);
                if (staticReading) {
                    setReading(staticReading);
                } else {
                    setReading(null);
                }
            } catch (error) {
                console.error("Error fetching reading:", error);
                const staticReading = mockReadings.find((r) => r.id === id);
                setReading(staticReading || null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReading();
    }, [id]);

    if (isLoading) return <div className="p-8 text-center bg-slate-50 min-h-screen text-primary-600 font-bold flex items-center justify-center">Cargando evaluación...</div>;
    if (!reading) return <div className="p-8 text-center bg-slate-50 min-h-screen flex items-center justify-center">Lectura no encontrada</div>;

    const activeActivities = reading.actividades.filter(a => a.type === activeTab);

    return (
        <>
            <Header />
            <main className="flex-grow bg-slate-50 pb-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                    {/* Main Grid Container for Desktop */}
                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-10">

                        {/* LEFT COLUMN: Navigation, Cover, and Media Buttons */}
                        <div className="lg:col-span-4 flex flex-col gap-6 mb-8 lg:mb-0">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.back()}
                                    className="inline-flex items-center justify-center text-sm font-semibold text-black hover:text-primary-700 transition-colors bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-xl flex-grow"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Volver al Catálogo
                                </button>
                                <button
                                    onClick={() => {
                                        setIsLoading(true);
                                        // Forzar la recarga simple re-seteando el ID dispara de nuevo useEffect
                                        router.replace(`/dashboard/reading/${id}`);
                                    }}
                                    className="inline-flex items-center justify-center text-black hover:bg-orange-50 hover:text-orange-600 transition-colors bg-white border border-slate-200 shadow-sm p-2.5 rounded-xl w-fit"
                                    title="Refrescar Vista (Limpiar Caché)"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200 mb-6 bg-slate-100 flex justify-center items-center relative">
                                    <ImageWithFallback
                                        src={reading.portadaUrl}
                                        alt={reading.titulo}
                                        fill
                                        sizes="(max-width: 1024px) 50vw, 33vw"
                                        className="object-cover hover:scale-105 transition-transform duration-700 z-10"
                                        fallbackIconSize={12}
                                    />
                                </div>

                                <div className="flex flex-col gap-4 print:hidden">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl transition-colors text-sm w-full"
                                    >
                                        <Printer className="w-5 h-5" />
                                        Imprimir en PDF
                                    </button>
                                    <a
                                        href={reading.youtubeUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors text-sm w-full"
                                    >
                                        <Youtube className="w-5 h-5" />
                                        Ver Corto Animado o Canción
                                    </a>

                                    {(reading.youtubeUrl || reading.sugerenciaLibro) && (
                                        <div className="w-full mt-2 pt-6 border-t border-slate-200 print:hidden space-y-4">
                                            <h4 className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                                                <BookText className="w-4 h-4 text-orange-600" /> Material Complementario
                                            </h4>

                                            {reading.youtubeUrl && (
                                                <a href={reading.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group">
                                                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors">
                                                        <Youtube className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-black group-hover:text-red-700">Video Sugerido</p>
                                                        <p className="text-xs text-black line-clamp-1">Ver en YouTube</p>
                                                    </div>
                                                </a>
                                            )}

                                            {reading.sugerenciaLibro && (
                                                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                                        <BookOpen className="w-5 h-5 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-black">Obra Sugerida</p>
                                                        <p className="text-xs text-black leading-snug">{reading.sugerenciaLibro}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Badge, Title, Content, and CNEB Evaluation */}
                        <div className="lg:col-span-8 flex flex-col gap-8">

                            {/* Title Section */}
                            <div className="bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:break-inside-avoid">
                                <div className="flex flex-wrap gap-2 mb-5">
                                    <div className="inline-block px-4 py-1.5 bg-primary-100 text-primary-800 text-xs sm:text-sm font-black uppercase tracking-wider rounded-full shadow-inner">
                                        {reading.grado}° Grado de Primaria
                                    </div>
                                    <div className="inline-block px-4 py-1.5 bg-slate-100 text-black border border-slate-200 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-full">
                                        {reading.tipoTexto}
                                    </div>
                                </div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-[1.15] tracking-tight">
                                    {reading.titulo}
                                </h1>

                                <div className="prose prose-slate prose-lg max-w-none text-black leading-relaxed font-medium">
                                    {reading.esVisual && reading.imagenesSecuencia ? (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                            {reading.imagenesSecuencia.map((img, idx) => (
                                                <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm border border-slate-200 group bg-slate-100 flex items-center justify-center">
                                                    <ImageWithFallback
                                                        src={img}
                                                        alt={`Secuencia visual ${idx + 1}`}
                                                        fill
                                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500 absolute inset-0 z-10"
                                                        fallbackIconSize={8}
                                                    />
                                                    <div className="absolute top-2 left-2 bg-white/90 shadow-sm text-primary-700 text-xs px-2.5 py-1 rounded-full font-black border border-primary-100 z-20">
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-4" dangerouslySetInnerHTML={{ __html: reading.contenido }} />
                                    )}
                                </div>
                            </div>

                            {/* Evaluation Section Directly Below */}
                            <div className="bg-white rounded-2xl p-6 lg:p-10 shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:mt-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
                                    <h2 className="text-2xl lg:text-3xl font-extrabold text-black flex items-center gap-3">
                                        Evaluación <span className="text-primary-600">CNEB</span>
                                    </h2>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-100 uppercase tracking-wide flex items-center gap-2">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Innovación Lúdica Activa
                                    </span>
                                </div>

                                {/* Tabs: Lectura, Escritura, Oralidad */}
                                <div className="flex flex-wrap bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-8 gap-1.5 print:hidden">
                                    <button
                                        onClick={() => setActiveTab('lectura')}
                                        className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'lectura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'
                                            }`}
                                    >
                                        <BookOpen className="w-5 h-5" /> Lectura
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('escritura')}
                                        className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'escritura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'
                                            }`}
                                    >
                                        <PenTool className="w-5 h-5" /> Escritura
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('oralidad')}
                                        className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'oralidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'
                                            }`}
                                    >
                                        <MessageCircle className="w-5 h-5" /> Oralidad
                                    </button>
                                </div>

                                {/* Activities List */}
                                <div className="space-y-8">
                                    {activeTab === 'lectura' && reading.actividades.find(a => a.type === 'escritura') && (
                                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden print:break-inside-avoid print:mb-8 print:border-amber-300">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-60"></div>
                                            <h4 className="text-amber-800 font-extrabold flex items-center gap-2 mb-3 uppercase tracking-wide text-sm">
                                                <span className="text-2xl">🎯</span> TU MISIÓN:
                                            </h4>
                                            <p className="text-amber-950 font-medium leading-relaxed sm:pl-[36px]">
                                                {reading.actividades.find(a => a.type === 'escritura')?.pregunta}
                                            </p>
                                        </div>
                                    )}
                                    {activeActivities.map((activity, index) => (
                                        <div key={activity.id} className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary-300 transition-colors shadow-sm hover:shadow-md print:break-inside-avoid print:shadow-none print:border-slate-300">

                                            {/* Decorative subtle left border */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-primary-600 opacity-60"></div>

                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center font-black text-primary-700 shadow-inner shrink-0 text-xl border border-primary-100">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-grow pt-1">
                                                    {activity.type === 'escritura' ? (
                                                        <div className="bg-gradient-to-r from-amber-100 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm mb-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">🎯</span>
                                                                <span className="font-extrabold text-amber-900 tracking-wide uppercase text-sm">
                                                                    Misión del Estudiante (Consigna Auténtica)
                                                                </span>
                                                            </div>
                                                            <h3 className="text-lg lg:text-xl font-bold text-black leading-tight">
                                                                {activity.pregunta}
                                                            </h3>
                                                        </div>
                                                    ) : (
                                                        <h3 className="text-xl lg:text-2xl font-bold text-black leading-tight">
                                                            {activity.pregunta}
                                                        </h3>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="pl-0 sm:pl-[68px] space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-6 shadow-sm">
                                                        <p className="text-xs font-black text-orange-800 mb-3 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="text-lg">🎯</span> Meta Esperada
                                                        </p>
                                                        <p className="text-orange-950 leading-relaxed font-medium">
                                                            {activity.respuestaEsperada}
                                                        </p>
                                                    </div>

                                                    <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-6 shadow-sm">
                                                        <p className="text-xs font-black text-amber-800 mb-3 uppercase tracking-widest flex items-center gap-2">
                                                            <span className="text-lg">🎲</span> Dinámica Lúdica
                                                        </p>
                                                        <p className="text-amber-950 leading-relaxed font-medium">
                                                            {activity.estrategiasAplicacion || 'No hay estrategias definidas.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-5 print:break-inside-avoid">
                                                    <div className="flex-1 bg-slate-50/80 rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Capacidad CNEB
                                                        </p>
                                                        <p className="text-sm font-semibold text-black leading-relaxed">{activity.capacidad}</p>
                                                    </div>
                                                    <div className="flex-1 bg-slate-50/80 rounded-2xl p-5 border border-slate-100 shadow-sm">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Estándar CNEB
                                                        </p>
                                                        <p className="text-sm font-semibold text-black leading-relaxed">{activity.estandar}</p>
                                                    </div>
                                                </div>

                                                {/* Rubric Table */}
                                                {activity.rubricaEvaluacion && (
                                                    <div className="mt-8 pt-8 border-t border-slate-100 print:break-inside-avoid">
                                                        <h4 className="text-xs font-black text-black mb-4 uppercase tracking-widest">Rúbrica de Evaluación Formativa</h4>
                                                        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
                                                            <table className="w-full text-sm text-left">
                                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                                    <tr>
                                                                        <th className="px-5 py-4 font-extrabold w-1/4 border-r border-slate-200 text-orange-800 bg-orange-50/80">AD - Destacado</th>
                                                                        <th className="px-5 py-4 font-extrabold w-1/4 border-r border-slate-200 text-blue-800 bg-blue-50/80">A - Logrado</th>
                                                                        <th className="px-5 py-4 font-extrabold w-1/4 border-r border-slate-200 text-amber-800 bg-amber-50/80">B - En Proceso</th>
                                                                        <th className="px-5 py-4 font-extrabold w-1/4 text-rose-800 bg-rose-50/80">C - En Inicio</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                                    <tr>
                                                                        <td className="px-5 py-5 text-orange-950 border-r border-slate-100 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.destacado}</td>
                                                                        <td className="px-5 py-5 text-blue-950 border-r border-slate-100 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.logrado}</td>
                                                                        <td className="px-5 py-5 text-amber-950 border-r border-slate-100 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.proceso}</td>
                                                                        <td className="px-5 py-5 text-rose-950 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.inicio}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    ))}

                                    {activeActivities.length === 0 && (
                                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-slate-200 border-dashed text-slate-400">
                                            <AlertCircle className="w-10 h-10 mb-4 text-slate-300" />
                                            <p className="font-bold text-black text-lg">Aún no hay actividades innovadoras aquí.</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main >
        </>
    );
}
