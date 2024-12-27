
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
    package: "0xa28b5aba8965da59da3b0882aa725945731150828573d4114d12a3580aa46214",
    suiPassportRecord: "0x3acb5685b4bb8f94602c178842bdad7f46bf46bad07ce91dd4e361000506fa8e",
    stampDisplay: "0xee0025288085cecc660809c1b82749e615e40242f6754f6d8ef59e193697f496",
    passportDisplay: "0x5e5b9641fe885203acf7f67a7a4009e4ada1ea067550d40afe1a6ae2f8472314",
    stampEventRecord: "0x00cc37fda12bedc8574960bda14c2abc1d4cc903d7b5eb0f37d87cb39d47a915",
    stampAdminCap: "0x08e2dacc64ff829606ed3b8228597a6f05acf0891f05ac6bc9305b5b8a9c3400",
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
