export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API 키 누락' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // 모델 명칭 수정: gemini-1.5-flash-latest (가장 확실한 명칭)
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        const promptText = "당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 반드시 JSON으로만 답변하세요. 결과에는 animal, description, details 필드가 포함되어야 합니다.";

        const payload = {
            contents: [{
                parts: [
                    { text: promptText },
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
            return new Response(JSON.stringify({ 
                error: '구글 AI 응답 에러', 
                debug: JSON.stringify(result) 
            }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        const responseText = result.candidates[0].content.parts[0].text;
        return new Response(responseText, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "처리 중 예외 발생", debug: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
