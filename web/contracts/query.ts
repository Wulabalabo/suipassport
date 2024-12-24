import { isValidSuiAddress } from "@mysten/sui/utils";
import { EventId, SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { UserProfile } from "@/types";
import { StampItem } from "@/types/stamp";
import { PassportItem } from "@/types/passport";
import { NetworkVariables, suiClient } from "@/contracts";

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

export const checkUserState = async (
    address: string,
    networkVariables: NetworkVariables
): Promise<UserProfile | null> => {
    const profile: UserProfile = {
        avatar: "",
        collections: {
            fields: {
                id: {
                    id: ""
                },
                size: 0
            }
        },
        email: "",
        exhibit: [],
        github: "",
        current_user: address,
        id: {
            id: ""
        },
        introduction: "",
        last_time: 0,
        name: "",
        admincap: "",
        points: 0,
        x: "",
    }
    let hasNextPage = true;
    let nextCursor: string | null = null;
    const stamps: StampItem[] = [];
    // Get owned objects filtered by AdminCap and SuiPassport types
    while (hasNextPage) {
        const objects = await suiClient.getOwnedObjects({
            owner: address,
            options: {
                showContent: true
            },
            filter: {
                MatchAny: [
                    {
                        StructType: `${networkVariables.package}::stamp::AdminCap`
                    },
                    {
                        StructType: `${networkVariables.package}::sui_passport::SuiPassport`
                    },
                    {
                        StructType: `${networkVariables.package}::stamp::Stamp`
                    }
                ]
            },
            cursor: nextCursor,
        });
        nextCursor = objects.nextCursor ?? null;
        hasNextPage = objects.hasNextPage;
        // Process each object to find passport and admin status
        objects.data.forEach((obj) => {
            const data = obj.data as unknown as SuiObjectData;
            if (data.content?.dataType !== "moveObject") {
                return;
            }
            const contentType = data.content?.type;
            if (contentType === `${networkVariables.package}::sui_passport::SuiPassport`) {
                const passport = data.content.fields as unknown as UserProfile;
                profile.avatar = passport.avatar;
                profile.collections = passport.collections;
                profile.email = passport.email;
                profile.exhibit = passport.exhibit;
                profile.github = passport.github;
                profile.id = passport.id;
                profile.introduction = passport.introduction;
                profile.last_time = passport.last_time;
                profile.name = passport.name;
                profile.points = passport.points;
                profile.x = passport.x;
            }
            if (contentType === `${networkVariables.package}::stamp::AdminCap`) {
                const adminCap = data.content.fields as unknown as { id: { id: string } };
                const adminCapId = adminCap?.id?.id;
                if (adminCapId) {                    
                    profile.admincap = adminCapId;
                }
            }
            if (contentType === `${networkVariables.package}::stamp::Stamp`) {
                const stamp = data.content.fields as unknown as StampItem;
                stamp.id = (data.content.fields as unknown as { id: { id: string } }).id.id;
                stamp.imageUrl = (data.content.fields as unknown as { image_url: string }).image_url;
                stamps.push(stamp);
            }
        });
    }
    profile.stamps = stamps;

    return profile;
};

export const getStampsData = async (networkVariables: NetworkVariables) => {
    let hasNextPage = true;
    let nextCursor: EventId | null = null;
    let stamps: StampItem[] = [];
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
        }).filter((stamp) => stamp !== undefined) as StampItem[]);
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
