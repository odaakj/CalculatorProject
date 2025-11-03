let currentInput: string = "";
let lastValue: number | null = null;
let lastOp: ("+" | "-" | "*" | "/") | null = null;
let justComputed: boolean = false;
let errorState = false;

const displayEl = document.querySelector(".display") as HTMLInputElement;
const scope = document.querySelector(".calculator") as HTMLElement;

scope.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const btn = target.closest("button");

  if (errorState) {
    handleClearAll();
    errorState = false;
  }

  if (!btn) return;

  const digit = btn.dataset.digit;
  const op    = btn.dataset.op;
  const act   = btn.dataset.action;
  const cmd   = btn.dataset.cmd;

  if (digit !== undefined) { handleDigit(digit); return; }
  if (cmd === ".")         { handlePoint();    return; }
  if (op)                  { handleOperator(op); return; }
  if (act === "clearEntry"){ handleClearEntry(); return; }
  if (act === "clearAll")  { handleClearAll();  return; }
  if (act === "equals")    { handleEquals();    return; }

  if (act === "loveCalc") { handleLoveCalc(); return; }
});

// ---------- Input ----------
function handleDigit(d: string): void {
  if (justComputed && !lastOp) {
    currentInput = "";
    lastValue = null;
    justComputed = false;
  }
  currentInput = currentInput === "0" ? d : currentInput + d;
  updateDisplay(renderExpression());
}

function handlePoint(): void {
  if (justComputed && !lastOp) {
    currentInput = "0.";
    justComputed = false;
    updateDisplay(renderExpression());
    return;
  }
  if (currentInput === "") currentInput = "0.";
  else if (!currentInput.includes(".")) currentInput += ".";
  updateDisplay(renderExpression());
}

// ---------- Helpers ----------
function commitInput(): number | null {
  if (currentInput === "") return null;
  const n = Number(currentInput);
  currentInput = "";
  return n;
}

function symbolToOp(symbol: string): "+" | "-" | "*" | "/" {
  if (symbol === "x") return "*";
  if (symbol === "÷") return "/";
  if (symbol === "+" || symbol === "-") return symbol;
  return symbol as "+" | "-" | "*" | "/";
}

function displaySymbol(op: string): string {
  switch (op) {
    case "*": return "x";
    case "/": return "÷";
    default:  return op;
  }
}

function renderExpression(): string {
  const left  = (lastValue !== null) ? String(lastValue) : "";
  const opSym = lastOp ? ` ${displaySymbol(lastOp)} ` : "";
  const right = currentInput !== "" ? currentInput : "";
  const expr = `${left}${opSym}${right}`.trim();
  return expr || "0";
}

// ---------- Operators & Equals ----------
function handleOperator(symbol: string): void {
  const op = symbolToOp(symbol);
  const n = commitInput();

  if (n !== null) {
    if (lastValue === null) {
      lastValue = n;
    } else if (lastOp) {
      const res = apply(lastValue, n, lastOp);
      if (errorState || !isFinite(res)) return;
      lastValue = res;
    } else {
      lastValue = n;
    }
  } else {
    if (lastValue !== null) {
      lastOp = op;
      updateDisplay(renderExpression());
      return;
    }
  }

  lastOp = op;
  justComputed = false;
  updateDisplay(renderExpression());
}

function handleEquals(): void {
  const n = commitInput();

  if (lastValue !== null && lastOp !== null && n !== null) {
    const rawResult = apply(lastValue, n, lastOp);

    if (errorState || !isFinite(rawResult)) {
      lastOp = null;
      justComputed = false;
      return;
    }

    const result = round4(rawResult);
    const expression =
      `${lastValue} ${displaySymbol(lastOp)} ${n} = ${toMax4Str(result)}`;
    updateDisplay(expression);
    lastValue = result;
  } else {
    const v = lastValue ?? n ?? 0;
    updateDisplay(lastValue ?? n ?? 0);
  }

  lastOp = null;
  justComputed = true;
}

// ---------- Calculations ----------
function apply(a: number, b: number, op: "+" | "-" | "*" | "/"): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": 
      if (b === 0) {
        updateDisplay("You cannot divide by zero!");
        errorState = true;
        return NaN;
      }
      return a / b;
  }
}

// ---------- Clear ----------
function handleClearEntry(): void {
  currentInput = "";
  updateDisplay(renderExpression());
}

function handleClearAll(): void {
  currentInput = "";
  lastValue = null;
  lastOp = null;
  justComputed = false;
  updateDisplay("0");
}

// ---------- Display ----------
function updateDisplay(val: number | string): void {
  displayEl.value = String(val);
}

// Formatting numbers after equals
function round4(num: number): number {
  if (!isFinite(num)) return num;
  return Math.round(num * 10000) / 10000;
}

function toMax4Str(num: number): string {
  if (!isFinite(num)) return String(num);
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(4)
            .replace(/(\.\d*?[1-9])0+$/,"$1")
            .replace(/\.0+$/,"");
}

// ---------- Love calculations ----------
function handleLoveCalc(): void {
  const n1 = (document.getElementById("name1") as HTMLInputElement)?.value.trim();
  const n2 = (document.getElementById("name2") as HTMLInputElement)?.value.trim();
  const out = document.getElementById("loveResult") as HTMLInputElement;

  if (!n1 || !n2) {
    out.value = "Please enter both names 💔";
    return;
  }

  const name1Lower = n1.toLowerCase();
  const name2Lower = n2.toLowerCase();

  let percent = seededPercent(n1, n2);

  if (
    (name1Lower === "oda" && name2Lower === "omny") ||
    (name1Lower === "omny" && name2Lower === "oda")
  ) {
    percent = 100;
  } else {
    percent = seededPercent(n1, n2);
  }

  out.value = `${capitalize(n1)} + ${capitalize(n2)} = ${percent}%`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function seededPercent(a: string, b: string): number {
  const s = (a + "|" + b).toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 101;
}
