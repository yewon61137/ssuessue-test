export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        
        // 1. API 키 확인
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'API 키 누락', 
                debug: 'Cloudflare 대시보드에 GEMINI_API_KEY가 설정되지 않았습니다.' 
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // 2. 구글 Gemini API 호출 (표준 v1beta 버전 직접 호출)
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: "당신은 관상 전문가입니다. 사진을 분석하여 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 가장 닮은 하나를 골라 JSON으로 답변하세요. 형식: { "animal": "...상", "description": "...", "details": ["...", "...", "..."] }" },
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
                error: 'Gemini API 서버 응답 오류', 
                debug: JSON.stringify(result) 
            }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        // 3. 답변 텍스트 추출 및 반환
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
