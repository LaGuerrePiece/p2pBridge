import WalletConnectProvider from "@walletconnect/web3-provider";

export type Web3State = {
    address: string;
    web3: Web3 | null;
    provider: WalletConnectProvider | null;
    connected : boolean;
    chainId: number | null;
    ens: string | null;
};

export const Web3Actions = {
    Connect: "Connect",
    SwitchChain: "SwitchChain",
    CheckConnection: "CheckConnection"
} as const;