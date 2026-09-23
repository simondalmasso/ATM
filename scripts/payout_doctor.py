#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "config" / "atm-v2.payouts.json"
EVM_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")


def load_config(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _walk_keys(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield str(key)
            yield from _walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_keys(child)


def inspect(config: dict[str, Any]) -> dict[str, Any]:
    primary = config.get("primary", {})
    rails = config.get("rail_defaults", {})
    checks = {
        "primary_is_base_usdc": (
            primary.get("network") == "base"
            and primary.get("asset") == "USDC"
            and bool(EVM_RE.fullmatch(str(primary.get("address", ""))))
        ),
        "taskmarket_matches_live_settlement": (
            rails.get("taskmarket", {}).get("network") == "base"
            and rails.get("taskmarket", {}).get("asset") == "USDC"
            and rails.get("taskmarket", {}).get("settlement") == "RAIL_BOUND_WORKER_WALLET"
        ),
        "agenthansa_is_platform_settlement": (
            rails.get("agenthansa", {}).get("settlement") == "PLATFORM_ACCOUNT"
        ),
        "no_private_key_fields": not any(
            key.lower() in {"private_key", "seed", "seed_phrase", "mnemonic"}
            for key in _walk_keys(config)
        ),
    }
    return {"ok": all(checks.values()), "checks": checks, "config": config}


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate public ATM payout configuration")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()
    result = inspect(load_config(args.config))
    if args.as_json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print(f"STATUS={'PASS' if result['ok'] else 'FAIL_CLOSED'}")
        for name, passed in result["checks"].items():
            print(f"{name}={'PASS' if passed else 'FAIL'}")
    return 0 if result["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
