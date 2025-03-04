/*public fun claim_stamp(
    event: &mut Event,
    passport: &mut SuiPassport,
    name: String,
    sig: vector<u8>,
    clock: &Clock,
    ctx: &mut TxContext
)*/

import { bcs } from "@mysten/sui/bcs";
import { createBetterTxFactory } from ".";

export const claim_stamp = createBetterTxFactory<{
    event: string;
    passport: string;
    name: string;
    sig: number[]
}>((tx, networkVariables, params) => {
    console.log(params)
    tx.moveCall({
        package: networkVariables.package,
        module: "claim",
        function: "claim_stamp",
        arguments: [
            tx.object(params.event),
            tx.object(params.passport),
            tx.pure.string(params.name),
            tx.pure(bcs.vector(bcs.u8()).serialize(params.sig).toBytes()),
            tx.object(networkVariables.version),
            tx.object('0x6'),
        ]
    })
    return tx;
})
