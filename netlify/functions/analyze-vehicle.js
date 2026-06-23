// Netlify serverless function to analyze vehicle photo using Gemini API proxy
exports.handler = async function(event, context) {
    // Enable CORS for options request
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Error: GEMINI_API_KEY env variable is not set.');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Chave API do Gemini não configurada no servidor.' })
            };
        }

        const body = JSON.parse(event.body);
        const base64Image = body.image; // Expecting the image in raw base64 or complete data URI

        if (!base64Image) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Nenhuma imagem enviada no corpo da requisição.' })
            };
        }

        // Clean base64 prefix if present
        let cleanBase64 = base64Image;
        if (cleanBase64.includes(';base64,')) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const geminiRequestBody = {
            contents: [{
                parts: [
                    { text: 'Analise esta foto de um veículo brasileiro. Extraia: 1) A marca do veículo. 2) O modelo do veículo. 3) A cor do veículo. 4) A placa do veículo (formato brasileiro ABC1D23 ou ABC-1234). 5) O porte estimado (pequeno, medio ou grande). Responda APENAS em JSON puro sem markdown no formato: {"marca":"XXX","modelo":"XXX","cor":"XXX","placa":"XXX","porte":"pequeno|medio|grande"}. Se não conseguir identificar algum campo, use null.' },
                    { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
                ]
            }],
            generationConfig: { 
                temperature: 0.1, 
                maxOutputTokens: 200 
            }
        };

        // Note: Node 18+ has a global fetch. We fallback to global fetch if node-fetch is not available.
        const fetchFn = typeof fetch === 'function' ? fetch : global.fetch;
        if (!fetchFn) {
            throw new Error('Native fetch API or node-fetch is not available in Node runtime.');
        }

        const response = await fetchFn(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiRequestBody)
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API responded with status ${response.status}: ${errText}`);
        }

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Parse JSON from Gemini response (clean potential markdown code blocks)
        let jsonStr = rawText.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
        }
        
        // Validate if it is valid JSON
        const parsed = JSON.parse(jsonStr);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(parsed)
        };

    } catch (err) {
        console.error('Error analyzing vehicle photo:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: `Falha ao processar a foto do veículo: ${err.message}` })
        };
    }
};
