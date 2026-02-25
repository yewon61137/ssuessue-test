export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        
        if (!image) {
            return new Response(JSON.stringify({ error: '이미지 누락' }), { status: 400 });
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'API 키 누락', 
                debug: 'Cloudflare 환경변수 GEMINI_API_KEY가 설정되지 않았습니다.' 
            }), { status: 500 });
        }

        // 구글 Gemini API 주소 (라이브러리 없이 직접 호출)
        const apiURL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // 요청 데이터 구성
        const payload = {
            contents: [{
                parts: [
                    { text: "당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 JSON으로만 답변하세요. 형식: { \"animal\": \"동물명\", \"description\": \"분석내용\", \"details\": [\"특징1\", \"특징2\", \"특징3\"] }" },
                    { inline_data: { mime_type: "image/jpeg", data: image } }
                ]
            }],
            generationConfig: {
                response_mime_type: "application/json"
            }
        };

        // 직접 fetch 호출
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ 
                error: 'Gemini API 서버 오류', 
                debug: JSON.stringify(result) 
            }), { status: response.status });
        }

        // 결과 반환
        const responseText = result.candidates[0].content.parts[0].text;
        return new Response(responseText, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "서버 내부 오류", 
            debug: error.message,
            stack: error.stack
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
