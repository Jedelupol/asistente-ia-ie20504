'use client';

import React, { useState, useCallback } from 'react';
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
    contenido: string;
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
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [formData, setFormData] = useState({
        nivelMaestro: 'Primaria',
        area: 'Comunicación',
        ciclo: '',
        competencia: [] as string[],
        contexto: '',
        valor: '',
        temperature: 0.7
    });

    const closeModal = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) setShowHelpModal(false);
    }, []);

    const [generatedReading, setGeneratedReading] = useState<GeneratedReading | null>(null);
    const [activeTab, setActiveTab] = useState<ActivityType>('lectura');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const isSecundariaVar = formData.nivelMaestro === 'Secundaria';
            const competenciasUnidas = formData.competencia.join(', ');

            // Lógica de extensión dinámica por ciclo (CNEB)
            const gradoNum = parseInt(formData.ciclo.match(/\d/)?.[0] || '0');
            let lengthAndToneInstruction = "";
            let lengthPlaceholder = "";

            if (!isSecundariaVar) {
                // Primaria
                lengthAndToneInstruction = "- EXTENSIÓN Y TONO (PRIMARIA): Escribe exactamente 2 a 3 párrafos cortos. Usa un lenguaje sencillo, lúdico o imaginativo (cuentos, fantasía, exploración, cultura pop).";
                lengthPlaceholder = "[OBLIGATORIO: Desarrolla exactamente de 2 a 3 párrafos cortos]";
            } else {
                if (gradoNum === 1 || gradoNum === 2) {
                    // Secundaria - Ciclo VI (1ro y 2do)
                    lengthAndToneInstruction = "- EXTENSIÓN Y TONO (SECUNDARIA - CICLO VI): Escribe EXACTAMENTE 3 párrafos. Usa un lenguaje intermedio, claro y directo. Aborda problemáticas muy cercanas a su entorno local/escolar. ESTÁ ESTRICTAMENTE PROHIBIDO usar fantasía infantil.";
                    lengthPlaceholder = "[OBLIGATORIO: Desarrolla exactamente 3 párrafos]";
                } else if (gradoNum === 3) {
                    // Secundaria - 3er Grado
                    lengthAndToneInstruction = "- EXTENSIÓN Y TONO (SECUNDARIA - 3ER GRADO): Escribe EXACTAMENTE 3 a 4 párrafos. Usa un lenguaje intermedio, yendo directo al grano sin introducciones largas. Aborda problemáticas escolares o locales. ESTÁ ESTRICTAMENTE PROHIBIDO usar fantasía infantil.";
                    lengthPlaceholder = "[OBLIGATORIO: Desarrolla exactamente de 3 a 4 párrafos directos]";
                } else {
                    // Secundaria - 4to y 5to Grado
                    lengthAndToneInstruction = "- EXTENSIÓN Y TONO (SECUNDARIA - 4TO Y 5TO GRADO): Escribe EXACTAMENTE 4 a 5 párrafos. Usa un lenguaje avanzado, analítico y profundo. Aborda problemáticas de impacto nacional o global (tecnología, ecología, problemas sociales). ESTÁ ESTRICTAMENTE PROHIBIDO usar fantasía infantil o de niños.";
                    lengthPlaceholder = "[OBLIGATORIO: Desarrolla exactamente de 4 a 5 párrafos analíticos]";
                }
            }

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
1. PROHIBIDO ALUCINAR O IGNORAR DATOS: Si el docente proporciona datos específicos (cantidades, situaciones) en la Situación Significativa, DEBES usarlos OBLIGATORIAMENTE para formular los problemas. ESTÁ ESTRICTAMENTE PROHIBIDO inventar valores, precios, estadísticas o censos poblacionales que el docente no haya mencionado explícitamente. Limítate a expandir matemáticamente el escenario brindado.
2. ESTRUCTURA DEL RETO (NO REVELAR RESPUESTAS AL ALUMNO): El campo "pregunta" DEBE ser una instrucción clara o pregunta dirigida al estudiante (Ej. "Reto de Cantidad: Utiliza los datos de la lectura para calcular..."). Plantéalo como un problema a resolver, NO des la respuesta junto con el reto.
3. El campo "contenido" debe ser la lectura base que consolide fluidamente estos datos numéricos para las actividades.
4. Genera UNA actividad por cada competencia seleccionada. El "type" de cada actividad DEBE ser EXACTAMENTE uno de: "cantidad", "regularidad", "forma", "datos". NUNCA uses "lectura", "escritura" u "oralidad" como type.
5. - "cantidad" → competencia: Resuelve problemas de Cantidad
   - "regularidad" → competencia: Resuelve problemas de Regularidad, Equivalencia y Cambio
   - "forma" → competencia: Resuelve problemas de Forma, Movimiento y Localización
   - "datos" → competencia: Resuelve problemas de Gestión de Datos e Incertidumbre
6. NOMBRES DE ACTIVIDADES: Los encabezados o títulos de las preguntas de cada actividad DEBEN llamarse ÚNICAMENTE: "Reto 1", "Reto 2" o "Reto de [Tema]". ESTÁ ESTRICTAMENTE PROHIBIDO usar las palabras "Misión" o "Actividad de Misión".
7. La rúbrica debe evaluar la RESOLUCIÓN MATEMÁTICA, NO la comprensión lectora.
8. SINERGIA DE DATOS OBLIGATORIA: Si se seleccionan múltiples competencias matemáticas, TODAS deben basarse en los mismos datos y contexto de la lectura principal.
   - Si es "cantidad": Cálculos aritméticos o proporciones con los datos de la lectura.
   - Si es "regularidad": Ecuaciones, funciones o patrones con el mismo contexto de la lectura.
   - Si es "forma": Contexto espacial (áreas, planos, distancias) mencionado en la lectura.
   - Si es "datos": Estadísticas, probabilidades o gráficos estrictamente de la lectura narrada.
9. TONO Y EXTENSIÓN ESTRICTA POR NIVEL:
${lengthAndToneInstruction}
   - OBLIGATORIO: Está prohibido pedirle al estudiante "leer un texto adicional proporcionado por el docente". Todo debe estar incluido en la lectura autogenerada.
10. FORMATO HTML: El LLM SOLO DEBE devolver el JSON. Dentro de los campos de texto, usa texto plano, SIN ETIQUETAS HTML y SIN cabeceras Markdown (# o ## o ###).
11. RESTRICCIÓN IDIOMA: Todo 100% en español.
12. CONSIGNA GENERAL: La consigna debe tener MÁXIMO 3 líneas e invitar al estudiante a resolver los retos.
13. portadaUrl: "https://image.pollinations.ai/prompt/[keywords+en+ingles]?width=600&height=400&nologo=true"
14. youtubeUrl: "https://www.youtube.com/results?search_query=[palabras+clave+matematica+en+español]"

Estructura JSON OBLIGATORIA (devuelve SOLO el JSON):
{
  "id": "copilot-gen-dyn",
  "titulo": "[Título atractivo que mencione el contexto matemático]",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '3')},
  "tipoTexto": "Situación Problemática Matemática",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "[Texto narrativo/problemático. ${lengthPlaceholder}. NO USES NINGÚN TIPO DE CABECERA MARKDOWN COMO # O ##]",
  "consigna": "[Consigna general introductoria rápida, máximo 3 líneas]",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "[Título de libro]",
  "searchKeywords": "[2-3 keywords en inglés]",
  "actividades": [
    {
      "id": "act-mat-1",
      "type": "cantidad",
      "pregunta": "[Reto 1, Reto 2, o Reto de [Tema]. JAMÁS uses la palabra Misión.]",
      "respuestaEsperada": "[Solución matemática paso a paso]",
      "capacidad": "string",
      "estandar": "string",
      "estrategiasAplicacion": "string",
      "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" }
    }
  ]
}
Genera exactamente las actividades correspondientes a las competencias seleccionadas: ${competenciasUnidas}`;

                // ═══════════════════════════════════════
                // ÁREA: COMUNICACIÓN
                // ═══════════════════════════════════════
            } else if (formData.area === 'Comunicación') {

                const synergyInstruction = formData.competencia.length === 3
                    ? "- SINERGIA DE COMPETENCIAS LÓGICA: (1) Reto de Lectura: El estudiante lee el texto principal para extraer datos lúdica o analíticamente. (2) Reto de Escritura: El estudiante redacta un ensayo, informe o propuesta basándose ESTRICTAMENTE en la información de la lectura. (3) Reto de Oralidad: El estudiante prepara una exposición o debate para defender lo escrito en el reto anterior."
                    : "- GENERACIÓN DE ACTIVIDADES: Genera EXACTAMENTE una actividad por cada competencia seleccionada.";

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
- EL TEXTO PRINCIPAL ES LA LECTURA: No describas textos "meta-comunicativos" (como "El día de hoy aprenderemos la importancia de leer"). Genera la lectura misma en base al tema propuesto.
- NO MATERIAL ADICIONAL: Prohibido decirle al estudiante "Lee el texto que tu docente te dio". Toda la información debe ser autogenerada aquí mismo.
- NOMBRES EN COMPETENCIAS: Los encabezados de las preguntas DEBEN llamarse ÚNICAMENTE "Reto de Lectura", "Reto de Escritura" o "Reto de Oralidad". ESTÁ ESTRICTAMENTE PROHIBIDO usar la palabra "Misión".
${lengthAndToneInstruction}
${synergyInstruction}
- EL ESTUDIANTE COMO PROTAGONISTA: El texto se dirige al estudiante (ej. vocero, investigador, héroe).
- FORMATO HTML ESTRICTO: El texto en 'contenido', 'pregunta' y otros NO debe traer etiquetas HTML como <h1>, <h2> o ### de Markdown. Usa solo texto plano.
- CONSIGNA GENERAL: En 'consigna' formula un párrafo corto (máximo 3 líneas) orientando al reto final.
- portadaUrl: "https://image.pollinations.ai/prompt/[terminos+en+ingles]?width=600&height=400&nologo=true"
- youtubeUrl: "https://www.youtube.com/results?search_query=[palabras+clave+EN+ESPAÑOL]"
- searchKeywords: 2-3 palabras clave (en inglés) visualmente atractivas.

JSON base (devuelve SOLO el JSON validado):
{
  "id": "copilot-gen-dyn",
  "titulo": "string",
  "grado": ${parseInt(formData.ciclo.match(/\d/)?.[0] || '5')},
  "tipoTexto": "string",
  "portadaUrl": "https://image.pollinations.ai/prompt/...",
  "contenido": "[Desarrollo narrativo base. ${lengthPlaceholder}. SOLO TEXTO PLANO sin Markdowns.]",
  "consigna": "[Instrucciones generales introductorias cortas, máximo 3 líneas.]",
  "youtubeUrl": "https://www.youtube.com/results?search_query=...",
  "sugerenciaLibro": "string",
  "searchKeywords": "string",
  "actividades": [
    // Genera SOLAMENTE un objeto por cada competencia solicitada en '${competenciasUnidas}'.
    { "id": "act-1", "type": "lectura", "pregunta": "[Reto de Lectura, Reto de Escritura, etc. Nunca uses la palabra Misión.]", "respuestaEsperada": "string", "capacidad": "string", "estandar": "string", "estrategiasAplicacion": "string", "rubricaEvaluacion": { "destacado": "string", "logrado": "string", "proceso": "string", "inicio": "string" } }
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

                const steamInfo = isSecundariaVar
                    ? " Integra fuertemente conceptos avanzados de Electrónica, Arduino o Ciencia de Datos (STEAM)."
                    : " Usa un enfoque maker, robots simples y exploración.";

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

                promptText = `Eres un asistente pedagógico experto en el CNEB de Perú. ${toneNote} Genera contenido educativo con rigor curricular y creatividad excepcional. ${steamInfo}

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
                    creatorId: user?.uid || null,
                    creatorName: user?.displayName || user?.email?.split('@')[0] || 'Docente Copiloto',
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
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            title="¿Qué es Situación Significativa, Contexto y Consigna?"
                            className="ml-1 w-9 h-9 rounded-full bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-700 font-black text-base flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                        >
                            ❓
                        </button>
                    </h1>
                    <p className="text-black font-medium text-xl opacity-80">El Copiloto está listo para diseñar su próxima lectura.</p>

                    {/* ══ MODAL DE AYUDA PEDAGÓGICA ══ */}
                    {showHelpModal && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                            onClick={closeModal}
                        >
                            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 text-left relative">
                                <button
                                    type="button"
                                    onClick={() => setShowHelpModal(false)}
                                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black flex items-center justify-center transition-colors"
                                >
                                    ✕
                                </button>

                                <h3 className="text-xl font-black text-black mb-3">❓ ¿Es lo mismo Situación Significativa, Situación de Contexto o Consigna?</h3>
                                <p className="text-slate-700 font-medium mb-5"><strong>No.</strong> Para que la IA genere el mejor material, es vital entender la diferencia:</p>

                                <div className="space-y-5">
                                    <div>
                                        <h4 className="text-base font-black text-black mb-1">1️⃣ Situación Significativa</h4>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-2">Es una situación de la vida real o cercana al estudiante que sirve para iniciar el aprendizaje. Busca despertar interés y generar un problema o reto que motive a aprender.</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600"><li><em>📝 Ejemplo:</em> En la comunidad hay acumulación de basura y malos olores cerca del colegio. → A partir de esto los estudiantes investigan, opinan y proponen soluciones.</li></ul>
                                    </div>

                                    <div>
                                        <h4 className="text-base font-black text-black mb-1">2️⃣ Situación de Contexto</h4>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-2">Es la descripción del <strong>entorno o realidad</strong> donde ocurre el aprendizaje: comunidad, cultura, problemas locales, costumbres, etc. <em>(Esto es lo que debes escribir en el Copiloto).</em></p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600"><li><em>📝 Ejemplo:</em> El colegio está en una zona donde muchas familias trabajan en agricultura y hay problemas de manejo de residuos.</li></ul>
                                    </div>

                                    <div>
                                        <h4 className="text-base font-black text-black mb-1">3️⃣ Consigna</h4>
                                        <p className="text-slate-700 text-sm leading-relaxed mb-2">Es la <strong>instrucción específica</strong> o tarea que se da al estudiante para realizar una actividad.</p>
                                        <ul className="list-disc pl-5 text-sm text-slate-600"><li><em>📝 Ejemplo:</em> &quot;Escribe una propuesta para reducir la basura en tu comunidad.&quot;</li></ul>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-200 mt-5 mb-5">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-3 font-black text-black border-b border-slate-200">Término</th>
                                                <th className="px-4 py-3 font-black text-black border-b border-slate-200">¿Qué es?</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            <tr>
                                                <td className="px-4 py-3 font-bold text-black">Situación significativa</td>
                                                <td className="px-4 py-3 text-slate-700">Problema o reto real que motiva el aprendizaje.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-bold text-black">Situación de contexto</td>
                                                <td className="px-4 py-3 text-slate-700">Descripción del entorno o realidad del estudiante.</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-bold text-black">Consigna</td>
                                                <td className="px-4 py-3 text-slate-700">Instrucción o tarea exacta que debe realizar el estudiante.</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-slate-700 mb-5">📌 <strong>Relación:</strong> Primero se presenta la situación significativa dentro de un contexto, y luego se dan las consignas para las actividades.</p>

                                <hr className="border-slate-200 mb-5" />

                                <h3 className="text-lg font-black text-black mb-3">🏛️ Estructura MINEDU para redactar una Situación Significativa</h3>
                                <p className="text-sm text-slate-700 mb-2">✅ <strong>La fórmula rápida:</strong> Contexto + Problema + Pregunta reto + Producto</p>
                                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 text-sm text-slate-800 leading-relaxed">
                                    <p className="font-black text-orange-800 mb-1">📌 Ejemplo completo corto:</p>
                                    <p className="italic">&quot;En la institución educativa se ha observado que muchos estudiantes presentan dificultades para expresarse con claridad durante las exposiciones y lecturas en voz alta. Esta situación limita su participación y seguridad al comunicarse. Frente a ello surge la pregunta: ¿cómo podemos mejorar nuestra dicción y expresión oral para comunicar nuestras ideas con claridad? Para responder a este desafío, los estudiantes elaborarán podcasts y locuciones utilizando herramientas digitales, aplicando técnicas de vocalización y entonación.&quot;</p>
                                </div>

                                <div className="mt-6 text-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowHelpModal(false)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white font-black px-8 py-3 rounded-xl transition-colors shadow-md"
                                    >
                                        ✅ ¡Entendido!
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
                        <label className={`cursor-pointer flex-1 text-center py-3 rounded-xl border-2 font-black transition-all ${formData.nivelMaestro === 'Secundaria' ? 'border-primary-500 bg-primary-500 text-white shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-primary-300'}`}>
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
                            <label key={comp} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${formData.competencia.includes(comp) ? 'border-primary-500 bg-primary-50 text-primary-900 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-200'}`}>
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
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
                        placeholder="Ej: Se acerca el aniversario de nuestro colegio en Pativilca y los estudiantes de 4to año quieren organizar un campeonato deportivo, pero tenemos un presupuesto muy limitado para los premios..."
                        className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-4 shadow-sm"
                        rows={3}
                        value={formData.contexto}
                        onChange={(e) => setFormData({ ...formData, contexto: e.target.value })}
                    />
                    <p className="text-xs text-slate-500 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 leading-relaxed">
                        💡 <strong>Tip del Copiloto:</strong> Describe solo el problema o la realidad de los estudiantes. No te preocupes por el reto; la IA se encargará de redactar la Misión y la Consigna automáticamente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black flex items-center gap-2">
                            <Target className="w-4 h-4 text-orange-500" /> Enfoques Transversales
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="Ej: Enfoque Ambiental, Orientación al bien común, Búsqueda de la excelencia..."
                            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-orange-500 focus:border-orange-500 block p-3.5"
                            value={formData.valor}
                            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                        />
                        <p className="text-xs text-slate-500 bg-primary-50 border border-primary-100 rounded-lg px-3 py-2 leading-relaxed">
                            🎯 <strong>Tip:</strong> Indica el enfoque del CNEB que guiará la actitud y los valores de los estudiantes durante la resolución del problema.
                        </p>
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
            cantidad: { label: 'Cantidad', icon: '🔢', color: 'emerald' },
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
                                                <h2 className="text-[20px] font-bold tracking-tight text-black leading-tight">
                                                    {generatedReading.titulo}
                                                </h2>
                                                <div className="flex gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-bold bg-purple-50 text-purple-700 border border-purple-100 tracking-wide uppercase">
                                                        Grado {generatedReading.grado}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-bold bg-primary-50 text-primary-700 border border-primary-100 uppercase tracking-wide">
                                                        {generatedReading.tipoTexto}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Content & CNEB */}
                                    <div className="lg:col-span-8 flex flex-col gap-10 print:block">

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

                                        {/* ══ CONSIGNA DE TRABAJO ══ */}
                                        {generatedReading.consigna && (
                                            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-6 shadow-sm print:rounded-none print:shadow-none print:break-inside-avoid print:border-l-4 print:border-amber-600">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-2xl">📋</span>
                                                    <h4 className="text-[16px] font-bold text-amber-900 uppercase tracking-wider">
                                                        Consigna de Trabajo
                                                    </h4>
                                                </div>
                                                <div className="space-y-2">
                                                    {generatedReading.consigna.split('\n').map((line, i) => (
                                                        <p key={i} className={`text-amber-950 text-[16px] font-sans leading-relaxed ${line.match(/^\d+\./) ? 'font-bold pl-2' : 'font-normal'
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
                                                <h2 className="text-[20px] font-bold text-black flex items-center gap-3">
                                                    {isMath ? 'Resolución de Problemas' : 'Evaluación'} <span className="text-orange-600">CNEB</span>
                                                </h2>
                                                <span className="text-[14px] font-bold text-orange-700 bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 uppercase tracking-wide flex items-center gap-2 print:hidden">
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
                                                        <h4 className="text-[16px] text-amber-800 font-bold flex items-center gap-2 mb-3 uppercase tracking-wide">
                                                            <span className="text-[18px]">🎯</span> TU RETO:
                                                        </h4>
                                                        <p className="text-[16px] font-sans text-amber-950 font-normal leading-relaxed sm:pl-[36px]" dangerouslySetInnerHTML={{ __html: formatBoldText(generatedReading.actividades.find(a => a.type === 'escritura')?.pregunta) }}>
                                                        </p>
                                                    </div>
                                                )}

                                                {generatedReading.actividades.map((activity, index) => (
                                                    // In print mode: show ALL activities. On screen: only active tab.
                                                    <div key={activity.id} className={`bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 flex-col gap-6 relative overflow-hidden group hover:border-orange-300 transition-colors shadow-sm hover:shadow-md print:break-inside-avoid print:shadow-none print:border-slate-300 print:mt-8 print:!flex ${activity.type === activeTab ? 'flex' : 'hidden'}`}>

                                                        {/* Activity Type Badge — shows full CNEB competency name for Math */}
                                                        <h3 className="absolute top-0 right-0 bg-slate-100 px-4 py-1.5 text-[18px] font-bold uppercase tracking-widest text-slate-500 rounded-bl-2xl border-b border-l border-slate-200 print:bg-slate-50 print:border-slate-300 print:text-black">
                                                            {isMath
                                                                ? (MATH_FULL_NAMES[activity.type] || activity.type)
                                                                : formData.area === 'Integrada (STEAM)'
                                                                    ? 'Habilidades STEAM'
                                                                    : `Competencia: ${activity.type}`
                                                            }
                                                        </h3>

                                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 opacity-60 print:hidden"></div>

                                                        <div className="flex items-start gap-5 mt-4 sm:mt-0">
                                                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center font-black text-orange-700 shadow-inner shrink-0 text-xl border border-orange-100 print:border-slate-300 print:bg-white print:text-black">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-grow pt-1">
                                                                {activity.type === 'escritura' ? (
                                                                    <div className="bg-gradient-to-r from-amber-100 to-orange-50 p-4 rounded-xl border border-amber-200 shadow-sm mb-4">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-[18px]">🎯</span>
                                                                            <h4 className="font-bold text-amber-900 uppercase text-[16px] tracking-wider">Reto de Escritura</h4>
                                                                        </div>
                                                                        <p className="text-[16px] font-sans text-amber-950 font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta!) }}></p>
                                                                    </div>
                                                                ) : (
                                                                    <h4 className="text-[16px] font-bold text-black mb-3 leading-snug" dangerouslySetInnerHTML={{ __html: formatBoldText(activity.pregunta!) }}>
                                                                    </h4>
                                                                )}

                                                                <div className="bg-emerald-50 p-4 rounded-xl text-[16px] font-sans font-normal text-emerald-900 border border-emerald-200 mb-6 flex gap-3 print:hidden shadow-sm">
                                                                    <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                                    <p><strong>Solucionario Docente (Oculto en PDF):</strong> <span dangerouslySetInnerHTML={{ __html: formatBoldText(activity.respuestaEsperada!) }}></span></p>
                                                                </div>

                                                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                        <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                                            {formData.area === 'Integrada (STEAM)' ? 'Habilidades STEAM' : 'Capacidad CNEB'}
                                                                        </h4>
                                                                        <p className="text-[16px] font-sans font-normal text-black leading-relaxed">{activity.capacidad}</p>
                                                                    </div>
                                                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                                        <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estrategia Docente</h4>
                                                                        <p className="text-[16px] font-sans font-normal text-black leading-relaxed">{activity.estrategiasAplicacion}</p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-[16px] font-bold text-slate-400 uppercase tracking-wider mb-3">Rúbrica de Evaluación Delineada</h4>
                                                                    <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300">
                                                                        <table className="w-full text-[16px] font-sans text-left rubric-table">
                                                                            <thead className="bg-slate-50 text-black font-bold text-[16px] font-sans uppercase tracking-wider">
                                                                                <tr>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%] font-bold">En Inicio</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%] font-bold">En Proceso</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%] font-bold">Logrado</th>
                                                                                    <th className="px-4 py-3 border-b border-slate-200 w-[25%] font-bold">Destacado</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody className="divide-y divide-slate-100 bg-white text-black font-normal font-sans">
                                                                                <tr>
                                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top"><div className="flex gap-2 text-rose-600"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><p>{activity.rubricaEvaluacion.inicio}</p></div></td>
                                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top text-amber-600"><p>{activity.rubricaEvaluacion.proceso}</p></td>
                                                                                    <td className="px-4 py-4 border-r border-slate-100 align-top text-emerald-600"><p>{activity.rubricaEvaluacion.logrado}</p></td>
                                                                                    <td className="px-4 py-4 align-top text-orange-600 font-bold"><p>{activity.rubricaEvaluacion.destacado}</p></td>
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
                                                    <h2 className="text-[18px] font-bold text-black mb-6 flex items-center gap-3">
                                                        <BookText className="text-orange-600" /> Material Complementario
                                                    </h2>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {generatedReading.sugerenciaLibro && (
                                                            <div className="bg-white border text-[16px] font-sans border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-orange-300 transition-colors">
                                                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold shrink-0">
                                                                    📖
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[16px] font-bold text-slate-800 mb-1">Lectura Sugerida</h4>
                                                                    <p className="text-[16px] font-sans font-normal text-slate-600">{generatedReading.sugerenciaLibro}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {generatedReading.youtubeUrl && (
                                                            <a href={generatedReading.youtubeUrl} target="_blank" rel="noopener noreferrer" className="bg-white border text-[16px] font-sans border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 hover:border-red-300 transition-colors">
                                                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold shrink-0">
                                                                    ▶️
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-[16px] font-bold text-slate-800 mb-1">Video Complementario</h4>
                                                                    <p className="text-[16px] font-sans font-normal text-slate-600">Explorar Video en YouTube</p>
                                                                </div>
                                                            </a>
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
            </div >
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
