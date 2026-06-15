import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
} from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "./network";

export const kit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [new FreighterModule()],
});

/** Open the wallet picker and return the selected account address. */
export async function connect(): Promise<string> {
  return new Promise((resolve, reject) => {
    kit.openModal({
      onWalletSelected: async (option) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          resolve(address);
        } catch (e) {
          reject(e);
        }
      },
      onClosed: () => reject(new Error("wallet selection cancelled")),
    });
  });
}

/** Sign callback handed to the generated contract clients. */
export async function signTransaction(xdr: string) {
  const { signedTxXdr } = await kit.signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  return { signedTxXdr };
}
