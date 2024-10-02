const synth = window.speechSynthesis;

const inputTxt = document.querySelector("#input");
const voiceSelect = document.querySelector("select");
const answer = document.querySelector("#answer");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");
const num_range = document.querySelector("#num_range");
const num_range_value = document.querySelector(".num_range-value");

const read_only_no_input = document.querySelector("#read_only_no_input");
const read_prefix = document.querySelector("#read_prefix");

let voices = [];
let voices_got = false;

let theNumber = Math.floor(Math.random() * 101).toString();

function populateVoiceList() {
  if (voices_got) {
    return;
  }
  console.log("populateVoiceList被调用");
  voices = synth.getVoices();
  if (voices.length > 0) {
    voices_got = true;
  }

  for (const voice of voices) {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.textContent += " — DEFAULT";
    }

    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    if (voice.lang === "es-ES" || voice.lang === "es_ES") {
      option.setAttribute("selected", true);
    }
    // console.log(voice);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    console.log("onvoiceschanged被调用");
    populateVoiceList();
  };
}

function numberToSpanish(num) {
  num = Number(num);

  const units = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];

  const tens = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const specialTens = [
    "",
    "veintiuno",
    "veintidós",
    "veintitrés",
    "veinticuatro",
    "veinticinco",
    "veintiséis",
    "veintisiete",
    "veintiocho",
    "veintinueve",
  ];

  const hundreds = [
    "",
    "cien",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  const thousands = ["mil", "millón", "mil millones"];

  if (num === 0) return "cero";
  if (num < 0) return "menos " + numberToSpanish(-num);

  let words = [];

  // Handle millions
  if (num >= 1000000) {
    const millionPart = Math.floor(num / 1000000);
    words.push(numberToSpanish(millionPart) + " " + thousands[1]);
    num %= 1000000;
  }

  // Handle thousands
  if (num >= 1000) {
    const thousandPart = Math.floor(num / 1000);
    words.push(numberToSpanish(thousandPart) + " " + thousands[0]);
    num %= 1000;
  }

  // Handle hundreds
  if (num >= 100) {
    const hundredPart = Math.floor(num / 100);
    words.push(hundreds[hundredPart]);
    num %= 100;
  }

  // Handle tens
  if (num >= 30 || num == 20) {
    const tenPart = Math.floor(num / 10);
    words.push(tens[tenPart]);
    num %= 10;
    if (num > 0) {
      words.push(units[num]);
    }
  } else if (num >= 20) {
    words.push(specialTens[num - 20]);
  } else if (num >= 1) {
    words.push(units[num]);
  }

  return words.join(" ").trim();
}

function read(text) {
  const utterThis = new SpeechSynthesisUtterance(
    (read_prefix.checked ? "El nombre es :" : "") + text
  );
  const selectedOption =
    voiceSelect.selectedOptions[0].getAttribute("data-name");
  for (const voice of voices) {
    if (voice.name === selectedOption) {
      utterThis.voice = voice;
    }
  }
  utterThis.pitch = pitch.value;
  utterThis.rate = rate.value;
  synth.speak(utterThis);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();

    if (inputTxt.value === "") {
      read(theNumber);
      inputTxt.focus();
      return;
    }
    answer.innerHTML = `您输入的是：${inputTxt.value}
    <br>正确答案是：${theNumber} (${numberToSpanish(theNumber)})`;

    if (theNumber == inputTxt.value) {
      answer.style.color = "green";
    } else {
      answer.style.color = "red";
    }

    theNumber = Math.floor(
      Math.random() * (Number(num_range.value) + 1)
    ).toString();

    if (!read_only_no_input.checked) {
      read(theNumber);
    }

    inputTxt.value = "";
    inputTxt.focus();
  }
});

inputTxt.focus();

pitch.onchange = () => {
  pitchValue.textContent = pitch.value;
};

rate.onchange = () => {
  rateValue.textContent = rate.value;
};

num_range.onchange = () => {
  num_range_value.textContent = num_range.value;
  theNumber = Math.floor(
    Math.random() * (Number(num_range.value) + 1)
  ).toString();
};
