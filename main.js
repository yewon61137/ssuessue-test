// Teachable Machine URL - 수정 필요!
const URL = "https://teachablemachine.withgoogle.com/models/mnjbopnr/";

let model, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    labelContainer = document.getElementById("label-container");
}

async function predict() {
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

// Theme handling
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    let theme = 'light';
    if (document.body.classList.contains('dark-mode')) {
        theme = 'dark';
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
    localStorage.setItem('theme', theme);
});

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
    if (number <= 10) {
        return '#f44336'; // Red
    } else if (number <= 20) {
        return '#ff9800'; // Orange
    } else if (number <= 30) {
        return '#ffc107'; // Amber
    } else if (number <= 40) {
        return '#4caf50'; // Green
    } else {
        return '#2196f3'; // Blue
    }
}

generateBtn.addEventListener('click', displayGames);

// Initial generation
displayGames();
