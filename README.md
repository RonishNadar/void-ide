<p align="center">
  <img src="assets/icons/128x128.png" alt="Void IDE" width="96"/>
</p>

<h1 align="center">Void IDE</h1>

<p align="center">
  A modern, minimal Arduino IDE built with React + Electron + arduino-cli.<br/>
  Dark theme. Real compilation. Real uploads. Real serial monitor.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Linux-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/electron-28-cyan?style=flat-square"/>
  <img src="https://img.shields.io/badge/arduino--cli-latest-green?style=flat-square"/>
  <img src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square"/>
</p>

---

## Features

- **Zero simulation** — every action calls real `arduino-cli` under the hood
- **Auto-installs arduino-cli** on first launch if not found
- **Board Manager** — search and install any core from the arduino-cli index (AVR, ESP32, ESP8266, RP2040, SAMD, STM32, and more)
- **Library Manager** — search, install, and uninstall libraries from the Arduino library registry
- **Real Serial Monitor** — connect to any port, send and receive data, configurable baud rate
- **Auto port detection** — detects connected boards via `arduino-cli board list`
- **Multi-tab editor** — syntax highlighting, line numbers, Tab indent, Ctrl+S to save
- **Native file dialogs** — open and save `.ino` sketches via OS file picker
- **Packages as `.deb`** — installs to Show Applications like a native Linux app

---

## Screenshots

![Main IDE](screenshots/main.png)

---

## Requirements

- **Ubuntu / Debian Linux** (tested on Ubuntu 22.04+)
- **Node.js 18+** and **npm**
- **Python 3** with **Pillow** (for icon generation)
- Internet connection on first launch (to download arduino-cli)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/void-ide.git
cd void-ide
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Generate icons

```bash
pip3 install Pillow --break-system-packages
python3 scripts/generate_icon.py
```

### 4. Fix Electron sandbox permissions (Linux)

```bash
sudo chown root:root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

### 5. Run in development mode

```bash
npm run dev
```

This starts the React dev server and opens the Electron window. On first launch, Void IDE will detect that `arduino-cli` is missing and walk you through installing it automatically.

> **Note:** Do not use the browser tab that React opens — always use the Electron window.

---

## Build & Install as a native `.deb`

```bash
# Build the .deb package
npm run dist:deb

# Install it
sudo dpkg -i dist/void-ide_1.0.0_amd64.deb
```

After installation, **Void IDE** appears in Show Applications with its icon. The post-install script automatically:
- Adds your user to the `dialout` group (required for serial port access)
- Sets up udev rules for Arduino USB devices (CH340, CP210x, ATmega16U2)
- Creates `~/VoidSketches/` as your default sketch folder
- Patches the `.desktop` entry with `--no-sandbox` for correct launch on Linux

> **Log out and back in** after first install for serial port access to take effect.

### Uninstall

```bash
sudo dpkg --purge void-ide
```

---

## Connecting your Arduino

If your board is not detected after installing:

```bash
# Add yourself to the dialout group (if not done by installer)
sudo usermod -aG dialout $USER

# Log out and back in, then verify
arduino-cli board list
```

For **Arduino Nano clones** (CH340 chip), also run:

```bash
sudo apt install linux-modules-extra-$(uname -r)
```

Then unplug and replug your board.

---

## Project Structure

```
void-ide/
├── electron/
│   ├── main.js         ← Electron main process, arduino-cli IPC bridge, serial monitor
│   └── preload.js      ← Secure contextBridge — exposes window.voidIDE to React
├── src/
│   ├── VoidIDE.jsx     ← Entire IDE UI (editor, board manager, library manager, serial)
│   └── index.js        ← React entry point
├── public/
│   └── index.html      ← HTML shell
├── assets/
│   ├── icon.png        ← 512x512 app icon
│   └── icons/          ← Multi-size icons for electron-builder (16–512px)
├── scripts/
│   ├── generate_icon.py   ← Generates all icon sizes using Pillow
│   ├── postinstall.sh     ← Runs after dpkg install
│   └── postremove.sh      ← Runs after dpkg removal
└── package.json
```

---

## How It Works

Void IDE uses Electron's **IPC bridge** to communicate between the React UI and the system:

- `window.voidIDE.compile({ fqbn, sketchDir })` → spawns `arduino-cli compile --fqbn ... --verbose`
- `window.voidIDE.upload({ fqbn, port, sketchDir })` → spawns `arduino-cli upload -p ... --fqbn ...`
- `window.voidIDE.serialOpen({ port, baud })` → spawns `arduino-cli monitor -p ... --config baudrate=...`
- `window.voidIDE.libSearch(query)` → runs `arduino-cli lib search` and returns JSON results
- `window.voidIDE.coreSearch(query)` → runs `arduino-cli core search` and returns JSON results

All CLI output is streamed line-by-line back to the output console in real time.

---

## Supported Boards (out of the box)

| Board | FQBN |
|---|---|
| Arduino Uno | `arduino:avr:uno` |
| Arduino Nano | `arduino:avr:nano` |
| Arduino Mega 2560 | `arduino:avr:mega` |
| Arduino Leonardo | `arduino:avr:leonardo` |
| Arduino Micro | `arduino:avr:micro` |
| Arduino Pro Mini | `arduino:avr:pro` |
| ESP32 Dev Module | `esp32:esp32:esp32` |
| ESP32-S3 | `esp32:esp32:esp32s3` |
| ESP8266 NodeMCU | `esp8266:esp8266:nodemcuv2` |
| Raspberry Pi Pico | `rp2040:rp2040:rpipico` |

Any board supported by arduino-cli can be added via the **Board Manager** tab.

---

## License

MIT © Ronish Nadar
