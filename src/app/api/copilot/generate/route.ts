import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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
2. ALINEACIÓN CNEB: Genera actividades basándote ESTRICTAMENTE en las competencias que se detallan en el prompt. No agregues competencias que no fueron solicitadas.
3. CONSIGNAS DE DESEMPEÑO: Las actividades DEBEN ser retos o acciones ("consignas") alineadas a las capacidades requeridas, nunca preguntas de opción múltiple simples.
4. FORMATO: Devuelve ÚNICAMENTE un JSON puro y válido que cumpla con el esquema.
`;

        const finalPrompt = prompt + "\n\n" + cnebRules + "\n\nCRÍTICO: Devuelve única y exclusivamente un objeto JSON. NO añadas etiquetas de código markdown (como ```json o similares).";

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: finalPrompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: temperature !== undefined ? parseFloat(temperature) : 0.7
                }
            })
        });

        const data = await response.json();

        // INTERCEPCIÓN DE ERRORES EXACTOS DE GOOGLE
        if (!response.ok) {
            console.error("ERROR EXACTO DEVUELTO POR GOOGLE:", data);
            return NextResponse.json({
                error: "Google API Error",
                message: data.error?.message || "Fallo desconocido de conectividad con Gemini",
                details: data
            }, {
                status: response.status,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        }

        const textPayload = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textPayload) {
            console.error("Payload Vacio o Inválido de Google:", data);
            return NextResponse.json(
                { error: "Estructura de respuesta inesperada desde la API de Google" },
                { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
            );
        }

        // PASO 4: LIMPIEZA DE PARSEO JSON EN CASO DE FALLA (MARKDOWN) Y ALUCINACIONES
        // Normalización NFC para reconstruir caracteres diacríticos separados y limpieza base
        let cleanJsonString = textPayload.normalize("NFC").replace(/```json/gi, "").replace(/```/g, "").trim();

        // Limpieza de rastros de "????" iterados o caracteres corruptos
        cleanJsonString = cleanJsonString.replace(/\?{2,}/g, ""); // Elimina signos de interrogación múltiples
        cleanJsonString = cleanJsonString.replace(/\uFFFD/g, ""); // Elimina el caracter de reemplazo unicode corrupto

        // PRUEBA DE TEXTO: Verificar caracteres especiales en la consola
        console.log("--- VERIFICACIÓN DE CARACTERES UTF-8 ANTES DEL ENVÍO ---");
        const previewText = cleanJsonString.slice(0, 500);
        console.log("Muestra del inicio del payload generado para evaluar tildes y eñes:");
        console.log(previewText + "...\n---------------------------------------------------------");

        try {
            const finalJson = JSON.parse(cleanJsonString);

            // --- FASE 6: UNSPLASH INTEGRATION ---
            if (finalJson.searchKeywords && process.env.UNSPLASH_ACCESS_KEY) {
                try {
                    const unsplashQuery = encodeURIComponent(finalJson.searchKeywords);
                    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${unsplashQuery}&per_page=1&orientation=landscape`;

                    console.log("📸 [UNSPLASH] Iniciando búsqueda...");
                    console.log(`📸 [UNSPLASH] Query: ${finalJson.searchKeywords}`);
                    console.log(`📸 [UNSPLASH] Access Key (mask): ${process.env.UNSPLASH_ACCESS_KEY.slice(0, 4)}...${process.env.UNSPLASH_ACCESS_KEY.slice(-4)}`);

                    const unsplashRes = await fetch(unsplashUrl, {
                        headers: {
                            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                        }
                    });

                    console.log(`📸 [UNSPLASH] HTTP Status: ${unsplashRes.status} ${unsplashRes.statusText}`);

                    if (unsplashRes.ok) {
                        const unsplashData = await unsplashRes.json();
                        console.log(`📸 [UNSPLASH] OK! Resultados encontrados: ${unsplashData.results.length}`);
                        if (unsplashData.results.length > 0) {
                            console.log(`📸 [UNSPLASH] URL Imagen: ${unsplashData.results[0].urls.regular}`);
                        }
                        finalJson.imagenesReferencia = unsplashData.results.map((r: { urls: { regular: string } }) => r.urls.regular);
                    } else {
                        const errorBody = await unsplashRes.text();
                        console.error(`❌ [UNSPLASH] ERROR API (${unsplashRes.status}):`, errorBody);

                        // Diagnóstico específico para el Lic. Jesús
                        if (unsplashRes.status === 401) console.error("⚠️ DIAGNÓSTICO: Llave de Unsplash Inválida (Unauthorized).");
                        if (unsplashRes.status === 403) console.error("⚠️ DIAGNÓSTICO: Límite de API de Unsplash superado o cuenta bloqueada.");

                        finalJson.imagenesReferencia = []; // Fallback empty
                    }
                } catch (unsplashError) {
                    console.error("❌ [UNSPLASH] Error crítico en fetch:", unsplashError);
                    finalJson.imagenesReferencia = []; // Fallback empty
                }
            } else if (finalJson.searchKeywords) {
                console.warn("⚠️ [UNSPLASH] searchKeywords presentes pero falta UNSPLASH_ACCESS_KEY en el entorno.");
            }
            // ------------------------------------

            return new NextResponse(JSON.stringify(finalJson), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        } catch (parseError: unknown) {
            console.error("Fallo de Parseo JSON. Cadena devuelta:", cleanJsonString, parseError);
            return new NextResponse(JSON.stringify({ error: "La IA generó un formato corrupto. Intente de nuevo.", raw: cleanJsonString }), {
                status: 500,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        }

    } catch (error: unknown) {
        console.error("ERROR CRÍTICO DEL SERVIDOR DE NEXT:", error);
        return NextResponse.json(
            { error: "Error de Servidor", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
    }
}
