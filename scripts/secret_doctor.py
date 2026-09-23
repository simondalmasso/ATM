#!/usr/bin/env python3
"""Presence-only secret doctor for ATM.

This command never prints secret values. It only reports whether named
environment variables are present and fails closed when forbidden wallet
private-key material is injected into the general ATM runtime.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MANIFEST = ROOT / "config" / "atm-v2.secret-manifest.json"


def _load_manifest(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _present(name: str) -> bool:
    return bool(os.environ.get(name, "").strip())


def inspect(manifest: dict[str, Any]) -> dict[str, Any]:
    forbidden = [str(name) for name in manifest.get("forbidden_runtime_material", [])]
    forbidden_present = sorted(name for name in forbidden if _present(name))

    variables: list[dict[str, Any]] = []
    for item in manifest.get("variables", []):
        name = str(item["name"])
        variables.append(
            {
                "name": name,
                "present": _present(name),
                "required": item.get("required"),
                "state": item.get("state"),
                "authority": item.get("authority"),
            }
        )

    return {
        "ok": not forbidden_present,
        "secret_values_read": False,
        "secret_values_printed": False,
        "forbidden_runtime_material_present": forbidden_present,
        "variables": variables,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="ATM presence-only secret doctor")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--json", action="store_true", dest="as_json")
    args = parser.parse_args()

    result = inspect(_load_manifest(args.manifest))
    if args.as_json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print("ATM SECRET DOCTOR")
        print(f"STATUS={'PASS' if result['ok'] else 'FAIL_CLOSED'}")
        for item in result["variables"]:
            print(f"{item['name']}={'PRESENT' if item['present'] else 'MISSING'}")
        if result["forbidden_runtime_material_present"]:
            print(
                "FORBIDDEN_RUNTIME_MATERIAL_PRESENT="
                + ",".join(result["forbidden_runtime_material_present"])
            )
    return 0 if result["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
