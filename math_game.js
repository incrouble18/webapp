// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.expand();
}

// Game variables
let problemNumber = 1;
let correctAnswers = 0;
let startTime;
let timer;
let problems = [];
let currentProblem;
const totalProblems = 87; // Set to 87 problems

// Load user data from localStorage
function loadUserData() {
  const savedData = localStorage.getItem('brainTrainingUserData');
  if (savedData) {
    return JSON.parse(savedData);
  } else {
    // Default user data
    return {
      level: 1,
      xp: 0,
      lives: 5,
      lastPlayed: new Date(),
      stats: {
        intelligence: 10,
        sports: 5,
        languages: 3,
        energy: 8,
        creativity: 7,
        health: 10
      },
      records: {
        mathTime: []
      },
      inventory: []
    };
  }
}

// Save user data to localStorage
function saveUserData(userData) {
  localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Generate a random math problem
function generateMathProblem() {
  const operations = ['+', '-', '*', ':'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let num1, num2, answer;

  switch (operation) {
    case '+':
      num1 = Math.floor(Math.random() * 50) + 1;
      num2 = Math.floor(Math.random() * 50) + 1;
      answer = num1 + num2;
      break;
    case '-':
      num1 = Math.floor(Math.random() * 50) + 30; // Ensure num1 is bigger
      num2 = Math.floor(Math.random() * 30) + 1;
      answer = num1 - num2;
      break;
    case '*':
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      break;
    case ':':
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = Math.floor(Math.random() * 10) + 1;
      num1 = num2 * answer; // Ensure division results in integer
      break;
  }

  return {
    expression: `${num1} ${operation} ${num2}`,
    answer: answer
  };
}

// Generate all problems at the start
function generateProblems(count) {
  const generatedProblems = [];
  // Ensure balanced distribution of operation types
  const operationsPerType = Math.floor(count / 4);
  
  // Generate addition problems
  for (let i = 0; i < operationsPerType; i++) {
    const num1 = Math.floor(Math.random() * 50) + 1;
    const num2 = Math.floor(Math.random() * 50) + 1;
    generatedProblems.push({
      expression: `${num1} + ${num2}`,
      answer: num1 + num2
    });
  }
  
  // Generate subtraction problems
  for (let i = 0; i < operationsPerType; i++) {
    const num1 = Math.floor(Math.random() * 50) + 30;
    const num2 = Math.floor(Math.random() * 30) + 1;
    generatedProblems.push({
      expression: `${num1} - ${num2}`,
      answer: num1 - num2
    });
  }
  
  // Generate multiplication problems
  for (let i = 0; i < operationsPerType; i++) {
    const num1 = Math.floor(Math.random() * 12) + 1;
    const num2 = Math.floor(Math.random() * 12) + 1;
    generatedProblems.push({
      expression: `${num1} × ${num2}`,
      answer: num1 * num2
    });
  }
  
  // Generate division problems
  for (let i = 0; i < operationsPerType; i++) {
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = Math.floor(Math.random() * 10) + 1;
    const num1 = num2 * answer;
    generatedProblems.push({
      expression: `${num1} : ${num2}`,
      answer: answer
    });
  }
  
  // Add remaining problems to reach the target count
  const remaining = count - (operationsPerType * 4);
  for (let i = 0; i < remaining; i++) {
    generatedProblems.push(generateMathProblem());
  }
  
  // Shuffle the problems
  return generatedProblems.sort(() => Math.random() - 0.5);
}

// Update the timer display
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  document.getElementById('timer').textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Show current problem
function showProblem() {
  currentProblem = problems[problemNumber - 1];
  document.getElementById('problem-number').textContent = `Problem: ${problemNumber} / ${totalProblems}`;
  document.getElementById('math-problem').textContent = currentProblem.expression + ' = ?';
  document.getElementById('answer-input').value = '';
  document.getElementById('answer-input').focus();
}

// Check the answer
function checkAnswer() {
  const userAnswer = parseInt(document.getElementById('answer-input').value);
  if (!isNaN(userAnswer) && userAnswer === currentProblem.answer) {
    correctAnswers++;
  }

  if (problemNumber < totalProblems) {
    problemNumber++;
    showProblem();
  } else {
    endGame();
  }
}

// Start the countdown
function startCountdown() {
  let count = 3;
  const countdownElement = document.getElementById('countdown');
  countdownElement.textContent = count;
  
  const countInterval = setInterval(() => {
    count--;
    countdownElement.textContent = count;
    
    if (count <= 0) {
      clearInterval(countInterval);
      startGame();
    }
  }, 1000);
}

// Start the game
function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('game-area').style.display = 'block';
  
  problems = generateProblems(totalProblems);
  startTime = Date.now();
  timer = setInterval(updateTimer, 1000);
  
  showProblem();
}

// End the game
function endGame() {
  clearInterval(timer);
  
  // Calculate elapsed time
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeString = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  
  // Calculate XP based on time and correct answers
  let xpEarned = correctAnswers * 5; // Base XP
  
  // Bonus XP for fast completion
  if (elapsedTime < 120) { // Less than 2 minutes
    xpEarned += 50;
  } else if (elapsedTime < 150) { // Less than 2:30
    xpEarned += 30;
  } else if (elapsedTime < 180) { // Less than 3 minutes
    xpEarned += 20;
  } else if (elapsedTime < 240) { // Less than 4 minutes
    xpEarned += 10;
  }
  
  // Update user data
  const userData = loadUserData();
  userData.xp += xpEarned;
  
  // Level up if enough XP
  const xpForNextLevel = userData.level * 100;
  if (userData.xp >= xpForNextLevel) {
    userData.level++;
    userData.xp -= xpForNextLevel;
  }
  
  // Update records
  if (!userData.records) {
    userData.records = { mathTime: [] };
  }
  
  // Add new record
  userData.records.mathTime.push({
    date: new Date().toISOString().split('T')[0],
    time: elapsedTime,
    correct: correctAnswers
  });
  
  // Sort records by time (fastest first)
  userData.records.mathTime.sort((a, b) => a.time - b.time);
  
  // Keep only top 5 records
  if (userData.records.mathTime.length > 5) {
    userData.records.mathTime = userData.records.mathTime.slice(0, 5);
  }
  
  // Check for Math Wizard achievement
  if (correctAnswers >= totalProblems && elapsedTime < 240) {
    if (!userData.achievements) {
      userData.achievements = {};
    }
    userData.achievements.mathWizard = true;
  }
  
  saveUserData(userData);
  
  // Show results
  document.getElementById('final-time').textContent = timeString;
  document.getElementById('correct-count').textContent = correctAnswers;
  document.getElementById('xp-earned').textContent = xpEarned;
  
  // Display records
  const recordsList = document.getElementById('records-list');
  recordsList.innerHTML = '';
  
  if (userData.records.mathTime.length > 0) {
    userData.records.mathTime.forEach((record, index) => {
      const mins = Math.floor(record.time / 60);
      const secs = record.time % 60;
      const timeStr = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
      
      const recordItem = document.createElement('div');
      recordItem.className = 'record-item';
      recordItem.textContent = `${index + 1}. Time: ${timeStr} - Correct: ${record.correct}/${totalProblems} - ${record.date}`;
      recordsList.appendChild(recordItem);
    });
  } else {
    recordsList.textContent = 'No records yet!';
  }
  
  document.getElementById('game-area').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

// Handle enter key press on input
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    checkAnswer();
  }
}

// Initialize when the page loads
window.onload = function() {
  // Add event listeners
  document.getElementById('submit-answer').addEventListener('click', checkAnswer);
  document.getElementById('answer-input').addEventListener('keypress', handleKeyPress);
  document.getElementById('back-to-menu').addEventListener('click', function() {
    window.location.href = 'index.html';
  });
  document.getElementById('cancel-math').addEventListener('click', function() {
    window.location.href = 'index.html';
  });
  document.getElementById('cancel').addEventListener('click', function() {
    clearInterval(timer);
    window.location.href = 'index.html';
  });
  
  // Start countdown
  startCountdown();
  
  // Navigation
  document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
      const action = this.getAttribute("data-action");
      if (action === "games") {
        window.location.href = "index.html";
      } else if (action === "stats") {
        window.location.href = "stats.html";
      } else if (action === "room") {
        window.location.href = "room.html";
      } else if (action === "inventory") {
        alert("Inventory is coming soon! 🎒");
      } else if (action === "battle") {
        window.location.href = "battle.html";
      }
    });
  });
};