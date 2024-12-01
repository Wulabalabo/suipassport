'use client'

import { Button } from "@/components/ui/button"
import { EditIcon } from "lucide-react"
import { UserAvatar } from "./user-avatar"

interface ProfileCardProps {
    name?: string
    intro?: string
    avatarUrl?: string
    onEdit?: () => void
}

export function ProfileCard({
    name = "Name",
    intro = "Intro dolor sit amet, consectetur adipiscing mem lit.Curabitu",
    avatarUrl = "",
    onEdit
}: ProfileCardProps) {
    return (
        <div className="relative p-6 mt-6 lg:p-0 lg:mt-0">
            {/* Avatar */}
            <div className="lg:hidden">
                <UserAvatar avatarUrl={avatarUrl} className="absolute -top-2 left-11" />
            </div>
            {/* Edit Button */}
            <div className="mt-6 bg-blue-200 max-h-48 rounded-2xl lg:hidden">
                <div className="pl-6 pr-4 py-4">
                    <div className="flex justify-end">
                        <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}><EditIcon className="w-4 h-4 text-gray-400" /> Edit</Button>
                    </div>
                    {/* Avatar */}
                    <div className="flex flex-col justify-between gap-y-2 mt-6">
                        <h2 className="text-2xl font-medium">{name}</h2>
                        <p className="text-blue-900 text-sm font-normal leading-tight tracking-tight overflow-hidden">{intro}</p>
                    </div>
                </div>
            </div>
            <div className="hidden lg:block bg-blue-200 rounded-t-2xl px-12 py-6">
                <div className="flex justify-start items-center gap-x-20">
                    <UserAvatar avatarUrl={avatarUrl} size={160} />
                    <div className="flex flex-col justify-between gap-y-2 max-w-sm">
                        <h2 className="text-3xl font-bold">{name}</h2>
                        <p className="font-normal leading-tight tracking-tight overflow-hidden">{intro}</p>
                    </div>
                    <div className="self-start flex-1 flex justify-end">
                        <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={onEdit}><EditIcon className="w-4 h-4 text-gray-400" /> Edit</Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 