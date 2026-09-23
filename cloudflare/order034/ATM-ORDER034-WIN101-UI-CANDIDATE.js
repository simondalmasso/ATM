import runtime, { ATMBrain } from "./ATM-ORDER034-ACTIVE-MAIN-READONLY.js";

const MODEL = "@cf/zai-org/glm-4.7-flash";

function shellHtml() {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>ATM 1.01 · Money Truth</title>
<style>
:root{--desk:#e8e2f0;--paper:#f7f4fa;--chrome:#d9d2e3;--ink:#000;--blue:#6666cc;--yellow:#fff3a6;--good:#087a08;--warn:#9a6100;--bad:#b00020;--muted:#555;--mcp:#4cd08a;--logo:#A276FF;--terminal:#A276FF}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--desk);color:var(--ink);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}body{padding:10px;font-size:14.5px;line-height:1.28;font-weight:600;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}button,input{font:inherit}.shell{width:min(1180px,100%);margin:0 auto}.brandstrip{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:var(--paper);border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);padding:14px 16px 12px;margin:0 0 12px}.brandmark{display:flex;align-items:center;justify-content:center;width:100%}.atm-logo{width:clamp(158px,23.25vw,285px);height:auto;display:block}.atm-logo path{stroke:var(--logo)!important}.terminal-loader{width:min(820px,100%);overflow:hidden;border-top:1px solid #c9bee0;padding:10px 0 4px;color:var(--terminal);user-select:none;display:flex;flex-direction:column;align-items:center}.terminal-matrix{position:relative;display:inline-flex;width:max-content;max-width:96%;margin-inline:auto;flex-direction:column;overflow:hidden;font:700 10px/.9 "Geist Mono",ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;letter-spacing:.12em;color:var(--terminal);text-shadow:0 0 8px rgba(162,118,255,.28)}.terminal-row{white-space:pre;height:.9em}.terminal-cursor{position:absolute;top:0;bottom:0;left:-10%;width:calc(3ch + .9em);background:var(--terminal);box-shadow:0 0 10px rgba(162,118,255,.35);will-change:left;transition:left 45ms linear;pointer-events:none}.terminal-meta{display:flex;width:100%;justify-content:flex-end;align-items:center;gap:12px;margin-top:7px;font-size:9px;color:#625a70}.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(prefers-reduced-motion:reduce){.terminal-cursor{transition:none}.terminal-matrix{text-shadow:none}}.window{background:var(--paper);border:2px solid var(--ink);box-shadow:3px 3px 0 var(--ink);margin:0 0 12px}.titlebar{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--blue);color:#fff;border-bottom:2px solid var(--ink);padding:6px 8px;font-weight:800;letter-spacing:.025em;text-transform:uppercase}.menu{display:flex;gap:20px;background:var(--yellow);border-bottom:2px solid var(--ink);padding:6px 8px;font-weight:800;letter-spacing:.015em}.body{padding:10px}.statusline{border-top:2px solid var(--ink);background:var(--chrome);padding:6px 8px;font-size:12.5px;font-weight:650}
.hero{display:grid;grid-template-columns:1.25fr .75fr;gap:10px}.moneyhero{border:2px solid var(--ink);padding:10px;background:var(--paper)}.moneyhero .label,.cell .label{font-size:11.5px;font-weight:700;text-transform:uppercase}.moneyhero .value{font-size:clamp(34px,7vw,68px);line-height:1;font-weight:700;margin:6px 0}.notearned{background:var(--yellow);border:2px solid var(--ink);padding:8px;margin-top:8px}.truthrules{display:grid;gap:6px}.truthrule{border:2px solid var(--ink);background:var(--chrome);padding:8px}.truthrule b{display:block;margin-top:3px;font-weight:800}.good{color:var(--good)}.warn{color:var(--warn)}.bad{color:var(--bad)}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:2px solid var(--ink);border-left:2px solid var(--ink)}.cell{min-width:0;padding:8px;background:var(--paper);border-right:2px solid var(--ink);border-bottom:2px solid var(--ink)}.cell b{display:block;margin-top:3px;font-size:17px;font-weight:800;overflow-wrap:anywhere}.cell small{display:block;color:var(--muted);margin-top:3px;font-size:12px;font-weight:600;overflow-wrap:anywhere}.split{display:grid;grid-template-columns:1.35fr .65fr;gap:12px}.table{border:2px solid var(--ink)}.row{display:grid;grid-template-columns:minmax(180px,2fr) 95px 100px minmax(160px,1fr);border-bottom:2px solid var(--ink);background:var(--paper)}.row:last-child{border-bottom:0}.row.head{background:var(--chrome);font-weight:700}.row>div{min-width:0;padding:7px;border-right:2px solid var(--ink);overflow-wrap:anywhere}.row>div:last-child{border-right:0}.sourcegrid{display:grid;gap:0;border:2px solid var(--ink)}.source{display:grid;grid-template-columns:1fr auto;gap:8px;padding:7px;background:var(--paper);border-bottom:2px solid var(--ink)}.source:last-child{border-bottom:0}.source small{display:block;color:var(--muted);font-weight:600}.log{max-height:290px;overflow:auto;border:2px solid var(--ink);background:var(--paper)}.event{padding:7px;border-bottom:1px solid var(--ink)}.event:last-child{border-bottom:0}.event time{display:block;color:var(--muted);font-size:11px;margin-top:2px}.empty{padding:16px;background:var(--paper);border:2px solid var(--ink)}
@media(max-width:800px){body{padding:7px;font-size:15px;line-height:1.32}.brandstrip{padding:10px 9px 9px;gap:6px}.atm-logo{width:min(54vw,255px)}.terminal-loader{padding-top:7px}.terminal-matrix{font-size:10px;letter-spacing:.075em}.hero,.split{grid-template-columns:1fr}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.menu{gap:12px;overflow:auto;white-space:nowrap}.titlebar{align-items:flex-start}.row{grid-template-columns:1fr 1fr}.row.head{display:none}.row>div{border-right:0;border-bottom:1px dotted var(--ink)}.row>div:nth-child(odd){border-right:2px solid var(--ink)}.row>div::before{display:block;font-size:10px;color:var(--muted);text-transform:uppercase}.row>div:nth-child(1)::before{content:"Tarea"}.row>div:nth-child(2)::before{content:"Estado"}.row>div:nth-child(3)::before{content:"Potencial"}.row>div:nth-child(4)::before{content:"Bloqueo"}}
@media(max-width:420px){body{padding:5px;font-size:15px;line-height:1.34;font-weight:650}.brandstrip{padding:9px 7px 8px}.atm-logo{width:min(55.5vw,225px)}.terminal-matrix{font-size:10px;letter-spacing:.055em}.terminal-meta{font-size:10px}.titlebar{font-size:13px;padding:7px 8px}.menu{font-size:13px;padding:7px 8px;gap:14px}.statusline{font-size:12.5px}.moneyhero .label,.cell .label{font-size:12px}.grid{grid-template-columns:1fr}.row{grid-template-columns:1fr}.row>div:nth-child(odd){border-right:0}.moneyhero .value{font-size:42px}.menu{font-size:12px}.body{padding:7px}}
</style>
</head>
<body>
<main class="shell">
<header class="brandstrip">
  <div class="brandmark"><svg class="atm-logo" width="76" height="65" viewBox="0 0 114 97" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round" aria-label="ATM">
      <path d="M91.7715 63.6245V94.3445L85.0813 90.4745V67.4446L82.7812 66.1145L80.6213 64.8645V82.7845L74.2314 79.0846L73.9314 78.9146V61.0045L69.4714 58.4246V81.4645L62.7812 77.5945V46.8845L63.7615 47.4546L66.6013 49.0945L82.7812 58.4346L89.4714 62.2946L91.7715 63.6245Z" stroke="#A276FF"/><path d="M56.6411 43.3445V51.0145L46.6011 45.2245V68.2645L39.9111 64.3945V41.3645L38.1611 40.3545L29.8711 35.5646V27.8845L44.8511 36.5345L56.6411 43.3445Z" stroke="#A276FF"/><path d="M85.0811 67.4446V80.5546L80.6211 82.7845V64.8645L82.781 66.1145L85.0811 67.4446Z" stroke="#A276FF"/><path d="M29.8716 27.8844V35.5645L38.1616 40.3544L39.9116 41.3644V48.1744L24.8516 55.7045V24.9844L30.5916 22.1144L37.7217 18.5544L44.8516 14.9844V20.3944L38.1616 23.7444L35.6116 25.0144L29.8716 27.8844Z" stroke="#A276FF"/><path d="M76.6406 33.3445V39.9546L75.6606 40.4446L66.6006 44.9745L62.7805 46.8845V47.9446L59.9106 49.3845L56.6406 51.0145V43.3445L59.9106 41.7145L66.6006 38.3645L69.5208 36.9045L76.6406 33.3445Z" stroke="#A276FF"/><path d="M44.851 14.9845L37.7211 18.5546L30.5909 22.1145L24.851 24.9845L23.5011 24.2046L22.5409 23.6545L2.54102 12.1045L22.5409 2.10449L44.851 14.9845Z" stroke="#A276FF"/><path d="M23.5011 24.2046L22.5409 23.6545L2.54102 12.1045V42.8246L9.24097 46.6846V39.0145L16.361 43.1245L18.161 44.1646V51.8445L24.851 55.7046V24.9845L23.5011 24.2046ZM18.161 36.4845L9.24097 31.3346V23.6545L16.371 27.7745L18.161 28.8046V36.4845Z" stroke="#A276FF"/><path d="M16.3702 27.7745L9.24023 31.3346V23.6545L16.3702 27.7745Z" stroke="#A276FF"/><path d="M18.1603 28.8044V36.4844L9.24023 31.3345L16.3702 27.7744L18.1603 28.8044Z" stroke="#A276FF"/><path d="M16.3602 43.1246L9.24023 46.6847V39.0146L16.3602 43.1246Z" stroke="#A276FF"/><path d="M76.6411 33.3445L69.5212 36.9045L66.6011 38.3645L59.9111 41.7145L56.6411 43.3445L44.8511 36.5345L29.8711 27.8845L35.6111 25.0145L38.1611 23.7445L44.8511 20.3945L49.8711 17.8845L76.6411 33.3445Z" stroke="#A276FF"/><path d="M62.7815 47.9447V60.1747L46.6016 68.2646V45.2246L56.6416 51.0146L59.9116 49.3846L62.7815 47.9447Z" stroke="#A276FF"/><path d="M111.771 53.6245L104.641 57.1946L100.621 59.2046L93.9314 62.5446L91.7715 63.6245L89.4714 62.2946L82.7812 58.4346L66.6013 49.0945L63.7615 47.4546L62.7812 46.8845L66.6013 44.9745L75.6614 40.4446L76.6414 39.9546L82.7812 36.8845L111.771 53.6245Z" stroke="#A276FF"/><path d="M111.771 53.6245V84.3445L91.7715 94.3445V63.6245L93.9314 62.5446L100.621 59.2046L104.641 57.1946L111.771 53.6245Z" stroke="#A276FF"/><path d="M74.2307 79.0846L69.4707 81.4645V58.4246L73.9307 61.0045V78.9146L74.2307 79.0846Z" stroke="#A276FF"/>
    </svg></div>
  <div class="terminal-loader" id="mcpTerminal">
    <div class="terminal-matrix" id="mcpTerminalMatrix" aria-hidden="true">
      <div class="terminal-row">............................................................</div>
      <div class="terminal-row">............................................................</div>
      <div class="terminal-row">............................................................</div>
      <div class="terminal-row">............................................................</div>
      <div class="terminal-row">............................................................</div>
      <div class="terminal-cursor" id="mcpTerminalCursor"></div>
    </div>
    <span class="sr-only" id="mcpWord" aria-live="polite">IDLE</span>
    <div class="terminal-meta"><span id="mcpMeta">MCP · /mcp · esperando tráfico</span></div>
  </div>
</header>
<section class="window">
  <div class="titlebar"><span>ATM 1.01 · MONEY TRUTH</span><span id="clock">—</span></div>
  <div class="menu"><span>MONEY</span><span>EXECUTION</span><span>MARKET</span><span>LOG</span></div>
  <div class="body hero">
    <div class="moneyhero">
      <div class="label">REALIZED · EXTERNAL EVIDENCE ONLY</div>
      <div class="value" id="realized">$—</div>
      <div id="paidDetail">PAID $—</div>
      <div class="notearned"><b id="submitted">SUBMITTED · NOT EARNED $—</b><div id="accepted">ACCEPTED · NOT EARNED $—</div><div id="potential">POTENTIAL · NOT EARNED $—</div></div>
    </div>
    <div class="truthrules">
      <div class="truthrule"><span>EXECUTION</span><b id="exec">—</b><small id="execDetail"></small></div>
      <div class="truthrule"><span>WATCHDOG</span><b id="watchdog">—</b><small id="anomaly"></small></div>
      <div class="truthrule"><span>MARKET DATA</span><b id="freshness">—</b><small id="freshnessDetail"></small></div>
    </div>
  </div>
  <div class="statusline" id="truthline">Cargando verdad operativa…</div>
</section>
<section class="window"><div class="titlebar"><span>MARKET HEALTH</span><span>cron 15 min</span></div><div class="grid" id="marketGrid"></div></section>
<section class="window"><div class="titlebar"><span>EXECUTION QUEUE</span><span id="queueSummary">—</span></div><div class="body"><div class="table" id="queue"></div></div></section>
<div class="split">
  <section class="window"><div class="titlebar"><span>OPPORTUNITIES</span><span id="oppsCount">—</span></div><div class="body"><div class="table" id="opps"></div></div></section>
  <aside>
    <section class="window"><div class="titlebar"><span>SOURCES</span><span id="sourcesSummary">—</span></div><div class="body"><div class="sourcegrid" id="sources"></div></div></section>
    <section class="window"><div class="titlebar"><span>EVENT LOG</span><span>latest</span></div><div class="body"><div class="log" id="events"></div></div></section>
  </aside>
</div>
<section class="window"><div class="titlebar"><span>TRUTH RULES</span><span>ATM</span></div><div class="body">PAID ≠ SUBMITTED. POTENTIAL ≠ EARNED. UNKNOWN ≠ YES. OUT_OF_POCKET_SPEND_USD = 0. Dashboard read-only.</div><div class="statusline">Model: ${MODEL}</div></section>
</main>
<script>
const $=s=>document.querySelector(s);
const esc=s=>String(s??"—").replace(/[&<>"']/g,c=>c==="&"?"&amp;":c==="<"?"&lt;":c===">"?"&gt;":c.charCodeAt(0)===34?"&quot;":"&#39;");
const usd=v=>'$'+Number(v||0).toFixed(2);
function tone(x){x=String(x||'');if(/ABORTED|STALLED|FAILED|ERROR|REJECTED/.test(x))return'bad';if(/DEGRADED|WAITING|RETRY|STALE/.test(x))return'warn';if(/RUNNING|PASS|HEALTHY|PAID|READY|IDLE_NO_AUTO_ELIGIBLE/.test(x))return'good';return''}
function ageLabel(iso){const t=Date.parse(iso||'');if(!Number.isFinite(t))return{label:'UNKNOWN',cls:'warn',age:'sin timestamp'};const m=Math.max(0,Math.round((Date.now()-t)/60000));return m>20?{label:'STALE',cls:'bad',age:m+' min'}:m>15?{label:'LATE',cls:'warn',age:m+' min'}:{label:'FRESH',cls:'good',age:m+' min'}}
let mcpBusy=false,mcpFrame=0,mcpSeen=null;
function setMcpHeartbeat(mcp={}){mcpBusy=mcp.active===true;mcpSeen=mcp.last_seen_at||null;const box=$('#mcpTerminal');box.classList.toggle('busy',mcpBusy);$('#mcpWord').textContent=mcpBusy?'BUSY':'IDLE';const seen=mcpSeen?new Date(mcpSeen).toLocaleTimeString('es-AR'):null;const live=Array.isArray(mcp.active_consumers)?mcp.active_consumers:[];const who=(live.length?live.map(x=>x&&x.name).filter(Boolean):[mcp.last_client_name]).filter(Boolean).slice(0,3).join(' + ')||'cliente desconocido';const count=mcpBusy?(mcp.active_clients||live.length||1):0;$('#mcpMeta').textContent=mcpBusy?('MCP · /mcp · '+count+' cliente(s) · '+who+' · último uso '+(seen||'—')):(seen?('MCP · /mcp · '+who+' · último uso '+seen):'MCP · /mcp · esperando tráfico')}
let mcpRenderWord='IDLE';
const MCP_BIG_FONT={
  I:['11111','00100','00100','00100','11111'],
  D:['11110','10001','10001','10001','11110'],
  L:['10000','10000','10000','10000','11111'],
  E:['11111','10000','11110','10000','11111'],
  B:['11110','10001','11110','10001','11110'],
  U:['10001','10001','10001','10001','11111'],
  S:['11111','10000','11111','00001','11111'],
  Y:['10001','01010','00100','00100','00100']
};
function mcpWordBitmap(word){
  return Array.from({length:5},(_,r)=>word.split('').map(ch=>MCP_BIG_FONT[ch][r]).join('0'));
}
function renderTerminalLoader(){
  const matrix=$('#mcpTerminalMatrix'),cursor=$('#mcpTerminalCursor');if(!matrix||!cursor)return;
  const rowEls=[...matrix.querySelectorAll('.terminal-row')],rows=5,cols=innerWidth<=420?52:innerWidth<=800?60:72,word=mcpBusy?'BUSY':'IDLE';
  if(word!==mcpRenderWord){mcpRenderWord=word;mcpFrame=0}
  const bitmap=mcpWordBitmap(word),wordWidth=bitmap[0].length,wordStart=Math.floor((cols-wordWidth)/2);
  const travel=cols+18,head=(mcpFrame%travel)-7,h=Math.floor(head);
  for(let r=0;r<rows;r++){
    const line=Array(cols).fill('.');
    const trail=[['░',h-3],['▒',h-2],['▓',h-1]];
    for(const [g,x] of trail)if(x>=0&&x<cols)line[x]=g;
    for(let x=0;x<h-4;x++){
      const d=h-x;
      if(d>6&&d<22&&((x*13+r*17+mcpFrame)%Math.max(9,d+5)===0))line[x]=d<12?'▒':'░';
    }
    for(let bx=0;bx<wordWidth;bx++){
      if(bitmap[r][bx]!=='1')continue;
      const x=wordStart+bx,d=h-x;
      if(x<0||x>=cols)continue;
      if(d>=3)line[x]='█';
      else if(d===2)line[x]='▓';
      else if(d===1)line[x]='▒';
      else if(d===0)line[x]='░';
    }
    rowEls[r].textContent=line.join('');
  }
  const pct=(head/cols)*100;
  cursor.style.left=Math.max(-12,Math.min(108,pct))+'%';
  mcpFrame++;
}
setInterval(renderTerminalLoader,45);renderTerminalLoader();
function cell(k,v,s=''){return'<div class="cell"><span class="label">'+esc(k)+'</span><b>'+esc(v)+'</b>'+(s?'<small>'+esc(s)+'</small>':'')+'</div>'}
function row(x){const state=x.execution_stage||x.ai_executability||'UNKNOWN',block=(x.blockers||[]).join(' · ')||'NONE';return'<div class="row"><div><b>'+esc(x.title||x.source_task_id||x.opportunity_id||'TASK')+'</b><small>'+esc(x.source||'—')+'</small></div><div class="'+tone(state)+'">'+esc(state)+'</div><div>'+usd(x.estimated_net_usd||x.potential_not_earned_usd||0)+'</div><div>'+esc(block)+'</div></div>'}
function queueRow(x){const state=x.state||x.execution_stage||x.queue_classification||'UNKNOWN';return'<div class="row"><div><b>'+esc(x.title||x.source_task_id||x.opportunity_id||'TASK')+'</b><small>'+esc(x.source||'—')+'</small></div><div class="'+tone(state)+'">'+esc(state)+'</div><div>'+usd(x.potential_not_earned_usd||0)+'</div><div>'+esc((x.blockers||[]).join(' · ')||x.queue_classification||'NONE')+'</div></div>'}
function head(){return'<div class="row head"><div>TAREA</div><div>ESTADO</div><div>POTENCIAL</div><div>BLOQUEO</div></div>'}
function eventRow(x){const type=x.transition||x.type||'EVENT',at=x.timestamp||x.observed_at||x.at||'';return'<div class="event"><b class="'+tone(type)+'">'+esc(type)+'</b> · '+esc(x.message||x.source_task_id||x.task_id||'—')+'<time>'+esc(at)+'</time></div>'}
async function getJson(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(url+' HTTP '+r.status);return r.json()}
async function load(){
  $('#clock').textContent=new Date().toLocaleString('es-AR');
  try{
    const [s,o,money,eventFeed]=await Promise.all([getJson('/api/status'),getJson('/api/opportunities'),getJson('/api/money-loop'),getJson('/api/task-events')]);
    setMcpHeartbeat(s.mcp_activity||{});
    const e=money.earnings||{};
    $('#realized').textContent=usd(e.paid);
    $('#paidDetail').textContent='PAID '+usd(e.paid)+' · WITHDRAWABLE '+usd(e.withdrawable)+' · WITHDRAWN '+usd(e.withdrawn);
    $('#submitted').textContent='SUBMITTED · NOT EARNED '+usd(e.submitted);
    $('#accepted').textContent='ACCEPTED · NOT EARNED '+usd(e.accepted);
    const queue=money.execution_queue?.rows||[];
    const opps=o.results||[];
    const potential=[...queue,...opps].reduce((a,x)=>a+Number(x.potential_not_earned_usd??x.estimated_net_usd??0),0);
    $('#potential').textContent='POTENTIAL · NOT EARNED '+usd(potential);

    const ex=s.agentic_execution?.status||'UNKNOWN';
    $('#exec').textContent=ex;$('#exec').className=tone(ex);$('#execDetail').textContent=(s.agentic_execution?.auto_eligible_now??0)+' auto-eligible · '+(s.agentic_execution?.signer_ready?'signer ready':'signer standby');
    const wd=s.economic_watchdog||{};const wds=wd.classification||'UNKNOWN';$('#watchdog').textContent=wds;$('#watchdog').className=tone(wds);$('#anomaly').textContent=(wd.anomaly||'NONE')+' · recovery '+(wd.recommended_action||'NONE');
    const fresh=ageLabel(s.source_discovery?.last_discovery);$('#freshness').textContent=fresh.label;$('#freshness').className=fresh.cls;$('#freshnessDetail').textContent=fresh.age+' · '+(s.source_discovery?.last_discovery||'sin last_discovery');
    $('#truthline').textContent='REALIZED='+usd(e.paid)+' · EXECUTION='+ex+' · WATCHDOG='+(wd.anomaly||wds)+' · MARKET='+fresh.label;

    const rd=s.source_discovery||{},tm=s.task_market||{};
    $('#marketGrid').innerHTML=[['OPEN',tm.open_tasks??rd.raw_found??0,'mercado'],['AUTO_ELIGIBLE',s.agentic_execution?.auto_eligible_now??0,'ejecutables'],['SOURCES OK',rd.sources_ok??0,'discover'],['SOURCES FAIL',rd.sources_failed??0,'discover'],['DAYDREAMS',tm.daydreams?.open_tasks??0,'open'],['ZERO COST',tm.daydreams?.zero_cost_routes??0,'routes'],['LAST',rd.last_discovery||'—','discovery'],['NEXT',rd.next_discovery||'—','discovery']].map(x=>cell(...x)).join('');

    $('#queueSummary').textContent=queue.length+' rows';
    $('#queue').innerHTML=queue.length?head()+queue.slice(0,40).map(queueRow).join(''):'<div class="empty">Cola vacía.</div>';
    const sorted=[...opps].sort((a,b)=>Number(b.estimated_net_usd||0)-Number(a.estimated_net_usd||0));
    $('#oppsCount').textContent=sorted.length+' reales';
    $('#opps').innerHTML=sorted.length?head()+sorted.slice(0,40).map(row).join(''):'<div class="empty">0 oportunidades abiertas.</div>';

    const sources=Object.values(s.sources||{});$('#sourcesSummary').textContent=sources.length+' sources';
    $('#sources').innerHTML=sources.length?sources.map(x=>'<div class="source"><div><b>'+esc(x.source||x.id||'SOURCE')+'</b><small>'+esc(x.discovery_mode||'—')+' · '+esc(x.automatic_action_level||'—')+'</small><small>attempt '+esc(x.last_attempt||'—')+' · success '+esc(x.last_success||'—')+' · results '+esc(x.result_count??0)+'</small></div><b class="'+(x.running?'good':'warn')+'">'+(x.running?'RUNNING':'OFF')+'</b></div>').join(''):'<div class="empty">Sin fuentes.</div>';
    const material=(eventFeed.results||[]).slice(0,30);const activity=(s.activity||[]).slice(0,20);const events=[...material,...activity].sort((a,b)=>String(b.timestamp||b.observed_at||b.at||'').localeCompare(String(a.timestamp||a.observed_at||a.at||''))).slice(0,30);$('#events').innerHTML=events.length?events.map(eventRow).join(''):'<div class="empty">Sin eventos.</div>';
  }catch(err){$('#truthline').textContent='DEGRADED · '+err.message;$('#truthline').className='statusline bad'}
}
async function pollMcp(){try{setMcpHeartbeat(await getJson('/api/mcp-heartbeat'))}catch{}}
load();pollMcp();setInterval(load,15000);setInterval(pollMcp,3000);
<\/script>
</body></html>`;
}

const candidate = {
  ...runtime,
  async fetch(req, env, ctx) {
    const u = new URL(req.url);
    if (req.method === "GET" && u.pathname === "/") {
      return new Response(shellHtml(), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
    }
    return runtime.fetch(req, env, ctx);
  },
};

export { ATMBrain };
export default candidate;
