export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'KEY_MISSING' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // 최종 해결 주소: v1 버전 + gemini-1.5-flash 모델
        const apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: "Analyze this image and identify which animal this person resembles most (Dog, Cat, Rabbit, Fox, Bear, or Dinosaur). Return ONLY a JSON object with fields: animal (translate to Korean like '강아지상'), description (detailed explanation in Korean), details (list of 3 specific traits in Korean)." },
                    { inline_data: { mime_type: "image/jpeg", data: image } }
                ]
            }]
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'API_RESPONSE_ERROR', debug: result }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        const responseText = result.candidates[0].content.parts[0].text;
        return new Response(responseText, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'FETCH_ERROR', debug: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
