const eqInput = document.getElementById('equation_area');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
    ctx.linesWidth = 1;


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

function drawGraph(f) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxis();

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    let firstPoint = true;

    for (
        let x = -canvas.width / 2 / SCALE;
        x <= canvas.width / 2 / SCALE;
        x += STEP
    ) {
        let y = f(x);
        if (!isFinite(y)) continue;

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


let debounceTimer;

eqInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        try {
            const expr = eqInput.value.trim();
            if (!expr) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawAxis();
                return;
            }

            const f = compileEquation(expr);
            drawGraph(f);

            eqInput.style.border = "2px solid green";
        } catch (err) {
            eqInput.style.border = "2px solid red";
        }
    }, 120);
});

drawAxis();


let audioCtx = null;
let oscillator = null;
let gainNode = null;


function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}



function playEquationSound(f) {
    initAudio();

    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    gainNode.gain.value = 0.05;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    const BASE_FREQ = 440;
    const FREQ_SCALE = 80;

    let x = -5;
    const endX = 5;
    const step = 0.02;
    let t = audioCtx.currentTime;

    for (; x <= endX; x += step) {
        let y;
        try {
            y = f(x);
            if (!isFinite(y)) continue;
        } catch {
            continue;
        }

        y = Math.max(-5, Math.min(5, y));

        const freq = BASE_FREQ + y * FREQ_SCALE;

        oscillator.frequency.setValueAtTime(freq, t);
        t += 0.01;
    }

    oscillator.stop(t);
}


document.getElementById("playSound").addEventListener("click", () => {
    try {
        const expr = eqInput.value.trim();
        if (!expr) return;

        const f = compileEquation(expr);
        playEquationSound(f);
    } catch (err) {
        console.error(err);
    }
});

