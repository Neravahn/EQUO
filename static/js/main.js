
const canvas = document.getElementById('.oscCanvas');
const ctx = canvas.getContext('2d');
let compiledEquations = [];


//RESIZE CANVAS
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
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
    return new Function("x", "f", "a", `return ${safeExpr}`);
}

function drawGraph(f, color = '#000') {
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

        const MAX_Y = canvas.height / 2 / SCALE;
        y = Math.max(-MAX_Y, Math.min(MAX_Y, y));


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
    if (
        !e.target.classList.contains("equation_area") &&
        !e.target.classList.contains("fSlider") &&
        !e.target.classList.contains("aSlider")
    ) return;


    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {

        const blocks = document.querySelectorAll(".equationBlock")
        compiledEquations = [];

        blocks.forEach(block => {
            const textarea = block.querySelector(".equation_area");
            const expr = textarea.value.trim();
            const fSlider = block.querySelector(".fSlider");
            const aSlider = block.querySelector(".aSlider")
            if (!expr) return;

            const fval = Number(fSlider.value);
            const aval = Number(aSlider.value);


            const fn = compileEquation(expr)

            const color = textarea.dataset.color || getRandomColor();
            textarea.dataset.color = color;

            compiledEquations.push({
                fn,
                fval,
                aval,
                color,
                textarea
            });
        });

        // CLEAR CANVAS AND REDRAW
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawAxis();


        compiledEquations.forEach(obj => {
            drawGraph(
                (x) => obj.fn(x, obj.fval, obj.aval),
                obj.color
            );
            obj.textarea.style.border = "2px solid green";
        });
    }, 100);
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
function playEquationSound(obj) {
    initAudio();

    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = "sine";
    gain.gain.value = 0.03;

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start();

    voices.push({ oscillator, gain });



    let x = -5;
    const endX = 5;
    const step = 0.02;

    let t = audioCtx.currentTime;

    for (; x <= endX; x += step) {
        let y;
        y = obj.fn(x, obj.fval, obj.aval);
        if (!isFinite(y)) continue;
        y = Math.max(-5, Math.min(5, y));

        const freq = obj.fval + y * 50;
        oscillator.frequency.setValueAtTime(freq, t);
        t += 0.01;
    }

    oscillator.stop(t);
}

document.getElementById("playSound").addEventListener("click", () => {
    stopAllVoices();
    initAudio();

    compiledEquations.forEach(obj => {
        playEquationSound(obj);
    });
});
