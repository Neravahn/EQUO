const equationList = document.getElementById('equationList');
let equationCount = 1
document.getElementById('addEquation').addEventListener('click', () => {
    equationCount++;


    const block = document.createElement('div');
    block.className = 'equationBlock';


    block.innerHTML = `
        <label>EQUATION ${equationCount}</label>
        <div class="eqRow">

                        <div class="eqControls">
                            <textarea class="equation_area"></textarea>

                            <div>
                                <span>freq (f): <span class="fval">100</span></span>
                                <input type="range" class="controls fSlider" min="50" max="1000" value="100">
                            </div>

                            <div>
                                <span>amp (a): <span class="aval">50</span></span>
                                <input type="range" class="controls aSlider" min="0" max="200" value="50">
                            </div>
                        </div>

                        <canvas class="oscCanvas"></canvas>
                    </div>
    `;

    equationList.appendChild(block);
})



document.addEventListener("input", (e) => {
    const block = e.target.closest(".equationBlock");
    if (!block) return;

    // FREQUENCY SLIDER
    if (e.target.classList.contains("fSlider")) {
        block.querySelector(".fval").textContent = e.target.value;
    }

    // AMPLITUDE SLIDER
    if (e.target.classList.contains("aSlider")) {
        block.querySelector(".aval").textContent = e.target.value;
    }
});
