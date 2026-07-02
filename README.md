**English** | [中文](README.zh-CN.md)

# Number Auditory

> 🌐 **Try it online:** <https://numbers.snownamida.top/>

A free, multilingual **number-dictation trainer** for language learners: it generates a random number, reads it aloud in your target language, you type what you heard, and it scores you instantly. Numbers — prices, years, phone numbers, quantities — are one of the things most likely to trip you up in a foreign language, and focused, high-frequency drilling noticeably speeds up your reactions. No signup, no API key — everything runs locally in your browser.

![Screenshot](screenshot.jpg)

## ✨ Features

- 🌍 **Any language**: automatically lists every speech language installed in your browser / system (Spanish, French, English, German and Japanese also get a spoken "here comes the number" lead-in phrase); you can pick a specific voice
- 🎯 **Range presets**: 0–100, 0–1000, big numbers (millions), years 1900–2100, prices (with decimals), or a fully custom range
- 🏆 **Scoring & streaks**: correct count, total count and best streak, saved locally (localStorage)
- 🎚 **Adjustable speed / pitch**, with "replay" and "next" available at any time
- 🇪🇸 For Spanish, the answer also shows the **written-out form** of the number (e.g. `142 → ciento cuarenta y dos`)
- 📱 Works on phone, tablet and desktop; the decimal separator is accepted as either `.` or `,`
- 🔒 **No online TTS, no API key required**: speech uses the browser's built-in Web Speech API (`speechSynthesis`) — free and privacy-friendly

## 🚀 Usage

1. Open <https://numbers.snownamida.top/>
2. Choose a language and number range, then click "🔊 Play"
3. Type the number you heard into the text box and press Enter or "Submit"
4. Pressing Enter with an empty box = replay the current number

> 💡 No sound? Click "Play" once first (browsers require a user interaction before they can speak), and make sure your system has the voice pack for that language installed.

## 🛠 Development

Pure vanilla HTML / CSS / JavaScript, no build step:

```bash
git clone https://github.com/Snownamida/Number-Auditory.git
cd Number-Auditory
python3 -m http.server 8000
# open http://localhost:8000
```

## ☕ Support

If this little tool helped you, feel free to [buy me a coffee ☕](https://ko-fi.com/snownamida).

## 📄 License

[MIT](LICENSE) © Snownamida
