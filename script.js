const DEFAULT_AUTHOR = "Lux.io Music";

const musicData = [
    {
        title: "Garacias a Dios hay Chamba",
        img: "https://i.pinimg.com/736x/47/dd/0b/47dd0bc9355f6a01608eee68e5cc021c.jpg",
        author: "Dani Chalán",
        audio: "https://files.catbox.moe/530yy1.mp3",
        lyrics: "https://luxiodev93.github.io/lyrics/haychamba.txt",
		audio_eng: "https://files.catbox.moe/c8gzwv.mp3",
        lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/haychamba_eng.txt",
        coments: "https://badluchothree-glitch.github.io/coments/haychamba.txt"
    },
{
        title: "Gallina Terrenal",
        img: "https://i.ibb.co/8LY8GCMM/gallina-terrenal.jpg",
        author: "Cuco Club",
        audio: "https://files.catbox.moe/dpezf6.mp3",
		lyrics: "https://luxiodev93.github.io/lyrics/galterr.txt",
        audio_eng: "https://files.catbox.moe/dshlsc.mp3",
        lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/galterr.txt",
        coments: "https://badluchothree-glitch.github.io/coments/galterr.txt"
    },
    {
            title: "Exploit Explosion",
            img: "https://i.ibb.co/JW6Yfhxx/6868c0ae-3e1c-4b6a-95c7-893900519c38-75.jpg", 
            audio: "https://files.catbox.moe/wd8w2a.mp3",
            author: "No Respawn",
            lyrics: "https://luxiodev93.github.io/lyrics/expexp.txt",
            coments: "https://badluchothree-glitch.github.io/coments/expexp.txt"
    },
	
        {
            title: "Voy a cocinar una gallina",
            img: "https://i.ibb.co/93p4Wbcf/minigrok-video-d1835590-70eb-410e-a615-159293a08a20.gif",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/uitu6e.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/cocillina.txt"
        },
        {
            title: "The 93 Kid",
            img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYfzIVWK9NsW8H0eQphVVROPF5a24JZIbXzKwcK0c2k1UpxZmb-HWe_J4&s=10", 
            audio: "https://files.catbox.moe/ka6un5.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/b93.txt"
        },
        {
            title: "Dark Cloud",
            img: "https://wallpapercave.com/wp/wp2974051.jpg",
            author: "No Respawn",
            audio: "https://files.catbox.moe/e451ms.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/drkld.txt"
        },
        {
            title: "Go Faster",
            img: "https://i.pinimg.com/736x/24/45/77/244577ccb37755b78041b12efeffbcbb.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/c1zzpz.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/gofaster.txt",
			coments: "https://luxiodev93.github.io/coments/gofaster.txt"
        },
        {
            title: "A máxima velocidad",
            img: "https://previews.123rf.com/images/twinsterphoto/twinsterphoto1612/twinsterphoto161200036/66805425-father-and-son-running-and-chasing-each-other-in-green-park.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/52b74q.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/vlcnic.txt"
        },
        {
            title: "Pásame la sosa",
            img: "https://i.ibb.co/BMmLRXJ/minipika1f7-b691-643680fea33a.gif", 
            audio: "https://files.catbox.moe/qvdw53.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/sosa.txt"
        },
        {
            title: "Hey hermanito!",
            img: "https://cdn2.suno.ai/image_large_cd7f792d-8b1e-4cab-86aa-bc3e4bb50f33.jpeg", 
            author: "Cuco Club",
            audio: "https://files.catbox.moe/lx6eoz.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/hermanito.txt"
        },
        {
            title: "La cucaracha",
            img: "https://m.media-amazon.com/images/I/71LD5ddJJYL._AC_SX522_.jpg", 
            author: "Cuco Club",
            audio: "https://files.catbox.moe/vunfuh.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/cucaracha.txt"
        },
        {
            title: "La cucaracha(versionada)",
            img: "https://m.media-amazon.com/images/I/71LD5ddJJYL._AC_SX522_.jpg", 
            author: "Cuco Club",
            audio: "https://files.catbox.moe/yrkv8h.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/cucaracha.txt"
        },
        {
            title: "Los países",
            img: "https://cdn.forum.snap.berkeley.edu/original/3X/9/f/9fae0a709a729e6e7c6b655e80f305cdc3e7f471.gif", 
            author: "Cuco Club",
            audio: "https://cdn1.suno.ai/2c202c8e-ec01-4a00-899c-9438454e4733.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/countries.txt"
        },
        {
            title: "La canción de Nico",
            img: "https://www.shutterstock.com/shutterstock/videos/3634968147/thumb/6.jpg?ip=x480", 
            author: "Cuco Club",
            audio: "https://files.catbox.moe/w2mw64.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/niconico.txt"
        },
        {
            title: "Pásame la gallina",
            img: "https://cdn2.suno.ai/image_large_6ecfaf1f-d7a2-4e47-b473-e0884791717e.jpeg", 
            audio: "https://files.catbox.moe/xvsa1r.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/gallinadrift.txt"
        },
        {
            title: "Prepositions",
            img: "https://cdn2.suno.ai/image_large_5f291070-1aa3-4a39-a0fe-4b1d8ff72e05.jpeg", 
            author: "Cuco Club",
            audio: "https://files.catbox.moe/drtorx.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/upup.txt"
        },
        {
            title: "Mi amiga jirafa",
            img: "https://i.ibb.co/4gSHTwqk/ac10f775-2e77-4c77-80b6-5edf4d7bd647-92.jpg", 
            author: "Cuco Club",
			audio_eng: "https://files.catbox.moe/12cey1.mp3",
            audio: "https://files.catbox.moe/z25a46.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/amjirf.txt",
			lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/amjirf.txt",
			coments: "https://luxiodev93.github.io/coments/amjirf.txt"
        },
        {
            title: "Mamá cuéntame un cuento",
            img: "https://i.ibb.co/PvWpJYxZ/Gemini-Generated-Image-be2jvube2jvube2j.png",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/7fciw5.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/mamacuento.txt"
        },
        {
            title: "Lávate las manos",
            img: "https://i.ibb.co/jPD2yypm/elmogrok-video-0ea73052-54a9-4344-84e6-67a8bf89a2cd.gif", 
            audio: "https://files.catbox.moe/ylv1o8.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/amaama.txt"
        },
        {
            title: "BELIEVE IN THE MAGIC!",
            img: "https://static.que.es/wp-content/uploads/2021/02/Que-es-la-magia.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/7tub00.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/magic.txt",
			coments: "https://luxiodev93.github.io/coments/magic.txt"
        },
        {
            title: "Serpiente Serpiente",
            img: "https://i.ibb.co/99bMDDdC/Aco25sp.jpg", 
            audio: "https://files.catbox.moe/t3opb9.mp3",
			audio_eng: "https://files.catbox.moe/trc9s0.mp3",
            author: "Cuco Club",
            lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/serpt.txt",
			coments: "https://luxiodev93.github.io/coments/serpt.txt",
            lyrics: "https://luxiodev93.github.io/lyrics/serpt.txt"
        },
        {
            title: "Level 99 Slitherbreak",
            img: "https://i.ytimg.com/vi/jBcDBwkV0b8/maxresdefault.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/2nhp1u.mp3",
            audio_eng: "https://files.catbox.moe/yumn7z.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/Slitherbrk.txt",
			lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/Slitherbrk.txt",
			coments: "https://luxiodev93.github.io/coments/Slitherbrk.txt"
        },
        {
            title: "La gallinita Ciega",
            img: "https://i.ibb.co/cKp52Tgy/CIEGA.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/5qynrf.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/ceiga.txt"
        },
        {
            title: "Gallinita Espacial",
            img: "https://i.ibb.co/d0Cqj92f/image-jpg-75.jpg",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/2o58j3.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/espagal.txt"
        },
        {
            title: "Iguana del Caos",
            img: "https://i.ibb.co/rgJdfSr/content-75.jpg",
            author: "Metal Insano",
            audio: "https://files.catbox.moe/e27db5.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/iguanacaos.txt"
        },
        {
            title: "Engranaje del vacío",
            img: "https://cdn2.suno.ai/image_large_31f502aa-fc9a-485b-a99a-34cc9a0b18ad.jpeg",
            author: "Metal Insano",
            audio: "https://files.catbox.moe/xtypy7.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/engravci.txt"
        },
        {
            title: "Espejo ciego",
            img: "https://cdn2.suno.ai/image_large_9f7ad9b3-997b-4795-bb15-050343640e46.jpeg",
            author: "Metal Insano",
            audio: "https://cdn1.suno.ai/9f7ad9b3-997b-4795-bb15-050343640e46.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/espcieg.txt"
        },
        {
            title: "Fénix",
            img: "https://i.ibb.co/VW72Mt5V/ec4dc522-0fb7-40fb-a112-e2492e6615df-75.jpg",
            author: "Metal Insano",
            audio: "https://files.catbox.moe/b1a57n.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/fenixx.txt"
        },
        {
            title: "Bloque a Bloque",
            img: "https://cdn2.suno.ai/image_large_bd51f09a-26f6-42f9-8697-79449d3f5c7f.jpeg",
            author: "Metal Insano",
            audio: "https://cdn1.suno.ai/bd51f09a-26f6-42f9-8697-79449d3f5c7f.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics/blqblq.txt"
        },
        {
            title: "Thirty Something Grind!",
            img: "https://i.ibb.co/wZpSQ7F0/30sg.jpg", 
            audio: "https://files.catbox.moe/l1hhxz.mp3",
            author: "No Respawn",
            lyrics: "https://luxiodev93.github.io/lyrics/30sg.txt"
        },
        {
            title: "Level 99 Heartbreak",
            img: "https://cdn2.suno.ai/image_large_461b78ad-9841-440a-b5f3-b5ba6876e9d8.jpeg", 
            audio: "https://files.catbox.moe/n81t5k.mp3",
			audio_eng: "https://files.catbox.moe/s9455p.mp3",
            author: "No Respawn",
            lyrics: "https://luxiodev93.github.io/lyrics/lvl99hrbk.txt",
			lyrics_eng: "https://luxiodev93.github.io/lyrics_eng/lvl99hrbk.txt",
			coments: "https://luxiodev93.github.io/coments/lvl99hrbk.txt"
        },
	        {
            title: "Hope is Written in My Name",
            img: "https://i.ibb.co/93p4Wbcf/minigrok-video-d1835590-70eb-410e-a615-159293a08a20.gif",
            author: "Cuco Club",
            audio: "https://files.catbox.moe/wzimix.mp3",
            lyrics: "https://luxiodev93.github.io/lyrics_eng/iwin.txt"
        },
        {
            title: "Por ustedes hijos míos",
            img: "https://cdn2.suno.ai/image_large_74737745-03b8-4b54-9412-249f6b2123e9.jpeg", 
            audio: "https://cdn1.suno.ai/74737745-03b8-4b54-9412-249f6b2123e9.mp3",
            author: "Doña Madre",
            lyrics: "https://luxiodev93.github.io/lyrics/madreama.txt"
        },
        {
            title: "Que le den al algoritmo",
            img: "https://cdn2.suno.ai/image_large_2bd8299d-de12-4b3c-b7e9-cff0294a912d.jpeg", 
            audio: "https://files.catbox.moe/i0ujzh.mp3",
            author: "El Luchi",
            rated: "on",
            lyrics: ""
        },
	
        {
            title: "Machala Low Life",
            img: "https://i.ibb.co/VWTW3qKX/25c84b74-45eb-4614-8b38-bb15405bfbff-75.jpg", 
            author: "Macha-K",
            audio: "https://files.catbox.moe/us4gj3.mp3",
            rated: "on",
            lyrics: "https://luxiodev93.github.io/lyrics/MachalaLOWLIFE.txt"
        }
];

let currentAudio = new Audio();
let currentIndex = 0;
let parsedLyrics = [];
let isSingleSongMode = false;
let activeAuthorFilter = null;
let isRatedUnlocked = false;
let isRepeatEnabled = false;
let isCommentsOpen = false;
let isEnglishVersion = false;

let tapCount = 0;
let tapTimer = null;

currentAudio.volume = 0.75;

function getRandomViews() {
    const rangeChoice = Math.floor(Math.random() * 3);
    let num;
    if (rangeChoice === 0) {
        num = Math.floor(Math.random() * 99) + 1;
        return num.toString();
    } else if (rangeChoice === 1) {
        num = Math.floor(Math.random() * 999) + 1;
        return `${num}K`;
    } else {
        num = (Math.random() * 9 + 1).toFixed(1);
        if (num.endsWith('.0')) num = Math.floor(num);
        return `${num}M`;
    }
}

function getRandomTimeAgo() {
    const type = Math.floor(Math.random() * 3);
    if (type === 0) {
        const days = Math.floor(Math.random() * 11) + 20;
        return `hace ${days} d`;
    } else if (type === 1) {
        const months = Math.floor(Math.random() * 11) + 1;
        return `hace ${months} m`;
    } else {
        const years = Math.floor(Math.random() * 2) + 1;
        return `hace ${years} a`;
    }
}

musicData.forEach(item => {
    item.author = (item.author && item.author.trim() !== "") ? item.author : DEFAULT_AUTHOR;
    item.rated = (item.rated && item.rated.toString().toLowerCase() === "on") ? "on" : "off";
    item.views = getRandomViews();
    item.timeAgo = getRandomTimeAgo();
    if (!Array.isArray(item.coments) && typeof item.coments !== 'string') {
        item.coments = [];
    }
});

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

async function parseLRC(lrcUrl) {
    if(!lrcUrl) return [];
    
    let lrcText = lrcUrl;
    if (lrcUrl.startsWith('http://') || lrcUrl.startsWith('https://')) {
        try {
            const response = await fetch(lrcUrl);
            if (!response.ok) throw new Error('Error al descargar letra');
            lrcText = await response.text();
        } catch (error) {
            console.error('No se pudo cargar la letra desde la URL:', error);
            return [];
        }
    }

    const lines = lrcText.split(/\r?\n/);
    const lyrics = [];
    const timeReg = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/;

    lines.forEach(line => {
        const match = timeReg.exec(line);
        if (match) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = parseInt(match[3]);
            const time = minutes * 60 + seconds + (milliseconds / (match[3].length === 3 ? 1000 : 100));
            const text = line.replace(timeReg, "").trim();
            if (text) lyrics.push({ time, text });
        }
    });
    return lyrics.sort((a, b) => a.time - b.time);
}

async function parseComments(comentsSource) {
    if (!comentsSource) return [];
    if (Array.isArray(comentsSource)) return comentsSource;

    let textData = "";
    if (typeof comentsSource === 'string' && (comentsSource.startsWith('http://') || comentsSource.startsWith('https://'))) {
        try {
            const response = await fetch(comentsSource);
            if (!response.ok) throw new Error('Error al descargar comentarios');
            textData = await response.text();
        } catch (error) {
            console.error('No se pudieron cargar los comentarios desde la URL:', error);
            return [];
        }
    } else {
        textData = comentsSource;
    }

    try {
        const parsed = JSON.parse(textData);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        console.error('El archivo de comentarios no tiene un formato JSON válido:', e);
    }

    return [];
}

function getActivePlaylist() {
    let baseList = musicData;

    if (!isRatedUnlocked) {
        baseList = baseList.filter(item => item.rated !== "on");
    }

    if (isSingleSongMode) return [musicData[currentIndex]];
    
    if (activeAuthorFilter) {
        return baseList.filter(item => item.author === activeAuthorFilter);
    }
    return baseList;
}

function renderCardHTML(item, index, isActive = false) {
        const authorClickAttr = (!isSingleSongMode) ? `onclick="event.stopPropagation(); filterByAuthor('${item.author}')"` : '';
        const authorClass = (!isSingleSongMode) ? 'clickable-author' : '';

        return `
            <div class="yt-card ${isActive ? 'active' : ''}" id="item-${index}" onclick="playTrack(${index})">
                <div class="yt-thumb-container">
                    <img class="yt-thumb" src="${item.img}" alt="${item.title}" loading="lazy">
                    <span class="playing-badge">Sonando</span>
                </div>
                <div class="yt-info">
                    <h3 class="yt-title">${item.title}</h3>
                    <p class="yt-author ${authorClass}" ${authorClickAttr}>${item.author}</p>
                    <p class="yt-meta">
                        <span class="yt-meta-play-icon"></span>${item.views}
                        <span class="yt-dot-separator">•</span>
                        <span>${item.timeAgo}</span>
                    </p>
                </div>
            </div>
        `;
}

function updateTrackUI(song) {
    document.title = `${song.title} - ${song.author}`;
    document.getElementById('current-track-title').innerText = song.title;
    
    const authorEl = document.getElementById('current-track-author');
    authorEl.innerText = song.author;
    
    if (!isSingleSongMode) {
        authorEl.classList.add('clickable-author');
        authorEl.onclick = () => filterByAuthor(song.author);
    } else {
        authorEl.classList.remove('clickable-author');
        authorEl.onclick = null;
    }
}

function loadPlaylist() {
    const container = document.getElementById('playlist');
    const header = document.getElementById('playlist-header');
    const authorActions = document.getElementById('author-actions');
    
    if (isSingleSongMode) {
        const song = musicData[currentIndex];
        header.innerText = "Canción compartida";
        authorActions.style.display = 'none';
        container.innerHTML = renderCardHTML(song, currentIndex, true);
    } else {
        if (activeAuthorFilter) {
            header.innerText = `Canciones de: ${activeAuthorFilter}`;
            authorActions.style.display = 'flex';
        } else {
            header.innerText = "A continuación";
            authorActions.style.display = 'none';
        }

        container.innerHTML = musicData.map((item, index) => {
            if (!isRatedUnlocked && item.rated === "on") {
                return '';
            }

            if (activeAuthorFilter && item.author !== activeAuthorFilter) {
                return '';
            }
            return renderCardHTML(item, index, index === currentIndex);
        }).join('');
    }
}

function filterByAuthor(authorName) {
    if (isSingleSongMode) return;
    activeAuthorFilter = authorName;
    loadPlaylist();

    const currentSong = musicData[currentIndex];
    if (currentSong.author !== activeAuthorFilter) {
        const firstAuthorSongIndex = musicData.findIndex(s => s.author === activeAuthorFilter && (isRatedUnlocked || s.rated !== "on"));
        if (firstAuthorSongIndex !== -1) {
            playTrack(firstAuthorSongIndex);
        }
    }
}

function clearAuthorFilter() {
    activeAuthorFilter = null;
    loadPlaylist();
}

function shareAuthorList() {
    if (!activeAuthorFilter) return;
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?author=${slugify(activeAuthorFilter)}`;

    copyToClipboard(shareUrl).then(() => {
        showToast('¡Enlace de la lista copiado! 📋');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

/* --- PANEL DE COMENTARIOS --- */
function renderComments() {
    const list = document.getElementById('comments-list');
    const song = musicData[currentIndex];
    const comments = Array.isArray(song.loadedComments) ? song.loadedComments : (Array.isArray(song.coments) ? song.coments : []);

    if (comments.length === 0) {
        list.innerHTML = `<div class="no-comments">No comments</div>`;
        return;
    }

    list.innerHTML = comments.map(c => {
        const [username, imgUrl, text] = c;
        return `
            <div class="comment-item">
                <img class="comment-avatar" src="${imgUrl}" alt="${username}" loading="lazy" onerror="this.src='https://i.pravatar.cc/150?u=fallback'">
                <div class="comment-body">
                    <p class="comment-username">${username}</p>
                    <p class="comment-text">${text}</p>
                </div>
            </div>
        `;
    }).join('');
}

function openCommentsPanel() {
    isCommentsOpen = true;
    document.getElementById('comments-panel').classList.add('open');
    document.getElementById('btn-comments').classList.add('active');
    renderComments();
}

function closeCommentsPanel() {
    isCommentsOpen = false;
    document.getElementById('comments-panel').classList.remove('open');
    document.getElementById('btn-comments').classList.remove('active');
}

function toggleCommentsPanel() {
    if (isCommentsOpen) {
        closeCommentsPanel();
    } else {
        openCommentsPanel();
    }
}

async function playTrack(index) {
    if (index < 0) index = 0;
    if (index >= musicData.length) index = 0;

    if (!isRatedUnlocked && musicData[index].rated === "on") {
        const validIndex = musicData.findIndex(s => s.rated !== "on");
        index = validIndex !== -1 ? validIndex : 0;
    }

    closeCommentsPanel();

    currentIndex = index;
    const song = musicData[currentIndex];

    updateTrackUI(song);

    // Comprobar si la canción tiene versión en inglés disponible
    const hasEnglish = song.audio_eng || song.lyrics_eng;
    const btnEnglish = document.getElementById('btn-english');
    
    if (hasEnglish) {
        btnEnglish.style.display = 'flex';
    } else {
        btnEnglish.style.display = 'none';
        isEnglishVersion = false; // Resetear si no tiene
    }
    updateEnglishButtonUI();

    // Seleccionar audio y letra según el modo activo (Español / Inglés)
    const activeAudio = (isEnglishVersion && song.audio_eng) ? song.audio_eng : song.audio;
    const activeLyrics = (isEnglishVersion && song.lyrics_eng) ? song.lyrics_eng : song.lyrics;

    currentAudio.src = activeAudio;
    currentAudio.load();
    
    parsedLyrics = [];
    song.loadedComments = [];
    document.getElementById('lyric-text').innerText = "Cargando letra...";
    document.getElementById('player-bg').style.backgroundImage = `url('${song.img}')`;

    loadPlaylist();

    try {
        parsedLyrics = await parseLRC(activeLyrics);
        if (parsedLyrics.length === 0) {
            document.getElementById('lyric-text').innerText = "🎵 Instrumental o sin letra disponible";
        }
    } catch (e) {
        document.getElementById('lyric-text').innerText = "🎵 Disfruta la música";
    }

    try {
        song.loadedComments = await parseComments(song.coments);
    } catch (e) {
        song.loadedComments = [];
    }

    if (isCommentsOpen) {
        renderComments();
    }

    currentAudio.play().then(() => {
        updatePlayPauseIcon(true);
    }).catch(e => {
        console.log('Autoplay bloqueado por el navegador, pulsa play:', e);
        updatePlayPauseIcon(false);
    });
}

function toggleEnglishVersion() {
    const song = musicData[currentIndex];
    const hasEnglish = song.audio_eng || song.lyrics_eng;
    if (!hasEnglish) return;

    isEnglishVersion = !isEnglishVersion;
    updateEnglishButtonUI();
    
    if (isEnglishVersion) {
        showToast("🇬🇧 Versión en inglés activada");
    } else {
        showToast("🇪🇸 Versión original activada");
    }

    // Volver a reproducir la pista actual aplicando el cambio de idioma
    playTrack(currentIndex);
}

function updateEnglishButtonUI() {
    const btnEnglish = document.getElementById('btn-english');
    if (isEnglishVersion) {
        btnEnglish.classList.add('active');
    } else {
        btnEnglish.classList.remove('active');
    }
}

function playNextTrack() {
    const currentPlaylist = getActivePlaylist();
    if (currentPlaylist.length === 0) return;

    let currentPosInFiltered = currentPlaylist.findIndex(s => s === musicData[currentIndex]);
    let nextPos = currentPosInFiltered + 1;

    if (nextPos >= currentPlaylist.length) {
        nextPos = 0;
    }

    const nextSong = currentPlaylist[nextPos];
    const globalIndex = musicData.findIndex(s => s === nextSong);
    playTrack(globalIndex !== -1 ? globalIndex : 0);
}

function playPrevTrack() {
    const currentPlaylist = getActivePlaylist();
    if (currentPlaylist.length === 0) return;

    let currentPosInFiltered = currentPlaylist.findIndex(s => s === musicData[currentIndex]);
    let prevPos = currentPosInFiltered - 1;

    if (prevPos < 0) {
        prevPos = currentPlaylist.length - 1;
    }

    const prevSong = currentPlaylist[prevPos];
    const globalIndex = musicData.findIndex(s => s === prevSong);
    playTrack(globalIndex !== -1 ? globalIndex : 0);
}

function togglePlayPause() {
    if (currentAudio.paused) {
        currentAudio.play();
        updatePlayPauseIcon(true);
    } else {
        currentAudio.pause();
        updatePlayPauseIcon(false);
    }
}

function updatePlayPauseIcon(isPlaying) {
    document.getElementById('icon-play').style.display = isPlaying ? 'none' : 'block';
    document.getElementById('icon-pause').style.display = isPlaying ? 'block' : 'none';
}

function toggleRepeat() {
    isRepeatEnabled = !isRepeatEnabled;
    const btnRepeat = document.getElementById('btn-repeat');
    if (isRepeatEnabled) {
        btnRepeat.classList.add('active');
        showToast("🔁 Modo repetición activado");
    } else {
        btnRepeat.classList.remove('active');
        showToast("🔁 Modo repetición desactivado");
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
}

function updateLyrics(currentTime) {
    if (!parsedLyrics || parsedLyrics.length === 0) return;
    let currentText = "🎵 ... 🎵";
    
    for (let i = 0; i < parsedLyrics.length; i++) {
        if (currentTime >= parsedLyrics[i].time) {
            currentText = parsedLyrics[i].text;
        } else {
            break;
        }
    }
    document.getElementById('lyric-text').innerText = currentText;
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((resolve, reject) => {
            document.execCommand('copy') ? resolve() : reject();
            textArea.remove();
        });
    }
}

function showToast(msg) {
    const toast = document.getElementById('share-toast');
    if (msg) toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

function shareCurrentSong() {
    const song = musicData[currentIndex];
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?song=${slugify(song.title)}`;

    copyToClipboard(shareUrl).then(() => {
        showToast('¡Enlace de la canción copiado! 📋');
    }).catch(err => {
        console.error('Error al copiar:', err);
    });
}

function toggleFullscreen() {
    const playerContainer = document.getElementById('player-container');
    if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
            playerContainer.requestFullscreen();
        } else if (playerContainer.webkitRequestFullscreen) {
            playerContainer.webkitRequestFullscreen();
        }
        document.getElementById('icon-fullscreen-enter').style.display = 'none';
        document.getElementById('icon-fullscreen-exit').style.display = 'block';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        document.getElementById('icon-fullscreen-enter').style.display = 'block';
        document.getElementById('icon-fullscreen-exit').style.display = 'none';
    }
}

function handleDevTap() {
    if (isRatedUnlocked) return;

    tapCount++;
    clearTimeout(tapTimer);

    tapTimer = setTimeout(() => {
        tapCount = 0;
    }, 2000);

    if (tapCount >= 5) {
        tapCount = 0;
        const code = prompt("Introduce el código de acceso para ver la lista completa:");
        if (code === "1725") {
            isRatedUnlocked = true;
            loadPlaylist();
            showToast("🔓 Contenido completo desbloqueado");
        } else if (code !== null) {
            alert("Código incorrecto.");
        }
    }
}

/* --- EVENT LISTENERS --- */
document.getElementById('btn-play-pause').addEventListener('click', togglePlayPause);
document.getElementById('btn-english').addEventListener('click', toggleEnglishVersion);
document.getElementById('btn-prev').addEventListener('click', playPrevTrack);
document.getElementById('btn-next').addEventListener('click', playNextTrack);
document.getElementById('btn-repeat').addEventListener('click', toggleRepeat);
document.getElementById('btn-share').addEventListener('click', shareCurrentSong);
document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
document.getElementById('btn-comments').addEventListener('click', toggleCommentsPanel);

currentAudio.addEventListener('timeupdate', () => {
    const current = currentAudio.currentTime;
    const duration = currentAudio.duration;

    if (!isNaN(duration) && duration > 0) {
        const pct = (current / duration) * 100;
        document.getElementById('time-progress').style.width = `${pct}%`;
        document.getElementById('time-text').innerText = `${formatTime(current)} / ${formatTime(duration)}`;
    }

    updateLyrics(current);
});

currentAudio.addEventListener('ended', () => {
    if (isRepeatEnabled) {
        currentAudio.currentTime = 0;
        currentAudio.play();
    } else if (isSingleSongMode) {
        currentAudio.currentTime = 0;
        currentAudio.play();
    } else {
        playNextTrack();
    }
});

document.getElementById('time-bar').addEventListener('click', (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    if (!isNaN(currentAudio.duration)) {
        currentAudio.currentTime = pct * currentAudio.duration;
    }
});

/* --- INICIALIZACIÓN --- */
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const songParam = urlParams.get('song');
    const authorParam = urlParams.get('author');

    if (songParam) {
        const foundIndex = musicData.findIndex(item => slugify(item.title) === songParam);
        if (foundIndex !== -1) {
            currentIndex = foundIndex;
            isSingleSongMode = true;
        }
    } else if (authorParam) {
        const foundAuthorItem = musicData.find(item => slugify(item.author) === authorParam);
        if (foundAuthorItem) {
            activeAuthorFilter = foundAuthorItem.author;
            const firstAuthorIndex = musicData.findIndex(item => item.author === activeAuthorFilter && (isRatedUnlocked || item.rated !== "on"));
            if (firstAuthorIndex !== -1) currentIndex = firstAuthorIndex;
        }
    }

    loadPlaylist();
    playTrack(currentIndex);
});
