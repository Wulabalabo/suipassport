
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
    package: "0x2d09fe12a8864a27949b3db0150d09841c0b12e2566f803d6cc17c09f5d30843",
    suiPassportRecord: "0x2da9db9b47c4a313897251e02232ca2105a540b206838d83e37ab915b049a185",
    stampDisplay: "0xc5d78408abf2304e5668fa030892afc866d7abf2ef30255642457b16abb1d6d9",
    passportDisplay: "0xeff1f4365920104f051d0070b2330c518fa5666dbe58af457c3c21a3454aa279",
    stampEventRecord: "0x3351bfd07a10c0496820673de3084fa6593138b4704d02580aaa1db9ca780865",
    stampEventRecordTable:"0xb41a64c233dfac9d0fc3d4bd118a24d92ec50d75aca455a36c421352146a6017",
    stampAdminCap: "0x229ac4d4b244c3a4cd2426cfe0d059ffd27b9fc72418b927e89697e247528930",
    version: "0xa7b9b78c9614e465e0f2b3d16f2841830003091f3ce7de02a1946ab694370ffe",
    adminSet: "0x873599b9778ff26aa594f64d45e30c7423e7123a9a71efdd514bd7c0c1c3dede"
}

const testnetVariables = {
    package: "0x352919f09a96e8bca46cd2a9015c5651aed4aa3ca270f8c09c96ef670c8ede59",
    suiPassportRecord: "0xf7bea21283a25287debc250a426a03f68cf9abbf03752094e9072e637058572b",
    stampDisplay: "0x567bb7c25135da029bab6f0871722cc8d9cdf25a0018f57ecee79903a80e11df",
    passportDisplay: "0x57bbe20853c188df34cc9233a5698e311bc646ea5d5d813b89e6c910bcf7216b",
    stampEventRecord: "0x242efa83af97ea52787cddf9daa284a890851110567b1e8aea255d22137561fb",
    stampEventRecordTable:"0xc6ab6b8ae7b6c6ff0415cc3f62068a8eece7da36f6f0b43522f8a6918a8e4877",
    stampAdminCap: "0x8deb1e81c2b7cceafec4a75e0574c7a882cbaf31fadc39675e76b467db9754c2",
    version: "0x4a4317676aa05a8e673dad0b2cc2fbf855b7170b5259340e2b76121bccbe9363",
    adminSet: "0x6f4c4be85ae2d97cb75481f32fc3e4c1480c422b22c661b3ccf0d5e73725c1c9"
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
