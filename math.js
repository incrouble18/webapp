// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) tg.expand();

// DOM Elements
const gameInstructions = document.getElementById("game-instructions");
const mathGameArea = document.getElementById("math-game-area");
const resultsArea = document.getElementById("results-area");
const startButton = document.getElementById("start-math-game");
const problemContainer = document.getElementById("current-problem");
const answerInput = document.getElementById("answer-input");
const submitAnswerButton = document.getElementById("submit-answer");
const timeLeftSpan = document.getElementById("time-left");
const currentScoreSpan = document.getElementById("current-score");
const finalScoreSpan = document.getElementById("final-score");
const xpGainedSpan = document.getElementById("xp-gained");
const backToHomeButton = document.getElementById("back-to-home");

// Game variables
let countdown;
let timeLeft = 60; // 60 seconds
let currentScore = 0;
let xpGained = 0;
let currentProblem = {};

// User data from localStorage
let userData;

// Load user data
function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    } else {
        userData = {
            level: 1,
            xp: 0,
            lives: 5,
            lastPlayed: new Date(),
            stats: {
                intelligence: 10,
                sports: 5,
                languages: 3
            },
            inventory: []
        };
    }
}

// Save user data
function saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Generate a random math problem based on difficulty
function generateProblem() {
    // Difficulty increases with player level
    const difficulty = Math.min(10, Math.max(1, Math.floor(userData.level / 2)));
    const operations = ['+', '-', '*'];

    let num1, num2, operation;

    // More complex problems for higher difficulty
    if (difficulty > 5) {
        num1 = Math.floor(Math.random() * difficulty * 10);
        num2 = Math.floor(Math.random() * difficulty * 5);
        operation = operations[Math.floor(Math.random() * operations.length)];
    } else {
        num1 = Math.floor(Math.random() * difficulty * 10);
        num2 = Math.floor(Math.random() * difficulty * 10);
        operation = operations[Math.floor(Math.random() * 2)]; // Only + and - for lower difficulty
    }

    // Ensure subtraction doesn't result in negative for beginners
    if (operation === '-' && difficulty < 3 && num2 > num1) {
        [num1, num2] = [num2, num1]; // Swap numbers
    }

    let answer;
    let problemText;

    switch (operation) {
        case '+':
            answer = num1 + num2;
            problemText = `${num1} + ${num2} = ?`;
            break;
        case '-':
            answer = num1 - num2;
            problemText = `${num1} - ${num2} = ?`;
            break;
        case '*':
            answer = num1 * num2;
            problemText = `${num1} × ${num2} = ?`;
            break;
    }

    return {
        text: problemText,
        answer: answer
    };
}

// Start the math game
function startMathGame() {
    gameInstructions.style.display = "none";
    mathGameArea.style.display = "block";

    // Reset game variables
    timeLeft = 60;
    currentScore = 0;
    currentScoreSpan.textContent = currentScore;

    // Generate first problem
    currentProblem = generateProblem();
    problemContainer.textContent = currentProblem.text;
    answerInput.value = "";
    answerInput.focus();

    // Start countdown
    countdown = setInterval(updateTimer, 1000);
    updateTimer();
}

// Update timer display and check if time is up
function updateTimer() {
    timeLeftSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(countdown);
        endGame();
    } else {
        timeLeft--;
    }
}

// Check the user's answer
function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);

    if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
        // Correct answer
        currentScore++;
        currentScoreSpan.textContent = currentScore;

        // Generate new problem
        currentProblem = generateProblem();
        problemContainer.textContent = currentProblem.text;
        answerInput.value = "";
        answerInput.focus();
    } else {
        // Incorrect answer - shake the input
        answerInput.classList.add("shake");
        setTimeout(() => {
            answerInput.classList.remove("shake");
        }, 500);
    }
}

// End the game and show results
function endGame() {
    mathGameArea.style.display = "none";

    // Calculate XP gained (20 XP per correct answer)
    xpGained = currentScore * 20;

    // Update user stats
    userData.xp += xpGained;
    userData.stats.intelligence += Math.ceil(currentScore / 3); // Boost intelligence

    // Level up check (simple formula: 100 XP per level)
    const newLevel = Math.floor(userData.xp / 100) + 1;
    if (newLevel > userData.level) {
        userData.level = newLevel;
        userData.lives++; // Bonus life on level up
    }

    saveUserData();

    // Show results
    finalScoreSpan.textContent = currentScore;
    xpGainedSpan.textContent = xpGained;
    resultsArea.style.display = "block";
}

// Event Listeners
startButton.addEventListener("click", startMathGame);
submitAnswerButton.addEventListener("click", checkAnswer);

// Also allow pressing Enter to submit
answerInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
});

backToHomeButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Load theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        // Default to colorful theme
        document.body.className = "colorful-theme";
    }
}

// Add a simple shake animation for wrong answers
const style = document.createElement('style');
style.textContent = `
.shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}`;
document.head.appendChild(style);

// Initialize the game
window.onload = function() {
    loadUserData();
    loadThemePreference();
};