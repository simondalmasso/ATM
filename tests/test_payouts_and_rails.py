import importlib.util
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


payout = load_module("payout_doctor", ROOT / "scripts" / "payout_doctor.py")
secrets = load_module("secret_doctor", ROOT / "scripts" / "secret_doctor.py")


class PayoutTests(unittest.TestCase):
    def test_payout_config_contains_only_live_routing(self):
        config = payout.load_config(ROOT / "config" / "atm-v2.payouts.json")
        result = payout.inspect(config)
        self.assertTrue(result["ok"])
        self.assertEqual(config["primary"]["network"], "base")
        self.assertEqual(config["primary"]["asset"], "USDC")
        self.assertNotIn("wallets", config)
        self.assertEqual(set(config["rail_defaults"]), {"taskmarket", "agenthansa"})


class SecretManifestTests(unittest.TestCase):
    def test_manifest_matches_live_runtime_secret_callers(self):
        manifest = secrets._load_manifest(ROOT / "config" / "atm-v2.secret-manifest.json")
        names = {str(item["name"]) for item in manifest["variables"]}
        self.assertEqual(
            names,
            {
                "AGENTHANSA_API_KEY",
                "RUN_NOW_TEST_TOKEN",
                "TASKMARKET_DEVICE_API_TOKEN",
                "TASKMARKET_ENCRYPTED_KEY",
            },
        )

    def test_forbidden_wallet_material_fails_closed_without_readback(self):
        manifest = secrets._load_manifest(ROOT / "config" / "atm-v2.secret-manifest.json")
        with patch.dict(os.environ, {"RAW_WALLET_PRIVATE_KEY": "dummy"}, clear=False):
            result = secrets.inspect(manifest)
        self.assertFalse(result["ok"])
        self.assertFalse(result["secret_values_read"])
        self.assertFalse(result["secret_values_printed"])
        self.assertIn("RAW_WALLET_PRIVATE_KEY", result["forbidden_runtime_material_present"])


if __name__ == "__main__":
    unittest.main()
