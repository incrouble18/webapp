// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.expand();
}

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameArea = document.getElementById('game-area');
const resultsScreen = document.getElementById('results');
const countdownElement = document.getElementById('countdown');
const timerElement = document.getElementById('timer');
const problemNumberElement = document.getElementById('problem-number');
const mathProblemElement = document.getElementById('math-problem');
const answerInput = document.getElementById('answer-input');
const submitAnswerButton = document.getElementById('submit-answer');
const finalTimeElement = document.getElementById('final-time');
const correctCountElement = document.getElementById('correct-count');
const xpEarnedElement = document.getElementById('xp-earned');
const recordsListElement = document.getElementById('records-list');
const achievementMsgElement = document.getElementById('achievement-unlocked-msg');

// Buttons
const cancelMathStartButton = document.getElementById('cancel-math-start');
const cancelMathGameButton = document.getElementById('cancel-math-game');
const playAgainMathButton = document.getElementById('play-again-math');
const backToMenuMathButton = document.getElementById('back-to-menu-math');

// Game variables
let problemCounter = 1;
let correctAnswers = 0;
let gameStartTime;
let gameTimerInterval;
let countdownInterval;
let mathProblems = [];
let currentMathProblem;
const TOTAL_MATH_PROBLEMS = 87;

// User Data Handling (Simplified, assuming it exists in localStorage)
function loadUserData() {
     const defaultUserData = { level: 1, xp: 0, lives: 5, stats: { intelligence: 10 }, records: { mathTime: [] }, achievements: { mathWizard: false } };
     const savedData = localStorage.getItem('brainTrainingUserData');
     if (savedData) {
         try {
             const parsed = JSON.parse(savedData);
             // Ensure nested objects exist
             parsed.records = parsed.records || { mathTime: [] };
             if (!parsed.records.mathTime) parsed.records.mathTime = [];
             parsed.achievements = parsed.achievements || { mathWizard: false };
              if (parsed.achievements.mathWizard === undefined) parsed.achievements.mathWizard = false;
             return { ...defaultUserData, ...parsed }; // Merge with defaults
         } catch(e) { console.error("Failed to parse user data", e); return defaultUserData; }
     }
     return defaultUserData;
}

function saveUserData(userData) {
     try {
        localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
     } catch(e) { console.error("Failed to save user data", e); }
}

// --- Game Logic ---

function generateMathProblem() {
  const operations = ['+', '-', '*', ':']; // Используем символы
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let num1, num2, answer;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 60) + 1; // Increased range slightly
      num2 = Math.floor(Math.random() * 60) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 60) + 30;
      num2 = Math.floor(Math.random() * num1) + 1; // Ensure num2 <= num1
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    case ':': // Division
      answer = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      num1 = answer * num2; // Ensure integer division
      break;
  }
  // Используем правильные символы в выражении
  const displayOperation = operation === '*' ? '×' : operation;
  return { expression: `${num1} ${displayOperation} ${num2}`, answer: answer };
}

function generateAllProblems(count) {
    const problems = [];
    for (let i = 0; i < count; i++) {
        problems.push(generateMathProblem());
    }
    // Simple shuffle
    return problems.sort(() => Math.random() - 0.5);
}

function updateGameTimer() {
  const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  timerElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function showNextProblem() {
  if (problemCounter > TOTAL_MATH_PROBLEMS) {
    endMathGame();
    return;
  }
  currentMathProblem = mathProblems[problemCounter - 1];
  problemNumberElement.textContent = `Problem: ${problemCounter} / ${TOTAL_MATH_PROBLEMS}`;
  mathProblemElement.textContent = `${currentMathProblem.expression} = ?`;
  answerInput.value = '';
  answerInput.focus();
}

function checkMathAnswer() {
  const userAnswer = parseInt(answerInput.value);
  if (!isNaN(userAnswer) && userAnswer === currentMathProblem.answer) {
    correctAnswers++;
    // Optional: Add visual feedback for correct answer (e.g., green flash)
  } else {
    // Optional: Add visual feedback for incorrect answer (e.g., red flash)
  }

  problemCounter++;
  showNextProblem();
}

// --- Game Flow ---

function startMathCountdown() {
    startScreen.style.display = 'block';
    gameArea.style.display = 'none';
    resultsScreen.style.display = 'none';
    answerInput.disabled = true; // Disable input during countdown
    submitAnswerButton.disabled = true;

    let count = 3;
    countdownElement.textContent = count;

    countdownInterval = setInterval(() => {
        count--;
        countdownElement.textContent = count > 0 ? count : 'Go!';
        if (count <= 0) {
        clearInterval(countdownInterval);
        startMathGame();
        }
    }, 1000);
}

function startMathGame() {
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    resultsScreen.style.display = 'none';
    answerInput.disabled = false;
    submitAnswerButton.disabled = false;

    // Reset game state
    problemCounter = 1;
    correctAnswers = 0;
    mathProblems = generateAllProblems(TOTAL_MATH_PROBLEMS);
    gameStartTime = Date.now();

    // Start timer
    if (gameTimerInterval) clearInterval(gameTimerInterval); // Clear previous timer if any
    gameTimerInterval = setInterval(updateGameTimer, 1000);
    updateGameTimer(); // Initial display 00:00

    showNextProblem(); // Show the first problem
}

function endMathGame() {
    stopMathGame(); // Stop timers

    gameArea.style.display = 'none';
    resultsScreen.style.display = 'block';

    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // Calculate XP
    let xpEarned = correctAnswers * 5; // Base XP
    let bonusXp = 0;
    if (elapsedTime < 120) bonusXp = 50;       // Under 2 min
    else if (elapsedTime < 150) bonusXp = 30;  // Under 2:30 min
    else if (elapsedTime < 180) bonusXp = 20;  // Under 3 min
    else if (elapsedTime < 240) bonusXp = 10;  // Under 4 min
    xpEarned += bonusXp;

    // Update UI
    finalTimeElement.textContent = timeString;
    correctCountElement.textContent = correctAnswers;
    xpEarnedElement.textContent = xpEarned;

    // Update User Data
    const userData = loadUserData();
    userData.xp += xpEarned;
    userData.stats.intelligence += Math.floor(correctAnswers / 10); // Increase intelligence based on performance

    // Level up check
    const xpForNextLevel = userData.level * 100;
    if (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
        // Add level up message?
    }

     // Save record
    userData.records.mathTime.push({
        date: new Date().toISOString().split('T')[0],
        time: elapsedTime,
        correct: correctAnswers
    });
    // Sort records by time (fastest first), keep top 5
    userData.records.mathTime.sort((a, b) => a.time - b.time);
    userData.records.mathTime = userData.records.mathTime.slice(0, 5);

    // Check for Math Wizard achievement
    let achievementUnlocked = false;
    if (correctAnswers >= TOTAL_MATH_PROBLEMS && elapsedTime < 240) { // All correct and under 4 minutes
        if (!userData.achievements.mathWizard) {
             userData.achievements.mathWizard = true;
             achievementUnlocked = true;
        }
    }
     // Show achievement message if unlocked
     achievementMsgElement.style.display = achievementUnlocked ? 'block' : 'none';
     if(achievementUnlocked) achievementMsgElement.textContent = "🏆 Achievement Unlocked: Math Wizard!";


    saveUserData(userData);

    // Display records
    displayMathRecords(userData.records.mathTime);
}

// Function to stop timers (can be called globally if needed)
function stopMathGame() {
    clearInterval(gameTimerInterval);
    clearInterval(countdownInterval);
    gameTimerInterval = null;
    countdownInterval = null;
     console.log("Math game timers stopped.");
}
window.stopMathGame = stopMathGame; // Make it accessible for navigation cancel

function displayMathRecords(records) {
    recordsListElement.innerHTML = ''; // Clear previous list
    if (records && records.length > 0) {
        records.forEach((record, index) => {
            const mins = Math.floor(record.time / 60);
            const secs = record.time % 60;
            const timeStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

            const recordItem = document.createElement('div');
            recordItem.className = 'record-item';
            recordItem.textContent = `${index + 1}. Time: ${timeStr} | Correct: ${record.correct}/${TOTAL_MATH_PROBLEMS} | Date: ${record.date || 'N/A'}`;
            recordsListElement.appendChild(recordItem);
        });
    } else {
        recordsListElement.innerHTML = '<p>No records yet. Play a game!</p>';
    }
}

// --- Event Listeners ---

submitAnswerButton.addEventListener('click', checkMathAnswer);
answerInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkMathAnswer();
    }
});

cancelMathStartButton.addEventListener('click', () => {
    clearInterval(countdownInterval); // Stop countdown if cancelling
    window.location.href = 'index.html';
});

cancelMathGameButton.addEventListener('click', () => {
    stopMathGame(); // Stop game timers
    window.location.href = 'index.html'; // Go back to menu
});

playAgainMathButton.addEventListener('click', () => {
    startMathCountdown(); // Restart the game flow
});

backToMenuMathButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize game on load
window.addEventListener('load', () => {
     startMathCountdown(); // Start the countdown when the page loads
});