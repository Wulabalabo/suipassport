
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
    package: "0x5210d4ce766f63de862d1e095d0608791d58c9ec33c97a518049d4375754cea8",
    suiPassportRecord: "0x293d3fe7714a3c119dbf0f99d4774ce9245e7f5b78f469b738bae3b1093c61a5",
    stampDisplay: "0xc5b25e9e4ed7f8a6ab2b0fc45a406dc39ea580fa98dee7e60929b530024b85b7",
    passportDisplay: "0xb53c4b93bc7b22be6ee9f036da19e042288eecccb32008122e451db23893b97e",
    stampEventRecord: "0xb58b65f1e10d75bfc5fa936ef69df3da8d9712c998b0e30546494272991d2f89",
    stampEventRecordTable:"0xadfe6cc8685af7251c660cebbf1f18b987897932c11041cc9a9833db19e9ce69",
    stampAdminCap: "0xc6959493989d15d66e513d8ada5dc853cdf883d937b1b1164d23e2b3c7cadec9",
}

const testnetVariables = {
    package: "0x9a752869a4dff84c7c7814ec51b5f218dce9a23d739874305f57228ca3feb65b",
    suiPassportRecord: "0x36319fa6753b0c9c833f191a6d17b09b053c4662bdbd7ca164d1a428bd3ebbe7",
    stampDisplay: "0xdf32c6afe5fa32f604746a53813f14c1c73982b163f72fec42fcebbabba5e91c",
    passportDisplay: "0x9acd069be290f1002e3252466d66cb6d287369e112fd1b3abd89d4ffe2fb360e",
    stampEventRecord: "0x2815e9e800d36f3e6e0a5a2c22f39cf259ff0095ab14b85b61568ec669b24068",
    stampEventRecordTable:"0xf9df7047b15be40896fd665f6ef982b3cf91207109e3a6cdbbeae34f93d1a203",
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
