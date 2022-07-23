declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

type WalletOptions = {
  package: any;
  options: Object;
};

declare const CONFIG: {
  chains: {
    [key in number]: {
      chainName: string;
      rpcUrls: Array<string>;
      bridgeAddress: `0x${string}`;
      enable: boolean;
      tokensAddress: {
        [key in string]: `0x${string}`;
      };
    };
  };
  abi: {
    BridgeAbi: AbiItem;
    ERC20Abi: AbiItem;
  };
  providerOptions: {
    walletConnect: WalletOptions;
    coinbaseWallet: WalletOptions;
  };
};
