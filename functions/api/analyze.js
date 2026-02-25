export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        
        // OpenAI API 키 확인
        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'OPENAI_API_KEY_MISSING', 
                debug: 'Cloudflare 설정에서 OPENAI_API_KEY를 추가해 주세요.' 
            }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // OpenAI API 호출 (GPT-4o-mini 모델 사용)
        const apiURL = "https://api.openai.com/v1/chat/completions";

        const payload = {
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 반드시 JSON으로만 답변하세요. 마크다운 기호 없이 순수 JSON만 출력하세요. 형식: { \"animal\": \"...상\", \"description\": \"전체적인 분위기 설명\", \"details\": [\"특징1\", \"특징2\", \"특징3\"] }" },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${image}`
                            }
                        }
                    ]
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 500
        };

        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'OPENAI_ERROR', debug: result }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
        }

        // 결과 반환
        const responseText = result.choices[0].message.content;
        return new Response(responseText, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'SERVER_ERROR', debug: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
