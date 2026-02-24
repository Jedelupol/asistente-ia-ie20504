'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Bot, Sparkles, MapPin, Target, Loader2, BookOpen, PenTool, MessageCircle, AlertCircle, ArrowLeft, Printer, BookText, Youtube } from 'lucide-react';
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
    searchKeywords?: string;
    imagenesReferencia?: string[];
    actividades: Activity[];
}

export default function CopilotPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        nivelMaestro: 'Primaria',
        area: 'Comunicación',
        ciclo: '',
        competencia: [] as string[],
        contexto: '',
        valor: '',
        temperature: 0.7
    });

    const [generatedReading, setGeneratedReading] = useState<GeneratedReading | null>(null);
    const [activeTab, setActiveTab] = useState<'lectura' | 'escritura' | 'oralidad'>('lectura');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const isSecundariaVar = formData.nivelMaestro === 'Secundaria';
            const competenciasUnidas = formData.competencia.join(', ');
            let promptText = '';

            if (formData.area === 'Comunicación') {
                promptText = `Eres un asistente pedagógico de élite experto en el CNEB de Perú.
Genera contenido educativo con rigor curricular y creatividad excepcional. No uses formato markdown.

DATOS DEL DOCENTE PARA EL DIAGNÓSTICO:
- Área: Comunicación
- Nivel Maestro: ${formData.nivelMaestro}
- Grado objetivo: ${formData.ciclo}
- Competencias seleccionadas: ${competenciasUnidas}
- Contexto Institucional / Situación Significativa: ${formData.contexto}
- Desafío, Valor o Tema a priorizar: ${formData.valor}

INSTRUCCIONES DE CONTENIDO (ESTÁNDAR DE EXCELENCIA PEDAGÓGICA - ACTUALIZACIÓN V2):
- DIVERSIDAD TEMÁTICA: Evita repetir temas. Si es sobre tecnología, no uses solo drones o Arduino. Rota entre Inteligencia Artificial, Biotecnología, Exploración Espacial, Energías Renovables, Realidad Virtual, Impresión 3D y Ciberseguridad.
- MOTOR LÚDICO (Primaria): Si el nivel es Primaria, integra activamente referencias a la cultura pop (All Might, superhéroes, dibujos animados) y contextos de alta fantasía.
- ESCENARIOS VARIADOS: No te limites siempre a Pativilca. Contextualiza en el espacio exterior, el mundo microscópico, o ciudades futuristas, combinándolo mágicamente con la Situación Significativa.
- EL ESTUDIANTE COMO PROTAGONISTA: El texto debe dirigirse al estudiante como investigador, héroe, ingeniero o explorador.
- RESTRICCIÓN DE IDIOMA ESTRICTA: Todo el contenido, incluyendo sugerencias de libros y el enlace a YouTube ('youtubeUrl'), DEBE SER 100% EN ESPAÑOL. No incluyas enlaces a videos en inglés.
- REGLA DE ORO INQUEBRANTABLE: JAMÁS omitas 'portadaUrl', 'youtubeUrl', ni las 3 actividades (Lectura, Escritura, Oralidad) ni las rúbricas. Reduce la historia si es necesario para conservar la estructura JSON impecable.
- 'portadaUrl' debe ser una URL de imagen con palabras clave en inglés (ej: "https://image.pollinations.ai/prompt/[terminos+en+ingles]?width=600&height=400&nologo=true").
- 'youtubeUrl': "https://www.youtube.com/results?search_query=[palabras+clave+EN+ESPAÑOL]".

En el campo 'searchKeywords', debes extraer exactamente 2 o 3 palabras clave EN INGLÉS precisas para imagen. REGLA ESTRICTA: Si es ficción (Anime), extrae keywords hiper-abstractas y artísticas en inglés (ej: "heroic energy neon", "futuristic neon city").`;
            } else {
                const steamInfo = isSecundariaVar
                    ? " Integra fuertemente conceptos avanzados de Electrónica, Arduino o Ciencia de Datos (STEAM)."
                    : " Usa un enfoque maker, robots simples y exploración.";
                promptText = `Eres un asistente pedagógico de élite experto en el CNEB de Perú.
Genera contenido educativo con rigor curricular y creatividad excepcional. No uses formato markdown.

DATOS DEL DOCENTE PARA EL DIAGNÓSTICO:
- Área: ${formData.area}
- Nivel Maestro: ${formData.nivelMaestro}
- Grado objetivo: ${formData.ciclo}
- Competencias seleccionadas: ${competenciasUnidas}
- Contexto Institucional / Situación Significativa: ${formData.contexto}
- Desafío, Valor o Tema a priorizar: ${formData.valor}

INSTRUCCIONES DE CONTENIDO (ESTÁNDAR DE EXCELENCIA PEDAGÓGICA - ACTUALIZACIÓN V2):
- DIVERSIDAD TEMÁTICA: Evita repetir temas. Si es sobre tecnología, no uses solo drones o Arduino. Rota entre Inteligencia Artificial, Biotecnología, Exploración Espacial, Energías Renovables, Realidad Virtual, Impresión 3D y Ciberseguridad.
- MOTOR LÚDICO (Primaria): Si el nivel es Primaria, integra activamente referencias a la cultura pop (All Might, superhéroes, dibujos animados) y contextos de alta fantasía.
- ESCENARIOS VARIADOS: No te limites siempre a Pativilca. Contextualiza en el espacio exterior, el mundo microscópico, o ciudades futuristas, combinándolo mágicamente con la Situación Significativa.
- EL ESTUDIANTE COMO PROTAGONISTA: El texto debe dirigirse al estudiante como investigador, héroe, ingeniero o explorador.${steamInfo}
- RESTRICCIÓN DE IDIOMA ESTRICTA: Todo el contenido, incluyendo sugerencias de libros y el enlace a YouTube ('youtubeUrl'), DEBE SER 100% EN ESPAÑOL. No incluyas enlaces a videos en inglés.
- REGLA DE ORO INQUEBRANTABLE: JAMÁS omitas 'portadaUrl', 'youtubeUrl', ni las 3 actividades (Lectura, Escritura, Oralidad) ni las rúbricas. Si el nivel Secundaria genera mucho texto, reduce la longitud de la historia, pero NUNCA sacrifiques la estructura JSON ni las actividades pedagógicas obligatorias.
- 'portadaUrl' debe ser una URL de imagen con palabras clave en inglés (ej: "https://image.pollinations.ai/prompt/[terminos+en+ingles]?width=600&height=400&nologo=true").
- 'youtubeUrl': "https://www.youtube.com/results?search_query=[palabras+clave+EN+ESPAÑOL]".

En el campo 'searchKeywords', debes extraer exactamente 2 o 3 palabras clave EN INGLÉS precisas para imagen. REGLA ESTRICTA: Si es ficción (Anime), extrae keywords hiper-abstractas y artísticas en inglés (ej: "heroic energy neon", "futuristic neon city"). Si es ciencia, usa términos realistas (ej: "dna biotech").`;
            }

            // Output structure hint
            promptText += `

Estructura de JSON base referencial (Devuelve esto pero con tu lista de actividades dinámicas según lo marcado):
{
  "id": "copilot-gen-dyn",
  "titulo": "string",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '5')},
  "tipoTexto": "string",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "[[Narrativa vibrante]]<br/><br/><strong>🏃‍♂️ RETO OFFLINE:</strong> [[Descripción]]",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "string",
  "searchKeywords": "string",
  "actividades": [
    { "id": "act-1", "type": "lectura", "pregunta": "🎯 [Consigna usando verbo CNEB]", "respuestaEsperada": "string", "capacidad": "[Alineada a una de las competencias marcadas]", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } }
  ]
}`;

            const res = await fetch('/api/copilot/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptText,
                    temperature: formData.temperature
                })
            });
            const data = await res.json();

            if (data.error) {
                alert("Error generando contenido: " + data.error);
                return;
            }

            // Save to Firestore to populate the public gallery
            try {
                const isSecundaria = formData.nivelMaestro === 'Secundaria';
                const { id, ...restData } = data;
                const readingToSave = {
                    ...restData,
                    nivel: isSecundaria ? 'secundaria' : 'primaria',
                    area: formData.area || 'Comunicación',
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
            {!isLoading && !generatedReading && (
                <div className="text-center mb-10 relative">
                    <div className="w-64 h-64 mx-auto mb-6 relative opacity-90 hover:opacity-100 transition-opacity">
                        <Image
                            src="/copiloto-logo.png"
                            alt="Logo Copiloto Pedagógico"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>
                    <h1 className="text-4xl font-black text-black tracking-tight mb-2 flex items-center justify-center gap-3">
                        ¡Bienvenido, Estimado Docente! <Sparkles className="w-8 h-8 text-orange-500" />
                    </h1>
                    <p className="text-black font-medium text-xl opacity-80">El Copiloto está listo para diseñar su próxima lectura.</p>
                </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-8">

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <label className="text-sm font-black text-black uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-orange-500" /> Nivel Global de Complejidad
                    </label>
                    <div className="flex gap-4">
                        <label className={`cursor-pointer flex-1 text-center py-3 rounded-xl border-2 font-black transition-all ${formData.nivelMaestro === 'Primaria' ? 'border-orange-500 bg-orange-500 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-orange-300'}`}>
                            <input type="radio" name="nivel" className="hidden" value="Primaria" onChange={(e) => setFormData({ ...formData, nivelMaestro: e.target.value, ciclo: '1er Grado' })} checked={formData.nivelMaestro === 'Primaria'} />
                            Primaria (Enfoque Lúdico)
                        </label>
                        <label className={`cursor-pointer flex-1 text-center py-3 rounded-xl border-2 font-black transition-all ${formData.nivelMaestro === 'Secundaria' ? 'border-blue-500 bg-blue-500 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'}`}>
                            <input type="radio" name="nivel" className="hidden" value="Secundaria" onChange={(e) => setFormData({ ...formData, nivelMaestro: e.target.value, ciclo: '1er Año' })} checked={formData.nivelMaestro === 'Secundaria'} />
                            Secundaria (Enfoque STEAM)
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-8">
                    {/* SELECTOR A: ÁREA */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-orange-500" /> Área Curricular
                        </label>
                        <select
                            required
                            className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5 appearance-none"
                            value={formData.area}
                            onChange={(e) => setFormData({ ...formData, area: e.target.value, competencia: [] })}
                        >
                            <option value="Comunicación">Comunicación</option>
                            <option value="Matemática">Matemática</option>
                            <option value="Integrada (STEAM)">Integrada (STEAM)</option>
                        </select>
                    </div>

                    {/* SELECTOR B: GRADO */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-500" /> Grado Específico
                        </label>
                        <select
                            required
                            className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5 appearance-none"
                            value={formData.ciclo}
                            onChange={(e) => setFormData({ ...formData, ciclo: e.target.value })}
                        >
                            <option value="">Selecciona Grado...</option>
                            {formData.nivelMaestro === 'Primaria' ? (
                                <>
                                    <option value="1er Grado">1° Grado</option>
                                    <option value="2do Grado">2° Grado</option>
                                    <option value="3er Grado">3° Grado</option>
                                    <option value="4to Grado">4° Grado</option>
                                    <option value="5to Grado">5° Grado</option>
                                    <option value="6to Grado">6° Grado</option>
                                </>
                            ) : (
                                <>
                                    <option value="1er Año">1° Año de Secundaria</option>
                                    <option value="2do Año">2° Año de Secundaria</option>
                                    <option value="3er Año">3° Año de Secundaria</option>
                                    <option value="4to Año">4° Año de Secundaria</option>
                                    <option value="5to Año">5° Año de Secundaria</option>
                                </>
                            )}
                        </select>
                    </div>
                </div>

                {/* MULTI-SELECTOR C: COMPETENCIAS CNEB (CHECKBOXES) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-inner">
                    <label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-orange-500" /> Competencias CNEB a evaluar
                        <span className="text-xs font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full ml-auto normal-case">
                            Marca una o varias
                        </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.area === 'Comunicación' && [
                            "Lee diversos tipos de textos",
                            "Escribe diversos tipos de textos",
                            "Se comunica oralmente en su lengua materna"
                        ].map(comp => (
                            <label key={comp} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.competencia.includes(comp) ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-orange-500 border-slate-300 rounded focus:ring-orange-500"
                                    checked={formData.competencia.includes(comp)}
                                    onChange={(e) => {
                                        if (e.target.checked) setFormData({ ...formData, competencia: [...formData.competencia, comp] });
                                        else setFormData({ ...formData, competencia: formData.competencia.filter(c => c !== comp) });
                                    }}
                                />
                                <span className="text-sm font-bold leading-tight">{comp}</span>
                            </label>
                        ))}

                        {formData.area === 'Matemática' && [
                            "Resuelve problemas de Cantidad",
                            "Resuelve problemas de Regularidad, Equivalencia y Cambio",
                            "Resuelve problemas de Forma, Movimiento y Localización",
                            "Resuelve problemas de Gestión de Datos e Incertidumbre"
                        ].map(comp => (
                            <label key={comp} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.competencia.includes(comp) ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-blue-500 border-slate-300 rounded focus:ring-blue-500"
                                    checked={formData.competencia.includes(comp)}
                                    onChange={(e) => {
                                        if (e.target.checked) setFormData({ ...formData, competencia: [...formData.competencia, comp] });
                                        else setFormData({ ...formData, competencia: formData.competencia.filter(c => c !== comp) });
                                    }}
                                />
                                <span className="text-sm font-bold leading-tight">{comp}</span>
                            </label>
                        ))}

                        {formData.area === 'Integrada (STEAM)' && [
                            "Ciencia de Datos y Computación",
                            "Electrónica y Robótica Maker",
                            "Indaga mediante métodos científicos"
                        ].map(comp => (
                            <label key={comp} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.competencia.includes(comp) ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-purple-500 border-slate-300 rounded focus:ring-purple-500"
                                    checked={formData.competencia.includes(comp)}
                                    onChange={(e) => {
                                        if (e.target.checked) setFormData({ ...formData, competencia: [...formData.competencia, comp] });
                                        else setFormData({ ...formData, competencia: formData.competencia.filter(c => c !== comp) });
                                    }}
                                />
                                <span className="text-sm font-bold leading-tight">{comp}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2 pt-4">
                    <label className="text-sm font-bold text-black flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" /> Contexto Institucional / Situación Significativa
                    </label>
                    <textarea
                        required
                        placeholder="Ej: Tradiciones de Pativilca, Aniversario I.E. 20504, Robótica en el aula, Problemas de reciclaje..."
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-4 shadow-sm"
                        rows={3}
                        value={formData.contexto}
                        onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-500" /> Valor Transversal
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej. Identidad local, Innovación, Respeto..."
                            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5"
                            value={formData.valor}
                            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black flex items-center justify-between">
                            <span className="flex items-center gap-2"><Bot className="w-4 h-4 text-orange-500" /> Nivel de Creatividad de la IA</span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-black">{formData.temperature}</span>
                        </label>
                        <input
                            type="range"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500 mt-3"
                            value={formData.temperature}
                            onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                        />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-1">
                            <span>Técnico / Preciso</span>
                            <span>Creativo / Lúdico</span>
                        </div>
                    </div>
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

        const handlePrint = () => {
            if (!generatedReading) return;
            const originalTitle = document.title;
            document.title = `${generatedReading.titulo.replace(/[^a-zA-Z0-9]/g, '_')}_${generatedReading.grado}`;

            setTimeout(() => {
                window.print();
                document.title = originalTitle;
            }, 100);
        };

        const formatBoldText = (text: string | undefined | null) => {
            if (!text) return '';
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        };

        return (
            <div className="max-w-[1400px] mx-auto pb-20 print:bg-white print:pb-0">
                <div className="flex items-center justify-between mb-6 print:hidden">
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-black hover:text-orange-700 font-bold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" /> Generar Otra Lectura
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-100 px-4 py-2 rounded-xl font-bold transition-colors"
                    >
                        <Printer className="w-5 h-5" /> Imprimir en PDF
                    </button>
                </div>

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

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 print:block">
                                    {/* Left Column: Visuals & Meta */}
                                    <div className="lg:col-span-4 flex flex-col gap-6 print:hidden">
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
                                    </div>

                                    {/* Right Column: Content & CNEB */}
                                    <div className="lg:col-span-8 flex flex-col gap-10 print:block">
                                        {/* Reading Content */}
                                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-lg shadow-slate-900/5 print:border-none print:shadow-none print:p-0 print:break-inside-avoid">
                                            <h2 className="text-2xl font-black text-black mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
                                                Texto de Lectura
                                            </h2>
                                            {generatedReading.imagenesReferencia && generatedReading.imagenesReferencia.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 print:block text-center auto-cols-max">
                                                    {generatedReading.imagenesReferencia.map((imgUrl, idx) => (
                                                        <figure key={idx} className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-slate-200 print:mb-4 print:border-none print:shadow-none print:w-full max-w-[400px] print:mx-auto float-none !static">
                                                            <ImageWithFallback src={imgUrl} alt="Imagen de Referencia" fill className="object-cover !static !w-full !h-auto" fallbackIconSize={8} />
                                                            <figcaption className="absolute bottom-0 w-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold p-2 text-center print:hidden">Imagen de referencia extraída por IA</figcaption>
                                                        </figure>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="text-black text-lg leading-relaxed font-medium space-y-4">
                                                <div dangerouslySetInnerHTML={{ __html: generatedReading.contenido.replace(/\n\n/g, '<br/><br/>') }} />
                                            </div>
                                        </div>

                                        {/* Evaluation Area */}
                                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-lg shadow-slate-900/5 print:border-none print:shadow-none print:p-0 print:mt-10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6 print:pb-2">
                                                <h2 className="text-2xl lg:text-3xl font-extrabold text-black flex items-center gap-3">
                                                    Evaluación <span className="text-orange-600">CNEB</span>
                                                </h2>
                                                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 uppercase tracking-wide flex items-center gap-2 print:hidden">
                                                    <Bot className="w-4 h-4" /> Validado por IA
                                                </span>
                                            </div>

                                            {/* Tabs: Dinámicos por Área */}
                                            <div className="flex flex-wrap bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-8 gap-1.5 print:hidden">
                                                <button
                                                    onClick={() => setActiveTab('lectura')}
                                                    className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'lectura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                >
                                                    <BookOpen className="w-5 h-5" /> {formData.area === 'Comunicación' ? 'Lectura' : 'Comprensión'}
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('escritura')}
                                                    className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'escritura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                >
                                                    <PenTool className="w-5 h-5" /> {formData.area === 'Comunicación' ? 'Escritura' : 'Resolución'}
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('oralidad')}
                                                    className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'oralidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                >
                                                    <MessageCircle className="w-5 h-5" /> {formData.area === 'Comunicación' ? 'Oralidad' : 'Argumentación'}
                                                </button>
                                            </div>

                                            <div className="space-y-8">
                                                {activeTab === 'lectura' && generatedReading.actividades.find(a => a.type === 'escritura') && (
                                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden print:hidden">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-amber-400 to-amber-600 opacity-60"></div>
                                                        <h4 className="text-amber-800 font-extrabold flex items-center gap-2 mb-3 uppercase tracking-wide text-sm">
                                                            <span className="text-2xl">🎯</span> TU MISIÓN:
                                                        </h4>
                                                        <p className="text-amber-950 font-medium leading-relaxed sm:pl-[36px]" dangerouslySetInnerHTML={{ __html: formatBoldText(generatedReading.actividades.find(a => a.type === 'escritura')?.pregunta) }}>
                                                        </p>
                                                    </div>
                                                )}

                                                {generatedReading.actividades.map((activity, index) => (
                                                    <div key={activity.id} className={`bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex-col gap-6 relative overflow-hidden group hover:border-orange-300 transition-colors shadow-sm hover:shadow-md print:break-inside-avoid print:shadow-none print:border-slate-300 print:mt-8 print:!flex ${activity.type === activeTab ? 'flex' : 'hidden'}`}>

                                                        {/* Activity Type Badge */}
                                                        <div className="absolute top-0 right-0 bg-slate-100 px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 rounded-bl-2xl border-b border-l border-slate-200 print:bg-slate-50 print:border-slate-300 print:text-black">
                                                            Competencia: {activity.type}
                                                        </div>

                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 opacity-60 print:hidden"></div>

                                                        <div className="flex items-start gap-5 mt-4 sm:mt-0">
                                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-700 shadow-inner shrink-0 text-xl border border-orange-100 print:border-slate-300 print:bg-white print:text-black">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-grow pt-1">
                                                                {activity.type === 'escritura' ? (
                                                                    <div className="bg-gradient-to-r from-amber-100 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm mb-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-xl">🎯</span>
                                                                            <h4 className="font-extrabold text-amber-900 uppercase text-xs tracking-wider">Actividad de Misión</h4>
                                                                        </div>
                                                                        <p className="text-amber-950 font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta!) }}></p>
                                                                    </div>
                                                                ) : (
                                                                    <h4 className="text-lg font-bold text-black mb-3 leading-snug" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta!) }}>
                                                                    </h4>
                                                                )}

                                                                <div className="bg-orange-50/50 p-4 rounded-xl text-sm font-medium text-orange-900 border border-orange-100 mb-6 flex gap-3">
                                                                    <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                                                                    <p><strong>Respuesta de la IA:</strong> <span dangerouslySetInnerHTML={{ __html: formatBoldText(activity.respuestaEsperada!) }}></span></p>
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
                                                                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
                                                                        <table className="w-full text-sm text-left rubric-table">
                                                                            <thead className="bg-slate-50 text-black font-bold text-xs uppercase tracking-wider">
                                                                                <tr>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%]">En Inicio</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%]">En Proceso</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%]">Logrado</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%]">Destacado</th>
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

                                            {/* Complementary Materials (Moved to end) */}
                                            {(generatedReading.youtubeUrl || generatedReading.sugerenciaLibro) && (
                                                <div className="mt-12 pt-8 border-t border-slate-100 print:mt-10 print:break-inside-avoid">
                                                    <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
                                                        <BookText className="text-orange-600" /> Material Complementario
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {generatedReading.youtubeUrl && (
                                                            <a href={generatedReading.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group">
                                                                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                                                                    <Youtube className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-black group-hover:text-red-700">Explorar Video en YouTube</p>
                                                                    <p className="text-xs text-red-600 font-bold">Recurso Visual Recomendado</p>
                                                                </div>
                                                            </a>
                                                        )}
                                                        {generatedReading.sugerenciaLibro && (
                                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50 border border-orange-100">
                                                                <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
                                                                    <BookOpen className="w-6 h-6 text-white" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-black text-black">Obra Sugerida</p>
                                                                    <p className="text-xs text-orange-700 font-bold">{generatedReading.sugerenciaLibro}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/30 bg-fixed print:bg-white">
            <div className="print:hidden">
                <Header />
            </div>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-6 sm:py-12 relative z-10 print:py-0">
                {step === 1 ? renderDiagnosisForm() : renderResult()}
            </main>
        </div>
    );
}
