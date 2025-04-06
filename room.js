// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
    tg.expand();
}

// DOM Elements
const roomCanvas = document.querySelector('.room-canvas');
const itemOptions = document.querySelectorAll('.room-item-option');
const themeOptions = document.querySelectorAll('.theme-option');
const backToMenuButton = document.getElementById('back-to-menu');
const buffsList = document.getElementById('room-buffs-list');

// Room items and their buffs
const roomItems = {
    bed: {
        buff: 'Energy +10%',
        buffIcon: '💤',
        statBoost: { energy: 10 }
    },
    desk: {
        buff: 'Intelligence +5%',
        buffIcon: '📝',
        statBoost: { intelligence: 5 }
    },
    bookshelf: {
        buff: 'Intelligence +10%',
        buffIcon: '📚',
        statBoost: { intelligence: 10 }
    },
    plant: {
        buff: 'Health +5%',
        buffIcon: '🌿',
        statBoost: { health: 5 }
    },
    poster: {
        buff: 'Creativity +8%',
        buffIcon: '🎨',
        statBoost: { creativity: 8 }
    },
    lamp: {
        buff: 'Energy +5%',
        buffIcon: '💡',
        statBoost: { energy: 5 }
    },
    rug: {
        buff: 'Comfort +10%',
        buffIcon: '🧶',
        statBoost: { health: 3, energy: 3 }
    },
    computer: {
        buff: 'Intelligence +8%, Creativity +5%',
        buffIcon: '💻',
        statBoost: { intelligence: 8, creativity: 5 }
    }
};

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
            room: {
                theme: 'default',
                items: [] // List of items in the room
            }
        };
    }
}

// Save user data to localStorage
function saveUserData(userData) {
    localStorage.setItem('brainTrainingUserData', JSON.stringify(userData));
}

// Update the room display
function updateRoomDisplay() {
    const userData = loadUserData();
    
    // Apply room theme
    roomCanvas.className = 'room-canvas theme-' + userData.room.theme;
    
    // Show room items
    const roomItemElements = document.querySelectorAll('.room-item');
    roomItemElements.forEach(item => {
        item.style.display = 'none';
    });
    
    // Update selected theme button
    themeOptions.forEach(option => {
        option.classList.remove('selected');
        if (option.getAttribute('data-theme') === userData.room.theme) {
            option.classList.add('selected');
        }
    });
    
    // Show placed items
    userData.room.items.forEach(itemName => {
        const itemElement = document.getElementById('room-' + itemName);
        if (itemElement) {
            itemElement.style.display = 'block';
        }
        
        // Update selected item options
        itemOptions.forEach(option => {
            if (option.getAttribute('data-item') === itemName) {
                option.classList.add('selected');
            }
        });
    });
    
    // Update buffs list
    updateBuffsList(userData.room.items);
}

// Update the buffs list display
function updateBuffsList(items) {
    if (items.length === 0) {
        buffsList.innerHTML = '<div class="no-buffs">Add items to your room to receive buffs!</div>';
        return;
    }
    
    buffsList.innerHTML = '';
    
    items.forEach(itemName => {
        const item = roomItems[itemName];
        
        if (item) {
            const buffItem = document.createElement('div');
            buffItem.className = 'buff-item';
            buffItem.innerHTML = `
                <div class="buff-icon">${item.buffIcon}</div>
                <div class="buff-text">${item.buff}</div>
            `;
            
            buffsList.appendChild(buffItem);
        }
    });
}

// Toggle a room item
function toggleRoomItem(itemName) {
    const userData = loadUserData();
    
    // Initialize room if not exists
    if (!userData.room) {
        userData.room = {
            theme: 'default',
            items: []
        };
    }
    
    // Check if item is already in the room
    const itemIndex = userData.room.items.indexOf(itemName);
    
    if (itemIndex === -1) {
        // Add item
        userData.room.items.push(itemName);
        
        // Apply the stat boost
        const boosts = roomItems[itemName].statBoost;
        for (const stat in boosts) {
            if (userData.stats[stat]) {
                userData.stats[stat] += boosts[stat];
            }
        }
    } else {
        // Remove item
        userData.room.items.splice(itemIndex, 1);
        
        // Remove the stat boost
        const boosts = roomItems[itemName].statBoost;
        for (const stat in boosts) {
            if (userData.stats[stat]) {
                userData.stats[stat] -= boosts[stat];
            }
        }
    }
    
    saveUserData(userData);
    updateRoomDisplay();
}

// Change room theme
function changeRoomTheme(themeName) {
    const userData = loadUserData();
    
    // Initialize room if not exists
    if (!userData.room) {
        userData.room = {
            theme: 'default',
            items: []
        };
    }
    
    userData.room.theme = themeName;
    saveUserData(userData);
    updateRoomDisplay();
}

// Add event listeners for item options
itemOptions.forEach(option => {
    option.addEventListener('click', function() {
        const itemName = this.getAttribute('data-item');
        toggleRoomItem(itemName);
        
        // Toggle selected class
        this.classList.toggle('selected');
    });
});

// Add event listeners for theme options
themeOptions.forEach(option => {
    option.addEventListener('click', function() {
        const themeName = this.getAttribute('data-theme');
        changeRoomTheme(themeName);
        
        // Update selected class
        themeOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
    });
});

// Back button handler
backToMenuButton.addEventListener('click', function() {
    window.location.href = 'index.html';
});

// Handle icon clicks for navigation
document.querySelectorAll('.icon').forEach(icon => {
    icon.addEventListener('click', function() {
        const action = this.getAttribute('data-action');
        if (action === 'games') {
            window.location.href = 'index.html';
        } else if (action === 'stats') {
            window.location.href = 'stats.html';
        } else if (action === 'room') {
            // Already on room page
        } else if (action === 'inventory') {
            alert('Inventory is coming soon! 🎒');
        } else if (action === 'battle') {
            window.location.href = 'battle.html';
        }
    });
});

// Initialize the page
window.onload = function() {
    const userData = loadUserData();
    
    // Initialize room if not exists
    if (!userData.room) {
        userData.room = {
            theme: 'default',
            items: []
        };
        saveUserData(userData);
    }
    
    updateRoomDisplay();
    
    // Load theme preference
    const savedTheme = localStorage.getItem("preferred-theme");
    if (savedTheme) {
        document.body.className = savedTheme + "-theme";
    } else {
        document.body.className = "colorful-theme";
    }
};