// Teachable Machine 모델 URL 설정
const URL = "https://teachablemachine.withgoogle.com/models/BWG1q_SiO/";

let model, labelContainer, maxPredictions;

async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
    } catch (e) {
        console.error("모델 로드 실패. URL을 확인하세요.", e);
        alert("모델을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
}

async function predict() {
    if (!model) return;
    const image = document.getElementById("face-image");
    const prediction = await model.predict(image);
    
    labelContainer.innerHTML = "";
    
    // 확률 순으로 정렬
    prediction.sort((a, b) => b.probability - a.probability);

    for (let i = 0; i < maxPredictions; i++) {
        let classPrediction = prediction[i].className;
        
        // 클래스명 한글 매핑
        const mapping = {
            'dog': '강아지상',
            'cat': '고양이상',
            'rabbit': '토끼상',
            'fox': '여우상',
            'bear': '곰상',
            'dinosaur': '공룡상'
        };
        
        classPrediction = mapping[classPrediction.toLowerCase()] || classPrediction;

        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-bar";
        
        // 상위 결과 강조
        if (i === 0) resultDiv.classList.add('top-result');

        resultDiv.innerHTML = `
            <span class="result-label">${classPrediction}</span>
            <div class="bar-container">
                <div class="bar" style="width: ${probability}%"></div>
            </div>
            <span class="percent">${probability}%</span>
        `;
        labelContainer.appendChild(resultDiv);
    }
    document.getElementById("loading").style.display = "none";
}

function readURL(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById("face-image");
            img.src = e.target.result;
            img.style.display = "block";
            document.getElementById("loading").style.display = "block";
            
            // 결과 창 비우기
            if (labelContainer) labelContainer.innerHTML = "";
            
            if (!model) {
                init().then(() => predict());
            } else {
                predict();
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}
