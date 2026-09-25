import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const candidate = path.join(here, 'ATM-ORDER034-WIN101-UI-CANDIDATE.js');
const src = fs.readFileSync(candidate, 'utf8');
const checks = [];
const check = (name, ok) => { checks.push([name, !!ok]); if (!ok) throw new Error(name); };

check('USES_EXISTING_RUNTIME', src.includes('ATM-ORDER034-ACTIVE-MAIN-READONLY.js'));
check('ROOT_ONLY_UI_OVERRIDE', src.includes('u.pathname === "/"') && src.includes('return runtime.fetch(req, env, ctx)'));
check('TRUTH_REALIZED', src.includes('REALIZED · EXTERNAL EVIDENCE ONLY'));
check('TRUTH_POTENTIAL_NOT_EARNED', (src.match(/NOT EARNED/g) || []).length >= 3);
check('TRUTH_UNKNOWN_NE_YES', src.includes('UNKNOWN ≠ YES'));
check('BAD_ABORTED_STALLED', /ABORTED||STALLED\|FAILED\|ERROR\|REJECTED/.test(src));
check('STALE_DATA_VISIBLE', src.includes("label:'STALE'") && src.includes("label:'LATE'"));
check('READ_ONLY_DASHBOARD', !/method\s*:\s*['\"]POST['\"]/.test(src));
check('META_HACKATHON_WATCH_VISIBLE', src.includes('META GLOBAL AI DEVELOPER HACKATHON') && src.includes('NOTIFICATION SENT · APPLICATIONS OPENING SOON') && src.includes('$1M cash prize pool') && src.includes('$150 Meta Model API credits per participant'));
check('META_HACKATHON_MONEY_TRUTH', src.includes('NOT YET EARNABLE') && src.includes('application not submitted') && src.includes('reverify official rules before action'));
check('META_HACKATHON_OFFICIAL_LINK', src.includes('https://dev.meta.ai/events/global-hackathon'));
check('NO_MODERN_ROUNDING', !src.includes('border-radius'));
check('NO_GRADIENTS', !/gradient\s*\(/i.test(src));
check('LILAC_DESKTOP_BG', src.includes('--desk:#e8e2f0') && src.includes('--paper:#f7f4fa') && !src.includes('--desk:#55ff55'));
check('ATM_SVG_ONLY_MASTHEAD', src.includes('class="atm-logo"') && !src.includes('UNIVERSAL MCP FABRIC · MONEY TRUTH') && !src.includes('<div class="brandcopy">'));
check('TERMINAL_LOADER_ALWAYS_ON', src.includes('setInterval(renderTerminalLoader,45)') && src.includes("rows=5,cols=innerWidth<=420?52:innerWidth<=800?60:72") && src.includes("line=Array(cols).fill('.')") && src.includes('class="terminal-cursor"'));
check('TERMINAL_BUSY_IDLE', src.includes("word=mcpBusy?'BUSY':'IDLE'") && src.includes("mcpBusy=mcp.active===true") && src.includes("const bitmap=mcpWordBitmap(word)") && src.includes("if(d>=3)line[x]='█'") && src.includes("cursor.style.left="));
check('MCP_CLIENT_IDENTITY_VISIBLE', src.includes("mcp.active_consumers") && src.includes("mcp.last_client_name") && src.includes("cliente(s)") && src.includes("último uso"));
check('TERMINAL_UNDER_SVG', src.indexOf('class="atm-logo"') < src.indexOf('id="mcpTerminal"'));
check('MOBILE_LOGO_25PCT_REDUCED', src.includes('.atm-logo{width:min(55.5vw,225px)}') && src.includes('.atm-logo{width:min(54vw,255px)}') && src.includes('.atm-logo{width:clamp(158px,23.25vw,285px)'));
check('MOBILE_TYPE_LEGIBLE', src.includes('font-size:15px;line-height:1.34;font-weight:650') && src.includes('font-family:ui-monospace'));
check('MOBILE_800', src.includes('@media(max-width:800px)'));
check('MOBILE_420', src.includes('@media(max-width:420px)'));

const syntax = spawnSync(process.execPath, ['--check', candidate], { encoding: 'utf8' });
check('NODE_SYNTAX', syntax.status === 0);

const fnStart = src.indexOf('function shellHtml() {');
const candidateStart = src.indexOf('const candidate = {', fnStart);
const fnEnd = candidateStart > 0 ? src.lastIndexOf('}', candidateStart) : -1;
check('SHELL_HTML_FOUND', fnStart >= 0 && candidateStart > fnStart && fnEnd > fnStart);
const shellFnSource = src.slice(fnStart, fnEnd + 1);
const html = new Function('MODEL', shellFnSource + '\nreturn shellHtml();')('@cf/zai-org/glm-4.7-flash');
const scriptStart = html.indexOf('<script>') + '<script>'.length;
const scriptEnd = html.indexOf('<\\/script>', scriptStart) >= 0 ? html.indexOf('<\\/script>', scriptStart) : html.indexOf('</script>', scriptStart);
check('RENDERED_SCRIPT_FOUND', scriptStart >= '<script>'.length && scriptEnd > scriptStart);
const renderedScript = html.slice(scriptStart, scriptEnd);
let renderedParseOk = true;
try { new Function(renderedScript); } catch { renderedParseOk = false; }
check('RENDERED_BROWSER_SCRIPT_SYNTAX', renderedParseOk);
check('TERMINAL_LILAC', html.includes('--terminal:#A276FF') && html.includes('--logo:#A276FF') && html.includes('.atm-logo path{stroke:var(--logo)!important}'));
check('TERMINAL_WRITES_WORD', html.includes("const MCP_BIG_FONT=") && html.includes("mcpWordBitmap(word)") && html.includes("if(d>=3)line[x]='█'") && html.includes('id="mcpTerminalCursor"'));
check('TERMINAL_WORD_IS_LARGE', html.includes("I:['11111','00100','00100','00100','11111']") && html.includes("B:['11110','10001','11110','10001','11110']") && html.includes("cols=innerWidth<=420?52:innerWidth<=800?60:72"));
check('TERMINAL_MATCHES_REFERENCE', html.includes("width:calc(3ch + .9em)") && html.includes("['░',h-3]") && html.includes("['▒',h-2]") && html.includes("['▓',h-1]"));
check('TERMINAL_CENTERED_WIDE', html.includes('display:flex;flex-direction:column;align-items:center') && html.includes('width:max-content;max-width:96%;margin-inline:auto'));

console.log(JSON.stringify({ ok: true, checks: Object.fromEntries(checks) }, null, 2));
