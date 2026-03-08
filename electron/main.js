'use strict';

const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const { spawn, execSync, exec } = require('child_process');
const path   = require('path');
const fs     = require('fs');
const os     = require('os');
const https  = require('https');

// ── arduino-cli install path ──────────────────────────────────────────────────
const CLI_INSTALL_DIR  = path.join(os.homedir(), '.local', 'bin');
const CLI_INSTALL_PATH = path.join(CLI_INSTALL_DIR, 'arduino-cli');
const isDev = process.env.NODE_ENV === 'development';

// ── Find arduino-cli (checks PATH + known locations) ─────────────────────────
function findCLI() {
  const candidates = [
    'arduino-cli',
    '/usr/local/bin/arduino-cli',
    '/usr/bin/arduino-cli',
    path.join(os.homedir(), 'bin', 'arduino-cli'),
    CLI_INSTALL_PATH,
  ];
  for (const c of candidates) {
    try { execSync(`"${c}" version`, { stdio: 'ignore' }); return c; } catch {}
  }
  return null;
}

let CLI = findCLI();
let win;

// ── Window ────────────────────────────────────────────────────────────────────
function createWindow() {
  win = new BrowserWindow({
    width: 1400, height: 860, minWidth: 960, minHeight: 640,
    title: 'Void IDE',
    icon: path.join(__dirname, '../assets/icon.png'),
    backgroundColor: '#080a0d',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  Menu.setApplicationMenu(null);
  if (isDev) {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../build/index.html'));
  }
  win.once('ready-to-show', () => win.show());
  win.on('closed', () => { win = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (!win) createWindow(); });

// ── Helpers ───────────────────────────────────────────────────────────────────
function streamCLI(args, sender) {
  return new Promise((resolve) => {
    if (!CLI) {
      sender.send('cli:line', { text: 'arduino-cli not installed. Use the Setup panel to install it.', kind: 'error' });
      return resolve({ ok: false, code: -1 });
    }
    const env  = { ...process.env, PATH: `${CLI_INSTALL_DIR}:${process.env.PATH}` };
    const proc = spawn(CLI, args, { env });
    let stdout = '', stderr = '';

    proc.stdout.on('data', d => {
      stdout += d;
      d.toString().split('\n').filter(Boolean).forEach(line =>
        sender.send('cli:line', { text: line, kind: 'info' })
      );
    });
    proc.stderr.on('data', d => {
      stderr += d;
      d.toString().split('\n').filter(Boolean).forEach(line => {
        const kind = /error:/i.test(line) ? 'error' : /warning:/i.test(line) ? 'warning' : 'info';
        sender.send('cli:line', { text: line, kind });
      });
    });
    proc.on('close', code => resolve({ ok: code === 0, stdout, stderr, code }));
    proc.on('error', err => {
      sender.send('cli:line', { text: `Spawn error: ${err.message}`, kind: 'error' });
      resolve({ ok: false, code: -1 });
    });
  });
}

function runCLIJson(args) {
  return new Promise((resolve) => {
    if (!CLI) return resolve({ ok: false, data: null });
    const env  = { ...process.env, PATH: `${CLI_INSTALL_DIR}:${process.env.PATH}` };
    const proc = spawn(CLI, [...args, '--format', 'json'], { env });
    let out = '';
    proc.stdout.on('data', d => out += d);
    proc.on('close', code => {
      try { resolve({ ok: code === 0, data: JSON.parse(out) }); }
      catch { resolve({ ok: code === 0, data: out }); }
    });
    proc.on('error', () => resolve({ ok: false, data: null }));
  });
}

function prepareSketchDir(sketchPath, content) {
  const ext  = path.extname(sketchPath);
  const base = path.basename(sketchPath, ext || '.ino');
  const dir  = path.join(path.dirname(sketchPath), base);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, base + '.ino');
  fs.writeFileSync(file, content, 'utf8');
  return { dir, file };
}

// ── IPC: arduino-cli auto-install ─────────────────────────────────────────────
// Downloads the official install script and runs it, streaming progress back
ipcMain.handle('cli:install', async (event) => {
  const sender = event.sender;
  sender.send('cli:line', { text: 'Starting arduino-cli installation…', kind: 'system' });

  return new Promise((resolve) => {
    fs.mkdirSync(CLI_INSTALL_DIR, { recursive: true });

    // Download official install script from arduino.cc
    const installScriptPath = path.join(os.tmpdir(), 'install-arduino-cli.sh');
    const file = fs.createWriteStream(installScriptPath);

    sender.send('cli:line', { text: 'Downloading install script from arduino.cc…', kind: 'info' });

    https.get('https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh', (res) => {
      if (res.statusCode !== 200) {
        sender.send('cli:line', { text: `Download failed: HTTP ${res.statusCode}`, kind: 'error' });
        return resolve({ ok: false });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        fs.chmodSync(installScriptPath, '755');

        sender.send('cli:line', { text: `Installing to ${CLI_INSTALL_DIR}…`, kind: 'info' });

        // Run install script with BINDIR set to our install dir
        const proc = spawn('sh', [installScriptPath], {
          env: { ...process.env, BINDIR: CLI_INSTALL_DIR },
        });

        proc.stdout.on('data', d =>
          d.toString().split('\n').filter(Boolean).forEach(line =>
            sender.send('cli:line', { text: line, kind: 'info' })
          )
        );
        proc.stderr.on('data', d =>
          d.toString().split('\n').filter(Boolean).forEach(line =>
            sender.send('cli:line', { text: line, kind: 'warning' })
          )
        );
        proc.on('close', code => {
          if (code === 0 && fs.existsSync(CLI_INSTALL_PATH)) {
            CLI = CLI_INSTALL_PATH;
            sender.send('cli:line', { text: `✓ arduino-cli installed at ${CLI_INSTALL_PATH}`, kind: 'success' });
            // Initialize config and update index right after install
            sender.send('cli:line', { text: 'Initializing arduino-cli config…', kind: 'info' });
            const init = spawn(CLI, ['config', 'init'], { env: { ...process.env } });
            init.on('close', () => {
              sender.send('cli:line', { text: 'Updating platform index (this may take a moment)…', kind: 'info' });
              const update = spawn(CLI, ['core', 'update-index'], { env: { ...process.env } });
              update.stdout.on('data', d => d.toString().split('\n').filter(Boolean).forEach(l => sender.send('cli:line', { text: l, kind: 'info' })));
              update.stderr.on('data', d => d.toString().split('\n').filter(Boolean).forEach(l => sender.send('cli:line', { text: l, kind: 'info' })));
              update.on('close', () => {
                sender.send('cli:line', { text: '✓ arduino-cli ready to use.', kind: 'success' });
                resolve({ ok: true, path: CLI_INSTALL_PATH });
              });
            });
          } else {
            sender.send('cli:line', { text: 'Installation failed. Try manually: curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh', kind: 'error' });
            resolve({ ok: false });
          }
        });
        proc.on('error', err => {
          sender.send('cli:line', { text: `Install error: ${err.message}`, kind: 'error' });
          resolve({ ok: false });
        });
      });
    }).on('error', err => {
      sender.send('cli:line', { text: `Network error: ${err.message}`, kind: 'error' });
      resolve({ ok: false });
    });
  });
});

// ── IPC: CLI version / status ─────────────────────────────────────────────────
ipcMain.handle('cli:version', () => {
  CLI = findCLI(); // re-check in case it was just installed
  if (!CLI) return { ok: false, version: null, missing: true };
  try {
    const out = execSync(`"${CLI}" version`).toString().trim();
    return { ok: true, version: out, path: CLI };
  } catch { return { ok: false, version: null }; }
});

// ── IPC: Update platform index ────────────────────────────────────────────────
ipcMain.handle('cli:update-index', async (event) => {
  event.sender.send('cli:line', { text: 'arduino-cli core update-index', kind: 'system' });
  return await streamCLI(['core', 'update-index'], event.sender);
});

// ── IPC: Board list (detected ports) ─────────────────────────────────────────
ipcMain.handle('cli:board-list', async () => {
  const res = await runCLIJson(['board', 'list']);
  const raw = res.data;
  let ports = [];
  if (Array.isArray(raw)) ports = raw;
  else if (raw?.detected_ports) ports = raw.detected_ports;
  return { ok: res.ok, ports };
});

// ── IPC: Library examples — scans filesystem directly ───────────────────────
ipcMain.handle('cli:lib-examples', async () => {
  const examples = [];

  // arduino-cli stores libs in ~/Arduino/libraries and ~/.arduino15/... 
  // We also check the data dir from arduino-cli config
  const homedir = require('os').homedir();

  // Only scan user-installed libraries — NOT core-bundled ones in .arduino15
  // Core-bundled libs (Servo, Ethernet, SD etc.) show up but can't be used
  // without separately installing them, which is confusing.
  const candidateDirs = [
    path.join(homedir, 'Arduino', 'libraries'),
    path.join(homedir, 'snap', 'arduino', 'current', 'Arduino', 'libraries'),
  ];

  // Also check arduino-cli's configured user directory
  try {
    const cfgRes = await runCLIJson(['config', 'dump']);
    const cfg = cfgRes.data;
    const libDir = cfg?.directories?.user
      ? path.join(cfg.directories.user, 'libraries')
      : null;
    if (libDir && !candidateDirs.includes(libDir)) candidateDirs.unshift(libDir);
  } catch {}

  const scannedDirs = [];
  for (const libsDir of candidateDirs) {
    if (!fs.existsSync(libsDir)) continue;
    scannedDirs.push(libsDir);
    let libFolders;
    try { libFolders = fs.readdirSync(libsDir); } catch { continue; }

    for (const libName of libFolders) {
      const libDir = path.join(libsDir, libName);
      // Check both 'examples' and 'Examples' (case-sensitive on Linux)
      const exDirLower = path.join(libDir, 'examples');
      const exDirUpper = path.join(libDir, 'Examples');
      const examplesDir = fs.existsSync(exDirLower) ? exDirLower
        : fs.existsSync(exDirUpper) ? exDirUpper : null;

      if (!examplesDir) continue;

      // Walk recursively up to 2 levels deep to find .ino files
      const walkExamples = (dir, depth = 0) => {
        if (depth > 2) return;
        let entries;
        try { entries = fs.readdirSync(dir); } catch { return; }
        const hasIno = entries.some(f => f.endsWith('.ino'));
        if (hasIno) {
          const inoFile = entries.find(f => f.endsWith('.ino'));
          const exName = path.basename(dir);
          examples.push({ lib: libName, name: exName, path: path.join(dir, inoFile) });
        } else {
          for (const entry of entries) {
            const full = path.join(dir, entry);
            try {
              if (fs.statSync(full).isDirectory()) walkExamples(full, depth + 1);
            } catch {}
          }
        }
      };
      walkExamples(examplesDir);
    }
  }
  console.log('[examples] scanned:', scannedDirs, '— found:', examples.length);

  // Sort by lib name then example name
  examples.sort((a, b) => a.lib.localeCompare(b.lib) || a.name.localeCompare(b.name));
  return { ok: true, examples };
});

// ── IPC: Dump arduino-cli config (for debugging) ─────────────────────────────
ipcMain.handle('cli:config-dump', async () => {
  const res = await runCLIJson(['config', 'dump']);
  return { ok: res.ok, config: res.data };
});

// ── IPC: Read a file ──────────────────────────────────────────────────────────
ipcMain.handle('cli:read-file', async (_, { filePath }) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { ok: true, content };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

// ── IPC: All boards from installed cores ─────────────────────────────────────
ipcMain.handle('cli:board-list-all', async () => {
  const res = await runCLIJson(['board', 'listall']);
  const raw = res.data;
  let boards = [];
  if (Array.isArray(raw)) boards = raw;
  else if (raw?.boards) boards = raw.boards;
  boards = boards
    .map(b => ({ name: b.name || b.Name, fqbn: b.fqbn || b.FQBN }))
    .filter(b => b.name && b.fqbn);
  return { ok: res.ok, boards };
});

// ── IPC: Installed cores ──────────────────────────────────────────────────────
ipcMain.handle('cli:core-list', async () => {
  const res = await runCLIJson(['core', 'list']);
  const raw = res.data;
  const platforms = Array.isArray(raw) ? raw : (raw?.platforms ?? []);
  return { ok: res.ok, platforms };
});

// ── IPC: Search cores (from full index) ───────────────────────────────────────
ipcMain.handle('cli:core-search', async (_, { query }) => {
  const res = await runCLIJson(['core', 'search', query || '']);
  const raw = res.data;
  const platforms = Array.isArray(raw) ? raw : (raw?.platforms ?? []);
  return { ok: res.ok, platforms: platforms.slice(0, 60) };
});

// ── IPC: Install core (streamed) ──────────────────────────────────────────────
ipcMain.handle('cli:core-install', async (event, { core }) => {
  event.sender.send('cli:line', { text: `arduino-cli core install ${core}`, kind: 'system' });
  return await streamCLI(['core', 'install', core], event.sender);
});

// ── IPC: Uninstall core ───────────────────────────────────────────────────────
ipcMain.handle('cli:core-uninstall', async (event, { core }) => {
  event.sender.send('cli:line', { text: `arduino-cli core uninstall ${core}`, kind: 'system' });
  return await streamCLI(['core', 'uninstall', core], event.sender);
});

// ── IPC: Library list ─────────────────────────────────────────────────────────
ipcMain.handle('cli:lib-list', async () => {
  const res = await runCLIJson(['lib', 'list']);
  const raw = res.data;
  const installed = Array.isArray(raw) ? raw : (raw?.installed_libraries ?? []);
  return { ok: res.ok, installed };
});

// ── IPC: Library search ───────────────────────────────────────────────────────
ipcMain.handle('cli:lib-search', async (_, { query }) => {
  if (!query || query.trim().length < 2) return { ok: true, libraries: [] };
  const res = await runCLIJson(['lib', 'search', query]);
  const raw = res.data;
  const libraries = Array.isArray(raw) ? raw : (raw?.libraries ?? []);
  return { ok: res.ok, libraries: libraries.slice(0, 30) };
});

// ── IPC: Library install ──────────────────────────────────────────────────────
ipcMain.handle('cli:lib-install', async (event, { name }) => {
  event.sender.send('cli:line', { text: `arduino-cli lib install "${name}"`, kind: 'system' });
  return await streamCLI(['lib', 'install', name], event.sender);
});

// ── IPC: Library uninstall ────────────────────────────────────────────────────
ipcMain.handle('cli:lib-uninstall', async (event, { name }) => {
  event.sender.send('cli:line', { text: `arduino-cli lib uninstall "${name}"`, kind: 'system' });
  return await streamCLI(['lib', 'uninstall', name], event.sender);
});

// ── IPC: Compile ──────────────────────────────────────────────────────────────
ipcMain.handle('cli:compile', async (event, { fqbn, sketchDir }) => {
  event.sender.send('cli:line', { text: `arduino-cli compile --fqbn ${fqbn} "${sketchDir}"`, kind: 'system' });
  return await streamCLI(['compile', '--fqbn', fqbn, '--verbose', sketchDir], event.sender);
});

// ── IPC: Delete file from disk ───────────────────────────────────────────────
ipcMain.handle('fs:delete-file', async (event, { filePath }) => {
  const { response } = await dialog.showMessageBox(win, {
    type: 'warning',
    buttons: ['Move to Trash', 'Cancel'],
    defaultId: 1,
    cancelId: 1,
    title: 'Move to Trash',
    message: `Move "${path.basename(filePath)}" to Trash?`,
    detail: 'You can restore it from the Trash later.',
  });
  if (response === 1) return { ok: false, canceled: true };
  try {
    await shell.trashItem(filePath);
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── IPC: List sketch directory files ─────────────────────────────────────────
ipcMain.handle('fs:list-dir', async (_, { sketchDir }) => {
  try {
    const entries = fs.readdirSync(sketchDir, { withFileTypes: true });
    const files = entries
      .filter(e => e.isFile() && /\.(ino|h|cpp|c)$/.test(e.name))
      .map(e => ({ name: e.name, filePath: path.join(sketchDir, e.name) }));
    return { ok: true, files };
  } catch (e) { return { ok: false, files: [] }; }
});

// Silent compile for syntax checking — returns structured errors without streaming to output
ipcMain.handle('cli:compile-check', async (_, { fqbn, sketchDir }) => {
  return new Promise((resolve) => {
    if (!CLI) return resolve({ ok: false, errors: [] });
    const env = { ...process.env, PATH: `${CLI_INSTALL_DIR}:${process.env.PATH}` };
    const proc = spawn(CLI, ['compile', '--fqbn', fqbn, sketchDir], { env });
    let stderr = '';
    proc.stderr.on('data', d => { stderr += d; });
    proc.stdout.on('data', () => {}); // drain stdout silently
    proc.on('close', code => {
      const errors = [];
      // GCC error format: /path/to/file.ino:LINE:COL: error/warning: message
      const re = /([^\s:]+\.ino):(\d+):\d+:\s*(error|warning):\s*(.+)/g;
      let m;
      while ((m = re.exec(stderr)) !== null) {
        const msg = m[4].trim();
        if (msg.startsWith('In file') || msg.startsWith('note:') || msg.startsWith('In member')) continue;
        const lineNum = parseInt(m[2], 10);
        const kind = m[3];
        // Only keep first error per line (errors win over warnings)
        const existing = errors.find(e => e.line === lineNum);
        if (!existing) errors.push({ line: lineNum, kind, msg });
        else if (kind === 'error' && existing.kind === 'warning') existing.kind = 'error';
      }
      resolve({ ok: code === 0, errors });
    });
    proc.on('error', () => resolve({ ok: false, errors: [] }));
  });
});

// ── IPC: Upload ───────────────────────────────────────────────────────────────
ipcMain.handle('cli:upload', async (event, { fqbn, port, sketchDir }) => {
  event.sender.send('cli:line', { text: `arduino-cli upload -p ${port} --fqbn ${fqbn} "${sketchDir}"`, kind: 'system' });
  return await streamCLI(['upload', '-p', port, '--fqbn', fqbn, '--verbose', sketchDir], event.sender);
});

// ── IPC: File — Save As ───────────────────────────────────────────────────────
ipcMain.handle('fs:save', async (event, { filePath, content }) => {
  try {
    let target = filePath;
    if (!target) {
      const defaultDir = path.join(os.homedir(), 'VoidSketches');
      fs.mkdirSync(defaultDir, { recursive: true });
      const { canceled, filePath: chosen } = await dialog.showSaveDialog(win, {
        title: 'Save Sketch',
        defaultPath: path.join(defaultDir, 'sketch.ino'),
        filters: [{ name: 'Arduino Sketch', extensions: ['ino'] }],
      });
      if (canceled) return { ok: false, canceled: true };
      target = chosen;
    }
    const { dir, file } = prepareSketchDir(target, content);
    return { ok: true, filePath: file, sketchDir: dir };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── IPC: File — Save current ──────────────────────────────────────────────────
ipcMain.handle('fs:save-current', async (_, { filePath, content }) => {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
    return { ok: true };
  }
  catch (e) { return { ok: false, error: e.message }; }
});

// ── IPC: File — Open ─────────────────────────────────────────────────────────
ipcMain.handle('fs:open', async () => {
  const defaultDir = path.join(os.homedir(), 'VoidSketches');
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: 'Open Sketch',
    defaultPath: fs.existsSync(defaultDir) ? defaultDir : os.homedir(),
    filters: [{ name: 'Arduino Sketch', extensions: ['ino'] }],
    properties: ['openFile'],
  });
  if (canceled || !filePaths.length) return { ok: false, canceled: true };
  try {
    const content   = fs.readFileSync(filePaths[0], 'utf8');
    const sketchDir = path.dirname(filePaths[0]);
    return { ok: true, filePath: filePaths[0], sketchDir, content };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── IPC: Serial — list ports ──────────────────────────────────────────────────
ipcMain.handle('serial:list', async () => {
  const res = await runCLIJson(['board', 'list']);
  const raw = res.data;
  let ports = [];
  if (Array.isArray(raw)) ports = raw;
  else if (raw?.detected_ports) ports = raw.detected_ports;
  const addresses = ports.map(p => p.port?.address || p.address).filter(Boolean);
  return { ok: true, ports: addresses };
});

// ── IPC: Serial monitor (arduino-cli monitor) ─────────────────────────────────
let serialProc = null;

ipcMain.handle('serial:open', async (event, { port, baud }) => {
  if (serialProc) { serialProc.kill(); serialProc = null; }
  if (!CLI) return { ok: false, error: 'arduino-cli not installed' };

  const env = { ...process.env, PATH: `${CLI_INSTALL_DIR}:${process.env.PATH}` };
  serialProc = spawn(CLI, ['monitor', '-p', port, '--config', `baudrate=${baud}`], { env });

  serialProc.stdout.on('data', d =>
    d.toString().split('\n').filter(Boolean).forEach(line =>
      event.sender.send('serial:data', { line })
    )
  );
  serialProc.stderr.on('data', d => {
    const txt = d.toString().trim();
    if (txt) event.sender.send('serial:error', { line: txt });
  });
  serialProc.on('close', () => {
    event.sender.send('serial:closed', {});
    serialProc = null;
  });
  serialProc.on('error', err => {
    event.sender.send('serial:error', { line: err.message });
    serialProc = null;
  });
  return { ok: true };
});

ipcMain.handle('serial:write', (_, { data }) => {
  if (!serialProc?.stdin) return { ok: false };
  serialProc.stdin.write(data + '\n');
  return { ok: true };
});

ipcMain.handle('serial:close', () => {
  if (serialProc) { serialProc.kill(); serialProc = null; }
  return { ok: true };
});

app.on('before-quit', () => { if (serialProc) serialProc.kill(); });