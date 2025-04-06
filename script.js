// Initialize Telegram Web App compatibility (can run without Telegram too)
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const closeModal = document.querySelector(".close");

// User data storage - would normally use a database
let userData = {
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

// Load user data from localStorage if it exists
function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Initialize the app
function initApp() {
    loadUserData();
    
    // Check if it's been more than 24 hours since last played
    const now = new Date();
    const lastPlayed = new Date(userData.lastPlayed);
    const daysSinceLastPlayed = Math.floor((now - lastPlayed) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastPlayed > 0) {
        userData.lives = Math.min(5, userData.lives + 1); // Regain 1 life per day, max 5
        userData.lastPlayed = now;
        saveUserData();
    }
}

// Show modal dialog
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "block";
}

// Close modal when clicking on X
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Handle icon clicks
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
        const action = this.getAttribute("data-action");
        if (action === "inventory") {
            showModal("🎒 Inventory is under development. Here you'll manage your items, artifacts, and collectibles.");
        } else if (action === "games") {
            window.location.href = "index.html";
        } else if (action === "room") {
            window.location.href = "room.html";
        } else if (action === "stats") {
            window.location.href = "stats.html";
        } else if (action === "battle") {
            window.location.href = "battle.html";
        }
    });
});

// Handle battle icon click
document.querySelector(".battle-icon").addEventListener("click", function() {
    window.location.href = "battle.html";
});

// Handle START buttons
document.querySelectorAll(".start-button").forEach(button => {
    button.addEventListener("click", function() {
        const gameType = this.getAttribute("data-game");
        if (gameType === "memory") {
            window.location.href = "memory_intro.html";
        } else if (gameType === "math") {
            window.location.href = "math_intro.html";
        }
    });
});

// Theme switcher functionality
const themeButtons = document.querySelectorAll(".theme-switcher button");
themeButtons.forEach(button => {
    button.addEventListener("click", function() {
        const themeClass = this.id;
        document.body.className = themeClass;
        localStorage.setItem("preferred-theme", themeClass.replace('-theme', ''));
    });
});

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        // Default to colorful theme if none is set
        document.body.className = "colorful-theme";
    }
}

// Initialize the app when the page loads
window.onload = function() {
    initApp();
    loadThemePreference();
};