const socket = io();

// Elementos
const loginScreen = document.getElementById('login-screen');
const waitingScreen = document.getElementById('waiting-screen');
const playScreen = document.getElementById('play-screen');
const resultScreen = document.getElementById('result-screen');

const nameInput = document.getElementById('name-input');
const joinBtn = document.getElementById('join-btn');
const errorMsg = document.getElementById('error-msg');

const resultIcon = document.getElementById('result-icon');
const resultText = document.getElementById('result-text');
const scoreText = document.getElementById('score-text');

const btn0 = document.getElementById('btn-0');
const btn1 = document.getElementById('btn-1');
const btn2 = document.getElementById('btn-2');
const btn3 = document.getElementById('btn-3');
const btns = [btn0, btn1, btn2, btn3];

let myTimerInterval;
let timeLeft = 15;

// Unirse
joinBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (name.length > 0) {
        socket.emit('player_join', name);
    }
});

socket.on('join_error', (msg) => {
    errorMsg.innerText = msg;
});

socket.on('join_success', () => {
    loginScreen.classList.add('hidden');
    waitingScreen.classList.remove('hidden');
});

// Prepararse para responder
socket.on('prepare_answer', () => {
    waitingScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    playScreen.classList.remove('hidden');
    
    // Habilitar botones
    btns.forEach(b => {
        b.style.opacity = '1';
        b.disabled = false;
    });

    timeLeft = 15;
    clearInterval(myTimerInterval);
    myTimerInterval = setInterval(() => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) clearInterval(myTimerInterval);
    }, 100);
});

// Responder
btns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        // Enviar respuesta al servidor
        socket.emit('submit_answer', { answerIndex: index, timeLeft: timeLeft });
        
        // Deshabilitar todos los botones para que no responda de nuevo
        btns.forEach(b => {
            b.disabled = true;
            if (b !== btn) b.style.opacity = '0.3';
        });
        
        // Mostrar "Esperando resultados..."
        setTimeout(() => {
            playScreen.classList.add('hidden');
            waitingScreen.innerHTML = '¡Respuesta enviada!<br>Esperando resultados...';
            waitingScreen.classList.remove('hidden');
        }, 500);
    });
});

// Resultados de la pregunta
socket.on('answer_result', (data) => {
    playScreen.classList.add('hidden');
    waitingScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');

    resultScreen.className = 'client-result ' + (data.correct ? 'result-correct' : 'result-wrong');
    resultIcon.innerText = data.correct ? '✔️' : '❌';
    resultText.innerText = data.correct ? '¡Correcto!' : 'Incorrecto';
    scoreText.innerText = `Puntaje total: ${data.score}`;
});

socket.on('game_started', () => {
    waitingScreen.innerHTML = '¡El juego ha comenzado!<br>Mira la pantalla principal.';
});

socket.on('game_over', () => {
    playScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    waitingScreen.innerHTML = '¡Juego terminado!<br>Mira el podio en la pantalla principal.';
    waitingScreen.classList.remove('hidden');
});

socket.on('back_to_lobby', () => {
    playScreen.classList.add('hidden');
    resultScreen.classList.add('hidden');
    waitingScreen.innerHTML = '¡Estás dentro!<br>Mira la pantalla principal.';
    waitingScreen.classList.remove('hidden');
});
