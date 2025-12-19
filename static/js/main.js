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