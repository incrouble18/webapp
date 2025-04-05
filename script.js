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
        languages: 3
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
        userData.lives = Math.max(0, userData.lives - daysSinceLastPlayed);
        if (userData.lives === 0) {
            showModal("⚠️ You've lost all your lives by not playing for " + daysSinceLastPlayed + " days! Complete challenges to earn lives.");
        }
    }
    
    userData.lastPlayed = now;
    saveUserData();
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
            showModal("🎮 You're already in the Game World!");
        } else if (action === "room") {
            showModal("🏠 Room customization is under development. You'll be able to decorate your space for bonuses!");
        } else if (action === "stats") {
            // Generate stats display
            let statsMessage = `📊 YOUR STATS\n\nLevel: ${userData.level}\nXP: ${userData.xp}\nLives: ${userData.lives}\n\nAttributes:\n`;
            for (const [key, value] of Object.entries(userData.stats)) {
                statsMessage += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
            }
            showModal(statsMessage);
        }
    });
});

// Handle START buttons
document.querySelectorAll(".start-button").forEach(button => {
    button.addEventListener("click", function() {
        const gameType = this.getAttribute("data-game");
        if (gameType === "memory") {
            window.location.href = "memory.html";
        } else if (gameType === "math") {
            window.location.href = "math.html";
        }
    });
});

// Theme switcher functionality
document.getElementById("light-theme").addEventListener("click", function() {
    document.body.className = "light-theme";
    localStorage.setItem("preferred-theme", "light");
});

document.getElementById("dark-theme").addEventListener("click", function() {
    document.body.className = "dark-theme";
    localStorage.setItem("preferred-theme", "dark");
});

document.getElementById("colorful-theme").addEventListener("click", function() {
    document.body.className = "colorful-theme";
    localStorage.setItem("preferred-theme", "colorful");
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
        