// Initialize Telegram Web App compatibility (can run without Telegram too)
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const levelValue = document.getElementById("level-value");
const xpValue = document.getElementById("xp-value");
const xpNextLevel = document.getElementById("xp-next-level");
const xpFill = document.getElementById("xp-fill");
const livesContainer = document.getElementById("lives-container");
const intelligenceValue = document.getElementById("intelligence-value");
const sportsValue = document.getElementById("sports-value");
const languagesValue = document.getElementById("languages-value");
const energyValue = document.getElementById("energy-value");
const creativityValue = document.getElementById("creativity-value");
const healthValue = document.getElementById("health-value");
const customizeButton = document.getElementById("customize-button");
const backToHomeButton = document.getElementById("back-to-home");
const customizationModal = document.getElementById("customization-modal");
const closeModal = document.querySelector(".close");
const characterContainer = document.getElementById("character-base");

// Equipment slots
const equipmentSlots = document.querySelectorAll(".equipment-slot");

// User data from localStorage
let userData;

// Character customization options
const characterOptions = {
    skin: ['light', 'medium', 'dark', 'fantasy'],
    outfit: ['casual', 'formal', 'warrior', 'mage'],
    headgear: ['none', 'hat', 'crown', 'helmet'],
    weapon: ['none', 'sword', 'staff', 'bow']
};

// Load user data
function loadUserData() {
    const savedData = localStorage.getItem('brainTrainingUserData');
    if (savedData) {
        userData = JSON.parse(savedData);
        
        // Add missing stats if they don't exist yet
        if (!userData.stats.energy) userData.stats.energy = 8;
        if (!userData.stats.creativity) userData.stats.creativity = 7;
        if (!userData.stats.health) userData.stats.health = 10;
        
        // Add equipment if it doesn't exist
        if (!userData.equipment) {
            userData.equipment = {
                skin: 'light',
                outfit: 'casual',
                headgear: 'none',
                weapon: 'none'
            };
        }
        
        // Add achievements if they don't exist
        if (!userData.achievements) {
            userData.achievements = {
                memoryMaster: false,
                mathWizard: false,
                dailyStreak: false
            };
        }
        
        saveUserData();
    } else {
        // Create default user data
        userData = {
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
            inventory: []
        };
    }
}

// Save user data
function saveUserData() {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Update the character stats display
function updateStatsDisplay() {
    // Level and XP
    levelValue.textContent = userData.level;
    xpValue.textContent = userData.xp;
    const xpForNextLevel = userData.level * 100;
    xpNextLevel.textContent = xpForNextLevel;
    
    // XP progress bar
    const xpPercentage = Math.min(100, (userData.xp % 100) / 100 * 100);
    xpFill.style.width = `${xpPercentage}%`;
    
    // Lives
    livesContainer.innerHTML = '';
    for (let i = 0; i < userData.lives; i++) {
        const lifeIcon = document.createElement("div");
        lifeIcon.className = "life-icon";
        lifeIcon.textContent = "❤️";
        livesContainer.appendChild(lifeIcon);
    }
    
    // Attributes
    intelligenceValue.textContent = userData.stats.intelligence;
    sportsValue.textContent = userData.stats.sports;
    languagesValue.textContent = userData.stats.languages;
    energyValue.textContent = userData.stats.energy;
    creativityValue.textContent = userData.stats.creativity;
    healthValue.textContent = userData.stats.health;
}

// Load equipment slots
function loadEquipmentSlots() {
    equipmentSlots.forEach(slot => {
        const slotType = slot.getAttribute("data-slot");
        
        // Update slot icons based on equipped items
        if (slotType === "head" && userData.equipment.headgear !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.headgear[0].toUpperCase();
        }
        else if (slotType === "body" && userData.equipment.outfit !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.outfit[0].toUpperCase();
        }
        else if (slotType === "special" && userData.equipment.weapon !== 'none') {
            slot.querySelector(".slot-icon").classList.remove("empty");
            slot.querySelector(".slot-icon").classList.add("equipped");
            slot.querySelector(".slot-icon").innerHTML = userData.equipment.weapon[0].toUpperCase();
        }
        else if (slotType === "accessory") {
            // Accessory is not implemented yet in this version
        }
    });
}

// Update character appearance based on equipment
function updateCharacterAppearance() {
    // Clear existing classes
    characterContainer.className = "character-container";
    
    // Apply skin class
    characterContainer.classList.add(`skin-${userData.equipment.skin}`);
    
    // Apply outfit class if not none
    if (userData.equipment.outfit !== 'none') {
        characterContainer.classList.add(`outfit-${userData.equipment.outfit}`);
    }
    
    // Apply headgear class if not none
    if (userData.equipment.headgear !== 'none') {
        characterContainer.classList.add(`headgear-${userData.equipment.headgear}`);
    }
    
    // Apply weapon class if not none
    if (userData.equipment.weapon !== 'none') {
        characterContainer.classList.add(`weapon-${userData.equipment.weapon}`);
    }
}

// Create the customization modal content
function createCustomizationModalContent() {
    const modalContent = document.querySelector(".customization-content");
    
    // Clear existing content except the close button
    const closeButton = modalContent.querySelector(".close");
    modalContent.innerHTML = '';
    modalContent.appendChild(closeButton);
    
    // Add title
    const title = document.createElement("h2");
    title.textContent = "Character Customization";
    modalContent.appendChild(title);
    
    // Add customization categories
    for (const [category, options] of Object.entries(characterOptions)) {
        const section = document.createElement("div");
        section.className = "customization-section";
        
        const sectionTitle = document.createElement("h3");
        sectionTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        section.appendChild(sectionTitle);
        
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "options-container";
        
        options.forEach(option => {
            const optionButton = document.createElement("button");
            optionButton.className = "option-button";
            if (userData.equipment[category] === option) {
                optionButton.classList.add("selected");
            }
            optionButton.textContent = option.charAt(0).toUpperCase() + option.slice(1);
            optionButton.setAttribute("data-category", category);
            optionButton.setAttribute("data-option", option);
            
            optionButton.addEventListener("click", function() {
                // Update selected option
                document.querySelectorAll(`.option-button[data-category="${category}"]`).forEach(btn => {
                    btn.classList.remove("selected");
                });
                this.classList.add("selected");
                
                // Update user data
                userData.equipment[category] = option;
                saveUserData();
                
                // Update character appearance
                updateCharacterAppearance();
                loadEquipmentSlots();
            });
            
            optionsContainer.appendChild(optionButton);
        });
        
        section.appendChild(optionsContainer);
        modalContent.appendChild(section);
    }
    
    // Add save button
    const saveButton = document.createElement("button");
    saveButton.className = "action-button";
    saveButton.textContent = "Save Changes";
    saveButton.addEventListener("click", function() {
        customizationModal.style.display = "none";
    });
    
    modalContent.appendChild(saveButton);
    
    // Add styles for the customization modal
    const style = document.createElement("style");
    style.textContent = `
        .customization-section {
            margin-bottom: 20px;
        }
        
        .customization-section h3 {
            margin-top: 10px;
            margin-bottom: 10px;
            color: #333;
        }
        
        .options-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .option-button {
            padding: 8px 15px;
            background-color: #f0f0f0;
            border: 2px solid #ddd;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .option-button.selected {
            background-color: #4e9af1;
            color: white;
            border-color: #2a75d4;
        }
    `;
    
    document.head.appendChild(style);
}

// Handle customization button click
customizeButton.addEventListener("click", function() {
    createCustomizationModalContent();
    customizationModal.style.display = "block";
});

// Close modal when clicking on X
closeModal.addEventListener("click", function() {
    customizationModal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", function(event) {
    if (event.target === customizationModal) {
        customizationModal.style.display = "none";
    }
});

// Handle equipment slot clicks
equipmentSlots.forEach(slot => {
    slot.addEventListener("click", function() {
        createCustomizationModalContent();
        customizationModal.style.display = "block";
    });
});

// Handle icon clicks for navigation
document.querySelectorAll(".icon").forEach(icon => {
    icon.addEventListener("click", function() {
        const action = this.getAttribute("data-action");
        if (action === "games") {
            window.location.href = "index.html";
        } else if (action === "stats") {
            // Already on stats page
        } else if (action === "room") {
            alert("Room customization is coming soon!");
        } else if (action === "inventory") {
            alert("Inventory is coming soon!");
        }
    });
});

// Back button
backToHomeButton.addEventListener("click", function() {
    window.location.href = "index.html";
});

// Load theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    }
}

// Initialize the page
window.onload = function() {
    loadUserData();
    updateStatsDisplay();
    loadEquipmentSlots();
    updateCharacterAppearance();
    loadThemePreference();
};
