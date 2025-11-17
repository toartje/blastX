# BLASTX Token op Pi Testnet

Dit project laat zien hoe je een eigen token (BLASTX) maakt op de **Pi Testnet blockchain**, inclusief:
- Issuer & distributor wallets
- Trustline aanmaken
- Tokens minten (uitgeven)
- Home domain instellen
- `pi.toml` hosten zodat je token in de Pi Wallet kan verschijnen

> ⚠️ Alles in dit project is voor **Pi Testnet**, niet voor mainnet, en heeft geen echte waarde.

---

## Inhoud

- [Prerequisites](#prerequisites)
- [Overzicht token flow](#overzicht-token-flow)
- [Installatie](#installatie)
- [Environment variables](#environment-variables)
- [Script uitvoeren](#script-uitvoeren)
- [pi.toml hosten](#pitoml-hosten)
- [Controle in Pi Wallet](#controle-in-pi-wallet)

---

## Prerequisites

1. **Twee Pi Testnet wallets**
   - Maak 2 wallets in de Pi Wallet:
     - 1× **Issuer wallet**
     - 1× **Distributor wallet**
   - Activeer beide op **Pi Testnet**.
   - Noteer voor beide:
     - Public key (G...)
     - Secret key (S...)

2. **Node.js & npm geïnstalleerd**
   - Download vanaf nodejs.org als je het nog niet hebt.

3. **Wat Test-Pi** in beide wallets via de Testnet faucet.

---

## Overzicht token flow

We maken een token met code **BLASTX**:

1. De **Distributor** maakt een **trustline** naar BLASTX.
2. De **Issuer** stuurt (mint) een hoeveelheid BLASTX naar de Distributor.
3. De **Issuer** stelt een **home domain** in (bv. `toartje.github.io`).
4. Op dat domein hosten we een **`pi.toml`** met metadata over het token.
5. Pi Server leest `pi.toml` → token kan in de **Pi Wallet** verschijnen.

---

## Installatie

Installeer dependencies:

```bash
npm init -y
npm install @stellar/stellar-sdk dotenv
