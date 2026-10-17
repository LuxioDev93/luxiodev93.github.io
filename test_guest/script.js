// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = 'https://phakxkbqbgfuhijkcnxy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sYFREO9jtKjJ7SD-sFVvYQ_rPzPhmZR';

// USA 'supabaseClient' EN LUGAR DE 'supabase' PARA EVITAR EL CHOQUE
const supabaseClient = (window.supabase && window.supabase.createClient) 
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
    : null;

// --- CONFIGURACIÓN IMGBB (subida de imágenes de invitados) ---
const IMGBB_API_KEY = 'f05b3ed947457b6a36307813eee62c53';

let currentUserName = null; // Se llena si entra con ?nombre=
let isGuestMode = false;    // Se activa con ?nombre=guest
let userCommentState = {
    existingCommentId: null, // Guarda el ID si el usuario ya comentó esta canción
    isEditing: false
};

// Mapa de avatares/usuarios fijos
const USER_PROFILES = {
    "cuco": {
        nickname: "Nicolás_Numberblock",
        avatar: "https://i.ibb.co/RTZVDY9h/nicoavatar.jpg"
    }
};
const DEFAULT_AUTHOR = "Lux.io Music";



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

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
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
        <div class="yt-card ${isActive ? 'active' : ''}" id="item-${index}" tabindex="0" role="button" aria-label="${item.title} - ${item.author}" onclick="playTrack(${index})">
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

/* --- CONTROL DE ACCESO POR URL --- */
function checkUserAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreParam = urlParams.get('nombre');

    if (nombreParam) {
        currentUserName = nombreParam.toLowerCase();

        if (currentUserName === 'guest') {
            isGuestMode = true;
        }

        const profile = USER_PROFILES[currentUserName] || {
            nickname: nombreParam,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${nombreParam}`
        };

        const formWrapper = document.getElementById('comment-form-wrapper');
        const userAvatarEl = document.getElementById('user-avatar');
        
        if (formWrapper && userAvatarEl) {
            formWrapper.style.display = 'block';
            userAvatarEl.src = profile.avatar;
        }

        if (isGuestMode) {
            const submitBtn = document.getElementById('btn-submit-comment');
            if (submitBtn) submitBtn.innerText = 'Enviar';
        }
    }
}

/* --- PANEL DE COMENTARIOS CON SUPABASE --- */
/* --- PANEL DE COMENTARIOS CON SUPABASE --- */
async function getSongComments() {
    const song = musicData[currentIndex];
    if (!song) return;

    let staticCommentsRaw = [];

    // 1. Cargar comentarios estáticos de GitHub (SIEMPRE SE CARGAN)
    if (song.coments) {
        try {
            staticCommentsRaw = await parseComments(song.coments);
        } catch (e) {
            console.warn("Error procesando comentarios de GitHub:", e);
            staticCommentsRaw = [];
        }
    }

    let combinedComments = staticCommentsRaw.map((c, index) => {
        if (Array.isArray(c)) {
            return {
                id: `static-${index}`,
                username: c[0] || 'Anónimo',
                avatar_url: c[1] || 'https://api.dicebear.com/7.x/bottts/svg?seed=static',
                comment_text: c[2] || '',
                author_name: c[0] || 'Anónimo',
                is_static: true
            };
        }
        return { ...c, is_static: true };
    });

    // Resetear el estado del comentario del usuario para esta canción
    userCommentState.existingCommentId = null;

    // 2. Cargar comentarios de Supabase
    if (typeof supabaseClient !== 'undefined' && supabaseClient) {
        try {
            const songSlug = slugify(song.title);
            const { data, error } = await supabaseClient
                .from('comments')
                .select('*')
                .eq('song_slug', songSlug)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                const dbComments = data.map(item => {
                    // Verificar si el usuario logueado ya comentó esta canción
                    // (los invitados siempre pueden volver a comentar)
                    if (!isGuestMode && currentUserName && item.author_name.toLowerCase() === currentUserName.toLowerCase()) {
                        userCommentState.existingCommentId = item.id;
                    }

                    return {
                        id: item.id,
                        username: item.username,
                        avatar_url: item.avatar_url,
                        comment_text: item.comment_text,
                        author_name: item.author_name,
                        is_static: false
                    };
                });
                // Colocar los comentarios de Supabase al inicio
                combinedComments = [...dbComments, ...combinedComments];
            }
        } catch (dbErr) {
            console.warn("Error al conectar con Supabase:", dbErr);
        }
    }

    // 3. Controlar la visibilidad de la caja de comentarios (comment-input-row)
    const inputRow = document.querySelector('.comment-input-row');
    const formWrapper = document.getElementById('comment-form-wrapper');

    if (formWrapper) {
        if (currentUserName) {
            formWrapper.style.display = 'block'; // El usuario tiene sesión activa por URL
            
            if (inputRow) {
                // Si ya comentó en esta canción y NO está editando, se oculta la barra de escribir
                if (userCommentState.existingCommentId && !userCommentState.isEditing) {
                    inputRow.style.display = 'none';
                } else {
                    inputRow.style.display = 'flex';
                }
            }
        } else {
            formWrapper.style.display = 'none'; // Si no hay usuario en URL, se oculta la barra
        }
    }

    // 4. Renderizar la lista combinada (GitHub + Supabase)
    renderComments(combinedComments);
}

function renderComments(commentsList) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    container.innerHTML = '';

    if (!Array.isArray(commentsList) || commentsList.length === 0) {
        container.innerHTML = '<p class="no-comments">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
        return;
    }

    commentsList.forEach(comment => {
        const commentEl = document.createElement('div');
        commentEl.className = 'comment-item';
        
        const name = comment.username || comment.author_name || 'Anónimo';
        const avatar = comment.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
        const text = escapeHTML(comment.comment_text || '');

        const isOwner = currentUserName && 
                        !isGuestMode &&
                        !comment.is_static && 
                        (comment.author_name.toLowerCase() === currentUserName.toLowerCase());

        let actionsHTML = '';
        if (isOwner) {
            actionsHTML = `
                <div class="comment-actions">
                    <button class="btn-comment-action" onclick="prepareEditComment('${comment.id}', '${text.replace(/'/g, "\\'")}')">Editar</button>
                    <button class="btn-comment-action btn-delete" onclick="deleteComment('${comment.id}')">Eliminar</button>
                </div>
            `;
        }

        commentEl.innerHTML = `
            <img src="${avatar}" 
                 alt="${name}" 
                 class="comment-avatar" 
                 onerror="this.onerror=null; this.src='https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}';">
            <div class="comment-content">
                <div class="comment-header-row">
                    <span class="comment-author">${name}</span>
                    ${actionsHTML}
                </div>
                <p class="comment-text">${text}</p>
            </div>
        `;
        container.appendChild(commentEl);
    });
}

async function handleCommentSubmit() {
    // Los invitados pasan por el modal de nombre + imagen antes de guardar
    if (isGuestMode) {
        openGuestModal();
        return;
    }

    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text || !currentUserName || !supabaseClient) return;

    if (text.length > 100) {
        alert("El comentario no puede superar los 100 caracteres.");
        return;
    }

    const song = musicData[currentIndex];
    const songSlug = slugify(song.title);
    const profile = USER_PROFILES[currentUserName] || {
        nickname: currentUserName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserName}`
    };

    if (userCommentState.existingCommentId) {
        await supabaseClient
            .from('comments')
            .update({ comment_text: text })
            .eq('id', userCommentState.existingCommentId);
    } else {
        await supabaseClient
            .from('comments')
            .insert([{
                song_slug: songSlug,
                author_name: currentUserName,
                username: profile.nickname,
                avatar_url: profile.avatar,
                comment_text: text
            }]);
    }

    input.value = "";
    input.style.height = 'auto';
    
    const charCounter = document.getElementById('char-counter');
    if (charCounter) {
        charCounter.innerText = "0/100";
        charCounter.classList.remove('limit-near');
    }

    const submitBtn = document.getElementById('btn-submit-comment');
    if (submitBtn) submitBtn.innerText = "Comentar";

    userCommentState.isEditing = false;
    getSongComments();
}

function prepareEditComment(id, text) {
    userCommentState.isEditing = true;
    userCommentState.existingCommentId = id;

    const inputRow = document.querySelector('.comment-input-row');
    if (inputRow) inputRow.style.display = 'flex';

    const input = document.getElementById('comment-input');
    input.value = text;
    input.focus();
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';

    const charCounter = document.getElementById('char-counter');
    if (charCounter) {
        charCounter.innerText = `${text.length}/100`;
    }

    const submitBtn = document.getElementById('btn-submit-comment');
    if (submitBtn) submitBtn.innerText = "Guardar";
}

async function deleteComment(id) {
    if (!confirm("¿Deseas eliminar tu comentario?")) return;
    
    if (supabaseClient) {
        await supabaseClient.from('comments').delete().eq('id', id);
        
        const input = document.getElementById('comment-input');
        if (input) input.value = "";
        
        const charCounter = document.getElementById('char-counter');
        if (charCounter) {
            charCounter.innerText = "0/100";
            charCounter.classList.remove('limit-near');
        }

        userCommentState.existingCommentId = null;
        userCommentState.isEditing = false;
        
        const submitBtn = document.getElementById('btn-submit-comment');
        if (submitBtn) submitBtn.innerText = "Comentar";

        getSongComments();
    }
}

/* --- COMENTARIOS DE INVITADO (/?nombre=guest) --- */
let isGuestModalOpen = false;
let isGuestConfirmOpen = false;

function getSelectedGuestImageOption() {
    const selected = document.querySelector('input[name="guest-img-option"]:checked');
    return selected ? selected.value : 'random';
}

function getLastUploadedGuestImage() {
    try {
        const links = JSON.parse(localStorage.getItem('imgbb_links')) || [];
        if (Array.isArray(links) && links.length > 0) {
            return links[links.length - 1];
        }
    } catch (e) {}
    return null;
}

function saveGuestImageLocally(url) {
    try {
        const links = JSON.parse(localStorage.getItem('imgbb_links')) || [];
        links.push(url);
        localStorage.setItem('imgbb_links', JSON.stringify(links));
    } catch (e) {}
}

function updateGuestImagePreview() {
    const preview = document.getElementById('guest-image-preview');
    const fileInput = document.getElementById('guest-file-input');
    const statusEl = document.getElementById('guest-upload-status');
    if (!preview) return;

    const option = getSelectedGuestImageOption();

    if (fileInput) fileInput.style.display = (option === 'upload') ? 'block' : 'none';

    if (option === 'random') {
        preview.style.display = 'block';
        preview.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).slice(2)}`;
        if (statusEl) statusEl.innerText = '';
    } else if (option === 'already') {
        const last = getLastUploadedGuestImage();
        if (last) {
            preview.style.display = 'block';
            preview.src = last;
            if (statusEl) statusEl.innerText = '';
        } else {
            preview.style.display = 'none';
            if (statusEl) statusEl.innerText = 'No hay imágenes subidas antes.';
        }
    } else {
        const file = fileInput && fileInput.files && fileInput.files[0];
        if (file) {
            preview.style.display = 'block';
            preview.src = URL.createObjectURL(file);
            if (statusEl) statusEl.innerText = '';
        } else {
            preview.style.display = 'none';
            if (statusEl) statusEl.innerText = 'Selecciona una imagen para subir.';
        }
    }
}

function openGuestModal() {
    isGuestModalOpen = true;

    const err = document.getElementById('guest-modal-error');
    if (err) err.innerText = '';
    const statusEl = document.getElementById('guest-upload-status');
    if (statusEl) statusEl.innerText = '';

    const nameInput = document.getElementById('guest-name-input');
    if (nameInput) nameInput.value = '';

    const fileInput = document.getElementById('guest-file-input');
    if (fileInput) fileInput.value = '';

    const uploadRadio = document.querySelector('input[name="guest-img-option"][value="upload"]');
    if (uploadRadio) uploadRadio.checked = true;

    updateGuestImagePreview();

    const modal = document.getElementById('guest-modal');
    if (modal) modal.classList.add('open');

    if (nameInput) nameInput.focus();
}

function closeGuestModal() {
    isGuestModalOpen = false;
    const modal = document.getElementById('guest-modal');
    if (modal) modal.classList.remove('open');
}

function showGuestConfirmModal() {
    isGuestConfirmOpen = true;
    const modal = document.getElementById('guest-confirm-modal');
    if (modal) modal.classList.add('open');
    const btn = modal ? modal.querySelector('button') : null;
    if (btn) btn.focus();
}

function closeGuestConfirmModal() {
    isGuestConfirmOpen = false;
    const modal = document.getElementById('guest-confirm-modal');
    if (modal) modal.classList.remove('open');
}

async function uploadGuestImageToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    if (!data || !data.success || !data.data || !data.data.url) {
        const msg = (data && data.error && data.error.message) ? data.error.message : 'Error al subir la imagen';
        throw new Error(msg);
    }
    return data.data.url;
}

async function resolveGuestImage() {
    const option = getSelectedGuestImageOption();

    if (option === 'random') {
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random().toString(36).slice(2)}`;
    }

    if (option === 'already') {
        return getLastUploadedGuestImage() || 'already_uploaded';
    }

    const fileInput = document.getElementById('guest-file-input');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) {
        throw new Error('Selecciona una imagen para subir o elige otra opción.');
    }

    const url = await uploadGuestImageToImgBB(file);
    saveGuestImageLocally(url);
    return url;
}

async function submitGuestComment() {
    const err = document.getElementById('guest-modal-error');
    const statusEl = document.getElementById('guest-upload-status');
    const okBtn = document.getElementById('btn-guest-ok');

    const nameInput = document.getElementById('guest-name-input');
    const usuario = nameInput ? nameInput.value.trim() : '';

    const commentInputEl = document.getElementById('comment-input');
    const comentario = commentInputEl ? commentInputEl.value.trim() : '';

    if (err) err.innerText = '';

    if (!usuario) {
        if (err) err.innerText = 'Escribe tu nombre de usuario.';
        return;
    }
    if (!comentario) {
        if (err) err.innerText = 'El comentario está vacío.';
        return;
    }
    if (comentario.length > 100) {
        if (err) err.innerText = 'El comentario no puede superar los 100 caracteres.';
        return;
    }
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        if (err) err.innerText = 'No se pudo conectar con el servidor.';
        return;
    }

    if (okBtn) okBtn.disabled = true;
    if (statusEl) statusEl.innerText = 'Enviando...';

    try {
        const imageValue = await resolveGuestImage();

        // Título de la canción activa (desde el estado del reproductor)
        const currentSong = musicData[currentIndex];
        const songTitle = currentSong ? currentSong.title : '';

        // Objeto JSON: { "song_title": ["usuario", "image_url_o_flag", "comentario"] }
        const payload = { [songTitle]: [usuario, imageValue, comentario] };

        const { error } = await supabaseClient
            .from('guest_comments')
            .insert([{ payload }]);

        if (error) throw new Error(error.message || 'Error al guardar el comentario');

        closeGuestModal();

        if (commentInputEl) {
            commentInputEl.value = '';
            commentInputEl.style.height = 'auto';
        }
        const counter = document.getElementById('char-counter');
        if (counter) {
            counter.innerText = '0/100';
            counter.classList.remove('limit-near');
        }

        showGuestConfirmModal();
    } catch (e) {
        if (err) err.innerText = e.message || 'Error al enviar el comentario.';
        if (statusEl) statusEl.innerText = '';
    } finally {
        if (okBtn) okBtn.disabled = false;
    }
}

async function openCommentsPanel() {
    isCommentsOpen = true;
    document.getElementById('comments-panel').classList.add('open');
    document.getElementById('btn-comments').classList.add('active');
    
    // 🟢 OBLIGATORIO: Llama a getSongComments para consultar la BD y GitHub al abrir
    await getSongComments();
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

    // Reset de overlays y animaciones de la canción anterior
    resetOverlayImages();
    stopAnimOverlays();

    currentIndex = index;
    const song = musicData[currentIndex];

    // Clase has-img2: subtitulos sobre la barra de progreso solo si la cancion tiene img_2
    const playerContainer = document.getElementById('player-container');
    if (playerContainer) {
        if (Array.isArray(song.img_2) && song.img_2.length > 0) {
            playerContainer.classList.add('has-img2');
        } else {
            playerContainer.classList.remove('has-img2');
        }
    }

    updateTrackUI(song);

    const hasEnglish = song.audio_eng || song.lyrics_eng;
    const btnEnglish = document.getElementById('btn-english');
    
    if (hasEnglish) {
        btnEnglish.style.display = 'flex';
    } else {
        btnEnglish.style.display = 'none';
        isEnglishVersion = false;
    }
    updateEnglishButtonUI();

    const activeAudio = (isEnglishVersion && song.audio_eng) ? song.audio_eng : song.audio;
    const activeLyrics = (isEnglishVersion && song.lyrics_eng) ? song.lyrics_eng : song.lyrics;

    currentAudio.src = activeAudio;
    currentAudio.load();
    
    parsedLyrics = [];
    document.getElementById('lyric-text').innerText = "Cargando letra...";
    document.getElementById('player-bg').style.backgroundImage = `url('${song.img}')`;

    loadPlaylist();

    // Iniciar overlays y animaciones de la nueva canción
    startAnimOverlays();

    try {
        parsedLyrics = await parseLRC(activeLyrics);
        if (parsedLyrics.length === 0) {
            document.getElementById('lyric-text').innerText = "🎵 Instrumental o sin letra disponible";
        }
    } catch (e) {
        document.getElementById('lyric-text').innerText = "🎵 Disfruta la música";
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

/* --- IMÁGENES ADICIONALES CON TIMESTAMP (img_2, img_3, ...) --- */
function parseTimestamp(str) {
    if (!str) return 0;
    const parts = str.split(':');
    if (parts.length === 2) {
        const min = parseInt(parts[0], 10) || 0;
        const sec = parseFloat(parts[1]) || 0;
        return min * 60 + sec;
    }
    return parseFloat(str) || 0;
}

function updateOverlayImages(currentTime) {
    const overlaysContainer = document.getElementById('player-overlays');
    if (!overlaysContainer) return;

    const song = musicData[currentIndex];
    if (!song) return;

    // Ocultar animaciones de img_anim cuando la primera img_2 aparece
    if (Array.isArray(song.img_2) && song.img_2.length > 0) {
        const firstImg2Time = parseTimestamp(song.img_2[0].time);
        const animLayer = document.getElementById('anim-layer');
        if (animLayer && currentTime >= firstImg2Time) {
            const baseAnims = animLayer.querySelectorAll('[data-anim-idx^="base-"]');
            baseAnims.forEach(el => {
                el.style.display = 'none';
            });
            // Cancelar timeouts de img_anim
            imgAnimTimeouts.forEach(id => clearTimeout(id));
            imgAnimTimeouts = [];
        }
    }

    // Mostrar imágenes cuyo timestamp <= currentTime
    if (!Array.isArray(song.img_2)) return;

    // Solo la img_2 más reciente cuyo tiempo ya pasó está activa
    // (las anteriores se anulan al aparecer una nueva)
    let activeOverlayIdx = -1;
    song.img_2.forEach((imgEntry, idx) => {
        if (currentTime >= parseTimestamp(imgEntry.time)) activeOverlayIdx = idx;
    });

    song.img_2.forEach((imgEntry, idx) => {
        let el = overlaysContainer.querySelector(`[data-overlay-idx="${idx}"]`);
        const shouldShow = (idx === activeOverlayIdx);

        if (shouldShow && !el) {
            el = document.createElement('img');
            el.className = 'player-overlay-img';
            el.src = imgEntry.url;
            el.dataset.overlayIdx = idx;
            overlaysContainer.appendChild(el);
        } else if (!shouldShow && el) {
            el.remove();
        }
    });
}

function resetOverlayImages() {
    const overlaysContainer = document.getElementById('player-overlays');
    if (overlaysContainer) overlaysContainer.innerHTML = '';
    const animLayer = document.getElementById('anim-layer');
    if (animLayer) animLayer.innerHTML = '';
}

/* --- ANIMACIONES DENTRO DE img_2 (img_2[i].anim) --- */
function updateImg2Anims(currentTime) {
    const song = musicData[currentIndex];
    if (!song || !Array.isArray(song.img_2)) return;

    const animLayer = document.getElementById('anim-layer');
    if (!animLayer) return;

    // Obtener dimensiones del reproductor
    const size = getPlayerSize();

    // Solo la img_2 más reciente cuyo tiempo ya pasó está activa
    // (al aparecer una nueva, la animación de la anterior se anula)
    let activeIdx = -1;
    song.img_2.forEach((imgEntry, idx) => {
        if (currentTime >= parseTimestamp(imgEntry.time)) activeIdx = idx;
    });

    // PRIMERO: eliminar animaciones de imágenes que ya no están activas
    const allImg2Anims = animLayer.querySelectorAll('[data-anim-idx^="img2-"]');
    allImg2Anims.forEach(el => {
        const parts = el.dataset.animIdx.split('-');
        const imgIdx = parseInt(parts[1], 10);
        if (imgIdx !== activeIdx) {
            if (el._timeoutId) {
                clearTimeout(el._timeoutId);
                el._timeoutId = null;
            }
            el.remove();
        }
    });

    // SEGUNDO: mostrar las animaciones de la imagen activa
    if (activeIdx < 0) return;
    const imgEntry = song.img_2[activeIdx];
    if (!Array.isArray(imgEntry.anim) || imgEntry.anim.length === 0) return;

    imgEntry.anim.forEach((anim, animIdx) => {
        const dataIdx = `img2-${activeIdx}-${animIdx}`;
        let el = animLayer.querySelector(`[data-anim-idx="${dataIdx}"]`);

        if (!el) {
            // Usar dimensiones de la imagen img_2 como referencia
            const refW = anim.refWidth || 1365;
            const refH = anim.refHeight || 768;
            const effSize = size.ready ? size : { w: refW, h: refH, ready: true };
            const scale = computeAnimScale(refW, refH, effSize);

            const x = (anim.x || 0) * scale;
            const y = (anim.y || 0) * scale;
            const w = (anim.width || 136) * scale;
            const h = (anim.height || 170) * scale;

            const img = document.createElement('img');
            img.className = 'anim-overlay-img';
            img.src = anim.url;
            img.dataset.animIdx = dataIdx;
            img.style.display = 'block';
            img.style.left = `${x}px`;
            img.style.top = `${y}px`;
            img.style.width = `${w}px`;
            img.style.height = `${h}px`;

            animLayer.appendChild(img);

            // Intermitencia con tracking individual
            const toggleVisibility = () => {
                if (!img.parentNode) return;
                const isVisible = img.style.display === 'block';
                img.style.display = isVisible ? 'none' : 'block';
                const delay = 500 + Math.random() * 300;
                img._timeoutId = setTimeout(toggleVisibility, delay);
            };
            toggleVisibility();
        }
    });
}

let img2RefDimensions = {};
function getImg2Dimensions(url, callback) {
    if (img2RefDimensions[url]) {
        callback(img2RefDimensions[url].w, img2RefDimensions[url].h);
        return;
    }
    const img = new Image();
    img.onload = function() {
        img2RefDimensions[url] = { w: this.naturalWidth, h: this.naturalHeight };
        callback(this.naturalWidth, this.naturalHeight);
    };
    img.onerror = function() {
        callback(690, 388);
    };
    img.src = url;
}

/* --- IMÁGENES ANIMADAS SUPERPUESAS (img2_anim[axb] e img_anim) --- */
let animTimeouts = [];
let imgAnimTimeouts = [];

/* Resolución de referencia para las coordenadas de animación = dimensiones naturales de la imagen base */
let animRefWidth = 690;
let animRefHeight = 388;

function updateAnimRefFromImage(imgUrl) {
    const img = new Image();
    img.onload = function() {
        animRefWidth = this.naturalWidth;
        animRefHeight = this.naturalHeight;
    };
    img.src = imgUrl;
}

/* Dimensiones del reproductor (indica si ya está maquetado) */
function getPlayerSize() {
    const playerContainer = document.getElementById('player-container');
    const rect = playerContainer ? playerContainer.getBoundingClientRect() : null;
    if (rect && rect.width > 0 && rect.height > 0) {
        return { w: rect.width, h: rect.height, ready: true };
    }
    return { w: animRefWidth, h: animRefHeight, ready: false };
}

/* Escala uniforme segura: nunca 0 ni NaN (evita animaciones invisibles en webOS) */
function computeAnimScale(refW, refH, size) {
    const sx = size.w / refW;
    const sy = size.h / refH;
    let scale = Math.min(sx, sy);
    if (!isFinite(scale) || scale <= 0) {
        scale = (isFinite(sx) && sx > 0) ? sx : 1;
    }
    return scale;
}

/* Crea una imagen de animación superpuesta con intermitencia */
function createAnimImg(anim, dataIdx, scale, animLayer, timeouts) {
    const naturalW = anim.width || 81;
    const naturalH = anim.height || 102;

    const x = (anim.x || 0) * scale;
    const y = (anim.y || 0) * scale;
    const w = naturalW * scale;
    const h = naturalH * scale;

    const img = document.createElement('img');
    img.className = 'anim-overlay-img';
    img.src = anim.url;
    img.dataset.animIdx = dataIdx;
    img.style.display = 'block';
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.width = `${w}px`;
    img.style.height = `${h}px`;

    animLayer.appendChild(img);

    const toggleVisibility = () => {
        if (!img.parentNode) return; // ya fue removido (compatible webOS; isConnected no existe en versiones antiguas)
        const isVisible = img.style.display === 'block';
        img.style.display = isVisible ? 'none' : 'block';
        const delay = 500 + Math.random() * 300;
        const timeoutId = setTimeout(toggleVisibility, delay);
        timeouts.push(timeoutId);
    };

    toggleVisibility();
}

function startAnimOverlays(retry) {
    retry = retry || 0;
    stopAnimOverlays();

    const song = musicData[currentIndex];
    if (!song) return;

    const animLayer = document.getElementById('anim-layer');
    if (!animLayer) return;

    // Medir el contenedor (síncrono, sin rAF, que puede no dispararse en webOS)
    const size = getPlayerSize();
    const scale = computeAnimScale(animRefWidth, animRefHeight, size);

    // Animaciones sobre la imagen base (img_anim)
    if (Array.isArray(song.img_anim)) {
        song.img_anim.forEach((anim, idx) => {
            createAnimImg(anim, `base-${idx}`, scale, animLayer, imgAnimTimeouts);
        });
    }

    // Animaciones sobre imágenes img_2 (img2_anim) — compatibilidad legada
    if (Array.isArray(song.img2_anim)) {
        song.img2_anim.forEach((anim, idx) => {
            createAnimImg(anim, `legacy2-${idx}`, scale, animLayer, animTimeouts);
        });
    }

    // Si el reproductor aún no tenía tamaño (webOS al entrar), reintentar recolocar
    if (!size.ready && retry < 5) {
        setTimeout(() => startAnimOverlays(retry + 1), 250);
    }
}

function stopAnimOverlays() {
    animTimeouts.forEach(id => clearTimeout(id));
    animTimeouts = [];
    imgAnimTimeouts.forEach(id => clearTimeout(id));
    imgAnimTimeouts = [];
    const animLayer = document.getElementById('anim-layer');
    if (animLayer) {
        // Cancelar también los timeouts individuales de las animaciones de img_2
        animLayer.querySelectorAll('[data-anim-idx^="img2-"]').forEach(el => {
            if (el._timeoutId) {
                clearTimeout(el._timeoutId);
                el._timeoutId = null;
            }
        });
        animLayer.innerHTML = '';
    }
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

    // Recolocar animaciones aunque webOS no dispare fullscreenchange/resize
    scheduleRecalculate();
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
        openUnlockModal();
    }
}

/* --- MODAL DE DESBLOQUEO (código de acceso, sin prompt nativo de TV) --- */
let isUnlockModalOpen = false;
let unlockInput = "";
const UNLOCK_CODE = "1725";

function updateUnlockDisplay() {
    const display = document.getElementById('unlock-code-display');
    if (!display) return;
    let s = "";
    for (let i = 0; i < 4; i++) {
        s += (i < unlockInput.length) ? "● " : "· ";
    }
    display.innerText = s.trim();
}

function openUnlockModal() {
    isUnlockModalOpen = true;
    unlockInput = "";
    updateUnlockDisplay();
    const err = document.getElementById('unlock-error');
    if (err) err.innerText = "";
    const modal = document.getElementById('unlock-modal');
    if (modal) modal.classList.add('open');
    const firstBtn = document.querySelector('#unlock-modal .keypad-btn');
    if (firstBtn) firstBtn.focus();
}

function closeUnlockModal() {
    isUnlockModalOpen = false;
    const modal = document.getElementById('unlock-modal');
    if (modal) modal.classList.remove('open');
    const trigger = document.getElementById('dev-unlock-trigger');
    if (trigger) trigger.focus();
}

function appendUnlockDigit(d) {
    if (!isUnlockModalOpen) return;
    if (unlockInput.length >= 4) return;
    unlockInput += d;
    updateUnlockDisplay();
    if (unlockInput.length === 4) submitUnlockCode();
}

function backspaceUnlockDigit() {
    if (!isUnlockModalOpen) return;
    unlockInput = unlockInput.slice(0, -1);
    updateUnlockDisplay();
}

function submitUnlockCode() {
    if (unlockInput === UNLOCK_CODE) {
        isRatedUnlocked = true;
        closeUnlockModal();
        loadPlaylist();
        showToast("Contenido completo desbloqueado");
    } else {
        const err = document.getElementById('unlock-error');
        if (err) err.innerText = "Código incorrecto. Inténtalo de nuevo.";
        unlockInput = "";
        updateUnlockDisplay();
    }
}

/* --- MODO CLARO / OSCURO --- */
function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    const moon = document.getElementById('icon-moon');
    const sun = document.getElementById('icon-sun');
    if (moon) moon.style.display = isDark ? 'none' : 'block';
    if (sun) sun.style.display = isDark ? 'block' : 'none';
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    try {
        localStorage.setItem('luxio-theme', isDark ? 'dark' : 'light');
    } catch (e) {}
    updateThemeIcon();
}

function initTheme() {
    let saved = null;
    try {
        saved = localStorage.getItem('luxio-theme');
    } catch (e) {}
    if (saved === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateThemeIcon();
}

/* --- EVENT LISTENERS --- */
function on(id, evt, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
}

on('btn-play-pause', 'click', togglePlayPause);
on('btn-english', 'click', toggleEnglishVersion);
on('btn-prev', 'click', playPrevTrack);
on('btn-next', 'click', playNextTrack);
on('btn-repeat', 'click', toggleRepeat);
on('btn-share', 'click', shareCurrentSong);
on('btn-fullscreen', 'click', toggleFullscreen);
on('btn-comments', 'click', toggleCommentsPanel);
on('btn-submit-comment', 'click', handleCommentSubmit);
on('btn-dark-mode', 'click', toggleDarkMode);

// Listener para el contador de caracteres y auto-expandir textarea
const commentInput = document.getElementById('comment-input');
const charCounter = document.getElementById('char-counter');

if (commentInput) commentInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';

    const length = this.value.length;
    if (charCounter) {
        charCounter.innerText = `${length}/100`;
        if (length >= 90) {
            charCounter.classList.add('limit-near');
        } else {
            charCounter.classList.remove('limit-near');
        }
    }
});

// Listeners del modal de invitado (imagen de perfil)
const guestFileInput = document.getElementById('guest-file-input');
if (guestFileInput) guestFileInput.addEventListener('change', updateGuestImagePreview);

document.querySelectorAll('input[name="guest-img-option"]').forEach(radio => {
    radio.addEventListener('change', updateGuestImagePreview);
});

currentAudio.addEventListener('timeupdate', () => {
    const current = currentAudio.currentTime;
    const duration = currentAudio.duration;

    if (!isNaN(duration) && duration > 0) {
        const pct = (current / duration) * 100;
        document.getElementById('time-progress').style.width = `${pct}%`;
        document.getElementById('time-text').innerText = `${formatTime(current)} / ${formatTime(duration)}`;
    }

    updateLyrics(current);
    updateOverlayImages(current);
    updateImg2Anims(current);
});

// Reajustar animaciones cuando cambia el tamaño (pantalla completa, resize ventana)
function recalculateAnimations() {
    const song = musicData[currentIndex];
    if (!song) return;

    // Recrear TODAS las animaciones (base + img_2) con las nuevas dimensiones
    startAnimOverlays();

    if (currentAudio && !isNaN(currentAudio.currentTime)) {
        updateImg2Anims(currentAudio.currentTime);
    }
}

// Deferir un poco para que el layout de webOS ya tenga el tamaño final
let recalcTimer = null;
function scheduleRecalculate() {
    if (recalcTimer) clearTimeout(recalcTimer);
    recalcTimer = setTimeout(recalculateAnimations, 120);
}

window.addEventListener('resize', scheduleRecalculate);

// Listener específico para cambios de pantalla completa en webOS
document.addEventListener('fullscreenchange', scheduleRecalculate);
document.addEventListener('webkitfullscreenchange', scheduleRecalculate);

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

const timeBar = document.getElementById('time-bar');
if (timeBar) timeBar.addEventListener('click', (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = clickX / rect.width;
    if (!isNaN(currentAudio.duration)) {
        currentAudio.currentTime = pct * currentAudio.duration;
    }
});

/* --- NAVEGACIÓN POR MANDO (D-PAD / FOCO) --- */
function getFocusableItems() {
    if (isUnlockModalOpen) {
        return Array.from(document.querySelectorAll('#unlock-modal button'))
            .filter(el => !el.disabled && el.offsetParent !== null);
    }
    if (isGuestConfirmOpen) {
        return Array.from(document.querySelectorAll('#guest-confirm-modal button'))
            .filter(el => !el.disabled && el.offsetParent !== null);
    }
    if (isGuestModalOpen) {
        return Array.from(document.querySelectorAll('#guest-modal button, #guest-modal input, #guest-modal [tabindex="0"]'))
            .filter(el => !el.disabled && el.offsetParent !== null);
    }
    return Array.from(document.querySelectorAll('button, [tabindex="0"]'))
        .filter(el => !el.disabled && el.offsetParent !== null);
}

function moveFocus(direction) {
    const items = getFocusableItems();
    if (items.length === 0) return;

    const current = document.activeElement;
    if (!current || !items.includes(current)) {
        items[0].focus();
        items[0].scrollIntoView({ block: 'nearest', inline: 'nearest' });
        return;
    }

    const cr = current.getBoundingClientRect();
    const cx = cr.left + cr.width / 2;
    const cy = cr.top + cr.height / 2;

    let best = null;
    let bestScore = Infinity;

    for (const el of items) {
        if (el === current) continue;
        const r = el.getBoundingClientRect();
        const dx = (r.left + r.width / 2) - cx;
        const dy = (r.top + r.height / 2) - cy;

        let primary;
        if (direction === 'right') { if (dx <= 4) continue; primary = dx; }
        else if (direction === 'left') { if (dx >= -4) continue; primary = -dx; }
        else if (direction === 'down') { if (dy <= 4) continue; primary = dy; }
        else { if (dy >= -4) continue; primary = -dy; }

        const secondary = (direction === 'left' || direction === 'right') ? Math.abs(dy) : Math.abs(dx);
        const score = primary + secondary * 2;

        if (score < bestScore) {
            bestScore = score;
            best = el;
        }
    }

    if (best) {
        best.focus();
        best.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
}

window.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const tag = active ? active.tagName : '';
    const inputType = active ? (active.type || '').toLowerCase() : '';
    const isTyping = tag === 'TEXTAREA' ||
        (tag === 'INPUT' && inputType !== 'radio' && inputType !== 'checkbox' && inputType !== 'file' && inputType !== 'button' && inputType !== 'submit');

    // Tecla Back/Return de webOS
    if (e.keyCode === 461 || e.key === 'GoBack' || e.key === 'BrowserBack') {
        if (isUnlockModalOpen) {
            closeUnlockModal();
        } else if (isGuestConfirmOpen) {
            closeGuestConfirmModal();
        } else if (isGuestModalOpen) {
            closeGuestModal();
        } else if (isCommentsOpen) {
            closeCommentsPanel();
        } else if (document.fullscreenElement) {
            toggleFullscreen();
        }
        e.preventDefault();
        return;
    }

    // No interceptar flechas/Enter mientras se escribe un comentario
    if (isTyping) return;

    switch (e.key) {
        case 'ArrowRight': moveFocus('right'); e.preventDefault(); break;
        case 'ArrowLeft': moveFocus('left'); e.preventDefault(); break;
        case 'ArrowDown': moveFocus('down'); e.preventDefault(); break;
        case 'ArrowUp': moveFocus('up'); e.preventDefault(); break;
        case 'Enter':
            if (active && active.tagName !== 'BUTTON' && typeof active.click === 'function') {
                active.click();
                e.preventDefault();
            }
            break;
    }
});

/* --- VERIFICACIÓN DE CATBOX (solo al arrancar) --- */
function checkServerStatus() {
    const statusEl = document.getElementById('server-status');
    const statusText = document.getElementById('status-text');
    if (!statusEl || !statusText) return;

    statusEl.className = 'server-status unknown';
    statusText.innerText = '...';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch('https://catbox.moe', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
    })
    .then(() => {
        clearTimeout(timeoutId);
        statusEl.className = 'server-status up';
        statusText.innerText = 'UP';
    })
    .catch(() => {
        clearTimeout(timeoutId);
        statusEl.className = 'server-status down';
        statusText.innerText = 'DOWN';
    });
}

/* --- ANTI-SALVAPANTALLAS EN webOS TV --- */
let antiScreensaverVideo = null;

let keepScreenOnInterval = null;

function keepScreenOn() {
    // Método 1: Power Service (formal, requiere permiso en appinfo.json)
    if (typeof webOS !== 'undefined' && webOS.service) {
        webOS.service.request("luna://com.webos.service.tvpower", {
            method: "powerState",
            parameters: { state: "active" },
            onSuccess: function() {},
            onFailure: function() {
                // Fallback: video oculto en loop
                startHiddenVideoLoop();
            }
        });
    } else {
        startHiddenVideoLoop();
    }
}

function startKeepScreenOnLoop() {
    if (keepScreenOnInterval) return;
    keepScreenOn();
    // webOS puede resetear el powerState tras unos minutos. Reactivar cada 2 min.
    keepScreenOnInterval = setInterval(keepScreenOn, 120000);
}

function startHiddenVideoLoop() {
    if (antiScreensaverVideo) return;

    // Crear un canvas negro de 1x1 y usar captureStream como fuente de video
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 1, 1);

    antiScreensaverVideo = document.createElement('video');
    antiScreensaverVideo.muted = true;
    antiScreensaverVideo.playsInline = true;
    antiScreensaverVideo.style.position = 'fixed';
    antiScreensaverVideo.style.top = '-1000px';
    antiScreensaverVideo.style.left = '-1000px';
    antiScreensaverVideo.style.width = '1px';
    antiScreensaverVideo.style.height = '1px';
    antiScreensaverVideo.style.opacity = '0';
    antiScreensaverVideo.style.pointerEvents = 'none';

    try {
        antiScreensaverVideo.srcObject = canvas.captureStream(1);
        antiScreensaverVideo.play().catch(() => {});
    } catch (e) {
        // Si captureStream no esta disponible, usar un data URI minimo
        antiScreensaverVideo.src = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAABhtZGF0AAAC8wYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDENMjQgLSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDI0IC0gaHR0cDovL3d3dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MCByZWY9MyBkZWJsb2NrPTE6MDowIGFuYWx5c2U9MHgzOjB4MTEzIG1lPWhleCBzdWJtZT03IHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAgbWl4ZWRfcmVmPTEgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0xIDh4OGRjdD0xIGNxbT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PTItMiB0aHJlYWRzPTYgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSBvcGVuX2dvcD0wIHdlaWdodGI9MSBrZXlpbnQ9MjUwIGtleWludF9taW49MjUgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuMDAgYXE9MToxLjAwAIAAAAAAABWngADWd+zD8DJgAADKgAAAAAAAAAMBkAAAAAAAAAIYEAAA4AAYcDG6AAA';
        antiScreensaverVideo.play().catch(() => {});
    }

    document.body.appendChild(antiScreensaverVideo);

    // webOS puede pausar el video tras unos minutos. Re-anudar cada 30s.
    setInterval(() => {
        if (antiScreensaverVideo && antiScreensaverVideo.paused) {
            antiScreensaverVideo.play().catch(() => {});
        }
    }, 30000);
}

/* --- INICIALIZACIÓN --- */
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkUserAccess();
    checkServerStatus();
    startKeepScreenOnLoop();

    const urlParams = new URLSearchParams(window.location.search);
    const songParam = urlParams.get('song');
    const authorParam = urlParams.get('author');

    if (songParam) {
        const foundIndex = musicData.findIndex(item => slugify(item.title) === songParam);
        if (foundIndex !== -1) {
            // NUEVO: Si la canción está marcada como 'rated: "on"', la desbloqueamos automáticamente
            if (musicData[foundIndex].rated === "on") {
                isRatedUnlocked = true;
            }
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
