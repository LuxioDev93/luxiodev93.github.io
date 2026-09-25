// CONFIGURACIÓN SUPABASE (Reemplaza con tus credenciales)
const SUPABASE_URL = "HTTPS://TU-PROYECTO.SUPABASE.CO";
const SUPABASE_ANON_KEY = "TU-ANON-KEY";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// DATOS DE USUARIO FIJOS SEGÚN LA MUESTRA / URL
let currentUserName = null; // Se llena si entra con ?nombre=
let userCommentState = {
    existingCommentId: null, // Guarda el ID si el usuario ya comentó esta canción
    isEditing: false
};

// Mapa de avatares/usuarios fijos
const USER_PROFILES = {
    "cuco": {
        nickname: "Cuco Club",
        avatar: "https://i.ibb.co/8LY8GCMM/gallina-terrenal.jpg"
    },
    "default": {
        nickname: "Usuario Lux.io",
        avatar: "https://i.pravatar.cc/150?u=luxio"
    }
};

/* --- DETECCIÓN DE PARÁMETROS URL --- */
function checkUserAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const nombreParam = urlParams.get('nombre');

    if (nombreParam) {
        currentUserName = nombreParam.toLowerCase();
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
    }
}

/* --- PANEL DE COMENTARIOS INTEGRADO CON SUPABASE Y ARCHIVO LOCAL --- */
async function getSongComments(song) {
    let combinedComments = [];

    // 1. Obtener comentarios guardados local/txt de la propiedad song.coments
    try {
        const fileComments = await parseComments(song.coments);
        combinedComments = fileComments.map(c => ({
            id: null,
            username: c[0],
            avatar_url: c[1],
            comment_text: c[2],
            is_static: true
        }));
    } catch(e) {
        console.warn("No se pudieron cargar comentarios estáticos:", e);
    }

    // 2. Obtener comentarios en tiempo real desde Supabase
    if (supabase) {
        const songSlug = slugify(song.title);
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('song_slug', songSlug)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const dbComments = data.map(item => ({
                id: item.id,
                username: item.username,
                avatar_url: item.avatar_url,
                comment_text: item.comment_text,
                author_name: item.author_name,
                is_static: false
            }));
            combinedComments = [...dbComments, ...combinedComments];
        }
    }

    return combinedComments;
}

async function renderComments() {
    const list = document.getElementById('comments-list');
    const song = musicData[currentIndex];

    list.innerHTML = `<div class="no-comments">Cargando comentarios...</div>`;
    
    const comments = await getSongComments(song);
    userCommentState.existingCommentId = null;

    if (comments.length === 0) {
        list.innerHTML = `<div class="no-comments">No hay comentarios aún</div>`;
        return;
    }

    list.innerHTML = comments.map(c => {
        const isOwner = currentUserName && c.author_name === currentUserName && !c.is_static;
        
        if (isOwner) {
            userCommentState.existingCommentId = c.id;
        }

        return `
            <div class="comment-item" id="comment-${c.id}">
                <img class="comment-avatar" src="${c.avatar_url}" alt="${c.username}" loading="lazy" onerror="this.src='https://i.pravatar.cc/150?u=fallback'">
                <div class="comment-body">
                    <div class="comment-header">
                        <p class="comment-username">${c.username}</p>
                        ${isOwner ? `
                            <div class="comment-actions">
                                <button class="btn-comment-action" onclick="prepareEditComment('${c.id}', \`${escapeHTML(c.comment_text)}\`)">Editar</button>
                                <button class="btn-comment-action delete" onclick="deleteComment('${c.id}')">Eliminar</button>
                            </div>
                        ` : ''}
                    </div>
                    <p class="comment-text">${escapeHTML(c.comment_text)}</p>
                </div>
            </div>
        `;
    }).join('');

    // Ajustar el botón de envío según si el usuario ya comentó
    const submitBtn = document.getElementById('btn-submit-comment');
    if (submitBtn) {
        submitBtn.innerText = userCommentState.existingCommentId ? "Actualizar" : "Comentar";
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

async function handleCommentSubmit() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text || !currentUserName || !supabase) return;

    const song = musicData[currentIndex];
    const songSlug = slugify(song.title);
    const profile = USER_PROFILES[currentUserName] || {
        nickname: currentUserName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUserName}`
    };

    if (userCommentState.existingCommentId) {
        // Actualizar comentario existente
        await supabase
            .from('comments')
            .update({ comment_text: text })
            .eq('id', userCommentState.existingCommentId);
    } else {
        // Insertar nuevo comentario
        await supabase
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
    userCommentState.isEditing = false;
    renderComments();
}

function prepareEditComment(id, text) {
    const input = document.getElementById('comment-input');
    input.value = text;
    input.focus();
    userCommentState.isEditing = true;
    userCommentState.existingCommentId = id;
    
    const submitBtn = document.getElementById('btn-submit-comment');
    if (submitBtn) submitBtn.innerText = "Guardar";
}

async function deleteComment(id) {
    if (!confirm("¿Deseas eliminar tu comentario?")) return;
    
    if (supabase) {
        await supabase.from('comments').delete().eq('id', id);
        const input = document.getElementById('comment-input');
        input.value = "";
        userCommentState.existingCommentId = null;
        renderComments();
    }
}

/* Event listeners para enviar comentario */
document.getElementById('btn-submit-comment')?.addEventListener('click', handleCommentSubmit);

// Auto-expandir textarea al escribir
document.getElementById('comment-input')?.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

/* Actualización dentro del DOMContentLoaded de script.js */
window.addEventListener('DOMContentLoaded', () => {
    checkUserAccess(); // Comprobar si el usuario viene con el parámetro ?nombre=
    // ... resto de tu inicialización
});
