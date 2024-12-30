import { StampItem } from "@/types/stamp"

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

    return false
}