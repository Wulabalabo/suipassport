'use client'

import { StampItem } from "@/types/stamp"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

interface StampCardProps {
    stamp: StampItem
    onClick: () => void
}

export function StampCard({ stamp, onClick }: StampCardProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    return (
        <Card 
            className="cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            onClick={onClick}
        >
            <CardContent className="p-4">
                <div className="aspect-square rounded-lg relative overflow-hidden mb-2">
                    {stamp.imageUrl && !imageError ? (
                        <>
                            {isImageLoading && (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 animate-pulse" />
                            )}
                            <Image 
                                src={stamp.imageUrl}
                                alt={stamp.name}
                                fill
                                className="object-cover rounded-lg transition-opacity duration-300"
                                style={{ opacity: isImageLoading ? 0 : 1 }}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setImageError(true)}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
                    )}
                </div>
                <h4 className="font-semibold truncate">{stamp.name}</h4>
                <p className="text-sm text-blue-500 truncate">{stamp.type}</p>
            </CardContent>
        </Card>
    )
} 