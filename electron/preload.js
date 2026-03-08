'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('voidIDE', {
  // ── setup ──────────────────────────────────────────────────────────────────
  installCLI:    ()     => ipcRenderer.invoke('cli:install'),
  updateIndex:   ()     => ipcRenderer.invoke('cli:update-index'),

  // ── arduino-cli ────────────────────────────────────────────────────────────
  version:       ()     => ipcRenderer.invoke('cli:version'),
  boardList:     ()     => ipcRenderer.invoke('cli:board-list'),
  coreList:      ()     => ipcRenderer.invoke('cli:core-list'),
  coreSearch:    (q)    => ipcRenderer.invoke('cli:core-search',    { query: q }),
  coreInstall:   (core) => ipcRenderer.invoke('cli:core-install',   { core }),
  coreUninstall: (core) => ipcRenderer.invoke('cli:core-uninstall', { core }),
  libList:       ()     => ipcRenderer.invoke('cli:lib-list'),
  libSearch:     (q)    => ipcRenderer.invoke('cli:lib-search',     { query: q }),
  libInstall:    (name) => ipcRenderer.invoke('cli:lib-install',    { name }),
  libUninstall:  (name) => ipcRenderer.invoke('cli:lib-uninstall',  { name }),
  compile:       (opts) => ipcRenderer.invoke('cli:compile',  opts),
  upload:        (opts) => ipcRenderer.invoke('cli:upload',   opts),

  // ── file system ────────────────────────────────────────────────────────────
  saveAs:        (opts) => ipcRenderer.invoke('fs:save',         opts),
  saveCurrent:   (opts) => ipcRenderer.invoke('fs:save-current', opts),
  openFile:      ()     => ipcRenderer.invoke('fs:open'),

  // ── serial ─────────────────────────────────────────────────────────────────
  serialList:    ()     => ipcRenderer.invoke('serial:list'),
  serialOpen:    (opts) => ipcRenderer.invoke('serial:open',  opts),
  serialWrite:   (data) => ipcRenderer.invoke('serial:write', { data }),
  serialClose:   ()     => ipcRenderer.invoke('serial:close'),

  // ── streaming listeners ────────────────────────────────────────────────────
  onCLILine:      (cb) => ipcRenderer.on('cli:line',      (_, d) => cb(d)),
  onSerialData:   (cb) => ipcRenderer.on('serial:data',   (_, d) => cb(d)),
  onSerialError:  (cb) => ipcRenderer.on('serial:error',  (_, d) => cb(d)),
  onSerialClosed: (cb) => ipcRenderer.on('serial:closed', (_, d) => cb(d)),
  offCLILine:      () => ipcRenderer.removeAllListeners('cli:line'),
  offSerial:       () => {
    ipcRenderer.removeAllListeners('serial:data');
    ipcRenderer.removeAllListeners('serial:error');
    ipcRenderer.removeAllListeners('serial:closed');
  },
});
