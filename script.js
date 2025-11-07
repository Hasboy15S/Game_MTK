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
backHomeBtn.onclick = () => showScreen(document.getElementById('home-screen'));
const levels = {
  1: ['+', '-'],
  2: ['×', '÷'],
  3: ['+', '-', '×']
};

startBtn.onclick = () => showScreen(usernameScreen);
confirmUsernameBtn.onclick = () => {
  username = document.getElementById('username-input').value.trim();
  if (username) startGame();
};

nextLevelBtn.onclick = () => {
  currentLevel++;
  if (currentLevel > 3) {
    showScreen(leaderboardScreen);
    saveScore();
    updateLeaderboard();
  } else {
    startGame();
  }
};

showLeaderboardBtn.onclick = () => {
  showScreen(leaderboardScreen);
  saveScore();
  updateLeaderboard();
};

showLeaderboardOverBtn.onclick = () => {
  showScreen(leaderboardScreen);
  saveScore();
  updateLeaderboard();
};

clearLeaderboardBtn.onclick = () => {
  localStorage.removeItem('leaderboard');
  updateLeaderboard();
};

function showScreen(screen) {
  screens.forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
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
  if (currentQuestion >= 3) {
    clearInterval(timer);
    document.getElementById('score').textContent = score;
    showScreen(levelCompleteScreen);
    return;
  }

  const ops = levels[currentLevel];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 10) + 1;
  let b = Math.floor(Math.random() * 10) + 1;
  if (op === '÷') a = a * b;

  let question = `${a} ${op} ${b}`;
  let answer = eval(question.replace('×', '*').replace('÷', '/'));
  questionEl.textContent = question;
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
  timeLeft = 8;
  timerEl.textContent = timeLeft;
  clearInterval(timer);
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
    correctSound.play();
    score += 10;
    nextQuestion();
  } else {
    wrongSound.play();
    clearInterval(timer);
    showScreen(gameOverScreen);
    document.getElementById('final-score').textContent = score;
  }
}

function saveScore() {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboard.push({ name: username, level: currentLevel, score });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.slice(0, 10)));
}

function updateLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
  leaderboardTable.innerHTML = leaderboard
    .map(p => `<tr><td>${p.name}</td><td>${p.level}</td><td>${p.score}</td></tr>`)
    .join('');
}
