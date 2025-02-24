
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

//6i6HeqCBEsTTaX5Ni4MHH8GPCoYBRcKdZggfubHrL5B8
const mainnetVariables = {
    package: "0xd9e4c4d7b3604b34fabea5a336c39fff23f03b67127499ccfde740fc872d0d92",
    suiPassportRecord: "0xa724aaaf003aeef49574dcae670df82a494defe4c387469c82c795306db35cf9",
    stampDisplay: "0x50bb8c5f734ed52ace655ceb96b546eb41cc3d2bdea9f39667a92cfa15ab5f8b",
    passportDisplay: "0x7c0c2087639833e88e2df3ed40dcb40e0bbc849c6b7191afe5ddb1e6fceefdb9",
    stampEventRecord: "0x4886a40467c02d7f5dba6a728f5e88704c0f4703b69b081fa653c2538d4a5794",
    stampEventRecordTable:"0xec0ba2d92eafd17b186c7dbf6d9debf9060aba2103cc3eb6c6ceb61e97a0c03f",
    stampAdminCap: "0x6141c5fa2d501da3954dd32705c36e0465ef3466e29c45526150e14302832c27",
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
