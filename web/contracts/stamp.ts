

/*public fun set_online_event_stamp(
    _admin: &AdminCap, 
    online_event: &mut OnlineEvent, 
    name: String,
    image_url: String,
    points: u64,
    description: String,
)*/

import { Transaction } from "@mysten/sui/transactions";
import { createBetterTxFactory, NetworkVariables } from "@/contracts";
/*public fun create_online_event(
    _admin: &AdminCap, 
    online_event_record: &mut OnlineEventRecord,
    event: String, 
    description: String,
    ctx: &mut TxContext
)*/
export const create_event_stamp = createBetterTxFactory((
    tx: Transaction,
    networkVariables: NetworkVariables,
    adminCap: string,
    event: string,
    description: string,
    image_url: string,
    points: number
) => {
    const [OnlineEvent] = tx.moveCall({
        package: `${networkVariables.package}`,
        module: "stamp",
        function: "create_online_event",
        arguments: [
            tx.object(adminCap),
            tx.object(`${networkVariables.stampOnlineEventRecord}`),
            tx.pure.string(event),
            tx.pure.string(description)
        ]
    });
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `set_online_event_stamp`,
        arguments: [
            tx.object(adminCap),
            OnlineEvent,
            tx.pure.string(event),
            tx.pure.string(image_url),
            tx.pure.u64(points),
            tx.pure.string(description),
        ]
    });
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `share_online_event`,
        arguments: [
            OnlineEvent
        ]
    });
});

/*public fun send_stamp(
    _admin: &AdminCap, 
    online_event: &mut OnlineEvent,
    name: String,
    recipient: address,
    ctx: &mut TxContext
)*/
export const send_stamp = createBetterTxFactory((
    tx: Transaction,
    networkVariables: NetworkVariables,
    adminCap: string,
    online_event: string,
    name: string,
    recipient: string
) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `send_stamp`,
        arguments: [
            tx.object(adminCap),
            tx.object(online_event),
            tx.pure.string(name),
            tx.pure.address(recipient)
        ]
    });
});
