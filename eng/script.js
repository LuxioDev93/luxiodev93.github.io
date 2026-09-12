// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://phakxkbqbgfuhijkcnxy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sYFREO9jtKjJ7SD-sFVvYQ_rPzPhmZR';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables de sesión y diccionario remoto
let sessionHits = 0;
let sessionErrors = 0;
let remoteDictionary = {};

const musicData = [
    {
        title: "Go Faster",
        img: "https://i.pinimg.com/736x/24/45/77/244577ccb37755b78041b12efeffbcbb.jpg",
        author: "Cuco Club",
        audio: "https://files.catbox.moe/c1zzpz.mp3",
        lyrics: "https://luxiodev93.github.io/lyrics/gofaster.txt"
    },
	{
  title: "Days We'll Not Forget",
  img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500",
  audio: "https://files.catbox.moe/tvxyos.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/dynf.txt",
},
	{
  title: "Large Old Town",
  img: "https://img.goodfon.com/wallpaper/big/5/68/velikobritaniya-shotlandiya-1728.webp",
  audio: "https://files.catbox.moe/1xiz4s.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/lotwn.txt",
},
	{
  title: "Life is Wonderful",
  img: "https://img.magnific.com/free-photo/world-smile-day-emojis-arrangement_23-2149024492.jpg?semt=ais_hybrid&w=740&q=80",
  audio: "https://files.catbox.moe/t8xn28.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/lifewnr.txt",
},
	{
  title: "Music and Nature",
  img: "https://static.vecteezy.com/system/resources/thumbnails/069/717/060/small/guitar-resting-porch-step-surrounded-by-vibrant-sunflowers-and-scenic-countryside-view-evokes-free-photo.jpeg",
  audio: "https://files.catbox.moe/klu9f0.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/MandN.txt",
},
	{
  title: "a great day",
  img: "https://media.istockphoto.com/id/2165330008/photo/white-fluffy-clouds.jpg?s=612x612&w=0&k=20&c=IRYIsGm1waLJi_HZfI2aQy4blBvgSzmtteQ_00hzXNA=",
  audio: "https://files.catbox.moe/y4441b.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/agreatday.txt",
},

	{
  title: "Choose my way",
  img: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500",
  audio: "https://files.catbox.moe/od97w2.mp3",
  lyrics: "https://luxiodev93.github.io/lyrics_eng/chosmw.txt",
},
	{
title: "This is my world",
img: "https://i.pinimg.com/736x/68/b7/29/68b72937564071dbf236fddbf50f6eca.jpg", 
audio: "https://files.catbox.moe/e3mvij.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/myworld.txt"
},

	{
title: "Hello class",
img: "https://img.magnific.com/free-photo/students-knowing-right-answer_329181-14271.jpg?semt=ais_hybrid&w=740&q=80", 
audio: "https://files.catbox.moe/35wlts.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/helloclass.txt"
},

{
title: "The 93 Kid",
img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYfzIVWK9NsW8H0eQphVVROPF5a24JZIbXzKwcK0c2k1UpxZmb-HWe_J4&s=10", 
audio: "https://files.catbox.moe/wsi3j6.mp3",
lyrics: "https://luxiodev93.github.io/lyrics/b93.txt"
},
	        {
            title: "Mi amiga jirafa",
            img: "https://i.ibb.co/4gSHTwqk/ac10f775-2e77-4c77-80b6-5edf4d7bd647-92.jpg", 
            author: "Cuco Club",
			audio: "https://files.catbox.moe/12cey1.mp3",
			lyrics: "https://luxiodev93.github.io/lyrics_eng/amjirf.txt",
			coments: "https://luxiodev93.github.io/coments/amjirf.txt"
        },
{
title: "Garacias a Dios hay Chamba",
img: "https://i.pinimg.com/736x/47/dd/0b/47dd0bc9355f6a01608eee68e5cc021c.jpg",
author: "Dani Chalán",
audio: "https://files.catbox.moe/c8gzwv.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/haychamba_eng.txt"
},
{
title: "Gallina Terrenal",
img: "https://i.ibb.co/8LY8GCMM/gallina-terrenal.jpg",
author: "Cuco Club",
audio: "https://files.catbox.moe/dshlsc.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/galterr.txt",
coments: "https://badluchothree-glitch.github.io/coments/galterr.txt"
},
{
title: "Serpiente Serpiente",
img: "https://i.ibb.co/99bMDDdC/Aco25sp.jpg", 
author: "Cuco Club",
audio: "https://files.catbox.moe/trc9s0.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/serpt.txt",
coments: "https://luxiodev93.github.io/coments/serpt.txt"
},
{
title: "Level 99 Slitherbreak",
img: "https://i.ytimg.com/vi/jBcDBwkV0b8/maxresdefault.jpg",
author: "Cuco Club",
audio: "https://files.catbox.moe/yumn7z.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/Slitherbrk.txt",
coments: "https://luxiodev93.github.io/coments/Slitherbrk.txt"
},
{
title: "Level 99 Heartbreak",
img: "https://cdn2.suno.ai/image_large_461b78ad-9841-440a-b5f3-b5ba6876e9d8.jpeg", 
author: "No Respawn",
audio: "https://files.catbox.moe/s9455p.mp3",
lyrics: "https://luxiodev93.github.io/lyrics_eng/lvl99hrbk.txt",
coments: "https://luxiodev93.github.io/coments/lvl99hrbk.txt"
}
];

const fakeMeanings = ["camino", "piedra", "puerta", "fuerza", "viento", "sombra", "canción", "fuego", "estrella", "tiempo", "eterno", "salto"];

let currentSong = null;
let lrcLines = []; 
let targetWords = [];
let currentWordTargetIndex = 0;
let isPausedForQuiz = false;

async function loadRemoteDictionary() {
    try {
        const response = await fetch('https://luxiodev93.github.io/diccionario/diccionario.txt');
        if (response.ok) {
            remoteDictionary = await response.json();
        }
    } catch (e) {
        console.error("Error al cargar el diccionario remoto:", e);
    }
}

function isEnglishWord(word) {
    const cleanW = word.toLowerCase().trim();
    return remoteDictionary.hasOwnProperty(cleanW);
}

async function fetchTranslation(word) {
    const cleanWord = word.toLowerCase().trim();
    return remoteDictionary[cleanWord] || word;
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

document.addEventListener('DOMContentLoaded', async () => {
    await loadRemoteDictionary();
    injectDevScreens();
    setupDevTrigger();
    loadGlobalStats(); 
    await checkAndSyncDailyLives();
    await checkWeeklyRewardsStatus();
});

// Función matemática en JS para calcular la semana ISO actual del año
function getCurrentWeekNumber() {
    const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

// --- SISTEMA DE RECOMPENSAS SEMANALES ---
async function checkWeeklyRewardsStatus() {
    try {
        const currentWeek = getCurrentWeekNumber();
        const { data: stats, error } = await supabaseClient
            .from('user_stats')
            .select('id, week_number, tablet_redeemed, tablet_released, video_redeemed, video_released')
            .single();

        if (error || !stats) return;

        let dbWeek = stats.week_number || 0;

        // Si ha comenzado una nueva semana, reiniciamos los estados semanales
        if (dbWeek !== currentWeek) {
            await supabaseClient.from('user_stats').update({
                week_number: currentWeek,
                tablet_redeemed: false,
                tablet_released: false,
                video_redeemed: false,
                video_released: false
            }).eq('id', stats.id);
        }
    } catch (e) {
        console.error("Error al verificar estado semanal de recompensas:", e);
    }
}

// --- SISTEMA DE VIDAS Y SINCRONIZACIÓN DIARIA ---
async function checkAndSyncDailyLives() {
    try {
        const todayObj = new Date();
        const year = todayObj.getFullYear();
        const month = String(todayObj.getMonth() + 1).padStart(2, '0');
        const day = String(todayObj.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;

        const { data } = await supabaseClient
            .from('user_stats')
            .select('lives, last_login_date')
            .single();

        if (data) {
            let lastDate = data.last_login_date;
            let currentLives = data.lives !== undefined && data.lives !== null ? data.lives : 5;

            if (!lastDate || todayString > lastDate) {
                if (currentLives < 5) {
                    currentLives = 5;
                }
                await supabaseClient.from('user_stats').update({
                    lives: currentLives,
                    last_login_date: todayString
                }).eq('id', 1);
            }
            updateLivesDisplay(currentLives);
        }
    } catch (e) {
        console.error("Error al sincronizar las vidas diarias:", e);
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
        const { data } = await supabaseClient
            .from('user_stats')
            .select('hits, errors, lives')
            .single();

        if (data) {
            const hitsEl = document.getElementById('total-hits');
            const errorsEl = document.getElementById('total-errors');
            if (hitsEl) hitsEl.textContent = data.hits || 0;
            if (errorsEl) errorsEl.textContent = data.errors || 0;
            updateLivesDisplay(data.lives !== undefined ? data.lives : 5);
        }
    } catch (e) {
        console.error("Error al cargar estadísticas de Supabase:", e);
    }
}

// --- SISTEMA DE TIENDA Y COMPRA ---
window.openShopScreen = async function() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('shop-screen').style.display = 'flex';
    
    const currentHitsVal = document.getElementById('total-hits').textContent;
    const shopHitsEl = document.getElementById('shop-available-hits');
    if (shopHitsEl) {
        shopHitsEl.textContent = currentHitsVal;
    }

    if (typeof loadGlobalStats === 'function') {
        await loadGlobalStats();
    }
    await updateShopUIStates();
};

window.closeShopScreen = function() {
    document.getElementById('shop-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    if (typeof loadGlobalStats === 'function') loadGlobalStats();
};

window.buyLife = async function() {
    if (!confirm("¿Deseas confirmar la compra de +1 vida por 50 aciertos?")) {
        return;
    }

    try {
        const { data: stats, error } = await supabaseClient
            .from('user_stats')
            .select('*')
            .limit(1)
            .single();

        if (error || !stats) {
            alert("Error al obtener los datos de la cuenta.");
            return;
        }

        const currentHits = stats.hits || 0;
        const currentLives = stats.lives !== undefined ? stats.lives : 5;

        if (currentHits < 50) {
            alert("No tienes suficientes aciertos (necesitas 50).");
            return;
        }

        const newHits = currentHits - 50;
        const newLives = currentLives + 1;
        const queryId = stats.id !== undefined ? stats.id : 1;

        const { error: updateError } = await supabaseClient
            .from('user_stats')
            .update({ hits: newHits, lives: newLives })
            .eq('id', queryId);

        if (updateError) {
            alert("Error al procesar la compra en la base de datos.");
            return;
        }

        alert("¡Compra realizada con éxito! Has sumado 1 vida.");
        if (typeof loadGlobalStats === 'function') loadGlobalStats();
        await updateShopUIStates();
        
    } catch (e) {
        console.error("Error en la compra:", e);
        alert("Hubo un error al conectar con Supabase.");
    }
};

async function buyReward(type, cost) {
    const rewardName = type === 'tablet' ? '+10 min extra de tablet' : 'Ver 1 video de YouTube';
    
    if (!confirm(`¿Estás seguro de que deseas comprar "${rewardName}" por ${cost} aciertos?`)) {
        return;
    }

    try {
        const { data: stats, error: fetchError } = await supabaseClient
            .from('user_stats')
            .select('id, hits, tablet_redeemed, video_redeemed')
            .single();

        if (fetchError || !stats) {
            alert("No se pudieron verificar tus datos en la base de datos.");
            return;
        }

        if (stats.hits < cost) {
            alert("❌ No tienes suficientes aciertos acumulados para realizar esta compra.");
            return;
        }

        const alreadyRedeemed = type === 'tablet' ? stats.tablet_redeemed : stats.video_redeemed;
        if (alreadyRedeemed) {
            alert("⚠️ Esta recompensa ya ha sido canjeada para esta semana.");
            return;
        }

        const newHits = stats.hits - cost;
        const updateData = { hits: newHits };
        updateData[`${type}_redeemed`] = true;

        const { error: updateError } = await supabaseClient
            .from('user_stats')
            .update(updateData)
            .eq('id', stats.id);

        if (updateError) {
            throw updateError;
        }

        alert("¡Compra realizada con éxito! 🎉 La recompensa ha quedado en estado canjeado.");
        await updateShopUIStates();

    } catch (e) {
        console.error("Error al procesar la compra:", e);
        alert("Hubo un error al procesar la compra. Inténtalo de nuevo.");
    }
}

async function releaseReward(type) {
    const rewardName = type === 'tablet' ? 'Tablet (+10 min)' : 'Video de YouTube';
    
    if (!confirm(`¿Estás seguro de liberar la recompensa "${rewardName}"?`)) {
        return;
    }

    try {
        const { data: stats, error: fetchError } = await supabaseClient
            .from('user_stats')
            .select('id, tablet_redeemed, tablet_released, video_redeemed, video_released')
            .single();

        if (fetchError || !stats) {
            alert("No se pudieron verificar los datos en la base de datos.");
            return;
        }

        const isRedeemed = type === 'tablet' ? stats.tablet_redeemed : stats.video_redeemed;
        const isReleased = type === 'tablet' ? stats.tablet_released : stats.video_released;

        if (!isRedeemed) {
            alert("⚠️ Esta recompensa aún no ha sido canjeada.");
            return;
        }

        if (isReleased) {
            alert("⚠️ Esta recompensa ya fue liberada anteriormente.");
            return;
        }

        const updateData = {};
        updateData[`${type}_released`] = true;

        const { error: updateError } = await supabaseClient
            .from('user_stats')
            .update(updateData)
            .eq('id', stats.id);

        if (updateError) {
            throw updateError;
        }

        alert(`¡Recompensa "${rewardName}" liberada con éxito! 🚀`);
        await updateShopUIStates();

    } catch (e) {
        console.error("Error al liberar la recompensa:", e);
        alert("Hubo un error al procesar la liberación. Inténtalo de nuevo.");
    }
}

async function updateShopUIStates() {
    try {
        const { data: stats } = await supabaseClient
            .from('user_stats')
            .select('hits, tablet_redeemed, tablet_released, video_redeemed, video_released')
            .single();

        if (!stats) return;

        const totalHits = stats.hits || 0;

        const hitsEl = document.getElementById('total-hits');
        if (hitsEl) hitsEl.textContent = totalHits;

        const shopHitsEl = document.getElementById('shop-available-hits');
        if (shopHitsEl) {
            shopHitsEl.textContent = totalHits;
        }

        applyRewardUIState('tablet', stats.tablet_redeemed, stats.tablet_released, 100);
        applyRewardUIState('video', stats.video_redeemed, stats.video_released, 75);

    } catch (e) {
        console.error("Error al actualizar UI de la tienda:", e);
    }
}

function applyRewardUIState(type, redeemed, released, cost) {
    const container = document.getElementById(`shop-${type}-container`);
    const btn = document.getElementById(`shop-${type}-btn`);
    const devBtn = document.getElementById(`dev-release-${type}`);

    if (!container || !btn) return;

    if (devBtn) {
        if (redeemed && !released) {
            devBtn.style.background = "#4CAF50";
            devBtn.style.color = "#fff";
            devBtn.style.cursor = "pointer";
            devBtn.disabled = false;
        } else {
            devBtn.style.background = "#444";
            devBtn.style.color = "#777";
            devBtn.style.cursor = "not-allowed";
            devBtn.disabled = true;
        }
    }

    if (redeemed && released) {
        container.style.background = "rgba(100, 100, 100, 0.15)";
        btn.style.background = "#555";
        btn.style.color = "#ccc";
        btn.textContent = "Agotado";
        btn.onclick = () => {
            alert("Vuelve la semana que viene");
        };
    } else if (redeemed && !released) {
        container.style.background = "rgba(50, 50, 50, 0.2)";
        btn.style.background = "#37474F";
        btn.style.color = "#90CAF9";
        btn.textContent = "Canjeado";
        btn.onclick = () => {
            alert("Esta recompensa ya ha sido canjeada.");
        };
    } else {
        container.style.background = "rgba(255, 255, 255, 0.05)";
        btn.style.background = "#2196F3";
        btn.style.color = "white";
        btn.innerHTML = `Comprar (<span style="color: #4CAF50; font-weight: bold;">${cost}</span> aciertos)`;
        btn.onclick = () => buyReward(type, cost);
    }
}

// --- PANTALLA DE CORRECCIÓN DE ERRORES ---
window.openCorrectionScreen = async function() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('correction-screen').style.display = 'flex';
    
    const container = document.getElementById('correction-content');
    container.innerHTML = `<p style="text-align:center; color:#b0bec5;">Cargando palabras falladas...</p>`;

    try {
        const { data: failedWords } = await supabaseClient.from('failed_words').select('*');

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
                        
                        const { data: stats } = await supabaseClient.from('user_stats').select('errors').single();
                        if (stats) {
                            await supabaseClient.from('user_stats').update({
                                errors: Math.max(0, (stats.errors || 0) - 1)
                            }).eq('id', 1);
                        }

                        await supabaseClient.from('failed_words').delete().eq('id', item.id);

                        setTimeout(() => {
                            window.openCorrectionScreen();
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

window.closeCorrectionScreen = function() {
    document.getElementById('correction-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';
    loadGlobalStats();
}

// --- MODO DESARROLLADOR ---
function injectDevScreens() {
    if (!document.getElementById('dev-menu-screen')) {
        const devMenuHTML = `
            <div id="dev-menu-screen" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:#111; color:#fff; z-index:9999; flex-direction:column; padding:20px; box-sizing:border-box; font-family:sans-serif; overflow-y:auto;">
                <div style="display:flex; align-items:center; margin-bottom:20px;">
                    <button id="dev-back-home" style="padding:10px 15px; background:#333; color:#fff; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">← Volver</button>
                    <h2 style="margin:0 auto; font-size:20px;">Modo Desarrollador</h2>
                </div>
                
                <div style="max-width:500px; width:100%; margin:0 auto; display:flex; flex-direction:column; gap:20px;">
                    <div style="background:#222; padding:15px; border-radius:8px; border:1px solid #444;">
                        <h3 style="margin-top:0; color:#ffeb3b; font-size:16px;">Recompensas Canjeadas</h3>
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; background:#1a1a1a; padding:10px; border-radius:6px;">
                                <span>📱 Tablet (+10 min)</span>
                                <button id="dev-release-tablet" onclick="releaseReward('tablet')" style="padding:6px 12px; background:#444; color:#777; border:none; border-radius:4px; cursor:not-allowed; font-weight:bold;" disabled>Liberar</button>
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

    document.getElementById('dev-back-home').onclick = () => {
        document.getElementById('dev-menu-screen').style.display = 'none';
        document.getElementById('home-screen').style.display = 'flex';
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
            clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
        }
    });
}

async function openDevMenu() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    
    document.getElementById('dev-menu-screen').style.display = 'flex';
    await updateShopUIStates();
}

// --- MECÁNICAS DE JUEGO PRINCIPAL ---
window.startGame = async function() {
    try {
        const { data } = await supabaseClient.from('user_stats').select('lives').single();
        const currentLives = data && data.lives !== undefined ? data.lives : 5;

        if (currentLives <= 0) {
            alert("No te quedan vidas, intentalo mañana");
            return;
        }
    } catch (e) {
        console.error("Error al verificar vidas antes de jugar:", e);
    }

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

window.exitGame = async function() {
    // 1. Mostrar el cuadro de diálogo de confirmación solicitado
    const confirmExit = confirm("salir del juego te costará una vida , ¿Estás seguro que quieres salir y perder de 1 vida?");
    
    // Si el usuario cancela, no hacemos nada y el juego continúa
    if (!confirmExit) {
        return;
    }

    // 2. Restar 1 vida en Supabase
    try {
        const { data: stats, error: fetchError } = await supabaseClient
            .from('user_stats')
            .select('lives')
            .single();

        if (!fetchError && stats) {
            // Se resta una vida asegurando que no quede por debajo de 0
            const currentLives = stats.lives !== undefined ? stats.lives : 5;
            const newLives = Math.max(0, currentLives - 1);

            const { error: updateError } = await supabaseClient
                .from('user_stats')
                .update({ lives: newLives })
                .eq('id', 1);

            if (updateError) {
                console.error("Error al actualizar la vida en Supabase:", updateError);
            } else {
                // Actualizar la interfaz global con la nueva cantidad de vidas
                updateLivesDisplay(newLives);
            }
        }
    } catch (e) {
        console.error("Error en la conexión con Supabase al intentar salir:", e);
    }

    // 3. Pausar audio y limpiar la sesión del juego
    const audio = document.getElementById('game-audio');
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    isPausedForQuiz = false;
    sessionHits = 0;
    sessionErrors = 0;

    // 4. Regresar a la pantalla principal
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('home-screen').style.display = 'flex';

    // Refrescar las estadísticas globales visibles en el inicio
    if (typeof loadGlobalStats === 'function') {
        loadGlobalStats();
    }
};

function processGameWords(startIndex = 0) {
    targetWords = [];
    let lineValidity = [];

    lrcLines.forEach((item, idx) => {
        let hasValidWord = false;
        const words = item.text.split(/\s+/);
        for (let w of words) {
            let cleanW = w.replace(/[^a-zA-Z']/g, '');
            if (isEnglishWord(cleanW)) {
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
        let checkIdx = currentIndex;
        
        while (checkIdx < lrcLines.length) {
            if (lineValidity[checkIdx]) {
                targetLineIdx = checkIdx;
                break;
            }
            checkIdx++;
        }

        if (targetLineIdx !== -1) {
            let item = lrcLines[targetLineIdx];
            let words = item.text.split(/\s+/);
            let validCandidatesInLine = [];
            
            words.forEach((w, wIdx) => {
                let cleanW = w.replace(/[^a-zA-Z']/g, '');
                if (isEnglishWord(cleanW)) {
                    validCandidatesInLine.push({ lrcIdx: targetLineIdx, wordIdx: wIdx, word: cleanW, time: item.time });
                }
            });

            if (validCandidatesInLine.length > 0) {
                let chosenWord = validCandidatesInLine[Math.floor(Math.random() * validCandidatesInLine.length)];
                selected.push(chosenWord);
                
                let randomJump = Math.floor(Math.random() * 3) + 2; 
                currentIndex = targetLineIdx + randomJump;
            } else {
                currentIndex = targetLineIdx + 1;
            }
        } else {
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

    let livesReachedZero = false;

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        sessionHits++;
    } else {
        selectedBtn.classList.add('incorrect');
        sessionErrors++;
        
        await supabaseClient.from('failed_words').insert([
            { word: targetWord.toLowerCase(), translation: correctMeaning }
        ]);

        try {
            const { data: stats } = await supabaseClient.from('user_stats').select('lives').single();
            if (stats) {
                let newLives = Math.max(0, (stats.lives !== undefined ? stats.lives : 5) - 1);
                await supabaseClient.from('user_stats').update({ lives: newLives }).eq('id', 1);
                updateLivesDisplay(newLives);

                if (newLives === 0) {
                    livesReachedZero = true;
                }
            }
        } catch (e) {
            console.error("Error al restar vida:", e);
        }

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

        if (livesReachedZero || currentWordTargetIndex >= targetWords.length) {
            endGame();
        } else {
            document.getElementById('game-status').textContent = "Escuchando canción...";
            document.getElementById('game-audio').play();
        }
    }, 1500);
}

async function endGame() {
    const audio = document.getElementById('game-audio');
    audio.pause();
    audio.currentTime = 0;

    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('result-screen').style.display = 'flex';
    document.getElementById('final-stats').innerHTML = `¡Juego finalizado!<br><br>🟢 Aciertos en esta sesión: <b>${sessionHits}</b><br>🔴 Errores en esta sesión: <b style="color:#f44336;">${sessionErrors}</b>`;

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
