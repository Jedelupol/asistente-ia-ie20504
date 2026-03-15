import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper: call a Gemini model and return { response, data }
async function callGemini(apiKey: string, model: string, finalPrompt: string, temperature: number) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: { temperature }
        })
    });
    const data = await response.json();
    return { response, data };
}

export async function POST(req: Request) {
    try {
        const { prompt, temperature } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim();

        if (!apiKey) {
            return NextResponse.json(
                { error: "No se proporcionó API Key de Gemini" },
                { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
        }

        // REGLAS ESTRICTAS DE CNEB Y CALIDAD LINGÜÍSTICA
        const cnebRules = `
REGLAS ESTRICTAS DE CALIDAD Y CNEB:
1. FILTRO LINGÜÍSTICO: Prohibido usar palabras inventadas, mal escritas o caracteres extraños. Usa español neutro, codificación UTF-8 limpia. Escribe en español estándar de Perú. No inventes palabras.
2. ALINEACIÓN CNEB: Eres un experto en el Currículo Nacional de la Educación Básica (CNEB) de Perú. Tienes ESTRICTAMENTE PROHIBIDO inventar competencias o formatos. Tu respuesta debe articularse lógicamente y ÚNICAMENTE con las competencias que se detallan en el prompt. No agregues competencias que no fueron solicitadas.
3. CONSIGNAS DE DESEMPEÑO: Las actividades DEBEN ser retos o acciones ("consignas") alineadas a las capacidades requeridas, nunca preguntas de opción múltiple simples.
4. FORMATO: Devuelve ÚNICAMENTE un JSON puro y válido que cumpla con el esquema.
`;

        const finalPrompt = prompt + "\n\n" + cnebRules + "\n\nCRÍTICO: Devuelve única y exclusivamente un objeto JSON. NO añadas etiquetas de código markdown (como ```json o similares).";
        const tempNum = temperature !== undefined ? parseFloat(String(temperature)) : 0.7;

        // ── MODEL CHAIN: gemini-2.5-flash → gemini-1.5-flash (fallback) ──────
        const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];
        let textPayload: string | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let lastData: any = {};

        for (const model of MODELS) {
            console.log(`🤖 [GEMINI] Intentando con modelo: ${model}`);
            const { response, data } = await callGemini(apiKey, model, finalPrompt, tempNum);
            lastData = data;

            if (!response.ok) {
                console.error(`❌ [GEMINI] HTTP ${response.status} con modelo ${model}:`, data);
                continue;
            }

            const candidate = data.candidates?.[0];
            const finishReason: string | undefined = candidate?.finishReason;

            // If blocked by safety or recitation, try next model
            if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
                console.warn(`⚠️ [GEMINI] ${model} bloqueó. finishReason = ${finishReason}`);
                continue;
            }

            const text: string | undefined = candidate?.content?.parts?.[0]?.text;
            if (text) {
                textPayload = text;
                console.log(`✅ [GEMINI] Respuesta OK con modelo: ${model}`);
                break;
            }

            console.warn(`⚠️ [GEMINI] ${model} devolvió payload vacío. Probando siguiente modelo...`);
        }

        // All models failed — return user-friendly message
        if (!textPayload) {
            const finishReason: string | undefined = lastData?.candidates?.[0]?.finishReason;
            const blockMessages: Record<string, string> = {
                SAFETY: "La IA bloqueó la solicitud por filtros de seguridad. Intenta reformular el contexto institucional o los enfoques transversales.",
                RECITATION: "La IA detectó contenido repetitivo. Cambia la situación significativa y vuelve a intentarlo.",
                MAX_TOKENS: "El prompt es demasiado largo. Selecciona menos competencias o simplifica el contexto.",
            };
            const userMsg = (finishReason && blockMessages[finishReason])
                ? blockMessages[finishReason]
                : "La IA no pudo generar contenido. Verifica tu API Key de Gemini o inténtalo de nuevo en unos segundos.";

            console.error("❌ [GEMINI] Todos los modelos fallaron. Último payload:", JSON.stringify(lastData).slice(0, 800));
            return NextResponse.json(
                { error: userMsg },
                { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
        }

        // PASO 4: LIMPIEZA ROBUSTA Y EXTRACCIÓN DE JSON
        let cleanJsonString = textPayload.normalize("NFC")
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .replace(/\?{2,}/g, "")
            .replace(/\uFFFD/g, "")
            .trim();

        console.log("--- PAYLOAD GEMINI (primeros 500 chars) ---");
        console.log(cleanJsonString.slice(0, 500));
        console.log("-------------------------------------------");

        // EXTRACCIÓN MULTICAPA: parse directo → regex objeto → regex array
        let finalJsonCandidate = cleanJsonString;
        if (!cleanJsonString.startsWith('{') && !cleanJsonString.startsWith('[')) {
            const jsonObjectMatch = cleanJsonString.match(/\{[\s\S]*\}/);
            const jsonArrayMatch = cleanJsonString.match(/\[[\s\S]*\]/);
            if (jsonObjectMatch) {
                finalJsonCandidate = jsonObjectMatch[0];
                console.log("⚠️ JSON extraído con regex (la IA generó prosa extra).");
            } else if (jsonArrayMatch) {
                finalJsonCandidate = jsonArrayMatch[0];
            }
        }

        try {
            const finalJson = JSON.parse(finalJsonCandidate);

            // --- UNSPLASH INTEGRATION ---
            if (finalJson.searchKeywords && process.env.UNSPLASH_ACCESS_KEY) {
                try {
                    const unsplashQuery = encodeURIComponent(finalJson.searchKeywords);
                    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${unsplashQuery}&per_page=1&orientation=landscape`;
                    const unsplashRes = await fetch(unsplashUrl, {
                        headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` }
                    });
                    if (unsplashRes.ok) {
                        const unsplashData = await unsplashRes.json();
                        finalJson.imagenesReferencia = unsplashData.results.map(
                            (r: { urls: { regular: string } }) => r.urls.regular
                        );
                    } else {
                        finalJson.imagenesReferencia = [];
                    }
                } catch {
                    finalJson.imagenesReferencia = [];
                }
            }

            return new NextResponse(JSON.stringify(finalJson), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });

        } catch (parseError: unknown) {
            console.error("Fallo de Parseo JSON:", parseError);
            return new NextResponse(
                JSON.stringify({ error: "La IA generó un formato corrupto. Intente de nuevo.", raw: cleanJsonString.slice(0, 300) }),
                { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
        }

    } catch (error: unknown) {
        console.error("ERROR CRÍTICO DEL SERVIDOR DE NEXT:", error);
        return NextResponse.json(
            { error: "Error de Servidor", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
    }
}
