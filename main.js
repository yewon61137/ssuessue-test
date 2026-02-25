async function predict() {
    const imageInput = document.getElementById("image-input");
    const faceImage = document.getElementById("face-image");
    const labelContainer = document.getElementById("label-container");
    const loading = document.getElementById("loading");

    if (!imageInput.files[0]) return;

    loading.style.display = "block";
    labelContainer.innerHTML = "";

    const file = imageInput.files[0];
    
    try {
        // 1. 이미지 크기 최적화 (너무 크면 전송 실패 가능성 있음)
        const optimizedImage = await resizeImage(file, 800); // 가로 800px로 축소
        const base64Image = optimizedImage.split(',')[1];

        // 2. 서버 API 요청
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || `서버 응답 오류: ${response.status}`);
        }

        // 3. 결과 출력
        displayResult(data);
    } catch (error) {
        console.error("분석 상세 오류:", error);
        labelContainer.innerHTML = `
            <div style="color:#d93025; background:#fce8e6; padding:1.5rem; border-radius:10px;">
                <p><strong>⚠️ 분석 실패</strong></p>
                <p style="font-size:0.9rem;">원인: ${error.message}</p>
                <p style="font-size:0.8rem; margin-top:10px;">Cloudflare 대시보드에서 GEMINI_API_KEY 설정이 올바른지 확인해 주세요.</p>
            </div>
        `;
    } finally {
        loading.style.display = "none";
    }
}

// 이미지 리사이징 함수 (브라우저 메모리 사용 최소화)
function resizeImage(file, maxWidth) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

function displayResult(data) {
    const labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = `
        <div class="result-card">
            <h2 class="result-animal">당신은 [${data.animal}]상입니다!</h2>
            <div class="result-description">
                <p>${data.description}</p>
            </div>
            <div class="result-details">
                <h3>🔍 상세 분석 리포트</h3>
                <ul>
                    ${data.details.map(detail => `<li>${detail}</li>`).join('')}
                </ul>
            </div>
            <button onclick="location.reload()" style="margin-top:2rem; padding:0.8rem 2rem; border-radius:50px; border:1px solid #ddd; background:white; cursor:pointer;">다시 테스트하기</button>
        </div>
    `;
}

function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById("face-image");
            img.src = e.target.result;
            img.style.display = "block";
            predict();
        };
        reader.readAsDataURL(input.files[0]);
    }
}
