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
            inventory: []
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Select random words from the pool
function selectRandomWords(count) {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Update the timer display
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    if (timeLeft <= 0) {
        clearInterval(timer);
        showRecallPhase();
    } else {
        timeLeft--;
    }
}

// Display words in the container
function displayWords() {
    selectedWords = selectRandomWords(30);
    const container = document.getElementById('word-container');
    container.innerHTML = '';
    
    selectedWords.forEach(word => {
        const wordBox = document.createElement('div');
        wordBox.className = 'word-box';
        wordBox.textContent = word;
        container.appendChild(wordBox);
    });
}

// Show recall phase
function showRecallPhase() {
    document.getElementById('memorize-phase').style.display = 'none';
    document.getElementById('recall-phase').style.display = 'block';
}

// Check results
function checkResults() {
    const recallInput = document.getElementById('recall-input').value;
    const recalledWords = recallInput.toLowerCase().split(/[\s,]+/).filter(word => word.trim() !== '');
    
    let correctCount = 0;
    const selectedWordsLower = selectedWords.map(word => word.toLowerCase());
    
    recalledWords.forEach(word => {
        if (selectedWordsLower.includes(word)) {
            correctCount++;
        }
    });
    
    // Calculate XP earned (5 XP per correct word)
    const xpEarned = correctCount * 5;
    
    // Update user data
    const userData = loadUserData();
    userData.xp += xpEarned;
    userData.stats.intelligence += Math.max(1, Math.floor(correctCount / 5)); // Increase intelligence
    
    // Level up if enough XP
    const xpForNextLevel = userData.level * 100;
    if (userData.xp >= xpForNextLevel) {
        userData.level++;
        userData.xp -= xpForNextLevel;
    }
    
    // Check for Memory Master achievement
    if (correctCount >= 16) {
        if (!userData.achievements) {
            userData.achievements = {};
        }
        userData.achievements.memoryMaster = true;
    }
    
    saveUserData(userData);
    
    // Show results
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('xp-earned').textContent = xpEarned;
    document.getElementById('recall-phase').style.display = 'none';
    document.getElementById('results').style.display = 'block';
}

// Initialize the game
window.onload = function() {
    displayWords();
    timer = setInterval(updateTimer, 1000);
    
    // Add event listener for submit button
    document.getElementById('submit-recall').addEventListener('click', checkResults);
    
    // Add event listener for back buttons
    document.getElementById('back-to-menu').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('cancel-memory').addEventListener('click', function() {
        clearInterval(timer);
        window.location.href = 'index.html';
    });
    
    document.getElementById('cancel-recall').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
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