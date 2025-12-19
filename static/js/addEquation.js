const equationList = document.getElementById('equationList');
let equationCount = 1
document.getElementById('addEquation').addEventListener('click', () => {
    equationCount++;

    const block = document.createElement('div');
    block.className = 'equationBlock';


    block.innerHTML = `
        <label>EQUATION ${equationCount}</label>
        <textarea class="equation_area"></textarea>
    `;

    equationList.appendChild(block);
})