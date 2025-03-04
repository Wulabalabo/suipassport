
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

//AKW5RUoYgaoT2JebZv3psJBJq8FwkrqfrVRqmWUanQyM
const mainnetVariables = {
    package: "0xf2ac2d3278ae3cf559663900c5fb0119e83cf8ed897adb63a94523520ab11c13",
    suiPassportRecord: "0x9ca4d2804a0711b4d6986aea9c1fe100b20e0dad73b48871624f5e44e8c3c9ef",
    stampDisplay: "0x46d866b486206d26f41a6108b64d7e9e8b4d61ee0b5c9bece1dd92adb07ecd2a",
    passportDisplay: "0xef55028c9ca6925068edafe97739f33dcda97dfc3b40c861df33391b8d46d7e7",
    stampEventRecord: "0x31c4b24ab0f3cc4bac76509c5b227b6ce6da0fb661fbe5c3a059a799eab7a498",
    stampEventRecordTable:"0xadfe6cc8685af7251c660cebbf1f18b987897932c11041cc9a9833db19e9ce69",
    stampAdminCap: "0x8deb1e81c2b7cceafec4a75e0574c7a882cbaf31fadc39675e76b467db9754c2",
    version: "0xb70ea751ce1f0dae1a2f8da9729c6dbbd6cb47b8f6fb7c44ad025246a6b47da9",
    adminSet: "0x07d43d3aea955e5ea8c1f7e43312ec93ba68d24fe9a5412260b9d9de7db287ef"
}

const testnetVariables = {
    package: "0xf2ac2d3278ae3cf559663900c5fb0119e83cf8ed897adb63a94523520ab11c13",
    suiPassportRecord: "0x9ca4d2804a0711b4d6986aea9c1fe100b20e0dad73b48871624f5e44e8c3c9ef",
    stampDisplay: "0x46d866b486206d26f41a6108b64d7e9e8b4d61ee0b5c9bece1dd92adb07ecd2a",
    passportDisplay: "0xef55028c9ca6925068edafe97739f33dcda97dfc3b40c861df33391b8d46d7e7",
    stampEventRecord: "0x31c4b24ab0f3cc4bac76509c5b227b6ce6da0fb661fbe5c3a059a799eab7a498",
    stampEventRecordTable:"0xadfe6cc8685af7251c660cebbf1f18b987897932c11041cc9a9833db19e9ce69",
    stampAdminCap: "0x8deb1e81c2b7cceafec4a75e0574c7a882cbaf31fadc39675e76b467db9754c2",
    version: "0xb70ea751ce1f0dae1a2f8da9729c6dbbd6cb47b8f6fb7c44ad025246a6b47da9",
    adminSet: "0x07d43d3aea955e5ea8c1f7e43312ec93ba68d24fe9a5412260b9d9de7db287ef"
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
