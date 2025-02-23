import { UserProfile } from "@/types"
import { DisplayStamp, StampItem } from "@/types/stamp"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { read, utils } from "xlsx"

export const isClaimable = (stamp: StampItem) => {
    // If no claim code exists, return false
    if (!stamp?.hasClaimCode) {
        return false
    }

    const now = Date.now()
    const startTime = stamp.claimCodeStartTimestamp ? Number(stamp.claimCodeStartTimestamp) : null
    const endTime = stamp.claimCodeEndTimestamp ? Number(stamp.claimCodeEndTimestamp) : null

    // If no start time and no end time, return true
    if (!startTime && !endTime) {
        return true
    }

    // If only start time exists, check if current time is after start
    if (startTime && !endTime) {
        return now >= startTime
    }

    // If only end time exists, check if current time is before end
    if (!startTime && endTime) {
        return now <= endTime
    }

    // If both start and end exist, check if current time is within range
    if (startTime && endTime) {
        return now >= startTime && now <= endTime
    }

    if(stamp.claimCount && stamp.totalCountLimit && stamp.claimCount >= stamp.totalCountLimit){
        return false
    }

    return false
}

export const parseExcel = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const buffer = e.target?.result as ArrayBuffer
            const data = new Uint8Array(buffer)
            const workbook = read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const rows = utils.sheet_to_json(firstSheet)
            const addresses = new Set<string>()
            
            rows.forEach((row: unknown) => {
                if (typeof row === 'object' && row !== null) {
                    const address = Object.values(row)[0]
                    if (typeof address === 'string' && isValidSuiAddress(address)) {
                        addresses.add(address)
                    }
                }
            })
            
            resolve(Array.from(addresses))
        }
        reader.readAsArrayBuffer(file)
    })
}


export const getDisplayStamps = (stamps: StampItem[], userProfile: UserProfile): DisplayStamp[] => {
    // Create a map to count claimed stamps per event
    const eventClaimCounts = new Map<string, number>();
    
    // Count existing claimed stamps per event
    userProfile?.stamps?.forEach(userStamp => {
        const event = userStamp.event;
        if (event) {
            eventClaimCounts.set(event, (eventClaimCounts.get(event) || 0) + 1);
        }
    });

    return stamps.map(stamp => {
        const isClaimed = userProfile?.stamps?.some(
            userStamp => userStamp.name.split("#")[0] === stamp.name
        ) ?? false;

        const claimedCount = stamp.event ? (eventClaimCounts.get(stamp.event) || 0) : 0;
        
        const isClaimable = stamp.event && stamp.userCountLimit 
            ? claimedCount < stamp.userCountLimit
            : true;

        return {
            ...stamp,
            isClaimed,
            isClaimable,
            claimedCount
        };
    });
}