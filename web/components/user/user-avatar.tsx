import { FocusIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
    avatarUrl: string
    className?: string
    size?: number
}

export function UserAvatar({ 
    avatarUrl, 
    className,
    size = 120 // 默认大小为 120px
}: UserAvatarProps) {
    return (
        <div className={cn("relative", className)}>
            <div 
                className="relative border-[3px] border-gray-400 rounded-full lg:border-4"
                style={{ width: size, height: size }} // 使用 style 设置具体尺寸
            >
                <Avatar className="h-full w-full">
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-white">UN</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-2 bg-black rounded-full p-1 lg:right-2">
                    <FocusIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
            </div>
        </div>
    )
}