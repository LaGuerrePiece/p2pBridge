export type ChainDetails = {
    [key in string]: {
        name: string;
        icon: string;
        enable: boolean,
        rpcUrls: string[];
        bridgeAddress: string;
        token: { [key in string]: { name: string; icon: string, address: string } };
    };
} 