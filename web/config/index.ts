import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

type Network = "mainnet" | "testnet"

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: {
            package: "0x9239f9d1f27b49e6d2f3ef1c039ac8c18d83f7ecb99182f89ed95a254314bc9c",
            suiPassportRecord: "0x394531382ea559d7b11453f32354ab73c5308fcd2ea14a374d30ad0bdd6993c3",
            stampDisplay: "0xd8576d7d17322f22ff015c5ad4a7e9a3e7351305fd5a7b360e0bfea62f03a657",
            passportDisplay: "0x23724bb7fe4bf71fced3e2fc5cce8db568375d51e3099c9674d37112a49eb7bf",
            stampOnlineEventRecord: "0xfe6c115a0b686b96c651940d6cbb5f9506cfac9fc3f6410eb2b3a2fd2d8f43f6", 
            stampOfflineEventRecord: "0xaf13b32c5c8d8772f3f54b453bcad1f98babf81ad6cac8f635ecb268d6f81aae",           
        },
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: {
            package: "0x3ddf8aa51ac76da95fa935e0d9ef31e28795a72228eb04fedac63bcf3716d20b",
            suiPassportRecord: "0x1927af58c824221432a9534a0b8dd0aa843f365f90b9d059bc796e755b3be783",
            stampDisplay: "0x2411283eb31a77a811d9cc22e471976c13a7de03bdae244da4f0013851a96682",
            passportDisplay: "0x9e753b65c85340d6bcf313ab7f3f9851d165995e35a767f3ec07968444277a5d",
            stampOnlineEventRecord: "0xe824719c4a84c52fc607f775a62f5f2a639c9f0db81d34f60504a68b603cfdf2", 
            stampOfflineEventRecord: "0xca4b603ed6f5661a71b87d62e372c1604f2e95513ce4cf0d0a3333d1709c0768",   },
    }
});

// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });

export { useNetworkVariable, useNetworkVariables, networkConfig, network, suiClient };
