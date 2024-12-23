

/*public fun set_online_event_stamp(
    _admin: &AdminCap, 
    online_event: &mut OnlineEvent, 
    name: String,
    image_url: String,
    points: u64,
    description: String,
)*/

import { createBetterTxFactory } from "@/contracts";
/*public fun create_online_event(
    _admin: &AdminCap, 
    online_event_record: &mut OnlineEventRecord,
    event: String, 
    description: String,
    ctx: &mut TxContext
)*/
export const create_event_stamp = createBetterTxFactory<{
    adminCap: string;
    event: string;
    description: string;
    image_url: string;
    points: number;
}>((tx, networkVariables, params) => {
    const [Event] = tx.moveCall({
        package: `${networkVariables.package}`,
        module: "stamp",
        function: "create_event",
        arguments: [
            tx.object(params.adminCap),
            tx.object(`${networkVariables.stampEventRecord}`),
            tx.pure.string(params.event),
            tx.pure.string(params.description)
        ]
    });
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `set_event_stamp`,
        arguments: [
            tx.object(params.adminCap),
            Event,
            tx.pure.string(params.event),
            tx.pure.string(params.image_url),
            tx.pure.u64(params.points),
            tx.pure.string(params.description),
        ]
    });
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `share_event`,
        arguments: [
            Event
        ]
    });
    return tx;
});

/*public fun send_stamp(
    _admin: &AdminCap, 
    online_event: &mut OnlineEvent,
    name: String,
    recipient: address,
    ctx: &mut TxContext
)*/
export const send_stamp = createBetterTxFactory<{
    adminCap: string;
    online_event: string;
    name: string;
    recipient: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `send_stamp`,
        arguments: [
            tx.object(params.adminCap),
            tx.object(params.online_event),
            tx.pure.string(params.name),
            tx.pure.address(params.recipient)
        ]
    });
    return tx;
});
