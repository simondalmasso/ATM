import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'ATM-ORDER034-ACTIVE-MAIN-READONLY.js'), 'utf8');
const cfg = JSON.parse(fs.readFileSync(path.join(here, 'wrangler.order034.main.jsonc'), 'utf8'));
const checks = [];
const check = (name, ok) => { checks.push([name, !!ok]); if (!ok) throw new Error(name); };

check('HEALTH_EXPOSES_GIT_SHA', src.includes('git_sha: env.ATM_GIT_SHA || "UNKNOWN"'));
check('HEALTH_SHA_IS_PUBLIC_NON_SECRET_ONLY', !/git_sha[^\n]{0,200}(TOKEN|SECRET|PRIVATE_KEY|MNEMONIC)/.test(src));
check('WRANGLER_HAS_GIT_SHA_VAR', typeof cfg.vars?.ATM_GIT_SHA === 'string');
check('WRANGLER_PRESERVES_EXECUTION_ENABLED', cfg.vars?.EXECUTION_ENABLED === 'true');
check('WRANGLER_PRESERVES_AI', cfg.ai?.binding === 'AI');
check('WRANGLER_PRESERVES_DURABLE_OBJECT', cfg.durable_objects?.bindings?.some((x) => x.name === 'ATM_BRAIN' && x.class_name === 'ATMBrain'));
check('WRANGLER_PRESERVES_SIGNER_SERVICE', cfg.services?.some((x) => x.binding === 'TASKMARKET_SIGNER' && x.service === 'atm-taskmarket-signer' && x.environment === 'production'));
check('WRANGLER_VERSION_URLS_ENABLED', cfg.preview_urls === true);

console.log(JSON.stringify({ ok: true, checks: Object.fromEntries(checks) }, null, 2));
