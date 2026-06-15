import { rpc } from "@stellar/stellar-sdk";
import { RPC_URL } from "./network";

const server = new rpc.Server(RPC_URL);

/**
 * Ensure the account exists on testnet. If not, fund it via friendbot so the
 * user never has to think about XLM (decision D20). v1 only — replaced by a
 * relay/sponsor on mainnet.
 */
export async function ensureFunded(address: string): Promise<void> {
  try {
    await server.getAccount(address);
    return; // already exists/funded
  } catch {
    const res = await fetch(
      `https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`,
    );
    // 400 usually means "already funded" — fine.
    if (!res.ok && res.status !== 400) {
      throw new Error(`friendbot funding failed (${res.status})`);
    }
  }
}
