// Initialize Telegram Web App 
const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const gameInstructions = document.getElementById("game-instructions");
const memoryGameArea = document.getElementById("memory-game-area");
const recallArea = document.getElementById("recall-area");
const resultsArea = document.getElementById("results-area");
const startButton = document.getElementById("start-memory-game");
const wordContainer = document.getElementById("word-container");
const timeLeftSpan = document.getElementById("time-left");
const recalledWordsTextarea = document.getElementById("recalled-words");
const submitRecalledButton = document.getElementById("submit-recalled");
const correctCountSpan = document.getElementById("correct-count");
const xpGainedSpan = document.getElementById("xp-gained");
const backToHomeButton = document.getElementById("back-to-home");

// Game variables 
let countdown;
let timeLeft = 120; // 2 minutes in seconds
let wordsList = [];
let correctWords = 0;
let xpGained = 0;

// List of 50 words to choose from 
const allPossibleWords = [
    "Apple", "Book", "Cat", "Dog", "Elephant", "Flower", "Guitar", "House", "Ice", "Jacket",
    "Key", "Lamp", "Mountain", "Night", "Ocean", "Piano", "Queen", "River", "Sun", "Tree",
    "Umbrella", "Violin", "Water", "Xylophone", "Yellow", "Zebra", "Airplane", "Balloon", "Cloud", "Door",
    "Eagle", "Fire", "Garden", "Hat", "Island", "Jungle", "Kangaroo", "Lion", "Moon", "Nest",
    "Orange", "Pencil", "Quiet", "Rainbow", "Star", "Tiger", "Unicorn", "Vase", "Wind", "Yogurt"
];

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

// Start the memory game 
function startMemoryGame() {
    gameInstructions.style.display = "none";
    memoryGameArea.style.display = "block";

    // Reset game variables
    timeLeft = 120;
    wordsList = [];

    // Select 30 random words 
    const shuffledWords = [...allPossibleWords].sort(() => 0.5 - Math.random());
    wordsList = shuffledWords.slice(0, 30);

    // Display words in the grid 
    wordContainer.innerHTML = "";
    wordsList.forEach(word => {
        const wordDiv = document.createElement("div");
        wordDiv.className = "word-item";
        wordDiv.textContent = word;
        wordContainer.appendChild(wordDiv);
    });

    // Start countdown
    countdown = setInterval(updateTimer, 1000);
    updateTimer();
}

// Update timer display and check if time is up 
function updateTimer() {
    timeLeftSpan.textContent = timeLeft;

    if (timeLeft <= 0) {
        clearInterval(countdown);
        memoryGameArea.style.display = "none";
        recallArea.style.display = "block";
    } else {
        timeLeft--;
    }
}

// Check the recalled words and calculate score 
function checkRecalledWords() {
    const recalledText = recalledWordsTextarea.value.trim();
    const recalledWordsList = recalledText.split(/\n|,|\s/).filter(word => word.trim() !== "");

    // Convert to lowercase for case-insensitive comparison 
    const normalizedWordsList = wordsList.map(word => word.toLowerCase());
    const normalizedRecalledList = recalledWordsList.map(word => word.toLowerCase());

    // Count correct words
    correctWords = 0;
    normalizedRecalledList.forEach(word => {
        if (normalizedWordsList.includes(word)) {
            correctWords++;
        }
    });

    // Calculate XP gained (base 10 XP per correct word) 
    xpGained = correctWords * 10;

    // Update user stats 
    userData.xp += xpGained;
    userData.stats.intelligence += Math.ceil(correctWords / 5); // Boost intelligence

    // Level up check (simple formula: 100 XP per level) 
    const newLevel = Math.floor(userData.xp / 100) + 1;
    if (newLevel > userData.level) {
        userData.level = newLevel;
        userData.lives++; // Bonus life on level up
    }

    saveUserData();

    // Show results
    correctCountSpan.textContent = correctWords;
    xpGainedSpan.textContent = xpGained;
    recallArea.style.display = "none";
    resultsArea.style.display = "block";
}

// Event Listeners
startButton.addEventListener("click", startMemoryGame);
submitRecalledButton.addEventListener("click", checkRecalledWords);
backToHomeButton.addEventListener("click", () => {
    window.location.href = "index.html";
});

// Load theme preference 
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    }
}

// Initialize the game
window.onload = function() {
    loadUserData();
    loadThemePreference();
};