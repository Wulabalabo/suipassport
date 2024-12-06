import { isValidSuiAddress } from "@mysten/sui/utils";
import { suiClient } from "@/config";
import { EventId, SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { NetworkVariables, UserProfile } from "@/types";
import { StampItem } from "@/types/stamp";

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
  let profile: UserProfile = {
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
    admincap: undefined,
    id: {
      id: ""
    },
    introduction: "",
    last_time: 0,
    name: "",
    points: 0,
    x: ""
  }
  // Get owned objects filtered by AdminCap and SuiPassport types
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
      ]
    },
  });
  // Process each object to find passport and admin status
  objects.data.forEach((obj) => {
    const data = obj.data as unknown as SuiObjectData;
    if (data.content?.dataType !== "moveObject") {
      return;
    }
    const contentType = data.content?.type;
    if (contentType === `${networkVariables.package}::sui_passport::SuiPassport`) {
      profile = data.content.fields as UserProfile;
      profile.current_user = address;
    }

    if (contentType === `${networkVariables.package}::stamp::AdminCap`) {
      console.log(data);
      const adminCap = data as unknown as { objectId: string };
      profile.admincap = adminCap.objectId;
    } else {
      profile.admincap = undefined;
    }
  });

  return profile;
};

export const getStampsData = async (networkVariables: NetworkVariables) => {
  let hasNextPage = true;
  let nextCursor: EventId | null = null;
  let stamps: StampItem[] = [];
  while (hasNextPage) {
    const stampsEvent = await suiClient.queryEvents({
      query: {
        MoveEventType: `${networkVariables.package}::stamp::SetOnlineEventStampEvent`
      },
      cursor: nextCursor,
    });
    console.log(stampsEvent);
    nextCursor = stampsEvent.nextCursor ?? null;
    hasNextPage = stampsEvent.hasNextPage;
    stamps = stamps.concat(stampsEvent.data.map((event) => {
      if (event.type === `${networkVariables.package}::stamp::SetOnlineEventStampEvent`) {
        const stamp = event.parsedJson as StampItem;
        stamp.timestamp = event.timestampMs ? parseInt(event.timestampMs) : undefined;
        stamp.id = (event.parsedJson as unknown as { online_event: string }).online_event;
        stamp.imageUrl = (event.parsedJson as unknown as { image_url: string }).image_url;
        return stamp;
      }
      return undefined;
    }).filter((stamp) => stamp !== undefined) as StampItem[]);
  }
  return stamps;
}
