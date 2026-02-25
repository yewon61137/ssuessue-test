export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API_KEY_MISSING' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        // 텍스트를 아주 단순하게 구성 (빌드 에러 방지)
        const payload = {
            contents: [{
                parts: [
                    { text: "Analyze this face. Return ONLY JSON with fields: animal, description, details." },
                    { inline_data: { mime_type: "image/jpeg", data: image } }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'GEMINI_ERROR', debug: result }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response(result.candidates[0].content.parts[0].text, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'SERVER_ERROR', debug: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
