// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://phakxkbqbgfuhijkcnxy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sYFREO9jtKjJ7SD-sFVvYQ_rPzPhmZR';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables de estado del juego actual
const HIT_STEPS = 3;              // Aciertos seguidos necesarios para ganar un hit
const MAX_SESSION_HITS = 10;      // La sesión termina al llegar a estos hits
const DAILY_HITS_LIMIT = 50;

// Aquí es normal fallar bastante, así que el objetivo de aciertos es moderado
const PUZZLE_WINDOW = 8;
const PUZZLE_UP_AT = 7;
const PUZZLE_DOWN_AT = 3;

const STORAGE_LEVEL = 'keythink_level';
const STORAGE_PENDING = 'keythink_pending_attempts';

let currentQuestion = null;
let currentAnswer = 0;
let userInput = "";
let isProcessing = false;
let attemptNo = 1;
let questionStartedAt = 0;
let lastQuestionText = "";
let nextStepTimer = null;
let gameRun = 0;                  // Evita que una partida anterior actúe sobre la nueva
let pendingEnd = null;            // Motivo de fin de sesión tras pulsar Siguiente

let puzzleLevel = PUZZLE_LEVEL_MIN;
let puzzleResults = [];           // Últimos primeros intentos del nivel actual

// Variables de sesión
let sessionHits = 0;              // Hits ganados en esta sesión
let sessionQuestions = 0;         // Problemas terminados en esta sesión
let sessionCorrectStreak = 0;     // Racha de aciertos (para la barra de progreso)

document.addEventListener('DOMContentLoaded', async () => {
    injectShopAndDevScreens();
    setPuzzleLevel(readStoredLevel(), false);
    await checkAndSyncDailySession();
    await loadGlobalStats();
    await loadRecentResults();
    flushPendingAttempts();
    setupKeyboardListeners();
    setupDevTrigger();
});

// --- REINICIO DE FLAGS EN INICIO ---
async function resetDevFlagsOnStart() {
    try {
        await supabaseClient.from('user_stats').update({
            dev_warning: false,
            dev_ban: false
        }).eq('id', 1);
    } catch (e) {
        console.error("Error al reiniciar flags de desarrollador:", e);
    }
}

// --- INYECCIÓN DINÁMICA DE INTERFACES (Tienda y Modo Desarrollador) ---
function injectShopAndDevScreens() {
    // 1. Inyectar Pantalla de Tienda si no existe
    if (!document.getElementById('shop-screen')) {
        const shopHTML = `
            <div id="shop-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color:#fff; z-index:9998; flex-direction:column; padding:20px; box-sizing:border-box; overflow-y:auto; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:30px; width:100%; max-width:600px; margin:auto;">
                    <button onclick="closeShopScreen()" style="padding:10px 20px; background:#e53935; color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow: 0 4px 15px rgba(229, 57, 53, 0.4); transition: transform 0.2s, box-shadow 0.2s;">← Volver</button>
                    <h2 style="margin:0; font-size:28px; color:#ffeb3b; text-shadow: 0 2px 10px rgba(255, 235, 59, 0.3);">🛒 Tienda</h2>
                    <div style="font-size: 1.1rem; font-weight: bold; background: rgba(0,0,0,0.3); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <span id="shop-available-hits" style="color: #4CAF50;">0</span> ✅
                    </div>
                </div>
                <div style="max-width:600px; width:100%; margin:20px auto 0 auto; display:flex; flex-direction:column; gap:15px;">
                    <!-- +10 min extra de tablet -->
                    <div id="shop-tablet-container" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 2.5rem;">📱</span>
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem; color: #fff;">+10 min extra de tablet</h3>
                                <p style="margin: 5px 0 0 0; color: #b0bec5; font-size: 0.95rem;">Disfruta de 10 minutos adicionales</p>
                            </div>
                        </div>
                        <button id="shop-tablet-btn" onclick="buyReward('tablet', 100)" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                            Comprar (<span style="color: #4CAF50; font-weight: bold;">100</span> aciertos)
                        </button>
                    </div>
                    <!-- 30 min Nintendo Switch -->
                    <div id="shop-switch-container" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 2.5rem;">🎮</span>
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem; color: #fff;">30 min Nintendo Switch</h3>
                                <p style="margin: 5px 0 0 0; color: #b0bec5; font-size: 0.95rem;">Consigue 30 minutos de juego</p>
                            </div>
                        </div>
                        <button id="shop-switch-btn" onclick="buyReward('switch', 100)" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                            Comprar (<span style="color: #4CAF50; font-weight: bold;">100</span> aciertos)
                        </button>
                    </div>
                    <!-- Ver 1 video de YouTube -->
                    <div id="shop-video-container" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 2.5rem;">🎬</span>
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem; color: #fff;">Ver 1 video de YouTube</h3>
                                <p style="margin: 5px 0 0 0; color: #b0bec5; font-size: 0.95rem;">Mira un video de tu agrado</p>
                            </div>
                        </div>
                        <button id="shop-video-btn" onclick="buyReward('video', 75)" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                            Comprar (<span style="color: #4CAF50; font-weight: bold;">75</span> aciertos)
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', shopHTML);
    }

    // 2. Inyectar Pantalla de Modo Desarrollador si no existe (con opciones de Advertencia y Ban)
    if (!document.getElementById('dev-menu-screen')) {
        const devMenuHTML = `
            <div id="dev-menu-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:#111; color:#fff; z-index:9999; flex-direction:column; padding:20px; box-sizing:border-box; font-family:sans-serif; overflow-y:auto;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                    <button id="dev-back-home" onclick="closeDevMenu()" style="padding:10px 15px; background:#333; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">← Volver</button>
                    <h2 style="margin:0 auto; font-size:20px;">Modo Desarrollador</h2>
                </div>
                <div style="max-width:500px; width:100%; margin:0 auto; display:flex; flex-direction:column; gap:20px;">
                    <!-- Controles de Trampa / Advertencia / Ban -->
                    <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #444;">
                        <h3 style="margin-top:0; color:#ff9800; font-size:16px;">Control de Disciplina</h3>
                        <div style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>⏸️ Pausar el juego 48 h para hablar con él</span>
                                <button id="dev-toggle-warning" onclick="toggleDevWarning()" style="padding:6px 12px; background:#555; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">OFF</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>🚨 Poner todos los aciertos a 0</span>
                                <button id="dev-btn-ban" onclick="triggerDevBan()" style="padding:6px 12px; background:#d32f2f; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Poner a 0</button>
                            </div>
                        </div>
                    </div>

                    <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #444;">
                        <h3 style="margin-top:0; color:#ffeb3b; font-size:16px;">Recompensas Canjeadas</h3>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>📱 Tablet (+10 min)</span>
                                <button id="dev-release-tablet" onclick="releaseReward('tablet')" style="padding:6px 12px; background:#444; color:#777; border:none; border-radius:4px; cursor:not-allowed; font-weight:bold;" disabled>Liberar</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>🎮 Nintendo Switch (30 min)</span>
                                <button id="dev-release-switch" onclick="releaseReward('switch')" style="padding:6px 12px; background:#444; color:#777; border:none; border-radius:4px; cursor:not-allowed; font-weight:bold;" disabled>Liberar</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>🎞 Video YouTube</span>
                                <button id="dev-release-video" onclick="releaseReward('video')" style="padding:6px 12px; background:#444; color:#777; border:none; border-radius:4px; cursor:not-allowed; font-weight:bold;" disabled>Liberar</button>
                            </div>
                        </div>
                    </div>

                    <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #444;">
                        <h3 style="margin-top:0; color:#4CAF50; font-size:16px;">📊 Progreso</h3>
                        <div style="display:flex; align-items:center; gap:10px; margin:10px 0; flex-wrap:wrap;">
                            <span>Nivel actual: <strong id="dev-level">1</strong> de 3</span>
                            <button onclick="changeLevelManually(-1)" style="padding:6px 12px; background:#444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">−</button>
                            <button onclick="changeLevelManually(1)" style="padding:6px 12px; background:#444; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">+</button>
                            <button onclick="downloadAttemptsCsv()" style="padding:6px 12px; background:#2196F3; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Descargar CSV</button>
                        </div>
                        <div id="dev-progress" style="font-size:14px; line-height:1.5;">Cargando…</div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', devMenuHTML);
    }
}

// --- SINCRONIZACIÓN Y ESTADÍSTICAS ---
async function checkAndSyncDailySession() {
    try {
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const { data, error } = await supabaseClient
            .from('user_stats')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error("Error al obtener datos de Supabase:", error);
            return;
        }

        if (data) {
            if (!data.hits_last_date || todayString > data.hits_last_date) {
                await supabaseClient.from('user_stats').update({
                    daily_hits: 0,
                    hits_last_date: todayString
                }).eq('id', data.id);
            }
            if (Number.isInteger(data.think_level)) {
                setPuzzleLevel(data.think_level, false);
            }
            checkWarningBannerUI(data.dev_warning, data.dev_warning_until);
        }
    } catch (e) {
        console.error("Error al sincronizar la sesión diaria:", e);
    }
}

async function loadGlobalStats() {
    try {
        const { data, error } = await supabaseClient
            .from('user_stats')
            .select('*')
            .limit(1)
            .single();

        if (error) {
            console.error("Error al cargar estadísticas:", error);
            return;
        }

        if (data) {
            const hitsEl = document.getElementById('total-hits');
            if (hitsEl) hitsEl.textContent = data.hits !== undefined ? data.hits : 0;
            updateDevWarningButtonUI(data.dev_warning, data.dev_warning_until);
        }
    } catch (e) {
        console.error("Error al cargar estadísticas:", e);
    }
}

// --- NIVEL DE LOS PROBLEMAS ---
function setPuzzleLevel(level, persist = true) {
    if (!Number.isInteger(level)) return;
    puzzleLevel = Math.min(PUZZLE_LEVEL_MAX, Math.max(PUZZLE_LEVEL_MIN, level));
    try { localStorage.setItem(STORAGE_LEVEL, String(puzzleLevel)); } catch (e) { /* sin almacenamiento local */ }
    const levelEl = document.getElementById('dev-level');
    if (levelEl) levelEl.textContent = puzzleLevel;
    if (persist) saveLevel();
}

function readStoredLevel() {
    try {
        const stored = parseInt(localStorage.getItem(STORAGE_LEVEL), 10);
        return Number.isNaN(stored) ? puzzleLevel : stored;
    } catch (e) {
        return puzzleLevel;
    }
}

async function saveLevel() {
    try {
        const { error } = await supabaseClient.from('user_stats').update({ think_level: puzzleLevel }).eq('id', 1);
        if (error) console.warn("No se pudo guardar el nivel en Supabase:", error.message);
    } catch (e) {
        console.warn("No se pudo guardar el nivel en Supabase:", e);
    }
}

async function loadRecentResults() {
    try {
        const { data, error } = await supabaseClient
            .from('think_attempts')
            .select('is_correct')
            .eq('level', puzzleLevel)
            .eq('attempt_no', 1)
            .order('created_at', { ascending: false })
            .limit(PUZZLE_WINDOW);
        if (!error && data) puzzleResults = data.map(row => row.is_correct).reverse();
    } catch (e) {
        console.warn("No se pudo cargar el historial reciente:", e);
    }
}

// Devuelve 'up', 'down' o null
function recordPuzzleResult(isCorrect) {
    puzzleResults.push(isCorrect);
    if (puzzleResults.length > PUZZLE_WINDOW) puzzleResults.shift();
    if (puzzleResults.length < PUZZLE_WINDOW) return null;

    const correct = puzzleResults.filter(Boolean).length;
    let change = null;
    if (correct >= PUZZLE_UP_AT && puzzleLevel < PUZZLE_LEVEL_MAX) change = 'up';
    else if (correct <= PUZZLE_DOWN_AT && puzzleLevel > PUZZLE_LEVEL_MIN) change = 'down';

    if (change) {
        puzzleResults = [];
        setPuzzleLevel(puzzleLevel + (change === 'up' ? 1 : -1));
    }
    return change;
}

// --- REGISTRO DE RESPUESTAS ---
function readPendingAttempts() {
    try {
        const pending = JSON.parse(localStorage.getItem(STORAGE_PENDING) || '[]');
        return Array.isArray(pending) ? pending : [];
    } catch (e) {
        return [];
    }
}

function writePendingAttempts(pending) {
    try { localStorage.setItem(STORAGE_PENDING, JSON.stringify(pending)); } catch (e) { /* sin almacenamiento local */ }
}

function logAttempt(givenAnswer, isCorrect, responseMs) {
    const pending = readPendingAttempts();
    pending.push({
        created_at: new Date().toISOString(),
        level: puzzleLevel,
        op: currentQuestion.op,
        // En las preguntas de elegir se guardan las opciones para poder mostrar qué eligió
        question: currentQuestion.choices && currentQuestion.op !== 'paridad'
            ? `${currentQuestion.text}\nOpciones: ${currentQuestion.choices.join(' | ')}`
            : currentQuestion.text,
        correct_answer: currentAnswer,
        given_answer: givenAnswer,
        is_correct: isCorrect,
        attempt_no: attemptNo,
        response_ms: responseMs
    });
    writePendingAttempts(pending);
    flushPendingAttempts();
}

let isFlushing = false;
async function flushPendingAttempts() {
    if (isFlushing) return;
    const batch = readPendingAttempts();
    if (batch.length === 0) return;
    isFlushing = true;
    let sent = false;
    try {
        const { error } = await supabaseClient.from('think_attempts').insert(batch);
        if (error) {
            console.warn("Respuestas guardadas solo en este dispositivo:", error.message);
        } else {
            writePendingAttempts(readPendingAttempts().slice(batch.length));
            sent = true;
        }
    } catch (e) {
        console.warn("Respuestas guardadas solo en este dispositivo:", e);
    }
    isFlushing = false;
    if (sent && readPendingAttempts().length > 0) flushPendingAttempts();
}

// --- CONTROL DE FLUJO DE JUEGO ---
async function startGame() {
    try {
        const { data } = await supabaseClient.from('user_stats').select('daily_hits, dev_warning, dev_warning_until').single();
        const dailyHits = data && data.daily_hits !== undefined ? data.daily_hits : 0;

        if (data && isPauseActive(data.dev_warning, data.dev_warning_until)) {
            const remainingHours = data.dev_warning_until
                ? Math.ceil((new Date(data.dev_warning_until) - new Date()) / (1000 * 60 * 60))
                : null;
            alert(remainingHours
                ? `⏸️ Key Think está en pausa. Habla con tu familia. Podrás volver a jugar dentro de ${remainingHours} ${remainingHours === 1 ? "hora" : "horas"}.`
                : "⏸️ Key Think está en pausa. Habla con tu familia.");
            return;
        }

        if (dailyHits >= DAILY_HITS_LIMIT) {
            alert("¡Bien hecho por hoy! Descansa y vuelve mañana para seguir practicando.");
            return;
        }

        checkWarningBannerUI(data ? data.dev_warning : false, data ? data.dev_warning_until : null);
    } catch (e) {
        console.error("Error al verificar restricciones de inicio:", e);
    }

    gameRun++;
    clearTimeout(nextStepTimer);
    isProcessing = false;
    pendingEnd = null;
    sessionHits = 0;
    sessionQuestions = 0;
    sessionCorrectStreak = 0;
    updateSessionUI();

    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';

    generateOperation();
}

async function exitGame() {
    gameRun++;
    clearTimeout(nextStepTimer);
    isProcessing = false;
    pendingEnd = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    await loadGlobalStats();
}

function setGameMessage(text) {
    const messageEl = document.getElementById('game-message');
    if (messageEl) messageEl.textContent = text;
}

// Prepara la pantalla: teclado numérico o botones de elegir
function applyQuestionLayout(question) {
    const opText = document.getElementById('operation-text');
    if (opText) opText.style.fontFamily = question.mono ? 'monospace' : '';

    const hasChoices = Array.isArray(question.choices);
    const answerBox = document.getElementById('answer-box');
    if (answerBox) answerBox.style.display = hasChoices ? 'none' : '';
    const numpad = document.getElementById('numpad');
    if (numpad) numpad.style.display = hasChoices ? 'none' : 'grid';
    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) checkBtn.style.display = hasChoices ? 'none' : '';
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';

    const choiceArea = document.getElementById('choice-area');
    if (choiceArea) {
        choiceArea.innerHTML = '';
        choiceArea.style.display = hasChoices ? 'flex' : 'none';
        if (hasChoices) {
            question.choices.forEach((label, index) => {
                const button = document.createElement('button');
                button.textContent = label;
                button.style.cssText = 'padding: 15px 30px; font-size: 1.2rem; font-weight: bold; background: #2196F3; color: white; border: none; border-radius: 8px; cursor: pointer;';
                button.onclick = () => chooseAnswer(index);
                choiceArea.appendChild(button);
            });
        }
    }
}

function chooseAnswer(index) {
    if (isProcessing) return;
    userInput = String(index);
    validateAnswer();
}

function generateOperation() {
    userInput = "";
    attemptNo = 1;
    setGameMessage("");
    const userInputEl = document.getElementById('user-input');
    if (userInputEl) userInputEl.textContent = userInput;

    // Consulta sin bloquear si se ha activado la pausa durante la partida
    supabaseClient.from('user_stats').select('dev_warning, dev_warning_until').limit(1).single()
        .then(({ data }) => { if (data) checkWarningBannerUI(data.dev_warning, data.dev_warning_until); })
        .catch(e => console.error("Error al comprobar la pausa:", e));

    let question = generatePuzzle(puzzleLevel);
    while (question.text === lastQuestionText) {
        question = generatePuzzle(puzzleLevel);
    }
    lastQuestionText = question.text;
    currentQuestion = question;
    currentAnswer = question.answer;

    const opText = document.getElementById('operation-text');
    if (opText) opText.textContent = question.text;

    applyQuestionLayout(question);
    questionStartedAt = Date.now();
}

function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen || gameScreen.style.display === 'none') return;
        const nextBtn = document.getElementById('next-btn');
        if (e.key === 'Enter' && nextBtn && nextBtn.style.display !== 'none') {
            nextPuzzle();
            return;
        }
        if (isProcessing) return;

        if (e.key >= '0' && e.key <= '9') {
            numkeyPress(parseInt(e.key, 10));
        } else if (e.key === 'Backspace') {
            numkeyBackspace();
        } else if (e.key === 'Enter') {
            validateAnswer();
        }
    });
}

// --- TECLADO NUMÉRICO TÁCTIL ---
function numkeyPress(num) {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || gameScreen.style.display === 'none') return;
    if (isProcessing || (currentQuestion && currentQuestion.choices)) return;
    
    if (userInput.length < 3) {
        userInput += num.toString();
        document.getElementById('user-input').textContent = userInput;
    }
}

function numkeyClear() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || gameScreen.style.display === 'none') return;
    if (isProcessing) return;
    
    userInput = "";
    document.getElementById('user-input').textContent = userInput;
}

function numkeyBackspace() {
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || gameScreen.style.display === 'none') return;
    if (isProcessing) return;
    
    userInput = userInput.slice(0, -1);
    document.getElementById('user-input').textContent = userInput;
}

// --- FUNCIONES DE SESIÓN Y BARRA DE PROGRESO ---
function updateSessionUI() {
    const questionsEl = document.getElementById('session-questions-count');
    if (questionsEl) questionsEl.textContent = sessionQuestions;

    const hitsEl = document.getElementById('session-hits-display');
    if (hitsEl) hitsEl.textContent = sessionHits;

    const progressFill = document.getElementById('progress-bar-fill');
    if (progressFill) {
        progressFill.style.width = (sessionCorrectStreak / HIT_STEPS) * 100 + '%';
    }
}

function showPlusOneIndicator() {
    const indicator = document.getElementById('plus-one-indicator');
    if (indicator) {
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 800);
    }
}

function endSession(reason) {
    let message = "";
    if (reason === 'session_hits') {
        message = `¡Sesión completada! Has ganado ${sessionHits} hits en ${sessionQuestions} problemas.`;
    } else if (reason === 'daily_limit') {
        message = "¡Bien hecho por hoy! Descansa y vuelve mañana para seguir practicando.";
    }

    alert(message);
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    isProcessing = false;
    pendingEnd = null;
    loadGlobalStats();
}

function flashFeedback(color) {
    const overlay = document.getElementById('feedback-overlay');
    if (overlay) {
        overlay.style.background = color;
        overlay.style.display = 'block';
        setTimeout(() => overlay.style.display = 'none', 400);
    }
}

function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) sound.play().catch(() => {});
}

// Guarda un hit. Devuelve true si se ha alcanzado el límite diario.
async function saveHit() {
    try {
        const { data, error } = await supabaseClient.from('user_stats').select('hits, daily_hits').single();
        if (error || !data) throw error || new Error('Sin datos');
        const dailyHits = (data.daily_hits || 0) + 1;
        const { error: updateError } = await supabaseClient.from('user_stats').update({
            hits: (data.hits || 0) + 1,
            daily_hits: dailyHits
        }).eq('id', 1);
        if (updateError) throw updateError;
        return dailyHits >= DAILY_HITS_LIMIT;
    } catch (e) {
        console.error("Error al guardar el hit:", e);
        return false;
    }
}

// Pulsar Siguiente pasa al próximo problema o cierra la sesión
function nextPuzzle() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = 'none';
    sessionQuestions++;
    updateSessionUI();
    if (pendingEnd) {
        endSession(pendingEnd);
        return;
    }
    generateOperation();
    isProcessing = false;
}

async function validateAnswer() {
    if (userInput === "" || isProcessing) return;
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen || gameScreen.style.display === 'none') return;
    isProcessing = true;

    const run = gameRun;
    const userVal = parseInt(userInput, 10);
    const isCorrect = (userVal === currentAnswer);
    logAttempt(userVal, isCorrect, Date.now() - questionStartedAt);

    // Solo se avisa al subir: una bajada de nivel se hace sin que se note
    const levelChange = attemptNo === 1 ? recordPuzzleResult(isCorrect) : null;
    const levelUpText = levelChange === 'up' ? ' ⬆️ ¡Subes de nivel!' : '';

    playSound(isCorrect ? 'snd-correct' : 'snd-error');
    flashFeedback(isCorrect ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.25)');

    if (!isCorrect) {
        // Igual que en Key Math: un fallo reinicia la racha
        sessionCorrectStreak = 0;
        updateSessionUI();
        userInput = "";
        document.getElementById('user-input').textContent = userInput;

        if (attemptNo === 1) {
            attemptNo = 2;
            setGameMessage(currentQuestion.hint);
            nextStepTimer = setTimeout(() => {
                if (run !== gameRun) return;
                questionStartedAt = Date.now();
                isProcessing = false;
            }, 400);
            return;
        }
    } else {
        sessionCorrectStreak++;
        updateSessionUI();
        if (sessionCorrectStreak >= HIT_STEPS) {
            sessionCorrectStreak = 0;
            sessionHits++;
            showPlusOneIndicator();
            updateSessionUI();
            const reachedDailyLimit = await saveHit();
            if (run !== gameRun) return;
            const hitsEl = document.getElementById('total-hits');
            if (hitsEl) hitsEl.textContent = parseInt(hitsEl.textContent, 10) + 1;
            if (reachedDailyLimit) pendingEnd = 'daily_limit';
            else if (sessionHits >= MAX_SESSION_HITS) pendingEnd = 'session_hits';
        }
    }

    // Al terminar el problema se explica el porqué y se espera a que el niño quiera seguir
    const start = isCorrect ? '¡Bien pensado!' : `Era ${currentQuestion.choices ? currentQuestion.choices[currentAnswer] : currentAnswer}.`;
    setGameMessage(`${start} ${currentQuestion.explain}${levelUpText}`);
    for (const id of ['choice-area', 'numpad', 'check-btn']) {
        const element = document.getElementById(id);
        if (element) element.style.display = 'none';
    }
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.style.display = '';
}

// --- PANEL DE PROGRESO (Modo Desarrollador) ---
const OP_LABELS = {
    paridad: 'Par o impar',
    hacia_atras: 'Hacia atrás',
    patron: 'Patrones',
    conteo: 'Contar',
    simbolos: 'Símbolos',
    cuadricula: 'Cuadrículas',
    espacial: 'Visión espacial',
    problema: 'Problemas'
};

async function fetchAllAttempts() {
    let rows = [];
    let tableMissing = false;
    try {
        const { data, error } = await supabaseClient
            .from('think_attempts')
            .select('created_at, level, op, question, correct_answer, given_answer, is_correct, attempt_no, response_ms')
            .order('created_at', { ascending: false })
            .limit(1000);
        if (error) tableMissing = true;
        else rows = data || [];
    } catch (e) {
        tableMissing = true;
    }
    const pending = readPendingAttempts();
    return { rows: pending.concat(rows).sort((a, b) => (a.created_at < b.created_at ? 1 : -1)), tableMissing, pendingCount: pending.length };
}

function median(values) {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function escapeHtml(value) {
    const holder = document.createElement('div');
    holder.textContent = String(value);
    return holder.innerHTML;
}

function statRow(label, rows) {
    const correct = rows.filter(row => row.is_correct).length;
    const percent = Math.round((correct / rows.length) * 100);
    const seconds = (median(rows.map(row => row.response_ms)) / 1000).toFixed(1);
    return `<tr><td style="padding:3px 8px 3px 0;">${escapeHtml(label)}</td><td style="padding:3px 8px; text-align:right;">${rows.length}</td><td style="padding:3px 8px; text-align:right;">${percent} %</td><td style="padding:3px 0 3px 8px; text-align:right;">${seconds} s</td></tr>`;
}

async function renderProgressPanel() {
    const panel = document.getElementById('dev-progress');
    if (!panel) return;
    const levelEl = document.getElementById('dev-level');
    if (levelEl) levelEl.textContent = puzzleLevel;

    const { rows, tableMissing, pendingCount } = await fetchAllAttempts();
    let html = '';
    if (tableMissing) {
        html += `<p style="color:#ff9800; margin:0 0 10px 0;">Falta crear la tabla en Supabase (supabase_think_attempts.sql). ${pendingCount} respuestas guardadas solo en este dispositivo.</p>`;
    }

    const first = rows.filter(row => row.attempt_no === 1);
    if (first.length === 0) {
        panel.innerHTML = html + 'Todavía no hay respuestas registradas.';
        return;
    }

    const head = '<tr style="color:#b0bec5;"><th style="text-align:left; padding:3px 8px 3px 0;">Primer intento</th><th style="text-align:right; padding:3px 8px;">Total</th><th style="text-align:right; padding:3px 8px;">Bien</th><th style="text-align:right; padding:3px 0 3px 8px;">Tiempo*</th></tr>';
    let body = statRow('Todos', first);
    for (const op of Object.keys(OP_LABELS)) {
        const opRows = first.filter(row => row.op === op);
        if (opRows.length) body += statRow(OP_LABELS[op], opRows);
    }
    html += `<div style="overflow-x:auto;"><table style="width:100%; border-collapse:collapse;">${head}${body}</table></div>`;
    html += '<p style="color:#b0bec5; margin:6px 0 12px 0;">*Tiempo mediano. Se muestran hasta las últimas 1000 respuestas.</p>';

    const errors = first.filter(row => !row.is_correct).slice(0, 10);
    if (errors.length) {
        html += '<strong>Últimos fallos</strong><ul style="margin:6px 0 0 18px;">';
        for (const row of errors) {
            const [question, options] = String(row.question).split('\nOpciones: ');
            const labels = row.op === 'paridad' ? ['Par', 'Impar'] : (options ? options.split(' | ') : null);
            const show = value => (labels && labels[value] !== undefined ? labels[value] : value);
            html += `<li>${escapeHtml(question.replace(/\s*\n\s*/g, ' '))} → puso ${escapeHtml(show(row.given_answer))} (era ${escapeHtml(show(row.correct_answer))})</li>`;
        }
        html += '</ul>';
    }
    panel.innerHTML = html;
}

async function downloadAttemptsCsv() {
    const { rows } = await fetchAllAttempts();
    if (rows.length === 0) {
        alert("Todavía no hay respuestas registradas.");
        return;
    }
    const columns = ['created_at', 'level', 'op', 'question', 'correct_answer', 'given_answer', 'is_correct', 'attempt_no', 'response_ms'];
    const lines = [columns.join(',')];
    for (const row of rows) {
        lines.push(columns.map(column => `"${String(row[column]).replace(/"/g, '""')}"`).join(','));
    }
    // El BOM hace que Excel lea bien los símbolos × y ÷
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keythink-respuestas.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function changeLevelManually(delta) {
    puzzleResults = [];
    setPuzzleLevel(puzzleLevel + delta);
}

// --- SISTEMA DE TIENDA Y COMPRA ---
window.openShopScreen = async function() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'flex';
    const currentHitsVal = document.getElementById('total-hits').textContent;
    const shopHitsEl = document.getElementById('shop-available-hits');
    if (shopHitsEl) shopHitsEl.textContent = currentHitsVal;
    if (typeof loadGlobalStats === 'function') await loadGlobalStats();
    await updateShopUIStates();
};

window.closeShopScreen = function() {
    document.getElementById('shop-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    if (typeof loadGlobalStats === 'function') loadGlobalStats();
};

async function buyReward(type, cost) {
    let rewardName = 'Recompensa';
    if (type === 'tablet') rewardName = '+10 min extra de tablet';
    else if (type === 'video') rewardName = 'Ver 1 video de YouTube';
    else if (type === 'switch') rewardName = '30 min Nintendo Switch';
    
    if (!confirm(`¿Estás seguro de comprar "${rewardName}" por ${cost} aciertos?`)) return;
    try {
        const { data: stats, error: fetchError } = await supabaseClient.from('user_stats').select('id, hits, tablet_redeemed, video_redeemed, switch_redeemed').single();
        if (fetchError || !stats) { alert("No se pudieron verificar tus datos."); return; }
        if (stats.hits < cost) { alert("❌ No tienes suficientes aciertos."); return; }
        if (stats[`${type}_redeemed`]) { alert("⚠️ Esta recompensa ya ha sido canjeada."); return; }
        
        const updateData = { hits: stats.hits - cost };
        updateData[`${type}_redeemed`] = true;
        await supabaseClient.from('user_stats').update(updateData).eq('id', stats.id);
        alert("¡Compra realizada con éxito! 🎉");
        await updateShopUIStates();
    } catch (e) {
        console.error("Error al procesar la compra:", e);
    }
}

async function releaseReward(type) {
    try {
        const { data: stats, error: fetchError } = await supabaseClient.from('user_stats').select('id, tablet_redeemed, tablet_released, video_redeemed, video_released, switch_redeemed, switch_released').single();
        if (fetchError || !stats) return;
        const updateData = {};
        updateData[`${type}_released`] = true;
        await supabaseClient.from('user_stats').update(updateData).eq('id', stats.id);
        await updateShopUIStates();
    } catch (e) {
        console.error("Error al liberar recompensa:", e);
    }
}

async function updateShopUIStates() {
    try {
        const { data: stats, error } = await supabaseClient.from('user_stats').select('*').limit(1).single();
        if (error || !stats) return;
        
        const totalHits = stats.hits !== undefined ? stats.hits : 0;
        const totalHitsEl = document.getElementById('total-hits');
        if (totalHitsEl) totalHitsEl.textContent = totalHits;
        const shopHitsEl = document.getElementById('shop-available-hits');
        if (shopHitsEl) shopHitsEl.textContent = totalHits;
        
        applyRewardUIState('tablet', stats.tablet_redeemed, stats.tablet_released, 100);
        applyRewardUIState('switch', stats.switch_redeemed, stats.switch_released, 100);
        applyRewardUIState('video', stats.video_redeemed, stats.video_released, 75);
        updateDevWarningButtonUI(stats.dev_warning, stats.dev_warning_until);
    } catch (e) {
        console.error("Error al actualizar UI tienda:", e);
    }
}

function applyRewardUIState(type, redeemed, released, cost) {
    const btn = document.getElementById(`shop-${type}-btn`);
    const devBtn = document.getElementById(`dev-release-${type}`);
    if (devBtn) {
        if (redeemed && !released) {
            devBtn.style.background = "#4CAF50"; devBtn.disabled = false; devBtn.style.cursor = "pointer";
        } else {
            devBtn.style.background = "#444"; devBtn.disabled = true; devBtn.style.cursor = "not-allowed";
        }
    }
    if (btn) {
        if (redeemed && released) {
            btn.textContent = "Agotado"; btn.onclick = () => alert("Vuelve la semana que viene");
        } else if (redeemed && !released) {
            btn.textContent = "Canjeado"; btn.onclick = () => alert("Ya canjeado.");
        } else {
            btn.innerHTML = `Comprar (<span style="color: #4CAF50; font-weight: bold;">${cost}</span> aciertos)`;
            btn.onclick = () => buyReward(type, cost);
        }
    }
}

// --- MODO DESARROLLADOR ---
function setupDevTrigger() {
    const triggerSpan = document.getElementById('dev-trigger');
    if (!triggerSpan) return;
    let clickCount = 0;
    let clickTimer = null;
    triggerSpan.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        if (clickCount >= 7) {
            clickCount = 0;
            openDevMenu();
        } else {
            clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
        }
    });
}

async function openDevMenu() {
    document.getElementById('home-screen').style.display = 'none';
    const gameScreen = document.getElementById('game-screen');
    if (gameScreen) gameScreen.style.display = 'none';
    
    document.getElementById('dev-menu-screen').style.display = 'flex';
    await loadGlobalStats();
    await updateShopUIStates();
    await renderProgressPanel();
}

window.closeDevMenu = function() {
    document.getElementById('dev-menu-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    if (typeof loadGlobalStats === 'function') loadGlobalStats();
};

// --- NUEVAS FUNCIONES DE ADVERTENCIA Y BAN EN MODO DESARROLLADOR ---
async function toggleDevWarning() {
    try {
        const { data, error } = await supabaseClient.from('user_stats').select('id, dev_warning, dev_warning_until').single();
        
        // Si la columna no existe, mostrar error claro
        if (error) {
            console.error("Error en toggleDevWarning:", error);
            if (error.message && error.message.includes('dev_warning_until')) {
                alert("⚠ Error: La columna 'dev_warning_until' no existe en Supabase.\n\nEjecuta este SQL en el editor de Supabase:\n\nALTER TABLE user_stats ADD COLUMN IF NOT EXISTS dev_warning_until TIMESTAMPTZ;");
            } else {
                alert("⚠ Error al acceder a Supabase: " + error.message);
            }
            return;
        }
        
        if (!data) return;
        
        const recordId = data.id;
        const currentWarning = data.dev_warning;
        
        // Verificar si la advertencia está activa y no ha expirado
        let isCurrentlyActive = currentWarning;
        if (isCurrentlyActive && data.dev_warning_until) {
            const until = new Date(data.dev_warning_until);
            if (until <= new Date()) {
                isCurrentlyActive = false;
            }
        }
        
        // Si está activa y no ha expirado, permitir cancelar el ban
        if (isCurrentlyActive) {
            const { error: cancelError } = await supabaseClient.from('user_stats').update({ 
                dev_warning: false,
                dev_warning_until: null
            }).eq('id', recordId);
            
            if (cancelError) {
                console.error("Error al cancelar advertencia:", cancelError);
                alert("⚠ Error al cancelar: " + cancelError.message);
                return;
            }
            
            alert("Pausa QUITADA. Ya puede volver a jugar.");
            updateDevWarningButtonUI(false, null);
            return;
        }
        
        // Activar advertencia con expiración a 48 horas
        const warningUntil = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: updateError } = await supabaseClient.from('user_stats').update({ 
            dev_warning: true,
            dev_warning_until: warningUntil
        }).eq('id', recordId);
        
        if (updateError) {
            console.error("Error al activar advertencia:", updateError);
            alert("⚠ Error al guardar en Supabase: " + updateError.message);
            return;
        }
        
        alert("Pausa ACTIVADA. No podrá jugar durante 48 horas. Recuerda hablarlo con él.");
        updateDevWarningButtonUI(true, warningUntil);
    } catch (e) {
        console.error("Error al cambiar estado de advertencia:", e);
        alert("⚠ Error inesperado: " + e.message);
    }
}

function updateDevWarningButtonUI(isWarningActive, warningUntil) {
    try {
        const warningBtn = document.getElementById('dev-toggle-warning');
        if (warningBtn) {
            // Verificar si la advertencia está activa y no ha expirado
            let isActive = isWarningActive;
            if (isActive && warningUntil) {
                const until = new Date(warningUntil);
                if (until <= new Date()) {
                    isActive = false;
                }
            }
            
            if (isActive) {
                // Advertencia activa: se puede pulsar para CANCELAR
                warningBtn.textContent = "ON";
                warningBtn.style.background = "#ff9800";
                warningBtn.disabled = false;
                warningBtn.style.cursor = "pointer";
                warningBtn.style.opacity = "1";
                warningBtn.title = "Pulsa para quitar la pausa";
            } else {
                // Desactivada o expirada: se puede activar
                warningBtn.textContent = "OFF";
                warningBtn.style.background = "#555";
                warningBtn.disabled = false;
                warningBtn.style.cursor = "pointer";
                warningBtn.style.opacity = "1";
                warningBtn.title = "";
            }
        }
        checkWarningBannerUI(isWarningActive, warningUntil);
    } catch (e) {
        console.error("Error en updateDevWarningButtonUI:", e);
    }
}

function isPauseActive(isWarningActive, warningUntil) {
    if (!isWarningActive) return false;
    return !warningUntil || new Date(warningUntil) > new Date();
}

function checkWarningBannerUI(isWarningActive, warningUntil) {
    const banner = document.getElementById('cheat-warning-banner');
    if (banner) {
        banner.style.display = isPauseActive(isWarningActive, warningUntil) ? 'block' : 'none';
    }
}

async function triggerDevBan() {
    if (!confirm("¿Estás seguro de poner todos los aciertos a 0?")) return;
    try {
        await supabaseClient.from('user_stats').update({
            hits: 0,
            daily_hits: 0,
            dev_warning: false,
            dev_warning_until: null,
            dev_ban: true
        }).eq('id', 1);

        alert("Los aciertos se han puesto a 0.");

        const hitsEl = document.getElementById('total-hits');
        if (hitsEl) hitsEl.textContent = 0;

        document.getElementById('dev-menu-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';

        await loadGlobalStats();
    } catch (e) {
        console.error("Error al poner los aciertos a 0:", e);
    }
}
