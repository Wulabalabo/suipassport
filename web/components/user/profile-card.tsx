'use client'

import { Button } from "@/components/ui/button"
import { EditIcon, Github, TwitterIcon } from "lucide-react"
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

interface SocialLink {
    icon: React.ReactNode
    href: string
    label: string
}

function getSocialLinks(userProfile: UserProfile): SocialLink[] {
    const links: SocialLink[] = []

    if (userProfile.x) {
        links.push({
            icon: <TwitterIcon className="w-5 h-5" />,
            href: `https://twitter.com/${userProfile.x}`,
            label: 'Twitter'
        })
    }

    if (userProfile.github) {
        links.push({
            icon: <Github className="w-5 h-5" />,
            href: `https://github.com/${userProfile.github}`,
            label: 'GitHub'
        })
    }

    return links
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
        } else {
            setIsEditing(false)
        }
    }, [currentAccount?.address])
    return (
        userProfile && <div className="relative p-6 mt-6 lg:p-0 lg:mt-0">
            {/* Mobile View */}
            <div className="mt-6 bg-blue-200 max-h-48 rounded-2xl lg:hidden">
                <div className="pl-6 pr-4 py-4 relative">
                    {isEditing && (
                        <div className="flex justify-end">
                            <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}>
                                <EditIcon className="w-4 h-4 text-gray-400" /> Edit
                            </Button>
                        </div>
                    )}
                    <div className="flex flex-col justify-between gap-y-2 mt-6">
                        <h2 className="text-2xl font-medium">{userProfile.name}</h2>
                        <p className="text-blue-900 text-sm font-normal leading-tight tracking-tight overflow-hidden">{userProfile.introduction}</p>
                    </div>
                    {/* Social Links - Mobile (Bottom Right) */}
                    <div className="absolute bottom-4 right-4 flex gap-x-4">
                        {getSocialLinks(userProfile).map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                aria-label={link.label}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-blue-200 rounded-t-2xl px-12 py-6">
                <div className="relative">
                    <div className="flex justify-start items-center gap-x-20">
                        <UserAvatar avatarUrl={userProfile.avatar} size={160} />
                        <div className="flex flex-col justify-between gap-y-2 max-w-sm">
                            <h2 className="text-3xl font-bold">{userProfile.name}</h2>
                            <p className="font-normal leading-tight tracking-tight overflow-hidden">{userProfile.introduction}</p>
                        </div>
                        {isEditing && (
                            <div className="self-start flex-1 flex justify-end">
                                <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}>
                                    <EditIcon className="w-4 h-4 text-gray-400" /> Edit
                                </Button>
                            </div>
                        )}
                    </div>
                    {/* Social Links - Desktop (Bottom Right) */}
                    <div className="absolute bottom-0 right-0 flex gap-x-4">
                        {getSocialLinks(userProfile).map((link, index) => (
                            <a
                                key={index}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                                aria-label={link.label}
                            >
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 