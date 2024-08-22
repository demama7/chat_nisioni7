const squares = {
    red: document.getElementById('redSquare'),
    blue: document.getElementById('blueSquare'),
    green: document.getElementById('greenSquare'),
    yellow: document.getElementById('yellowSquare')
};
const startButton = document.getElementById('startButton');
const timerDisplay = document.getElementById('timerDisplay');
const menu = document.getElementById('menu');
const resultText = document.getElementById('resultText');

let score = 0;
let timer;
let targetColor;

startButton.addEventListener('click', function() {
    startButton.style.display = 'none';
    startGame();
});

function startGame() {
    score = 0;
    timerDisplay.textContent = 'זמן נותר: 30 שניות';
    showRandomSquare();
    startTimer(30);
}

function showRandomSquare() {
    hideAllSquares();
    const colors = ['red', 'blue', 'green', 'yellow'];
    targetColor = colors[Math.floor(Math.random() * colors.length)];
    const targetSquare = squares[targetColor];
    targetSquare.style.display = 'block';
    targetSquare.style.top = `${Math.random() * 80}%`;
    targetSquare.style.left = `${Math.random() * 80}%`;
    targetSquare.addEventListener('click', handleSquareClick);
}

function hideAllSquares() {
    for (const color in squares) {
        squares[color].style.display = 'none';
        squares[color].removeEventListener('click', handleSquareClick);
    }
}

function handleSquareClick() {
    score++;
    showRandomSquare();
}

function startTimer(seconds) {
    let timeLeft = seconds;
    timer = setInterval(function() {
        timeLeft--;
        timerDisplay.textContent = `זמן נותר: ${timeLeft} שניות`;
        if (timeLeft === 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    hideAllSquares();
    resultText.textContent = `המשחק נגמר! התוצאה שלך היא: ${score}`;
    menu.style.display = 'block';
}
