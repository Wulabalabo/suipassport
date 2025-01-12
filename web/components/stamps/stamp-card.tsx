import { DisplayStamp } from "@/app/admin/@stamp/page"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function StampCard({ stamp, setSelectedStamp }: { stamp: DisplayStamp, setSelectedStamp: (stamp: DisplayStamp) => void }) {
    const [imageUrl, setImageUrl] = useState<string>("/mockStamp.png")
    useEffect(() => {
        if (stamp.imageUrl) {
            const isHttpUrl = stamp.imageUrl.startsWith('http://') || stamp.imageUrl.startsWith('https://')
            setImageUrl(isHttpUrl ? stamp.imageUrl : "/mockStamp.png")
        } else {
            setImageUrl("/mockStamp.png")
        }
    }, [stamp])
    return (
        <div
            key={stamp.id}
            onClick={() => setSelectedStamp(stamp)}
            className="block bg-card rounded-2xl p-2 cursor-pointer transform-gpu hover:-translate-y-1 border border-border shadow-md shadow-border"
        >
            <div className="flex flex-col justify-start items-start min-h-[100px] p-4 gap-y-2">
                <div className="flex justify-between items-center w-full">
                    <div className="font-bold text-lg w-full text-nowrap truncate">{stamp.name}</div>
                </div>
                <div className="w-full aspect-square relative">
                    <Image src={imageUrl} alt={stamp.name} fill className={`object-cover ${!stamp.isClaimable ? "grayscale" : ""}`} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                </div>

                <div className="text-blue-400 max-w-32">
                    <p className="truncate">{stamp.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                    Created at: {stamp.timestamp ? new Date(stamp.timestamp).toLocaleDateString() : "N/A"}
                </div>
            </div>
        </div>
    )
}
