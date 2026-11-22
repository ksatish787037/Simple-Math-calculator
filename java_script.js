// [label, key, css class]
const KEYS = [
    ["AC","AC","fn"], ["±","±","fn"], ["%","%","fn"], ["÷","/","op"],
    ["7","7"], ["8","8"], ["9","9"], ["×","*","op"],
    ["4","4"], ["5","5"], ["6","6"], ["−","-","op"],
    ["1","1"], ["2","2"], ["3","3"], ["+","+","op"],
    ["0","0","zero"], [".","."], ["=","=","eq"]
];
const MATH = { "+": (a, b) => a + b, "-": (a, b) => a - b, "*": (a, b) => a * b, "/": (a, b) => a / b };
const label = Object.fromEntries(KEYS.map(([l, k]) => [k, l]));

const keysEl = document.getElementById("keys");
const resultEl = document.getElementById("result");
const exprEl = document.getElementById("expression");

let cur = "0", prev = null, op = null, fresh = false;

keysEl.innerHTML = KEYS.map(([l, k, c = ""]) => `<button class="${c}" data-key="${k}">${l}</button>`).join("");

const clean = n => isFinite(n) ? String(+n.toPrecision(12)) : "Error";
const fmt = s => s.replace(/^-?\d+/, n => n.replace(/\B(?=(\d{3})+$)/g, ","));

function render() {
    const t = fmt(cur);
    resultEl.textContent = t;
    resultEl.style.fontSize = t.length > 11 ? "28px" : t.length > 8 ? "36px" : "";
    exprEl.textContent = op ? `${fmt(prev)} ${label[op]}` : "";
    keysEl.querySelectorAll(".op").forEach(b => b.classList.toggle("active", fresh && b.dataset.key === op));
}

function press(k) {
    if (cur === "Error" && k !== "AC") return;

    if (/^[\d.]$/.test(k)) {
        if (fresh) { cur = "0"; fresh = false; }
        if (k === "." ? !cur.includes(".") : cur.replace(/\D/g, "").length < 12)
            cur = cur === "0" && k !== "." ? k : cur + k;
    } else if (k === "AC") {
        cur = "0"; prev = op = null; fresh = false;
    } else if (k === "DEL") {
        if (!fresh) cur = cur.slice(0, -1);
        if (/^-?$/.test(cur)) cur = "0";
    } else if (k === "±") {
        if (cur !== "0") cur = cur[0] === "-" ? cur.slice(1) : "-" + cur;
    } else if (k === "%") {
        cur = clean(cur / 100);
    } else if (k === "=") {
        if (op) { cur = clean(MATH[op](+prev, +cur)); prev = op = null; fresh = true; }
    } else { // + - * /
        if (op && !fresh) cur = clean(MATH[op](+prev, +cur));
        prev = cur; op = k; fresh = true;
    }
    render();
}

keysEl.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) press(b.dataset.key);
});

document.addEventListener("keydown", e => {
    const k = { Enter: "=", Backspace: "DEL", Escape: "AC", x: "*", X: "*" }[e.key] || e.key;
    const b = [...keysEl.children].find(el => el.dataset.key === k);
    if (!b && k !== "DEL") return;
    e.preventDefault();
    press(k);
    if (b) { b.classList.add("press"); setTimeout(() => b.classList.remove("press"), 90); }
});

render();