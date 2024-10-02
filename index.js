const synth = window.speechSynthesis;

const inputTxt = document.querySelector("#input");
const voiceSelect = document.querySelector("select");
const answer = document.querySelector("#answer");

const pitch = document.querySelector("#pitch");
const pitchValue = document.querySelector(".pitch-value");
const rate = document.querySelector("#rate");
const rateValue = document.querySelector(".rate-value");
const rangeMin = document.querySelector("#range-min");
const rangeMax = document.querySelector("#range-max");

const read_only_no_input = document.querySelector("#read_only_no_input");
const read_prefix = document.querySelector("#read_prefix");
const decimal = document.querySelector("#decimal");
const useComma = document.querySelector("#use-comma");

let voices = [];
let voices_got = false;

let theNumber = "";

function randomlyChangeNumber() {
  theNumber = (
    Number(rangeMin.value) +
    Math.floor(
      Math.random() *
        (Number(rangeMax.value) - Number(rangeMin.value) + 1) *
        (decimal.checked ? 100 : 1)
    ) /
      (decimal.checked ? 100 : 1)
  ).toString();
}

randomlyChangeNumber();

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
    "",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const specialTens = [
    "veinte",
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

  // Handle decimal part
  const [integerPart, decimalPart] = num.toString().split(".");

  // Handle integer part
  let intNum = Number(integerPart);

  // Handle millions
  if (intNum >= 1000000) {
    const millionPart = Math.floor(intNum / 1000000);
    words.push(numberToSpanish(millionPart) + " " + thousands[1]);
    intNum %= 1000000;
  }

  // Handle thousands
  if (intNum >= 1000) {
    const thousandPart = Math.floor(intNum / 1000);
    words.push(numberToSpanish(thousandPart) + " " + thousands[0]);
    intNum %= 1000;
  }

  // Handle hundreds
  if (intNum >= 100) {
    const hundredPart = Math.floor(intNum / 100);
    words.push(hundreds[hundredPart]);
    intNum %= 100;
  }

  // Handle tens
  if (intNum >= 30) {
    const tenPart = Math.floor(intNum / 10);
    words.push(tens[tenPart]);
    intNum %= 10;
    if (intNum > 0) {
      words.push(units[intNum]);
    }
  } else if (intNum >= 20) {
    words.push(specialTens[intNum - 20]);
  } else if (intNum >= 1) {
    words.push(units[intNum]);
  }

  // Handle decimal part (if exists)
  if (decimalPart) {
    words.push("coma"); // Spanish uses "coma" instead of "punto" for decimal
    if (decimalPart.length === 2) {
      // If the decimal part has two digits, treat it as a whole number
      words.push(numberToSpanish(Number(decimalPart)));
    } else {
      // Otherwise, read each digit one by one
      for (let digit of decimalPart) {
        words.push(units[Number(digit)]);
      }
    }
  }

  return words.join(" ").trim();
}

function read(text) {
  if (useComma.checked) {
    text = text.replace(".", ",");
  }
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

    randomlyChangeNumber();

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

rangeMax.onchange = () => {
  randomlyChangeNumber();
};

rangeMin.onchange = () => {
  randomlyChangeNumber();
};

decimal.onchange = () => {
  randomlyChangeNumber();
};
