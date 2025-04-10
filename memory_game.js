// Word lists for memory game - can be expanded
const wordPool = [
    "Apple", "Book", "Cat", "Door", "Elephant", "Fish", "Guitar", "House", "Ice", "Jacket",
    "Key", "Lion", "Moon", "Nature", "Ocean", "Planet", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violin", "Water", "Xylophone", "Yellow", "Zebra", "Air", "Bird", "Cloud", "Diamond",
    "Earth", "Flower", "Gold", "Heart", "Island", "Jungle", "King", "Lamp", "Mountain", "Night",
    "Owl", "Paper", "Quiet", "Road", "Star", "Time", "Universe", "Village", "Wind", "Box",
    "Year", "Zoo", "Crystal", "Dream", "Energy", "Fire", "Galaxy", "Harmony"
];

let selectedWords = [];
let timer;
let timeLeft = 120; // 2 minutes in seconds

// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

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
            records: {},
            inventory: []
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Start memory game
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
    
    // Show memorization screen
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('memorize-screen').style.display = 'block';
    
    // Generate random words
    generateWords();
    
    // Display words
    const wordsContainer = document.getElementById('words-container');
    wordsContainer.innerHTML = '';
    
    selectedWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.classList.add('memory-word');
        wordElement.textContent = word;
        wordsContainer.appendChild(wordElement);
    });
    
    // Start timer
    timeLeft = 120;
    updateTimerDisplay();
    timer = setInterval(updateTimer, 1000);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer-display').textContent = timeString;
}

// Update timer every second
function updateTimer() {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        showRecallScreen();
    }
}

// Show the recall screen
function showRecallScreen() {
    document.getElementById('memorize-screen').style.display = 'none';
    document.getElementById('recall-screen').style.display = 'block';
    
    // Focus on the input field
    document.getElementById('recall-input').focus();
}

// Generate random words for memorization
function generateWords() {
    // Get user level to determine number of words
    const userData = loadUserData();
    const level = userData.level;
    
    // Base number of words (16) plus bonus based on level
    const numWords = 16 + Math.min(14, Math.floor(level / 2)); // Max 30 words
    
    // Shuffle the word pool and pick the first numWords
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    selectedWords = shuffled.slice(0, numWords);
}

// Check recalled words
function checkRecall() {
    const recallInput = document.getElementById('recall-input').value.trim();
    
    // Split input by spaces, commas, or newlines
    const userWords = recallInput.split(/[\s,\n]+/).filter(word => word.length > 0);
    
    // Count correct words
    let correctCount = 0;
    const correctWords = [];
    
    userWords.forEach(word => {
        // Case-insensitive comparison
        const normalizedWord = word.toLowerCase();
        const matchedWord = selectedWords.find(w => w.toLowerCase() === normalizedWord);
        
        if (matchedWord && !correctWords.includes(matchedWord.toLowerCase())) {
            correctCount++;
            correctWords.push(matchedWord.toLowerCase());
        }
    });
    
    // Calculate XP based on performance
    const totalWords = selectedWords.length;
    let xpEarned = Math.floor((correctCount / totalWords) * 200); // Base XP
    
    // Perfect score bonus
    if (correctCount === totalWords) {
        xpEarned += 100; // Bonus for remembering all words
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
    userData.stats.intelligence += Math.floor(correctCount / 5);
    userData.stats.intelligence = Math.min(userData.stats.intelligence, 100);
    
    // Save records
    if (!userData.records) {
        userData.records = {};
    }
    
    // Update memory record if better than previous
    if (!userData.records.memoryWords || correctCount > userData.records.memoryWords) {
        userData.records.memoryWords = correctCount;
    }
    
    // Save updated user data
    saveUserData(userData);
    
    // Display results
    document.getElementById('recall-screen').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    document.getElementById('correct-count').textContent = `Words correctly remembered: ${correctCount} / ${totalWords}`;
    document.getElementById('xp-earned').textContent = `XP earned: ${xpEarned}`;
    
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
    
    const percentage = correctCount / totalWords;
    
    if (percentage >= 0.9) { // At least 90% correct
        battleBuffs.damage = 1.5; // 50% more damage
        battleBuffs.health = 1.3; // 30% more health
        battleBuffs.critChance = 0.2; // 20% crit chance
    } else if (percentage >= 0.7) { // At least 70% correct
        battleBuffs.damage = 1.3;
        battleBuffs.health = 1.2;
        battleBuffs.critChance = 0.1;
    } else if (percentage >= 0.5) { // At least 50% correct
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
    
    // Check button
    const checkButton = document.getElementById('check-button');
    if (checkButton) {
        checkButton.addEventListener('click', checkRecall);
    }
    
    // Return button
    const returnButton = document.getElementById('return-button');
    if (returnButton) {
        returnButton.addEventListener('click', returnToMenu);
    }
    
    // Allow pressing Enter in recall input
    const recallInput = document.getElementById('recall-input');
    if (recallInput) {
        recallInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                checkRecall();
            }
        });
    }
    
    // Initial theme setup
    const savedTheme = localStorage.getItem('brain-training-theme') || 'colorful-theme';
    document.body.classList.add(savedTheme);
});