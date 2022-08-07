export type ChainDetails = {
    [key in string]: {
        name: string;
        icon: string;
        rpcUrls: string[];
        bridgeAddress: string;
        token: { [key in string]: { name: string; icon: string } };
    };
} 