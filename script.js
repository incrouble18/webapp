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
    return userData;
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Theme Management
function setTheme(themeName) {
    // Remove all theme classes
    document.body.classList.remove('colorful-theme', 'light-theme', 'dark-theme');
    // Add the selected theme class
    document.body.classList.add(themeName);
    // Save the theme preference to localStorage
    localStorage.setItem('brain-training-theme', themeName);
}

// Load the saved theme or use default
function loadTheme() {
    const savedTheme = localStorage.getItem('brain-training-theme') || 'colorful-theme';
    setTheme(savedTheme);
}

// Show modal with message
function showModal(message) {
    modalMessage.textContent = message;
    modal.style.display = "block";
}

// Close modal when X is clicked
if (closeModal) {
    closeModal.onclick = function() {
        modal.style.display = "none";
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Add XP to user and handle level ups
function addXP(amount) {
    userData = loadUserData();
    
    userData.xp += amount;
    
    // Check for level up (100 XP per level)
    if (userData.xp >= userData.level * 100) {
        userData.xp -= userData.level * 100;
        userData.level++;
        showModal(`🎉 Level Up! You're now level ${userData.level}!`);
    }
    
    saveUserData();
    return userData;
}

// Update stats
function updateStat(statName, amount) {
    userData = loadUserData();
    
    if (userData.stats[statName] !== undefined) {
        userData.stats[statName] += amount;
        // Ensure stat stays within limits
        userData.stats[statName] = Math.max(1, Math.min(100, userData.stats[statName]));
    }
    
    saveUserData();
    return userData;
}

// Check and restore lives
function checkLives() {
    userData = loadUserData();
    
    // Get current time and last played time
    const now = new Date();
    const lastPlayed = new Date(userData.lastPlayed);
    
    // If it's a new day, restore lives
    if (now.toDateString() !== lastPlayed.toDateString()) {
        userData.lives = 5; // Reset to max lives
        userData.lastPlayed = now;
        saveUserData();
    }
    
    return userData.lives;
}

// Use a life
function useLife() {
    userData = loadUserData();
    
    if (userData.lives > 0) {
        userData.lives--;
        userData.lastPlayed = new Date();
        saveUserData();
        return true;
    }
    
    return false;
}

// Add item to inventory
function addToInventory(item) {
    userData = loadUserData();
    
    userData.inventory.push(item);
    saveUserData();
    
    return userData.inventory;
}

// Initialize app when loaded
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    loadTheme();
    
    // Check if lives need to be restored
    checkLives();
});