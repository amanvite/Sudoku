let solution = [];
let puzzle = [];
let selectedCell = null;
const table = document.getElementById("grid");
const msg = document.getElementById("message");
const moonIcon = document.getElementById("moon-icon");
const sunIcon = document.getElementById("sun-icon");

// Swaps the Moon/Sun SVG icon based on the current theme
function updateThemeIcon() {
    if (document.body.classList.contains("dark-mode")) {
        moonIcon.style.display = "none";
        sunIcon.style.display = "block";
    } else {
        moonIcon.style.display = "block";
        sunIcon.style.display = "none";
    }
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("sudokuTheme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeIcon(); // Triggers the icon change immediately
}

function toggleDropdown(event) {
    event.stopPropagation(); 
    const optionsMenu = document.getElementById('dropdown-options');
    const selectedBox = document.querySelector('.dropdown-selected');
    
    optionsMenu.classList.toggle('show');
    selectedBox.classList.toggle('open');
}

function selectDifficulty(value, text) {
    document.getElementById('difficulty').value = value;
    document.getElementById('dropdown-text').innerText = text;
    
    const options = document.querySelectorAll('.dropdown-option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.innerText === text) opt.classList.add('selected');
    });
    
    closeDropdown();
    newGame();
}

function closeDropdown() {
    const optionsMenu = document.getElementById('dropdown-options');
    const selectedBox = document.querySelector('.dropdown-selected');
    if (optionsMenu && optionsMenu.classList.contains('show')) {
        optionsMenu.classList.remove('show');
        selectedBox.classList.remove('open');
    }
}

document.addEventListener('click', closeDropdown);

function saveState() {
    let currentState = [];
    for (let i = 0; i < 9; i++) {
        let row = [];
        for (let j = 0; j < 9; j++) {
            const input = document.getElementById(`cell-${i}-${j}`);
            if (input) {
                row.push({
                    value: input.value,
                    color: input.style.color
                });
            } else {
                row.push(null);
            }
        }
        currentState.push(row);
    }
    
    const gameData = {
        solution: solution,
        puzzle: puzzle,
        difficulty: document.getElementById("difficulty").value,
        currentState: currentState,
        msgText: msg.innerText,
        msgColor: msg.style.color
    };
    localStorage.setItem('sudokuGame', JSON.stringify(gameData));
}

function generateSudoku() {
    solution = Array.from({length: 9}, () => Array(9).fill(0));
    fillDiagonal();
    fillRemaining(0, 3);
    
    puzzle = solution.map(row => [...row]);
    let removeCount = parseInt(document.getElementById("difficulty").value); 
    while (removeCount > 0) {
        let i = Math.floor(Math.random() * 9);
        let j = Math.floor(Math.random() * 9);
        if (puzzle[i][j] !== 0) {
            puzzle[i][j] = 0;
            removeCount--;
        }
    }
}

function fillDiagonal() {
    for (let i = 0; i < 9; i += 3) {
        fillBox(i, i);
    }
}

function fillBox(rowStart, colStart) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!unUsedInBox(rowStart, colStart, num));
            solution[rowStart + i][colStart + j] = num;
        }
    }
}

function unUsedInBox(rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (solution[rowStart + i][colStart + j] === num) return false;
        }
    }
    return true;
}

function unUsedInRow(i, num) {
    for (let j = 0; j < 9; j++) {
        if (solution[i][j] === num) return false;
    }
    return true;
}

function unUsedInCol(j, num) {
    for (let i = 0; i < 9; i++) {
        if (solution[i][j] === num) return false;
    }
    return true;
}

function CheckIfSafe(i, j, num) {
    return unUsedInRow(i, num) && unUsedInCol(j, num) && unUsedInBox(i - i % 3, j - j % 3, num);
}

function fillRemaining(i, j) {
    if (j >= 9 && i < 8) { i = i + 1; j = 0; }
    if (i >= 9 && j >= 9) return true;
    if (i < 3) {
        if (j < 3) j = 3;
    } else if (i < 6) {
        if (j === Math.floor(i / 3) * 3) j = j + 3;
    } else {
        if (j === 6) {
            i = i + 1; j = 0;
            if (i >= 9) return true;
        }
    }
    for (let num = 1; num <= 9; num++) {
        if (CheckIfSafe(i, j, num)) {
            solution[i][j] = num;
            if (fillRemaining(i, j + 1)) return true;
            solution[i][j] = 0;
        }
    }
    return false;
}

function renderGrid() {
    table.innerHTML = "";
    selectedCell = null;
    for (let i = 0; i < 9; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < 9; j++) {
            const td = document.createElement("td");
            const val = puzzle[i][j];
            
            const input = document.createElement("input");
            input.type = "text";
            input.inputMode = "none";
            input.id = `cell-${i}-${j}`;
            
            if (val !== 0) {
                input.value = val;
                input.readOnly = true;
            }

            input.addEventListener('focus', () => {
                selectedCell = input;
            });

            input.addEventListener('input', () => {
                msg.innerText = "";
                input.style.color = "";
                input.value = input.value.replace(/[^1-9]/g, '');
                if (input.value.length > 1) input.value = input.value.slice(-1);
                autoCheckWin();
                saveState();
            });

            input.addEventListener('keydown', (e) => {
                let r = i, c = j;
                if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
                else if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
                else if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
                else if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
                else if (e.key === 'Backspace') {
                    input.value = "";
                    input.style.color = "";
                    msg.innerText = "";
                    saveState();
                }
                
                if (r !== i || c !== j) {
                    document.getElementById(`cell-${r}-${c}`).focus();
                    e.preventDefault();
                }
            });

            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function numPress(val) {
    if (selectedCell && !selectedCell.readOnly) {
        selectedCell.value = val;
        selectedCell.style.color = "";
        msg.innerText = "";
        selectedCell.focus();
        autoCheckWin();
        saveState();
    }
}

function autoCheckWin() {
    let allCorrect = true;
    let isFull = true;

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = document.getElementById(`cell-${i}-${j}`);
            if (!input.readOnly) {
                if (input.value === "") {
                    isFull = false;
                } else if (input.value != solution[i][j]) {
                    allCorrect = false;
                }
            }
        }
    }

    if (isFull) {
        if (allCorrect) {
            msg.innerText = "Congratulations! You solved it!";
            msg.style.color = "#10b981";
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const input = document.getElementById(`cell-${i}-${j}`);
                    if (!input.readOnly) {
                        input.style.color = "#10b981";
                    }
                }
            }
        } else {
            msg.innerText = "The grid is full, but there are mistakes.";
            msg.style.color = "#ef4444";
        }
    }
}

function newGame() {
    msg.innerText = "";
    generateSudoku();
    renderGrid();
    saveState();
}

function resetGrid() {
    msg.innerText = "";
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const input = document.getElementById(`cell-${i}-${j}`);
            if (!input.readOnly) {
                input.value = "";
                input.style.color = "";
            }
        }
    }
    saveState();
}

function init() {
    // Check saved theme first
    if (localStorage.getItem("sudokuTheme") === "dark") {
        document.body.classList.add("dark-mode");
    }
    updateThemeIcon(); // Ensure the icon matches on page load

    const savedData = localStorage.getItem('sudokuGame');
    if (savedData) {
        const data = JSON.parse(savedData);
        solution = data.solution;
        puzzle = data.puzzle;
        
        const diffInput = document.getElementById("difficulty");
        if (data.difficulty) {
            diffInput.value = data.difficulty;
            let diffText = "Medium";
            if (data.difficulty == 30) diffText = "Easy";
            if (data.difficulty == 55) diffText = "Hard";
            document.getElementById("dropdown-text").innerText = diffText;
            
            document.querySelectorAll('.dropdown-option').forEach(opt => {
                opt.classList.remove('selected');
                if (opt.innerText === diffText) opt.classList.add('selected');
            });
        }
        
        renderGrid();
        
        if (data.currentState) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const input = document.getElementById(`cell-${i}-${j}`);
                    if (input && data.currentState[i][j]) {
                        if (!input.readOnly) {
                            input.value = data.currentState[i][j].value;
                            input.style.color = data.currentState[i][j].color;
                        }
                    }
                }
            }
        }
        
        if (data.msgText) {
            msg.innerText = data.msgText;
            msg.style.color = data.msgColor;
        }
    } else {
        newGame();
    }
}

// Start the game loop
init();