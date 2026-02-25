async function predict() {
    const imageInput = document.getElementById("image-input");
    const labelContainer = document.getElementById("label-container");
    const loading = document.getElementById("loading");

    if (!imageInput.files[0]) return;

    loading.style.display = "block";
    labelContainer.innerHTML = "";

    try {
        const file = imageInput.files[0];
        const optimizedImage = await resizeImage(file, 800);
        const base64Image = optimizedImage.split(',')[1];

        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (!response.ok) {
            // 서버에서 에러가 났을 때 구체적인 정보 출력
            throw new Error(`[${response.status}] ${data.error || '알 수 없는 서버 오류'}\n상세: ${data.debug || '없음'}\n위치: ${data.stack || '없음'}`);
        }

        displayResult(data);
    } catch (error) {
        console.error("상세 에러:", error);
        labelContainer.innerHTML = `
            <div style="color:#d93025; background:#fce8e6; padding:1.5rem; border-radius:10px; text-align:left;">
                <p><strong>⚠️ 분석 실패 (상세 보고서)</strong></p>
                <pre style="font-size:0.8rem; white-space:pre-wrap; background:#fff; padding:10px; border-radius:5px; margin-top:10px;">${error.message}</pre>
                <p style="font-size:0.8rem; margin-top:10px;">이 내용을 복사해서 알려주시면 바로 해결해 드릴 수 있습니다.</p>
            </div>
        `;
    } finally {
        loading.style.display = "none";
    }
}

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
