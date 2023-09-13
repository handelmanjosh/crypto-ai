import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { OpenBlockWallet } from "@openblockhq/aptos-wallet-adapter";
import { TokenPocketWallet } from "@tp-lab/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
const wallets = [
  new PetraWallet(),
  new PontemWallet(),
  new RiseWallet(),
  new FewchaWallet(),
  new MartianWallet(),
  new NightlyWallet(),
  new OpenBlockWallet(),
  new TokenPocketWallet(),
  new TrustWallet(),
  new WelldoneWallet(),
];
export default function App({ Component, pageProps }: AppProps) {
  return (
    <AptosWalletAdapterProvider
    plugins={wallets}
    autoConnect={true}
  >
  <Component {...pageProps} />
  </AptosWalletAdapterProvider >
  )
}
