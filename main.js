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
