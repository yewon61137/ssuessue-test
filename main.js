// [필독] Teachable Machine 모델 URL 설정
// 여기에 본인의 모델 주소를 넣으세요. 끝에 '/'가 반드시 있어야 합니다.
// 예: "https://teachablemachine.withgoogle.com/models/ABCD12345/"
const URL = "https://teachablemachine.withgoogle.com/models/mnjbopnr/";

let model, labelContainer, maxPredictions;

// 화면 전환 기능
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId + '-section').style.display = 'block';
    event.currentTarget.classList.add('active');
}

async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
    } catch (e) {
        console.error("모델 로드 실패. URL을 확인하세요.", e);
        alert("모델을 불러오지 못했습니다. URL 설정을 확인해 주세요.");
    }
}

async function predict() {
    if (!model) return;
    const image = document.getElementById("face-image");
    const prediction = await model.predict(image);
    
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        const resultDiv = document.createElement("div");
        resultDiv.className = "result-bar";
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
            if (!model) {
                init().then(() => predict());
            } else {
                predict();
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 로또 기능
const generateBtn = document.getElementById('generate-btn');
const gamesContainer = document.getElementById('games-container');

function generateLottoGame() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return Array.from(numbers).sort((a, b) => a - b);
}

function displayGames() {
    gamesContainer.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const gameDiv = document.createElement('div');
        gameDiv.classList.add('lotto-game');

        const gameHeader = document.createElement('h2');
        gameHeader.textContent = `Game ${i}`;
        gameDiv.appendChild(gameHeader);

        const lottoNumbersContainer = document.createElement('div');
        lottoNumbersContainer.classList.add('lotto-numbers');

        const numbers = generateLottoGame();
        numbers.forEach(number => {
            const numberDiv = document.createElement('div');
            numberDiv.classList.add('number');
            numberDiv.textContent = number;
            numberDiv.style.backgroundColor = getNumberColor(number);
            lottoNumbersContainer.appendChild(numberDiv);
        });

        gameDiv.appendChild(lottoNumbersContainer);
        gamesContainer.appendChild(gameDiv);
    }
}

function getNumberColor(number) {
    if (number <= 10) return '#f44336';
    if (number <= 20) return '#ff9800';
    if (number <= 30) return '#ffc107';
    if (number <= 40) return '#4caf50';
    return '#2196f3';
}

generateBtn.addEventListener('click', displayGames);

// 초기 로드
displayGames();
