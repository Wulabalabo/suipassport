import { isValidSuiAddress } from "@mysten/sui/utils";
import { suiClient } from "@/config";
import { SuiObjectData, SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { NetworkVariables, UserProfile } from "@/types";

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

export const checkPassport = async (address: string, networkVariables: NetworkVariables): Promise<UserProfile | null> => {
  const objects = await suiClient.getOwnedObjects({
    owner: address,
    options: {
      showContent: true
    },
    filter: {
      MatchAll: [
        {
          StructType: `${networkVariables.package}::sui_passport::SuiPassport`
        },
      ]
    }
  });
  const data =  objects.data[0].data as unknown as SuiObjectData
  if(data.content?.dataType === "moveObject"){
    const profile = data.content.fields as UserProfile
    console.log(profile);
    return profile
  }
  return null
};

export const getUserProfileByObjectId = async (objectId: string): Promise<SuiObjectResponse> => {
  const tx = await suiClient.getObject({
    id: objectId,
    options: {
      showContent: true
    }
  });
  console.log(tx.data);
  return tx
}
