import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

type Network = "mainnet" | "testnet"

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            package: "0x383f72695eeae772e52197ba0c27cef062aa48922d056c5c4b8f066d3a7c8989",
            stampAdminCap: "0xe6426a8aa80161121726c1d800e68b85f82d050aaf18d06799bdcfa52d1ddfc6",
            suiPassportRecord: "0xe137878ea2fd0ce1aec1c84225b36d2536c719ccc812c9bbc18e3af2661c3044",
            offlineEventRecord: "0xa4dc6a95d84e5c559e1dc8f07fc1572eea3d7e0fb26541d27bcd284bd0fd2468",
            stampDisplay: "0x80b728986071592e0a742350f528ec8de5503e4ca560dd8d86f865f4dcb61dc2",
            passportDisplay: "0x5278927a9dbdfde6d4f08df61284f45acf1d6f599a5f87ea95dcba712fb350d6",
            onlineEventRecord: "0x16ef398014b17f176aaeda6cbeb90f2757e19865505b95ce7ef5c21b155a98a0",            
        },
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: {
            package: "0x383f72695eeae772e52197ba0c27cef062aa48922d056c5c4b8f066d3a7c8989",
            stampAdminCap: "0xe6426a8aa80161121726c1d800e68b85f82d050aaf18d06799bdcfa52d1ddfc6",
            suiPassportRecord: "0xe137878ea2fd0ce1aec1c84225b36d2536c719ccc812c9bbc18e3af2661c3044",
            offlineEventRecord: "0xa4dc6a95d84e5c559e1dc8f07fc1572eea3d7e0fb26541d27bcd284bd0fd2468",
            stampDisplay: "0x80b728986071592e0a742350f528ec8de5503e4ca560dd8d86f865f4dcb61dc2",
            passportDisplay: "0x5278927a9dbdfde6d4f08df61284f45acf1d6f599a5f87ea95dcba712fb350d6",
            onlineEventRecord: "0x16ef398014b17f176aaeda6cbeb90f2757e19865505b95ce7ef5c21b155a98a0",   },
    }
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

export { useNetworkVariable, useNetworkVariables, networkConfig, network, suiClient };
