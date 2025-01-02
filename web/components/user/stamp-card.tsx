'use client'

import { StampItem } from "@/types/stamp"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useState } from "react"

interface StampCardProps {
    stamp: StampItem
    onClick: (isActive: boolean,stamp: StampItem) => void
    isActive: boolean
}

export function StampCard({ stamp, onClick, isActive }: StampCardProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    const handleClick = () => {        
        onClick(isActive,stamp)
    }

    return (
        <Card className={`lg:rounded-2xl bg-card border border-border shadow-md shadow-border hover:translate-y-[-5px] cursor-pointer transition-all duration-300`} onClick={handleClick}>
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
                                className={`rounded-lg object-fill transition-opacity duration-300 ${!isActive && 'grayscale'}`}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => setImageError(true)}
                            />
                            {!isActive && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-primary text-center text-2xl font-bold">Click to Activate</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg" />
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <h4 className="font-semibold truncate">{stamp.name.split("#")[0]}</h4>
                    <p className="text-sm text-blue-500 truncate">No.{stamp.name.split("#")[1]}</p>
                </div>
                
                <p className="text-sm text-blue-500 truncate">{stamp.description}</p>
            </CardContent>
        </Card>
    )
} 