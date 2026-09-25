import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const workflow=fs.readFileSync(path.join(root,".github/workflows/deploy-cloudflare.yml"),"utf8");
const start=workflow.indexOf('if [[ "$PROD_SHA" =~ ^[0-9a-f]{40}$ ]]');
const end=workflow.indexOf('cat "$RUNNER_TEMP/changed.txt"',start);
if(start<0||end<0) throw new Error("PATH_GATE_BLOCK_NOT_FOUND");
const block=workflow.slice(start,end);
if(!block.includes("PRODUCTION_SHA_UNAVAILABLE_FORCE_MAIN_DEPLOY=1")) throw new Error("UNKNOWN_PROD_SHA_NOT_FORCING_RECONCILIATION");
if(!block.includes("cloudflare/order034/ATM-ORDER034-ACTIVE-MAIN-READONLY.js")) throw new Error("UNKNOWN_PROD_SHA_MISSING_CANONICAL_RUNTIME_MARKER");
if(block.includes("git diff-tree -m --no-commit-id --name-only -r")) throw new Error("UNKNOWN_PROD_SHA_STILL_ONLY_INSPECTS_LATEST_COMMIT");
console.log("ORDER054_UNKNOWN_PROD_SHA_FORCE_MAIN=PASS");
console.log("ORDER054_DOCS_ONLY_SKIP_RECOVERS_AFTER_SHA_READBACK=PASS");
