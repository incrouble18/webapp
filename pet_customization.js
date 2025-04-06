// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const petLocked = document.getElementById('pet-locked');
const petUnlocked = document.getElementById('pet-unlocked');
const backToStatsButton = document.getElementById('back-to-stats');
const toCharacterPage = document.getElementById('to-character-page');

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
            pet: {
                unlocked: false,
                type: 'cat',
                color: 'default',
                accessory: 'none',
                abilities: {
                    loyalty: 50,
                    intelligence: 70,
                    speed: 60,
                    strength: 40
                }
            },
            inventory: []
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Update the pet appearance
function updatePetAppearance() {
    const userData = loadUserData();
    
    // Check if pet is unlocked
    if (userData.pet && userData.pet.unlocked) {
        petLocked.style.display = 'none';
        petUnlocked.style.display = 'block';
        
        // Apply pet styling based on settings
        const petBase = document.getElementById('pet-base');
        petBase.className = 'pet-container';
        petBase.classList.add(`pet-type-${userData.pet.type}`);
        petBase.classList.add(`pet-color-${userData.pet.color}`);
        
        if (userData.pet.accessory !== 'none') {
            petBase.classList.add(`pet-accessory-${userData.pet.accessory}`);
        }
        
        // Update selected buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.classList.remove('selected');
        });
        
        document.querySelector(`[data-type="${userData.pet.type}"]`).classList.add('selected');
        document.querySelector(`[data-color="${userData.pet.color}"]`).classList.add('selected');
        document.querySelector(`[data-accessory="${userData.pet.accessory}"]`).classList.add('selected');
        
        // Update ability bars
        const abilities = userData.pet.abilities;
        const abilityBars = document.querySelectorAll('.ability-fill');
        
        abilityBars[0].style.width = `${abilities.loyalty}%`;
        abilityBars[1].style.width = `${abilities.intelligence}%`;
        abilityBars[2].style.width = `${abilities.speed}%`;
        abilityBars[3].style.width = `${abilities.strength}%`;
    } else {
        petLocked.style.display = 'block';
        petUnlocked.style.display = 'none';
    }
}

// Handle option button clicks
function handleOptionClick(event) {
    if (!event.target.classList.contains('option-button')) return;
    
    const userData = loadUserData();
    
    // Skip if pet is not unlocked
    if (!userData.pet || !userData.pet.unlocked) return;
    
    const optionType = event.target.dataset.type;
    const optionColor = event.target.dataset.color;
    const optionAccessory = event.target.dataset.accessory;
    
    // Update the corresponding option
    if (optionType) {
        userData.pet.type = optionType;
        document.querySelectorAll('[data-type]').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
    } else if (optionColor) {
        userData.pet.color = optionColor;
        document.querySelectorAll('[data-color]').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
    } else if (optionAccessory) {
        userData.pet.accessory = optionAccessory;
        document.querySelectorAll('[data-accessory]').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
    }
    
    saveUserData(userData);
    updatePetAppearance();
}

// Back button handler
backToStatsButton.addEventListener('click', function() {
    window.location.href = 'stats.html';
});

// To character page handler
toCharacterPage.addEventListener('click', function() {
    window.location.href = 'stats.html';
});

// Handle options container clicks
document.querySelectorAll('.options-container').forEach(container => {
    container.addEventListener('click', handleOptionClick);
});

// Add styles for pet
function addPetStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Pet base styles */
        .pet-container {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto;
        }
        
        .pet-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        
        /* Pet types */
        .pet-type-cat #pet-body {
            background-color: #f39c12;
            clip-path: ellipse(40% 45% at 50% 50%);
        }
        
        .pet-type-cat #pet-head {
            background-color: #f39c12;
            clip-path: circle(30% at 50% 30%);
        }
        
        .pet-type-cat #pet-face::before,
        .pet-type-cat #pet-face::after {
            content: '';
            position: absolute;
            width: 5px;
            height: 5px;
            background-color: #333;
            border-radius: 50%;
            top: 25%;
        }
        
        .pet-type-cat #pet-face::before {
            left: 43%;
        }
        
        .pet-type-cat #pet-face::after {
            right: 43%;
        }
        
        .pet-type-cat #pet-mouth {
            position: absolute;
            width: 8px;
            height: 4px;
            border-bottom: 2px solid #333;
            border-radius: 50%;
            top: 33%;
            left: 50%;
            transform: translateX(-50%);
        }
        
        /* Dog pet */
        .pet-type-dog #pet-body {
            background-color: #a57e4a;
            clip-path: ellipse(40% 45% at 50% 50%);
        }
        
        .pet-type-dog #pet-head {
            background-color: #a57e4a;
            clip-path: circle(35% at 50% 30%);
        }
        
        /* Dragon pet */
        .pet-type-dragon #pet-body {
            background-color: #27ae60;
            clip-path: polygon(50% 0%, 85% 50%, 50% 100%, 15% 50%);
        }
        
        .pet-type-dragon #pet-head {
            background-color: #27ae60;
            clip-path: circle(25% at 50% 25%);
        }
        
        /* Bird pet */
        .pet-type-bird #pet-body {
            background-color: #3498db;
            clip-path: ellipse(40% 50% at 50% 50%);
        }
        
        .pet-type-bird #pet-head {
            background-color: #3498db;
            clip-path: circle(30% at 50% 25%);
        }
        
        /* Pet colors */
        .pet-color-black #pet-body,
        .pet-color-black #pet-head {
            background-color: #2c3e50;
        }
        
        .pet-color-white #pet-body,
        .pet-color-white #pet-head {
            background-color: #ecf0f1;
        }
        
        .pet-color-gold #pet-body,
        .pet-color-gold #pet-head {
            background-color: #f1c40f;
        }
        
        .pet-color-blue #pet-body,
        .pet-color-blue #pet-head {
            background-color: #3498db;
        }
        
        /* Pet accessories */
        .pet-accessory-bow #pet-accessory {
            background-color: #e74c3c;
            clip-path: ellipse(15% 10% at 50% 15%);
        }
        
        .pet-accessory-hat #pet-accessory {
            background-color: #9b59b6;
            clip-path: polygon(35% 15%, 65% 15%, 60% 5%, 40% 5%);
        }
        
        .pet-accessory-glasses #pet-accessory {
            border: 2px solid #333;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
        }
        
        /* Pet ability styles */
        .pet-ability {
            margin: 10px 0;
        }
        
        .ability-bar {
            height: 10px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 5px;
            overflow: hidden;
            margin-top: 5px;
        }
        
        .ability-fill {
            height: 100%;
            background-color: #3498db;
            border-radius: 5px;
        }
        
        /* Pet locked styles */
        .pet-locked {
            text-align: center;
            padding: 20px;
        }
        
        .pet-locked-img {
            width: 100px;
            height: 100px;
            opacity: 0.7;
        }
        
        .pet-locked p {
            margin-top: 10px;
            color: #bbb;
        }
        
        /* Page switcher */
        .page-switcher {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .page-switcher.reverse {
            left: 10px;
            right: auto;
        }
        
        .page-switch-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .page-switch-button:hover {
            background-color: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Initialize the page
window.onload = function() {
    addPetStyles();
    updatePetAppearance();
    
    // Load theme preference
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        document.body.className = "colorful-theme";
    }
    
    // If you want to test with an unlocked pet, uncomment:
    /*
    const userData = loadUserData();
    userData.pet.unlocked = true;
    saveUserData(userData);
    updatePetAppearance();
    */
};