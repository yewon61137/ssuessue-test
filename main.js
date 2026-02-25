async function predict() {
    const imageInput = document.getElementById("image-input");
    const faceImage = document.getElementById("face-image");
    const labelContainer = document.getElementById("label-container");
    const loading = document.getElementById("loading");

    if (!imageInput.files[0]) return;

    loading.style.display = "block";
    labelContainer.innerHTML = "";

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = async function(e) {
        const base64Image = e.target.result.split(',')[1];

        try {
            // 우리 서버 API로 요청 (보안상 키를 숨기기 위함)
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            // 결과 출력
            displayResult(data);
        } catch (error) {
            console.error("분석 실패:", error);
            labelContainer.innerHTML = "<p style='color:red;'>분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.</p>";
        } finally {
            loading.style.display = "none";
        }
    };
    reader.readAsDataURL(file);
}

function displayResult(data) {
    const labelContainer = document.getElementById("label-container");
    
    // Gemini가 보내준 상세 분석 결과 출력
    labelContainer.innerHTML = `
        <div class="result-card top-result">
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
            predict(); // 사진 업로드 즉시 분석 시작
        };
        reader.readAsDataURL(input.files[0]);
    }
}
