export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        const apiKey = env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API 키 설정 오류', debug: 'Cloudflare 환경변수 GEMINI_API_KEY를 찾을 수 없습니다.' }), { status: 500 });
        }

        // 1. 시도할 API 주소 리스트 (구글이 버전을 자주 바꿔서 둘 다 시도)
        const urls = [
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
        ];

        const payload = {
            contents: [{
                parts: [
                    { text: "당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 반드시 JSON으로만 답변하세요. { \"animal\": \"...\", \"description\": \"...\", \"details\": [\"...\", \"...\", \"...\"] }" },
                    { inline_data: { mime_type: "image/jpeg", data: image } }
                ]
            }]
        };

        let lastError = null;
        for (const url of urls) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (response.ok && result.candidates) {
                    const responseText = result.candidates[0].content.parts[0].text;
                    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                    return new Response(jsonMatch ? jsonMatch[0] : responseText, {
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
                lastError = result;
            } catch (e) {
                lastError = e.message;
            }
        }

        return new Response(JSON.stringify({ error: '모든 API 버전 호출 실패', debug: JSON.stringify(lastError) }), { status: 500 });

    } catch (error) {
        return new Response(JSON.stringify({ error: "서버 오류", debug: error.message }), { status: 500 });
    }
}
