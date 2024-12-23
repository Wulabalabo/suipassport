
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

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
    package: "0x544c20b0002541e9ba17444c3ea4129b6fbf65b4a2826f886329dc1f3bed213e",
    suiPassportRecord: "0x58cfd77aec15b9c069ac255858a4a6c91ac8c8d816a4e239815427a1bfa2da0c",
    stampDisplay: "0xcf6dba4228c4b51b654ec0720e388bd9bacbab60ed99199b8848d6e8e0e360d5",
    passportDisplay: "0x63580b879079ae170f706f0a2b6fd9656ff6e8171622c34043504de7d7be067b",
    stampEventRecord: "0xebc5be97b51406c01fdfbd0fd183d6e406a8cd422c9a5cf49d207aae98f5bbe9",
    stampAdminCap: "0x56dd26c960d9edd28d62143deb15240ca25b56e53f75c9bc26dd52396fd74da8",
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

export { useNetworkVariable, useNetworkVariables, networkConfig, network, suiClient, createBetterTxFactory };
export type { NetworkVariables };
