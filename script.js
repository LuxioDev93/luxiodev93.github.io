/* --- REGISTRO Y RESET BÁSICO --- */
:root {
    --yt-bg: #ffffff;
    --yt-text-primary: #0f0f0f;
    --yt-text-secondary: #606060;
    --yt-hover-bg: #f2f2f2;
    --yt-active-bg: #e5e5e5;
    --yt-border: #e5e5e5;
    --yt-red: #ff0000;
}

* {
    box-sizing: border-box;
}

/* IMPORTANTE: El body NO debe llevar overflow: hidden */
html, body {
    margin: 0; 
    padding: 0; 
    width: 100%;
    min-height: 100vh;
    font-family: "Roboto", "Segoe UI", Arial, sans-serif;
    background-color: var(--yt-bg);
    color: var(--yt-text-primary);
    overflow-x: hidden;
    overflow-y: auto;
}

#main-layout {
    position: relative; 
    display: flex; 
    flex-direction: column;
    width: 100%; 
    max-width: 800px;
    margin: 0 auto;
    min-height: 100vh;
}

/* --- CONTENEDOR FIJO SUPERIOR (CLAVE PARA EL BLOQUEO) --- */
#top-sticky-wrapper {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* --- REPRODUCTOR --- */
#top-player-panel {
    width: 100%;
    padding: 12px 16px 8px 16px;
    background: #ffffff;
    border-bottom: 1px solid var(--yt-border);
}

#player-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000000;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

#player-bg {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    filter: blur(8px);
    opacity: 0.35;
    z-index: 1;
    transition: background-image 0.5s ease;
}

#lyrics-display {
    position: relative;
    z-index: 2;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 20px;
}

#lyric-text {
    color: #ffffff;
    font-size: clamp(1.2rem, 3.5vw, 2.5rem); 
    line-height: 1.3;
    font-weight: 700;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
    transition: opacity 0.3s ease; 
    margin: 0;
}

#player-controls {
    position: relative;
    z-index: 2;
    padding: 10px 16px 12px 16px;
    background: linear-gradient(to top, rgba(0,0,0,0.95), transparent);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.time-bar-container {
    display: flex;
    align-items: center;
    gap: 10px;
}

.time-bar {
    flex: 1;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    position: relative;
    cursor: pointer;
    transition: height 0.1s ease;
}

.time-bar:hover {
    height: 6px;
}

.time-progress {
    height: 100%;
    width: 0%;
    background: var(--yt-red);
    border-radius: 2px;
}

.time-text {
    font-size: 12px;
    color: #eeeeee;
    min-width: 75px;
    text-align: right;
}

.controls-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.controls-left-group {
    display: flex;
    align-items: center;
    flex: 1;
}

.controls-right-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.nav-buttons-group {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 10%;
}

.btn-control {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.9;
    transition: transform 0.1s, opacity 0.2s;
}

.btn-control:hover {
    opacity: 1;
    transform: scale(1.1);
}

.btn-control svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
}

#btn-repeat, #btn-english {
    color: #888888;
    opacity: 0.6;
    transition: color 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
}

#btn-repeat.active, #btn-english.active {
    color: #ffffff;
    opacity: 1;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
}

/* --- INFO CANCIÓN Y BOTÓN COMENTARIOS --- */
#current-track-info {
    margin-top: 10px;
    padding: 0 4px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.track-info-left {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

#current-track-title {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--yt-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#current-track-author {
    margin: 2px 0 0 0;
    font-size: 0.9rem;
    color: var(--yt-text-secondary);
    font-weight: 500;
    display: inline-block;
}

#btn-comments {
    flex-shrink: 0;
    background: var(--yt-hover-bg);
    border: 1px solid var(--yt-border);
    color: var(--yt-text-secondary);
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, color 0.2s ease;
    margin-top: 2px;
}

#btn-comments:hover, #btn-comments.active {
    background: var(--yt-active-bg);
    color: var(--yt-text-primary);
}

#btn-comments svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
}

#share-toast {
    position: absolute;
    bottom: 60px;
    right: 15px;
    background: rgba(15, 15, 15, 0.9);
    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 10;
}

#share-toast.show {
    opacity: 1;
}

/* --- PANEL DE COMENTARIOS FIJO --- */
#comments-panel {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, opacity 0.3s ease;
    opacity: 0;
    background: #fafafa;
    border-bottom: 1px solid transparent;
}

#comments-panel.open {
    max-height: 350px; /* Limita el alto desplegado para no tapar la pantalla */
    opacity: 1;
    border-bottom: 1px solid var(--yt-border);
    padding: 12px 16px 16px 16px;
    display: flex;
    flex-direction: column;
}

#comment-form-wrapper {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--yt-border);
    flex-shrink: 0;
}

.comment-input-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.input-container {
    position: relative;
    flex: 1;
}

.char-counter {
    position: absolute;
    right: 0;
    bottom: -18px;
    font-size: 0.7rem;
    color: var(--yt-text-secondary);
}

.char-counter.limit-near {
    color: var(--yt-red);
    font-weight: bold;
}

#comment-input {
    width: 100%;
    border: none;
    border-bottom: 1px solid var(--yt-border);
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.875rem;
    color: var(--yt-text-primary);
    resize: none;
    padding: 4px 0;
}

#comment-input:focus {
    border-bottom: 2px solid var(--yt-text-primary);
}

.btn-send-comment {
    background: var(--yt-red);
    color: #fff;
    border: none;
    padding: 6px 14px;
    border-radius: 18px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
}

/* --- LISTA DE COMENTARIOS CON SCROLL INTERNO --- */
#comments-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    max-height: 220px; /* Controla el scroll propio de los comentarios */
    overflow-y: auto;
    padding-right: 4px;
}

#comments-list::-webkit-scrollbar {
    width: 5px;
}
#comments-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
}

.comment-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.comment-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background: var(--yt-hover-bg);
    border: 1px solid var(--yt-border);
}

.comment-body {
    flex: 1;
    min-width: 0;
}

.comment-username {
    margin: 0 0 3px 0;
    font-size: 0.85rem;
    font-weight: 600;
}

.comment-text {
    margin: 0;
    font-size: 0.875rem;
    color: var(--yt-text-secondary);
    line-height: 1.4;
    word-wrap: break-word;
}

.no-comments {
    text-align: center;
    padding: 20px 8px;
    font-size: 0.9rem;
    color: var(--yt-text-secondary);
}

/* RESPONSIVE */
@media (max-width: 480px) {
    #top-player-panel {
        padding: 8px;
    }
    #comments-panel.open {
        max-height: 260px;
    }
    #comments-list {
        max-height: 160px;
    }
}
