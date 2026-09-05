// --- CONFIGURACIÓN DE SUPABASE ---
        const SUPABASE_URL = 'https://phakxkbqbgfuhijkcnxy.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_sYFREO9jtKjJ7SD-sFVvYQ_rPzPhmZR';

        const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Variables de sesión de juego actuales para guardar al terminar
let sessionHits = 0;
let sessionErrors = 0;

const musicData = [
    {
        title: "Go Faster",
        img: "https://i.pinimg.com/736x/24/45/77/244577ccb37755b78041b12efeffbcbb.jpg",
        author: "Cuco Club",
        audio: "https://files.catbox.moe/c1zzpz.mp3",
        lyrics: "https://luxiodev93.github.io/lyrics/gofaster.txt"
    },
    {
        title: "The 93 Kid",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYfzIVWK9NsW8H0eQphVVROPF5a24JZIbXzKwcK0c2k1UpxZmb-HWe_J4&s=10", 
        audio: "https://files.catbox.moe/wsi3j6.mp3",
        lyrics: "https://luxiodev93.github.io/lyrics/b93.txt"
    },
            {
            title: "Garacias a Dios hay Chamba",
            img: "https://i.pinimg.com/736x/47/dd/0b/47dd0bc9355f6a01608eee68e5cc021c.jpg",
            author: "Dani Chalán",
            audio: "https://files.catbox.moe/c8gzwv.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics_eng/haychamba_eng.txt"
        }
];

const fakeMeanings = ["camino", "piedra", "puerta", "fuerza", "viento", "sombra", "canción", "fuego", "estrella", "tiempo", "eterno", "salto"];

const manualDictionary = {
    "every": "cada",
    "melody": "melodía",
    "beats": "ritmos",
    "beat": "ritmo",
    "song": "canción",
    "songs": "canciones",
    "night": "noche",
    "nights": "noches",
    "day": "día",
    "Spanish": "español",
    "days": "días",
    "time": "tiempo",
    "times": "veces",
    "world": "mundo",
    "super": "súper",
    "more": "más",
    "life": "vida",
    "play": "jugar",
    "code": "código",
    "heart": "corazón",
    "pocket":"bolsillo",
    "Dial-up":"subir el dial",
    "build": "construir",
"little": "pequeño",
"STARTING": "empezando",
"BETTER": "mejor",
"get": "conseguir"
"WEAR": "llevar puesto"
"miss": "perder"
"WORKING": "trabajando"
    "fire": "fuego"
};

// Lista negra para excluir palabras no deseadas u onomatopeyas
const blacklistedWords = [
    "heyoh",
    "oh",
    "spinning",
    "cenar",
    "churros",
    "had",
"not",
"im",
"Cause",
"THERES",
"SAYING",
"be",
"thats",
"MAY",
    "Pokemon",
    "hey",
    "to",
    "Goku",
    "Madrid",
    "calle",
    "my",
    "tv",
	"caf",
    "the",
    "up",
    "ah",
    "yeah",
    "la",
    "nah",
    "PARQUE",
    "sailor",
    "oreja",
    "MACARENA",
    "INSTITUTO",
    "Limewire",
    "Cuatro",
    "Caminos",
    "EGB",
    "crisis",
    "al",
    "salir",
    "de",
    "clase",
    "TIKTOK",
    "Tamagotchi",
    "msn",
    "hombres",
    "va",
    "los",
    "simpsons",
    "MAMA'S",
    "HEY",
    "KAMEHAMEHA",
    "da"
];

let currentSong = null;
let lrcLines = []; 
let targetWords = [];
let currentWordTargetIndex = 0;
let isPausedForQuiz = false;

// Variables para el modo desarrollador
let devSelectedSong = null;
let devValidWordsList = [];
let devCurrentWordIndex = 0;

function isEnglishWord(word) {
    const cleanW = word.toLowerCase().trim();
    if (blacklistedWords.includes(cleanW)) {
        return false;
    }
    
    // Rechazar automáticamente cualquier palabra que contenga tildes o la letra 'ñ'
    const hasAccentsOrÑ = /[áéíóúñÁÉÍÓÚÑ]/.test(word);
    if (hasAccentsOrÑ) {
        return false;
    }

    const englishRegex = /^[a-zA-Z']+$/;
    return englishRegex.test(word);
}

async function fetchTranslation(word) {
    let cleanWord = word.toLowerCase().trim();
    
    if (manualDictionary[cleanWord]) {
        return manualDictionary[cleanWord];
    }

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|es`);
        const data = await response.json();
        
        if (data && data.responseData && data.responseData.translatedText) {
            let translation = data.responseData.translatedText.toLowerCase().trim();
            
            if (translation === cleanWord) {
                if (cleanWord.endsWith('s') && manualDictionary[cleanWord.slice(0, -1)]) {
                    return manualDictionary[cleanWord.slice(0, -1)];
                }
            }

            if (cleanWord.endsWith('er') && !translation.startsWith('más ') && !translation.startsWith('menos ')) {
                if (translation === "rapido" || translation === "rápido") translation = "más rápido";
            }
            
            return translation;
        }
    } catch (e) {
        console.error("Error al conectar con la API de traducción:", e);
    }
    
    return word;
}

async function parseLRC(lrcUrl) {
    if (!lrcUrl) return [];
    let lrcText = lrcUrl;
    if (lrcUrl.startsWith('http://') || lrcUrl.startsWith('https://')) {
        try {
            const response = await fetch(lrcUrl);
            if (!response.ok) throw new Error('Error al descargar letra');
            lrcText = await response.text();
        } catch (error) {
            console.error('No se pudo cargar la letra:', error);
            return [];
        }
    }

    const rawLines = lrcText.replace(/\r\n/g, '\n').split('\n');
    const parsed = [];
    const timeReg = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

    rawLines.forEach(line => {
        const match = line.match(timeReg);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const millisPart = match[3];
            const milliseconds = parseInt(millisPart.length === 2 ? millisPart * 10 : millisPart, 10);
            const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;

            const cleanText = line.replace(timeReg, '').trim();
            if (cleanText) {
                parsed.push({ time: totalSeconds, text: cleanText });
            }
        }
    });

    parsed.sort((a, b) => a.time - b.time);
    return parsed;
}

document.addEventListener('DOMContentLoaded', () => {
    injectDevScreens();
    setupDevTrigger();
    loadGlobalStats(); // Cargar estadísticas de Supabase al iniciar
});

// --- FUNCIONES DE SUPABASE PARA ESTADÍSTICAS Y CORRECCIÓN ---
async function loadGlobalStats() {
    try {
        const { data, error } = await supabaseClient
            .from('user_stats')
            .select('hits, errors')
            .single();

        if (data) {
            const hitsEl = document.getElementById('total-hits');
            const errorsEl = document.getElementById('total-errors');
            if (hitsEl) hitsEl.textContent = data.hits || 0;
            if (errorsEl) errorsEl.textContent = data.errors || 0;
        }
    } catch (e) {
        console.error("Error al cargar estadísticas de Supabase:", e);
    }
}

async function openCorrectionScreen() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('correction-screen').style.display = 'flex';
    
    const container = document.getElementById('correction-content');
    container.innerHTML = `<p style="text-align:center; color:#b0bec5;">Cargando palabras falladas...</p>`;

    try {
        const { data: failedWords, error } = await supabaseClient.from('failed_words').select('*');

        if (!failedWords || failedWords.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#4CAF50; font-size:1.2rem;">¡No tienes palabras pendientes de corrección! Buen trabajo.</p>`;
            return;
        }

        container.innerHTML = "";
        failedWords.forEach((item) => {
            const card = document.createElement('div');
            card.className = 'correction-card';
            card.style.cssText = "background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 12px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);";
            
            const wordTitle = document.createElement('div');
            wordTitle.style.cssText = "font-size: 1.6rem; color: #ffeb3b; font-weight: bold; text-transform: uppercase;";
            wordTitle.textContent = item.word;
            card.appendChild(wordTitle);

            const promptText = document.createElement('div');
            promptText.textContent = "¿Cuál es su traducción?";
            promptText.style.color = "#b0bec5";
            card.appendChild(promptText);

            const optionsContainer = document.createElement('div');
            optionsContainer.style.cssText = "display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;";

            let options = [item.translation];
            while (options.length < 3) {
                let randomFake = fakeMeanings[Math.floor(Math.random() * fakeMeanings.length)];
                if (!options.includes(randomFake) && randomFake !== item.translation) {
                    options.push(randomFake);
                }
            }
            options.sort(() => Math.random() - 0.5);

            options.forEach(opt => {
                const optBtn = document.createElement('button');
                optBtn.style.cssText = "background-color: #2196F3; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: background 0.2s;";
                optBtn.textContent = opt;
                optBtn.onclick = async () => {
                    if (opt === item.translation) {
                        optBtn.style.background = "#4CAF50";
                        
                        // Restar error, sumar acierto en Supabase
                        const { data: stats } = await supabaseClient.from('user_stats').select('hits, errors').single();
                        if (stats) {
                            await supabaseClient.from('user_stats').update({
                                hits: (stats.hits || 0) + 1,
                                errors: Math.max(0, (stats.errors || 0) - 1)
                            }).eq('id', 1);
                        }

                        // Eliminar de palabras falladas
                        await supabaseClient.from('failed_words').delete().eq('id', item.id);

                        setTimeout(() => {
                            openCorrectionScreen();
                            loadGlobalStats();
                        }, 800);
                    } else {
                        optBtn.style.background = "#e53935";
                    }
                };
                optionsContainer.appendChild(optBtn);
            });

            card.appendChild(optionsContainer);
            container.appendChild(card);
        });

    } catch (e) {
        container.innerHTML = `<p style="text-align:center; color:#e53935;">Error al conectar con la base de datos.</p>`;
    }
}

function closeCorrectionScreen() {
    document.getElementById('correction-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    loadGlobalStats();
}

// --- RESTO DE TUS IMPLEMENTACIONES ORIGINALES ---

function injectDevScreens() {
    if (!document.getElementById('dev-menu-screen')) {
        const devMenuHTML = `
            <div id="dev-menu-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:#111; color:#fff; z-index:9999; flex-direction:column; padding:20px; box-sizing:border-box; font-family:sans-serif;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                    <button id="dev-back-home" style="padding:10px 15px; background:#333; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">← Volver</button>
                    <h2 style="margin:0 auto; font-size:20px;">Modo Desarrollador - Selector de Canciones</h2>
                </div>
                <div id="dev-songs-list" style="display:flex; flex-direction:column; gap:10px; max-width:400px; margin:0 auto; width:100%;"></div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', devMenuHTML);
    }

    if (!document.getElementById('dev-word-screen')) {
        const devWordHTML = `
            <div id="dev-word-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:#111; color:#fff; z-index:9999; flex-direction:column; justify-content:space-between; padding:15px; box-sizing:border-box; font-family:sans-serif;">
                <div>
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:10px;">
                        <button id="dev-back-menu" style="padding:8px 12px; background:#333; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">← Menú</button>
                        <h3 id="dev-song-title-display" style="margin:0; font-size:16px; color:#aaa; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:40%;"></h3>
                        <div style="display:flex; gap:5px;">
                            <button id="dev-prev-word-btn" style="padding:8px 12px; background:#444; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">←</button>
                            <button id="dev-next-word-btn" style="padding:8px 12px; background:#4CAF50; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">→</button>
                        </div>
                    </div>
                    
                    <div id="dev-lyrics-container" style="max-height: 38vh; overflow-y: auto; background: #1a1a1a; padding: 15px; border-radius: 8px; border: 1px solid #333; display: flex; flex-direction: column; gap: 12px;">
                        <p style="text-align:center; color:#778;">Cargando letra...</p>
                    </div>
                </div>

                <div style="text-align:center; background:#222; padding:12px; border-radius:10px; border:1px solid #444;">
                    <div style="display:flex; justify-content:space-around; align-items:center;">
                        <div>
                            <span style="font-size:12px; color:#aaa;">Palabra:</span>
                            <h2 id="dev-word-display" style="margin:2px 0 0 0; font-size:24px; color:#ffeb3b; text-transform:uppercase;">---</h2>
                        </div>
                        <div style="border-left: 1px solid #444; height: 35px;"></div>
                        <div>
                            <span style="font-size:12px; color:#aaa;">Traducción:</span>
                            <h2 id="dev-translation-display" style="margin:2px 0 0 0; font-size:24px; color:#4CAF50;">---</h2>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', devWordHTML);
    }

    document.getElementById('dev-back-home').onclick = () => {
        document.getElementById('dev-menu-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';
    };

    document.getElementById('dev-back-menu').onclick = () => {
        document.getElementById('dev-word-screen').style.display = 'none';
        document.getElementById('dev-menu-screen').style.display = 'flex';
    };

    document.getElementById('dev-next-word-btn').onclick = () => {
        navigateDevWord(1);
    };

    document.getElementById('dev-prev-word-btn').onclick = () => {
        navigateDevWord(-1);
    };
}

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
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1000);
        }
    });
}

function openDevMenu() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    
    const listContainer = document.getElementById('dev-songs-list');
    listContainer.innerHTML = "";

    musicData.forEach((song) => {
        const btn = document.createElement('button');
        btn.textContent = `${song.title} - ${song.author}`;
        btn.style.padding = "15px";
        btn.style.background = "#222";
        btn.style.color = "#fff";
        btn.style.border = "1px solid #444";
        btn.style.borderRadius = "8px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "16px";
        btn.style.textAlign = "left";

        btn.onclick = () => loadSongIntoDev(song);
        listContainer.appendChild(btn);
    });

    document.getElementById('dev-menu-screen').style.display = 'flex';
}

async function loadSongIntoDev(song) {
    devSelectedSong = song;
    document.getElementById('dev-menu-screen').style.display = 'none';
    document.getElementById('dev-word-screen').style.display = 'flex';
    document.getElementById('dev-song-title-display').textContent = song.title;
    
    const lyricsContainer = document.getElementById('dev-lyrics-container');
    lyricsContainer.innerHTML = `<p style="text-align:center; color:#778;">Procesando letra...</p>`;
    
    document.getElementById('dev-word-display').textContent = "...";
    document.getElementById('dev-translation-display').textContent = "...";

    try {
        const lines = await parseLRC(song.lyrics);
        devValidWordsList = [];
        lyricsContainer.innerHTML = "";

        lines.forEach((item) => {
            const lineDiv = document.createElement('div');
            lineDiv.style.marginBottom = "8px";
            lineDiv.style.lineHeight = "1.6";

            const rawTokens = item.text.split(/(\s+)/);

            rawTokens.forEach(token => {
                if (/^\s+$/.test(token)) {
                    lineDiv.appendChild(document.createTextNode(token));
                    return;
                }

                let cleanW = token.replace(/[^a-zA-Z']/g, '');
                const isValid = cleanW.length >= 2 && isEnglishWord(cleanW);

                const span = document.createElement('span');
                span.textContent = token;
                span.style.padding = "2px 5px";
                span.style.borderRadius = "4px";
                span.style.margin = "0 1px";
                span.style.display = "inline-block";
                span.style.fontSize = "15px";

                if (isValid) {
                    span.style.background = "rgba(46, 125, 50, 0.35)";
                    span.style.border = "1px solid rgba(76, 175, 80, 0.6)";
                    span.style.color = "#fff";
                    span.style.cursor = "pointer";

                    const wordEntry = {
                        word: cleanW,
                        element: span
                    };
                    devValidWordsList.push(wordEntry);
                    const currentValidIndex = devValidWordsList.length - 1;

                    span.onclick = () => {
                        devCurrentWordIndex = currentValidIndex;
                        updateDevActiveSelection();
                    };
                } else {
                    span.style.background = "rgba(183, 28, 28, 0.25)";
                    span.style.border = "1px solid rgba(244, 67, 54, 0.4)";
                    span.style.color = "#aaa";
                }

                lineDiv.appendChild(span);
            });

            lyricsContainer.appendChild(lineDiv);
        });

        devCurrentWordIndex = 0;
        if (devValidWordsList.length > 0) {
            updateDevActiveSelection();
        } else {
            document.getElementById('dev-word-display').textContent = "N/A";
            document.getElementById('dev-translation-display').textContent = "Ninguna palabra válida";
        }
    } catch (e) {
        lyricsContainer.innerHTML = `<p style="text-align:center; color:#f44336;">Error al cargar la letra.</p>`;
    }
}

async function updateDevActiveSelection() {
    if (devValidWordsList.length === 0) return;

    devValidWordsList.forEach((item, idx) => {
        if (idx === devCurrentWordIndex) {
            item.element.style.background = "rgba(76, 175, 80, 0.8)";
            item.element.style.boxShadow = "0 0 8px rgba(76, 175, 80, 0.8)";
            item.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            const cleanW = item.word;
            if (cleanW.length >= 2 && isEnglishWord(cleanW)) {
                item.element.style.background = "rgba(46, 125, 50, 0.35)";
                item.element.style.boxShadow = "none";
            }
        }
    });

    const activeEntry = devValidWordsList[devCurrentWordIndex];
    document.getElementById('dev-word-display').textContent = activeEntry.word.toUpperCase();
    document.getElementById('dev-translation-display').textContent = "Traduciendo...";

    const translation = await fetchTranslation(activeEntry.word);
    
    if (devValidWordsList[devCurrentWordIndex] === activeEntry) {
        document.getElementById('dev-translation-display').textContent = translation;
    }
}

function navigateDevWord(direction) {
    if (devValidWordsList.length === 0) return;
    devCurrentWordIndex += direction;
    if (devCurrentWordIndex >= devValidWordsList.length) {
        devCurrentWordIndex = 0;
    } else if (devCurrentWordIndex < 0) {
        devCurrentWordIndex = devValidWordsList.length - 1;
    }
    updateDevActiveSelection();
}

window.startGame = async function() {
    currentSong = musicData[Math.floor(Math.random() * musicData.length)];
    sessionHits = 0;
    sessionErrors = 0;
    
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('lyric-text').textContent = "Cargando letra y sincronizando...";

    try {
        lrcLines = await parseLRC(currentSong.lyrics);
        if (lrcLines.length === 0) throw new Error("La letra está vacía.");
        
        let startLineIdx = 0;
        const totalLines = lrcLines.length;
        
        if (totalLines > 1) {
            let threeQuarters = Math.floor(totalLines * 0.75);
            if (threeQuarters < 1) threeQuarters = 1;
            
            let maxLine1Based = threeQuarters;
            if (maxLine1Based % 2 === 0) {
                maxLine1Based -= 1;
            }
            if (maxLine1Based < 1) maxLine1Based = 1;

            let oddLines1Based = [];
            for (let i = 1; i <= maxLine1Based; i += 2) {
                oddLines1Based.push(i);
            }

            if (oddLines1Based.length > 0) {
                let randomOdd1Based = oddLines1Based[Math.floor(Math.random() * oddLines1Based.length)];
                startLineIdx = randomOdd1Based - 1;
            }
        }

        processGameWords(startLineIdx + 1);

        document.getElementById('player-bg').style.backgroundImage = `url('${currentSong.img}')`;
        
        const audio = document.getElementById('game-audio');
        audio.src = currentSong.audio;
        audio.load();

        audio.onloadedmetadata = () => {
            document.getElementById('lyric-text').textContent = "";
            
            if (lrcLines[startLineIdx]) {
                audio.currentTime = lrcLines[startLineIdx].time;
            }

            audio.play().catch(() => {
                console.warn("Autoplay bloqueado.");
            });
        };

    } catch (error) {
        alert("Error al cargar los recursos de la canción.");
        location.reload();
    }
}

window.exitGame = function() {
    const audio = document.getElementById('game-audio');
    audio.pause();
    audio.currentTime = 0;
    isPausedForQuiz = false;
    sessionHits = 0;
    sessionErrors = 0;

    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
}

function processGameWords(startIndex = 0) {
    targetWords = [];
    let lineValidity = [];

    // Precalcular qué líneas tienen palabras válidas
    lrcLines.forEach((item, idx) => {
        let hasValidWord = false;
        const words = item.text.split(/\s+/);
        for (let w of words) {
            let cleanW = w.replace(/[^a-zA-Z']/g, '');
            if (cleanW.length >= 2 && isEnglishWord(cleanW)) {
                hasValidWord = true;
                break;
            }
        }
        lineValidity[idx] = hasValidWord;
    });

    let selected = [];
    let currentIndex = startIndex; 

    while (selected.length < 5 && currentIndex < lrcLines.length) {
        let targetLineIdx = -1;

        // 1. Se elige una línea siguiendo las reglas (se verifica si tiene palabras válidas, si no, se prueba con la siguiente)
        let checkIdx = currentIndex;
        while (checkIdx < lrcLines.length) {
            if (lineValidity[checkIdx]) {
                targetLineIdx = checkIdx;
                break;
            }
            checkIdx++;
        }

        // Si encontramos una línea con palabras válidas
        if (targetLineIdx !== -1) {
            let item = lrcLines[targetLineIdx];
            let words = item.text.split(/\s+/);
            let validCandidatesInLine = [];
            
            words.forEach((w, wIdx) => {
                let cleanW = w.replace(/[^a-zA-Z']/g, '');
                if (cleanW.length >= 2 && isEnglishWord(cleanW)) {
                    validCandidatesInLine.push({ lrcIdx: targetLineIdx, wordIdx: wIdx, word: cleanW, time: item.time });
                }
            });

            // 2. Si tiene palabras válidas, se toma una al azar
            if (validCandidatesInLine.length > 0) {
                let chosenWord = validCandidatesInLine[Math.floor(Math.random() * validCandidatesInLine.length)];
                selected.push(chosenWord);
                
                // 3. Elegir una línea aleatoria entre (posición actual + 2) y (posición actual + 4)
                let randomJump = Math.floor(Math.random() * 3) + 2; // Genera 2, 3 o 4
                currentIndex = targetLineIdx + randomJump;
            } else {
                // Si por alguna razón la línea marcada como válida no devolvió candidatos, avanzamos a la siguiente
                currentIndex = targetLineIdx + 1;
            }
        } else {
            // Si ya no quedan líneas válidas hacia adelante, rompemos el bucle
            break;
        }
    }

    targetWords = selected;
    targetWords.sort((a, b) => a.time - b.time);
    currentWordTargetIndex = 0;

    setupAudioTriggers();
}

function setupAudioTriggers() {
    const audio = document.getElementById('game-audio');
    
    audio.ontimeupdate = () => {
        const currentTime = audio.currentTime;
        let activeLineText = "";
        for (let i = lrcLines.length - 1; i >= 0; i--) {
            if (currentTime >= lrcLines[i].time) {
                activeLineText = lrcLines[i].text;
                break;
            }
        }

        if (!isPausedForQuiz) {
            document.getElementById('lyric-text').textContent = activeLineText;

            if (targetWords.length > 0 && currentWordTargetIndex < targetWords.length) {
                const targetObj = targetWords[currentWordTargetIndex];
                if (currentTime >= targetObj.time) {
                    pauseForQuiz(targetObj);
                }
            }
        }
    };
}

async function pauseForQuiz(targetObj) {
    const audio = document.getElementById('game-audio');
    audio.pause();
    isPausedForQuiz = true;

    document.getElementById('game-status').textContent = "Traduciendo palabra...";
    document.getElementById('quiz-word-target').textContent = targetObj.word.toUpperCase();
    
    const correctMeaning = await fetchTranslation(targetObj.word);

    document.getElementById('game-status').textContent = "¡Pregunta de Vocabulario!";
    
    const quizContainer = document.getElementById('quiz-container');
    const optionsContainer = document.getElementById('quiz-options');
    optionsContainer.innerHTML = "";

    let options = [correctMeaning];
    while (options.length < 3) {
        let randomFake = fakeMeanings[Math.floor(Math.random() * fakeMeanings.length)];
        if (!options.includes(randomFake) && randomFake !== correctMeaning) {
            options.push(randomFake);
        }
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt === correctMeaning, btn, optionsContainer, correctMeaning, targetObj.word);
        optionsContainer.appendChild(btn);
    });

    quizContainer.style.display = 'flex';
}

async function checkAnswer(isCorrect, selectedBtn, container, correctMeaning, targetWord) {
    const buttons = container.querySelectorAll('.btn-option');
    buttons.forEach(b => b.disabled = true);

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        sessionHits++;
    } else {
        selectedBtn.classList.add('incorrect');
        sessionErrors++;
        // Guardar palabra fallada en Supabase
        await supabaseClient.from('failed_words').insert([
            { word: targetWord.toLowerCase(), translation: correctMeaning }
        ]);

        buttons.forEach(b => {
            if (b.textContent === correctMeaning) {
                b.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        document.getElementById('quiz-container').style.display = 'none';
        isPausedForQuiz = false;
        currentWordTargetIndex++;

        if (currentWordTargetIndex >= targetWords.length) {
            endGame();
        } else {
            document.getElementById('game-status').textContent = "Escuchando canción...";
            document.getElementById('game-audio').play();
        }
    }, 1500);
}

async function endGame() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';
    document.getElementById('final-stats').innerHTML = `¡Has completado todas las preguntas de la canción!<br><br>🟢 Aciertos en esta sesión: <b>${sessionHits}</b><br>🔴 Errores en esta sesión: <b style="color:#f44336;">${sessionErrors}</b>`;

    // Sumar los acumulados de la sesión al total en Supabase
    try {
        const { data } = await supabaseClient.from('user_stats').select('hits, errors').single();
        const currentHits = data ? (data.hits || 0) : 0;
        const currentErrors = data ? (data.errors || 0) : 0;

        await supabaseClient.from('user_stats').update({
            hits: currentHits + sessionHits,
            errors: currentErrors + sessionErrors
        }).eq('id', 1);

        loadGlobalStats();
    } catch (e) {
        console.error("Error al actualizar estadísticas globales en Supabase:", e);
    }
}