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
function generateProblem() {
    // Update problem number display
    document.getElementById('problem-number').textContent = `Problem: ${problemNumber} / ${totalProblems}`;
    
    if (problemNumber > totalProblems) {
        endGame();
        return;
    }
    
    // Get the user's level to adjust difficulty
    const userData = loadUserData();
    const level = userData.level;
    
    let num1, num2, operator, answer;
    
    // Adjust difficulty based on level and progress
    const progress = problemNumber / totalProblems;
    
    if (level <= 3) {
        // Beginner: mainly addition and subtraction with smaller numbers
        if (Math.random() < 0.7) {
            // Addition
            num1 = Math.floor(Math.random() * (10 + level * 5));
            num2 = Math.floor(Math.random() * (10 + level * 5));
            operator = "+";
            answer = num1 + num2;
        } else {
            // Subtraction
            num2 = Math.floor(Math.random() * (10 + level * 3));
            num1 = num2 + Math.floor(Math.random() * (10 + level * 3)); // Ensure positive result
            operator = "-";
            answer = num1 - num2;
        }
    } else if (level <= 6) {
        // Intermediate: add multiplication, larger numbers
        const rand = Math.random();
        if (rand < 0.4) {
            // Addition
            num1 = Math.floor(Math.random() * (20 + level * 8));
            num2 = Math.floor(Math.random() * (20 + level * 8));
            operator = "+";
            answer = num1 + num2;
        } else if (rand < 0.7) {
            // Subtraction
            num2 = Math.floor(Math.random() * (15 + level * 5));
            num1 = num2 + Math.floor(Math.random() * (15 + level * 5));
            operator = "-";
            answer = num1 - num2;
        } else {
            // Multiplication
            num1 = Math.floor(Math.random() * (10 + level));
            num2 = Math.floor(Math.random() * 10);
            operator = "×";
            answer = num1 * num2;
        }
    } else {
        // Advanced: add division, challenging problems
        const rand = Math.random();
        if (rand < 0.3) {
            // Addition
            num1 = Math.floor(Math.random() * (50 + level * 10));
            num2 = Math.floor(Math.random() * (50 + level * 10));
            operator = "+";
            answer = num1 + num2;
        } else if (rand < 0.5) {
            // Subtraction
            num2 = Math.floor(Math.random() * (30 + level * 8));
            num1 = num2 + Math.floor(Math.random() * (30 + level * 8));
            operator = "-";
            answer = num1 - num2;
        } else if (rand < 0.8) {
            // Multiplication
            num1 = Math.floor(Math.random() * (12 + level));
            num2 = Math.floor(Math.random() * 12);
            operator = "×";
            answer = num1 * num2;
        } else {
            // Division (ensure clean division)
            num2 = Math.floor(Math.random() * 9) + 2; // Divisor between 2-10
            answer = Math.floor(Math.random() * 10) + 1; // Quotient between 1-10
            num1 = num2 * answer; // Calculate dividend
            operator = "÷";
        }
    }
    
    // Store the current problem
    currentProblem = {
        num1: num1,
        num2: num2,
        operator: operator,
        answer: answer
    };
    
    // Display the problem
    document.getElementById('problem-text').textContent = `${num1} ${operator} ${num2} = ?`;
    
    // Clear the input and focus it
    const answerInput = document.getElementById('answer-input');
    answerInput.value = '';
    answerInput.focus();
}

// Check the user's answer
function checkAnswer() {
    const userAnswer = document.getElementById('answer-input');
    const answer = parseInt(userAnswer.value.trim());
    
    if (isNaN(answer)) {
        // Invalid input
        highlightInputField(userAnswer, 'error');
        return;
    }
    
    if (answer === currentProblem.answer) {
        // Correct answer
        correctAnswers++;
        highlightInputField(userAnswer, 'correct');
        
        // Generate next problem after a short delay
        setTimeout(() => {
            userAnswer.value = '';
            userAnswer.classList.remove('correct-answer');
            problemNumber++;
            generateProblem();
        }, 500);
    } else {
        // Wrong answer
        highlightInputField(userAnswer, 'error');
    }
}

// Highlight input field based on answer correctness
function highlightInputField(inputElement, type) {
    // Remove any existing highlight classes
    inputElement.classList.remove('correct-answer', 'error-answer');
    
    // Add appropriate class based on answer correctness
    if (type === 'correct') {
        inputElement.classList.add('correct-answer');
    } else {
        inputElement.classList.add('error-answer');
        
        // Shake the input field for wrong answers
        inputElement.classList.add('shake-animation');
        setTimeout(() => {
            inputElement.classList.remove('shake-animation');
        }, 500);
    }
}

// Update the timer display
function updateTimer() {
    const now = new Date();
    const elapsedMilliseconds = now - startTime;
    const seconds = Math.floor(elapsedMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    // Format as MM:SS
    const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = timeString;
}

// Start the game
function startGame() {
    // Check if the user has lives
    const userData = loadUserData();
    if (userData.lives <= 0) {
        alert('You have no lives left! Come back tomorrow or earn more lives by completing challenges.');
        window.location.href = 'index.html';
        return;
    }
    
    // Use a life
    userData.lives--;
    userData.lastPlayed = new Date();
    saveUserData(userData);
    
    // Reset variables
    problemNumber = 1;
    correctAnswers = 0;
    problems = [];
    
    // Start the timer
    startTime = new Date();
    timer = setInterval(updateTimer, 1000);
    
    // Show the game UI
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Generate the first problem
    generateProblem();
}

// End the game
function endGame() {
    // Stop the timer
    clearInterval(timer);
    
    // Calculate total time
    const endTime = new Date();
    const elapsedMilliseconds = endTime - startTime;
    const seconds = Math.floor(elapsedMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    
    // Calculate XP based on time and correct answers
    let xpEarned = correctAnswers * 10; // Base XP per correct answer
    
    // Time bonus (if under 4 minutes)
    if (seconds < 120) { // Less than 2 minutes
        xpEarned *= 2; // Double XP
    } else if (seconds < 150) { // Under 2:30
        xpEarned = Math.floor(xpEarned * 1.75);
    } else if (seconds < 180) { // Under 3 minutes
        xpEarned = Math.floor(xpEarned * 1.5);
    } else if (seconds < 240) { // Under 4 minutes
        xpEarned = Math.floor(xpEarned * 1.25);
    }
    
    // Update user stats
    const userData = loadUserData();
    
    // Add XP
    userData.xp += xpEarned;
    
    // Check for level up
    let leveledUp = false;
    if (userData.xp >= userData.level * 100) {
        userData.xp -= userData.level * 100;
        userData.level++;
        leveledUp = true;
    }
    
    // Improve intelligence stat
    userData.stats.intelligence += Math.floor(correctAnswers / 10);
    userData.stats.intelligence = Math.min(userData.stats.intelligence, 100);
    
    // Save record time if it's a perfect score and better than previous record
    if (correctAnswers === totalProblems) {
        if (!userData.records) {
            userData.records = {};
        }
        if (!userData.records.mathTime || seconds < userData.records.mathTime) {
            userData.records.mathTime = seconds;
        }
    }
    
    // Save updated user data
    saveUserData(userData);
    
    // Display results
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    document.getElementById('time-result').textContent = `Time: ${timeString}`;
    document.getElementById('correct-result').textContent = `Correct answers: ${correctAnswers} / ${totalProblems}`;
    document.getElementById('xp-result').textContent = `XP earned: ${xpEarned}`;
    
    // Show records
    if (userData.records && userData.records.mathTime) {
        const recordMinutes = Math.floor(userData.records.mathTime / 60);
        const recordSeconds = userData.records.mathTime % 60;
        const recordTimeString = `${recordMinutes.toString().padStart(2, '0')}:${recordSeconds.toString().padStart(2, '0')}`;
        
        document.getElementById('record-time').textContent = `Best time: ${recordTimeString}`;
    }
    
    // Show level up message if applicable
    if (leveledUp) {
        document.getElementById('level-up-message').textContent = `🎉 Level Up! You're now level ${userData.level}!`;
        document.getElementById('level-up-message').style.display = 'block';
    }
    
    // Create battle buffs based on performance
    const battleBuffs = {
        damage: 1.0, // Default multiplier
        health: 1.0,
        critChance: 0.0
    };
    
    if (correctAnswers >= totalProblems * 0.9) { // At least 90% correct
        battleBuffs.damage = 1.5; // 50% more damage
        battleBuffs.health = 1.3; // 30% more health
        battleBuffs.critChance = 0.2; // 20% crit chance
    } else if (correctAnswers >= totalProblems * 0.7) { // At least 70% correct
        battleBuffs.damage = 1.3;
        battleBuffs.health = 1.2;
        battleBuffs.critChance = 0.1;
    } else if (correctAnswers >= totalProblems * 0.5) { // At least 50% correct
        battleBuffs.damage = 1.2;
        battleBuffs.health = 1.1;
        battleBuffs.critChance = 0.05;
    }
    
    // Save battle buffs
    localStorage.setItem('battleBuffs', JSON.stringify(battleBuffs));
}

// Return to main menu
function returnToMenu() {
    window.location.href = 'index.html';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Return button
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', returnToMenu);
    }
    
    // Answer input (allow pressing Enter)
    const answerInput = document.getElementById('answer-input');
    if (answerInput) {
        answerInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkAnswer();
            }
        });
    }
    
    // Submit button
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
        submitButton.addEventListener('click', checkAnswer);
    }
    
    // Initial theme setup
    const savedTheme = localStorage.getItem('brain-training-theme') || 'colorful-theme';
    document.body.classList.add(savedTheme);
});