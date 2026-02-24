import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
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
1. FILTRO LINGÜÍSTICO: Prohibido usar palabras inventadas, mal escritas o caracteres extraños. Usa español neutro, codificación UTF-8 limpia. IMPORTANTE: Escribe en español estándar de Perú. No inventes palabras. Si no puedes generar una palabra con tilde correctamente, usa el carácter normal, pero evita generar símbolos extraños.
2. ALINEACIÓN CNEB: La lectura evalúa la competencia "Lee diversos tipos de textos escritos en su lengua materna".
3. NIVELES DE COMPRENSIÓN: Las actividades DEBEN cubrir exactamente tres niveles: Literal, Inferencial y Crítico.
4. CAPACIDADES: Usa estrictamente estas tres capacidades en la matriz: "Obtiene información del texto escrito", "Infiere e interpreta información del texto", y "Reflexiona y evalúa la forma, el contenido y contexto del texto".
5. FORMATO: Devuelve ÚNICAMENTE un JSON puro y válido. Asegúrate de que las tildes y las eñes (ñ) se rendericen correctamente.
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
                    temperature: 0.3
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
            return new NextResponse(JSON.stringify(finalJson), {
                status: 200,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        } catch (parseError: any) {
            console.error("Fallo de Parseo JSON. Cadena devuelta:", cleanJsonString);
            return new NextResponse(JSON.stringify({ error: "La IA generó un formato corrupto. Intente de nuevo.", raw: cleanJsonString }), {
                status: 500,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        }

    } catch (error: any) {
        console.error("ERROR CRÍTICO DEL SERVIDOR DE NEXT:", error);
        return NextResponse.json(
            { error: "Error de Servidor", details: error.message },
            { status: 500, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
        );
    }
}
