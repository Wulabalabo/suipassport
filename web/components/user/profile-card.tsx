'use client'

import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { UserProfile } from "@/types"
import { useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { useState } from "react"

interface ProfileCardProps {
    userProfile: UserProfile | null
    onEdit?: () => void
    hideEditButton?: boolean
}

export function ProfileCard({
    userProfile,
    onEdit
}: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const currentAccount = useCurrentAccount()

    useEffect(() => {
        if (currentAccount?.address && isValidSuiAddress(currentAccount.address)) {
            setIsEditing(true)
        }else{
            setIsEditing(false)
        }
    }, [currentAccount?.address])
    return (
        userProfile && <div className="relative p-6 mt-12 lg:p-0 lg:mt-0">
            {/* Avatar */}
            <div className="lg:hidden">
                <UserAvatar avatarUrl={userProfile.avatar} className="absolute -top-5 left-11" />
            </div>
            {/* Mobile View */}
            <div className="mt-6 bg-blue-200 max-h-48 rounded-2xl lg:hidden">
                <div className="pl-6 pr-4 py-4">
                    {isEditing && (
                        <div className="flex justify-end">
                            <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}><EditIcon className="w-4 h-4 text-gray-400" /> Edit</Button>
                        </div>
                    )}
                    {/* Avatar */}
                    <div className="flex flex-col justify-between gap-y-2 mt-6">
                        <h2 className="text-2xl font-medium">{userProfile.name}</h2>
                        <p className="text-blue-900 text-sm font-normal leading-tight tracking-tight overflow-hidden">{userProfile.introduction}</p>
                    </div>
                </div>
            </div>
            {/* Desktop View */}
            <div className="hidden lg:block bg-blue-200 rounded-t-2xl px-12 py-6">
                <div className="flex justify-start items-center gap-x-20">
                    <UserAvatar avatarUrl={userProfile.avatar} size={160} />
                    <div className="flex flex-col justify-between gap-y-2 max-w-sm">
                        <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                        <p className="font-normal leading-tight tracking-tight overflow-hidden">{userProfile.introduction}</p>
                    </div>
                    {isEditing && (
                        <div className="self-start flex-1 flex justify-end">
                            <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}><EditIcon className="w-4 h-4 text-gray-400" /> Edit</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 