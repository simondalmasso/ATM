from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT))

from atm_core.human_gate import HumanGateInbox  # noqa: E402
from scripts.order021_sg2_human_gate import build_request, telegram_message  # noqa: E402


SELECTED = {
    "source_id": "guru:fixture-021",
    "title": "Zero-cost fixture job",
    "url": "https://www.guru.com/jobs/zero-cost-fixture/fixture-021",
    "exact_bid": "USD 10 fixed",
    "competition": 0,
    "proposal": "fixture",
}


class Order021SG2BridgeTests(unittest.TestCase):
    def test_one_qualified_sg2_output_becomes_one_canonical_request(self):
        one = build_request(SELECTED)
        two = build_request(dict(SELECTED))
        self.assertEqual(one.request_id, two.request_id)
        self.assertEqual(one.dedupe_key, two.dedupe_key)
        inbox = HumanGateInbox()
        first = inbox.submit(one)
        second = inbox.submit(two)
        self.assertEqual(first.request_id, second.request_id)
        self.assertEqual(inbox.pending_count(), 1)
        self.assertEqual(first.rail_owner, "ORDER010_SG2")
        self.assertEqual(first.owner_cost_usd, "0")

    def test_optional_telegram_is_bound_to_same_canonical_truth(self):
        request = build_request(SELECTED)
        text = telegram_message(request, SELECTED)
        self.assertIn(request.request_id, text)
        self.assertIn(request.dedupe_key, text)
        self.assertIn("notification-only", text)
        self.assertIn("canonical ATM Human Gate inbox", text)

    def test_legacy_sg2_script_cannot_notify_or_own_human_action_state(self):
        source = (ROOT / "scripts/order010_simon_gate.py").read_text(encoding="utf-8")
        self.assertNotIn("TelegramBot", source)
        self.assertNotIn("bot.send", source)
        self.assertNotIn("NOTIFY_HUMAN_GATE", source)
        self.assertIn('"owner_gate_truth": "ORDER021_HUMAN_GATE_ONLY"', source)
        workflow = (ROOT / ".github/workflows/order010-sg2-simon-gate.yml").read_text(encoding="utf-8")
        self.assertIn("python scripts/order010_simon_gate.py", workflow)
        self.assertIn("python scripts/order021_sg2_human_gate.py", workflow)
        self.assertLess(workflow.index("python scripts/order010_simon_gate.py"), workflow.index("python scripts/order021_sg2_human_gate.py"))


if __name__ == "__main__":
    unittest.main()
