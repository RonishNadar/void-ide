import React, { useState, useRef, useEffect, useCallback } from "react";

const FONT_LINK = `@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;600;700;800&display=swap');`;

const CSS = `
  :root {
    --bg0:#080a0d;--bg1:#0e1117;--bg2:#141820;--bg3:#1c2130;--bg4:#242b3d;
    --line:#1e2638;--cyan:#4ec9c9;--cyan2:#7ee8e8;--green:#4ec994;
    --red:#e05a5a;--blue:#5ab4e0;--amber:#f0c040;
    --muted:#4a5570;--text:#c0c8d8;--text2:#7a8599;--white:#eef0f5;
    --r:6px;--mono:'JetBrains Mono',monospace;--ui:'Syne',sans-serif;
  }
  .light {
    --bg0:#f5f6fa;--bg1:#ffffff;--bg2:#eef0f5;--bg3:#e4e7f0;--bg4:#d0d4e0;
    --line:#d0d4e0;--cyan:#0891b2;--cyan2:#0e7490;--green:#059669;
    --red:#dc2626;--blue:#2563eb;--amber:#d97706;
    --muted:#9ca3af;--text:#1e293b;--text2:#64748b;--white:#0f172a;
  }
  .light .code-ta { caret-color: var(--cyan); }
  .theme-btn{background:none;border:1px solid var(--line);border-radius:20px;
    padding:4px 10px;cursor:pointer;font-size:11px;color:var(--text2);
    font-family:var(--ui);transition:border-color .15s,color .15s;display:flex;align-items:center;gap:5px}
  .theme-btn:hover{border-color:var(--cyan);color:var(--text)}
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
  .setup-hex{width:36px;height:36px;flex-shrink:0}
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
  .code-layer{position:relative;flex:1;overflow:hidden;isolation:isolate}
  .code-hl{position:absolute;top:0;left:0;padding:16px;font-family:var(--mono);font-size:13px;
    line-height:22px;white-space:pre;overflow:visible;pointer-events:none;color:var(--text);tab-size:2;z-index:1;min-width:100%}
  .code-ta{position:absolute;inset:0;padding:16px;background:transparent;
    color:transparent;caret-color:var(--cyan);font-family:var(--mono);font-size:13px;
    line-height:22px;white-space:pre;overflow:auto;tab-size:2;resize:none;border:none;outline:none;z-index:2}
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
  .light .c-kw{color:#7c3aed} .light .c-type{color:#1d4ed8} .light .c-num{color:#b45309}
  .light .c-str{color:#15803d} .light .c-cmt{color:#6b7280} .light .c-pre{color:#b91c1c}
  /* ── Examples browser ── */
  .ex-tree{font-family:var(--mono);font-size:12px}
  .ex-lib{margin-bottom:4px}
  .ex-lib-hdr{display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:pointer;
    border-radius:4px;color:var(--text2);font-weight:600;transition:background .1s}
  .ex-lib-hdr:hover{background:var(--bg3);color:var(--text)}
  .ex-lib-hdr.open{color:var(--cyan)}
  .ex-arrow{font-size:9px;transition:transform .15s;display:inline-block}
  .ex-arrow.open{transform:rotate(90deg)}
  .ex-item{padding:5px 8px 5px 26px;cursor:pointer;border-radius:4px;
    color:var(--text2);transition:background .1s,color .1s;display:flex;align-items:center;gap:6px}
  .ex-item:hover{background:var(--bg3);color:var(--cyan)}
  .new-file-row{display:flex;gap:6px;margin-bottom:8px}
  .new-file-input{flex:1;background:var(--bg2);border:1px solid var(--line);border-radius:var(--r);
    padding:5px 8px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none}
  .new-file-input:focus{border-color:var(--cyan)}

  /* ── Error / warning gutters ── */
  .gutter-wrap{position:relative}
  .err-gutter{position:absolute;right:0;top:0;width:14px}
  .err-mark{position:relative;width:7px;height:7px;border-radius:50%;cursor:help;
    display:inline-block;flex-shrink:0;transition:transform .1s}
  .err-mark:hover{transform:scale(1.4)}
  .err-mark.error{background:var(--red);box-shadow:0 0 4px var(--red)}
  .err-mark.warning{background:var(--amber);box-shadow:0 0 4px var(--amber)}
  .err-tooltip{position:fixed;z-index:300;background:var(--bg3);border:1px solid var(--red);
    border-radius:4px;padding:5px 10px;font-family:var(--mono);font-size:11px;
    color:var(--text);max-width:380px;pointer-events:none;line-height:1.5;
    box-shadow:0 8px 24px rgba(0,0,0,.5)}
  .err-tooltip.warning{border-color:var(--amber)}

  /* ── Error underlines in highlight layer ── */
  .err-line{background:rgba(224,90,90,.08);border-bottom:1px solid var(--red)}
  .warn-line{background:rgba(240,192,64,.05);border-bottom:1px solid var(--amber)}
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

const DEFAULT_CODE = `void setup() {\n  \n}\n\nvoid loop() {\n  \n}\n`;

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
          <svg className="setup-hex" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="18,1 34,9.5 34,26.5 18,35 2,26.5 2,9.5"
                fill="#080a0d" stroke="#4ec9c9" strokeWidth="2"/>
              <text x="18" y="23" textAnchor="middle" fontFamily="JetBrains Mono,monospace"
                fontSize="13" fontWeight="800" fill="#4ec9c9">{"{}"}</text>
              <polygon points="18,1 34,9.5 34,26.5 18,35 2,26.5 2,9.5"
                fill="none" stroke="#4ec9c9" strokeWidth="2"
                style={{filter:'drop-shadow(0 0 6px rgba(78,201,201,0.7))'}}/>
            </svg>
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

        {/* Step 3 */}
        <div className="setup-step">
          <div className={`setup-num ${step >= 2 ? 'done' : ''}`}>
            {step >= 2 ? '✓' : '3'}
          </div>
          <div className="setup-step-text">
            <div className="setup-step-title">Install Arduino AVR core</div>
            <div className="setup-step-desc">
              Installs <code style={{ color: 'var(--cyan)', fontSize: 11 }}>arduino:avr</code> so Uno, Nano, Mega and other AVR boards work immediately out of the box.
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
  const [ready, setReady]     = useState(null);
  const [theme, setTheme]     = useState('dark'); // 'dark' | 'light'

  // Each sketch has its own file group: { sketchId, name, sketchDir, files: [{id,name,code,filePath,dirty}], activeFile }
  // For simplicity we keep a flat tabs array but add sketchDir + sketchId grouping
  const [tabs, setTabs]       = useState([{ id: 1, name: 'sketch.ino', code: DEFAULT_CODE, filePath: null, sketchDir: null, dirty: false, sketchId: 1 }]);
  const [activeTab, setActive]= useState(1);
  const [activeSketchId, setActiveSketchId] = useState(1);

  // Examples browser
  const [examples, setExamples]     = useState([]); // [{lib, name, path}]
  const [examplesLoaded, setExamplesLoaded] = useState(false);
  const [openLibs, setOpenLibs]     = useState({});  // {libName: true/false}
  const [addingTo, setAddingTo]     = useState(null);

  const [acItems, setAcItems]       = useState([]);     // autocomplete suggestions
  const [acIndex, setAcIndex]       = useState(0);      // selected suggestion
  const [acPos, setAcPos]           = useState(null);   // {top,left} for dropdown
  const acRef                       = useRef(null);
  const cursorPosRef                = useRef(null); // {start, end} to restore after re-render
  const [newFileName, setNewFileName] = useState('');
  const [renamingId, setRenamingId]   = useState(null);  // tab id being renamed
  const [renameVal, setRenameVal]     = useState('');
  const [dragTab, setDragTab]         = useState(null);  // tab id being dragged
  const [hoveredFile, setHoveredFile]   = useState(null);
  const [dirFiles, setDirFiles]         = useState({});    // {sketchDir: [{name,filePath}]}
  const [detectedPorts, setDetectedPorts] = useState([]);
  const [board, setBoard]     = useState({ name: 'Arduino Uno', fqbn: 'arduino:avr:uno' });
  const [boardSearch, setBoardSearch] = useState('');
  const [boardList, setBoardList] = useState([
    { name: 'Arduino Uno',       fqbn: 'arduino:avr:uno',      installed: true },
    { name: 'Arduino Nano',      fqbn: 'arduino:avr:nano',     installed: true },
    { name: 'Arduino Mega 2560', fqbn: 'arduino:avr:mega',     installed: true },
    { name: 'Arduino Leonardo',  fqbn: 'arduino:avr:leonardo', installed: true },
    { name: 'Arduino Micro',     fqbn: 'arduino:avr:micro',    installed: true },
    { name: 'Arduino Pro Mini',  fqbn: 'arduino:avr:pro',      installed: true },
  ]);
  const [port, setPort]       = useState('');
  const [showBD, setShowBD]   = useState(false);
  const [showPD, setShowPD]   = useState(false);
  const [busy, setBusy]       = useState(false);
  const [status, setStatus]   = useState({ state: 'idle', text: 'Ready' });
  const [progress, setProgress] = useState(0);
  const [logs, setLogs]       = useState([]);
  const [outTab, setOutTab]   = useState('summary');
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
  const [serialOutput, setSerialOutput] = useState('');
  const [serialInput, setSerialInput]   = useState('');
  const [lineEnding, setLineEnding]     = useState('\n'); // \n, \r\n, \r, ''
  const [errorLines, setErrorLines] = useState({});
  const conEnd      = useRef(null);
  const serEnd      = useRef(null);
  const libTimer    = useRef(null);
  const coreTimer   = useRef(null);
  const syntaxTimer    = useRef(null);
  const portPollRef    = useRef(null);
  const portMissCount  = useRef({});
  const compileErrors = useRef([]);
  const gutterRef     = useRef(null);
  const overlayRef    = useRef(null);
  const preRef        = useRef(null);
  const [scrollPos, setScrollPos] = React.useState({top:0, left:0});

  useEffect(() => { conEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);
  useEffect(() => { serEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [serialOutput]);

  const addLog = useCallback((text, kind = 'info') => {
    setLogs(prev => [...prev, { time: ts(), text, kind }]);
  }, []);

  // Lines that matter for the Summary tab
  const summaryLogs = React.useMemo(() => logs.filter(l => {
    const t = l.text;
    // Exclude: file open/save messages and raw CLI command lines
    if (/^(Saved|Opened|Saved copy):/.test(t)) return false;
    if (/^arduino-cli (compile|upload|lib|core|board)/i.test(t)) return false;
    // Include: compile/upload results
    if (l.kind === 'success' || l.kind === 'error' || l.kind === 'warning') return true;
    if (/compilation (successful|failed)/i.test(t)) return true;
    if (/error:|warning:/i.test(t)) return true;
    if (/sketch uses|global variables/i.test(t)) return true;
    if (/upload (successful|failed|complete)/i.test(t)) return true;
    if (/avrdude: (writing|reading|verifying|done)/i.test(t)) return true;
    return false;
  }), [logs]);


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
    window.voidIDE.onSerialData(({ text }) => setSerialOutput(prev => prev + text));
    window.voidIDE.onSerialError(({ line }) => setSerialOutput(prev => prev + `[error] ${line}\n`));
    window.voidIDE.onSerialClosed(() => {
      setSerialOpen(false);
      setSerialOutput(prev => prev + '--- port closed ---\n');
    });

    // Load examples from installed libraries
    const loadExamples = async () => {
      if (!isElectron) return;
      try {
        const r = await window.voidIDE.libExamples();
        if (r?.ok && r.examples?.length) {
          setExamples(r.examples);
          addLog(`Loaded ${r.examples.length} examples from ${[...new Set(r.examples.map(e => e.lib))].length} libraries`, 'system');
        } else {
          // Log config to diagnose where arduino-cli is looking
          const cfg = await window.voidIDE.configDump();
          addLog(`No examples found. Libraries dir: ${cfg?.config?.directories?.user || 'unknown'}`, 'warning');
        }
      } catch(e) {
        addLog(`Examples load error: ${e.message}`, 'error');
      }
      setExamplesLoaded(true);
    };
    loadExamples();

    // Load boards from installed cores and merge with defaults
    const loadInstalledBoards = async () => {
      const r = await window.voidIDE.boardListAll();
      if (r?.ok && r.boards?.length) {
        setBoardList(prev => {
          const existing = new Set(prev.map(b => b.fqbn));
          const extra = r.boards.filter(b => b.fqbn && !existing.has(b.fqbn));
          return [...prev, ...extra];
        });
      }
    };
    loadInstalledBoards();

    // Auto-detect port + board changes every 2 seconds
    portPollRef.current = setInterval(async () => {
      const r = await window.voidIDE.boardList();
      if (!r.ok) return;

      // Normalize port entries — handle both old and new arduino-cli JSON shapes
      const entries = (r.ports || []).map(p => ({
        address: p.port?.address || p.address || p.port || '',
        fqbn:    p.matching_boards?.[0]?.fqbn || p.boards?.[0]?.fqbn || p.fqbn || '',
        name:    p.matching_boards?.[0]?.name || p.boards?.[0]?.name || p.name || '',
      })).filter(p => p.address);

      const newAddresses = entries.map(p => p.address);

      setDetectedPorts(prev => {
        // Find newly added ports
        const added = entries.filter(p => !prev.includes(p.address));

        if (added.length > 0) {
          const newest = added[0];
          // Auto-select port
          setPort(newest.address);
          // Auto-select matching board if we know its FQBN
          if (newest.fqbn) {
            setBoardList(bl => {
              const match = bl.find(b => b.fqbn === newest.fqbn);
              if (match) {
                setBoard(match);
                addLog(`Auto-detected: ${match.name} on ${newest.address}`, 'success');
              } else {
                // Board not in list yet — add it dynamically
                const newBoard = { name: newest.name || newest.fqbn, fqbn: newest.fqbn };
                setBoard(newBoard);
                addLog(`Auto-detected: ${newBoard.name} on ${newest.address}`, 'success');
                return [...bl, newBoard];
              }
              return bl;
            });
          } else {
            addLog(`Device connected on ${newest.address} (board unknown — select manually)`, 'warning');
          }
        }

        // Only clear a port after it's been missing 3 polls in a row
        // Prevents false disconnects when arduino-cli board list returns empty briefly
        setPort(cur => {
          if (!cur) return newAddresses[0] || '';
          if (newAddresses.includes(cur)) {
            portMissCount.current[cur] = 0; // reset miss counter
            return cur;
          }
          portMissCount.current[cur] = (portMissCount.current[cur] || 0) + 1;
          if (portMissCount.current[cur] >= 3) {
            delete portMissCount.current[cur];
            return newAddresses[0] || '';
          }
          return cur; // keep current port, still within grace period
        });
        return newAddresses.length > 0 ? newAddresses : prev; // don't wipe list on empty response
      });
    }, 2000);

    return () => {
      window.voidIDE.offCLILine?.();
      window.voidIDE.offSerial?.();
      clearInterval(portPollRef.current);
    };
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
  const updateCode = val => {
    setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, code: val, dirty: true } : t));
    instantSyntaxCheck(val);   // instant — runs client-side on every keystroke
    triggerSyntaxCheck(val);   // deep — runs arduino-cli compile after 300ms idle
  };

  const addNewTab = () => {
    const id = Date.now();
    setTabs(prev => [...prev, { id, name: `sketch${prev.length + 1}.ino`, code: DEFAULT_CODE, filePath: null, sketchDir: null, dirty: false, sketchId: id }]);
    setActive(id);
    setActiveSketchId(id);
  };

  // Add a new file (.h or .cpp) to the current sketch
  const addSketchFile = (filename, sketchId) => {
    if (!filename?.trim()) return;
    const name = filename.includes('.') ? filename.trim() : filename.trim() + '.h';
    const sketchTab = tabs.find(t => t.sketchId === sketchId && t.name.endsWith('.ino'))
                   || tabs.find(t => t.sketchId === sketchId)
                   || tabs.find(t => t.id === sketchId);  // sketchId may equal tab id for opened files
    const id = Date.now();
    const template = name.endsWith('.h')
      ? `#ifndef ${name.replace('.h','').toUpperCase()}_H\n#define ${name.replace('.h','').toUpperCase()}_H\n\n// Your declarations here\n\n#endif`
      : `#include "${name.replace('.cpp','.h')}"\n\n// Your implementation here\n`;
    setTabs(prev => [...prev, {
      id, name, code: template,
      filePath: sketchTab?.sketchDir ? `${sketchTab.sketchDir}/${name}` : null,
      sketchDir: sketchTab?.sketchDir || null,
      dirty: true, sketchId: sketchId,
    }]);
    setActive(id);
    setAddingTo(null);
    setNewFileName('');
  };

  // Arduino / C++ autocomplete keyword list
  const AC_KEYWORDS = [
    // Control
    'if','else','for','while','do','switch','case','break','continue','return','default',
    // Types
    'void','int','float','double','bool','char','byte','unsigned','long','short','const',
    'uint8_t','uint16_t','uint32_t','uint64_t','int8_t','int16_t','int32_t',
    'String','boolean','word','static','volatile','extern','struct','enum','class',
    // Arduino functions
    'setup','loop',
    'pinMode','digitalWrite','digitalRead','analogWrite','analogRead','analogReference',
    'delay','delayMicroseconds','millis','micros','pulseIn','pulseInLong',
    'shiftIn','shiftOut','tone','noTone',
    'Serial','Serial1','Serial2','Serial3',
    'begin','end','print','println','write','read','available','flush','peek','readString',
    'readStringUntil','parseInt','parseFloat','setTimeout','find','findUntil',
    'Wire','SPI','EEPROM',
    'attachInterrupt','detachInterrupt','interrupts','noInterrupts',
    'map','constrain','min','max','abs','pow','sqrt','sq',
    'random','randomSeed','bitRead','bitWrite','bitSet','bitClear','bit',
    'lowByte','highByte','wordByte',
    // Constants
    'HIGH','LOW','INPUT','OUTPUT','INPUT_PULLUP','INPUT_PULLDOWN',
    'true','false','null','NULL','nullptr',
    'LED_BUILTIN','A0','A1','A2','A3','A4','A5',
    'PI','HALF_PI','TWO_PI','DEG_TO_RAD','RAD_TO_DEG',
    // Preprocessor
    '#include','#define','#ifndef','#ifdef','#endif','#pragma',
  ];

  // Refresh disk files for a sketch directory
  const refreshDirFiles = React.useCallback(async (sketchDir) => {
    if (!isElectron || !sketchDir) return;
    const r = await window.voidIDE.listDir({ sketchDir });
    if (r.ok) setDirFiles(prev => ({ ...prev, [sketchDir]: r.files }));
  }, []);

  // Get word being typed at cursor
  const getWordAtCursor = (text, pos) => {
    const before = text.slice(0, pos);
    const match = before.match(/[a-zA-Z_#][a-zA-Z0-9_]*$/);
    return match ? match[0] : '';
  };

  const handleAC = (textarea, code, pos) => {
    const word = getWordAtCursor(code, pos);
    if (word.length < 2) { setAcItems([]); return; }
    const matches = AC_KEYWORDS.filter(k => k.startsWith(word) && k !== word);
    setAcItems(matches.slice(0, 8));
    setAcIndex(0);
    if (matches.length > 0) {
      // Position dropdown near cursor — approximate using line/col
      const lines = code.slice(0, pos).split('\n');
      const lineNum = lines.length - 1;
      const col = lines[lineNum].length;
      const lineH = 22;
      const charW = 7.8;
      setAcPos({ top: (lineNum + 1) * lineH + 16 - (textarea.scrollTop || 0), left: col * charW + 68 });
    } else {
      setAcPos(null);
    }
  };

  const applyAC = (textarea, item) => {
    const pos = textarea.selectionStart;
    const word = getWordAtCursor(activeCode, pos);
    const before = activeCode.slice(0, pos - word.length);
    const after  = activeCode.slice(pos);
    const newCode = before + item + after;
    updateCode(newCode);
    const newPos = before.length + item.length;
    cursorPosRef.current = { start: newPos, end: newPos };
    setAcItems([]);
    setAcPos(null);
  };

  // Open an example sketch
  const openExample = async (example) => {
    if (!isElectron) { addLog('Not running in Electron', 'error'); return; }
    addLog(`Opening: ${example.path}`, 'system');
    try {
      const r = await window.voidIDE.readFile({ filePath: example.path });
      if (!r?.ok) {
        addLog(`readFile failed: ${r?.error || 'unknown error'} — path: ${example.path}`, 'error');
        return;
      }
      const id = Date.now();
      const sketchDir = example.path.substring(0, example.path.lastIndexOf('/'));
      setTabs(prev => [...prev, {
        id,
        name: example.name + '.ino',
        code: r.content,
        filePath: example.path,
        sketchDir,
        dirty: false,
        sketchId: id,
        readOnly: true,
      }]);
      setActive(id);
      setActiveSketchId(id);
      addLog(`Opened example: ${example.lib} / ${example.name}`, 'success');
    } catch(e) {
      addLog(`Failed to open example: ${e.message}`, 'error');
    }
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
    // Read-only example — Save As, then become editable
    if (tab.readOnly) {
      const r = await window.voidIDE.saveAs({ content: tab.code });
      if (r.ok && !r.canceled) {
        setTabs(prev => prev.map(t => t.id === activeTab ? {
          ...t, filePath: r.filePath, sketchDir: r.sketchDir,
          name: r.filePath.split('/').pop(), dirty: false, readOnly: false,
        } : t));
        addLog(`Saved copy: ${r.filePath}`, 'success');
      }
      return;
    }
    // .h/.cpp with no filePath — parent .ino not saved yet, save it first
    if (!tab.filePath && !tab.name.endsWith('.ino')) {
      // Find and save the parent .ino first to get sketchDir
      const parentIno = tabs.find(t => t.sketchId === tab.sketchId && t.name.endsWith('.ino'));
      let sketchDir = parentIno?.sketchDir;
      if (!sketchDir) {
        // Parent .ino needs saving too
        const inoContent = parentIno?.code || '';
        const r = await window.voidIDE.saveAs({ content: inoContent });
        if (!r.ok || r.canceled) return;
        sketchDir = r.sketchDir;
        // Update parent .ino tab
        setTabs(prev => prev.map(t => t.id === parentIno?.id ? {
          ...t, filePath: r.filePath, sketchDir: r.sketchDir,
          name: r.filePath.split('/').pop(), dirty: false,
        } : t));
      }
      // Now save the .h/.cpp into that sketchDir
      const filePath = `${sketchDir}/${tab.name}`;
      const r2 = await window.voidIDE.saveCurrent({ filePath, content: tab.code });
      if (r2.ok) {
        setTabs(prev => prev.map(t => t.id === activeTab ? {
          ...t, filePath, sketchDir, dirty: false,
        } : t));
        addLog(`Saved: ${filePath}`, 'success');
      }
      return;
    }
    // Any file with known filePath — save directly
    if (tab.filePath) {
      const r = await window.voidIDE.saveCurrent({ filePath: tab.filePath, content: tab.code });
      if (r.ok) {
        setTabs(prev => prev.map(t => t.id === activeTab ? { ...t, dirty: false } : t));
        addLog(`Saved: ${tab.filePath}`, 'success');
        refreshDirFiles(tab.sketchDir);
      }
      return;
    }
    // Unsaved .ino with no filePath — show Save As dialog
    const r = await window.voidIDE.saveAs({ content: tab.code });
    if (r.ok && !r.canceled) {
      setTabs(prev => prev.map(t => t.id === activeTab ? {
        ...t, filePath: r.filePath, sketchDir: r.sketchDir,
        name: r.filePath.split('/').pop(), dirty: false,
      } : t));
      addLog(`Saved: ${r.filePath}`, 'success');
      refreshDirFiles(r.sketchDir);
    }
  };

  const handleOpen = async () => {
    if (!isElectron) return;
    const r = await window.voidIDE.openFile();
    if (!r.ok || r.canceled) return;
    const id = Date.now();
    setTabs(prev => [...prev, { id, name: r.filePath.split('/').pop(), code: r.content, filePath: r.filePath, sketchDir: r.sketchDir, dirty: false, sketchId: id }]);
    setActive(id);
    addLog(`Opened: ${r.filePath}`, 'success');
    refreshDirFiles(r.sketchDir);
  };

  // ── Ensure sketch saved before compile/upload ─────────────────────────────
  const ensureSaved = async (tab) => {
    if (tab.readOnly || !tab.sketchDir) {
      addLog('Example is read-only — save a copy first (Ctrl+S)', 'warning');
      const r = await window.voidIDE.saveAs({ content: tab.code });
      if (!r.ok || r.canceled) return null;
      setTabs(prev => prev.map(t => t.id === tab.id ? {
        ...t, filePath: r.filePath, sketchDir: r.sketchDir,
        name: r.filePath.split('/').pop(), dirty: false, readOnly: false,
      } : t));
      return r.sketchDir;
    }
    if (tab.dirty) {
      await window.voidIDE.saveCurrent({ filePath: tab.filePath, content: tab.code });
      setTabs(prev => prev.map(t => t.id === tab.id ? { ...t, dirty: false } : t));
    }
    return tab.sketchDir;
  };

  // ── Parse error lines from compile output ────────────────────────────────
  const parseErrors = useCallback((logLines) => {
    const errs = {};
    for (const line of logLines) {
      const m = line.match(/([^\s]+\.ino):(\d+):\d+:\s*(error|warning):\s*(.+)/);
      if (!m) continue;
      // arduino-cli reports the line AFTER the error (e.g. missing semicolon shows on next line)
      // subtract 1 to point at the actual offending line
      const lineNum = parseInt(m[2], 10);
      const kind    = m[3];
      const msg     = m[4].trim();
      if (msg.startsWith('In file') || msg.startsWith('note:') || msg.startsWith('In member')) continue;
      if (!errs[lineNum] || kind === 'error') {
        errs[lineNum] = { msg, kind };
      }
    }
    setErrorLines(errs);
    compileErrors.current = errs;
    return errs;
  }, []);

  // ── Compile ───────────────────────────────────────────────────────────────
  const handleCompile = useCallback(async () => {
    if (busy || !isElectron) return;
    setErrorLines({});
    setBusy(true); setProgress(10); setStatus({ state: 'busy', text: 'Compiling…' });
    const sketchDir = await ensureSaved(tabs.find(t => t.id === activeTab));
    if (!sketchDir) { setBusy(false); setProgress(0); setStatus({ state: 'idle', text: 'Ready' }); return; }
    setProgress(30);
    const capturedLines = [];
    const origLog = (text, kind) => { capturedLines.push(text); addLog(text, kind); };
    window.voidIDE.offCLILine();
    window.voidIDE.onCLILine(({ text, kind }) => origLog(text, kind));
    const r = await window.voidIDE.compile({ fqbn: board.fqbn, sketchDir });
    window.voidIDE.offCLILine();
    window.voidIDE.onCLILine(({ text, kind }) => addLog(text, kind));
    setProgress(100);
    if (r.ok) {
      setErrorLines({});
      setStatus({ state: 'ok', text: 'Compiled OK' });
      addLog('✓ Compilation successful', 'success');
    } else {
      parseErrors(capturedLines);
      setStatus({ state: 'fail', text: 'Compile failed' });
    }
    setBusy(false);
    setTimeout(() => setProgress(0), 800);
    return r.ok;
  }, [busy, tabs, activeTab, board, addLog, parseErrors]);

  // ── Upload (compiles first, then uploads) ────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (busy || !isElectron) return;
    if (!port) { addLog('No port selected. Plug in your board and click Refresh.', 'error'); return; }
    setErrorLines({});
    setBusy(true); setProgress(5); setStatus({ state: 'busy', text: 'Compiling…' });
    const sketchDir = await ensureSaved(tabs.find(t => t.id === activeTab));
    if (!sketchDir) { setBusy(false); setProgress(0); setStatus({ state: 'idle', text: 'Ready' }); return; }

    // Step 1: Compile
    setProgress(15);
    const capturedLines = [];
    window.voidIDE.offCLILine();
    window.voidIDE.onCLILine(({ text, kind }) => { capturedLines.push(text); addLog(text, kind); });
    const compileResult = await window.voidIDE.compile({ fqbn: board.fqbn, sketchDir });
    window.voidIDE.offCLILine();
    window.voidIDE.onCLILine(({ text, kind }) => addLog(text, kind));

    if (!compileResult.ok) {
      parseErrors(capturedLines);
      setStatus({ state: 'fail', text: 'Compile failed — upload aborted' });
      addLog('✗ Compile failed. Fix errors before uploading.', 'error');
      setBusy(false);
      setTimeout(() => setProgress(0), 800);
      return;
    }

    addLog('✓ Compilation successful', 'success');
    setProgress(50);

    // Step 2: Upload
    setStatus({ state: 'busy', text: 'Uploading…' });
    const uploadResult = await window.voidIDE.upload({ fqbn: board.fqbn, port, sketchDir });
    setProgress(100);
    setStatus({ state: uploadResult.ok ? 'ok' : 'fail', text: uploadResult.ok ? 'Upload OK' : 'Upload failed' });
    if (uploadResult.ok) addLog(`✓ Upload complete → ${port}`, 'success');
    setBusy(false);
    setTimeout(() => setProgress(0), 800);
  }, [busy, tabs, activeTab, board, port, addLog, parseErrors]);

  // ── Instant client-side syntax checks (runs on every keystroke) ─────────
  // Catches the most common errors immediately without invoking arduino-cli
  const instantSyntaxCheck = useCallback((code) => {
    const lines = code.split('\n');
    const errs = {};

    // Track brace/paren/bracket balance
    let braces = 0, parens = 0, brackets = 0;
    let inString = false, inChar = false, inLineComment = false, inBlockComment = false;
    let lastOpenBrace = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      inLineComment = false;

      for (let j = 0; j < line.length; j++) {
        const c = line[j], n = line[j+1];

        if (inBlockComment) { if (c === '*' && n === '/') { inBlockComment = false; j++; } continue; }
        if (inLineComment) break;
        if (inString)  { if (c === '\\') { j++; } else if (c === '"') inString = false; continue; }
        if (inChar)    { if (c === '\\') { j++; } else if (c === "'") inChar = false; continue; }

        if (c === '/' && n === '/') { inLineComment = true; break; }
        if (c === '/' && n === '*') { inBlockComment = true; j++; continue; }
        if (c === '"') { inString = true; continue; }
        if (c === "'") { inChar = true; continue; }

        if (c === '{') { braces++;   lastOpenBrace = i+1; }
        if (c === '}') { braces--;   if (braces < 0) { errs[i+1] = { msg: 'Unexpected }', kind: 'error' }; braces = 0; } }
        if (c === '(') { parens++;   }
        if (c === ')') { parens--;   if (parens < 0) { errs[i+1] = { msg: 'Unexpected )', kind: 'error' }; parens = 0; } }
        if (c === '[') { brackets++; }
        if (c === ']') { brackets--; if (brackets < 0) { errs[i+1] = { msg: 'Unexpected ]', kind: 'error' }; brackets = 0; } }
      }

      // Missing semicolon heuristic: statement lines not ending with ; { } , \ or :
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('*') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith(':') &&
        !trimmed.endsWith('\\') &&
        !trimmed.endsWith('(') &&
        !/^(void|int|float|double|bool|char|byte|unsigned|long|short|if|else|for|while|do|class|struct|typedef|#)/.test(trimmed) &&
        /^[a-zA-Z_]/.test(trimmed) &&
        trimmed.includes('(') &&
        trimmed.includes(')')
      ) {
        if (!errs[i+1]) errs[i+1] = { msg: 'Missing semicolon?', kind: 'warning' };
      }
    }

    // Unclosed braces
    if (braces > 0 && lastOpenBrace) {
      errs[lastOpenBrace] = { msg: `Unclosed { — missing ${braces} closing brace${braces>1?'s':''}`, kind: 'error' };
    }

    setErrorLines(errs);
    compileErrors.current = errs;
  }, []);

  // ── Background syntax check (debounced, 2s after typing stops) ───────────
  const triggerSyntaxCheck = useCallback((code) => {
    if (!isElectron) return;
    clearTimeout(syntaxTimer.current);
    syntaxTimer.current = setTimeout(async () => {
      const tab = tabs.find(t => t.id === activeTab);
      if (!tab?.sketchDir || tab?.readOnly) return;
      // Save silently, then use structured compile-check (no listener swapping)
      await window.voidIDE.saveCurrent({ filePath: tab.filePath, content: code });
      const r = await window.voidIDE.compileCheck({ fqbn: board.fqbn, sketchDir: tab.sketchDir });
      if (r.ok) {
        setErrorLines({});
      } else {
        // r.errors = [{line, kind, msg}] — exact line numbers direct from GCC, no offset needed
        const errs = {};
        for (const e of r.errors) errs[e.line] = { msg: e.msg, kind: e.kind };
        setErrorLines(errs);
        compileErrors.current = errs;
      }
    }, 1500);
  }, [tabs, activeTab, board]);

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
    if (r.ok) { setSerialOpen(true); setSerialOutput(p => p + `--- opened ${port} @ ${baud} baud ---\n`); }
    else setSerialOutput(p => p + `Failed: ${r.error || 'unknown error'}\n`);
  };

  const handleSerialClose = async () => { await window.voidIDE.serialClose(); setSerialOpen(false); };

  const handleSerialSend = async () => {
    if (!serialInput.trim() || !serialOpen) return;
    await window.voidIDE.serialWrite(serialInput + lineEnding);
    setSerialOutput(prev => prev + `> ${serialInput}\n`);
    setSerialInput('');
  };

  // Restore cursor position after React re-render (for programmatic edits)
  React.useEffect(() => {
    if (cursorPosRef.current === null) return;
    const ta = document.querySelector('.code-ta');
    if (!ta) return;
    const { start, end } = cursorPosRef.current;
    cursorPosRef.current = null;
    ta.selectionStart = start;
    ta.selectionEnd   = end;
  });

  // Zoom — whole app via Electron webContents.setZoomLevel
  React.useEffect(() => {
    const handler = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === '=' || e.key === '+') { e.preventDefault(); window.voidIDE.appZoom(1); }
      if (e.key === '-')                  { e.preventDefault(); window.voidIDE.appZoom(-1); }
      if (e.key === '0')                  { e.preventDefault(); window.voidIDE.appZoom(0); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const lineCount = activeCode.split('\n').length;
  const gutterLines = lineCount; // exact line count — bottom spacer handles scroll alignment

  // Build highlighted code — NO background spans in the pre layer
  // Background highlights are handled via a separate overlay div to avoid cursor shift
  const highlightWithErrors = (code) => highlight(code);

  // Error gutter tooltip state
  const [tooltip, setTooltip] = React.useState(null);

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
      <div className={`ide ${theme === "light" ? "light" : ""}`}>

        {/* Title bar */}
        <div className="titlebar">
          <div className="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="14,1 26,7.5 26,20.5 14,27 2,20.5 2,7.5"
                fill="#080a0d" stroke="#4ec9c9" strokeWidth="1.5"/>
              <text x="14" y="18.5" textAnchor="middle" fontFamily="JetBrains Mono,monospace"
                fontSize="10" fontWeight="800" fill="#4ec9c9" letterSpacing="-0.5">{"{}"}</text>
              <polygon points="14,1 26,7.5 26,20.5 14,27 2,20.5 2,7.5"
                fill="none" stroke="#4ec9c9" strokeWidth="1.5"
                style={{filter:'drop-shadow(0 0 4px rgba(78,201,201,0.6))'}}/>
            </svg>
            VOID IDE
          </div>
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
          <button className="theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark'
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
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
              <div className="sb-hdr" style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingRight:10}}>
                <span>SKETCHES</span>
                <span title="New Sketch" style={{cursor:'pointer',color:'var(--muted)',lineHeight:1,display:'flex',alignItems:'center'}}
                  onClick={addNewTab}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </span>
              </div>
              {Object.entries(
                tabs.reduce((acc, t) => {
                  const sid = t.sketchId || t.id;
                  if (!acc[sid]) acc[sid] = [];
                  acc[sid].push(t);
                  return acc;
                }, {})
              ).map(([sid, skFiles]) => {
                const sidNum = parseInt(sid);
                const inoFile = skFiles.find(f => f.name.endsWith('.ino')) || skFiles[0];
                const folderName = inoFile.name.replace('.ino','');
                return (
                  <div key={sid} style={{marginBottom:2}}>
                    {/* Folder row */}
                    <div style={{
                      display:'flex',alignItems:'center',gap:6,
                      padding:'5px 8px 5px 10px',fontSize:12,fontWeight:600,
                      color:'var(--text)',cursor:'default',userSelect:'none',
                      background:'var(--bg1)',marginTop:2,
                    }}
                      onMouseEnter={e => e.currentTarget.querySelector('.folder-actions').style.opacity=1}
                      onMouseLeave={e => e.currentTarget.querySelector('.folder-actions').style.opacity=0}
                    >
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" style={{color:'var(--amber)',flexShrink:0}}><path d="M2 4h5l1.5 2H14v7H2z"/></svg>
                      <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{folderName}</span>
                      <span className="folder-actions" style={{display:'flex',gap:8,opacity:0,transition:'opacity .1s',alignItems:'center'}}>
                        <span title="New file" style={{cursor:'pointer',color:'var(--muted)',lineHeight:1,display:'flex',alignItems:'center'}}
                          onClick={() => { setAddingTo(sidNum); setNewFileName(''); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        </span>
                        <span title="New sketch" style={{cursor:'pointer',color:'var(--muted)',lineHeight:1,display:'flex',alignItems:'center'}}
                          onClick={addNewTab}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </span>
                      </span>
                    </div>
                    {/* Files — from disk if available, else from open tabs */}
                    {(() => {
                      const inoTab = skFiles.find(f => f.name.endsWith('.ino')) || skFiles[0];
                      const diskFiles = inoTab?.sketchDir ? (dirFiles[inoTab.sketchDir] || []) : [];
                      // Merge disk files with open tabs; disk wins for file list
                      const displayFiles = diskFiles.length > 0
                        ? diskFiles.map(df => {
                            const openTab = skFiles.find(t => t.name === df.name);
                            return openTab || { id: `disk-${df.filePath}`, name: df.name, filePath: df.filePath, sketchDir: inoTab.sketchDir, sketchId: sidNum, disk: true };
                          })
                        : skFiles;
                      return displayFiles.map(t => {
                        const hKey = t.id;
                        const isActive = t.id === activeTab;
                        const isDirty = !t.disk && t.dirty;
                        return (
                          <div key={t.id}
                            className={`sb-item ${isActive ? 'active' : ''}`}
                            style={{paddingLeft:28,paddingRight:6,display:'flex',alignItems:'center',gap:6,position:'relative'}}
                            onClick={() => {
                              if (t.disk) {
                                // Open disk file as new tab
                                window.voidIDE.readFile({ filePath: t.filePath }).then(r => {
                                  if (!r.ok) return;
                                  const id = Date.now();
                                  setTabs(prev => [...prev, { id, name: t.name, code: r.content, filePath: t.filePath, sketchDir: t.sketchDir, dirty: false, sketchId: t.sketchId }]);
                                  setActive(id);
                                });
                              } else { setActive(t.id); }
                            }}
                            onMouseEnter={() => setHoveredFile(hKey)}
                            onMouseLeave={() => setHoveredFile(null)}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{flexShrink:0,opacity:.6}}>
                              <path d="M4 1h6l3 3v10H4z"/><path d="M10 1v3h3"/>
                            </svg>
                            {renamingId === t.id ? (
                              <input autoFocus
                                style={{flex:1,background:'var(--bg2)',border:'1px solid var(--cyan)',
                                  borderRadius:2,padding:'1px 4px',fontSize:11,color:'var(--text)',
                                  fontFamily:'var(--mono)',outline:'none'}}
                                value={renameVal}
                                onChange={e => setRenameVal(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    const newName = renameVal.trim();
                                    if (newName && newName !== t.name) {
                                      setTabs(prev => prev.map(x => x.id === t.id ? {
                                        ...x, name: newName,
                                        filePath: x.filePath ? x.filePath.replace(/[^/]+$/, newName) : null,
                                        dirty: true,
                                      } : x));
                                    }
                                    setRenamingId(null);
                                  }
                                  if (e.key === 'Escape') setRenamingId(null);
                                }}
                                onBlur={() => setRenamingId(null)}
                              />
                            ) : (
                              <span style={{
                                flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12,
                                color: t.name.endsWith('.h') ? 'var(--blue)' :
                                       t.name.endsWith('.cpp') || t.name.endsWith('.c') ? 'var(--amber)' : 'var(--text)',
                                opacity: t.disk ? 0.7 : 1,
                              }} onDoubleClick={() => { if (!t.disk) { setRenamingId(t.id); setRenameVal(t.name); } }}>
                                {t.name}{isDirty ? <span style={{color:'var(--amber)',marginLeft:2}}>●</span> : null}
                              </span>
                            )}
                            {hoveredFile === hKey && renamingId !== t.id && (
                              <span style={{display:'flex',gap:6,marginLeft:'auto',flexShrink:0,alignItems:'center'}}>
                                {!t.disk && (
                                  <span title="Rename" style={{cursor:'pointer',color:'var(--muted)',lineHeight:1,display:'flex',alignItems:'center'}}
                                    onClick={e => { e.stopPropagation(); setRenamingId(t.id); setRenameVal(t.name); }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  </span>
                                )}
                                {t.name.endsWith('.ino') ? (
                                  /* .ino — close all tabs in group */
                                  <span title="Close sketch" style={{cursor:'pointer',color:'var(--muted)',lineHeight:1,display:'flex',alignItems:'center'}}
                                    onClick={e => { e.stopPropagation(); setTabs(prev => prev.filter(x => x.sketchId !== sidNum)); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                  </span>
                                ) : (
                                  /* .h/.cpp/.c — delete from disk */
                                  <span title="Delete file from disk" style={{cursor:'pointer',color:'var(--red)',lineHeight:1,display:'flex',alignItems:'center'}}
                                    onClick={async e => {
                                      e.stopPropagation();
                                      if (!t.filePath) return;
                                      const r = await window.voidIDE.deleteFile({ filePath: t.filePath });
                                      if (r.ok) {
                                        setTabs(prev => prev.filter(x => x.id !== t.id));
                                        setDirFiles(prev => {
                                          const updated = { ...prev };
                                          if (updated[t.sketchDir]) updated[t.sketchDir] = updated[t.sketchDir].filter(f => f.filePath !== t.filePath);
                                          return updated;
                                        });
                                      }
                                    }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()}
                    {/* Inline new file input */}
                    {addingTo === sidNum && (
                      <div style={{display:'flex',alignItems:'center',paddingLeft:26,paddingRight:8,gap:4}}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--cyan)" strokeWidth="1.5" style={{flexShrink:0}}>
                          <path d="M4 1h6l3 3v10H4z"/><path d="M10 1v3h3"/>
                        </svg>
                        <input autoFocus
                          style={{flex:1,background:'var(--bg2)',border:'1px solid var(--cyan)',
                            borderRadius:2,padding:'2px 5px',fontSize:11,color:'var(--text)',
                            fontFamily:'var(--mono)',outline:'none'}}
                          placeholder="filename.h"
                          value={newFileName}
                          onChange={e => setNewFileName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') addSketchFile(newFileName, sidNum);
                            if (e.key === 'Escape') { setAddingTo(null); setNewFileName(''); }
                          }}
                          onBlur={() => { setAddingTo(null); setNewFileName(''); }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="sb-sec">
              <div className="sb-hdr">Manager</div>
              <div className={`sb-item ${rpTab === 'libs' ? 'active' : ''}`}    onClick={() => setRpTab('libs')}>{I.lib}   Library Manager</div>
              <div className={`sb-item ${rpTab === 'boards' ? 'active' : ''}`}  onClick={() => setRpTab('boards')}>{I.board} Board Manager</div>
              <div className={`sb-item ${rpTab === 'examples' ? 'active' : ''}`} onClick={() => setRpTab('examples')}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 4h14M1 8h10M1 12h7"/></svg>
                Examples
              </div>
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
            <div className="tabs" style={{flexWrap:'nowrap',overflowX:'auto',userSelect:'none'}}>
              {tabs.map((t, idx) => (
                <div key={t.id}
                  className={`tab ${t.id === activeTab ? 'active' : ''}`}
                  draggable
                  onDragStart={() => setDragTab(t.id)}
                  onDragOver={e => { e.preventDefault(); }}
                  onDrop={() => {
                    if (dragTab === null || dragTab === t.id) return;
                    setTabs(prev => {
                      const arr = [...prev];
                      const from = arr.findIndex(x => x.id === dragTab);
                      const to   = arr.findIndex(x => x.id === t.id);
                      const [moved] = arr.splice(from, 1);
                      arr.splice(to, 0, moved);
                      return arr;
                    });
                    setDragTab(null);
                  }}
                  onDragEnd={() => setDragTab(null)}
                  style={{
                    borderBottom: t.name.endsWith('.h')   ? '2px solid var(--blue)' :
                                  t.name.endsWith('.cpp') ? '2px solid var(--amber)' : undefined,
                    opacity: dragTab === t.id ? 0.4 : 1,
                    cursor: 'grab',
                  }}
                  onClick={() => setActive(t.id)}>
                  {t.dirty && <span className="tab-dot" />}
                  {t.readOnly && <span style={{color:'var(--amber)',fontSize:9,marginRight:2}}>★</span>}
                  {t.name}
                  <span className="tab-x" onClick={e => closeTab(t.id, e)}>✕</span>
                </div>
              ))}
            </div>
            {currentTab?.readOnly && (
              <div style={{
                background:'rgba(240,192,64,0.08)',borderBottom:'1px solid var(--amber)',
                padding:'5px 16px',fontSize:11,fontFamily:'var(--mono)',
                color:'var(--amber)',display:'flex',alignItems:'center',gap:8,flexShrink:0
              }}>
                <span>⚠ Read-only example</span>
                <span style={{color:'var(--muted)'}}>—</span>
                <span>Ctrl+S to save a copy and start editing</span>
              </div>
            )}
            <div className="code-wrap">
              {/* Line numbers + inline error dots — scroll together */}
              <div ref={gutterRef} style={{
                width:68,flexShrink:0,background:'var(--bg0)',
                overflowY:'hidden',overflowX:'hidden',
                fontFamily:'var(--mono)',fontSize:13,lineHeight:'22px',
                userSelect:'none'
              }}>
                <div style={{height:16,flexShrink:0}}/>
                {Array.from({length:gutterLines},(_,i)=>i+1).map(n=>{
                  const err = errorLines[n];
                  return (
                    <div key={n} style={{
                      height:22,display:'flex',alignItems:'center',
                      justifyContent:'flex-end',gap:4,paddingRight:8
                    }}>
                      <span style={{
                        color:err?(err.kind==='error'?'var(--red)':'var(--amber)'):'var(--bg4)',
                        fontWeight:err?700:400,minWidth:24,textAlign:'right',fontSize:12
                      }}>
                        {n}
                      </span>
                      {err ? (
                        <span
                          className={`err-mark ${err.kind}`}
                          style={{flexShrink:0,display:'inline-block',cursor:'help'}}
                          onMouseEnter={e => setTooltip({msg:err.msg,kind:err.kind,x:e.clientX,y:e.clientY})}
                          onMouseLeave={() => setTooltip(null)}
                        />
                      ) : <span style={{width:7,flexShrink:0}}/>}
                    </div>
                  );
                })}
                <div style={{height:16,flexShrink:0}}/>
              </div>
              <div className="code-layer">
                {/* Error line background overlay — behind both pre and textarea */}
                <div aria-hidden="true" style={{
                  position:'absolute',inset:0,
                  pointerEvents:'none',zIndex:0,overflow:'hidden',
                }}>
                  <div style={{
                    transform:`translateY(${16 - scrollPos.top}px)`,
                    willChange:'transform',
                  }}>
                    {activeCode.split('\n').map((_, i) => {
                      const err = errorLines[i + 1];
                      if (!err) return <div key={i} style={{height:22}} />;
                      return <div key={i} style={{
                        height:22,
                        background: err.kind === 'error' ? 'rgba(224,90,90,0.10)' : 'rgba(240,192,64,0.07)',
                        borderLeft: `2px solid ${err.kind === 'error' ? 'var(--red)' : 'var(--amber)'}`,
                        width:'100%'
                      }}/>;
                    })}
                  </div>
                </div>
                <pre ref={preRef} className="code-hl" style={{zIndex:1,transform:`translate(${-scrollPos.left}px, ${-scrollPos.top}px)`,top:0,left:0,position:'absolute',width:'100%'}} dangerouslySetInnerHTML={{ __html: highlightWithErrors(activeCode) }} />
                <textarea className="code-ta" value={activeCode} onChange={e => { if (currentTab?.readOnly) return; updateCode(e.target.value); handleAC(e.target, e.target.value, e.target.selectionStart); }} spellCheck={false}
                  onScroll={e => { const t = e.target.scrollTop, l = e.target.scrollLeft; if (gutterRef.current) gutterRef.current.scrollTop = t; if (overlayRef.current) overlayRef.current.scrollTop = t; setScrollPos({top:t,left:l}); }}
                  onKeyDown={e => {
                    const ta = e.target;
                    const s = ta.selectionStart, en = ta.selectionEnd;
                    // Save
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); return; }
                    // Autocomplete navigation
                    if (acItems.length > 0) {
                      if (e.key === 'ArrowDown') { e.preventDefault(); setAcIndex(i => (i+1)%acItems.length); return; }
                      if (e.key === 'ArrowUp')   { e.preventDefault(); setAcIndex(i => (i-1+acItems.length)%acItems.length); return; }
                      if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); applyAC(ta, acItems[acIndex]); return; }
                      if (e.key === 'Escape')    { setAcItems([]); setAcPos(null); return; }
                    }
                    // Tab indent
                    if (e.key === 'Tab') { e.preventDefault(); updateCode(activeCode.slice(0,s)+'  '+activeCode.slice(en)); cursorPosRef.current={start:s+2,end:s+2}; return; }
                    // Auto-indent on Enter
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const lines = activeCode.slice(0, s).split('\n');
                      const curLine = lines[lines.length - 1];
                      const indent = curLine.match(/^\s*/)[0];
                      const charBefore = activeCode[s - 1];
                      const charAfter  = activeCode[en];
                      const extraIndent = charBefore === '{' ? '  ' : '';
                      if (charBefore === '{' && charAfter === '}') {
                        const insert = '\n' + indent + extraIndent + '\n' + indent;
                        updateCode(activeCode.slice(0, s) + insert + activeCode.slice(en));
                        const pos = s + indent.length + extraIndent.length + 1;
                        cursorPosRef.current = { start: pos, end: pos };
                      } else {
                        const insert = '\n' + indent + extraIndent;
                        updateCode(activeCode.slice(0, s) + insert + activeCode.slice(en));
                        const pos = s + insert.length;
                        cursorPosRef.current = { start: pos, end: pos };
                      }
                      return;
                    }
                    // Auto-close brackets and quotes
                    const pairs = {'(':')','{':'}','[':']','"':'"',"'":"'",'`':'`'};
                    const closers = new Set(Object.values(pairs));
                    if (pairs[e.key]) {
                      e.preventDefault();
                      const sel = activeCode.slice(s, en);
                      const close = pairs[e.key];
                      if (sel) {
                        updateCode(activeCode.slice(0,s)+e.key+sel+close+activeCode.slice(en));
                        cursorPosRef.current = { start: s+1, end: en+1 };
                      } else {
                        updateCode(activeCode.slice(0,s)+e.key+close+activeCode.slice(en));
                        cursorPosRef.current = { start: s+1, end: s+1 };
                      }
                      return;
                    }
                    // Skip over closing bracket if already there
                    if (closers.has(e.key) && activeCode[s] === e.key) {
                      e.preventDefault();
                      cursorPosRef.current = { start: s+1, end: s+1 };
                      return;
                    }
                    // Backspace: delete pair
                    if (e.key === 'Backspace' && s === en) {
                      const open = activeCode[s-1], close = activeCode[s];
                      if (open && pairs[open] === close) {
                        e.preventDefault();
                        updateCode(activeCode.slice(0,s-1)+activeCode.slice(s+1));
                        cursorPosRef.current = { start: s-1, end: s-1 };
                        return;
                      }
                    }
                  }}
                />
              {/* Autocomplete dropdown */}
              {acItems.length > 0 && acPos && (
                <div ref={acRef} style={{
                  position:'absolute',top:acPos.top,left:acPos.left,
                  background:'var(--bg2)',border:'1px solid var(--cyan)',borderRadius:4,
                  zIndex:100,minWidth:160,maxWidth:300,boxShadow:'0 4px 16px rgba(0,0,0,.4)',
                  fontFamily:'var(--mono)',fontSize:12,overflow:'hidden',
                }}>
                  {acItems.map((item,i) => (
                    <div key={item}
                      style={{padding:'4px 10px',cursor:'pointer',
                        background: i===acIndex ? 'var(--cyan)' : 'transparent',
                        color: i===acIndex ? '#000' : 'var(--text)',
                      }}
                      onMouseDown={e => { e.preventDefault(); }}
                      onClick={() => { const ta = document.querySelector('.code-ta'); applyAC(ta, item); }}>
                      {item}
                    </div>
                  ))}
                </div>
              )}

              </div>
            </div>
            <div className="console">
              <div className="con-hdr">
                {/* Tabs */}
                <div style={{display:'flex',gap:0,marginRight:8}}>
                  {['summary','full'].map(t => (
                    <div key={t} onClick={() => setOutTab(t)} style={{
                      padding:'2px 12px',fontSize:10,fontWeight:700,letterSpacing:.6,
                      textTransform:'uppercase',cursor:'pointer',borderRadius:3,
                      color: outTab === t ? 'var(--cyan)' : 'var(--muted)',
                      background: outTab === t ? 'var(--bg2)' : 'transparent',
                      transition:'color .15s,background .15s',
                    }}>{t === 'summary' ? 'Summary' : 'Full Log'}</div>
                  ))}
                </div>
                <span style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)'}}>arduino-cli</span>
                <button className="con-clear" onClick={() => setLogs([])}>Clear</button>
              </div>
              <div className="con-body">
                {(outTab === 'summary' ? summaryLogs : logs).map((l, i) => (
                  <div className="lg" key={i}><span className="lgt">{l.time}</span><span className={`lgm ${l.kind}`}>{l.text}</span></div>
                ))}
                {outTab === 'summary' && summaryLogs.length === 0 && (
                  <div style={{color:'var(--muted)',fontSize:11,fontStyle:'italic',marginTop:4}}>Compile or upload to see results here.</div>
                )}
                <div ref={conEnd} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="rpanel">
            <div className="rp-tabs" style={{flexWrap:'wrap'}}>
              {['boards', 'libs', 'examples', 'info'].map(t => (
                <div key={t} className={`rp-tab ${rpTab === t ? 'active' : ''}`}
                  style={{flex:'1 1 auto',minWidth:0,fontSize:10}}
                  onClick={() => setRpTab(t)}>
                  {t === 'libs' ? 'Libraries' : t === 'boards' ? 'Boards' : t === 'examples' ? 'Examples' : 'Info'}
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

              {/* ── Examples Browser ── */}
              {rpTab === 'examples' && (
                <>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--mono)',flex:1}}>
                      Click any example to open it in a new tab
                    </div>
                    <button className="btn ghost" style={{padding:'2px 8px',fontSize:10}}
                      onClick={async () => {
                        setExamplesLoaded(false);
                        setExamples([]);
                        const r = await window.voidIDE.libExamples();
                        if (r?.ok && r.examples?.length) {
                          setExamples(r.examples);
                          addLog(`Loaded ${r.examples.length} examples`, 'system');
                        } else {
                          addLog('No examples found after refresh', 'warning');
                        }
                        setExamplesLoaded(true);
                      }}>{I.refresh}</button>
                  </div>
                  {!examplesLoaded && <div className="empty">Loading examples…</div>}
                  {examplesLoaded && examples.length === 0 && (
                    <div className="empty">No examples found.<br/>Install libraries to see their examples.</div>
                  )}
                  <div className="ex-tree">
                    {Object.entries(
                      examples.reduce((acc, ex) => {
                        if (!acc[ex.lib]) acc[ex.lib] = [];
                        acc[ex.lib].push(ex);
                        return acc;
                      }, {})
                    ).map(([lib, exs]) => (
                      <div className="ex-lib" key={lib}>
                        <div className={`ex-lib-hdr ${openLibs[lib] ? 'open' : ''}`}
                          onClick={() => setOpenLibs(p => ({...p, [lib]: !p[lib]}))}>
                          <span className={`ex-arrow ${openLibs[lib] ? 'open' : ''}`}>▶</span>
                          {lib}
                          <span style={{marginLeft:'auto',color:'var(--muted)',fontSize:10}}>{exs.length}</span>
                        </div>
                        {openLibs[lib] && exs.map(ex => (
                          <div className="ex-item" key={ex.path} onClick={() => openExample(ex)}>
                            {ex.name}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
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
        <><div className="drop-ov" onClick={() => { setShowBD(false); setBoardSearch(''); }} />
          <div className="drop-menu" style={{ top: 48, left: 180, maxHeight: 420, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
              <input
                autoFocus
                className="sinput"
                style={{ margin: 0, width: '100%' }}
                placeholder="Search boards…"
                value={boardSearch}
                onChange={e => setBoardSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') { setShowBD(false); setBoardSearch(''); }
                  if (e.key === 'Enter') {
                    const match = boardList.find(b =>
                      b.name.toLowerCase().includes(boardSearch.toLowerCase()) ||
                      b.fqbn.toLowerCase().includes(boardSearch.toLowerCase())
                    );
                    if (match) { setBoard(match); setShowBD(false); setBoardSearch(''); addLog(`Board → ${match.name}`, 'system'); }
                  }
                }}
              />
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {boardList
                .filter(b =>
                  !boardSearch ||
                  b.name.toLowerCase().includes(boardSearch.toLowerCase()) ||
                  b.fqbn.toLowerCase().includes(boardSearch.toLowerCase())
                )
                .map(b => (
                  <div key={b.fqbn} className={`drop-item ${b.fqbn === board.fqbn ? 'sel' : ''}`}
                    onClick={() => { setBoard(b); setShowBD(false); setBoardSearch(''); addLog(`Board → ${b.name}`, 'system'); }}>
                    {b.name}<span className="drop-sub">{b.fqbn}</span>
                  </div>
                ))
              }
              {boardList.filter(b =>
                !boardSearch ||
                b.name.toLowerCase().includes(boardSearch.toLowerCase()) ||
                b.fqbn.toLowerCase().includes(boardSearch.toLowerCase())
              ).length === 0 && (
                <div className="drop-item" style={{ color: 'var(--muted)' }}>No boards found</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Port dropdown */}
      {showPD && (
        <><div className="drop-ov" onClick={() => setShowPD(false)} />
          <div className="drop-menu" style={{ top: 48, left: 410 }}>
            {detectedPorts.length === 0
              ? <div className="drop-item" style={{ color: 'var(--muted)' }}>No ports — plug in board then wait</div>
              : detectedPorts.map(p => {
                  const detected = detectedPorts.find ? p : p;
                  return (
                    <div key={p} className={`drop-item ${p === port ? 'sel' : ''}`}
                      onClick={() => { setPort(p); setShowPD(false); addLog(`Port → ${p}`, 'system'); }}>
                      {p}
                    </div>
                  );
                })
            }
            <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 4 }}>
              <div className="drop-item" onClick={() => { refreshPorts(); setShowPD(false); }}>{I.refresh} Refresh ports</div>
            </div>
          </div>
        </>
      )}

      {/* Serial Monitor */}
      {showSerial && (
        <div className="overlay" onClick={async e => { if (e.target === e.currentTarget) { if (serialOpen) await handleSerialClose(); setShowSerial(false); } }}>
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
              <button className="ser-x" onClick={async () => { if (serialOpen) await handleSerialClose(); setShowSerial(false); }}>✕</button>
            </div>
            <div className="ser-body">
              {serialOutput.split('\n').map((line, i) => (
                <div key={i} className="ser-line in">{line}</div>
              ))}
              <div ref={serEnd} />
            </div>
            <div className="ser-foot">
              <button className="btn ghost" style={{ padding: '7px 10px' }} onClick={() => setSerialOutput('')}>Clear</button>
              <input className="ser-input" placeholder="Send to device…" value={serialInput}
                onChange={e => setSerialInput(e.target.value)} disabled={!serialOpen}
                onKeyDown={e => e.key === 'Enter' && handleSerialSend()} />
              <select value={lineEnding} onChange={e => setLineEnding(e.target.value)}
                style={{background:'var(--bg2)',border:'1px solid var(--line)',borderRadius:'var(--r)',
                  color:'var(--text)',fontFamily:'var(--mono)',fontSize:11,padding:'6px 8px',
                  cursor:'pointer',flexShrink:0}}>
                <option value="">No line ending</option>
                <option value="\n">New line</option>
                <option value="\r">Carriage return</option>
                <option value="\r\n">Both NL & CR</option>
              </select>
              <button className="ser-send" onClick={handleSerialSend} disabled={!serialOpen}>Send</button>
            </div>
          </div>
        </div>
      )}
    {/* Error tooltip */}
      {tooltip && (
        <div className={`err-tooltip ${tooltip.kind}`}
          style={{left: Math.min(tooltip.x + 12, window.innerWidth - 400), top: tooltip.y - 36}}>
          {tooltip.kind === 'error' ? '✕' : '⚠'} {tooltip.msg}
        </div>
      )}
    </>
  );
}