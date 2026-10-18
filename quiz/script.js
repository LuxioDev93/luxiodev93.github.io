// --- Key Quiz — Lógica del juego ---
let questions = [
    { question: '¿Cuántos sentidos tiene el ser humano?', correct: 'Cinco', wrong1: 'Tres', wrong2: 'Siete', learned: false },
    { question: '¿Con qué sentido vemos los colores y las formas?', correct: 'Con la vista', wrong1: 'Con el oído', wrong2: 'Con el olfato', learned: false },
    { question: '¿Qué órganos usamos para oír los sonidos?', correct: 'Los oídos', wrong1: 'Los ojos', wrong2: 'La nariz', learned: false },
    { question: '¿Con qué sentido olemos los olores?', correct: 'Con el olfato', wrong1: 'Con el gusto', wrong2: 'Con el tacto', learned: false },
    { question: '¿Qué sentido usamos para saborear los alimentos?', correct: 'El gusto', wrong1: 'El olfato', wrong2: 'La vista', learned: false },
    { question: '¿Con qué sentido notamos si algo es suave o áspero?', correct: 'Con el tacto', wrong1: 'Con la vista', wrong2: 'Con el oído', learned: false },
    { question: '¿Cómo se llama el conjunto de huesos de nuestro cuerpo?', correct: 'El esqueleto', wrong1: 'Los músculos', wrong2: 'La piel', learned: false },
    { question: '¿Qué nos ayudan a movernos junto con los huesos?', correct: 'Los músculos', wrong1: 'Los dientes', wrong2: 'El pelo', learned: false },
    { question: '¿Dónde se encuentra el sentido del gusto?', correct: 'En la lengua', wrong1: 'En la nariz', wrong2: 'En las orejas', learned: false },
    { question: '¿Qué parte del cuerpo usamos principalmente para oler?', correct: 'La nariz', wrong1: 'Los ojos', wrong2: 'La boca', learned: false },
    { question: '¿Qué emoción sentimos cuando estamos contentos y felices?', correct: 'Alegría', wrong1: 'Tristeza', wrong2: 'Miedo', learned: false },
    { question: '¿Qué sentido nos permite ver si es de día o de noche?', correct: 'La vista', wrong1: 'El oído', wrong2: 'El tacto', learned: false },
    { question: '¿Para qué sirve el esqueleto en nuestro cuerpo?', correct: 'Para sostenernos y proteger los órganos', wrong1: 'Solo para crecer el pelo', wrong2: 'Solo para digerir la comida', learned: false },
    { question: '¿Qué emoción sentimos cuando algo nos da miedo?', correct: 'Miedo', wrong1: 'Alegría', wrong2: 'Sorpresa agradable', learned: false },
    { question: '¿Con qué sentido escuchamos la música o las voces?', correct: 'Con el oído', wrong1: 'Con el olfato', wrong2: 'Con el gusto', learned: false }
];
let currentQuestionIndex = -1;
let currentCorrectIndex = -1;
let sessionHits = 0;
let totalHits = 0;
let isProcessing = false;
let isTextInputMode = false;

// Mezclar array (Fisher-Yates)
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Obtener índice aleatorio diferente al actual
function getRandomIndex(excludeIndex) {
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * questions.length);
    } while (newIndex === excludeIndex && questions.length > 1);
    return newIndex;
}

// Iniciar juego
function startGame() {
    sessionHits = 0;
    totalHits = parseInt(localStorage.getItem('totalHits') || '0', 10);
    currentQuestionIndex = -1;
    isTextInputMode = false;
    // Resetear estado aprendido
    questions.forEach(q => q.learned = false);
    updateProgress();
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    showRandomQuestion();
}

// Mostrar pregunta aleatoria
function showRandomQuestion() {
    const newIndex = getRandomIndex(currentQuestionIndex);
    showQuestion(newIndex);
}

// Mostrar pregunta específica
function showQuestion(index) {
    currentQuestionIndex = index;
    const q = questions[index];
    
    // Si ya fue aprendida, mostrar como input de texto
    if (q.learned) {
        showTextInputQuestion(q);
    } else {
        showMultipleChoiceQuestion(q);
    }
}

// Mostrar pregunta de opción múltiple
function showMultipleChoiceQuestion(q) {
    isTextInputMode = false;
    
    const answers = shuffleArray([
        { text: q.correct, isCorrect: true },
        { text: q.wrong1, isCorrect: false },
        { text: q.wrong2, isCorrect: false }
    ]);
    
    currentCorrectIndex = answers.findIndex(a => a.isCorrect);

    document.getElementById('question-text').textContent = q.question;
    document.getElementById('total-questions-count').textContent = questions.length;
    
    // Mostrar botones, ocultar input
    document.getElementById('answers-area').style.display = 'flex';
    document.getElementById('text-input-area').style.display = 'none';
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, i) => {
        btn.textContent = answers[i].text;
        btn.className = 'answer-btn';
        btn.disabled = false;
    });
    isProcessing = false;
}

// Mostrar pregunta de texto
function showTextInputQuestion(q) {
    isTextInputMode = true;
    
    document.getElementById('question-text').textContent = q.question;
    document.getElementById('total-questions-count').textContent = questions.length;
    
    // Ocultar botones, mostrar input
    document.getElementById('answers-area').style.display = 'none';
    document.getElementById('text-input-area').style.display = 'flex';
    
    const input = document.getElementById('text-answer-input');
    input.value = '';
    input.disabled = false;
    input.focus();
    
    isProcessing = false;
}

// Verificar respuesta de opción múltiple
function checkAnswer(selectedIndex) {
    if (isProcessing) return;
    isProcessing = true;

    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);

    const isCorrect = selectedIndex === currentCorrectIndex;
    const overlay = document.getElementById('feedback-overlay');

    if (isCorrect) {
        buttons[selectedIndex].classList.add('correct');
        if (overlay) {
            overlay.style.background = 'rgba(76, 175, 80, 0.3)';
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.display = 'none', 400);
        }
        sessionHits++;
        totalHits++;
        localStorage.setItem('totalHits', totalHits);
        updateProgress();

        // Marcar como aprendida (si no lo estaba ya)
        const wasAlreadyLearned = questions[currentQuestionIndex].learned;
        questions[currentQuestionIndex].learned = true;

        // Verificar si todas están aprendidas
        if (questions.every(q => q.learned)) {
            setTimeout(() => {
                alert('¡Enhorabuena! Lección aprendida. Has completado todas las preguntas.');
                exitToMenu();
            }, 800);
            return;
        }

        // 90% siguiente pregunta aleatoria, 10% repetir la misma
        setTimeout(() => {
            if (Math.random() < 0.1) {
                showQuestion(currentQuestionIndex);
            } else {
                showRandomQuestion();
            }
        }, 600);
    } else {
        buttons[selectedIndex].classList.add('incorrect');
        buttons[currentCorrectIndex].classList.add('correct');
        if (overlay) {
            overlay.style.background = 'rgba(244, 67, 54, 0.3)';
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.display = 'none', 400);
        }

        // Volver a la cola aleatoria (no repetir inmediatamente)
        setTimeout(() => {
            showRandomQuestion();
        }, 800);
    }
}

// Verificar respuesta de texto
function checkTextAnswer() {
    if (isProcessing) return;
    
    const input = document.getElementById('text-answer-input');
    const userAnswer = input.value.trim();
    
    if (userAnswer === '') return;
    
    isProcessing = true;
    input.disabled = true;
    
    const q = questions[currentQuestionIndex];
    const isCorrect = userAnswer.toLowerCase() === q.correct.toLowerCase();
    const overlay = document.getElementById('feedback-overlay');

    if (isCorrect) {
        if (overlay) {
            overlay.style.background = 'rgba(76, 175, 80, 0.3)';
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.display = 'none', 400);
        }
        sessionHits++;
        totalHits++;
        localStorage.setItem('totalHits', totalHits);
        updateProgress();

        // Verificar si todas están aprendidas
        if (questions.every(q => q.learned)) {
            setTimeout(() => {
                alert('¡Enhorabuena! Lección aprendida. Has completado todas las preguntas.');
                exitToMenu();
            }, 800);
            return;
        }

        // 90% siguiente pregunta aleatoria, 10% repetir la misma
        setTimeout(() => {
            if (Math.random() < 0.1) {
                showQuestion(currentQuestionIndex);
            } else {
                showRandomQuestion();
            }
        }, 600);
    } else {
        if (overlay) {
            overlay.style.background = 'rgba(244, 67, 54, 0.3)';
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.display = 'none', 400);
        }

        // Volver a la cola aleatoria (no repetir inmediatamente)
        setTimeout(() => {
            showRandomQuestion();
        }, 800);
    }
}

// Actualizar barra de progreso: 100 / (total preguntas * 2)
function updateProgress() {
    const fill = document.getElementById('progress-bar-fill');
    if (fill && questions.length > 0) {
        const maxProgress = questions.length * 2;
        const percentage = Math.min((sessionHits / maxProgress) * 100, 100);
        fill.style.width = percentage + '%';
    }
    const hDisplay = document.getElementById('session-hits-display');
    if (hDisplay) hDisplay.textContent = sessionHits;
}

function exitToMenu() {
    localStorage.setItem('totalHits', totalHits);
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    loadStats();
}

function exitGame() {
    if (confirm("¿Salir de la sesión? Se guardará tu progreso.")) {
        exitToMenu();
    }
}

function loadStats() {
    totalHits = parseInt(localStorage.getItem('totalHits') || '0', 10);
    const hitsEl = document.getElementById('total-hits');
    if (hitsEl) hitsEl.textContent = totalHits;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // Enter para enviar respuesta de texto
    document.getElementById('text-answer-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkTextAnswer();
        }
    });
});
