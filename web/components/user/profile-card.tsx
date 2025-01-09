'use client'

import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"
import { UserAvatar } from "./user-avatar"
import { UserProfile } from "@/types"
import { useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PassportForm, PassportFormValues } from "../passport/passport-form"

interface ProfileCardProps {
    userProfile: UserProfile | null
    onEdit?: (passportFormValues: PassportFormValues) => Promise<void>
    hideEditButton?: boolean
    isLoading?: boolean
}

export function ProfileCard({
    userProfile,
    onEdit,
    isLoading
}: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const currentAccount = useCurrentAccount()

    useEffect(() => {
        if (currentAccount?.address && isValidSuiAddress(currentAccount.address) && userProfile?.current_user === currentAccount.address) {
            setIsEditing(true)
        }else{
            setIsEditing(false)
        }
    }, [currentAccount?.address, userProfile?.current_user])

    const handleEditSubmit = async (values: PassportFormValues) => {
        try {
            setIsSubmitting(true)
            await onEdit?.(values)
            setShowEditDialog(false)
        } catch (error) {
            console.error("Error updating profile:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditClick = () => {
        setShowEditDialog(true)
    }

    return (
        <>
            {userProfile && <div className="relative p-6 mt-12 lg:p-0 lg:mt-0">
                {/* Avatar */}
                <div className="lg:hidden">
                    <UserAvatar avatarUrl={userProfile.avatar} className="absolute -top-5 left-11" />
                </div>
                {/* Mobile View */}
                <div className="mt-6 bg-muted border border-border shadow-md shadow-border max-h-48 rounded-2xl lg:hidden">
                    <div className="pl-6 pr-4 py-4">
                        {isEditing ? (
                            <div className="flex justify-end">
                                <Button variant="outline" className="rounded-full bg-card border border-border shadow-md shadow-border text-lg font-me" onClick={handleEditClick}><EditIcon className="w-4 h-4 text-muted-foreground" /> Edit</Button>
                            </div>
                        ) : <div className="flex justify-end min-h-9"></div>}
                        {/* Avatar */}
                        <div className="flex flex-col justify-between gap-y-2 mt-6">
                            <h2 className="text-2xl font-medium">{userProfile.name}</h2>
                            <p className="text-muted-foreground text-sm font-normal tracking-tight leading-tight overflow-hidden">{userProfile.introduction}</p>
                        </div>
                    </div>
                </div>
                {/* Desktop View */}
                <div className="hidden lg:block bg-primary-foreground rounded-t-2xl px-12 py-6">
                    <div className="flex justify-start items-center gap-x-20">
                        <UserAvatar avatarUrl={userProfile.avatar} size={160} />
                        <div className="flex flex-col justify-between gap-y-2 max-w-sm">
                            <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                            <p className="font-normal tracking-tight leading-loose overflow-hidden">{userProfile.introduction}</p>
                        </div>
                        {isEditing && (
                            <div className="self-start flex-1 flex justify-end">
                                <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={handleEditClick} disabled={isLoading}><EditIcon className="w-4 h-4 text-gray-400" /> Edit</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>}
            
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <PassportForm 
                        onSubmit={handleEditSubmit}
                        isSubmitting={isSubmitting}
                        defaultValues={{
                            name: userProfile?.name,
                            avatar: userProfile?.avatar,
                            introduction: userProfile?.introduction,
                            x: userProfile?.x,
                            github: userProfile?.github,
                        }}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
} 