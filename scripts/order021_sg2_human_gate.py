from __future__ import annotations

import hashlib
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from atm_core.human_gate import HumanGateRequest, qualify
from atm_core.simon_gate import TelegramBot

RECEIPT = Path("order010-simon-gate-receipt.json")
ISSUE = 49
MARKER = "ATM HUMAN GATE REQUEST"
TERMINAL = {"VERIFIED_COMPLETE", "REJECTED_BY_OWNER", "EXPIRED", "INVALIDATED", "FAILED"}
DASHBOARD = "https://atm.simondalmasso44.workers.dev/"


def _digest(value: Any) -> str:
    raw = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    return hashlib.sha256(raw).hexdigest()


def build_request(selected: dict[str, Any], *, now: datetime | None = None) -> HumanGateRequest:
    now = now or datetime.now(timezone.utc)
    external_hash = _digest(selected)
    source_id = str(selected.get("source_id") or "")
    if not source_id.startswith("guru:"):
        raise ValueError("SG2_SOURCE_ID_INVALID")
    url = str(selected.get("url") or "")
    if not url.startswith("https://www.guru.com/") and not url.startswith("https://guru.com/"):
        raise ValueError("SG2_SOURCE_URL_INVALID")
    request_id = "sg2-" + hashlib.sha256(f"{source_id}:{external_hash}".encode()).hexdigest()[:24]
    title = str(selected.get("title") or source_id)[:180]
    request = HumanGateRequest(
        request_id=request_id,
        source="guru",
        source_object_id=source_id,
        source_object_url=url,
        opportunity_id=source_id,
        rail_owner="ORDER010_SG2",
        current_external_object_hash=external_hash,
        human_gate_class="PLATFORM_APPROVAL",
        human_only_evidence=True,
        required_action="OPEN_EXACT_JOB_AND_SUBMIT_PREPARED_PROPOSAL",
        short_title=f"Guru: {title}",
        why_required="The qualified zero-cost opportunity requires the owner to perform the platform-only submission step.",
        exact_action_label="REVIEW IN ATM HUMAN GATE",
        safe_action_url=url,
        owner_cost_usd="0",
        financial_effect="NO_OWNER_SPEND; COMMERCIAL_PROPOSAL_ONLY",
        irreversibility="PLATFORM_SUBMISSION",
        risk_summary="Review exact job and proposal before submitting. Telegram is notification-only and cannot change state.",
        post_gate_resume="SG2_REFETCH_GURU_OBJECT_AFTER_OWNER_ACTION",
        external_readback_contract="GURU_PUBLIC_OBJECT_REFETCH_REQUIRED",
        evidence_refs=("ORDER-010-SG2", "ORDER-021", "Issue#38 diagnostic only"),
        created_at=now.isoformat(),
        updated_at=now.isoformat(),
    ).normalized()
    ok, errors = qualify(request)
    if not ok:
        raise ValueError("|".join(errors))
    return request


def telegram_message(request: HumanGateRequest, selected: dict[str, Any]) -> str:
    return "\n".join([
        "ATM HUMAN GATE",
        f"request_id: {request.request_id}",
        f"dedupe_key: {request.dedupe_key}",
        f"source: Guru · {selected.get('title') or request.source_object_id}",
        "owner_cost_usd: 0",
        "Review and act only in the canonical ATM Human Gate inbox:",
        DASHBOARD,
        "Telegram is notification-only. Replies here do not complete or mutate the gate.",
    ])


def _headers() -> dict[str, str]:
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ATM-ORDER021-SG2/1.0"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def _github_json(url: str) -> Any:
    with urllib.request.urlopen(urllib.request.Request(url, headers=_headers()), timeout=20) as response:
        return json.loads(response.read().decode("utf-8"))


def _issue_rows() -> list[dict[str, Any]]:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not repo:
        return []
    issue = _github_json(f"https://api.github.com/repos/{repo}/issues/{ISSUE}")
    count = int(issue.get("comments") or 0) if isinstance(issue, dict) else 0
    rows: list[dict[str, Any]] = []
    for page in range(1, max(1, (count + 99) // 100) + 1):
        chunk = _github_json(f"https://api.github.com/repos/{repo}/issues/{ISSUE}/comments?per_page=100&page={page}")
        if isinstance(chunk, list):
            rows.extend(x for x in chunk if isinstance(x, dict))
    return rows


def _parse_request(body: str) -> dict[str, Any] | None:
    if not str(body).startswith(MARKER):
        return None
    match = re.search(r"```json\s*([\s\S]*?)\s*```", str(body))
    if not match:
        return None
    try:
        payload = json.loads(match.group(1))
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) and payload.get("schema") == "ATM_HUMAN_GATE_REQUEST_V1" else None


def persist_canonical(request: HumanGateRequest) -> tuple[str, str]:
    repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if not repo or not token:
        raise RuntimeError("CANONICAL_HUMAN_GATE_GITHUB_CONTEXT_REQUIRED")
    for row in reversed(_issue_rows()):
        payload = _parse_request(str(row.get("body") or ""))
        if payload and str(payload.get("dedupe_key") or "") == request.dedupe_key and str(payload.get("state") or "PENDING_OWNER") not in TERMINAL:
            return str(payload.get("request_id") or request.request_id), "DEDUPED_EXISTING"
    body = f"{MARKER}\n```json\n{json.dumps(request.owner_dict(), sort_keys=True)}\n```"
    req = urllib.request.Request(
        f"https://api.github.com/repos/{repo}/issues/{ISSUE}/comments",
        data=json.dumps({"body": body}).encode(),
        method="POST",
        headers={**_headers(), "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=20) as response:
        posted = json.loads(response.read().decode("utf-8"))
    return request.request_id, str(posted.get("html_url") or "POSTED")


def _repo_variable(name: str, value: str) -> str:
    token = os.getenv("GITHUB_TOKEN", "").strip(); repo = os.getenv("GITHUB_REPOSITORY", "").strip()
    if not token or not repo:
        return "NO_GITHUB_WRITE_CONTEXT"
    base = f"https://api.github.com/repos/{repo}/actions/variables"; encoded = urllib.parse.quote(name, safe="")
    headers = {**_headers(), "Content-Type": "application/json"}
    exists = False
    try:
        with urllib.request.urlopen(urllib.request.Request(f"{base}/{encoded}", headers=headers), timeout=15) as response:
            exists = response.status == 200
    except urllib.error.HTTPError as exc:
        if exc.code != 404:
            return f"VARIABLE_READ_HTTP_{exc.code}"
    body = json.dumps({"name": name, "value": str(value)}).encode()
    req = urllib.request.Request(f"{base}/{encoded}" if exists else base, data=body, headers=headers, method="PATCH" if exists else "POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            return "UPDATED" if exists and response.status in {200, 204} else "CREATED" if not exists and response.status in {201, 204} else f"HTTP_{response.status}"
    except urllib.error.HTTPError as exc:
        return f"VARIABLE_WRITE_HTTP_{exc.code}"


def notify_optional(request: HumanGateRequest, selected: dict[str, Any]) -> str:
    token = os.getenv("ATM_RADAR_BOT_API_KEY", "").strip(); chat = os.getenv("ATM_TELEGRAM_CHAT_ID", "").strip()
    if not token or not chat:
        return "SKIPPED_OPTIONAL_NOT_CONFIGURED"
    try:
        chat_id = int(chat)
    except ValueError:
        return "SKIPPED_INVALID_CHAT_ID"
    lock = f"human-gate:{request.request_id}:{request.dedupe_key}"
    if os.getenv("ATM_TELEGRAM_EFFECT_LOCK", "").strip() == lock:
        return "DEDUPED_CANONICAL_REQUEST"
    result = _repo_variable("ATM_TELEGRAM_EFFECT_LOCK", lock)
    if result not in {"CREATED", "UPDATED"}:
        return "BLOCKED_DURABLE_EFFECT_LOCK"
    TelegramBot(token).send(chat_id, telegram_message(request, selected))
    return "NOTIFIED_CANONICAL_REQUEST"


def main() -> int:
    if not RECEIPT.exists():
        raise SystemExit("SG2_RECEIPT_MISSING")
    receipt = json.loads(RECEIPT.read_text(encoding="utf-8"))
    selected = receipt.get("selected") if isinstance(receipt, dict) else None
    if not isinstance(selected, dict) or int(receipt.get("qualified_count") or 0) < 1:
        receipt["canonical_human_gate_state"] = "NO_QUALIFIED_REQUEST"
        receipt["telegram_state"] = "WITHHELD_NO_CANONICAL_REQUEST"
        RECEIPT.write_text(json.dumps(receipt, sort_keys=True, indent=2) + "\n", encoding="utf-8")
        print("ORDER021_SG2_CANONICAL=NO_QUALIFIED_REQUEST")
        print("OUTGOING_SPEND_USD=0")
        return 0
    request = build_request(selected)
    request_id, persistence = persist_canonical(request)
    if request_id != request.request_id:
        raise RuntimeError("CANONICAL_REQUEST_ID_MISMATCH")
    telegram_state = notify_optional(request, selected)
    receipt.update({
        "owner_gate_truth": "ORDER021_HUMAN_GATE_ONLY",
        "canonical_human_gate_state": "PERSISTED",
        "canonical_request_id": request.request_id,
        "canonical_dedupe_key": request.dedupe_key,
        "canonical_persistence": persistence,
        "telegram_state": telegram_state,
        "telegram_bound_request_id": request.request_id if telegram_state.startswith(("NOTIFIED", "DEDUPED")) else None,
        "telegram_bound_dedupe_key": request.dedupe_key if telegram_state.startswith(("NOTIFIED", "DEDUPED")) else None,
        "outgoing_spend_usd": "0",
    })
    RECEIPT.write_text(json.dumps(receipt, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    print("ORDER021_SG2_CANONICAL=PERSISTED")
    print("CANONICAL_REQUEST_ID=" + request.request_id)
    print("TELEGRAM_STATE=" + telegram_state)
    print("OUTGOING_SPEND_USD=0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
