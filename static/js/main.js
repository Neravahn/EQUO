
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let compiledEquations = [];


//RESIZE CANVAS
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();



const SCALE = 40;
const STEP = 0.02;


function drawAxis() {
    ctx.strokeStyle = "#000000ff";
    ctx.lineWidth = 1;


    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}


function compileEquation(expr) {
    //FOR NOW ALLOWING X AND MATH FUNTION
    const safeExpr = expr
        .replace(/\^/g, "**")
        .replace(/sin/g, "Math.sin")
        .replace(/cos/g, "Math.cos")
        .replace(/tan/g, "Math.tan")
        .replace(/sqrt/g, "Math.sqrt")
        .replace(/log/g, "Math.log")
        .replace(/exp/g, "Math.exp");
    return new Function("x", `return ${safeExpr}`);
}

function drawGraph(f, color='#000') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    let firstPoint = true;

    for (let x = -canvas.width / 2 / SCALE;
        x <= canvas.width / 2 / SCALE;
        x += STEP) {
        let y;

        try {
            y = f(x);
            if (!isFinite(y)) continue;
        } catch (err) {
            console.log(err);
        }
        

        const px = canvas.width / 2 + x * SCALE;
        const py = canvas.height / 2 - y * SCALE;

        if (firstPoint) {
            ctx.moveTo(px, py);
            firstPoint = false;
        } else {
            ctx.lineTo(px, py);
        }
    }

    ctx.stroke();
}


// RANDOM COLOR FOR EACH LINE
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


let debounceTimer;
document.addEventListener("input", (e) => {
    if (!e.target.classList.contains("equation_area")) return;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        const allEq = document.querySelectorAll(".equation_area");
        compiledEquations = [];

        allEq.forEach((eq) => {
            const expr = eq.value.trim();
            if (!expr) return;

            const f = compileEquation(expr);
            const color = eq.dataset.color || getRandomColor();
            eq.dataset.color = color;

            compiledEquations.push({ f, eq, color});
        });

        // CLEAR CANVAS AND REDRAW
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAxis();
        

        compiledEquations.forEach(obj => {
            drawGraph(obj.f, obj.color);
            obj.eq.style.border = "2px solid green";
        });
    }, 1000);
});


drawAxis();


let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}


// STOP AND CLEAN ALL PREVIOUS OSCILLATORS
let voices = [];
function stopAllVoices() {
    voices.forEach(v => {
        v.oscillator.stop();
        v.oscillator.disconnect();
        v.gain.disconnect();
    });
    voices = [];
}


// ONE OSCILLATORS FOR ONE EQUATION
function playEquationSound(f) {
    initAudio();

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = "sine";
    gain.gain.value = 0.03;

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();

    voices.push({ oscillator, gain });

    const BASE_FREQ = 100;
    const FREQ_SCALE = 100;

    let x = -5;
    const endX = 5;
    const step = 0.02;

    let t = audioCtx.currentTime;

    for (; x <= endX; x += step) {
        let y;
        y = f(x);
        if (!isFinite(y)) continue;
        y = Math.max(-5, Math.min(5, y));

        const freq = BASE_FREQ + y * FREQ_SCALE;
        oscillator.frequency.setValueAtTime(freq, t);
        t += 0.01;
    }

    oscillator.stop(t);
}

document.getElementById("playSound").addEventListener("click", () => {
    stopAllVoices();
    initAudio();


    const equations = document.querySelectorAll(".equation_area");

    equations.forEach(eq => {
        const expr = eq.value.trim();
        if (!expr) return;

        const f = compileEquation(expr);
        playEquationSound(f);
    });
});
