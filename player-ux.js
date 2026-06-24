// ================= NICE MOON - STAGE 3 (CONNECTED FULL VERSION) =================

// DOM
const modal = document.getElementById("playerModal");
const glow = document.getElementById("glow");
const bgBlur = document.getElementById("bgBlur");
const cover = document.getElementById("pCover");
const title = document.getElementById("pTitle");

// Buttons from PLAYER UI (Stage 2)
const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

// Playlist buttons (cards)
const buttons = document.querySelectorAll(".play-btn");

// REAL AUDIO (IMPORTANT)
let audio = new Audio();

// Audio Context (Visualizer)
let audioCtx = null;
let analyser = null;
let dataArray = null;
let source = null;

let currentIndex = 0;
let lastBeat = 0;

/* ================= INIT AUDIO SYSTEM ================= */

function initAudio(){
    if(audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyser.fftSize = 128;
    dataArray = new Uint8Array(analyser.frequencyBinCount);
}

/* ================= LOAD SONG ================= */

function loadSong(btn){
    audio.src = btn.dataset.src;

    title.textContent = btn.dataset.title;
    cover.src = btn.dataset.cover;

    audio.play();
    playBtn.textContent = "❚❚";

    initAudio();
}

/* ================= OPEN PLAYER ================= */

function openPlayer(btn){
    modal.classList.add("active");
    loadSong(btn);
    startUX();
}

/* ================= PLAYLIST CLICK ================= */

buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        currentIndex = index;
        openPlayer(btn);
    });
});

/* ================= PLAY / PAUSE ================= */

playBtn.onclick = () => {
    if(audio.paused){
        audio.play();
        playBtn.textContent = "❚❚";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
};

/* ================= NEXT ================= */

nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % buttons.length;
    loadSong(buttons[currentIndex]);
};

/* ================= PREV ================= */

prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + buttons.length) % buttons.length;
    loadSong(buttons[currentIndex]);
};

/* ================= CLOSE ================= */

document.getElementById("closePlayer").onclick = () => {
    modal.classList.remove("active");
    audio.pause();
};

/* ================= PROGRESS (if exists) ================= */

audio.ontimeupdate = () => {
    const bar = document.getElementById("pBar");
    if(!audio.duration || !bar) return;

    let percent = (audio.currentTime / audio.duration) * 100;
    bar.style.width = percent + "%";
};

/* ================= BACKGROUND UPDATE ================= */

function setBackground(img){
    if(bgBlur){
        bgBlur.style.background = `url(${img}) center/cover no-repeat`;
    }
}

/* ================= GLOW EFFECT ================= */

function updateGlow(val){
    if(!glow) return;

    let intensity = val * 0.5;

    glow.style.boxShadow = `
        0 0 ${intensity}px rgba(255,77,109,0.7),
        0 0 ${intensity * 2}px rgba(255,77,109,0.4)
    `;
}

/* ================= COVER ANIMATION ================= */

function animateCover(val){
    if(!cover) return;

    let scale = 1 + val / 300;
    let rotate = val / 80;

    cover.style.transform = `scale(${scale}) rotate(${rotate}deg)`;
}

/* ================= BEAT PULSE ================= */

function beatPulse(val){
    if(val > 120 && Date.now() - lastBeat > 120){
        modal.style.transform = "scale(1.02)";

        setTimeout(() => {
            modal.style.transform = "scale(1)";
        }, 120);

        lastBeat = Date.now();
    }
}

/* ================= VISUALIZER LOOP ================= */

function startUX(){
    if(!audioCtx) initAudio();

    function loop(){
        requestAnimationFrame(loop);

        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for(let i = 0; i < dataArray.length; i++){
            sum += dataArray[i];
        }

        let avg = sum / dataArray.length;

        updateGlow(avg);
        animateCover(avg);
        beatPulse(avg);
    }

    loop();
}
