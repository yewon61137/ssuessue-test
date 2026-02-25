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
                debug: 'Cloudflare 환경변수 GEMINI_API_KEY 확인 필요' 
            }), { status: 500 });
        }

        // 구글 Gemini API 주소
        const apiURL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // 400 에러 해결: 호환성 문제가 있는 필드를 제거하고 프롬프트로 강제
        const payload = {
            contents: [{
                parts: [
                    { text: "당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 반드시 JSON으로만 답변하세요. 마크다운 기호 없이 순수 JSON 텍스트만 출력하세요. 형식: { \"animal\": \"동물명\", \"description\": \"분석내용\", \"details\": [\"특징1\", \"특징2\", \"특징3\"] }" },
                    { inline_data: { mime_type: "image/jpeg", data: image } }
                ]
            }]
            // generationConfig 제거 (버전 호환성 문제 방지)
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ 
                error: 'Gemini API 호출 에러', 
                debug: JSON.stringify(result) 
            }), { status: response.status });
        }

        // 결과 반환 (텍스트에서 JSON 추출)
        let responseText = result.candidates[0].content.parts[0].text;
        
        // AI가 마크다운 형식을 포함했을 경우를 대비해 순수 JSON만 추출
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const finalJson = jsonMatch ? jsonMatch[0] : responseText;

        return new Response(finalJson, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "최종 서버 오류", 
            debug: error.message
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
