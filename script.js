const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const usernameScreen = document.getElementById('username-screen');
const confirmUsernameBtn = document.getElementById('confirm-username');
const gameScreen = document.getElementById('game-screen');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const timerEl = document.getElementById('time-left');
const levelTitle = document.getElementById('level-title');
const levelCompleteScreen = document.getElementById('level-complete');
const gameOverScreen = document.getElementById('game-over');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const leaderboardTable = document.getElementById('leaderboard').querySelector('tbody');
const nextLevelBtn = document.getElementById('next-level');
const backHomeBtn = document.getElementById('back-home');
const backHomeBtn2 = document.getElementById('back-home2');
const showLeaderboardBtn = document.getElementById('show-leaderboard');
const showLeaderboardOverBtn = document.getElementById('show-leaderboard-over');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard');

let username = '';
let score = 0;
let currentLevel = 1;
let currentQuestion = 0;
let timer;
let timeLeft = 10;

let correctSound = document.getElementById('correct-sound');
let wrongSound = document.getElementById('wrong-sound');
let clickSound = document.getElementById('click-sound');

const levels = {
  1: ['+', '-'],
  2: ['×', '÷'],
  3: ['+', '-', '×']
};

// ====== EVENT HANDLERS ======
startBtn.onclick = () => {
  playClick();
  showScreen(usernameScreen);
};

confirmUsernameBtn.onclick = () => {
  playClick();
  username = document.getElementById('username-input').value.trim();
  if (username) startGame();
};

nextLevelBtn.onclick = () => {
  playClick();
  currentLevel++;
  if (currentLevel > 3) {
    saveScore();
    updateLeaderboard();
    showScreen(leaderboardScreen);
  } else {
    startGame();
  }
};

showLeaderboardBtn.onclick = () => {
  playClick();
  saveScore();
  updateLeaderboard();
  showScreen(leaderboardScreen);
};

showLeaderboardOverBtn.onclick = () => {
  playClick();
  saveScore();
  updateLeaderboard();
  showScreen(leaderboardScreen);
};

backHomeBtn.onclick = () => {
  playClick();
  resetGame();
  showScreen(document.getElementById('home-screen'));
};

backHomeBtn2.onclick = () => {
  playClick();
  resetGame();
  showScreen(document.getElementById('home-screen'));
};

clearLeaderboardBtn.onclick = () => {
  playClick();
  localStorage.removeItem('leaderboard');
  updateLeaderboard();
};

// ====== CORE FUNCTIONS ======
function showScreen(screen) {
  clearInterval(timer); // <-- hentikan timer setiap ganti layar
  screens.forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function resetGame() {
  clearInterval(timer);
  score = 0;
  currentLevel = 1;
  currentQuestion = 0;
  timeLeft = 10;
}

function startGame() {
  score = 0;
  currentQuestion = 0;
  showScreen(gameScreen);
  startLevel();
}

function startLevel() {
  levelTitle.textContent = `Level ${currentLevel}`;
  nextQuestion();
}

function nextQuestion() {
  clearInterval(timer);
  if (currentQuestion >= 3) {
    document.getElementById('score').textContent = score;
    showScreen(levelCompleteScreen);
    return;
  }

  const ops = levels[currentLevel];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 10) + 1;
  let b = Math.floor(Math.random() * 10) + 1;
  if (op === '÷') a = a * b;

  const answer = calculate(a, b, op);
  questionEl.textContent = `${a} ${op} ${b}`;

  const options = [answer];
  while (options.length < 4) {
    let rand = answer + Math.floor(Math.random() * 10 - 5);
    if (!options.includes(rand) && rand >= 0) options.push(rand);
  }
  options.sort(() => Math.random() - 0.5);

  choicesEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => checkAnswer(opt, answer);
    choicesEl.appendChild(btn);
  });

  currentQuestion++;
  startTimer();
}

function calculate(a, b, op) {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return a / b;
  }
}

function startTimer() {
  clearInterval(timer);
  timeLeft = 8;
  timerEl.textContent = timeLeft;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timer);
      showScreen(gameOverScreen);
      document.getElementById('final-score').textContent = score;
    }
  }, 1000);
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    playCorrect();
    score += 10;
    nextQuestion();
  } else {
    playWrong();
    clearInterval(timer);
    document.getElementById('final-score').textContent = score;
    showScreen(gameOverScreen);
  }
}

function saveScore() {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

  // Cek apakah user sudah ada di leaderboard
  const existing = leaderboard.find(p => p.name === username);
  if (existing) {
    // Update kalau pemain dapat level atau skor lebih tinggi
    if (currentLevel > existing.level || score > existing.score) {
      existing.level = currentLevel;
      existing.score = score;
    }
  } else {
    leaderboard.push({ name: username, level: currentLevel, score });
  }

  // Urutkan berdasarkan level dulu, lalu skor
  leaderboard.sort((a, b) => {
    if (b.level === a.level) {
      return b.score - a.score; // kalau level sama, urut skor tertinggi
    }
    return b.level - a.level; // urut level tertinggi
  });

  // Simpan 10 besar
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function updateLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

  // Pastikan urutannya sesuai prioritas level > skor
  leaderboard.sort((a, b) => {
    if (b.level === a.level) {
      return b.score - a.score;
    }
    return b.level - a.level;
  });

  leaderboardTable.innerHTML = leaderboard
    .map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.name}</td>
        <td>${p.level}</td>
        <td>${p.score}</td>
      </tr>
    `)
    .join('');
}



// ====== SOUND HELPERS ======
function playClick() {
  if (clickSound) { clickSound.currentTime = 0; clickSound.play(); }
}

function playCorrect() {
  if (correctSound) { correctSound.currentTime = 0; correctSound.play(); }
}

function playWrong() {
  if (wrongSound) { wrongSound.currentTime = 0; wrongSound.play(); }
}
