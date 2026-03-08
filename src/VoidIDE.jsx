import { useState, useRef, useEffect, useCallback } from "react";

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap');`;

const CSS = `
  :root {
    --bg0:#080a0d;--bg1:#0e1117;--bg2:#141820;--bg3:#1c2130;--bg4:#242b3d;
    --line:#1e2638;--cyan:#4ec9c9;--cyan2:#7ee8e8;--green:#4ec994;
    --red:#e05a5a;--blue:#5ab4e0;--amber:#f0c040;
    --muted:#4a5570;--text:#c0c8d8;--text2:#7a8599;--white:#eef0f5;
    --r:6px;--mono:'JetBrains Mono',monospace;--ui:'Syne',sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg0);color:var(--text);font-family:var(--ui);overflow:hidden}
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:var(--bg1)}
  ::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:3px}
  ::-webkit-scrollbar-thumb:hover{background:var(--cyan)}

  /* ── Setup screen ── */
  .setup{display:flex;flex-direction:column;align-items:center;justify-content:center;
    height:100vh;width:100vw;background:var(--bg0);gap:0}
  .setup-box{background:var(--bg1);border:1px solid var(--line);border-radius:12px;
    padding:40px 48px;width:560px;display:flex;flex-direction:column;gap:20px;
    box-shadow:0 24px 64px rgba(0,0,0,.5)}
  .setup-logo{display:flex;align-items:center;gap:12px;margin-bottom:4px}
  .setup-hex{width:36px;height:36px;background:var(--cyan);
    clip-path:polygon(50% 0%,95% 25%,95% 75%,50% 100%,5% 75%,5% 25%);
    display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:800;color:#080a0d;font-family:var(--mono);
    box-shadow:0 0 18px rgba(78,201,201,.5);flex-shrink:0}
  .setup-title{font-size:22px;font-weight:800;color:var(--white)}
  .setup-sub{font-size:13px;color:var(--text2);line-height:1.6}
  .setup-step{display:flex;align-items:flex-start;gap:12px;padding:14px;
    background:var(--bg2);border:1px solid var(--line);border-radius:var(--r)}
  .setup-num{width:22px;height:22px;border-radius:50%;background:var(--bg4);
    display:flex;align-items:center;justify-content:center;font-size:11px;
    font-weight:700;color:var(--muted);flex-shrink:0;margin-top:1px}
  .setup-num.done{background:var(--green);color:#000}
  .setup-num.active{background:var(--cyan);color:#080a0d}
  .setup-step-text{flex:1}
  .setup-step-title{font-size:13px;font-weight:700;color:var(--white);margin-bottom:3px}
  .setup-step-desc{font-size:12px;color:var(--text2);line-height:1.5}
  .setup-log{background:var(--bg0);border:1px solid var(--line);border-radius:var(--r);
    padding:10px 14px;height:120px;overflow-y:auto;font-family:var(--mono);font-size:11px;line-height:1.8}
  .setup-log .info{color:var(--text2)} .setup-log .success{color:var(--green)}
  .setup-log .error{color:var(--red)} .setup-log .warning{color:var(--amber)}
  .setup-log .system{color:var(--cyan)}
  .setup-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:4px}

  /* ── Main IDE ── */
  .ide{display:flex;flex-direction:column;height:100vh;width:100vw}
  .titlebar{display:flex;align-items:center;gap:10px;padding:0 14px;height:44px;
    background:var(--bg1);border-bottom:1px solid var(--line);user-select:none;flex-shrink:0}
  .logo{display:flex;align-items:center;gap:8px;font-weight:800;font-size:15px;letter-spacing:.5px;color:var(--white)}
  .logo-hex{width:26px;height:26px;background:var(--cyan);
    clip-path:polygon(50% 0%,95% 25%,95% 75%,50% 100%,5% 75%,5% 25%);
    display:flex;align-items:center;justify-content:center;font-size:9px;
    font-weight:800;color:#080a0d;font-family:var(--mono);box-shadow:0 0 14px rgba(78,201,201,.45)}
  .pill{display:flex;align-items:center;gap:6px;background:var(--bg3);border:1px solid var(--line);
    border-radius:20px;padding:4px 12px 4px 8px;font-size:11px;font-family:var(--mono);
    color:var(--text2);cursor:pointer;transition:border-color .15s,color .15s}
  .pill:hover{border-color:var(--cyan);color:var(--text)}
  .pill.err{border-color:var(--red);color:var(--red)}
  .pill-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
  .ts{flex:1}
  .cli-badge{font-family:var(--mono);font-size:10px;color:var(--muted)}
  .toolbar{display:flex;align-items:center;gap:4px;padding:6px 12px;height:50px;
    background:var(--bg1);border-bottom:1px solid var(--line);flex-shrink:0}
  .btn{display:flex;align-items:center;gap:6px;padding:6px 14px;border-radius:var(--r);
    border:none;cursor:pointer;font-family:var(--ui);font-size:12px;font-weight:600;
    letter-spacing:.4px;transition:background .15s,transform .1s,box-shadow .15s;white-space:nowrap}
  .btn:active{transform:scale(.96)} .btn:disabled{opacity:.4;cursor:not-allowed}
  .btn.cyan{background:var(--cyan);color:#080a0d;box-shadow:0 0 18px rgba(78,201,201,.25)}
  .btn.cyan:hover:not(:disabled){background:var(--cyan2);box-shadow:0 0 28px rgba(78,201,201,.45)}
  .btn.blue{background:var(--blue);color:#080a0d}
  .btn.blue:hover:not(:disabled){opacity:.9}
  .btn.ghost{background:var(--bg3);color:var(--text);border:1px solid var(--line)}
  .btn.ghost:hover:not(:disabled){background:var(--bg4);border-color:var(--muted)}
  .btn.danger{background:var(--bg3);color:var(--red);border:1px solid var(--line)}
  .btn.danger:hover{background:rgba(224,90,90,.1);border-color:var(--red)}
  .btn svg{width:14px;height:14px;flex-shrink:0}
  .sep{width:1px;height:24px;background:var(--line);margin:0 4px} .tbsp{flex:1}
  .status{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;padding:4px 10px;border-radius:4px}
  .status.idle{color:var(--muted)} .status.busy{color:var(--cyan)}
  .status.ok{color:var(--green)} .status.fail{color:var(--red)}
  .sdot{width:6px;height:6px;border-radius:50%;background:currentColor}
  .status.busy .sdot{animation:pulse 1s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .progress{height:2px;background:var(--bg3);flex-shrink:0;overflow:hidden;position:relative}
  .pfill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--cyan2));transition:width .25s}
  .pshim{position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:shimmer 1.1s infinite}
  @keyframes shimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
  .main{display:flex;flex:1;overflow:hidden}
  .sidebar{width:210px;flex-shrink:0;background:var(--bg1);border-right:1px solid var(--line);
    display:flex;flex-direction:column;overflow-y:auto}
  .sb-sec{padding:6px 0;border-bottom:1px solid var(--line)}
  .sb-hdr{padding:8px 14px;font-size:10px;font-weight:700;letter-spacing:1.2px;
    text-transform:uppercase;color:var(--muted)}
  .sb-item{display:flex;align-items:center;gap:9px;padding:7px 14px;font-size:12px;
    font-family:var(--mono);color:var(--text2);cursor:pointer;
    transition:background .1s,color .1s;border-left:2px solid transparent}
  .sb-item:hover{background:var(--bg2);color:var(--text)}
  .sb-item.active{background:var(--bg2);color:var(--cyan);border-left-color:var(--cyan)}
  .sb-item svg{width:13px;height:13px;flex-shrink:0}
  .editor-area{flex:1;display:flex;flex-direction:column;min-width:0}
  .tabs{display:flex;align-items:center;background:var(--bg1);border-bottom:1px solid var(--line);
    height:36px;overflow-x:auto;flex-shrink:0}
  .tab{display:flex;align-items:center;gap:8px;padding:0 16px;height:100%;font-size:12px;
    font-family:var(--mono);color:var(--text2);cursor:pointer;white-space:nowrap;flex-shrink:0;
    border-right:1px solid var(--line);border-bottom:2px solid transparent;transition:color .1s,border-color .1s}
  .tab:hover{color:var(--text);background:var(--bg2)}
  .tab.active{color:var(--white);border-bottom-color:var(--cyan);background:var(--bg0)}
  .tab-dot{width:6px;height:6px;border-radius:50%;background:var(--amber);flex-shrink:0}
  .tab-x{width:14px;height:14px;border-radius:3px;display:flex;align-items:center;
    justify-content:center;opacity:0;transition:opacity .15s;font-size:10px}
  .tab:hover .tab-x{opacity:1} .tab-x:hover{background:var(--bg4)}
  .tab-add{padding:0 14px;height:100%;display:flex;align-items:center;
    color:var(--muted);cursor:pointer;font-size:16px;transition:color .15s}
  .tab-add:hover{color:var(--cyan)}
  .code-wrap{flex:1;display:flex;overflow:hidden;position:relative;background:var(--bg0)}
  .line-nums{width:52px;padding:16px 8px 16px 0;background:var(--bg0);text-align:right;
    font-family:var(--mono);font-size:13px;line-height:1.7;color:var(--bg4);
    user-select:none;flex-shrink:0;overflow:hidden}
  .code-layer{position:relative;flex:1;overflow:hidden}
  .code-hl{position:absolute;inset:0;padding:16px;font-family:var(--mono);font-size:13px;
    line-height:1.7;white-space:pre;overflow:auto;pointer-events:none;color:var(--text);tab-size:2;z-index:1}
  .code-ta{position:absolute;inset:0;padding:16px;background:transparent;
    color:transparent;caret-color:var(--cyan);font-family:var(--mono);font-size:13px;
    line-height:1.7;white-space:pre;overflow:auto;tab-size:2;resize:none;border:none;outline:none;z-index:2}
  .rpanel{width:260px;flex-shrink:0;background:var(--bg1);border-left:1px solid var(--line);display:flex;flex-direction:column}
  .rp-tabs{display:flex;border-bottom:1px solid var(--line);flex-shrink:0}
  .rp-tab{flex:1;padding:9px 0;text-align:center;font-size:11px;font-weight:600;
    letter-spacing:.4px;color:var(--muted);cursor:pointer;
    border-bottom:2px solid transparent;transition:color .15s,border-color .15s}
  .rp-tab.active{color:var(--cyan);border-bottom-color:var(--cyan)}
  .rp-body{flex:1;overflow-y:auto;padding:10px}
  .sinput{width:100%;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);
    padding:7px 10px;font-family:var(--mono);font-size:12px;color:var(--text);outline:none;
    margin-bottom:8px;transition:border-color .15s}
  .sinput:focus{border-color:var(--cyan)}
  .card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);
    padding:10px;margin-bottom:7px;transition:border-color .15s}
  .card:hover{border-color:var(--muted)}
  .card-name{font-size:12px;font-weight:700;color:var(--white);margin-bottom:3px}
  .card-sub{font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:4px}
  .card-desc{font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:8px}
  .card-row{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted);font-family:var(--mono)}
  .cbtn{margin-left:auto;background:none;border:1px solid var(--cyan);border-radius:4px;
    padding:3px 10px;font-size:10px;font-weight:600;color:var(--cyan);cursor:pointer;
    transition:background .15s,color .15s;font-family:var(--ui)}
  .cbtn:hover:not(:disabled){background:var(--cyan);color:#080a0d}
  .cbtn.inst{border-color:var(--green);color:var(--green)}
  .cbtn.inst:hover:not(:disabled){background:var(--green);color:#000}
  .cbtn:disabled{opacity:.4;cursor:wait}
  .cbtn-b{margin-left:auto;background:none;border:1px solid var(--blue);border-radius:4px;
    padding:3px 10px;font-size:10px;font-weight:600;color:var(--blue);cursor:pointer;
    transition:background .15s,color .15s;font-family:var(--ui)}
  .cbtn-b:hover:not(:disabled){background:var(--blue);color:#000}
  .cbtn-b.inst{border-color:var(--green);color:var(--green)}
  .cbtn-b.inst:hover:not(:disabled){background:var(--green);color:#000}
  .cbtn-b:disabled{opacity:.4;cursor:wait}
  .empty{color:var(--muted);font-size:12px;font-family:var(--mono);text-align:center;padding:20px 0}
  .irow{display:flex;justify-content:space-between;border-bottom:1px solid var(--line);
    padding:6px 0;font-size:11px;font-family:var(--mono)}
  .ik{color:var(--muted)} .iv{color:var(--text)}
  .console{height:190px;flex-shrink:0;background:var(--bg1);border-top:1px solid var(--line);display:flex;flex-direction:column}
  .con-hdr{display:flex;align-items:center;gap:10px;padding:6px 12px;border-bottom:1px solid var(--line);flex-shrink:0}
  .con-title{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--muted)}
  .con-clear{margin-left:auto;background:none;border:none;cursor:pointer;font-size:10px;
    color:var(--muted);font-family:var(--ui);transition:color .15s}
  .con-clear:hover{color:var(--red)}
  .con-body{flex:1;overflow-y:auto;padding:8px 14px;font-family:var(--mono);font-size:12px;line-height:1.8}
  .lg{display:flex;gap:10px}
  .lgt{color:var(--muted);flex-shrink:0;font-size:11px}
  .lgm.info{color:var(--text2)} .lgm.success{color:var(--green)}
  .lgm.error{color:var(--red)} .lgm.warning{color:var(--amber)} .lgm.system{color:var(--cyan)}
  .overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.75);
    display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
  .ser-panel{width:660px;height:500px;background:var(--bg1);border:1px solid var(--line);
    border-radius:10px;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,.6);overflow:hidden}
  .ser-hdr{display:flex;align-items:center;gap:10px;padding:12px 16px;
    border-bottom:1px solid var(--line);background:var(--bg2);flex-shrink:0}
  .ser-title{font-weight:700;font-size:13px;color:var(--white);flex:1}
  .ser-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
  .ser-dot.open{background:var(--green);box-shadow:0 0 6px var(--green)}
  .ser-dot.closed{background:var(--muted)}
  .baud-sel{background:var(--bg3);border:1px solid var(--line);border-radius:4px;
    padding:4px 8px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none}
  .ser-x{background:none;border:none;cursor:pointer;color:var(--muted);font-size:18px;
    line-height:1;transition:color .15s}
  .ser-x:hover{color:var(--red)}
  .ser-body{flex:1;overflow-y:auto;padding:10px 16px;font-family:var(--mono);font-size:12px;line-height:1.8}
  .sr-in{color:var(--green)} .sr-out{color:var(--blue)} .sr-sys{color:var(--muted)}
  .ser-foot{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--line);background:var(--bg2)}
  .ser-input{flex:1;background:var(--bg3);border:1px solid var(--line);border-radius:var(--r);
    padding:7px 10px;outline:none;font-family:var(--mono);font-size:12px;color:var(--text);
    transition:border-color .15s}
  .ser-input:focus{border-color:var(--green)}
  .ser-send{background:var(--green);border:none;border-radius:var(--r);padding:7px 16px;
    font-size:12px;font-weight:700;color:#000;cursor:pointer;font-family:var(--ui);transition:opacity .15s}
  .ser-send:hover{opacity:.85} .ser-send:disabled{opacity:.4;cursor:not-allowed}
  .drop-ov{position:fixed;inset:0;z-index:100}
  .drop-menu{position:fixed;z-index:101;background:var(--bg2);border:1px solid var(--line);
    border-radius:var(--r);min-width:240px;box-shadow:0 16px 40px rgba(0,0,0,.5);padding:4px}
  .drop-item{padding:8px 12px;font-size:12px;font-family:var(--mono);color:var(--text2);
    cursor:pointer;border-radius:4px;transition:background .1s,color .1s;
    display:flex;align-items:center;gap:8px}
  .drop-item:hover{background:var(--bg4);color:var(--white)}
  .drop-item.sel{color:var(--cyan)}
  .drop-sub{font-size:10px;color:var(--muted);margin-left:auto}
  .c-kw{color:#c678dd} .c-type{color:#61afef} .c-num{color:#d19a66}
  .c-str{color:#98c379} .c-cmt{color:#5c6370;font-style:italic} .c-pre{color:#e06c75}
`;

// ── Syntax highlight ──────────────────────────────────────────────────────────
function highlight(code) {
  const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const KW  = /\b(void|int|float|double|bool|char|byte|unsigned|long|short|const|if|else|for|while|do|return|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|NULL|typedef|struct|enum|class|public|private|protected|new|delete|nullptr|uint8_t|uint16_t|uint32_t|int8_t|int16_t|int32_t|static|volatile|extern)\b/g;
  const TY  = /\b(String|Serial|Wire|SPI|pinMode|digitalWrite|digitalRead|analogWrite|analogRead|delay|millis|micros|setup|loop|map|constrain|abs|min|max|random|randomSeed|attachInterrupt|detachInterrupt|noInterrupts|interrupts)\b/g;
  const NUM = /\b(\d+\.?\d*(?:f|u|l|ul)?)\b/g;
  const STR = /"([^"\\]|\\.)*"/g;
  const CMT = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const PRE = /^(#\w+)/gm;
  const ranges = [];
  const add = (re, cls) => { let m; re.lastIndex = 0; while ((m = re.exec(code)) !== null) ranges.push([m.index, m.index + m[0].length, cls, m[0]]); };
  add(CMT,'c-cmt'); add(STR,'c-str'); add(PRE,'c-pre'); add(KW,'c-kw'); add(TY,'c-type'); add(NUM,'c-num');
  ranges.sort((a, b) => a[0] - b[0]);
  const flat = []; let cur = 0;
  for (const r of ranges) { if (r[0] >= cur) { flat.push(r); cur = r[1]; } }
  let html = '', pos = 0;
  for (const [s, e, cls, raw] of flat) { html += esc(code.slice(pos, s)); html += `<span class="${cls}">${esc(raw)}</span>`; pos = e; }
  html += esc(code.slice(pos));
  return html;
}

const ts = () => new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
const isElectron = typeof window !== 'undefined' && !!window.voidIDE;

const DEFAULT_CODE = `// Void IDE — New Sketch\n\nvoid setup() {\n  pinMode(LED_BUILTIN, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  digitalWrite(LED_BUILTIN, HIGH);\n  Serial.println("ON");\n  delay(500);\n  digitalWrite(LED_BUILTIN, LOW);\n  Serial.println("OFF");\n  delay(500);\n}\n`;

const I = {
  verify:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="2,9 6,13 14,4"/></svg>,
  upload:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="8,12 8,3"/><polyline points="4,7 8,3 12,7"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
  serial:  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="4" width="14" height="8" rx="1.5"/><line x1="4" y1="8" x2="6" y2="8"/><line x1="8" y1="8" x2="10" y2="8"/><circle cx="12" cy="8" r=".8" fill="currentColor"/></svg>,
  stop:    <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>,
  save:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 2h9l3 3v9H2z"/><rect x="5" y="9" width="6" height="5"/><rect x="5" y="2" width="5" height="4"/></svg>,
  open:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 4h5l1.5 2H14v7H2z"/></svg>,
  new:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="1" width="9" height="12" rx="1"/><line x1="11" y1="4" x2="14" y2="4"/><line x1="11" y1="7" x2="14" y2="7"/></svg>,
  refresh: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 8a6 6 0 1 0 1-3.2"/><polyline points="2,2 2,6 6,6"/></svg>,
  file:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 1h7l3 3v11H3z"/><polyline points="10,1 10,4 13,4"/></svg>,
  board:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="10" rx="1"/><line x1="4" y1="3" x2="4" y2="1"/><line x1="7" y1="3" x2="7" y2="1"/><line x1="10" y1="3" x2="10" y2="1"/><line x1="4" y1="13" x2="4" y2="15"/><line x1="7" y1="13" x2="7" y2="15"/><line x1="10" y1="13" x2="10" y2="15"/></svg>,
  lib:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="4" height="14"/><rect x="6" y="1" width="4" height="14"/><path d="M11 1l4 1-2 12-4-1z"/></svg>,
  dl:      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="8,3 8,12"/><polyline points="4,8 8,12 12,8"/><line x1="2" y1="14" x2="14" y2="14"/></svg>,
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onDone }) {
  const [step, setStep]       = useState(0); // 0=idle 1=installing 2=done 3=error
  const [logs, setLogs]       = useState([]);
  const logEnd = useRef(null);

  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  useEffect(() => {
    if (!isElectron) return;
    window.voidIDE.onCLILine(({ text, kind }) =>
      setLogs(prev => [...prev, { text, kind }])
    );
    return () => window.voidIDE.offCLILine?.();
  }, []);

  const handleInstall = async () => {
    setStep(1);
    setLogs([{ text: 'Installing arduino-cli…', kind: 'system' }]);
    const r = await window.voidIDE.installCLI();
    if (r.ok) {
      setStep(2);
      setLogs(prev => [...prev, { text: '✓ arduino-cli installed and ready.', kind: 'success' }]);
    } else {
      setStep(3);
    }
  };

  const stepState = (n) => n < step ? 'done' : n === step ? 'active' : '';

  return (
    <div className="setup">
      <div className="setup-box">
        <div className="setup-logo">
          <div className="setup-hex">{'{}'}</div>
          <div>
            <div className="setup-title">Void IDE</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>First-time setup</div>
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
          arduino-cli was not found on your system. Void IDE will download and install it automatically.
        </div>

        {/* Step 1 */}
        <div className="setup-step">
          <div className={`setup-num ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
            {step > 1 ? '✓' : '1'}
          </div>
          <div className="setup-step-text">
            <div className="setup-step-title">Download arduino-cli</div>
            <div className="setup-step-desc">
              Downloads the official installer from arduino.cc and installs to <code style={{ color: 'var(--cyan)', fontSize: 11 }}>~/.local/bin/arduino-cli</code>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="setup-step">
          <div className={`setup-num ${step >= 2 ? 'done' : ''}`}>
            {step >= 2 ? '✓' : '2'}
          </div>
          <div className="setup-step-text">
            <div className="setup-step-title">Initialize & update platform index</div>
            <div className="setup-step-desc">
              Runs <code style={{ color: 'var(--cyan)', fontSize: 11 }}>arduino-cli config init</code> and <code style={{ color: 'var(--cyan)', fontSize: 11 }}>core update-index</code> so all boards are searchable.
            </div>
          </div>
        </div>

        {/* Log */}
        {logs.length > 0 && (
          <div className="setup-log">
            {logs.map((l, i) => (
              <div key={i} className={l.kind}>{l.text}</div>
            ))}
            <div ref={logEnd} />
          </div>
        )}

        <div className="setup-actions">
          {step === 0 && (
            <button className="btn cyan" onClick={handleInstall}>
              {I.dl} Install arduino-cli
            </button>
          )}
          {step === 1 && (
            <button className="btn ghost" disabled>{I.dl} Installing…</button>
          )}
          {step === 2 && (
            <button className="btn cyan" onClick={onDone}>
              Open Void IDE →
            </button>
          )}
          {step === 3 && (
            <>
              <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)', flex: 1 }}>
                Installation failed. Check your internet connection and try again.
              </div>
              <button className="btn ghost" onClick={handleInstall}>Retry</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main IDE ──────────────────────────────────────────────────────────────────
export default function VoidIDE() {
  const [ready, setReady]     = useState(null); // null=checking, false=needs setup, true=ready
  const [tabs, setTabs]       = useState([{ id: 1, name: 'sketch.ino', code: DEFAULT_CODE, filePath: null, sketchDir: null, dirty: false }]);
  const [activeTab, setActive]= useState(1);
  const [detectedPorts, setDetectedPorts] = useState([]);
  const [board, setBoard]     = useState({ name: 'Arduino Uno', fqbn: 'arduino:avr:uno' });
  const [port, setPort]       = useState('');
  const [showBD, setShowBD]   = useState(false);
  const [showPD, setShowPD]   = useState(false);
  const [busy, setBusy]       = useState(false);
  const [status, setStatus]   = useState({ state: 'idle', text: 'Ready' });
  const [progress, setProgress] = useState(0);
  const [logs, setLogs]       = useState([]);
  const [rpTab, setRpTab]     = useState('boards');
  const [libSearch, setLibSearch]     = useState('');
  const [libResults, setLibResults]   = useState([]);
  const [installedLibs, setInstalledLibs] = useState([]);
  const [libLoading, setLibLoading]   = useState({});
  const [coreSearch, setCoreSearch]   = useState('');
  const [coreResults, setCoreResults] = useState([]);
  const [installedCores, setInstalledCores] = useState([]);
  const [coreLoading, setCoreLoading] = useState({});
  const [cliVer, setCliVer]   = useState('');
  const [showSerial, setShowSerial]   = useState(false);
  const [serialOpen, setSerialOpen]   = useState(false);
  const [baud, setBaud]       = useState('9600');
  const [serialLogs, setSerialLogs]   = useState([]);
  const [serialInput, setSerialInput] = useState('');
  const conEnd  = useRef(null);
  const serEnd  = useRef(null);
  const libTimer  = useRef(null);
  const coreTimer = useRef(null);

  useEffect(() => { conEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { serEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [serialLogs]);

  const addLog = useCallback((text, kind = 'info') => {
    setLogs(prev => [...prev, { time: ts(), text, kind }]);
  }, []);

  // ── Check CLI on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isElectron) { setReady(true); return; }
    window.voidIDE.version().then(r => {
      if (r.ok) {
        setReady(true);
        setCliVer(r.version.split('\n')[0]);
      } else {
        setReady(false); // show setup screen
      }
    });
  }, []);

  // ── Init after ready ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !isElectron) return;

    window.voidIDE.onCLILine(({ text, kind }) => addLog(text, kind));
    window.voidIDE.version().then(r => {
      if (r.ok) { setCliVer(r.version.split('\n')[0]); addLog(r.version.split('\n')[0], 'system'); }
    });

    refreshPorts();

    // Load installed libs and cores
    window.voidIDE.libList().then(r => {
      if (r.ok) setInstalledLibs(r.installed.map(l => l.library?.name || l.name).filter(Boolean));
    });
    window.voidIDE.coreList().then(r => {
      if (r.ok) setInstalledCores(r.platforms.map(p => p.id || p.ID).filter(Boolean));
    });

    // Serial listeners
    window.voidIDE.onSerialData(({ line }) => setSerialLogs(prev => [...prev, { text: line, type: 'in' }]));
    window.voidIDE.onSerialError(({ line }) => setSerialLogs(prev => [...prev, { text: line, type: 'sys' }]));
    window.voidIDE.onSerialClosed(() => {
      setSerialOpen(false);
      setSerialLogs(prev => [...prev, { text: '--- port closed ---', type: 'sys' }]);
    });

    return () => { window.voidIDE.offCLILine?.(); window.voidIDE.offSerial?.(); };
  }, [ready]);

  const refreshPorts = useCallback(async () => {
    if (!isElectron) return;
    const r = await window.voidIDE.serialList();
    if (r.ok && r.ports.length) {
      setDetectedPorts(r.ports);
      setPort(prev => prev || r.ports[0]);
      addLog(`Detected ports: ${r.ports.join(', ')}`, 'success');
    } else {
      setDetectedPorts([]);
      addLog('No ports detected. Plug in your board and click Refresh.', 'warning');
    }
  }, [addLog]);

  const activeCode  = tabs.find(t => t.id === activeTab)?.code ?? '';
  const currentTab  = tabs.find(t => t.id === activeTab);
  const updateCode  = val => setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, code: val, dirty: true } : t));

  const addNewTab = () => {
    const id = Date.now();
    setTabs(prev => [...prev, { id, name: `sketch${prev.length + 1}.ino`, code: DEFAULT_CODE, filePath: null, sketchDir: null, dirty: false }]);
    setActive(id);
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const remaining = tabs.filter(t => t.id !== id);
    setTabs(remaining);
    if (activeTab === id) setActive(remaining[0].id);
  };

  // ── Save / Open ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!isElectron) return;
    const tab = tabs.find(t => t.id === activeTab);
    if (tab.filePath) {
      const r = await window.voidIDE.saveCurrent({ filePath: tab.filePath, content: tab.code });
      if (r.ok) { setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, dirty: false } : t)); addLog(`Saved: ${tab.filePath}`, 'success'); }
    } else {
      const r = await window.voidIDE.saveAs({ content: tab.code });
      if (r.ok && !r.canceled) {
        setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, filePath: r.filePath, sketchDir: r.sketchDir, name: r.filePath.split('/').pop(), dirty: false } : t));
        addLog(`Saved: ${r.filePath}`, 'success');
      }
    }
  };

  const handleOpen = async () => {
    if (!isElectron) return;
    const r = await window.voidIDE.openFile();
    if (!r.ok || r.canceled) return;
    const id = Date.now();
    setTabs(prev => [...prev, { id, name: r.filePath.split('/').pop(), code: r.content, filePath: r.filePath, sketchDir: r.sketchDir, dirty: false }]);
    setActive(id);
    addLog(`Opened: ${r.filePath}`, 'success');
  };

  // ── Ensure sketch saved before compile/upload ─────────────────────────────
  const ensureSaved = async (tab) => {
    if (!tab.sketchDir) {
      const r = await window.voidIDE.saveAs({ content: tab.code });
      if (!r.ok || r.canceled) return null;
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, filePath: r.filePath, sketchDir: r.sketchDir, name: r.filePath.split('/').pop(), dirty: false } : t));
      return r.sketchDir;
    }
    if (tab.dirty) {
      await window.voidIDE.saveCurrent({ filePath: tab.filePath, content: tab.code });
      setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, dirty: false } : t));
    }
    return tab.sketchDir;
  };

  // ── Compile ───────────────────────────────────────────────────────────────
  const handleCompile = useCallback(async () => {
    if (busy || !isElectron) return;
    setBusy(true); setProgress(10); setStatus({ state: 'busy', text: 'Compiling…' });
    const sketchDir = await ensureSaved(tabs.find(t => t.id === activeTab));
    if (!sketchDir) { setBusy(false); setProgress(0); setStatus({ state: 'idle', text: 'Ready' }); return; }
    setProgress(30);
    const r = await window.voidIDE.compile({ fqbn: board.fqbn, sketchDir });
    setProgress(100);
    setStatus({ state: r.ok ? 'ok' : 'fail', text: r.ok ? 'Compiled OK' : 'Compile failed' });
    if (r.ok) addLog('✓ Compilation successful', 'success');
    setBusy(false);
    setTimeout(() => setProgress(0), 800);
  }, [busy, tabs, activeTab, board, addLog]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (busy || !isElectron) return;
    if (!port) { addLog('No port selected. Plug in your board and click Refresh.', 'error'); return; }
    setBusy(true); setProgress(10); setStatus({ state: 'busy', text: 'Uploading…' });
    const sketchDir = await ensureSaved(tabs.find(t => t.id === activeTab));
    if (!sketchDir) { setBusy(false); setProgress(0); setStatus({ state: 'idle', text: 'Ready' }); return; }
    setProgress(40);
    const r = await window.voidIDE.upload({ fqbn: board.fqbn, port, sketchDir });
    setProgress(100);
    setStatus({ state: r.ok ? 'ok' : 'fail', text: r.ok ? 'Upload OK' : 'Upload failed' });
    if (r.ok) addLog(`✓ Upload complete → ${port}`, 'success');
    setBusy(false);
    setTimeout(() => setProgress(0), 800);
  }, [busy, tabs, activeTab, board, port, addLog]);

  // ── Library search (debounced) ────────────────────────────────────────────
  const handleLibSearch = q => {
    setLibSearch(q);
    clearTimeout(libTimer.current);
    if (q.length < 2) { setLibResults([]); return; }
    libTimer.current = setTimeout(async () => {
      const r = await window.voidIDE.libSearch(q);
      if (r.ok) setLibResults(r.libraries);
    }, 400);
  };

  const handleLibInstall = async name => {
    setLibLoading(p => ({ ...p, [name]: true }));
    const r = await window.voidIDE.libInstall(name);
    if (r.ok) { setInstalledLibs(p => [...p, name]); addLog(`✓ Installed: ${name}`, 'success'); }
    setLibLoading(p => ({ ...p, [name]: false }));
  };

  const handleLibUninstall = async name => {
    setLibLoading(p => ({ ...p, [name]: true }));
    const r = await window.voidIDE.libUninstall(name);
    if (r.ok) { setInstalledLibs(p => p.filter(l => l !== name)); addLog(`Uninstalled: ${name}`, 'info'); }
    setLibLoading(p => ({ ...p, [name]: false }));
  };

  // ── Core search (debounced, real index) ───────────────────────────────────
  const handleCoreSearch = q => {
    setCoreSearch(q);
    clearTimeout(coreTimer.current);
    if (q.length < 2) { setCoreResults([]); return; }
    coreTimer.current = setTimeout(async () => {
      const r = await window.voidIDE.coreSearch(q);
      if (r.ok) setCoreResults(r.platforms);
    }, 400);
  };

  const handleCoreInstall = async id => {
    setCoreLoading(p => ({ ...p, [id]: true }));
    addLog(`Installing core: ${id}`, 'system');
    const r = await window.voidIDE.coreInstall(id);
    if (r.ok) { setInstalledCores(p => [...p, id]); addLog(`✓ Core installed: ${id}`, 'success'); }
    setCoreLoading(p => ({ ...p, [id]: false }));
  };

  const handleCoreUninstall = async id => {
    setCoreLoading(p => ({ ...p, [id]: true }));
    const r = await window.voidIDE.coreUninstall(id);
    if (r.ok) { setInstalledCores(p => p.filter(c => c !== id)); addLog(`Uninstalled core: ${id}`, 'info'); }
    setCoreLoading(p => ({ ...p, [id]: false }));
  };

  // ── Serial ────────────────────────────────────────────────────────────────
  const handleSerialOpen = async () => {
    if (!port) { addLog('No port selected.', 'error'); return; }
    const r = await window.voidIDE.serialOpen({ port, baud });
    if (r.ok) { setSerialOpen(true); setSerialLogs(p => [...p, { text: `--- opened ${port} @ ${baud} baud ---`, type: 'sys' }]); }
    else setSerialLogs(p => [...p, { text: `Failed: ${r.error || 'unknown error'}`, type: 'sys' }]);
  };

  const handleSerialClose = async () => { await window.voidIDE.serialClose(); setSerialOpen(false); };

  const handleSerialSend = async () => {
    if (!serialInput.trim() || !serialOpen) return;
    await window.voidIDE.serialWrite(serialInput);
    setSerialLogs(p => [...p, { text: `> ${serialInput}`, type: 'out' }]);
    setSerialInput('');
  };

  const lineCount = activeCode.split('\n').length;
  const lineNums  = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  // ── Render: checking ──────────────────────────────────────────────────────
  if (ready === null) {
    return (
      <>
        <style>{FONT_LINK}{CSS}</style>
        <div className="setup">
          <div style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13 }}>Checking arduino-cli…</div>
        </div>
      </>
    );
  }

  // ── Render: setup screen ──────────────────────────────────────────────────
  if (!ready) {
    return (
      <>
        <style>{FONT_LINK}{CSS}</style>
        <SetupScreen onDone={() => setReady(true)} />
      </>
    );
  }

  // ── Render: full IDE ──────────────────────────────────────────────────────
  return (
    <>
      <style>{FONT_LINK}{CSS}</style>
      <div className="ide">

        {/* Title bar */}
        <div className="titlebar">
          <div className="logo"><div className="logo-hex">{'{}'}</div>VOID IDE</div>
          <div style={{ width: 1, height: 20, background: 'var(--line)', margin: '0 4px' }} />
          <div className="pill" onClick={() => { setShowBD(true); setShowPD(false); }}>
            <span className="pill-dot" style={{ background: 'var(--green)' }} />
            {board.name}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg>
          </div>
          <div className={`pill ${!port ? 'err' : ''}`} onClick={() => { setShowPD(true); setShowBD(false); }}>
            <span className="pill-dot" style={{ background: port ? 'var(--blue)' : 'var(--red)' }} />
            {port || 'No port'}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,4 5,7 8,4" /></svg>
          </div>
          <button className="btn ghost" style={{ padding: '4px 8px' }} onClick={refreshPorts} title="Refresh ports">{I.refresh}</button>
          <div className="ts" />
          <span className="cli-badge">{cliVer || (isElectron ? 'loading…' : 'browser mode')}</span>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <button className="btn ghost" onClick={addNewTab}>{I.new} New</button>
          <button className="btn ghost" onClick={handleOpen}>{I.open} Open</button>
          <button className="btn ghost" onClick={handleSave}>{I.save}{currentTab?.dirty ? ' Save *' : ' Save'}</button>
          <div className="sep" />
          <button className="btn cyan" onClick={handleCompile} disabled={busy}>{I.verify} Verify</button>
          <button className="btn blue" onClick={handleUpload} disabled={busy}>{I.upload} Upload</button>
          {busy && <button className="btn danger" onClick={() => { setBusy(false); setProgress(0); setStatus({ state: 'idle', text: 'Stopped' }); }}>{I.stop} Stop</button>}
          <div className="sep" />
          <button className="btn ghost" onClick={() => setShowSerial(true)}>{I.serial} Serial Monitor</button>
          <div className="tbsp" />
          <div className={`status ${status.state}`}><span className="sdot" />{status.text}</div>
        </div>

        {/* Progress */}
        <div className="progress">
          {busy && <span className="pshim" />}
          <div className="pfill" style={{ width: `${progress}%` }} />
        </div>

        <div className="main">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sb-sec">
              <div className="sb-hdr">Open Files</div>
              {tabs.map(t => (
                <div key={t.id} className={`sb-item ${t.id === activeTab ? 'active' : ''}`} onClick={() => setActive(t.id)}>
                  {I.file} {t.name}{t.dirty ? ' *' : ''}
                  <span style={{ marginLeft: 'auto', opacity: .6, fontSize: 10 }} onClick={e => closeTab(t.id, e)}>✕</span>
                </div>
              ))}
            </div>
            <div className="sb-sec">
              <div className="sb-hdr">Manager</div>
              <div className={`sb-item ${rpTab === 'libs' ? 'active' : ''}`}    onClick={() => setRpTab('libs')}>{I.lib}   Library Manager</div>
              <div className={`sb-item ${rpTab === 'boards' ? 'active' : ''}`}  onClick={() => setRpTab('boards')}>{I.board} Board Manager</div>
              <div className={`sb-item ${rpTab === 'info' ? 'active' : ''}`}    onClick={() => setRpTab('info')}>{I.board} System Info</div>
            </div>
            <div className="sb-sec">
              <div className="sb-hdr">Installed Libs</div>
              {installedLibs.length === 0
                ? <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>none</div>
                : installedLibs.slice(0, 20).map(l => (
                  <div key={l} className="sb-item" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--green)', fontSize: 8 }}>●</span>{l}
                  </div>
                ))
              }
            </div>
          </div>

          {/* Editor */}
          <div className="editor-area">
            <div className="tabs">
              {tabs.map(t => (
                <div key={t.id} className={`tab ${t.id === activeTab ? 'active' : ''}`} onClick={() => setActive(t.id)}>
                  {t.dirty && <span className="tab-dot" />}{t.name}
                  <span className="tab-x" onClick={e => closeTab(t.id, e)}>✕</span>
                </div>
              ))}
              <div className="tab-add" onClick={addNewTab}>+</div>
            </div>
            <div className="code-wrap">
              <div className="line-nums">{lineNums}</div>
              <div className="code-layer">
                <pre className="code-hl" dangerouslySetInnerHTML={{ __html: highlight(activeCode) }} />
                <textarea className="code-ta" value={activeCode} onChange={e => updateCode(e.target.value)} spellCheck={false}
                  onKeyDown={e => {
                    if (e.key === 'Tab') { e.preventDefault(); const s = e.target.selectionStart, en = e.target.selectionEnd; updateCode(activeCode.slice(0, s) + '  ' + activeCode.slice(en)); setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s + 2; }, 0); }
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
                  }}
                />
              </div>
            </div>
            <div className="console">
              <div className="con-hdr">
                <span className="con-title">Output</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)' }}>arduino-cli</span>
                <button className="con-clear" onClick={() => setLogs([])}>Clear</button>
              </div>
              <div className="con-body">
                {logs.map((l, i) => (
                  <div className="lg" key={i}><span className="lgt">{l.time}</span><span className={`lgm ${l.kind}`}>{l.text}</span></div>
                ))}
                <div ref={conEnd} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="rpanel">
            <div className="rp-tabs">
              {['boards', 'libs', 'info'].map(t => (
                <div key={t} className={`rp-tab ${rpTab === t ? 'active' : ''}`} onClick={() => setRpTab(t)}>
                  {t === 'libs' ? 'Libraries' : t === 'boards' ? 'Boards' : 'Info'}
                </div>
              ))}
            </div>
            <div className="rp-body">

              {/* ── Board Manager ── */}
              {rpTab === 'boards' && (
                <>
                  <input className="sinput" placeholder="Search boards (e.g. esp32, avr, samd)…"
                    value={coreSearch} onChange={e => handleCoreSearch(e.target.value)} />

                  {coreSearch.length < 2 && (
                    <>
                      <button className="btn ghost" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}
                        onClick={async () => {
                          addLog('Updating platform index…', 'system');
                          await window.voidIDE.updateIndex();
                          addLog('✓ Index updated', 'success');
                        }}>
                        {I.refresh} Update Index
                      </button>
                      {installedCores.length > 0 && (
                        <>
                          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 6 }}>INSTALLED</div>
                          {installedCores.map(id => (
                            <div className="card" key={id}>
                              <div className="card-name" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{id}</div>
                              <div className="card-row">
                                <span style={{ color: 'var(--green)' }}>✓ installed</span>
                                <button className="cbtn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}
                                  disabled={coreLoading[id]} onClick={() => handleCoreUninstall(id)}>
                                  {coreLoading[id] ? '…' : 'Remove'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                      {installedCores.length === 0 && (
                        <div className="empty">No cores installed.<br />Search to install one.</div>
                      )}
                    </>
                  )}

                  {coreSearch.length >= 2 && coreResults.length === 0 && <div className="empty">Searching…</div>}

                  {coreSearch.length >= 2 && coreResults.map(p => {
                    const id   = p.id   || p.ID   || '';
                    const name = p.name || p.Name || id;
                    const ver  = p.latest?.version || p.version || '';
                    const maintainer = p.latest?.maintainer || p.maintainer || '';
                    const inst = installedCores.includes(id);
                    return (
                      <div className="card" key={id}>
                        <div className="card-name">{name}</div>
                        <div className="card-sub">{id}</div>
                        {maintainer && <div className="card-desc" style={{ marginBottom: 4 }}>by {maintainer}</div>}
                        <div className="card-row">
                          {ver && <span>v{ver}</span>}
                          <button className={`cbtn-b ${inst ? 'inst' : ''}`}
                            disabled={coreLoading[id]}
                            onClick={() => inst ? handleCoreUninstall(id) : handleCoreInstall(id)}>
                            {coreLoading[id] ? '…' : inst ? '✓ Installed' : 'Install'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── Library Manager ── */}
              {rpTab === 'libs' && (
                <>
                  <input className="sinput" placeholder="Search libraries…"
                    value={libSearch} onChange={e => handleLibSearch(e.target.value)} />
                  {libSearch.length < 2 && installedLibs.length > 0 && (
                    <>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 6 }}>INSTALLED</div>
                      {installedLibs.map(name => (
                        <div className="card" key={name}>
                          <div className="card-name">{name}</div>
                          <div className="card-row">
                            <button className="cbtn inst" onClick={() => handleLibUninstall(name)} disabled={libLoading[name]}>
                              {libLoading[name] ? '…' : '✓ Installed'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  {libSearch.length < 2 && installedLibs.length === 0 && (
                    <div className="empty">No libraries installed.<br />Search to install one.</div>
                  )}
                  {libSearch.length >= 2 && libResults.length === 0 && <div className="empty">Searching…</div>}
                  {libResults.map(l => {
                    const name = l.name || l.Name;
                    const ver  = l.latest?.version || l.version || '';
                    const desc = l.latest?.sentence || l.sentence || '';
                    const inst = installedLibs.includes(name);
                    return (
                      <div className="card" key={name}>
                        <div className="card-name">{name}</div>
                        {desc && <div className="card-desc">{desc}</div>}
                        <div className="card-row">
                          {ver && <span>v{ver}</span>}
                          <button className={`cbtn ${inst ? 'inst' : ''}`} disabled={libLoading[name]}
                            onClick={() => inst ? handleLibUninstall(name) : handleLibInstall(name)}>
                            {libLoading[name] ? '…' : inst ? '✓ Installed' : 'Install'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── System Info ── */}
              {rpTab === 'info' && (
                <>
                  <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: 10, fontSize: 12 }}>System Info</div>
                  {[
                    ['IDE', 'Void IDE v1.0.0'],
                    ['CLI', cliVer || 'not found'],
                    ['Board', board.name],
                    ['FQBN', board.fqbn],
                    ['Port', port || 'none'],
                    ['Baud', baud],
                    ['Electron', isElectron ? 'yes' : 'no'],
                  ].map(([k, v]) => (
                    <div className="irow" key={k}><span className="ik">{k}</span><span className="iv" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{v}</span></div>
                  ))}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: 6 }}>DETECTED PORTS</div>
                    {detectedPorts.length === 0
                      ? <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>none</div>
                      : detectedPorts.map(p => <div key={p} style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--blue)', padding: '3px 0' }}>{p}</div>)
                    }
                  </div>
                  <button className="btn ghost" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }} onClick={refreshPorts}>{I.refresh} Refresh Ports</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Board dropdown */}
      {showBD && (
        <><div className="drop-ov" onClick={() => setShowBD(false)} />
          <div className="drop-menu" style={{ top: 48, left: 180 }}>
            {[
              { name: 'Arduino Uno',        fqbn: 'arduino:avr:uno' },
              { name: 'Arduino Nano',       fqbn: 'arduino:avr:nano' },
              { name: 'Arduino Mega 2560',  fqbn: 'arduino:avr:mega' },
              { name: 'Arduino Leonardo',   fqbn: 'arduino:avr:leonardo' },
              { name: 'Arduino Micro',      fqbn: 'arduino:avr:micro' },
              { name: 'Arduino Pro Mini',   fqbn: 'arduino:avr:pro' },
              { name: 'ESP32 Dev Module',   fqbn: 'esp32:esp32:esp32' },
              { name: 'ESP32-S3',           fqbn: 'esp32:esp32:esp32s3' },
              { name: 'ESP8266 NodeMCU',    fqbn: 'esp8266:esp8266:nodemcuv2' },
              { name: 'Raspberry Pi Pico',  fqbn: 'rp2040:rp2040:rpipico' },
            ].map(b => (
              <div key={b.fqbn} className={`drop-item ${b.fqbn === board.fqbn ? 'sel' : ''}`}
                onClick={() => { setBoard(b); setShowBD(false); addLog(`Board → ${b.name}`, 'system'); }}>
                {b.name}<span className="drop-sub">{b.fqbn}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Port dropdown */}
      {showPD && (
        <><div className="drop-ov" onClick={() => setShowPD(false)} />
          <div className="drop-menu" style={{ top: 48, left: 410 }}>
            {detectedPorts.length === 0
              ? <div className="drop-item" style={{ color: 'var(--muted)' }}>No ports — plug in board then Refresh</div>
              : detectedPorts.map(p => (
                <div key={p} className={`drop-item ${p === port ? 'sel' : ''}`}
                  onClick={() => { setPort(p); setShowPD(false); addLog(`Port → ${p}`, 'system'); }}>
                  {p}
                </div>
              ))
            }
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>
              <div className="drop-item" onClick={() => { refreshPorts(); setShowPD(false); }}>{I.refresh} Refresh ports</div>
            </div>
          </div>
        </>
      )}

      {/* Serial Monitor */}
      {showSerial && (
        <div className="overlay" onClick={e => { if (e.target === e.currentTarget) setShowSerial(false); }}>
          <div className="ser-panel">
            <div className="ser-hdr">
              <span className={`ser-dot ${serialOpen ? 'open' : 'closed'}`} />
              <span className="ser-title">Serial Monitor — {port || 'no port'}</span>
              <select className="baud-sel" value={baud} onChange={e => setBaud(e.target.value)}>
                {['300', '1200', '2400', '4800', '9600', '19200', '38400', '57600', '115200'].map(b => (
                  <option key={b} value={b}>{b} baud</option>
                ))}
              </select>
              {!serialOpen
                ? <button className="btn cyan"  style={{ padding: '5px 12px', fontSize: 11 }} onClick={handleSerialOpen}>Connect</button>
                : <button className="btn danger" style={{ padding: '5px 12px', fontSize: 11 }} onClick={handleSerialClose}>Disconnect</button>
              }
              <button className="ser-x" onClick={() => setShowSerial(false)}>✕</button>
            </div>
            <div className="ser-body">
              {serialLogs.map((l, i) => (
                <div key={i} className={l.type === 'in' ? 'sr-in' : l.type === 'out' ? 'sr-out' : 'sr-sys'}>{l.text}</div>
              ))}
              <div ref={serEnd} />
            </div>
            <div className="ser-foot">
              <button className="btn ghost" style={{ padding: '7px 10px' }} onClick={() => setSerialLogs([])}>Clear</button>
              <input className="ser-input" placeholder="Send to device…" value={serialInput}
                onChange={e => setSerialInput(e.target.value)} disabled={!serialOpen}
                onKeyDown={e => e.key === 'Enter' && handleSerialSend()} />
              <button className="ser-send" onClick={handleSerialSend} disabled={!serialOpen}>Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
