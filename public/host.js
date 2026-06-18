const socket = io();

// Elementos
const lobbyScreen = document.getElementById('lobby-screen');
const questionScreen = document.getElementById('question-screen');
const podiumScreen = document.getElementById('podium-screen');

const pinDisplay = document.getElementById('pin-display');
const playerCountSpan = document.getElementById('player-count');
const playersGrid = document.getElementById('players-grid');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const abortBtn = document.getElementById('abort-btn');

const questionText = document.getElementById('question-text');
const timerDisplay = document.getElementById('timer');
const answersReceivedSpan = document.getElementById('answers-received');

const opt0 = document.getElementById('opt-0');
const opt1 = document.getElementById('opt-1');
const opt2 = document.getElementById('opt-2');
const opt3 = document.getElementById('opt-3');
const opts = [opt0, opt1, opt2, opt3];

const podiumContainer = document.getElementById('podium-container');

// Estado
let timerInterval;
let timeRemaining = 15;
let isQuestionActive = false;

// Registro como host
socket.emit('register_host');

socket.on('host_registered', () => {
    // window.location.origin obtiene automáticamente el link donde está subido (ej. https://juego-sst.glitch.me)
    pinDisplay.innerText = window.location.origin;
});

socket.on('update_players', (players) => {
    playerCountSpan.innerText = players.length;
    playersGrid.innerHTML = '';
    players.forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        chip.innerText = p.name;
        playersGrid.appendChild(chip);
    });
});

startBtn.addEventListener('click', () => {
    socket.emit('start_game');
});

socket.on('new_question', (data) => {
    lobbyScreen.classList.add('hidden');
    podiumScreen.classList.add('hidden');
    questionScreen.classList.remove('hidden');

    questionText.innerText = `${data.number}/${data.total}: ${data.question}`;
    answersReceivedSpan.innerText = '0';
    
    // Reset estilos
    opts.forEach(opt => {
        opt.innerText = '';
        opt.classList.remove('dimmed', 'correct-ans');
        opt.style.display = 'none';
    });

    data.options.forEach((txt, i) => {
        opts[i].innerText = txt;
        opts[i].style.display = 'block';
    });

    timeRemaining = 15;
    timerDisplay.innerText = timeRemaining;
    isQuestionActive = true;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = timeRemaining;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            if (isQuestionActive) {
                isQuestionActive = false;
                socket.emit('time_up');
            }
        }
    }, 1000);
});

socket.on('player_answered', (count) => {
    answersReceivedSpan.innerText = count;
});

socket.on('show_results', (data) => {
    isQuestionActive = false;
    clearInterval(timerInterval);
    timerDisplay.innerText = "¡TIEMPO!";

    opts.forEach((opt, i) => {
        if (i === data.correctAnswer) {
            opt.classList.add('correct-ans');
        } else {
            opt.classList.add('dimmed');
        }
    });

    // Esperar 4 segundos antes de la siguiente pregunta
    setTimeout(() => {
        socket.emit('next_question');
    }, 4000);
});

socket.on('show_podium', (ranking) => {
    questionScreen.classList.add('hidden');
    podiumScreen.classList.remove('hidden');

    podiumContainer.innerHTML = '';
    
    // ranking es array ordenado de mejor a peor
    if (ranking.length >= 2) {
        // Segundo lugar
        podiumContainer.innerHTML += `
            <div class="podium-place p2">
                <div class="podium-name">${ranking[1].name}</div>
                <div class="podium-score">${ranking[1].score} pts</div>
                <div style="font-size:2rem; margin-top:10px;">🥈</div>
            </div>`;
    }
    
    if (ranking.length >= 1) {
        // Primer lugar
        podiumContainer.innerHTML += `
            <div class="podium-place p1">
                <div class="podium-name">${ranking[0].name}</div>
                <div class="podium-score">${ranking[0].score} pts</div>
                <div style="font-size:3rem; margin-top:10px;">🥇</div>
            </div>`;
    }

    if (ranking.length >= 3) {
        // Tercer lugar
        podiumContainer.innerHTML += `
            <div class="podium-place p3">
                <div class="podium-name">${ranking[2].name}</div>
                <div class="podium-score">${ranking[2].score} pts</div>
                <div style="font-size:1.5rem; margin-top:10px;">🥉</div>
            </div>`;
    }
});

restartBtn.addEventListener('click', () => {
    socket.emit('reset_game');
    podiumScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
});

if (abortBtn) {
    abortBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas reiniciar el juego y volver a la sala de espera? Todos los puntajes se pondrán en cero.')) {
            socket.emit('reset_game');
            questionScreen.classList.add('hidden');
            lobbyScreen.classList.remove('hidden');
        }
    });
}
