'use client'

import { StampItem } from "@/types/stamp"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import styles from "./stamp-dialog.module.css"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface StampDialogProps {
    stamp: StampItem | null
    open: boolean
    admin?: boolean
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
        <div className="gap-y-2">
            <h4 className={styles.label}>{label}</h4>
            <p className={styles.description}>{value || 'Not available'}</p>
        </div>
    )
}

export function StampDialog({ stamp, open, admin, onOpenChange }: StampDialogProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="lg:h-auto lg:p-12 pb-20 lg:max-w-screen-lg" hideCloseButton={true}>
                <DialogHeader className="flex flex-row justify-between items-center">
                    <DialogTitle className="flex justify-between items-center text-3xl font-bold">
                        {stamp?.name}
                    </DialogTitle>
                    <DialogDescription>
                        <X
                            className="w-6 h-6 font-bold cursor-pointer hover:opacity-70"
                            onClick={() => onOpenChange(false)}
                        />
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 lg:space-y-0 lg:flex lg:py-9">
                    {/* Image Container */}
                    <div className="lg:flex-col lg:w-1/2 lg:items-center lg:justify-center lg:space-y-6">
                        <div className="lg:min-w-80 lg:max-h-40 aspect-[2/1] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {stamp?.imageUrl && !imageError ? (
                                <>
                                    {isImageLoading && (
                                        <Skeleton className="absolute inset-0" />
                                    )}
                                    <Image
                                        src={stamp.imageUrl}
                                        alt={stamp.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="rounded-lg object-cover transition-opacity duration-300"
                                        style={{ opacity: isImageLoading ? 0 : 1, objectFit: 'contain' }}
                                        onLoad={() => setIsImageLoading(false)}
                                        onError={() => setImageError(true)}
                                    />
                                </>
                            ) : (
                                <ImagePlaceholder />
                            )}
                        </div>
                        <div className="lg:w-1/2 lg:block hidden">
                            <DetailItem
                                label="Description"
                                value={stamp?.description}
                            />
                        </div>
                    </div>


                    {/* Details */}
                    <div className="space-y-4 flex flex-col">
                        <DetailItem
                            label="Description"
                            value={stamp?.description}
                        />
                        <DetailItem
                            label="Total Supply"
                            value={stamp?.totalSupply}
                        />
                        <DetailItem
                            label="Point"
                            value={stamp?.point}
                        />
                    </div>
                </div>

                {admin && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                                Send To
                            </p>
                            <Input placeholder="Address" />
                            <Button className="rounded-full" variant="outline">Upload</Button>
                        </div>
                        <Button className="rounded-full text-xl font-bold">Send</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}