import 'dotenv/config';
import StellarSDK from "@stellar/stellar-sdk";

const server = new StellarSDK.Horizon.Server("https://api.testnet.minepi.com");
const NETWORK_PASSPHRASE = "Pi Testnet";

// Load secrets from environment
const issuerSecret = process.env.ISSUER_SECRET;
const distributorSecret = process.env.DISTRIBUTOR_SECRET;
const tokenCode = process.env.TOKEN_CODE || "BLASTX";
const mintAmount = process.env.MINT_AMOUNT || "100000000000";
// Home domain waar jouw pi.toml staat (liefst ook in env zetten)
const homeDomain = process.env.HOME_DOMAIN || "toartje.github.io";

const issuerKeypair = StellarSDK.Keypair.fromSecret(issuerSecret);
const distributorKeypair = StellarSDK.Keypair.fromSecret(distributorSecret);

async function main() {
  const customToken = new StellarSDK.Asset(tokenCode, issuerKeypair.publicKey());
  
  const distributorAccount = await server.loadAccount(distributorKeypair.publicKey());
  const latestLedger = await server.ledgers().order("desc").limit(1).call();
  const baseFee = latestLedger.records[0].base_fee_in_stroops;

  // ========================
  // 1. TRUSTLINE AANMAKEN
  // ========================
  console.log("⛓ Creating trustline...");
  const trustTx = new StellarSDK.TransactionBuilder(distributorAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await server.fetchTimebounds(90)
  })
    .addOperation(
      StellarSDK.Operation.changeTrust({
        asset: customToken
      })
    )
    .build();

  trustTx.sign(distributorKeypair);
  await server.submitTransaction(trustTx);
  console.log("✅ Trustline created successfully");

  // ========================
  // 2. HOME DOMAIN SETTEN
  // ========================
  console.log("🌐 Setting home domain on issuer:", homeDomain);

  const issuerAccountForOptions = await server.loadAccount(issuerKeypair.publicKey());

  const setOptionsTx = new StellarSDK.TransactionBuilder(issuerAccountForOptions, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await server.fetchTimebounds(90),
  })
    .addOperation(
      StellarSDK.Operation.setOptions({
        homeDomain: homeDomain, // bijv. "toartje.github.io"
      })
    )
    .build();

  setOptionsTx.sign(issuerKeypair);
  await server.submitTransaction(setOptionsTx);
  console.log("✅ Home domain set successfully!");

  // ========================
  // 3. MINTEN (ISSUER → DISTRIBUTOR)
  // ========================
  console.log("🪙 Minting supply...");

  const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

  const mintTx = new StellarSDK.TransactionBuilder(issuerAccount, {
    fee: baseFee,
    networkPassphrase: NETWORK_PASSPHRASE,
    timebounds: await server.fetchTimebounds(90)
  })
    .addOperation(
      StellarSDK.Operation.payment({
        destination: distributorKeypair.publicKey(),
        asset: customToken,
        amount: mintAmount,
      })
    )
    .build();

  mintTx.sign(issuerKeypair);
  await server.submitTransaction(mintTx);

  console.log(`🎉 Successfully minted ${mintAmount} ${tokenCode}`);
  console.log("Issuer public key (for pi.toml):", issuerKeypair.publicKey());
  console.log("Home domain:", homeDomain);
}

main().catch((err) => {
  console.error("❌ Error:", err.response?.data || err);
});
