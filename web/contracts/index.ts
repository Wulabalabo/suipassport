
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
    package: "0xa39cb2a24888869d71f7374f15b82f3e0a86edb749fa8215b014f473a1e6f397",
    suiPassportRecord: "0xc54a50c6706b20c6699c26ccd5a7b9773ff390907abec980a863b2927d665542",
    stampDisplay: "0xddcfcd439320340ad3ec8962634a569e19f036f9804468c5be05d660f12cc12b",
    passportDisplay: "0x44d24f3bf4cccfb07e8bc14e4fde3d99c1411ac921589c0b2e3886da061ba50d",
    stampEventRecord: "0x684c3753a85496a0c0a2ed7a580bdb69396d410087df0e6ccfb4707ffe6cdebc",
    stampAdminCap: "0xd6216df66ae25b70e4250343bb94e93295e2b1b53ac910cd80b06a5ff17b9eff",
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
