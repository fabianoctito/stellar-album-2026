// Typed contract clients, built from the generated bindings in src/contracts/*
// (run `npm run bindings` after `make bootstrap`).
import { Client as Coin } from "../contracts/coin";
import { Client as Faucet } from "../contracts/faucet";
import { Client as Store } from "../contracts/store";
import { Client as Pack } from "../contracts/pack";
import { CONTRACTS, NETWORK_PASSPHRASE, RPC_URL } from "./network";
import { signTransaction } from "./wallet";

function base(contractId: string, publicKey?: string) {
  return {
    contractId,
    networkPassphrase: NETWORK_PASSPHRASE,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction,
  };
}

/** Build the contract clients for the connected user (publicKey optional for reads). */
export function makeClients(publicKey?: string) {
  return {
    coin: new Coin(base(CONTRACTS.coin, publicKey)),
    faucet: new Faucet(base(CONTRACTS.faucet, publicKey)),
    store: new Store(base(CONTRACTS.store, publicKey)),
    pack: new Pack(base(CONTRACTS.pack, publicKey)),
  };
}
