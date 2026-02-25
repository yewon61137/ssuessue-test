import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const { image } = await request.json();
        if (!image) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 없습니다.' }), { status: 400 });
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Cloudflare에 API 키가 설정되지 않았습니다. (GEMINI_API_KEY 확인 필요)' }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" } // JSON 응답 강제 설정
        });

        const prompt = `얼굴 관상 전문가로서 사진을 분석해 JSON 형식으로만 답변하세요.
        필수 필드: 
        - animal: (강아지상, 고양이상, 토끼상, 여우상, 곰상, 공룡상 중 택1)
        - description: (전체적인 분위기와 선정 이유 상세 설명)
        - details: (눈매, 코, 입, 얼굴선 등 3가지 이상의 구체적 분석 리스트)
        
        예시: { "animal": "강아지상", "description": "...", "details": ["...", "...", "..."] }`;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: "image/jpeg"
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const responseText = response.text();

        // JSON만 추출하기 (정규표현식 사용)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("AI가 유효한 데이터 형식을 생성하지 못했습니다.");
        }

        return new Response(jsonMatch[0], {
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

    } catch (error) {
        console.error("Critical API Error:", error);
        return new Response(JSON.stringify({ 
            error: "분석 중 오류가 발생했습니다.", 
            debug: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
