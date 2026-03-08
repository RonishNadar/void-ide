# Void IDE — Setup & Build Guide

A beautiful Arduino IDE powered by Arduino CLI, built with React + Electron.

---

## Prerequisites

### 1. Node.js & npm
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version   # should be 18+
```

### 2. Arduino CLI
```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
sudo mv bin/arduino-cli /usr/local/bin/
arduino-cli version
```

### 3. Initialize Arduino CLI (first time only)
```bash
arduino-cli config init
arduino-cli core update-index

# Install AVR core (for Uno, Nano, Mega)
arduino-cli core install arduino:avr

# Install ESP32 core (optional)
arduino-cli core install esp32:esp32
```

### 4. Python + Pillow (for icon generation)
```bash
sudo apt install python3-pip
pip3 install Pillow --break-system-packages
```

---

## Project Setup

### Clone / set up your project
```
void-ide/
├── electron/
│   ├── main.js          ← Electron main process + Arduino CLI bridge
│   └── preload.js       ← Secure IPC bridge to renderer
├── src/
│   ├── App.js           ← Import VoidIDE component here
│   └── index.js         ← React entry point
├── assets/
│   ├── icon.png         ← Generated below
│   └── void-ide.desktop ← Manual .desktop entry (optional)
├── scripts/
│   ├── generate_icon.py ← Generates the icon
│   ├── postinstall.sh   ← Runs after deb install
│   └── postremove.sh    ← Runs after deb removal
└── package.json
```

### Install dependencies
```bash
cd void-ide
npm install
```

### Generate the icon
```bash
python3 scripts/generate_icon.py
# Creates assets/icon.png (512×512 cyan { } on dark hex)
```

### Set up React entry point

**src/index.js**
```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import VoidIDE from './VoidIDE';   // ← your void-ide.jsx

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<VoidIDE />);
```

**src/App.js** — just re-export VoidIDE, or delete and use index.js directly.

Place `void-ide.jsx` as `src/VoidIDE.jsx`.

---

## Development (live reload)

Starts React dev server + Electron simultaneously:

```bash
npm run dev
```

---

## Build & Package

### Build the React app + package as .deb and AppImage:
```bash
npm run dist:all
```

Output in `dist/`:
```
dist/
├── void-ide_1.0.0_amd64.deb      ← Install with dpkg
└── Void-IDE-1.0.0.AppImage        ← Portable, no install needed
```

---

## Install as Ubuntu App (Show Applications)

### Option A — Install the .deb (recommended)
```bash
sudo dpkg -i dist/void-ide_1.0.0_amd64.deb
```

This:
- Installs Void IDE to `/opt/Void IDE/`
- Creates `/usr/share/applications/void-ide.desktop` automatically
- Sets up udev rules for Arduino USB access
- Adds your user to the `dialout` group
- Creates `~/VoidSketches/` for your sketches

**Log out and back in** for serial port access to take effect.

Void IDE will appear in **Show Applications** immediately with its icon.

---

### Option B — Manual .desktop entry (no build needed, browser-based)

If you just want a shortcut in Show Apps that opens the React dev server:

```bash
# 1. Start the dev server in the background
npm start &

# 2. Install the desktop entry
mkdir -p ~/.local/share/applications
cp assets/void-ide.desktop ~/.local/share/applications/

# 3. Edit the Exec line to point to your browser
sed -i 's|Exec=.*|Exec=google-chrome --app=http://localhost:3000 --class=void-ide|' \
  ~/.local/share/applications/void-ide.desktop

# 4. Update icon path
sed -i "s|Icon=.*|Icon=$HOME/void-ide/assets/icon.png|" \
  ~/.local/share/applications/void-ide.desktop

# 5. Refresh app database
update-desktop-database ~/.local/share/applications

# 6. Set the icon (generate it first)
python3 scripts/generate_icon.py
```

Void IDE will appear in Show Applications within seconds.

---

### Option C — AppImage (portable, no install)

```bash
chmod +x dist/Void-IDE-1.0.0.AppImage
./dist/Void-IDE-1.0.0.AppImage
```

To add it to Show Applications manually:
```bash
mkdir -p ~/.local/bin
cp dist/Void-IDE-1.0.0.AppImage ~/.local/bin/void-ide
chmod +x ~/.local/bin/void-ide

cat > ~/.local/share/applications/void-ide.desktop << EOF
[Desktop Entry]
Type=Application
Name=Void IDE
Exec=$HOME/.local/bin/void-ide
Icon=$HOME/void-ide/assets/icon.png
Categories=Development;Electronics;IDE;
Comment=Arduino IDE powered by Arduino CLI
EOF

update-desktop-database ~/.local/share/applications
```

---

## Uninstall

```bash
sudo dpkg -r void-ide
```

---

## Wiring the React app to real Arduino CLI

In `void-ide.jsx`, replace the simulated `doCompile` and `doUpload` functions:

```js
// Check if running inside Electron
const isElectron = typeof window !== 'undefined' && window.voidIDE;

const doCompile = useCallback(async () => {
  if (compiling) return;
  setCompiling(true);
  setStatus({ state: 'compiling', text: 'Compiling…' });

  if (isElectron) {
    // Register real-time output listener
    window.voidIDE.onCLIOutput(({ line, kind }) => addLog(line, kind));

    // Save sketch first, then compile
    const saveResult = await window.voidIDE.saveFile({
      filePath: currentFilePath,   // null = open save dialog
      content:  activeCode,
    });
    if (!saveResult.ok) { setCompiling(false); return; }

    const result = await window.voidIDE.compile({
      fqbn:      board.fqbn,
      sketchPath: saveResult.sketchDir,
    });
    setStatus({ state: result.ok ? 'success' : 'error',
                text:  result.ok ? 'Compiled OK' : 'Compile failed' });
    window.voidIDE.offCLIOutput();
  } else {
    // Fallback simulation (browser mode)
    // ... existing setTimeout simulation ...
  }

  setCompiling(false);
}, [compiling, board, activeCode, addLog]);
```

Same pattern for `doUpload` — call `window.voidIDE.upload({ fqbn, port, sketchPath })`.

---

## Serial Monitor (real hardware)

For real serial communication, add to `electron/main.js`:

```js
const { SerialPort } = require('serialport');

ipcMain.handle('serial:open', async (event, { port, baud }) => {
  // Open port and pipe data back via IPC
});
```

Install serialport: `npm install serialport`
