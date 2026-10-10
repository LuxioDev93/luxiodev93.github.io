// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://phakxkbqbgfuhijkcnxy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sYFREO9jtKjJ7SD-sFVvYQ_rPzPhmZR';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables de estado del juego actual
// Variables de estado del juego actual
let currentAnswer = 0;
let userInput = "";
let isProcessing = false;
let questionsInRound = 0; // NUEVO: Contador de preguntas en la ronda actual

// Variables de sesión
let sessionHits = 0;           // Hits ganados en esta sesión
let sessionQuestions = 0;      // Preguntas respondidas en esta sesión
let sessionCorrectStreak = 0;  // Racha de aciertos (para la barra de progreso)
const MAX_SESSION_QUESTIONS = 15; // Máximo de preguntas por sesión

document.addEventListener('DOMContentLoaded', async () => {
    injectShopAndDevScreens();
    await checkAndSyncDailyMathSession();
    await loadGlobalStats();
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
                    <!-- +1 Vida -->
                    <div id="shop-life-container" style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 2.5rem;">❤️</span>
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem; color: #fff;">+1 Vida Math</h3>
                                <p style="margin: 5px 0 0 0; color: #b0bec5; font-size: 0.95rem;">Recupera una vida para seguir jugando</p>
                            </div>
                        </div>
                        <button onclick="buyLife()" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 1rem; transition: background 0.2s; box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);">
                            Comprar (<span style="color: #4CAF50; font-weight: bold;">50</span> aciertos)
                        </button>
                    </div>
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
                                <span>⚠ Activar Advertencia</span>
                                <button id="dev-toggle-warning" onclick="toggleDevWarning()" style="padding:6px 12px; background:#555; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">OFF</button>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>🚨 Botón Rojo de BAN (Puntos y Vidas a 0)</span>
                                <button id="dev-btn-ban" onclick="triggerDevBan()" style="padding:6px 12px; background:#d32f2f; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">¡EJECUTAR BAN!</button>
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
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', devMenuHTML);
    }
}

// --- SINCRONIZACIÓN Y ESTADÍSTICAS ---
async function checkAndSyncDailyMathSession() {
    try {
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        // Obtenemos el registro (usamos .limit(1).single() para asegurar que traiga el registro correcto)
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
            let recordId = data.id; // Guardamos el ID real de la tabla
            let lastDate = data.lives_numb_last_login_date;
            let currentLives = data.lives_numb !== undefined && data.lives_numb !== null ? data.lives_numb : 5;
            let hitsLastDate = data.hits_last_date;

            let updates = {};
            if (!hitsLastDate || todayString > hitsLastDate) {
                updates.daily_hits = 0;
                updates.hits_last_date = todayString;
            }

            if (!lastDate || todayString > lastDate) {
                const lastDateObj = new Date(lastDate || todayString);
                const diffTime = Math.abs(todayObj - lastDateObj);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (currentLives <= 0) {
                    currentLives = 1;
                } else if (diffDays >= 2 || (lastDate && diffDays % 2 === 0)) {
                    if (currentLives < 5) {
                        currentLives += 1;
                    }
                }
                updates.lives_numb = currentLives;
                updates.lives_numb_last_login_date = todayString;
            }

            if (Object.keys(updates).length > 0) {
                await supabaseClient.from('user_stats').update(updates).eq('id', recordId);
            }
            
            updateLivesDisplay(currentLives);
            checkWarningBannerUI(data.dev_warning);
        }
    } catch (e) {
        console.error("Error al sincronizar la sesión diaria:", e);
    }
}
function updateLivesDisplay(lives) {
    const livesEl = document.getElementById('total-lives');
    if (livesEl) livesEl.textContent = lives;

    const gameLivesEl = document.getElementById('game-lives-count');
    if (gameLivesEl) gameLivesEl.textContent = lives;
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
            updateLivesDisplay(data.lives_numb !== undefined ? data.lives_numb : 5);
            checkWarningBannerUI(data.dev_warning);
            updateDevWarningButtonUI(data.dev_warning, data.dev_warning_until);
        }
    } catch (e) {
        console.error("Error al cargar estadísticas:", e);
    }
}

// --- CONTROL DE FLUJO DE JUEGO ---
async function startGame() {
    try {
        const { data } = await supabaseClient.from('user_stats').select('lives_numb, daily_hits, dev_warning, dev_warning_until').single();
        const currentLives = data && data.lives_numb !== undefined ? data.lives_numb : 5;
        const dailyHits = data && data.daily_hits !== undefined ? data.daily_hits : 0;

        // Verificar si la advertencia está activa y no ha expirado
        if (data && data.dev_warning && data.dev_warning_until) {
            const warningUntil = new Date(data.dev_warning_until);
            if (warningUntil > new Date()) {
                const remainingHours = Math.ceil((warningUntil - new Date()) / (1000 * 60 * 60));
                alert(`⚠ Advertencia: se ha detectado trampa. No podrás jugar hasta dentro de ${remainingHours} horas.`);
                return;
            }
        }

        if (currentLives <= 0) {
            alert("No te quedan vidas en Key Math, inténtalo más adelante.");
            return;
        }

        if (dailyHits >= 50) {
            alert("¡Bien hecho por hoy! Descansa y vuelve mañana para seguir practicando.");
            return;
        }
        
        checkWarningBannerUI(data ? data.dev_warning : false);
    } catch (e) {
        console.error("Error al verificar restricciones de inicio:", e);
    }

    questionsInRound = 0; // NUEVO: Reiniciamos las preguntas de la ronda al empezar
    
    // Inicializar sesión
    sessionHits = 0;
    sessionQuestions = 0;
    sessionCorrectStreak = 0;
    updateSessionUI();
    
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    
    generateOperation();
}

async function confirmExitGame() {
    const deseaSalir = confirm("Si sales de la pantalla de juego perderás una vida. ¿Deseas salir de todas formas?");
    if (!deseaSalir) return;

    try {
        const { data: stats } = await supabaseClient.from('user_stats').select('lives_numb').single();
        let currentL = stats && stats.lives_numb !== undefined ? stats.lives_numb : 5;
        let newLives = Math.max(0, currentL - 1);
        await supabaseClient.from('user_stats').update({ lives_numb: newLives }).eq('id', 1);
        updateLivesDisplay(newLives);
    } catch (e) {
        console.error("Error al restar vida al salir:", e);
    }

    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    await loadGlobalStats();
}

async function generateOperation() {
    userInput = "";
    const userInputEl = document.getElementById('user-input');
    if (userInputEl) userInputEl.textContent = userInput;

    // Consultamos en tiempo real si la advertencia está activada en Supabase
    try {
        const { data } = await supabaseClient.from('user_stats').select('dev_warning').limit(1).single();
        if (data) {
            checkWarningBannerUI(data.dev_warning);
        }
    } catch (e) {
        console.error("Error al comprobar advertencia en nueva operación:", e);
    }

    // Probabilidad: 45% Multiplicación (1-4), 5% Suma 2cifras (5), 25% Suma 10-20+1cifra (6-8), 25% Resta 10-20-1cifra (9-10)
    const prob = Math.floor(Math.random() * 100) + 1;
    let num1, num2, operator;

    if (prob <= 45) {
        // 45%: Multiplicación de números entre 2 y 9
        num1 = Math.floor(Math.random() * 8) + 2;
        num2 = Math.floor(Math.random() * 8) + 2;
        operator = "×";
        currentAnswer = num1 * num2;
    } else if (prob <= 50) {
        // 5%: Suma de números de 2 cifras (15-99 + 15-99), evitando combinaciones triviales
        num1 = Math.floor(Math.random() * 85) + 15;
        num2 = Math.floor(Math.random() * 85) + 15;
        // Evitar sumas demasiado fáciles (dígitos pequeños en ambos)
        while ((num1 % 10 <= 2 && num2 % 10 <= 2) || (num1 < 30 && num2 < 30)) {
            num1 = Math.floor(Math.random() * 85) + 15;
            num2 = Math.floor(Math.random() * 85) + 15;
        }
        operator = "+";
        currentAnswer = num1 + num2;
    } else if (prob <= 75) {
        // 25%: Suma número 10-20 + número 1 cifra (2-9)
        num1 = Math.floor(Math.random() * 11) + 10;
        num2 = Math.floor(Math.random() * 8) + 2;
        operator = "+";
        currentAnswer = num1 + num2;
    } else {
        // 25%: Resta número 10-20 - número 1 cifra (2-9), sin negativos
        num1 = Math.floor(Math.random() * 11) + 10;
        num2 = Math.floor(Math.random() * 8) + 2;
        if (num1 <= num2) {
            num1 = num2 + Math.floor(Math.random() * 5) + 1;
        }
        operator = "-";
        currentAnswer = num1 - num2;
    }

    const opText = document.getElementById('operation-text');
    if (opText) opText.textContent = `${num1} ${operator} ${num2}`;
}

function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen || gameScreen.style.display === 'none') return;
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
    if (isProcessing) return;
    
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
        const percentage = (sessionCorrectStreak / 3) * 100;
        progressFill.style.width = percentage + '%';
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
    if (reason === 'questions') {
        message = `¡Sesión completada! Has respondido ${sessionQuestions} preguntas y ganado ${sessionHits} hits.`;
    } else if (reason === 'lives') {
        message = `¡Te has quedado sin vidas! Ganaste ${sessionHits} hits en esta sesión.`;
    } else if (reason === 'daily_limit') {
        message = "¡Bien hecho por hoy! Descansa y vuelve mañana para seguir practicando.";
    }
    
    alert(message);
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    isProcessing = false;
}

async function validateAnswer() {
    if (userInput === "" || isProcessing) return;
    isProcessing = true;

    const userVal = parseInt(userInput, 10);
    const isCorrect = (userVal === currentAnswer);

    const sndCorrect = document.getElementById('snd-correct');
    const sndError = document.getElementById('snd-error');
    const overlay = document.getElementById('feedback-overlay');

    try {
        const { data } = await supabaseClient.from('user_stats').select('hits, lives_numb, daily_hits').single();
        let hits = data && data.hits !== undefined ? data.hits : 0;
        let currentLives = data && data.lives_numb !== undefined ? data.lives_numb : 5;
        let dailyHits = data && data.daily_hits !== undefined ? data.daily_hits : 0;

        // Incrementar contador de preguntas de la sesión
        sessionQuestions++;

        if (isCorrect) {
            if (sndCorrect) sndCorrect.play();
            if (overlay) {
                overlay.style.background = 'rgba(76, 175, 80, 0.3)';
                overlay.style.display = 'block';
                setTimeout(() => overlay.style.display = 'none', 400);
            }
            
            // Incrementar racha y barra de progreso
            sessionCorrectStreak++;
            updateSessionUI();
            
            // Si se completa la racha de 3, sumar hit y mostrar +1
            if (sessionCorrectStreak >= 3) {
                sessionCorrectStreak = 0;
                sessionHits++;
                hits++;
                dailyHits++;
                
                showPlusOneIndicator();
                updateSessionUI();
                
                await supabaseClient.from('user_stats').update({ 
                    hits: hits, 
                    daily_hits: dailyHits 
                }).eq('id', 1);

                await loadGlobalStats();

                // Verificar límite diario
                if (dailyHits >= 50) {
                    setTimeout(() => {
                        endSession('daily_limit');
                    }, 800);
                    return;
                }
            }
            
            // Verificar si se alcanzó el máximo de preguntas
            if (sessionQuestions >= MAX_SESSION_QUESTIONS) {
                setTimeout(() => {
                    endSession('questions');
                }, 800);
                return;
            }
            
            setTimeout(() => {
                generateOperation();
                isProcessing = false;
            }, 600);

        } else {
            if (sndError) sndError.play();
            if (overlay) {
                overlay.style.background = 'rgba(244, 67, 54, 0.3)';
                overlay.style.display = 'block';
                setTimeout(() => overlay.style.display = 'none', 400);
            }
            
            // Resetear racha y barra de progreso al fallar
            sessionCorrectStreak = 0;
            updateSessionUI();
            
            currentLives = Math.max(0, currentLives - 1);

            await supabaseClient.from('user_stats').update({ 
                lives_numb: currentLives 
            }).eq('id', 1);

            await loadGlobalStats();
            
            userInput = "";
            document.getElementById('user-input').textContent = userInput;

            // Verificar si se acabaron las vidas
            if (currentLives <= 0) {
                setTimeout(() => {
                    endSession('lives');
                }, 800);
                return;
            }

            // Verificar si se alcanzó el máximo de preguntas
            if (sessionQuestions >= MAX_SESSION_QUESTIONS) {
                setTimeout(() => {
                    endSession('questions');
                }, 800);
                return;
            }

            setTimeout(() => {
                isProcessing = false;
            }, 400);
        }
    } catch (e) {
        console.error("Error al procesar la respuesta:", e);
        isProcessing = false;
    }
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

window.buyLife = async function() {
    if (!confirm("¿Deseas confirmar la compra de +1 vida math por 50 aciertos?")) return;
    try {
        const { data: stats, error } = await supabaseClient.from('user_stats').select('*').limit(1).single();
        if (error || !stats) { alert("Error al obtener los datos de la cuenta."); return; }
        const currentHits = stats.hits || 0;
        const currentLives = stats.lives_numb !== undefined ? stats.lives_numb : 5;
        if (currentHits < 50) { alert("No tienes suficientes aciertos (necesitas 50)."); return; }
        const newHits = currentHits - 50;
        const newLives = currentLives + 1;
        const queryId = stats.id !== undefined ? stats.id : 1;
        const { error: updateError } = await supabaseClient.from('user_stats').update({ hits: newHits, lives_numb: newLives }).eq('id', queryId);
        if (updateError) { alert("Error al procesar la compra en la base de datos."); return; }
        alert("¡Compra realizada con éxito! Has sumado 1 vida math.");
        if (typeof loadGlobalStats === 'function') loadGlobalStats();
        await updateShopUIStates();
    } catch (e) {
        console.error("Error en la compra:", e);
    }
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
        updateDevWarningButtonUI(stats.dev_warning);
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
            
            alert("Advertencia de trampa CANCELADA. El ban ha sido removido.");
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
        
        alert("Advertencia de trampa ACTIVADA. No podrás jugar durante 48 horas.");
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
                warningBtn.title = "Pulsa para cancelar el ban de 48h";
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
        checkWarningBannerUI(isWarningActive);
    } catch (e) {
        console.error("Error en updateDevWarningButtonUI:", e);
    }
}

function checkWarningBannerUI(isWarningActive) {
    const banner = document.getElementById('cheat-warning-banner');
    if (banner) {
        banner.style.display = isWarningActive ? 'block' : 'none';
    }
}

async function triggerDevBan() {
    if (!confirm("¿Estás seguro de ejecutar el BAN? Esto pondrá todos los aciertos y vidas a 0.")) return;
    try {
        await supabaseClient.from('user_stats').update({
            hits: 0,
            lives_numb: 0,
            daily_hits: 0,
            dev_warning: false,
            dev_ban: true
        }).eq('id', 1);

        alert("¡PENALIZACIÓN APLICADA! Se han establecido los puntos y vidas a 0.");
        
        // Actualizar UI localmente
        updateLivesDisplay(0);
        const hitsEl = document.getElementById('total-hits');
        if (hitsEl) hitsEl.textContent = 0;
        
        // Cerrar pantallas y volver al inicio
        document.getElementById('dev-menu-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';
        
        await loadGlobalStats();
    } catch (e) {
        console.error("Error al ejecutar el ban:", e);
    }
}
