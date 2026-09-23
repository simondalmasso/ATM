# ATM secret plane

This document describes the active production secret boundary only.

## Main Worker

The main Worker may read:
- `AGENTHANSA_API_KEY` for the AGENTHANSA execution adapter.
- `RUN_NOW_TEST_TOKEN` for the owner-authorized run-now route.

The main Worker must not hold a raw TaskMarket private key, seed phrase, exchange withdrawal secret, or generic owner wallet signing authority.

## TaskMarket signer

The private signer service may read:
- `TASKMARKET_DEVICE_API_TOKEN`
- `TASKMARKET_ENCRYPTED_KEY`

Its public identifiers are configured separately. Its authority is bounded to the TaskMarket claim/submit contract exposed through the private service binding.

## Policy

- secret values never enter Git, prompts, logs or evidence
- unknown secret/cost state fails closed
- payout addresses are public configuration, not signing authority
- autonomous withdrawal and wallet-to-wallet transfer are disabled
- owner financial signatures remain a human gate
- historical credentials and removed provider keys are not active configuration

Run:

```powershell
python scripts/secret_doctor.py
python scripts/payout_doctor.py
```
