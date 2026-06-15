#!/usr/bin/env bash
# Generate typed TS clients for each contract from the deployed IDs in
# .env.local. Run AFTER `make bootstrap` (repo root) has produced .env.local.
set -euo pipefail
cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
set -a; source .env.local; set +a

NETWORK_ARGS=(--rpc-url "$VITE_RPC_URL" --network-passphrase "$VITE_NETWORK_PASSPHRASE")

gen() { # gen <name> <contract-id>
  echo "bindings: $1"
  stellar contract bindings typescript \
    "${NETWORK_ARGS[@]}" \
    --contract-id "$2" \
    --output-dir "src/contracts/$1" \
    --overwrite
}

gen coin    "$VITE_COIN"
gen faucet  "$VITE_FAUCET"
gen store   "$VITE_STORE"
gen pack    "$VITE_PACK"
# Album + Escrow clients are generated too, for v2 screens.
gen sticker "$VITE_STICKER"
gen album   "$VITE_ALBUM"
gen escrow  "$VITE_ESCROW"

echo "Done. Clients in src/contracts/*"
