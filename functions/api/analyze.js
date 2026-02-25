export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'API 키 누락', 
                debug: 'Cloudflare 대시보드에 GEMINI_API_KEY가 설정되지 않았습니다.' 
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // 문법 오류 수정: 백틱(`)을 사용하여 문자열 내 따옴표 충돌 방지
        const promptText = `당신은 관상 전문가입니다. 사진을 분석하여 강아지상, 고양이상, 토끼상, 여우상, 곰상, 공룡상 중 가장 닮은 하나를 골라 반드시 JSON으로만 답변하세요. 
        답변 형식 예시: { "animal": "강아지상", "description": "전체적으로 선한 인상...", "details": ["처진 눈매", "둥근 얼굴선", "부드러운 분위기"] }`;

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
                error: 'Gemini API 응답 오류', 
                debug: JSON.stringify(result) 
            }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        const responseText = result.candidates[0].content.parts[0].text;
        return new Response(responseText, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "서버 내부 처리 오류", 
            debug: error.message 
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
