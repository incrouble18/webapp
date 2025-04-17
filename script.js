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
  lastPlayed: new Date().toISOString(), // Store as ISO string for consistency
  stats: {
    intelligence: 10,
    sports: 5,
    languages: 3,
    energy: 8,
    creativity: 7,
    health: 10
  },
  // Removed inventory and room/pet data from default
  equipment: {
      skin: 'light',
      outfit: 'casual',
      headgear: 'none',
      weapon: 'none'
  },
  achievements: {
      memoryMaster: false,
      mathWizard: false,
      dailyStreak: false
  },
  records: { // Ensure records object exists
      mathTime: []
  }
};

// Load user data from localStorage if it exists
function loadUserData() {
  const savedData = localStorage.getItem('brainTrainingUserData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      // Merge saved data with default structure to ensure all keys exist
      userData = { ...userData, ...parsedData };
      // Ensure nested objects exist
      userData.stats = { ...userData.stats, ...(parsedData.stats || {}) };
      userData.equipment = { ...userData.equipment, ...(parsedData.equipment || {}) };
      userData.achievements = { ...userData.achievements, ...(parsedData.achievements || {}) };
      userData.records = { ...userData.records, ...(parsedData.records || {}) };
      // Ensure mathTime array exists
      if (!userData.records.mathTime) {
          userData.records.mathTime = [];
      }

    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
      // Use default data if parsing fails
      saveUserData(); // Save the default structure
    }
  } else {
      // Save default data if nothing is in localStorage
      saveUserData();
  }
}

// Save user data to localStorage
function saveUserData() {
    try {
        localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
    } catch (e) {
        console.error("Error saving user data to localStorage:", e);
    }
}

// Initialize the app
function initApp() {
  loadUserData();

  // Check for daily life regain
  const now = new Date();
  const lastPlayed = new Date(userData.lastPlayed); // Assuming lastPlayed is stored
  const hoursSinceLastPlayed = Math.floor((now - lastPlayed) / (1000 * 60 * 60));

  // Give a life back if it's been at least 24 hours
  if (hoursSinceLastPlayed >= 24) {
    if (userData.lives < 5) {
      userData.lives += 1; // Regain 1 life, max 5
      console.log("Regained a life. Current lives:", userData.lives);
    }
    userData.lastPlayed = now.toISOString(); // Update last played time
    saveUserData();
  }

  // Load theme preference
  loadThemePreference();
}

// Show modal dialog
function showModal(message) {
  if (modal && modalMessage) {
    modalMessage.textContent = message;
    modal.style.display = "block";
  } else {
    alert(message); // Fallback if modal elements don't exist
  }
}

// Close modal when clicking on X
if (closeModal) {
  closeModal.addEventListener("click", () => {
    if (modal) modal.style.display = "none";
  });
}

// Close modal when clicking outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    if (modal) modal.style.display = "none";
  }
});

// Handle icon clicks for navigation
document.querySelectorAll(".icon").forEach(icon => {
  icon.addEventListener("click", function() {
    const action = this.getAttribute("data-action");
    console.log("Icon clicked:", action); // Debugging log
    if (action === "games") {
      window.location.href = "index.html";
    } else if (action === "stats") {
      window.location.href = "stats.html";
    } else if (action === "battle") {
      window.location.href = "battle.html";
    }
    // Removed cases for "inventory" and "room"
  });
});

// Handle START buttons for games
document.querySelectorAll(".start-button").forEach(button => {
  button.addEventListener("click", function() {
    const gameType = this.getAttribute("data-game");
    console.log("Start button clicked for game:", gameType); // Debugging log
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
    const themeId = this.id; // e.g., "colorful-theme"
    console.log("Theme button clicked:", themeId); // Debugging log
    document.body.className = themeId; // Set body class directly
    try {
      localStorage.setItem("preferred-theme", themeId);
    } catch (e) {
      console.error("Error saving theme preference:", e);
    }
  });
});

// Load saved theme preference
function loadThemePreference() {
    try {
        const savedTheme = localStorage.getItem("preferred-theme");
        if (savedTheme && ["colorful-theme", "light-theme", "dark-theme"].includes(savedTheme)) {
            document.body.className = savedTheme;
            console.log("Loaded theme:", savedTheme); // Debugging log
        } else {
            document.body.className = "colorful-theme"; // Default theme
            console.log("No valid saved theme found, using default."); // Debugging log
        }
    } catch (e) {
        console.error("Error loading theme preference:", e);
        document.body.className = "colorful-theme"; // Fallback to default
    }
}

// Initialize the app when the page loads
window.onload = function() {
  console.log("Window loaded, initializing app..."); // Debugging log
  initApp();
};