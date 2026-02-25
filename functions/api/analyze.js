import { GoogleGenerativeAI } from "@google/generative-ai";

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        const body = await request.json();
        const { image } = body;
        
        if (!image) {
            return new Response(JSON.stringify({ error: '이미지 데이터가 누락되었습니다.' }), { status: 400 });
        }

        // 1. API 키 존재 여부 및 상세 체크
        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ 
                error: 'API 키가 설정되지 않았습니다.', 
                debug: 'env.GEMINI_API_KEY가 undefined입니다. Cloudflare 설정 -> 변수 섹션을 확인하세요.' 
            }), { status: 500 });
        }

        // 2. Gemini API 호출
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `당신은 얼굴 분석 전문가입니다. 사진을 보고 강아지, 고양이, 토끼, 여우, 곰, 공룡상 중 하나를 골라 JSON으로 답변하세요.
        형식: { "animal": "동물명", "description": "분석내용", "details": ["특징1", "특징2", "특징3"] }`;

        const imagePart = {
            inlineData: { data: image, mimeType: "image/jpeg" }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const responseText = response.text();

        // 3. JSON 추출
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("AI 응답 형식이 올바르지 않습니다.");

        return new Response(jsonMatch[0], {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Server Error:", error);
        return new Response(JSON.stringify({ 
            error: "분석 처리 중 서버 내부 오류가 발생했습니다.", 
            debug: error.message,
            stack: error.stack.substring(0, 100) // 에러 위치 추적용
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
