import { isValidSuiAddress } from "@mysten/sui/utils";
import { suiClient } from "@/config";
import { SuiObjectResponse } from "@mysten/sui/client";
import { categorizeSuiObjects, CategorizedObjects } from "@/utils/assetsHelpers";
import { NetworkVariables } from "@/types";

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

export const checkPassport = async (address: string, networkVariables: NetworkVariables): Promise<boolean> => {
  console.log(`${networkVariables.package}::sui_passport::mint_passport`);
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
  console.log(objects);
  return objects.data.length > 0;
};
