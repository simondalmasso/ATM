from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / ".agents" / "skills" / "leanrea" / "SKILL.md"
LICENSE = ROOT / ".agents" / "skills" / "leanrea" / "LICENSE"
POLICY = ROOT / "docs" / "research" / "ORDER-081-leanrea-skill-integration.md"
RUNTIME_PATHS = (
    ROOT / "cloudflare" / "order034" / "ATM-ORDER034-ACTIVE-MAIN-READONLY.js",
    ROOT / "cloudflare" / "order034" / "ATM-ORDER034-WIN101-UI-CANDIDATE.js",
    ROOT / "cloudflare" / "order034" / "wrangler.order034.main.jsonc",
    ROOT / "cloudflare" / "order034" / "wrangler.order034.signer.jsonc",
)


class LeanreaSkillIntegrationTests(unittest.TestCase):
    def test_skill_metadata_and_evidence_first_rules_exist(self):
        content = SKILL.read_text(encoding="utf-8")
        self.assertTrue(content.startswith("---\nname: leanrea\n"))
        self.assertIn("Answer from evidence", content)
        self.assertIn("## Router", content)
        self.assertIn("## Speed patterns", content)

    def test_upstream_license_is_preserved(self):
        content = LICENSE.read_text(encoding="utf-8")
        self.assertIn("MIT License", content)
        self.assertIn("Copyright (c) 2026 AICodeKing", content)

    def test_atm_policy_overlay_and_provenance_exist(self):
        content = POLICY.read_text(encoding="utf-8")
        self.assertIn("09ba4aa0217f82cd880f855a60b877f59f39b22b", content)
        self.assertIn("authorized to inspect", content)
        self.assertIn("Do not use this skill to bypass access controls", content)
        self.assertIn("No external spend", content)

    def test_skill_is_not_wired_into_production_runtime(self):
        for path in RUNTIME_PATHS:
            with self.subTest(path=path.name):
                self.assertTrue(path.is_file(), f"Expected canonical runtime file: {path}")
                self.assertNotIn("leanrea", path.read_text(encoding="utf-8").lower())


if __name__ == "__main__":
    unittest.main()
