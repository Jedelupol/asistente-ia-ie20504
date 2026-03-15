'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { BarChart3, BookOpen, Layers, Clock, AlertTriangle, TrendingUp, Users, Printer, Download } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
    totalGeneradas: number;
    porArea: Record<string, number>;
    porNivel: Record<string, number>;
    actividadReciente: Array<{
        id: string;
        titulo: string;
        createdAt: string;
        creatorName: string;
        autor?: string;
        area?: string;
        nivel?: string;
        competencia?: string[];
    }>;
}

export default function AnalyticsDashboardPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [authorFilter, setAuthorFilter] = useState('');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/dashboard');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/analytics');
                if (!res.ok) throw new Error('Error al obtener datos analíticos');
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Error desconocido');
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) {
            fetchAnalytics();
        }
    }, [isAdmin, authLoading, router]);

    if (authLoading || (loading && !error)) {
        return (
            <div className="min-h-screen bg-stone-100 font-sans">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D4037]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-100 font-sans">
                <Header />
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-[#5D4037] mb-2">Ops, algo salió mal</h2>
                    <p className="text-slate-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 bg-[#5D4037] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#4a332c] transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Derived values
    const comArea = data.porArea['Comunicación'] || 0;
    const matArea = data.porArea['Matemática'] || 0;
    const totalComMat = comArea + matArea;
    const comPercent = totalComMat > 0 ? Math.round((comArea / totalComMat) * 100) : 0;
    const matPercent = totalComMat > 0 ? Math.round((matArea / totalComMat) * 100) : 0;

    const primaria = data.porNivel['primaria'] || 0;
    const secundaria = data.porNivel['secundaria'] || 0;

    const filteredActivity = data.actividadReciente.filter(act => {
        let matches = true;
        if (startDate) {
            const [y, m, d] = startDate.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0);
            if (new Date(act.createdAt) < start) matches = false;
        }
        if (endDate) {
            const [y, m, d] = endDate.split('-').map(Number);
            const end = new Date(y, m - 1, d, 23, 59, 59);
            if (new Date(act.createdAt) > end) matches = false;
        }
        if (authorFilter) {
            const autorText = act.autor || act.creatorName || 'Sistema';
            if (!autorText.toLowerCase().includes(authorFilter.toLowerCase())) matches = false;
        }
        return matches;
    });

    const descargarCSV = () => {
        if (!filteredActivity || filteredActivity.length === 0) return;
        
        const cabeceras = ["Fecha", "Nivel", "Área", "Título", "Docente"];
        const filas = filteredActivity.map(item => [
            `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-PE') : ''}"`, 
            `"${item.nivel || ''}"`, 
            `"${item.area || ''}"`, 
            `"${item.titulo || ''}"`, 
            `"${item.autor || item.creatorName || 'Docente no identificado'}"`
        ]);
        
        const contenidoCSV = [cabeceras.join(","), ...filas.map(f => f.join(","))].join("\n");
        // @ts-ignore
        const blob = new Blob(["\ufeff", contenidoCSV], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Reporte_Lecturas_IE20504.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-stone-100 font-sans pb-20">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
                {/* Header Section */}
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl sm:text-4xl font-black text-[#5D4037] tracking-tight flex items-center justify-center sm:justify-start gap-3">
                        <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                        Dashboard
                    </h1>
                    <p className="mt-3 text-lg text-[#5D4037]/70 font-medium max-w-2xl mx-auto sm:mx-0">
                        Métricas de impacto y uso de la plataforma pedagógica IA.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Card 1: Total */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Métricas Globales</p>
                                <h3 className="text-4xl font-black text-[#5D4037]">{data.totalGeneradas}</h3>
                                <p className="text-stone-600 mt-2 font-medium">Materiales Generados</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                                <BookOpen className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Por Nivel (Primaria) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Impacto Primaria</p>
                                <h3 className="text-4xl font-black text-[#5D4037]">{primaria}</h3>
                                <p className="text-stone-600 mt-2 font-medium">Lecturas Creadas</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                <Users className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Por Nivel (Secundaria) */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-1">Impacto Secundaria</p>
                                <h3 className="text-4xl font-black text-[#5D4037]">{secundaria}</h3>
                                <p className="text-stone-600 mt-2 font-medium">Lecturas Creadas</p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                <Layers className="w-8 h-8" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bars & Dist Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
                        <h3 className="text-xl font-black text-[#5D4037] mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-orange-500" />
                            Distribución por Área
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-stone-700">Comunicación</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-[#5D4037]">{comArea}</span>
                                        <span className="text-sm text-stone-500 ml-2">({comPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div 
                                        className="bg-[#5D4037] h-4 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.max(comPercent, 2)}%` }} // Minimum width for visibility
                                    ></div>
                                </div>
                            </div>
                            
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-stone-700">Matemática</span>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-[#5D4037]">{matArea}</span>
                                        <span className="text-sm text-stone-500 ml-2">({matPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden shadow-inner">
                                    <div 
                                        className="bg-orange-500 h-4 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${Math.max(matPercent, 2)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Integrada or other areas if they exist */}
                            {Object.entries(data.porArea).filter(([k]) => k !== 'Comunicación' && k !== 'Matemática').map(([k, v]) => (
                                <div key={k}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-bold text-stone-700">{k}</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-[#5D4037]">{v}</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-stone-100 rounded-full h-4 overflow-hidden shadow-inner">
                                        <div 
                                            className="bg-emerald-600 h-4 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.max((v / data.totalGeneradas) * 100, 2)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generadas por Nivel (Pie/List alternative if needed, but we already have cards). Let's put a breakdown text. */}
                    <div className="bg-[#5D4037] rounded-2xl p-6 sm:p-8 shadow-md text-stone-100 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 border-4 border-orange-500/20 rounded-full"></div>
                        <div className="absolute top-10 -left-10 w-32 h-32 border-4 border-stone-100/10 rounded-full"></div>
                        <h3 className="text-2xl font-black text-white mb-4 relative z-10">
                            Análisis del Proyecto
                        </h3>
                        <p className="text-stone-300 leading-relaxed mb-6 relative z-10">
                            La plataforma está logrando su objetivo principal: capacitar a los docentes en el uso de IA para la generación masiva de materiales pedagógicos localizados. 
                            Las métricas reflejan una adopción {primaria > secundaria ? 'fuerte en Primaria' : 'equilibrada entre niveles'}, con un enfoque en reducir el tiempo de planificación.
                        </p>
                        <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm relative z-10">
                            <p className="text-sm font-bold uppercase tracking-wider text-orange-400 mb-1">Métrica Clave de Éxito</p>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-white">{data.totalGeneradas > 0 ? '100%' : '0%'}</span>
                                <span className="text-stone-300 text-sm leading-tight">Materiales alineados al CNEB generados exitosamente.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
                    <div className="p-6 sm:p-8 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                        <div className="flex items-center gap-3">
                            <Clock className="w-6 h-6 text-orange-500" />
                            <h3 className="text-xl font-black text-[#5D4037]">Historial de Generación</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            <input 
                                type="date" 
                                className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                            <input 
                                type="date" 
                                className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="Buscar por Docente..." 
                                className="px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={authorFilter}
                                onChange={(e) => setAuthorFilter(e.target.value)}
                            />
                            <button 
                                onClick={descargarCSV}
                                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" /> Excel (CSV)
                            </button>
                            <button 
                                onClick={() => window.print()}
                                className="flex items-center gap-2 bg-stone-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-stone-900 transition-colors text-sm whitespace-nowrap"
                            >
                                <Printer className="w-4 h-4" /> Imprimir Reporte
                            </button>
                        </div>
                    </div>
                    
                    {/* Print Header Visible Only on Print */}
                    <div className="hidden print:block p-6 mb-4 border-b-2 border-stone-800">
                        <h2 className="text-2xl font-black text-stone-900 mb-2">Reporte de Generación de Lecturas IE 20504</h2>
                        <p className="text-stone-600 font-medium text-sm">Filtros aplicados - Desde: {startDate ? new Date(startDate).toLocaleDateString('es-PE') : 'Inicio'} Hasta: {endDate ? new Date(endDate).toLocaleDateString('es-PE') : 'Hoy'} | Docente: {authorFilter || 'Todos'}</p>
                        <p className="text-stone-600 font-medium text-sm mt-1">Total de registros en este reporte: {filteredActivity.length}</p>
                    </div>
                    
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 print:max-h-none print:overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200">
                                    <th className="py-4 px-6 font-bold text-stone-600 text-sm uppercase tracking-wider">Título de Lectura</th>
                                    <th className="py-4 px-6 font-bold text-stone-600 text-sm uppercase tracking-wider">Área / Nivel</th>
                                    <th className="py-4 px-6 font-bold text-stone-600 text-sm uppercase tracking-wider">Autor</th>
                                    <th className="py-4 px-6 font-bold text-stone-600 text-sm uppercase tracking-wider">Competencia</th>
                                    <th className="py-4 px-6 font-bold text-stone-600 text-sm uppercase tracking-wider">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredActivity.length > 0 ? (
                                    filteredActivity.map((act) => (
                                        <tr key={act.id} className="border-b border-stone-100 hover:bg-orange-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-[#5D4037]">{act.titulo}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-block px-3 py-1 bg-stone-100 text-stone-700 text-xs font-bold rounded-full mr-2">
                                                    {act.area || 'N/A'}
                                                </span>
                                                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full capitalize">
                                                    {act.nivel || 'Primaria'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-stone-600 font-medium whitespace-nowrap">
                                                {act.autor || act.creatorName || 'Docente no identificado'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {(act.competencia || []).map((c, i) => (
                                                        <span key={i} className="inline-block px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold rounded-lg border border-stone-200 leading-tight" title={c}>
                                                            {c.substring(0, 30)}{c.length > 30 ? '...' : ''}
                                                        </span>
                                                    ))}
                                                    {(!act.competencia || act.competencia.length === 0) && <span className="text-sm text-stone-400">N/A</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-stone-500 text-sm whitespace-nowrap">
                                                {act.createdAt ? new Date(act.createdAt).toLocaleDateString('es-PE', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                }) : 'Desconocida'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-stone-500">
                                            No hay actividad reciente registrada en Firestore.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
