import { isValidSuiAddress } from "@mysten/sui/utils";
import { EventId, SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { UserProfile } from "@/types";
import { StampItem } from "@/types/stamp";
import { PassportItem } from "@/types/passport";
import { graphqlClient, NetworkVariables, suiClient } from "@/contracts";
import { getCollectionDetail, getStampsEventRecordData } from "./graphql";
import { convertSuiObject } from "@/utils";

export const getUserProfile = async (address: string): Promise<CategorizedObjects> => {
    if (!isValidSuiAddress(address)) {
        throw new Error("Invalid Sui address");
    }

    let hasNextPage = true;
    let nextCursor: string | null = null;
    let allObjects: SuiObjectResponse[] = [];

    while (hasNextPage) {
        const response = await suiClient.getOwnedObjects({
            owner: address,
            options: {
                showContent: true,
            },
            cursor: nextCursor,
        });

        allObjects = allObjects.concat(response.data);
        hasNextPage = response.hasNextPage;
        nextCursor = response.nextCursor ?? null;
    }

    return categorizeSuiObjects(allObjects);
};

interface ParsedContent<T = unknown> {
    type: string;
    fields: T;
}

function parseObjectData<T>(data: SuiObjectData): ParsedContent<T> | null {
    if (data.content?.dataType !== "moveObject") return null;
    return {
        type: data.content.type,
        fields: data.content.fields as T,
    };
}

export const checkUserState = async (
    address: string,
    networkVariables: NetworkVariables
): Promise<UserProfile | null> => {
    const profile: UserProfile = {
        avatar: "",
        collections: { fields: { id: { id: "" }, size: 0 } },
        email: "",
        exhibit: [],
        github: "",
        current_user: address,
        id: { id: "" },
        introduction: "",
        last_time: 0,
        name: "",
        superAdmincap: "",
        points: 0,
        x: "",
        passport_id: "",
        stamps: [],
        collection_detail: [],
        is_admin: false
    };

    try {
        const response = await suiClient.getObject({
            id: networkVariables.adminSet,
            options: {
                showContent: true
            }
        })
        const adminCap = convertSuiObject<{ admin:{fields:{contents:string[]}} }>(response);
        if (adminCap?.admin.fields.contents.includes(address)) {
            profile.is_admin = true;
        }

        const objects = await fetchAllOwnedObjects(address, networkVariables);
        objects.forEach((obj) => {
            if (!obj.data) return;

            const parsed = parseObjectData(obj.data);
            if (!parsed) return;

            const { type, fields } = parsed;

            switch (type) {
                case `${networkVariables.package}::sui_passport::SuiPassport`:
                    updateProfileFromPassport(profile, fields as UserProfile);
                    break;

                case `${networkVariables.package}::stamp::SuperAdminCap`:
                    const adminCapId = (fields as { id: { id: string } })?.id?.id;
                    if (adminCapId) profile.superAdmincap = adminCapId;
                    profile.is_admin = true;
                    break;

                case `${networkVariables.package}::stamp::Stamp`:
                    const stamp = createStampFromFields(fields as StampFields);
                    if (stamp) profile.stamps?.push(stamp);
                    break;
            }
        });

        await enrichProfileWithCollectionDetails(profile, graphqlClient);

       

        return profile;
    } catch (error) {
        console.error('Error in checkUserState:', error);
        return null;
    }
};

async function fetchAllOwnedObjects(
    address: string,
    networkVariables: NetworkVariables
): Promise<SuiObjectResponse[]> {
    const allObjects: SuiObjectResponse[] = [];
    let hasNextPage = true;
    let nextCursor: string | null = null;

    while (hasNextPage) {
        const response = await suiClient.getOwnedObjects({
            owner: address,
            options: { showContent: true },
            filter: {
                MatchAny: [
                    { StructType: `${networkVariables.package}::stamp::SuperAdminCap` },
                    { StructType: `${networkVariables.package}::sui_passport::SuiPassport` },
                    { StructType: `${networkVariables.package}::stamp::Stamp` }
                ]
            },
            cursor: nextCursor,
        });

        allObjects.push(...response.data);
        hasNextPage = response.hasNextPage;
        nextCursor = response.nextCursor ?? null;
    }

    return allObjects;
}

function updateProfileFromPassport(profile: UserProfile, passportFields: Partial<UserProfile>) {
    type ValidKeys = keyof Pick<UserProfile, 'avatar' | 'collections' | 'email' | 'exhibit' |
        'github' | 'id' | 'introduction' | 'last_time' | 'name' | 'points' | 'x'>;

    (Object.keys(passportFields) as ValidKeys[]).forEach(field => {
        if (field in passportFields && field in profile) {
            (profile[field] as UserProfile[ValidKeys]) = passportFields[field] as UserProfile[ValidKeys];
        }
    });

    if (passportFields.id?.id) {
        profile.passport_id = passportFields.id.id;
    }
}

interface StampFields {
    id: { id: string };
    image_url: string;
    name: string;
    [key: string]: unknown;
}

function createStampFromFields(fields: StampFields): StampItem | null {
    try {
        return {
            ...fields,
            id: fields.id.id,
            imageUrl: fields.image_url,
            name: fields.name
        };
    } catch (error) {
        console.error('Error creating stamp:', error);
        return null;
    }
}

async function enrichProfileWithCollectionDetails(
    profile: UserProfile,
    client: typeof graphqlClient
): Promise<void> {
    interface CollectionQueryResult {
        data?: {
            owner?: {
                dynamicFields?: {
                    nodes?: Array<{
                        name?: {
                            json: string;
                        };
                    }>;
                };
            };
        };
    }

    const collectionDetail = await client.query({
        query: getCollectionDetail,
        variables: {
            address: profile.collections.fields.id.id,
        }
    }) as CollectionQueryResult;

    profile.collection_detail =
        collectionDetail.data?.owner?.dynamicFields?.nodes
            ?.map(node => node.name?.json)
            ?.filter((item): item is string => Boolean(item)) ?? [];
}

const getStampsEventRecord = async (networkVariables: NetworkVariables) => {
    let hasNextPage = true;
    let nextCursor: string | null = null;
    let stamps: string[] = [];
    interface StampsEventResponse {
        data?: {
            owner?: {
                dynamicFields?: {
                    nodes?: Array<{
                        value?: {
                            json: string;
                        };
                    }>;
                    pageInfo?: {
                        hasNextPage: boolean;
                        endCursor: string | null;
                    };
                };
            };
        };
    }
    while (hasNextPage) {
        const stampsData: StampsEventResponse = await graphqlClient.query({
            query: getStampsEventRecordData,
            variables: {
                address: networkVariables.stampEventRecordTable,
                after: nextCursor
            }
        }) as StampsEventResponse;
        nextCursor = stampsData.data?.owner?.dynamicFields?.pageInfo?.endCursor ?? null;
        hasNextPage = stampsData.data?.owner?.dynamicFields?.pageInfo?.hasNextPage ?? false;
        stamps = stamps.concat(stampsData.data?.owner?.dynamicFields?.nodes?.map((node) => {
            return node.value?.json as string;
        }) ?? []);
    }
    return stamps;
}

export const getStampsData = async (networkVariables: NetworkVariables) => {
    
    const stampsEvents: StampsEvent[] = [];
    interface StampsEvent {
        description: string;
        event: string;
        id: { id: string };
        stamp_type: string[];
    }

    const stampsEventRecord = await getStampsEventRecord(networkVariables);
    const stampsEvent = await suiClient.multiGetObjects({
        ids: stampsEventRecord,
        options: {
            showContent: true,
        }
    });
    stampsEvent.map((event) => {
        const stampEvent = event.data?.content as unknown as { fields: StampsEvent };
        if (stampEvent.fields.stamp_type.length > 0) {
            stampsEvents.push(stampEvent.fields);
        }
    })

    let stamps: StampItem[] = [];
    let nextCursor: EventId | null = null;
    let hasNextPage = true;
    while (hasNextPage) {
        const stampsEvent = await suiClient.queryEvents({
            query: {
                MoveEventType: `${networkVariables.package}::stamp::SetEventStamp`
            },
            cursor: nextCursor,
        });
        nextCursor = stampsEvent.nextCursor ?? null;
        hasNextPage = stampsEvent.hasNextPage;
        stamps = stamps.concat(stampsEvent.data.map((event) => {
            if (event.type === `${networkVariables.package}::stamp::SetEventStamp`) {
                const stamp = event.parsedJson as StampItem;
                stamp.timestamp = event.timestampMs ? parseInt(event.timestampMs) : undefined;
                stamp.id = (event.parsedJson as unknown as { event: string }).event;
                stamp.imageUrl = (event.parsedJson as unknown as { image_url: string }).image_url;
                return stamp;
            }
            return undefined;
        }).filter((stamp) => {
            if (!stamp) return false;
            return stampsEvents.some(event => event.event === stamp.name);
        }) as StampItem[]);
    }

    return stamps;
}

export const getPassportData = async (networkVariables: NetworkVariables) => {
    let hasNextPage = true;
    let nextCursor: EventId | null = null;
    let passport: PassportItem[] = [];
    while (hasNextPage) {
        const passportEvent = await suiClient.queryEvents({
            query: {
                MoveEventType: `${networkVariables.package}::sui_passport::MintPassportEvent`
            },
            cursor: nextCursor,
        });
        nextCursor = passportEvent.nextCursor ?? null;
        hasNextPage = passportEvent.hasNextPage;
        passport = passport.concat(passportEvent.data.map((event) => {
            const passport = event.parsedJson as PassportItem;
            passport.timestamp = event.timestampMs ? parseInt(event.timestampMs) : undefined;
            passport.id = (event.parsedJson as unknown as { passport: string }).passport;
            return passport;
        }));
    }
    return passport;
}

export const getEventFromDigest = async (digest: string) => {
    const tx = await suiClient.getTransactionBlock({
        digest: digest,
        options: {
            showEvents: true
        }
    })
    console.log("tx.events", tx.events)
    const stamp = tx.events?.[0]?.parsedJson as StampItem;
    stamp.timestamp = tx.events?.[0]?.timestampMs ? parseInt(tx.events?.[0]?.timestampMs) : undefined;
    stamp.id = (tx.events?.[0]?.parsedJson as unknown as { event: string }).event;
    stamp.imageUrl = (tx.events?.[0]?.parsedJson as unknown as { image_url: string }).image_url;
    return stamp;
}

export const getSuiNSName = async (address: string) => {
    const name = await suiClient.resolveNameServiceNames({
        format: "dot",
        address: address
    })
    if (name.data.length > 0) {
        return name.data[0]
    }
    return address
}


