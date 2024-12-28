
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SuiGraphQLClient } from "@mysten/sui/graphql";

type NetworkVariables = ReturnType<typeof useNetworkVariables>;

function getNetworkVariables() {
    return network === "mainnet" ? mainnetVariables : testnetVariables;
}

function createBetterTxFactory<T extends Record<string, unknown>>(
    fn: (tx: Transaction, networkVariables: NetworkVariables, params:T) => Transaction
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
    package: "0x6bc11a1915ad1fc562e25c0dba945ad52788504d8be7878a494bec3d88a94d56",
    suiPassportRecord: "0x252214b714952df602ca5d5d64eaff403b4e159eaf926e8cb916f809be4c5260",
    stampDisplay: "0x7c3ead501e24b23a8af1535905de6454ed2f2d30109ba455f6cc082e0be490f8",
    passportDisplay: "0xc7e2932c402f5e1f8a6440ccc3b86674d88406cf6431c1f2f0bfd1a303b94482",
    stampEventRecord: "0x8dd1ea1f711d525fb097cd18005427135e7e8ed8fdb6b299dfa15b4a784b41ae",
    stampAdminCap: "0xb012d7a04cc04b3366523a3e7e54ad682158f4ddf174a6d23fb0655e27977e93",
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
