const simpleButtons = [
    ["AC", "⌫", "%", "+"],
    ["7", "8", "9", "-"],
    ["4", "5", "6", "×"],
    ["1", "2", "3", "÷"],
    ["⇋", "0", ".", "="]
];

const scientificButtons = [
    ["deg/rad", "sin", "cos", "tan", "AC", "⌫"],
    ["sin⁻¹", "cos⁻¹", "tan⁻¹", "log", "ln", "%"],
    ["7", "8", "9", "√", "x⁻¹", "+"],
    ["4", "5", "6", "ⁿ√", "x²", "-"],
    ["1", "2", "3", "!", "x³", "×"],
    ["0", ".", "π", "e", "xⁿ", "÷"],
    ["⇋", "[", "]", "(", ")", "="]
];

let mode = "deg";
let calcMode = "simple";
let history = [];

const display = document.getElementById("display");
const buttonsContainer = document.getElementById("buttonsContainer");
const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const backBtn = document.getElementById("backBtn");
const historyText = document.getElementById("historyText");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const calculatorWrapper = document.querySelector('.calculator-wrapper');
const calculatorDiv = document.querySelector('.calculator');

const HISTORY_FILE = "calc_history.txt";

const functions = {
    "sin": (x) => (mode === "deg" ? Math.sin(x * Math.PI / 180) : Math.sin(x)),
    "cos": (x) => (mode === "deg" ? Math.cos(x * Math.PI / 180) : Math.cos(x)),
    "tan": (x) => (mode === "deg" ? Math.tan(x * Math.PI / 180) : Math.tan(x)),
    "sin⁻¹": (x) => (mode === "deg" ? Math.asin(x) * 180 / Math.PI : Math.asin(x)),
    "cos⁻¹": (x) => (mode === "deg" ? Math.acos(x) * 180 / Math.PI : Math.acos(x)),
    "tan⁻¹": (x) => (mode === "deg" ? Math.atan(x) * 180 / Math.PI : Math.atan(x)),
    "log": Math.log10,
    "ln": Math.log,
    "√": Math.sqrt,
    "x²": (x) => x ** 2,
    "x³": (x) => x ** 3,
    "!": (x) => {
        if (x < 0 || !Number.isInteger(x)) throw "Factorial of negative or non-integer";
        if (x === 0) return 1;
        let res = 1;
        for (let i = 2; i <= x; i++) res *= i;
        return res;
    },
    "x⁻¹": (x) => (x !== 0 ? 1 / x : Infinity),
};

function handleClick(text) {
    let current = display.value;

    if (text === "deg/rad") {
        toggleMode();
        return;
    } else if (text === "⇋") {
        calcMode = calcMode === "scientific" ? "simple" : "scientific";
        drawButtons();
        updateCalculatorWidth(); 
        return;
    } else if (text === "=") {
        try {
            let safeExpr = current
                .replace(/=/g, '')
                .replace(/÷/g, '/')
                .replace(/×/g, '*')
                .replace(/xⁿ/g, '**')
                .replace(/\[/g, '(')
                .replace(/]/g, ')')
                .replace(/%/g, '/100');

            if (safeExpr.includes("ⁿ√")) {
                const parts = safeExpr.split("ⁿ√");
                const base = parseFloat(eval(parts[0]));
                const n = parseFloat(eval(parts[1]));
                if (isNaN(base) || isNaN(n)) {
                    throw "Invalid input for n√";
                }
                if (base === 0 && n === 0) {
                    display.value = "Error";
                    return;
                }
                const result = Math.pow(n, 1 / base);
                display.value = result.toString();
            } else {
                let result = eval(safeExpr);
                display.value = result.toString();
            }
            history.push(current + " = " + display.value);
            saveHistory();
        } catch (e) {
            display.value = "Error";
        }
    } else if (text === "AC") {
        display.value = "";
    } else if (text === "⌫") {
        display.value = current.slice(0, -1);
    } else if (functions[text]) {
        try {
            const value = eval(current);
            const result = functions[text](value);
            display.value = result.toString();
            history.push(`${text}(${current}) = ${result}`);
            saveHistory();
        } catch (e) {
            display.value = "Error";
        }
    } else if (text === "π") {
        if (!isNaN(current.slice(-1))) {
             display.value += " * " + Math.PI.toString();
        } else {
            display.value += Math.PI.toString();
        }
    } else if (text === "e") {
        if (!isNaN(current.slice(-1))) {
            display.value += " * " + Math.E.toString();
        } else {
            display.value += Math.E.toString();
        }
    } else {
        display.value += text;
    }
}

function toggleMode() {
    mode = mode === "rad" ? "deg" : "rad";
    const modeLabel = document.getElementById("modeLabel");
    if (modeLabel) {
        modeLabel.textContent = `Mode: ${mode}`;
    }
}

function drawButtons() {
    buttonsContainer.innerHTML = "";
    const buttonsToDraw = calcMode === "scientific" ? scientificButtons : simpleButtons;

    const numColumns = buttonsToDraw[0].length;
    buttonsContainer.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;

    buttonsToDraw.forEach(row => {
        row.forEach(btnText => {
            if (btnText === "deg/rad") {
                const frame = document.createElement("div");
                frame.className = "calculator-button deg-rad-container";

                const modeLabel = document.createElement("div");
                modeLabel.id = "modeLabel";
                modeLabel.className = "mode-label";
                modeLabel.textContent = `Mode: ${mode}`;
                frame.appendChild(modeLabel);

                const degRadButton = document.createElement("button");
                degRadButton.className = "deg-rad-button";
                degRadButton.textContent = btnText;

                // ✅ FIX: toggle and update label on click
                degRadButton.onclick = () => {
                    toggleMode();
                    modeLabel.textContent = `Mode: ${mode}`;
                };

                degRadButton.onmousedown = (e) => onButtonPress(e.target);
                degRadButton.onmouseup = (e) => onButtonRelease(e.target);
                degRadButton.onmouseleave = (e) => onButtonRelease(e.target);
                frame.appendChild(degRadButton);

                buttonsContainer.appendChild(frame);
            } else {
                const button = document.createElement("button");
                button.className = "calculator-button";
                button.textContent = btnText;
                button.onclick = () => handleClick(btnText);
                button.onmousedown = (e) => onButtonPress(e.target);
                button.onmouseup = (e) => onButtonRelease(e.target);
                button.onmouseleave = (e) => onButtonRelease(e.target);

                if (btnText === "⇋") {
                    button.classList.add("button-toggle-mode");
                } else if (["+", "-", "×", "÷", "%", "!", "x⁻¹", "x³", "x²", "√", "xⁿ", "e", "π", "ⁿ√"].includes(btnText)) {
                    button.classList.add("button-operator-math");
                } else if (["sin", "cos", "tan", "sin⁻¹", "cos⁻¹", "tan⁻¹", "log", "ln"].includes(btnText)) {
                    button.classList.add("button-function-math");
                } else if (["AC", "⌫"].includes(btnText)) {
                    button.classList.add("button-ac");
                    if (btnText === "⌫") button.classList.add("button-backspace");
                } else if (["(", ")", "[", "]"].includes(btnText)) {
                    button.classList.add("button-bracket");
                } else if (btnText === "=") {
                    button.classList.add("button-equal");
                } else if ([".", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(btnText)) {
                    button.classList.add("button-number");
                }

                buttonsContainer.appendChild(button);
            }
        });
    });
}

function onButtonPress(buttonElement) {
    buttonElement.classList.add("pressed");
}

function onButtonRelease(buttonElement) {
    buttonElement.classList.remove("pressed");
}

function showHistoryFrame() {
    calculatorDiv.classList.add('hidden');
    historyPanel.classList.remove('hidden');
    updateHistoryDisplay();
}

function hideHistoryFrame() {
    historyPanel.classList.add('hidden');
    calculatorDiv.classList.remove('hidden');
}

function updateHistoryDisplay() {
    historyText.value = history.slice(-100).reverse().join("\n");
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
    saveHistory();
}

function updateCalculatorWidth() {
    if (calcMode === "scientific") {
        calculatorDiv.classList.add('scientific-mode');
    } else {
        calculatorDiv.classList.remove('scientific-mode');
    }
}

function loadHistory() {
    const storedHistory = localStorage.getItem(HISTORY_FILE);
    if (storedHistory) {
        history = JSON.parse(storedHistory);
    }
}

function saveHistory() {
    localStorage.setItem(HISTORY_FILE, JSON.stringify(history));
}

historyBtn.addEventListener("click", showHistoryFrame);
backBtn.addEventListener("click", hideHistoryFrame);
clearHistoryBtn.addEventListener("click", clearHistory);

loadHistory();
drawButtons();
updateCalculatorWidth();
