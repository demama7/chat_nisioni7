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

// יצירת אובייקטים Audio עבור הצלילים
const bupSound = new Audio('bup.mp3');
const bonusSound = new Audio('tyari.mp3'); // צליל לריבועים שמזכים בניקוד גבוה
const penaltySound = new Audio('poyon.mp3'); // צליל לריבועים שמורידים ניקוד

let score = 0;
let timer;
let targetColor;
let bonusColor = '';

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
    
    // הוספת אפקטים מיוחדים לריבועים
    if (Math.random() < 0.1) { // 10% סיכוי שהריבוע יהיה אתגרי זמן נוסף
        bonusColor = targetColor;
        targetSquare.style.border = '2px solid gold'; // שינוי גבול הריבוע
        targetSquare.style.transform = 'scale(1.2)'; // הגדלת הריבוע
        targetSquare.addEventListener('click', handleBonusSquareClick);
    } else {
        targetSquare.addEventListener('click', handleSquareClick);
    }
}

function hideAllSquares() {
    for (const color in squares) {
        squares[color].style.display = 'none';
        squares[color].removeEventListener('click', handleSquareClick);
        squares[color].removeEventListener('click', handleBonusSquareClick);
    }
}

function handleSquareClick() {
    bupSound.play();
    score++;
    showRandomSquare();
}

function handleBonusSquareClick() {
    bonusSound.play();
    score += 5; // ניקוד נוסף עבור ריבוע אתגרי זמן
    showRandomSquare();
}

// הוספת ריבועים שמורידים ניקוד
function showPenaltySquare() {
    hideAllSquares();
    const penaltyColors = ['red', 'blue', 'green', 'yellow'];
    const penaltyColor = penaltyColors[Math.floor(Math.random() * penaltyColors.length)];
    const penaltySquare = squares[penaltyColor];
    penaltySquare.style.display = 'block';
    penaltySquare.style.top = `${Math.random() * 80}%`;
    penaltySquare.style.left = `${Math.random() * 80}%`;
    penaltySquare.style.border = '2px solid black'; // שינוי גבול הריבוע לריבוע שמוריד ניקוד
    penaltySquare.addEventListener('click', handlePenaltySquareClick);
}

function handlePenaltySquareClick() {
    penaltySound.play();
    score -= 3; // הורדת ניקוד עבור ריבוע שמוריד ניקוד
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
