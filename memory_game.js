// Word pool (unchanged)
const wordPool = [
    "Apple", "Book", "Cat", "Door", "Elephant", "Fish", "Guitar", "House", "Ice", "Jacket",
    "Key", "Lion", "Moon", "Nature", "Ocean", "Planet", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violin", "Water", "Xylophone", "Yellow", "Zebra", "Air", "Bird", "Cloud", "Diamond",
    "Earth", "Flower", "Gold", "Heart", "Island", "Jungle", "King", "Lamp", "Mountain", "Night",
    "Owl", "Paper", "Quiet", "Road", "Star", "Time", "Universe", "Village", "Wind", "Box",
    "Year", "Zoo", "Crystal", "Dream", "Energy", "Fire", "Galaxy", "Harmony", "Adventure", "Balance",
    "Castle", "Dragon", "Echo", "Forest", "Gravity", "Horizon", "Imagine", "Journey", "Knowledge", "Legend" // Added more words
];
const WORDS_TO_MEMORIZE = 30;
const MEMORIZE_TIME_SECONDS = 120; // 2 minutes

// DOM Elements
const memorizePhase = document.getElementById('memorize-phase');
const recallPhase = document.getElementById('recall-phase');
const resultsScreen = document.getElementById('results');
const timerElement = document.getElementById('timer');
const wordContainer = document.getElementById('word-container');
const recallInput = document.getElementById('recall-input');
const submitRecallButton = document.getElementById('submit-recall');
const correctCountElement = document.getElementById('correct-count');
const xpEarnedElement = document.getElementById('xp-earned');
const achievementMsgElement = document.getElementById('achievement-unlocked-msg'); // Results achievement message

// Buttons
const cancelMemoryButton = document.getElementById('cancel-memory');
const cancelRecallButton = document.getElementById('cancel-recall');
const playAgainMemoryButton = document.getElementById('play-again-memory');
const backToMenuMemoryButton = document.getElementById('back-to-menu-memory');

// Game State Variables
let selectedWords = [];
let memorizeTimerInterval;
let timeLeft = MEMORIZE_TIME_SECONDS;

// User Data Handling (Simplified)
function loadUserData() {
     const defaultUserData = { level: 1, xp: 0, stats: { intelligence: 10 }, achievements: { memoryMaster: false } };
     const savedData = localStorage.getItem('brainTrainingUserData');
     if (savedData) {
         try {
            const parsed = JSON.parse(savedData);
             parsed.achievements = parsed.achievements || { memoryMaster: false };
             if (parsed.achievements.memoryMaster === undefined) parsed.achievements.memoryMaster = false;
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

function selectRandomWords(count) {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function updateMemorizeTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    if (timeLeft <= 0) {
        goToRecallPhase();
    } else {
        timeLeft--;
    }
}

function displayWordsToMemorize() {
    selectedWords = selectRandomWords(WORDS_TO_MEMORIZE);
    wordContainer.innerHTML = ''; // Clear previous words
    selectedWords.forEach(word => {
        const wordBox = document.createElement('div');
        wordBox.className = 'word-box';
        wordBox.textContent = word;
        wordContainer.appendChild(wordBox);
    });
}

function checkRecalledWords() {
    const recalledWordsRaw = recallInput.value.toLowerCase().trim();
    // Split by space, comma, or newline, and filter out empty strings
    const recalledWords = recalledWordsRaw.split(/[\s,\n]+/).filter(word => word.length > 0);
    const uniqueRecalledWords = [...new Set(recalledWords)]; // Count unique words only

    let correctCount = 0;
    const selectedWordsLower = selectedWords.map(word => word.toLowerCase());

    uniqueRecalledWords.forEach(recalledWord => {
        if (selectedWordsLower.includes(recalledWord)) {
            correctCount++;
        }
    });

    return correctCount;
}

// --- Game Flow Control ---

function startMemorizePhase() {
    memorizePhase.style.display = 'block';
    recallPhase.style.display = 'none';
    resultsScreen.style.display = 'none';
    recallInput.value = ''; // Clear recall input for new game
    achievementMsgElement.style.display = 'none'; // Hide achievement message

    displayWordsToMemorize();
    timeLeft = MEMORIZE_TIME_SECONDS;
    updateMemorizeTimer(); // Initial display

    if (memorizeTimerInterval) clearInterval(memorizeTimerInterval); // Clear previous timer
    memorizeTimerInterval = setInterval(updateMemorizeTimer, 1000);
}

function goToRecallPhase() {
    clearInterval(memorizeTimerInterval);
    memorizeTimerInterval = null;

    memorizePhase.style.display = 'none';
    recallPhase.style.display = 'block';
    resultsScreen.style.display = 'none';
    recallInput.focus(); // Focus on the input area
}

function showMemoryResults() {
    recallPhase.style.display = 'none';
    resultsScreen.style.display = 'block';

    const correctCount = checkRecalledWords();
    const xpEarned = correctCount * 5; // 5 XP per correct word

    correctCountElement.textContent = correctCount;
    xpEarnedElement.textContent = xpEarned;

    // Update User Data
    const userData = loadUserData();
    userData.xp += xpEarned;
    userData.stats.intelligence += Math.floor(correctCount / 3); // Increase intelligence

     // Level up check
    const xpForNextLevel = userData.level * 100;
    if (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
        // Add level up message?
    }

    // Check for Memory Master achievement
    let achievementUnlocked = false;
    if (correctCount >= WORDS_TO_MEMORIZE) { // Got all words
         if (!userData.achievements.memoryMaster) {
             userData.achievements.memoryMaster = true;
             achievementUnlocked = true;
         }
    }
     // Show achievement message if unlocked
     achievementMsgElement.style.display = achievementUnlocked ? 'block' : 'none';
     if(achievementUnlocked) achievementMsgElement.textContent = "🏆 Achievement Unlocked: Memory Master!";

    saveUserData(userData);
}

// Function to stop timer (can be called globally)
function stopMemoryGame() {
    clearInterval(memorizeTimerInterval);
    memorizeTimerInterval = null;
     console.log("Memory game timer stopped.");
}
window.stopMemoryGame = stopMemoryGame; // Make accessible

// --- Event Listeners ---

submitRecallButton.addEventListener('click', showMemoryResults);

cancelMemoryButton.addEventListener('click', () => {
    stopMemoryGame();
    window.location.href = 'index.html';
});

cancelRecallButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // No timer running here
});

playAgainMemoryButton.addEventListener('click', () => {
    startMemorizePhase(); // Restart the game
});

backToMenuMemoryButton.addEventListener('click', () => {
    window.location.href = 'index.html';
});


// Initialize game on load
window.addEventListener('load', () => {
     startMemorizePhase();
});