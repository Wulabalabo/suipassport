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
