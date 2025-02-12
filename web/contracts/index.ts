
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiGraphQLClient } from "@mysten/sui/graphql";

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables() {
    return network === "mainnet" ? mainnetVariables : testnetVariables;
}

function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params:T) => Transaction,
) {
    return (params:T) => {
        const tx = new Transaction();
        const networkVariables = getNetworkVariables();
        return fn(tx, networkVariables, params);
    };
}



type Network = "mainnet" | "testnet"

const mainnetVariables = {
    package: "0x3ddf8aa51ac76da95fa935e0d9ef31e28795a72228eb04fedac63bcf3716d20b",
    suiPassportRecord: "0x58cfd77aec15b9c069ac255858a4a6c91ac8c8d816a4e239815427a1bfa2da0c",
    stampDisplay: "0x2411283eb31a77a811d9cc22e471976c13a7de03bdae244da4f0013851a96682",
    passportDisplay: "0x9e753b65c85340d6bcf313ab7f3f9851d165995e35a767f3ec07968444277a5d",
    stampEventRecord: "0xe824719c4a84c52fc607f775a62f5f2a639c9f0db81d34f60504a68b603cfdf2",
    stampAdminCap: "0x56dd26c960d9edd28d62143deb15240ca25b56e53f75c9bc26dd52396fd74da8",
}

const testnetVariables = {
    package: "0x9a752869a4dff84c7c7814ec51b5f218dce9a23d739874305f57228ca3feb65b",
    suiPassportRecord: "0x36319fa6753b0c9c833f191a6d17b09b053c4662bdbd7ca164d1a428bd3ebbe7",
    stampDisplay: "0xdf32c6afe5fa32f604746a53813f14c1c73982b163f72fec42fcebbabba5e91c",
    passportDisplay: "0x9acd069be290f1002e3252466d66cb6d287369e112fd1b3abd89d4ffe2fb360e",
    stampEventRecord: "0x2815e9e800d36f3e6e0a5a2c22f39cf259ff0095ab14b85b61568ec669b24068",
    stampAdminCap: "0x505cbf834135ee90afc42c36727bb1d2746149b46a7668d4eb7c201c001c9c91",
}

const network = (process.env.NEXT_PUBLIC_NETWORK as Network) || "testnet";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
    testnet: {
        url: getFullnodeUrl("testnet"),
        variables: testnetVariables,
    },
    mainnet: {
        url: getFullnodeUrl("mainnet"),
        variables: mainnetVariables,
    }
});


// 创建全局 SuiClient 实例
const suiClient = new SuiClient({ url: networkConfig[network].url });
const graphqlClient = new SuiGraphQLClient({ url: `https://sui-${network}.mystenlabs.com/graphql` });

export { useNetworkVariable, useNetworkVariables, networkConfig, network, suiClient, createBetterTxFactory, graphqlClient };
export type { NetworkVariables };
