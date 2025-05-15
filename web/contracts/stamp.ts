

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
            tx.object(`${networkVariables.adminSet}`),
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
            tx.object(`${networkVariables.adminSet}`),
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
    event: &mut Event,
    name: String,
    recipient: address,
    ctx: &mut TxContext
)*/
export const send_stamp = createBetterTxFactory<{
    adminCap: string;
    event: string;
    name: string;
    recipient: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `send`,
        function: `send_stamp`,
        arguments: [
            tx.object(networkVariables.adminSet),
            tx.object(params.event),
            tx.pure.string(params.name),
            tx.pure.address(params.recipient),
            tx.object(networkVariables.version),
        ]
    });
    return tx;
});

/*public fun batch_send_stamp(
    _admin: &AdminCap, 
    event: &mut Event,
    name: String,
    mut recipients: vector<address>,
    ctx: &mut TxContext
) */
export const batch_send_stamp = createBetterTxFactory<{
    adminCap: string;
    event: string;
    name: string;
    recipients: string[];
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `send`,
        function: `batch_send_stamp`,
        arguments: [
            tx.object(networkVariables.adminSet), 
            tx.object(params.event), 
            tx.pure.string(params.name), 
            tx.pure.vector('address', params.recipients),
            tx.object(networkVariables.version),
        ]
    });
    return tx;
});

/*public fun set_admin(_admin: &AdminCap, recipient: address, ctx: &mut TxContext) */
export const set_admin = createBetterTxFactory<{
    adminCap: string;
    recipient: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `set_admin`,
        arguments: [
            tx.object(params.adminCap),
            tx.object(networkVariables.adminSet),
            tx.pure.address(params.recipient)
        ]
    });
    return tx;
});

/*public fun remove_event_stamp(
    _admin: &AdminCap, 
    event: &mut Event, 
    name: String,
) */
export const delete_stamp = createBetterTxFactory<{
    adminCap: string;
    event: string;
    name: string;
}>((tx, networkVariables, params) => {
    tx.moveCall({
        package: `${networkVariables.package}`,
        module: `stamp`,
        function: `remove_event_stamp_v2`,
        arguments: [
            tx.object(`${networkVariables.adminSet}`),
            tx.object(`${networkVariables.stampEventRecord}`),
            tx.object(params.event), 
            tx.pure.string(params.name)]
    });
    return tx;
});


