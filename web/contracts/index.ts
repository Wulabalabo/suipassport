
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
    package: "0x352919f09a96e8bca46cd2a9015c5651aed4aa3ca270f8c09c96ef670c8ede59",
    suiPassportRecord: "0xf7bea21283a25287debc250a426a03f68cf9abbf03752094e9072e637058572b",
    stampDisplay: "0x567bb7c25135da029bab6f0871722cc8d9cdf25a0018f57ecee79903a80e11df",
    passportDisplay: "0x57bbe20853c188df34cc9233a5698e311bc646ea5d5d813b89e6c910bcf7216b",
    stampEventRecord: "0x242efa83af97ea52787cddf9daa284a890851110567b1e8aea255d22137561fb",
    stampEventRecordTable:"0xc6ab6b8ae7b6c6ff0415cc3f62068a8eece7da36f6f0b43522f8a6918a8e4877",
    stampAdminCap: "0x229ac4d4b244c3a4cd2426cfe0d059ffd27b9fc72418b927e89697e247528930",
    version: "0x4a4317676aa05a8e673dad0b2cc2fbf855b7170b5259340e2b76121bccbe9363",
    adminSet: "0x6f4c4be85ae2d97cb75481f32fc3e4c1480c422b22c661b3ccf0d5e73725c1c9"
}

const testnetVariables = {
    package: "0xf2ac2d3278ae3cf559663900c5fb0119e83cf8ed897adb63a94523520ab11c13",
    suiPassportRecord: "0x9ca4d2804a0711b4d6986aea9c1fe100b20e0dad73b48871624f5e44e8c3c9ef",
    stampDisplay: "0x46d866b486206d26f41a6108b64d7e9e8b4d61ee0b5c9bece1dd92adb07ecd2a",
    passportDisplay: "0xef55028c9ca6925068edafe97739f33dcda97dfc3b40c861df33391b8d46d7e7",
    stampEventRecord: "0x31c4b24ab0f3cc4bac76509c5b227b6ce6da0fb661fbe5c3a059a799eab7a498",
    stampEventRecordTable:"0x282bed4593b99549a927915f70ed970a74b9a47711e09aefeda73a5a9d61113b",
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
