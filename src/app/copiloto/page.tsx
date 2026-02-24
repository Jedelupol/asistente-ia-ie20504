'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Bot, Sparkles, MapPin, Target, Loader2, ArrowRight, BookOpen, PenTool, MessageCircle, AlertCircle, ArrowLeft, Printer, Video, BookText, Youtube } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import Image from 'next/image';

interface Activity {
    id: string;
    type: 'oralidad' | 'lectura' | 'escritura';
    pregunta: string;
    respuestaEsperada: string;
    capacidad: string;
    estandar: string;
    estrategiasAplicacion: string;
    rubricaEvaluacion: {
        destacado: string;
        logrado: string;
        proceso: string;
        inicio: string;
    };
}

interface GeneratedReading {
    id: string;
    titulo: string;
    grado: number;
    tipoTexto: string;
    portadaUrl: string;
    contenido: string;
    youtubeUrl: string;
    sugerenciaLibro: string;
    actividades: Activity[];
}

export default function CopilotPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        ciclo: '',
        contexto: '',
        valor: ''
    });

    const [generatedReading, setGeneratedReading] = useState<GeneratedReading | null>(null);
    const [activeTab, setActiveTab] = useState<'lectura' | 'escritura' | 'oralidad'>('lectura');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const promptText = `Eres un asistente pedagógico de élite experto en el CNEB de Perú.
Genera contenido educativo con rigor curricular y creatividad excepcional. No uses formato markdown.

DATOS DEL DOCENTE PARA EL DIAGNÓSTICO:
- Nivel / Ciclo / Grado objetivo: ${formData.ciclo}
- Contexto Geográfico / Realidad Social o Local: ${formData.contexto}
- Desafío, Valor o Competencia Transversal a priorizar: ${formData.valor}

INSTRUCCIONES DE CONTENIDO:
- Textos amenos y contextualizados, apropiados para el grado. Si es secundaria, prioriza tecnología.
- 'portadaUrl' debe ser una URL funcional de imagen generada con palabras clave en inglés relacionadas al texto, formato: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=600" (usa una URL de ejemplo de unsplash y si no funciona cargará un ícono). Mejor aún, usa Pollinations AI: "https://image.pollinations.ai/prompt/[terminos+de+busqueda+en+ingles]?width=600&height=400&nologo=true".
- 'youtubeUrl' debe ser una búsqueda de YouTube relacionada al texto, formato: "https://www.youtube.com/results?search_query=[palabras+clave+busqueda]".
- Misión Auténtica: La actividad de 'escritura' debe tener una 'pregunta' que inicie con "🎯 TU MISIÓN: ".

ESTRUCTURA DE SALIDA REQUERIDA (Genera solo este JSON):
{
  "id": "copilot-gen-1",
  "titulo": "string",
  "grado": ${parseInt(formData.ciclo) || 5},
  "tipoTexto": "string",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "string",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "string",
  "actividades": [
    { "id": "act-1", "type": "oralidad", "pregunta": "string", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } },
    { "id": "act-2", "type": "lectura", "pregunta": "string", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } },
    { "id": "act-3", "type": "escritura", "pregunta": "🎯 TU MISIÓN: [tarea]", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } }
  ]
}`;

            const res = await fetch('/api/copilot/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText })
            });
            const data = await res.json();

            if (data.error) {
                alert("Error generando contenido: " + data.error);
                return;
            }

            // Save to Firestore to populate the public gallery
            try {
                const isSecundaria = formData.ciclo.toLowerCase().includes('secundaria');
                const { id: generatedId, ...restData } = data;
                const readingToSave = {
                    ...restData,
                    nivel: isSecundaria ? 'secundaria' : 'primaria',
                    createdAt: new Date().toISOString()
                };

                const docRef = await addDoc(collection(db, 'readings'), readingToSave);
                data.id = docRef.id; // Reflect the real database ID so the user can interact correctly
                data.nivel = readingToSave.nivel; // Apply the level
            } catch (dbError) {
                console.error("Error guardando en la galería:", dbError);
                // Proceed anyway so the user can see their generation even if saving fails
            }

            setGeneratedReading(data);
            setStep(2);
        } catch (error) {
            console.error("Critical Generation Error:", error);
            alert("Error de conexión con el Copiloto.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderDiagnosisForm = () => (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-orange-900/5 p-8 border border-orange-100/50 mt-10">
            <div className="text-center mb-10">
                <div className="w-64 h-64 mx-auto mb-6 relative opacity-90 hover:opacity-100 transition-opacity">
                    <Image
                        src="/copiloto-logo.png"
                        alt="Logo Copiloto Pedagógico"
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>
                <h1 className="text-3xl font-black text-black tracking-tight mb-2 flex items-center justify-center gap-3">
                    Copiloto Pedagógico <Sparkles className="w-6 h-6 text-orange-500" />
                </h1>
                <p className="text-black font-medium">IA Generativa alineada al CNEB para la I.E. 20504</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-black flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-orange-500" /> ¿En qué Ciclo y Grado trabajaremos?
                    </label>
                    <select
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5"
                        value={formData.ciclo}
                        onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                    >
                        <option value="">Selecciona el Ciclo y Grado...</option>
                        <option value="1er Grado Primaria (III Ciclo)">1er Grado Primaria (III Ciclo)</option>
                        <option value="2do Grado Primaria (III Ciclo)">2do Grado Primaria (III Ciclo)</option>
                        <option value="3er Grado Primaria (IV Ciclo)">3er Grado Primaria (IV Ciclo)</option>
                        <option value="4to Grado Primaria (IV Ciclo)">4to Grado Primaria (IV Ciclo)</option>
                        <option value="5to Grado Primaria (V Ciclo)">5to Grado Primaria (V Ciclo)</option>
                        <option value="6to Grado Primaria (V Ciclo)">6to Grado Primaria (V Ciclo)</option>
                        <option value="1er Grado Secundaria (VI Ciclo)">1er Grado Secundaria (VI Ciclo)</option>
                        <option value="2do Grado Secundaria (VI Ciclo)">2do Grado Secundaria (VI Ciclo)</option>
                        <option value="3er Grado Secundaria (VII Ciclo)">3er Grado Secundaria (VII Ciclo)</option>
                        <option value="4to Grado Secundaria (VII Ciclo)">4to Grado Secundaria (VII Ciclo)</option>
                        <option value="5to Grado Secundaria (VII Ciclo)">5to Grado Secundaria (VII Ciclo)</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-black flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" /> ¿Cuál es el contexto geográfico y social?
                    </label>
                    <textarea
                        required
                        placeholder="Ej. Distrito de Pativilca, zona agrícola, problemas ambientales por basura, niños hijos de agricultores..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5"
                        rows={3}
                        value={formData.contexto}
                        onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-black flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-500" /> ¿Qué desafío o valor quieres abordar?
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Ej. Identidad local, Innovación y Tecnología, Respeto..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5"
                        value={formData.valor}
                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-black font-bold rounded-xl py-4 shadow-lg shadow-orange-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-lg"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generando Arquitectura Pedagógica...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-6 h-6" /> Crear Lectura Mágica
                        </>
                    )}
                </button>
            </form>
        </div>
    );

    const renderResult = () => {
        if (!generatedReading) return null;
        const activeActivities = generatedReading.actividades.filter(a => a.type === activeTab);

        return (
            <div className="max-w-[1400px] mx-auto pb-20">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-black hover:text-orange-700 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Generar Otra Lectura
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                        <Printer className="w-5 h-5" /> Imprimir en PDF
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Visuals & Meta */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white p-3 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-900/5 sticky top-24">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                                <ImageWithFallback
                                    src={generatedReading.portadaUrl}
                                    alt={generatedReading.titulo}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    unoptimized
                                    fallbackIconSize={12}
                                />
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm border border-white/20 px-3 py-1.5 rounded-full font-bold text-sm text-black flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-orange-500" /> IA Generada
                                </div>
                            </div>

                            <div className="mt-6 px-3 pb-3 space-y-4">
                                <h3 className="text-xl font-bold tracking-tight text-black leading-tight">
                                    {generatedReading.titulo}
                                </h3>
                                <div className="flex gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 tracking-wide uppercase">
                                        Grado {generatedReading.grado}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                                        {generatedReading.tipoTexto}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Complementary Materials */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-lg shadow-slate-900/5 print:hidden">
                            <h4 className="text-sm font-black text-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <BookText className="w-4 h-4 text-orange-600" /> Material Complementario
                            </h4>
                            <div className="space-y-4">
                                {generatedReading.youtubeUrl && (
                                    <a href={generatedReading.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0 group-hover:bg-red-200 transition-colors">
                                            <Youtube className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black group-hover:text-red-700">Video Sugerido</p>
                                            <p className="text-xs text-black line-clamp-1">Ver en YouTube</p>
                                        </div>
                                    </a>
                                )}
                                {generatedReading.sugerenciaLibro && (
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-black">Obra Sugerida</p>
                                            <p className="text-xs text-black leading-snug">{generatedReading.sugerenciaLibro}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content & CNEB */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Reading Content */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-lg shadow-slate-900/5">
                            <h2 className="text-2xl font-black text-black mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                                Texto de Lectura
                            </h2>
                            <div className="text-black text-lg leading-relaxed font-medium space-y-4">
                                <div dangerouslySetInnerHTML={{ __html: generatedReading.contenido.replace(/\n\n/g, '<br/><br/>') }} />
                            </div>
                        </div>

                        {/* Evaluation Area */}
                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-lg shadow-slate-900/5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6">
                                <h2 className="text-2xl lg:text-3xl font-extrabold text-black flex items-center gap-3">
                                    Evaluación <span className="text-orange-600">CNEB</span>
                                </h2>
                                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 uppercase tracking-wide flex items-center gap-2">
                                    <Bot className="w-4 h-4" /> Validado por IA
                                </span>
                            </div>

                            {/* Tabs: Lectura, Escritura, Oralidad */}
                            <div className="flex flex-wrap bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-8 gap-1.5">
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
                            </div>

                            <div className="space-y-8">
                                {activeTab === 'lectura' && generatedReading.actividades.find(a => a.type === 'escritura') && (
                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-60"></div>
                                        <h4 className="text-amber-800 font-extrabold flex items-center gap-2 mb-3 uppercase tracking-wide text-sm">
                                            <span className="text-2xl">🎯</span> TU MISIÓN:
                                        </h4>
                                        <p className="text-amber-950 font-medium leading-relaxed sm:pl-[36px]">
                                            {generatedReading.actividades.find(a => a.type === 'escritura')?.pregunta}
                                        </p>
                                    </div>
                                )}

                                {activeActivities.map((activity, index) => (
                                    <div key={activity.id} className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-orange-300 transition-colors shadow-sm hover:shadow-md">

                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 opacity-60"></div>

                                        <div className="flex items-start gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-700 shadow-inner shrink-0 text-xl border border-orange-100">
                                                {index + 1}
                                            </div>
                                            <div className="flex-grow pt-1">
                                                {activity.type === 'escritura' ? (
                                                    <div className="bg-gradient-to-r from-amber-100 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm mb-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xl">🎯</span>
                                                            <h4 className="font-extrabold text-amber-900 uppercase text-xs tracking-wider">Actividad de Misión</h4>
                                                        </div>
                                                        <p className="text-amber-950 font-bold leading-relaxed">{activity.pregunta}</p>
                                                    </div>
                                                ) : (
                                                    <h4 className="text-lg font-bold text-black mb-3 leading-snug">
                                                        {activity.pregunta}
                                                    </h4>
                                                )}

                                                <div className="bg-orange-50/50 p-4 rounded-xl text-sm font-medium text-orange-900 border border-orange-100 mb-6 flex gap-3">
                                                    <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                                    <p><strong>Respuesta de la IA:</strong> {activity.respuestaEsperada}</p>
                                                </div>

                                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Capacidad CNEB</h5>
                                                        <p className="text-sm font-medium text-black leading-relaxed">{activity.capacidad}</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Estrategia Docente</h5>
                                                        <p className="text-sm font-medium text-black leading-relaxed">{activity.estrategiasAplicacion}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Rúbrica de Evaluación Delineada</h5>
                                                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                                                        <table className="w-full text-sm text-left">
                                                            <thead className="bg-slate-50 text-black font-bold text-xs uppercase tracking-wider">
                                                                <tr>
                                                                    <th className="px-4 py-3 border-b border-slate-200 w-1/4">En Inicio</th>
                                                                    <th className="px-4 py-3 border-b border-slate-200 w-1/4">En Proceso</th>
                                                                    <th className="px-4 py-3 border-b border-slate-200 w-1/4">Logrado</th>
                                                                    <th className="px-4 py-3 border-b border-slate-200 w-1/4">Destacado</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 bg-white text-black font-medium">
                                                                <tr>
                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top"><div className="flex gap-2 text-rose-600"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{activity.rubricaEvaluacion.inicio}</div></td>
                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top text-amber-600">{activity.rubricaEvaluacion.proceso}</td>
                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top text-orange-600">{activity.rubricaEvaluacion.logrado}</td>
                                                                    <td className="px-4 py-4 align-top text-blue-600 font-bold">{activity.rubricaEvaluacion.destacado}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 bg-fixed">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6 sm:py-12 relative z-10">
                {step === 1 ? renderDiagnosisForm() : renderResult()}
            </main>
        </div>
    );
}
