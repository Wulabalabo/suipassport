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

import { createBetterTxFactory, NetworkVariables } from "@/contracts";
import { Transaction } from "@mysten/sui/transactions";

export const mint_passport = createBetterTxFactory((
    tx: Transaction, 
    networkVariables: NetworkVariables, 
    name: string, 
    avatar: string, 
    introduction: string, 
    x: string, 
    github: string, 
    email: string = ""
) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "sui_passport",
        function: "mint_passport",
        arguments: [
            tx.object(networkVariables.suiPassportRecord),
            tx.pure.string(name),
            tx.pure.string(avatar),
            tx.pure.string(introduction),
            tx.pure.string(x),
            tx.pure.string(github),
            tx.pure.string(email),
            tx.object("0x6"),
        ],
    });
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

export const edit_passport = createBetterTxFactory((
    tx: Transaction,
    networkVariables: NetworkVariables,
    passport: string,
    name: string,
    avatar: string,
    introduction: string,
    x: string,
    github: string,
    email: string = ""
) => {
    tx.moveCall({
        package: networkVariables.package,
        module: "sui_passport",
        function: "edit_passport",
        arguments: [
            tx.object(passport),
            tx.pure.option("string", name),
            tx.pure.option("string", avatar),
            tx.pure.option("string", introduction),
            tx.pure.option("string", x),
            tx.pure.option("string", github),
            tx.pure.option("string", email),
            tx.object("0x6"),
        ],
    });
});
