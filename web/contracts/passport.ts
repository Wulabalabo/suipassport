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

import { Transaction } from "@mysten/sui/transactions";
import { NetworkVariables } from "@/types";

export function mint_passport(networkVariables: NetworkVariables, name: string, avatar: string, introduction: string, x: string, github: string, email: string) {
    const tx = new Transaction();
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
    return tx;
}

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

export function edit_passport(networkVariables: NetworkVariables, passport: string, name: string, avatar: string, introduction: string, x: string, github: string, email: string) {
    const tx = new Transaction();
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
    return tx;
}
