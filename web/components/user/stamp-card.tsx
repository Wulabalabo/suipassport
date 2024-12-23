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
        <Card className="lg:rounded-2xl bg-gray-100" onClick={onClick}>
            <CardContent className="p-3 lg:p-6">
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
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="rounded-lg object-fill transition-opacity duration-300"
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setImageError(true)}
                            />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
                    )}
                </div>
                <h4 className="font-semibold truncate">{stamp.name}</h4>
                <p className="text-sm text-blue-500 truncate">{stamp.description}</p>
            </CardContent>
        </Card>
    )
} 