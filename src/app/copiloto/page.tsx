'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Bot, Sparkles, MapPin, Target, Loader2, BookOpen, PenTool, MessageCircle, AlertCircle, ArrowLeft, Printer, BookText, Youtube } from 'lucide-react';
import ImageWithFallback from '@/components/ImageWithFallback';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useAuth } from '@/lib/AuthContext';

type ActivityType = 'oralidad' | 'lectura' | 'escritura' | 'cantidad' | 'regularidad' | 'forma' | 'datos';


interface Activity {
    id: string;
    type: ActivityType;
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
    // Matemática-only narrative hook (optional for Comunicación/STEAM)
    misionAprendizaje?: string;
    contenido: string;
    // Instructions block shown between reading and activities
    consigna?: string;
    youtubeUrl: string;
    sugerenciaLibro: string;
    searchKeywords?: string;
    imagenesReferencia?: string[];
    actividades: Activity[];
}

export default function CopilotPage() {
    const { user } = useAuth();
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
    const [activeTab, setActiveTab] = useState<ActivityType>('lectura');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const isSecundariaVar = formData.nivelMaestro === 'Secundaria';
            const competenciasUnidas = formData.competencia.join(', ');
            let promptText = '';

            // ═══════════════════════════════════════
            // ÁREA: MATEMÁTICA — MOTOR EXCLUSIVO CNEB
            // ═══════════════════════════════════════
            if (formData.area === 'Matemática') {
                promptText = `Eres un especialista pedagógico de MATEMÁTICA del CNEB de Perú. Tu misión es crear material educativo articulado donde la LECTURA sirve de CONTEXTO para extraer datos numéricos, situaciones espaciales o estadísticas que el estudiante resuelve matemáticamente.

DATOS DEL DOCENTE:
- Área: MATEMÁTICA (CNEB Perú)
- Nivel: ${formData.nivelMaestro}
- Grado: ${formData.ciclo}
- Competencias a evaluar: ${competenciasUnidas}
- Situación Significativa: ${formData.contexto}
- Valor Transversal: ${formData.valor}

REGLAS INQUEBRANTABLES PARA EL ÁREA MATEMÁTICA:
1. El campo "contenido" debe ser una lectura/situación problemática que incluya datos numéricos explícitos (cantidades, medidas, fracciones, estadísticas, coordenadas, etc.) que sirvan de insumo para las actividades matemáticas.
2. Genera UNA actividad por cada competencia seleccionada. El "type" de cada actividad DEBE ser EXACTAMENTE uno de: "cantidad", "regularidad", "forma", "datos". NUNCA uses "lectura", "escritura" u "oralidad" como type.
3. - "cantidad" → competencia: Resuelve problemas de Cantidad
   - "regularidad" → competencia: Resuelve problemas de Regularidad, Equivalencia y Cambio
   - "forma" → competencia: Resuelve problemas de Forma, Movimiento y Localización
   - "datos" → competencia: Resuelve problemas de Gestión de Datos e Incertidumbre
4. Cada actividad debe plantear un RETO matemático concreto que el estudiante resuelve usando los datos del texto.
5. La rúbrica debe evaluar la RESOLUCIÓN MATEMÁTICA, NO la comprensión lectora.
6. PROHIBICIÓN TOTAL: En ningún campo uses las palabras Lectura, Escritura u Oralidad como categorías de actividad.
7. Motor Lúdico: Si es Primaria, contextualiza los problemas matemáticos en aventuras, superhéroes o escenarios fantásticos usando los datos del texto.
8. RESTRICCIÓN IDIOMA: Todo 100% en español.
9. portadaUrl: "https://image.pollinations.ai/prompt/[keywords+en+ingles+relacionados+a+matematica+y+el+contexto]?width=600&height=400&nologo=true"
10. youtubeUrl: "https://www.youtube.com/results?search_query=[palabras+clave+matematica+en+español]"

Estructura JSON OBLIGATORIA para Matemática (devuelve SOLO el JSON, sin bloques de código):
{
  "id": "copilot-gen-dyn",
  "titulo": "[Título atractivo que mencione el contexto matemático]",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '3')},
  "tipoTexto": "Situación Problemática Matemática",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "misionAprendizaje": "[Párrafo motivador (estilo aventura o superhéroe) que plantea el desafío donde la Matemática es la solución. Ej: ¡La ciudad de Neo-Andina se queda sin energía! Tu misión: calcular los flujos de las redes eléctricas para evitar el gran apagón. ¡La Matemática es tu único superpoder!]",
  "contenido": "[Narrativa/situación problemática con datos numéricos explícitos que alimentan TODAS las competencias seleccionadas. SIN tags HTML visibles.]",
  "consigna": "Lee con atención el texto e identifica los datos numéricos.\n1. Identifica y anota todos los datos, cantidades y medidas del texto.\n2. Modela la situación matemáticamente: dibuja, escribe expresiones o haz una tabla.\n3. Resuelve usando la estrategia de cada competencia (operar, graficar, medir o analizar datos).\n4. Verifica tu respuesta y redacta una conclusión.",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "[Título de libro relacionado]",
  "searchKeywords": "[2-3 keywords en inglés para imagen]",
  "actividades": [
    {
      "id": "act-mat-1",
      "type": "cantidad",
      "pregunta": "[Reto matemático usando datos explícitos del texto]",
      "respuestaEsperada": "[Solución matemática con procedimiento paso a paso]",
      "capacidad": "Traduce cantidades a expresiones numéricas y opera con ellas.",
      "estandar": "[Estándar CNEB alineado a Cantidad para el grado]",
      "estrategiasAplicacion": "[Estrategia lúdica matemática]",
      "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" }
    }
  ]
}
Genera exactamente las actividades correspondientes a las competencias seleccionadas: ${competenciasUnidas}`;

                // ═══════════════════════════════════════
                // ÁREA: COMUNICACIÓN
                // ═══════════════════════════════════════
            } else if (formData.area === 'Comunicación') {
                promptText = `Eres un asistente pedagógico de élite experto en el CNEB de Perú.
Genera contenido educativo con rigor curricular y creatividad excepcional. No uses formato markdown.

DATOS DEL DOCENTE PARA EL DIAGNÓSTICO:
- Área: Comunicación
- Nivel Maestro: ${formData.nivelMaestro}
- Grado objetivo: ${formData.ciclo}
- Competencias seleccionadas: ${competenciasUnidas}
- Contexto Institucional / Situación Significativa: ${formData.contexto}
- Desafío, Valor o Tema a priorizar: ${formData.valor}

INSTRUCCIONES DE CONTENIDO (ESTÁNDAR DE EXCELENCIA PEDAGÓGICA):
- DIVERSIDAD TEMÁTICA: Evita repetir temas. Rota entre IA, Biotecnología, Exploración Espacial, Energías Renovables, Realidad Virtual, Impresión 3D y Ciberseguridad.
- MOTOR LÚDICO (Primaria): Si el nivel es Primaria, integra referencias a la cultura pop (All Might, superhéroes, dibujos animados) y contextos de alta fantasía.
- ESCENARIOS VARIADOS: No te limites siempre a Pativilca. Contextualiza en el espacio exterior, el mundo microscópico, o ciudades futuristas.
- EL ESTUDIANTE COMO PROTAGONISTA: El texto debe dirigirse al estudiante como investigador, héroe, ingeniero o explorador.
- RESTRICCIÓN DE IDIOMA ESTRICTA: Todo el contenido, incluyendo sugerencias de libros y youtubeUrl, en 100% ESPAÑOL.
- REGLA DE ORO: JAMÁS omitas portadaUrl, youtubeUrl, ni las 3 actividades (type: lectura, escritura, oralidad) ni las rúbricas.
- portadaUrl: "https://image.pollinations.ai/prompt/[terminos+en+ingles]?width=600&height=400&nologo=true"
- youtubeUrl: "https://www.youtube.com/results?search_query=[palabras+clave+EN+ESPAÑOL]"
- searchKeywords: 2-3 palabras en inglés. Si es ficción usa keywords artísticas (ej: "heroic energy neon").

JSON base (devuelve SOLO el JSON):
{
  "id": "copilot-gen-dyn",
  "titulo": "string",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '5')},
  "tipoTexto": "string",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "[[Narrativa vibrante. Sin tags HTML visibles.]]",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "string",
  "searchKeywords": "string",
  "actividades": [
    { "id": "act-1", "type": "lectura", "pregunta": "[Consigna CNEB]", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } },
    { "id": "act-2", "type": "escritura", "pregunta": "string", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } },
    { "id": "act-3", "type": "oralidad", "pregunta": "string", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } }
  ]
}`;

                // ═══════════════════════════════════════
                // ÁREA: INTEGRADA (STEAM)
                // ═══════════════════════════════════════
            } else {
                // Array completo de habilidades — se inyecta COMPLETO, nunca condensado.
                const listaHabilidades = formData.competencia
                    .map((c: string, i: number) => `${i + 1}. ${c}`)
                    .join('\n');

                const isUpperSec = isSecundariaVar && (parseInt(formData.ciclo.match(/\d+/)?.[0] || '0') >= 4);

                const toneNote = isUpperSec
                    ? 'Tono académico y analítico. Nivel 4°/5° de Secundaria.'
                    : isSecundariaVar
                        ? 'Tono motivador y práctico. Nivel Secundaria 1°-3°.'
                        : 'Tono lúdico, cercano y maker. Lenguaje sencillo para Primaria. El documento DEBE caber en máximo 2 páginas impresas.';

                const fichaEstudiante = isUpperSec
                    ? `# 1. LECTURA MULTIMODAL Y TÉCNICA
- **Contexto Narrativo:** Relato corto.
- **Texto Discontinuo (Técnico):** El LLM DEBE describir un gráfico técnico o esquema. (Ej: "Gráfico de Frecuencias Sonoras: Cajón peruano (bajas frecuencias 50-150Hz) vs. Batería electrónica"). Esto moviliza la C2.
- **Tabla de Datos Cuantitativos (OBLIGATORIO):** El LLM DEBE crear una tabla Markdown real con variables cruzadas. *(Ejemplo obligatorio a replicar en el prompt de la IA: | Género Musical | % Preferencia (12-18 años) | % Preferencia (60+ años) | Variable de Diseño para el Robot |)*.

# 2. BITÁCORA DE INDAGACIÓN Y EMPATÍA
- **Perfil de Usuario (Persona):** El LLM DEBE definir un caso concreto. *(Ej: "Tu usuario es un estudiante rural de 14 años que no conoce la música tradicional. ¿Cómo los datos de la tabla se transforman en una señal (luz/sonido) para conectar con él?")*.
- **Análisis Matemático:** Obligar al estudiante a calcular una razón o proporción usando los datos de la tabla (Moviliza C30).

# 3. RETO STEAM (DISEÑO Y SIMULACIÓN)
- Exigir el uso explícito de herramientas de simulación (ej. **Tinkercad**) para el prototipo digital.`
                    : `# FICHA PARA EL ESTUDIANTE

**Historia / Relato:**
[Una historia corta, inmersiva y contextualizada en la localidad o entorno del estudiante (máx. 3 párrafos). Dirígete al estudiante como protagonista activo. ESTÁ COMPLETAMENTE PROHIBIDO usar los términos: "Situación Significativa", "Competencia", "Capacidad", "Indicador", "Estándar" o cualquier jerga pedagógica. Debe leerse como un cuento o relato real, jamás como un documento educativo.]

**Tu Reto STEAM:**
[Desafío práctico maker/tecnológico en 2-3 oraciones claras. Dirigido directamente al estudiante ("Tú vas a...", "Tu misión es..."). Concreto y accionable. PROHIBIDO usar jerga pedagógica.]`;

                const guiaDocente = `# 4. GUÍA PARA EL DOCENTE Y EVALUACIÓN

**Movilización de Competencias (EXPLICITACIÓN CNEB):**
El LLM DEBE listar obligatoriamente:
- Matemática: (C30) Resuelve problemas de gestión de datos e incertidumbre.
- Comunicación: (C2) Lee diversos tipos de textos (al interpretar la tabla/gráfico) y (C3) Escribe diversos tipos de textos (en el informe de ingeniería).
- Ciencia/Tecnología: (C20) Indaga y (C28) Se desenvuelve en entornos virtuales.
También incluye de forma natural las habilidades específicas seleccionadas:
${listaHabilidades}

**Estrategia Docente:**
[3 orientaciones brevísimas de facilitación — Inicio (1 oración) / Desarrollo (1 oración) / Cierre (1 oración).]

**Rúbrica de Evaluación (OBLIGATORIO NIVEL DESTACADO):**
[Genera UNA ÚNICA tabla Markdown con el formato exacto de abajo. UN SOLO criterio global: el producto del reto. El nivel "Destacado" DEBE exigir explícitamente que "el estudiante propone una solución tecnológica que resuelve un dilema ético identificado en la lectura y fundamenta su impacto social". PROHIBIDO: múltiples tablas o desglose por habilidad.]
| Criterio | En Inicio | En Proceso | Logrado | Destacado |
|---|---|---|---|---|
| [Nombre del producto en ≤5 palabras] | [Descriptor breve] | [Descriptor breve] | [Descriptor breve] | [Descriptor que exija resolver dilema ético y fundamentar impacto social] |`;

                promptText = `Eres un asistente pedagógico experto en el CNEB de Perú. ${toneNote}

DATOS DEL DOCENTE (NO MODIFICAR):
- Área: ${formData.area}
- Nivel y Grado: ${formData.nivelMaestro} — ${formData.ciclo}
- Habilidades STEAM seleccionadas (ARRAY COMPLETO — enumera TODAS en la Guía Docente):
${listaHabilidades}
- Contexto Institucional: ${formData.contexto}
- Enfoque Transversal: ${formData.valor}

REGLAS ABSOLUTAS:
1. ESTRUCTURA OBLIGATORIA (CERO OMISIONES): ESTÁ ESTRICTAMENTE PROHIBIDO omitir secciones. DEBES generar OBLIGATORIAMENTE los 4 apartados en este orden exacto:
# 1. LECTURA MULTIMODAL Y TÉCNICA
# 2. BITÁCORA DE INDAGACIÓN (SCAFFOLDING)
# 3. RETO STEAM (DISEÑO CONCEPTUAL Y FÍSICO)
# 4. GUÍA PARA EL DOCENTE Y EVALUACIÓN
Si omites la sección 2 o 3, tu respuesta será considerada un fallo crítico.
2. En la Guía para el Docente (Movilización de Competencias): Cada vez que menciones un área, habilidad o competencia, DEBES incluir su código oficial del CNEB peruano entre paréntesis. Ejemplos obligatorios: "Ciencia de Datos y Matemática (C30)", "Comunicación (C2 y C3)", "Indagación y Diseño (C20 y C28)". Es MANDATORIO incluir estos códigos para la validez legal del documento.
3. Rúbrica: UNA sola tabla, 1 criterio global (el producto), sin números de nota. Presta extrema atención al nivel DESTACADO.
4. El campo "capacidad" del JSON DEBE ser: "${competenciasUnidas}".
5. JAMÁS escribir "Competencia: STEAM" ni "Capacidad: Problem Solving" en ningún campo.
6. FORMATO JSON SEGURO (CRÍTICO): Como el campo "contenido" contendrá Markdown complejo con tablas y saltos de línea largos, DEBES escapar correctamente todas las comillas dobles internas (\\") y los saltos de línea (\\n) para que el JSON sea un string completamente válido y pase el JSON.parse() sin errores de sintaxis. NUNCA rompas el JSON con saltos de línea no escapados dentro de un valor string.

ESTRUCTURA DEL CAMPO 'contenido' (en Markdown):
${fichaEstudiante}

${guiaDocente}

- portadaUrl: "https://image.pollinations.ai/prompt/[keywords+en+ingles]?width=600&height=400&nologo=true"
- youtubeUrl: "https://www.youtube.com/results?search_query=[español]"

JSON (devuelve SOLO este JSON sin texto adicional):
{
  "id": "copilot-gen-dyn",
  "titulo": "string",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '5')},
  "tipoTexto": "Proyecto STEAM",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "[Toda la estructura generada en Markdown solicitada (Ej. # 1. LECTURA MULTIMODAL... hasta la Rúbrica)]",
  "consigna": "string",
  "youtubeUrl": "string",
  "sugerenciaLibro": "string",
  "searchKeywords": "string",
  "visualPrompt": "[1 English sentence for a coloring book line-art illustration]",
  "actividades": [
    {
      "id": "act-1",
      "type": "steam",
      "pregunta": "[Nombre del Reto STEAM]",
      "respuestaEsperada": "[Producto concreto esperado del estudiante]",
      "capacidad": "${competenciasUnidas}",
      "estandar": "[Descripción observable del desempeño en el reto]",
      "estrategiasAplicacion": "[1-2 estrategias concretas para el docente]",
      "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" }
    }
  ]
}`;
            }

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
                    autor: user?.displayName || user?.email || "Docente no identificado",
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
                            onChange={(e) => {
                                setFormData({ ...formData, area: e.target.value, competencia: [] });
                                setActiveTab(e.target.value === 'Matem\u00e1tica' ? 'cantidad' : 'lectura');
                            }}
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

        const handlePrint = () => {
            if (!generatedReading) return;
            const originalTitle = document.title;
            const areaSuffix = formData.area === 'Matemática' ? '_Matematica' : '';
            document.title = `${generatedReading.titulo.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_')}_${generatedReading.grado}${areaSuffix}`;

            setTimeout(() => {
                window.print();
                document.title = originalTitle;
            }, 100);
        };

        // Helper: strip literal HTML tags from plain text fields (PDF safety)
        const stripTags = (text: string | undefined | null) => {
            if (!text) return '';
            return text.replace(/<[^>]*>/g, '');
        };
        void stripTags; // used via formatBoldText pre-processing

        const formatBoldText = (text: string | undefined | null) => {
            if (!text) return '';
            // First strip any literal HTML that the AI may have included in non-HTML fields
            const clean = text.replace(/<strong>/g, '').replace(/<\/strong>/g, '').replace(/<em>/g, '').replace(/<\/em>/g, '');
            return clean.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
        };

        // Label & color mappings for math competency types
        const MATH_TAB_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
            cantidad: { label: 'Cantidad', icon: '🔢', color: 'blue' },
            regularidad: { label: 'Regularidad', icon: '📐', color: 'purple' },
            forma: { label: 'Forma y Localiz.', icon: '📍', color: 'green' },
            datos: { label: 'Datos e Incertidumbre', icon: '📊', color: 'orange' },
        };
        const MATH_FULL_NAMES: Record<string, string> = {
            cantidad: 'Resuelve problemas de Cantidad',
            regularidad: 'Resuelve problemas de Regularidad, Equivalencia y Cambio',
            forma: 'Resuelve problemas de Forma, Movimiento y Localización',
            datos: 'Resuelve problemas de Gestión de Datos e Incertidumbre',
        };
        const isMath = formData.area === 'Matemática';
        // Set of activity types present in this reading
        const presentMathTabs = isMath
            ? generatedReading.actividades.map(a => a.type).filter((t, i, arr) => arr.indexOf(t) === i)
            : [];

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

                                        {/* ══ MISIÓN DE APRENDIZAJE (Matemática only) ══ */}
                                        {isMath && generatedReading.misionAprendizaje && (
                                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-7 shadow-xl shadow-blue-900/20 print:rounded-none print:shadow-none print:bg-white print:border-2 print:border-blue-700 print:p-5 print:break-inside-avoid">
                                                {/* decorative circles */}
                                                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 print:hidden" />
                                                <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5 print:hidden" />
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="text-3xl" role="img" aria-label="misión">🚀</span>
                                                    <h2 className="text-lg font-black text-white uppercase tracking-[0.12em] print:text-blue-900">
                                                        Misión de Aprendizaje
                                                    </h2>
                                                </div>
                                                <p className="text-white/95 font-semibold text-base leading-relaxed print:text-black">
                                                    {generatedReading.misionAprendizaje}
                                                </p>
                                            </div>
                                        )}

                                        {/* Reading Content */}
                                        <div id="documento-pdf" className="p-8 bg-white text-black rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-900/5 print:border-none print:shadow-none print:p-0 print:break-inside-avoid mt-6">
                                          {/* Cabecera con Imagen y QR */}
                                          <div className="flex justify-between items-center border-b-2 border-blue-800 pb-4 mb-6">
                                            <div className="w-1/3">
                                               {/* Renderizado REAL de la imagen */}
                                               <img 
                                                 src={generatedReading.imagenesReferencia?.[0] || generatedReading.portadaUrl || "https://via.placeholder.com/150?text=Imagen+STEAM"} 
                                                 alt="Referencia" 
                                                 className="max-w-[130px] max-h-[130px] object-contain rounded" 
                                                 crossOrigin="anonymous" 
                                               />
                                            </div>
                                            <div className="w-1/3 text-center">
                                               <h2 className="text-xl font-bold text-gray-800 uppercase">I.E. 20504 - San Jerónimo</h2>
                                               <p className="text-xs text-gray-500">Proyecto STEAM Integrado</p>
                                               <p className="text-xs font-semibold text-gray-700 mt-1">Docente: {user?.displayName || user?.email || 'Sistema'}</p>
                                            </div>
                                            <div className="w-1/3 flex justify-end">
                                               {/* Renderizado REAL del QR */}
                                               <div className="p-1 bg-white border rounded shadow-sm">
                                                 <QRCode value={"https://ie20504.edu.pe"} size={100} />
                                               </div>
                                            </div>
                                          </div>
                                          
                                          {/* Resto del contenido Markdown */}
                                          <div className="prose prose-sm max-w-none w-full overflow-hidden">
                                            <ReactMarkdown 
                                              remarkPlugins={[remarkGfm]}
                                              rehypePlugins={[rehypeRaw]} // Para procesar IDs de navegación
                                              children={generatedReading.contenido ? generatedReading.contenido.replace(/(\*\*:?|:)\s*\|/g, '$1\n\n|') : ''}
                                              components={{
                                                // Enlaces de Navegación Interna para IDs como #ficha-del-estudiante
                                                a: ({node, href, children, ...props}) => {
                                                  if (href && href.startsWith('#')) {
                                                    return (
                                                      <a 
                                                        href={href} 
                                                        className="text-blue-700 font-semibold hover:text-blue-900 border-b border-blue-200 pb-0.5" 
                                                        onClick={(e) => {
                                                          e.preventDefault();
                                                          document.getElementById(href.substring(1))?.scrollIntoView({ behavior: 'smooth' });
                                                        }} 
                                                        {...props}
                                                      >
                                                        {children}
                                                      </a>
                                                    );
                                                  }
                                                  return <a href={href} className="text-blue-600 hover:text-blue-800 underline" {...props}>{children}</a>;
                                                },
                                                table: ({node, ...props}) => <div className="overflow-x-auto w-full max-w-full"><table className="min-w-full border-collapse border border-blue-300 my-6 text-sm bg-white" {...props} /></div>,
                                                thead: ({node, ...props}) => <thead className="bg-blue-600 text-white font-bold" {...props} />,
                                                th: ({node, ...props}) => <th className="border border-blue-300 px-5 py-3 text-left" {...props} />,
                                                td: ({node, ...props}) => <td className="border border-blue-200 px-5 py-3 text-gray-800" {...props} />,
                                                h1: ({node, ...props}) => <h1 id={props.id || "titulo-generado"} className="text-3xl font-extrabold text-blue-900 mt-8 mb-6 uppercase tracking-tight" {...props} />,
                                                h2: ({node, ...props}) => <h2 id={props.id} className="text-2xl font-bold text-blue-800 mt-7 mb-5" {...props} />,
                                                h3: ({node, ...props}) => <h3 id={props.id} className="text-xl font-semibold text-blue-700 mt-6 mb-4" {...props} />,
                                                p: ({node, ...props}) => <p className="mb-5 text-gray-800 leading-relaxed" {...props} />,
                                                strong: ({node, ...props}) => <strong className="font-bold text-gray-950" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-5 text-gray-800 space-y-2" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-5 text-gray-800 space-y-2" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                              }}
                                            />
                                          </div>
                                        </div>

                                        {/* ══ CONSIGNA DE TRABAJO (Matemática only) ══ */}
                                        {isMath && generatedReading.consigna && (
                                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-6 shadow-sm print:rounded-none print:shadow-none print:break-inside-avoid print:border-l-4 print:border-amber-600">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-2xl">📋</span>
                                                    <h3 className="text-lg font-black text-amber-900 uppercase tracking-wider">
                                                        Consigna de Trabajo
                                                    </h3>
                                                </div>
                                                <div className="space-y-2">
                                                    {generatedReading.consigna.split('\n').map((line, i) => (
                                                        <p key={i} className={`text-amber-950 leading-relaxed ${line.match(/^\d+\./) ? 'font-bold pl-2' : 'font-semibold text-sm'
                                                            }`}>
                                                            {line}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Evaluation Area */}
                                        <div className="bg-white rounded-3xl border border-slate-200/60 p-6 sm:p-10 shadow-lg shadow-slate-900/5 print:border-none print:shadow-none print:p-0 print:mt-10">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-6 print:pb-2">
                                                <h2 className="text-2xl lg:text-3xl font-extrabold text-black flex items-center gap-3">
                                                    {isMath ? 'Resolución de Problemas' : 'Evaluación'} <span className="text-orange-600">CNEB</span>
                                                </h2>
                                                <span className="text-xs font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 uppercase tracking-wide flex items-center gap-2 print:hidden">
                                                    <Bot className="w-4 h-4" /> Validado por IA
                                                </span>
                                            </div>

                                            {/* Tabs: Dinámicos por Área */}
                                            <div className="flex flex-wrap bg-slate-50 rounded-xl border border-slate-200 p-1.5 mb-8 gap-1.5 print:hidden">
                                                {isMath ? (
                                                    // Tabs for Matemática — show only tabs that exist in the generated reading
                                                    presentMathTabs.map(tabType => {
                                                        const cfg = MATH_TAB_CONFIG[tabType] || { label: tabType, icon: '✅', color: 'slate' };
                                                        return (
                                                            <button
                                                                key={tabType}
                                                                onClick={() => setActiveTab(tabType as ActivityType)}
                                                                className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === tabType ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'
                                                                    }`}
                                                            >
                                                                <span>{cfg.icon}</span> {cfg.label}
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    // Tabs for Comunicación / STEAM
                                                    <>
                                                        <button
                                                            onClick={() => setActiveTab('lectura')}
                                                            className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'lectura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                        >
                                                            <BookOpen className="w-5 h-5" /> {formData.area === 'Integrada (STEAM)' ? 'Ficha Estudiante' : 'Lectura'}
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveTab('escritura')}
                                                            className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'escritura' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                        >
                                                            <PenTool className="w-5 h-5" /> {formData.area === 'Comunicación' ? 'Escritura' : formData.area === 'Integrada (STEAM)' ? 'Reto STEAM' : 'Resolución'}
                                                        </button>
                                                        <button
                                                            onClick={() => setActiveTab('oralidad')}
                                                            className={`flex-1 min-w-[120px] flex justify-center items-center gap-2 py-3 px-4 rounded-lg font-black text-sm transition-all ${activeTab === 'oralidad' ? 'bg-black text-white shadow-md scale-[1.02]' : 'text-black bg-slate-200 hover:bg-slate-300'}`}
                                                        >
                                                            <MessageCircle className="w-5 h-5" /> {formData.area === 'Comunicación' ? 'Oralidad' : formData.area === 'Integrada (STEAM)' ? 'Guía Docente' : 'Argumentación'}
                                                        </button>
                                                    </>
                                                )}
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
                                                    // In print mode: show ALL activities. On screen: only active tab.
                                                    <div key={activity.id} className={`bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex-col gap-6 relative overflow-hidden group hover:border-orange-300 transition-colors shadow-sm hover:shadow-md print:break-inside-avoid print:shadow-none print:border-slate-300 print:mt-8 print:!flex ${activity.type === activeTab ? 'flex' : 'hidden'}`}>

                                                        {/* Activity Type Badge — shows full CNEB competency name for Math */}
                                                        <div className="absolute top-0 right-0 bg-slate-100 px-4 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 rounded-bl-2xl border-b border-l border-slate-200 print:bg-slate-50 print:border-slate-300 print:text-black">
                                                            {isMath
                                                                ? (MATH_FULL_NAMES[activity.type] || activity.type)
                                                                : formData.area === 'Integrada (STEAM)'
                                                                    ? 'Habilidades STEAM'
                                                                    : `Competencia: ${activity.type}`
                                                            }
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
                                                                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                                                                            {formData.area === 'Integrada (STEAM)' ? 'Habilidades STEAM' : 'Capacidad CNEB'}
                                                                        </h5>
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
                            <td className="pt-6 pb-4 border-t border-slate-200">
                                <div className="grid grid-cols-2 gap-4 text-left mb-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Área Curricular</p>
                                        <p className="text-xs font-bold text-black uppercase">{formData.area}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                            {formData.area === 'Integrada (STEAM)' ? 'Habilidades STEAM' : 'Competencias CNEB'}
                                        </p>
                                        <p className="text-xs font-bold text-black lowercase leading-tight">{formData.competencia.join(', ')}</p>
                                    </div>
                                </div>
                                <div className="text-center pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        Desarrollado por el Prof. de Innovación Pedagógica Lic. Jesús Luna Polanco - I.E. 20504
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <div className="mt-12 pt-8 border-t border-slate-200 text-center print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6 text-left">
                        <div className="bg-slate-100 p-4 rounded-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Área Curricular
                            </p>
                            <p className="text-sm font-bold text-black uppercase">{formData.area}</p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-orange-500" /> {formData.area === 'Integrada (STEAM)' ? 'Habilidades STEAM' : 'Competencias Seleccionadas'}
                            </p>
                            <p className="text-sm font-bold text-black">{formData.competencia.join(', ')}</p>
                        </div>
                    </div>
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
