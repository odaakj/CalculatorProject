"use strict";
let currentInput = "";
let lastValue = null;
let lastOp = null;
let justComputed = false;
const displayEl = document.querySelector(".display");
const scope = document.querySelector(".calculator");
scope.addEventListener("click", (e) => {
    const target = e.target;
    const btn = target.closest("button");
    if (!btn)
        return;
    const digit = btn.dataset.digit;
    const op = btn.dataset.op;
    const act = btn.dataset.action;
    const cmd = btn.dataset.cmd;
    if (digit !== undefined) {
        handleDigit(digit);
        return;
    }
    if (cmd === ".") {
        handlePoint();
        return;
    }
    if (op) {
        handleOperator(op);
        return;
    }
    if (act === "clearEntry") {
        handleClearEntry();
        return;
    }
    if (act === "clearAll") {
        handleClearAll();
        return;
    }
    if (act === "equals") {
        handleEquals();
        return;
    }
    if (act === "loveCalc") {
        handleLoveCalc();
        return;
    }
});
// ---------- Input ----------
function handleDigit(d) {
    if (justComputed && !lastOp) {
        currentInput = "";
        lastValue = null;
        justComputed = false;
    }
    currentInput = currentInput === "0" ? d : currentInput + d;
    updateDisplay(renderExpression());
}
function handlePoint() {
    if (justComputed && !lastOp) {
        currentInput = "0.";
        justComputed = false;
        updateDisplay(renderExpression());
        return;
    }
    if (currentInput === "")
        currentInput = "0.";
    else if (!currentInput.includes("."))
        currentInput += ".";
    updateDisplay(renderExpression());
}
// ---------- Helpers ----------
function commitInput() {
    if (currentInput === "")
        return null;
    const n = Number(currentInput);
    currentInput = "";
    return n;
}
function symbolToOp(symbol) {
    if (symbol === "x")
        return "*";
    if (symbol === "÷")
        return "/";
    if (symbol === "+" || symbol === "-")
        return symbol;
    return symbol;
}
function displaySymbol(op) {
    switch (op) {
        case "*": return "x";
        case "/": return "÷";
        default: return op;
    }
}
function renderExpression() {
    const left = (lastValue !== null) ? String(lastValue) : "";
    const opSym = lastOp ? ` ${displaySymbol(lastOp)} ` : "";
    const right = currentInput !== "" ? currentInput : "";
    const expr = `${left}${opSym}${right}`.trim();
    return expr || "0";
}
// ---------- Operators & Equals ----------
function handleOperator(symbol) {
    const op = symbolToOp(symbol);
    const n = commitInput();
    if (n !== null) {
        if (lastValue === null) {
            lastValue = n;
        }
        else if (lastOp) {
            lastValue = apply(lastValue, n, lastOp);
        }
        else {
            lastValue = n;
        }
    }
    else {
        // Bytt bare operator dersom vi allerede har en verdi
        if (lastValue !== null) {
            lastOp = op;
            updateDisplay(renderExpression());
            return;
        }
    }
    lastOp = op;
    justComputed = false;
    updateDisplay(renderExpression()); // viser f.eks. "5 +"
}
function handleEquals() {
    const n = commitInput();
    if (lastValue !== null && lastOp !== null && n !== null) {
        const rawResult = apply(lastValue, n, lastOp);
        const result = round4(rawResult);
        const expression = `${toMax4Str(lastValue)} ${displaySymbol(lastOp)} ${toMax4Str(n)} = ${toMax4Str(result)}`;
        updateDisplay(expression);
        // Enables chaining calculations
        lastValue = result;
    }
    else {
        const v = lastValue ?? n ?? 0;
        const r = round4(v);
        updateDisplay(lastValue ?? n ?? 0);
        lastValue = r;
    }
    lastOp = null;
    justComputed = true;
}
// ---------- Calculations ----------
function apply(a, b, op) {
    switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0 ? NaN : a / b;
    }
}
// ---------- Clear ----------
function handleClearEntry() {
    currentInput = "";
    updateDisplay(renderExpression()); // viser f.eks. bare "5 +" igjen
}
function handleClearAll() {
    currentInput = "";
    lastValue = null;
    lastOp = null;
    justComputed = false;
    updateDisplay("0");
}
// ---------- Display ----------
function updateDisplay(val) {
    displayEl.value = String(val);
}
// Formatting numbers after equals
function round4(num) {
    if (!isFinite(num))
        return num;
    return Math.round(num * 10000) / 10000;
}
function toMax4Str(num) {
    if (!isFinite(num))
        return String(num);
    if (Number.isInteger(num))
        return String(num);
    return num.toFixed(4)
        .replace(/(\.\d*?[1-9])0+$/, "$1")
        .replace(/\.0+$/, "");
}
// ---------- Love calculations ----------
function handleLoveCalc() {
    const n1 = document.getElementById("name1")?.value.trim();
    const n2 = document.getElementById("name2")?.value.trim();
    const out = document.getElementById("loveResult");
    if (!n1 || !n2) {
        out.value = "Please enter both names 💔";
        return;
    }
    const name1Lower = n1.toLowerCase();
    const name2Lower = n2.toLowerCase();
    let percent = seededPercent(n1, n2);
    if ((name1Lower === "oda" && name2Lower === "omny") ||
        (name1Lower === "omny" && name2Lower === "oda")) {
        percent = 100;
    }
    else {
        percent = seededPercent(n1, n2);
    }
    out.value = `${capitalize(n1)} + ${capitalize(n2)} = ${percent}%`;
}
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function seededPercent(a, b) {
    const s = (a + "|" + b).toLowerCase();
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h % 101;
}
