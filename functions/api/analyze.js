import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const { image } = await request.json();

        if (!image) {
            return new Response(JSON.stringify({ error: 'No image provided' }), { status: 400 });
        }

        // Cloudflare 환경변수에서 키 가져오기
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API Key not configured in Cloudflare' }), { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        
        // 모델 명칭 수정: gemini-1.5-flash (가장 범용적인 명칭 사용)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `당신은 얼굴 관상과 이미지 분석 전문가입니다. 업로드된 사진을 분석하여 다음 단계에 따라 결과를 제공하세요.
        1. 강아지상, 고양이상, 토끼상, 여우상, 곰상, 공룡상 중 가장 닮은 동물을 하나 선정하세요.
        2. 왜 그 동물을 선정했는지 눈매, 코의 형태, 입매, 전체적인 분위기를 들어 상세히 설명하세요.
        3. 선정된 동물의 전형적인 특징과 매력 포인트를 3가지 이상 상세 분석 리포트로 작성하세요.
        4. 결과는 반드시 JSON 형식으로 반환하세요.
        형식 예: { "animal": "강아지", "description": "전체적으로 선한 인상과...", "details": ["눈꼬리가 살짝 처져 있어 부드러운 인상", "입술이 도톰하고 웃을 때 매력적", "신뢰감을 주는 분위기"] }`;

        const imagePart = {
            inlineData: {
                data: image,
                mimeType: "image/jpeg"
            }
        };

        // 분석 요청
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const responseText = response.text();

        // JSON 추출 및 정제 (가끔 마크다운 ```json 형식이 포함됨)
        let cleanedJson = responseText;
        if (responseText.includes("```")) {
            cleanedJson = responseText.split("```")[1].replace("json", "").trim();
        }
        
        return new Response(cleanedJson, {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: "Gemini 분석 오류: " + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
