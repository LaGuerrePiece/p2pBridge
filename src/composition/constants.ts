import {
  avalanche,
  bsc,
  busd,
  cronos,
  ethereum,
  polygon,
  tether,
  usdc,
} from "../asset/images/images";

export const chainDetails = {
  "1": {
    name: "Ethereum",
    icon: ethereum,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
  "56": {
    name: "BSC",
    icon: bsc,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
  "338": {
    name: "Cronos Test",
    icon: cronos,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
  "77": {
    name: "Gnosis Test",
    icon: ethereum,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
  "43114": {
    name: "Avalanche",
    icon: avalanche,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
  "137": {
    name: "Polygon",
    icon: polygon,
    token: {
      USDT: { name: "USDT", icon: tether },
      BUSD: { name: "BUSD", icon: busd },
      USDC: { name: "USDC", icon: busd },
    },
  },
} as {
  [key in string]: {
    name: string;
    icon: string;
    token: { [key in string]: { name: string; icon: string } };
  };
};
