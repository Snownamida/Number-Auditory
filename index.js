const synth = window.speechSynthesis;

const inputTxt = document.querySelector(".txt");
const voiceSelect = document.querySelector("select");
const answer = document.querySelector(".answer");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");

let voices = [];

let theNumber = Math.floor(Math.random() * 101).toString();

function populateVoiceList() {
  voices = synth.getVoices();

  for (const voice of voices) {
    const option = document.createElement("option");
    option.textContent = `${voice.name} (${voice.lang})`;

    if (voice.default) {
      option.textContent += " — DEFAULT";
    }

    option.setAttribute("data-lang", voice.lang);
    option.setAttribute("data-name", voice.name);
    if (voice.name === "Google español") {
      option.setAttribute("selected", true);
    }
    // console.log(voice);
    voiceSelect.appendChild(option);
  }
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function numberToSpanish(num) {
  const unidades = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const decenas = [
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
  const decenasSuperiores = [
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

  if (num < 10) {
    return unidades[num];
  } else if (num < 20) {
    return decenas[num - 10];
  } else if (num < 30) {
    if (num === 20) {
      return "veinte";
    } else {
      return `veinti${unidades[num - 20]}`;
    }
  } else if (num < 100) {
    const unidad = num % 10;
    const decena = Math.floor(num / 10);
    return unidad === 0
      ? decenasSuperiores[decena]
      : `${decenasSuperiores[decena]} y ${unidades[unidad]}`;
  } else {
    return "Número demasiado grande";
  }
}

console.log(numberToSpanish(21)); // 输出 "veintiuno"

function read(text) {
  const utterThis = new SpeechSynthesisUtterance("El nombre es :" + text);
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

    answer.textContent = `您输入的是：${
      inputTxt.value
    }，正确答案是：${theNumber} (${numberToSpanish(theNumber)})`;

    if (theNumber == inputTxt.value) {
      answer.style.color = "green";
    } else {
      answer.style.color = "red";
    }

    theNumber = Math.floor(Math.random() * 101).toString();

    read(theNumber);

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
