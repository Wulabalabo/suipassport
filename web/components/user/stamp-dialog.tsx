'use client'

import { StampItem } from "@/types/stamp"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import Image from "next/image"

interface StampDialogProps {
    stamp: StampItem | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

function ImagePlaceholder() {
    return (
        <div className="text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
            </svg>
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value?: string | number }) {
    return (
        <div>
            <h4 className="text-sm text-gray-500">{label}</h4>
            <p className="text-sm">{value || 'Not available'}</p>
        </div>
    )
}

export function StampDialog({ stamp, open, onOpenChange }: StampDialogProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        {stamp?.name}
                    </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                    {/* Image Container */}
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {stamp?.imageUrl && !imageError ? (
                            <>
                                {isImageLoading && (
                                    <Skeleton className="absolute inset-0" />
                                )}
                                <Image 
                                    src={stamp.imageUrl} 
                                    alt={stamp.name}
                                    fill
                                    className="rounded-lg object-cover transition-opacity duration-300"
                                    style={{ opacity: isImageLoading ? 0 : 1 }}
                                    onLoad={() => setIsImageLoading(false)}
                                    onError={() => setImageError(true)}
                                />
                            </>
                        ) : (
                            <ImagePlaceholder />
                        )}
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                        <DetailItem 
                            label="Description" 
                            value={stamp?.description} 
                        />
                        
                        <DetailItem 
                            label="Event" 
                            value={stamp?.eventName} 
                        />

                        <div className="flex justify-between">
                            <DetailItem 
                                label="Total Supply" 
                                value={stamp?.totalSupply} 
                            />
                            <DetailItem 
                                label="Point" 
                                value={stamp?.point} 
                            />
                        </div>

                        <DetailItem 
                            label="Attribution" 
                            value={stamp?.attribution} 
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}