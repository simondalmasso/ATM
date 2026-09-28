import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {pathToFileURL,fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const sourcePath=path.join(here,"ATM-ORDER034-ACTIVE-MAIN-READONLY.js");
const sourceText=fs.readFileSync(sourcePath,"utf8");
let code=sourceText.replace('import { DurableObject } from "cloudflare:workers";','class DurableObject { constructor(ctx,env){ this.ctx=ctx; this.env=env; } }');
code+='\nexport { ATM_SKILLS, scoreSkill };\n';
const tmp=path.join(os.tmpdir(),`atm-order053-${process.pid}-${Date.now()}.mjs`);
fs.writeFileSync(tmp,code,"utf8");
const mod=await import(pathToFileURL(tmp).href);
fs.unlinkSync(tmp);

const skills=mod.ATM_SKILLS;
const ids=skills.map(x=>x.id);
if(new Set(ids).size!==ids.length) throw new Error("DUPLICATE_SKILL_ID");
if(skills.length!==17) throw new Error("SKILL_COUNT_EXPECTED_17_GOT_"+skills.length);

for(const s of skills){
  if(!s.repo||!s.path||!s.ref||!Array.isArray(s.tags)||s.tags.length===0) throw new Error("MANIFEST_INCOMPLETE_"+s.id);
  if(!/^[0-9a-f]{40}$/.test(s.ref)) throw new Error("SKILL_REF_NOT_PINNED_"+s.id);
  if(s.license!=="MIT") throw new Error("SKILL_LICENSE_NOT_MIT_"+s.id+"_"+s.license);
  if(s.cost!=="ZERO"||s.account_required!==false||s.install_required!==false||s.secret_required!==false) throw new Error("SKILL_ZERO_COST_METADATA_INVALID_"+s.id);
  if(!["PASS","PASS_WITH_LIMITS"].includes(s.trust)) throw new Error("SKILL_TRUST_INVALID_"+s.id);
}
for(const banned of ["last30days","figures4papers"]){
  if(ids.includes(banned)) throw new Error("NONQUALIFYING_SKILL_STILL_INSTALLED_"+banned);
}
for(const required of ["ponytail.minimal","ponytail.review"]){
  if(!ids.includes(required)) throw new Error("QUALIFIED_SKILL_MISSING_"+required);
}
const route=(q)=>skills.map(s=>({...s,score:mod.scoreSkill(s,q)})).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))[0]?.id;
if(route("debug test failure root cause")!=="superpowers.systematic-debugging") throw new Error("DEBUG_ROUTE_WRONG");
if(route("UI animation motion transition")!=="emil.animate") throw new Error("ANIMATION_ROUTE_WRONG");
if(route("architecture codebase module interface refactor")!=="matt.codebase-design") throw new Error("ARCHITECTURE_ROUTE_WRONG");
if(route("scientific evidence bias confounders")!=="kdense.scientific-critical-thinking") throw new Error("SCIENCE_ROUTE_WRONG");
if(route("architecture diagram flowchart svg")!=="diagram.design") throw new Error("DIAGRAM_ROUTE_WRONG");
if(route("simplest minimal YAGNI coding solution")!=="ponytail.minimal") throw new Error("PONYTAIL_ROUTE_WRONG");
if(!sourceText.includes('error: "SKILL_NOT_FOUND"')) throw new Error("SKILL_NOT_FOUND_CONTRACT_MISSING");
if(!sourceText.includes('fetchRawGitHub(skill.repo, skill.path, [skill.ref')) throw new Error("SKILL_GET_NOT_PINNED_SOURCE_FETCH");
if(/name:\s*"(?:skill_install|skill_write|skill_execute)"/i.test(sourceText)) throw new Error("SKILL_MUTATION_TOOL_ADDED");

console.log("ORDER053_MANIFESTS=PASS");
console.log("ORDER053_PINNED_REFS=PASS");
console.log("ORDER053_LICENSES_ZERO_COST=PASS");
console.log("ORDER053_ROUTING=PASS");
console.log("ORDER053_FAIL_CLOSED_GET=PASS");
console.log("ORDER053_PUBLIC_MCP_READ_ONLY=PASS");
console.log("PRODUCTION_MUTATION_IN_TEST=0");


