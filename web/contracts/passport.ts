/*public fun mint_passport(
    record: &mut SuiPassportRecord, 
    name: String,
    avatar: String,
    introduction: String,
    x: String,
    github: String,
    email: String,
    clock: &Clock,
    ctx: &mut TxContext
)*/

import { createBetterTxFactory } from "@/contracts";

export const mint_passport = createBetterTxFactory<{
    name: string;
    avatar: string;
    introduction: string;
    x: string;
    github: string;
    email: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "sui_passport",
        function: "mint_passport",
        arguments: [
            tx.object(networkVariables.suiPassportRecord),
            tx.pure.string(params.name),
            tx.pure.string(params.avatar),
            tx.pure.string(params.introduction),
            tx.pure.string(params.x),
            tx.pure.string(params.github),
            tx.pure.string(params.email),
            tx.object("0x6"),
        ],
    });
    return tx;
});

/*public fun edit_passport(
    passport: &mut SuiPassport,
    mut name: Option<String>,
    mut avatar: Option<String>,
    mut introduction: Option<String>,
    mut x: Option<String>,
    mut github: Option<String>,
    mut email: Option<String>,
    clock: &Clock,
    ctx: &TxContext
)*/

export const edit_passport = createBetterTxFactory<{
    passport: string;
    name: string;
    avatar: string;
    introduction: string;
    x: string;
    github: string;
    email: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "sui_passport",
        function: "edit_passport",
        arguments: [
            tx.object(params.passport),
            tx.pure.option("string", params.name),
            tx.pure.option("string", params.avatar),
            tx.pure.option("string", params.introduction),
            tx.pure.option("string", params.x),
            tx.pure.option("string", params.github),
            tx.pure.option("string", params.email),
            tx.object("0x6"),
        ],
    });
    return tx;
});

/*public fun show_stamp(
    passport: &mut SuiPassport, 
    stamp: &Stamp, 
    clock: &Clock
)*/

export const show_stamp = createBetterTxFactory<{
    passport: string;
    stamp: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "sui_passport",
        function: "show_stamp",
        arguments: [
            tx.object(params.passport),
            tx.object(params.stamp),
            tx.object("0x6"),
        ],
    });
    return tx;
});

