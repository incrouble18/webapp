// Initialize Telegram Web App compatibility
let tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.expand();
}

// Quiz questions database - can be expanded as needed
const quizQuestions = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2 // Paris (index 2)
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1 // Mars (index 1)
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: 3 // Pacific Ocean (index 3)
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
    correctAnswer: 1 // Oxygen (index 1)
  },
  {
    question: "Which animal is known as the 'King of the Jungle'?",
    options: ["Tiger", "Lion", "Elephant", "Giraffe"],
    correctAnswer: 1 // Lion (index 1)
  },
  {
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 1 // 6 (index 1)
  },
  {
    question: "Which country is home to the kangaroo?",
    options: ["New Zealand", "Australia", "South Africa", "Brazil"],
    correctAnswer: 1 // Australia (index 1)
  },
  {
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Titanium"],
    correctAnswer: 2 // Diamond (index 2)
  },
  {
    question: "Which planet has the most moons?",
    options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
    correctAnswer: 1 // Saturn (index 1)
  },
  {
    question: "What is the smallest bone in the human body?",
    options: ["Stapes", "Femur", "Radius", "Phalanges"],
    correctAnswer: 0 // Stapes (index 0)
  }
];

// Variables to track quiz state
let currentQuizQuestion;
let quizContainer;
let battleBuffs = {
  damage: 1.0,  // Multiplier for player damage (1.0 = normal)
  healing: 1.0, // Multiplier for healing (1.0 = normal)
  defense: 1.0  // Multiplier for defense (1.0 = normal)
};

// Function to initialize the battle quiz
function initBattleQuiz() {
  // Create quiz container if it doesn't exist
  if (!document.getElementById('quiz-container')) {
    quizContainer = document.createElement('div');
    quizContainer.id = 'quiz-container';
    quizContainer.classList.add('quiz-container');
    document.body.appendChild(quizContainer);
    
    // Add styles to the quiz container
    quizContainer.style.position = 'fixed';
    quizContainer.style.top = '50%';
    quizContainer.style.left = '50%';
    quizContainer.style.transform = 'translate(-50%, -50%)';
    quizContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    quizContainer.style.padding = '20px';
    quizContainer.style.borderRadius = '10px';
    quizContainer.style.color = 'white';
    quizContainer.style.zIndex = '1000';
    quizContainer.style.width = '80%';
    quizContainer.style.maxWidth = '400px';
    quizContainer.style.textAlign = 'center';
    quizContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
  }
  
  // Get a random question
  const randomIndex = Math.floor(Math.random() * quizQuestions.length);
  currentQuizQuestion = quizQuestions[randomIndex];
  
  // Display the quiz
  displayQuiz(currentQuizQuestion);
}

// Function to display the quiz
function displayQuiz(quizQuestion) {
  quizContainer.innerHTML = `
    <h3 style="color: #f39c12; margin-bottom: 20px;">Answer correctly for battle buffs!</h3>
    <p style="font-size: 18px; margin-bottom: 20px;">${quizQuestion.question}</p>
    <div id="options-container" style="display: flex; flex-direction: column; gap: 10px;">
      ${quizQuestion.options.map((option, index) => `
        <button 
          onclick="checkAnswer(${index})" 
          style="padding: 10px; background-color: #3498db; border: none; border-radius: 5px; color: white; cursor: pointer; font-size: 16px;">
          ${option}
        </button>
      `).join('')}
    </div>
  `;
  
  // Show the quiz container
  quizContainer.style.display = 'block';
}

// Function to check if the answer is correct
function checkAnswer(answerIndex) {
  const isCorrect = answerIndex === currentQuizQuestion.correctAnswer;
  
  // Update battle buffs based on answer
  if (isCorrect) {
    // Player gets buffs for correct answer
    battleBuffs.damage = 1.3;  // 30% more damage
    battleBuffs.healing = 1.2; // 20% more healing
    battleBuffs.defense = 1.1; // 10% better defense
    
    // Show success message
    quizContainer.innerHTML = `
      <h3 style="color: #2ecc71; margin-bottom: 20px;">Correct!</h3>
      <p style="font-size: 18px; margin-bottom: 20px;">You received battle buffs:</p>
      <ul style="list-style: none; text-align: left; padding-left: 20px;">
        <li style="margin-bottom: 10px;">➕ Damage +30%</li>
        <li style="margin-bottom: 10px;">➕ Healing +20%</li>
        <li style="margin-bottom: 10px;">➕ Defense +10%</li>
      </ul>
      <button 
        onclick="startBattleWithBuffs()" 
        style="padding: 10px; background-color: #2ecc71; border: none; border-radius: 5px; color: white; cursor: pointer; font-size: 16px; margin-top: 10px;">
        Start Battle
      </button>
    `;
  } else {
    // Player gets debuffs for wrong answer
    battleBuffs.damage = 0.8;  // 20% less damage
    battleBuffs.healing = 0.9; // 10% less healing
    battleBuffs.defense = 0.8; // 20% less defense
    
    // Show failure message
    quizContainer.innerHTML = `
      <h3 style="color: #e74c3c; margin-bottom: 20px;">Wrong!</h3>
      <p style="font-size: 18px; margin-bottom: 20px;">You received battle debuffs:</p>
      <ul style="list-style: none; text-align: left; padding-left: 20px;">
        <li style="margin-bottom: 10px;">➖ Damage -20%</li>
        <li style="margin-bottom: 10px;">➖ Healing -10%</li>
        <li style="margin-bottom: 10px;">➖ Defense -20%</li>
      </ul>
      <button 
        onclick="startBattleWithBuffs()" 
        style="padding: 10px; background-color: #e74c3c; border: none; border-radius: 5px; color: white; cursor: pointer; font-size: 16px; margin-top: 10px;">
        Start Battle
      </button>
    `;
  }
  
  // Save the battle buffs to localStorage
  localStorage.setItem('battleBuffs', JSON.stringify(battleBuffs));
}

// Function to start battle with applied buffs
function startBattleWithBuffs() {
  // Hide the quiz container
  quizContainer.style.display = 'none';
  
  // Call the original startBattle function (from battle.js)
  if (typeof window.originalStartBattle === 'function') {
    window.originalStartBattle();
  } else {
    console.error('Original startBattle function not found');
    // Fallback to regular startBattle if available
    if (typeof startBattle === 'function') {
      startBattle();
    }
  }
}

// Export functions to be available globally
window.initBattleQuiz = initBattleQuiz;
window.checkAnswer = checkAnswer;
window.startBattleWithBuffs = startBattleWithBuffs;