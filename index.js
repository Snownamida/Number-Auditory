const synth = window.speechSynthesis;

const inputTxt = document.querySelector("#input");
const answerForm = document.querySelector("#answer-form");
const languageSelect = document.querySelector("#language");
const voiceSelect = document.querySelector("#voice");
const answer = document.querySelector("#answer");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");
const preset = document.querySelector("#preset");
const rangeMin = document.querySelector("#range-min");
const rangeMax = document.querySelector("#range-max");

const read_only_no_input = document.querySelector("#read_only_no_input");
const read_prefix = document.querySelector("#read_prefix");
const decimal = document.querySelector("#decimal");
const useComma = document.querySelector("#use-comma");

const playBtn = document.querySelector("#play");
const nextBtn = document.querySelector("#next");

// ---------- 语言 ----------
// 语言列表由浏览器实际安装的语音动态生成（原版行为）。
// LANGS 仅提供少数语言的“报数前缀”，以及无任何语音时的兜底列表。
const LANGS = {
  es: { code: "es-ES", label: "西班牙语 Español", prefix: "El número es " },
  fr: { code: "fr-FR", label: "法语 Français", prefix: "Le nombre est " },
  en: { code: "en-US", label: "英语 English", prefix: "The number is " },
  de: { code: "de-DE", label: "德语 Deutsch", prefix: "Die Zahl ist " },
  ja: { code: "ja-JP", label: "日语 日本語", prefix: "数字は " },
};

// 语言代码 → 中文显示名（如 "pt" → "葡萄牙语 pt"）
const langDisplay = (() => {
  try {
    const dn = new Intl.DisplayNames(["zh-CN"], { type: "language" });
    return (code) => {
      const name = dn.of(code);
      return name && name !== code ? `${name} (${code})` : code;
    };
  } catch {
    return (code) => LANGS[code]?.label ?? code;
  }
})();

let voices = [];

function populateLanguageList() {
  const previous =
    languageSelect.value || localStorage.getItem("na-lang") || "es";
  // 浏览器所有语音的主语言子标签，去重
  const codes = [
    ...new Set(
      voices.map((v) => v.lang.replace("_", "-").split("-")[0].toLowerCase())
    ),
  ];
  const available = codes.length ? codes : Object.keys(LANGS); // 兜底
  available.sort((a, b) => langDisplay(a).localeCompare(langDisplay(b), "zh"));

  languageSelect.innerHTML = "";
  for (const code of available) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = langDisplay(code);
    languageSelect.appendChild(option);
  }
  languageSelect.value = available.includes(previous) ? previous : available[0];
}

// ---------- 语音列表 ----------
function populateVoiceList() {
  const langKey = languageSelect.value;
  voiceSelect.innerHTML = "";

  const matching = voices.filter((v) =>
    v.lang.replace("_", "-").toLowerCase().startsWith(langKey)
  );

  if (matching.length === 0) {
    const option = document.createElement("option");
    option.textContent = "系统默认语音";
    option.value = "";
    voiceSelect.appendChild(option);
    return;
  }

  for (const voice of matching) {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;
    option.value = voice.name;
    voiceSelect.appendChild(option);
  }
}

function refreshVoicesAndLanguages() {
  voices = synth.getVoices();
  populateLanguageList();
  populateVoiceList();
}

refreshVoicesAndLanguages();
if (speechSynthesis.onvoiceschanged !== undefined) {
  // Chrome 首次加载后才异步返回完整语音列表
  speechSynthesis.onvoiceschanged = refreshVoicesAndLanguages;
}

languageSelect.onchange = () => {
  localStorage.setItem("na-lang", languageSelect.value);
  populateVoiceList();
};

// ---------- 随机数字 ----------
let theNumber = "";

function randomlyChangeNumber() {
  const min = Number(rangeMin.value);
  const max = Number(rangeMax.value);
  const factor = decimal.checked ? 100 : 1;
  theNumber = (
    min + Math.floor(Math.random() * (max - min + 1) * factor) / factor
  ).toString();
}

randomlyChangeNumber();

// ---------- 范围预设 ----------
preset.onchange = () => {
  const value = preset.value;
  if (value === "custom") return;
  if (value === "price") {
    rangeMin.value = 0;
    rangeMax.value = 500;
    decimal.checked = true;
  } else {
    const [min, max] = value.split(",");
    rangeMin.value = min;
    rangeMax.value = max;
    decimal.checked = false;
  }
  randomlyChangeNumber();
};

// ---------- 西班牙语数字转文字（用于显示答案） ----------
function numberToSpanish(num) {
  num = Number(num);

  const units = [
    "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
    "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
    "dieciséis", "diecisiete", "dieciocho", "diecinueve",
  ];

  const tens = [
    "", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta",
    "ochenta", "noventa",
  ];

  const specialTens = [
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
    "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve",
  ];

  const hundreds = [
    "", "cien", "doscientos", "trescientos", "cuatrocientos", "quinientos",
    "seiscientos", "setecientos", "ochocientos", "novecientos",
  ];

  if (num === 0) return "cero";
  if (num < 0) return "menos " + numberToSpanish(-num);

  let words = [];

  // 词尾 "uno" 在 mil/millones 前缩写：veintiuno → veintiún，treinta y uno → treinta y un
  const apocope = (s) =>
    s.replace(/veintiuno$/, "veintiún").replace(/uno$/, "un");

  const [integerPart, decimalPart] = num.toString().split(".");
  let intNum = Number(integerPart);

  // 百万
  if (intNum >= 1000000) {
    const millionPart = Math.floor(intNum / 1000000);
    words.push(
      millionPart === 1
        ? "un millón"
        : apocope(numberToSpanish(millionPart)) + " millones"
    );
    intNum %= 1000000;
  }

  // 千
  if (intNum >= 1000) {
    const thousandPart = Math.floor(intNum / 1000);
    words.push(
      thousandPart === 1
        ? "mil"
        : apocope(numberToSpanish(thousandPart)) + " mil"
    );
    intNum %= 1000;
  }

  // 百：101–199 用 "ciento"，正好 100 用 "cien"
  if (intNum >= 100) {
    const hundredPart = Math.floor(intNum / 100);
    const remainder = intNum % 100;
    words.push(
      hundredPart === 1 && remainder > 0 ? "ciento" : hundreds[hundredPart]
    );
    intNum = remainder;
  }

  // 十位与个位
  if (intNum >= 30) {
    const tenPart = Math.floor(intNum / 10);
    intNum %= 10;
    words.push(intNum > 0 ? tens[tenPart] + " y " + units[intNum] : tens[tenPart]);
  } else if (intNum >= 20) {
    words.push(specialTens[intNum - 20]);
  } else if (intNum >= 1) {
    words.push(units[intNum]);
  }

  // 小数部分
  if (decimalPart) {
    words.push("coma"); // 西班牙语小数点读作 "coma"
    if (decimalPart.length === 2) {
      words.push(numberToSpanish(Number(decimalPart)));
    } else {
      for (const digit of decimalPart) {
        words.push(digit === "0" ? "cero" : units[Number(digit)]);
      }
    }
  }

  return words.join(" ").trim();
}

// ---------- 朗读 ----------
function read(text) {
  const langKey = languageSelect.value;
  const prefix = read_prefix.checked ? (LANGS[langKey]?.prefix ?? "") : "";
  if (useComma.checked) {
    text = text.replace(".", ",");
  }
  synth.cancel(); // 防止连按时排队
  const utterThis = new SpeechSynthesisUtterance(prefix + text);
  const selectedName = voiceSelect.value;
  const voice = voices.find((v) => v.name === selectedName);
  if (voice) {
    utterThis.voice = voice;
    utterThis.lang = voice.lang; // 任意语言：跟随所选语音
  } else {
    utterThis.lang = LANGS[langKey]?.code ?? langKey; // 无语音时的兜底
  }
  utterThis.pitch = pitch.value;
  utterThis.rate = rate.value;
  synth.speak(utterThis);
}

// ---------- 计分 ----------
const stats = JSON.parse(
  localStorage.getItem("na-stats") ||
    '{"correct":0,"total":0,"streak":0,"best":0}'
);

function renderStats() {
  document.querySelector("#score-correct").textContent = stats.correct;
  document.querySelector("#score-total").textContent = stats.total;
  document.querySelector("#score-streak").textContent = stats.streak;
  document.querySelector("#score-best").textContent = stats.best;
}

function recordAnswer(isCorrect) {
  stats.total++;
  if (isCorrect) {
    stats.correct++;
    stats.streak++;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.streak = 0;
  }
  localStorage.setItem("na-stats", JSON.stringify(stats));
  renderStats();
}

renderStats();

document.querySelector("#score-reset").addEventListener("click", (event) => {
  event.preventDefault();
  stats.correct = stats.total = stats.streak = stats.best = 0;
  localStorage.setItem("na-stats", JSON.stringify(stats));
  renderStats();
});

// ---------- 判分 ----------
function checkAnswer() {
  if (inputTxt.value === "") {
    // 输入为空：只重听，不判分
    read(theNumber);
    inputTxt.focus();
    return;
  }

  // 逗号/点都算小数分隔符，避免「3,5」被判错
  const given = inputTxt.value.trim().replace(",", ".").replace(/\s+/g, "");
  const isCorrect = Number(given) === Number(theNumber);

  const shownNumber = useComma.checked
    ? theNumber.replace(".", ",")
    : theNumber;
  const words =
    languageSelect.value === "es" ? ` (${numberToSpanish(theNumber)})` : "";
  answer.innerHTML = `您输入的是：${inputTxt.value}
    <br>正确答案是：${shownNumber}${words}`;
  answer.style.color = isCorrect ? "green" : "red";

  recordAnswer(isCorrect);
  randomlyChangeNumber();

  if (!read_only_no_input.checked) {
    read(theNumber);
  }

  inputTxt.value = "";
  inputTxt.focus();
}

answerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  checkAnswer();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && document.activeElement !== inputTxt) {
    event.preventDefault();
    checkAnswer();
  }
});

playBtn.addEventListener("click", () => {
  read(theNumber);
  inputTxt.focus();
});

nextBtn.addEventListener("click", () => {
  randomlyChangeNumber();
  answer.innerHTML = "&#8203;";
  read(theNumber);
  inputTxt.focus();
});

inputTxt.focus();

pitch.oninput = () => {
  pitchValue.textContent = pitch.value;
};

rate.oninput = () => {
  rateValue.textContent = rate.value;
};

function markCustomPreset() {
  preset.value = "custom";
  randomlyChangeNumber();
}

rangeMax.onchange = markCustomPreset;
rangeMin.onchange = markCustomPreset;
decimal.onchange = () => randomlyChangeNumber();
