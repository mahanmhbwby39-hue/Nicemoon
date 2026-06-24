// ================= NICE MOON PLAYER - STAGE 2 (FULL) =================

const modal = document.getElementById("playerModal");
const closeBtn = document.getElementById("closePlayer");

const playBtn = document.getElementById("play");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

const pTitle = document.getElementById("pTitle");
const pCover = document.getElementById("pCover");
const pBar = document.getElementById("pBar");

const buttons = document.querySelectorAll(".play-btn");

let audio = new Audio();
let currentIndex = 0;
let playlist = Array.from(buttons);

// Audio Context (for visualizer)
let audioCtx = null;
let analyser = null;
let dataArray = null;
let source = null;

/* ================= OPEN PLAYER ================= */

buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        currentIndex = index;
        openPlayer(btn);
    });
});

/* ================= OPEN PLAYER ================= */

function openPlayer(btn){
    modal.classList.add("active");
    loadSong(btn);
    startVisualizer();
}

/* ================= LOAD SONG ================= */

function loadSong(btn){
    audio.src = btn.dataset.src;
    pTitle.textContent = btn.dataset.title;
    pCover.src = btn.dataset.cover;

    audio.play();
    playBtn.textContent = "❚❚";
}

/* ================= PLAY / PAUSE ================= */

playBtn.onclick = () => {
    if(audio.paused){
        audio.play();
        playBtn.textContent = "❚❚";
    }else{
        audio.pause();
        playBtn.textContent = "▶";
    }
};

/* ================= NEXT ================= */

nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(playlist[currentIndex]);
};

/* ================= PREV ================= */

prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(playlist[currentIndex]);
};

/* ================= PROGRESS BAR ================= */

audio.ontimeupdate = () => {
    if(!audio.duration) return;
    let percent = (audio.currentTime / audio.duration) * 100;
    pBar.style.width = percent + "%";
};

/* ================= CLOSE ================= */

closeBtn.onclick = () => {
    modal.classList.remove("active");
    audio.pause();
};

/* ================= VISUALIZER (NEON CIRCLE) ================= */

function startVisualizer(){

    const canvas = document.getElementById("visualizer");
    const ctx = canvas.getContext("2d");

    canvas.width = modal.clientWidth;
    canvas.height = modal.clientHeight;

    // create audio context only once (important fix)
    if(!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        source = audioCtx.createMediaElementSource(audio);
        analyser = audioCtx.createAnalyser();

        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        analyser.fftSize = 128;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    function draw(){
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        for(let i = 0; i < dataArray.length; i++){

            let angle = i * 0.15;
            let radius = dataArray[i] * 0.6;

            let x = cx + Math.cos(angle) * (110 + radius);
            let y = cy + Math.sin(angle) * (110 + radius);

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);

            ctx.fillStyle = "rgba(255,77,109,0.9)";
            ctx.fill();
        }
    }

    draw();
}
