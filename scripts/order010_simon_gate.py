from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from atm_core.simon_gate import GuruPublicSource


RECEIPT = Path("order010-simon-gate-receipt.json")


def _write(receipt: dict[str, Any]) -> None:
    RECEIPT.write_text(json.dumps(receipt, sort_keys=True, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    head = os.getenv("ORDER010_HEAD", os.getenv("GITHUB_SHA", "UNKNOWN")).strip() or "UNKNOWN"
    source = GuruPublicSource()
    receipt: dict[str, Any] = {
        "schema": "ATM_ORDER010_SG2_SIMON_GATE_V1",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "head": head,
        "lane": "SIMON_GATE_DISCOVERY_PRODUCER",
        "parallel_to_autonomous": True,
        "source": "guru",
        "source_url": source.url,
        "discovery_mode": "PUBLIC_CREDENTIALLESS",
        "platform_password_or_cookie_required": False,
        "outgoing_spend_usd": "0",
        "paid_boost_or_membership": False,
        "state": "DISCOVERY_STARTED",
        "owner_gate_truth": "ORDER021_HUMAN_GATE_ONLY",
        "telegram_state": "DEFERRED_TO_CANONICAL_HUMAN_GATE",
    }

    try:
        leads = source.discover()
    except Exception as exc:
        receipt.update({"state": "SOURCE_DEGRADED", "source_error": type(exc).__name__, "qualified_count": 0})
        _write(receipt)
        print("SIMON_GATE_STATE=SOURCE_DEGRADED")
        print("OUTGOING_SPEND_USD=0")
        return 0

    receipt["discovery_lead_count"] = len(leads)
    if not leads:
        receipt.update({"qualified_count": 0, "state": "NO_CURRENT_QUALIFIED_LEAD"})
        _write(receipt)
        print("SIMON_GATE_STATE=NO_CURRENT_QUALIFIED_LEAD")
        print("OUTGOING_SPEND_USD=0")
        return 0

    qualified = []
    rejection_counts: dict[str, int] = {}
    for lead in leads[:10]:
        try:
            refreshed, gate = source.refetch_individual(lead, platform_onboarding_compatible=False)
        except Exception as exc:
            reason = "INDIVIDUAL_REFETCH_" + type(exc).__name__.upper()
            rejection_counts[reason] = rejection_counts.get(reason, 0) + 1
            continue
        for reason in gate.rejection_reasons:
            rejection_counts[reason] = rejection_counts.get(reason, 0) + 1
        if refreshed is not None and gate.executable:
            qualified.append(refreshed)

    receipt.update({
        "qualified_count": len(qualified),
        "individual_object_authority": True,
        "rejection_counts": dict(sorted(rejection_counts.items())),
        "guru_public_discovery": "ALLOWED",
        "guru_mutation": "BLOCKED_PAID_VERIFICATION",
        "guru_owner_onboarding": "DO_NOT_REQUEST",
        "guru_idv_cost_usd": "4.95",
    })
    if not qualified:
        receipt["state"] = "READ_ONLY_SEARCHING"
        _write(receipt)
        print("SIMON_GATE_STATE=READ_ONLY_SEARCHING")
        print("TELEGRAM_STATE=DEFERRED_TO_CANONICAL_HUMAN_GATE")
        print("QUALIFIED_COUNT=0")
        print("OUTGOING_SPEND_USD=0")
        return 0

    selected = qualified[0]
    receipt["selected"] = selected.public_dict()
    receipt["state"] = "PROPOSAL_READY_CANONICALIZATION_REQUIRED"
    receipt["canonical_human_gate_required"] = True
    _write(receipt)
    print("SIMON_GATE_STATE=PROPOSAL_READY_CANONICALIZATION_REQUIRED")
    print("TELEGRAM_STATE=DEFERRED_TO_CANONICAL_HUMAN_GATE")
    print("QUALIFIED_COUNT=" + str(receipt["qualified_count"]))
    print("SELECTED_ID=" + selected.source_id)
    print("OUTGOING_SPEND_USD=0")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
