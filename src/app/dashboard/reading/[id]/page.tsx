'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { mockReadings, Reading } from '@/data/mockReadings';
import { ChevronLeft, MessageCircle, BookOpen, PenTool, Youtube, AlertCircle, BookText, RefreshCw, Printer, ImagePlus } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ReadingDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const [reading, setReading] = useState<Reading | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>('lectura'); // Changed from union to string to allow math tabs

    // Local Image State for Teachers/Admins to override the view for Printing
    const [localImage, setLocalImage] = useState<string | null>(null);
    const [isHoveringImage, setIsHoveringImage] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const isMath = reading?.actividades.some(a => ['cantidad', 'forma', 'regularidad', 'datos'].includes(a.type)) || false;

    // Auto-select correct first tab on load if the current tab is invalid for the type
    useEffect(() => {
        if (!reading) return;
        if (isMath && !['cantidad', 'forma', 'regularidad', 'datos'].includes(activeTab)) {
            setActiveTab('cantidad');
        } else if (!isMath && !['lectura', 'oralidad', 'escritura'].includes(activeTab)) {
            setActiveTab('lectura');
        }
    }, [isMath, reading, activeTab]);

    if (isLoading) return <div className="p-8 text-center bg-slate-50 min-h-screen text-primary-600 font-bold flex items-center justify-center">Cargando evaluación...</div>;
    if (!reading) return <div className="p-8 text-center bg-slate-50 min-h-screen flex items-center justify-center">Lectura no encontrada</div>;

    const activeActivities = reading.actividades.filter(a => a.type === activeTab);

    const handlePrint = () => {
        if (!reading) return;
        const originalTitle = document.title;
        document.title = `${reading.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${reading.grado}`;

        // Let the DOM update before calling print
        setTimeout(() => {
            window.print();
            document.title = originalTitle;
        }, 100);
    };

    const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setLocalImage(url);
        }
    };

    const handleUrlPaste = () => {
        const url = prompt('Pega la URL de la imagen que deseas usar para esta sesión:');
        if (url && url.startsWith('http')) {
            setLocalImage(url);
        }
    };

    const formatBoldText = (text: string | null | undefined) => {
        if (!text) return '';
        return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return (
        <>
            <div className="print:hidden">
                <Header />
            </div>
            <div className="min-h-screen bg-slate-50/30 print:bg-white pb-10 print:pb-0">

                {/* --- HACK: TABLE STRUCTURE FOR REPEATING PRINT HEADERS --- */}
                <table className="w-full block print:table print:border-collapse">
                    <thead className="hidden print:table-header-group">
                        <tr>
                            <td>
                                {/* INSTITUTIONAL PRINT HEADER */}
                                <div className="mb-8 text-center border-b-2 border-slate-800 pb-4">
                                    <h1 className="text-xl font-black text-black tracking-tight mb-1 uppercase">I.E. 20504 San Jerónimo de Pativilca</h1>
                                    <h2 className="text-sm font-bold text-slate-600">Proyecto: Copiloto Pedagógico</h2>
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody className="block print:table-row-group">
                        <tr className="block print:table-row">
                            <td className="block print:table-cell print:p-0">

                                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 print:p-0">

                                    {/* Main Grid Container for Desktop */}
                                    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-10 print:block">

                                        {/* LEFT COLUMN: Navigation, Cover, and Media Buttons */}
                                        <div className="lg:col-span-4 flex flex-col gap-6 mb-8 lg:mb-0 print:hidden">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => router.back()}
                                                    className="inline-flex items-center justify-center text-sm font-semibold text-black hover:text-primary-700 transition-colors bg-white border border-slate-200 shadow-sm px-5 py-2.5 rounded-xl flex-grow"
                                                >
                                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                                    Volver al Catálogo
                                                </button>
                                                <button
                                                    onClick={handlePrint}
                                                    className="inline-flex items-center justify-center text-black hover:bg-slate-100 transition-colors bg-white border border-slate-200 shadow-sm p-2.5 rounded-xl w-fit"
                                                    title="Imprimir Evaluación (PDF)"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsLoading(true);
                                                        router.replace(`/dashboard/reading/${id}`);
                                                    }}
                                                    className="inline-flex items-center justify-center text-black hover:bg-orange-50 hover:text-orange-600 transition-colors bg-white border border-slate-200 shadow-sm p-2.5 rounded-xl w-fit"
                                                    title="Refrescar Vista (Limpiar Caché)"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                                                <div
                                                    className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border border-slate-200 mb-6 bg-slate-100 flex justify-center items-center relative group"
                                                    onMouseEnter={() => setIsHoveringImage(true)}
                                                    onMouseLeave={() => setIsHoveringImage(false)}
                                                >
                                                    <ImageWithFallback
                                                        src={localImage || reading.portadaUrl}
                                                        alt={reading.titulo}
                                                        fill
                                                        sizes="(max-width: 1024px) 50vw, 33vw"
                                                        className="object-cover hover:scale-105 transition-transform duration-700 z-10"
                                                        fallbackIconSize={12}
                                                    />

                                                    {/* Image Swap Controllers - Hidden in Print */}
                                                    {isHoveringImage && (
                                                        <div className="absolute inset-0 bg-black/60 z-20 print:hidden flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200 backdrop-blur-sm">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="hidden"
                                                                ref={fileInputRef}
                                                                onChange={handleLocalImageUpload}
                                                            />
                                                            <button
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="bg-white text-black hover:bg-slate-100 font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                                                            >
                                                                <ImagePlus className="w-4 h-4" /> Subir Archivo
                                                            </button>
                                                            <button
                                                                onClick={handleUrlPaste}
                                                                className="bg-primary-600 text-black hover:bg-primary-700 font-bold px-4 py-2 rounded-lg text-sm shadow-lg transition-transform hover:scale-105"
                                                            >
                                                                Pegar URL
                                                            </button>
                                                            {localImage && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setLocalImage(null); }}
                                                                    className="text-white text-xs underline mt-2 hover:text-rose-300"
                                                                >
                                                                    Restaurar Imagen Original
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Reference Images in the left box */}
                                                {reading.imagenesReferencia && reading.imagenesReferencia.length > 0 && (
                                                    <div className="mt-4 space-y-3 print:hidden">
                                                        {reading.imagenesReferencia.map((imgUrl, idx) => (
                                                            <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                                                                <ImageWithFallback
                                                                    src={imgUrl}
                                                                    alt={`Imagen de referencia ${idx + 1}`}
                                                                    fill
                                                                    sizes="(max-width: 1024px) 50vw, 33vw"
                                                                    className="object-cover"
                                                                    fallbackIconSize={8}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-4 print:hidden">

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
                                        <div className="lg:col-span-8 flex flex-col gap-8 print:block">

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

                                                {(reading.creatorName || reading.createdAt || (reading as any).modificaciones) && (
                                                    <div className="flex flex-col gap-2 mb-4">
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-slate-500">
                                                            {reading.creatorName && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <PenTool className="w-4 h-4 text-orange-500" />
                                                                    <span>Creado por: <strong className="text-slate-700">{reading.creatorName}</strong></span>
                                                                </div>
                                                            )}
                                                            {reading.creatorName && reading.createdAt && (
                                                                <span className="text-slate-300 hidden sm:inline">•</span>
                                                            )}
                                                            {reading.createdAt && (
                                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                                    <span>{new Date(reading.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Edit History Section */}
                                                        {(reading as any).modificaciones && (reading as any).modificaciones.length > 0 && (
                                                            <div className="flex gap-2 items-center text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
                                                                <RefreshCw className="w-3.5 h-3.5" />
                                                                Última modificación por {(reading as any).modificaciones[(reading as any).modificaciones.length - 1].usuario} el {new Date((reading as any).modificaciones[(reading as any).modificaciones.length - 1].fecha).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

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

                                                {/* Tabs: Dynamic based on Area */}
                                                <div className="flex flex-wrap bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-8 gap-1.5 print:hidden">
                                                    {isMath ? (
                                                        <>
                                                            <button
                                                                onClick={() => setActiveTab('cantidad')}
                                                                className={`flex-1 min-w-[100px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'cantidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Cantidad
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('forma')}
                                                                className={`flex-1 min-w-[100px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'forma' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Forma
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('regularidad')}
                                                                className={`flex-1 min-w-[100px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'regularidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Regularidad
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('datos')}
                                                                className={`flex-1 min-w-[100px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-xs sm:text-sm transition-all ${activeTab === 'datos' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                Datos
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => setActiveTab('lectura')}
                                                                className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'lectura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                <BookOpen className="w-5 h-5" /> Lectura
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('escritura')}
                                                                className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'escritura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                <PenTool className="w-5 h-5" /> Escritura
                                                            </button>
                                                            <button
                                                                onClick={() => setActiveTab('oralidad')}
                                                                className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'oralidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                            >
                                                                <MessageCircle className="w-5 h-5" /> Oralidad
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Activities List */}
                                                <div className="space-y-8">
                                                    {activeTab === 'lectura' && reading.actividades.find(a => a.type === 'escritura') && (
                                                        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden print:hidden">
                                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-60"></div>
                                                            <h4 className="text-amber-800 font-extrabold flex items-center gap-2 mb-3 uppercase tracking-wide text-sm">
                                                                <span className="text-2xl">🎯</span> TU MISIÓN:
                                                            </h4>
                                                            <p className="text-amber-950 font-medium leading-relaxed sm:pl-[36px]" dangerouslySetInnerHTML={{ __html: formatBoldText(reading.actividades.find(a => a.type === 'escritura')?.pregunta) }}>
                                                            </p>
                                                        </div>
                                                    )}
                                                    {reading.actividades.map((activity, index) => (
                                                        <div key={activity.id} className={`bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex-col gap-6 relative overflow-hidden group hover:border-primary-300 transition-colors shadow-sm hover:shadow-md print:break-inside-avoid print:shadow-none print:border-slate-300 print:mt-8 ${activity.type === activeTab ? 'flex' : 'hidden print:flex'}`}>

                                                            {/* Activity Type Badge */}
                                                            <div className="absolute top-0 right-0 bg-slate-100 px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 rounded-bl-2xl border-b border-l border-slate-200 print:bg-slate-50 print:border-slate-300 print:text-black">
                                                                Competencia: {activity.type}
                                                            </div>

                                                            {/* Decorative subtle left border */}
                                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary-400 to-primary-600 opacity-60 print:hidden"></div>

                                                            <div className="flex items-start gap-5 mt-4 sm:mt-0">
                                                                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center font-black text-primary-700 shadow-inner shrink-0 text-xl border border-primary-100 print:border-slate-300 print:bg-white print:text-black">
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
                                                                            <h3 className="text-lg lg:text-xl font-bold text-black leading-tight" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta) }}>
                                                                            </h3>
                                                                        </div>
                                                                    ) : (
                                                                        <h3 className="text-xl lg:text-2xl font-bold text-black leading-tight" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta) }}>
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
                                                                        <p className="text-orange-950 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.respuestaEsperada) }}>
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
                                                                            <table className="w-full text-sm text-left rubric-table">
                                                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                                                    <tr>
                                                                                        <th className="px-5 py-4 font-extrabold w-[25%] border-r border-slate-200 text-orange-800 bg-orange-50/80">AD - Destacado</th>
                                                                                        <th className="px-5 py-4 font-extrabold w-[25%] border-r border-slate-200 text-emerald-800 bg-emerald-50/80">A - Logrado</th>
                                                                                        <th className="px-5 py-4 font-extrabold w-[25%] border-r border-slate-200 text-amber-800 bg-amber-50/80">B - En Proceso</th>
                                                                                        <th className="px-5 py-4 font-extrabold w-[25%] text-rose-800 bg-rose-50/80">C - En Inicio</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-slate-100 bg-white">
                                                                                    <tr>
                                                                                        <td className="px-5 py-5 text-orange-950 border-r border-slate-100 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.destacado}</td>
                                                                                        <td className="px-5 py-5 text-emerald-950 border-r border-slate-100 align-top leading-relaxed font-medium">{activity.rubricaEvaluacion.logrado}</td>
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

                                                    {reading.actividades.filter(a => a.type === activeTab).length === 0 && (
                                                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-3xl border-2 border-slate-200 border-dashed text-slate-400 print:hidden">
                                                            <AlertCircle className="w-10 h-10 mb-4 text-slate-300" />
                                                            <p className="font-bold text-black text-lg">Aún no hay actividades innovadoras aquí.</p>
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </td>
                        </tr>
                    </tbody>
                    <tfoot className="hidden print:table-footer-group">
                        <tr>
                            <td className="pt-6 pb-4 text-center">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-t border-slate-200 pt-4">Desarrollado por el Prof. de Innovación Pedagógica Lic. Jesús Luna Polanco - I.E. 20504</p>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <div className="mt-12 text-center print:hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desarrollado por el Prof. de Innovación Pedagógica Lic. Jesús Luna Polanco - I.E. 20504</p>
                </div>
            </div>
        </>
    );
}
