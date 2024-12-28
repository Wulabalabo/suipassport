'use client'

import { StampItem } from "@/types/stamp"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import styles from "./stamp-dialog.module.css"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

interface StampDialogProps {
    stamp: StampItem | null
    open: boolean
    admin?: boolean
    isLoading?: boolean
    onOpenChange: (open: boolean) => void
    onClaim: (claimCode: string) => Promise<void>
    onSend: (recipient: string) => Promise<void>
}


function DetailItem({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="gap-y-2">
            <h4 className={styles.label}>{label}</h4>
            <p className={styles.description}>{value || 'Not available'}</p>
        </div>
    )
}

export function StampDialog({ stamp, open, admin, isLoading, onOpenChange, onClaim, onSend }: StampDialogProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [recipient, setRecipient] = useState('')
    const [claimCode, setClaimCode] = useState('')
    const [isClaiming, setIsClaiming] = useState(false)
    const [disabledClaim, setDisabledClaim] = useState(false)

    const handleClaimStamp = async () => {
        if (!claimCode || !stamp?.id) return
        setIsClaiming(true)
        await onClaim(claimCode)
        setIsClaiming(false)
        onOpenChange(false)
    }

    useEffect(() => {
        setDisabledClaim(Boolean(
            !stamp?.hasClaimCode ||
            (stamp?.claimCodeStartTimestamp ? Number(stamp.claimCodeStartTimestamp) > Date.now() / 1000 : false) ||
            (stamp?.claimCodeEndTimestamp ? Number(stamp.claimCodeEndTimestamp) < Date.now() / 1000 : false)
        ))
    }, [stamp, claimCode])


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="overflow-y-auto lg:p-6 lg:max-w-screen-md w-11/12 focus:outline-none"
                hideCloseButton={true}
                aria-description="Stamp Dialog"
                aria-describedby={undefined}
            >
                <DialogHeader className="flex flex-row justify-between">
                    <DialogTitle className="flex justify-between items-center text-3xl font-bold">
                        {stamp?.name}
                    </DialogTitle>
                    <X
                        className="w-6 h-6 cursor-pointer hover:opacity-70"
                        onClick={() => onOpenChange(false)}
                    />
                </DialogHeader>

                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-x-12 lg:py-9">
                    {/* Image Container */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="w-40 h-40 aspect-square rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden self-center">
                            {!stamp?.imageUrl && isImageLoading && (
                                <Skeleton className="absolute inset-0" />
                            )}
                            <Image
                                src={stamp?.imageUrl?.startsWith('http') ? stamp?.imageUrl : '/mockStamp.png'}
                                alt={stamp?.name ?? ''}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover transition-opacity duration-300 rounded-full"
                                style={{ opacity: isImageLoading ? 0 : 1, objectFit: 'contain' }}
                                onLoadingComplete={() => setIsImageLoading(false)}
                            />

                        </div>
                    </div>


                    {/* Details */}
                    <div className="lg:w-1/2 space-y-4 flex flex-col">
                        <DetailItem
                            label="Description"
                            value={stamp?.description}
                        />
                        <DetailItem
                            label="Point"
                            value={stamp?.points}
                        />
                    </div>
                </div>
                {stamp?.hasClaimCode && !admin && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 w-2/3">
                                <p className="text-sm text-gray-500 flex-shrink-0">
                                    Claim Code
                                </p>
                                <Input placeholder="Claim Code" value={claimCode} onChange={(e) => setClaimCode(e.target.value)} />
                            </div>
                            <div>
                               {stamp.totalCountLimit!==0? <p>{stamp.claimCount}/{stamp.totalCountLimit}</p>:<p className="text-sm text-primary flex-shrink-0 uppercase">unlimited</p>}
                            </div>
                        </div>
                        {stamp.claimCodeStartTimestamp && (
                            <p className="text-sm text-gray-500">
                                Available from: {new Date(Number(stamp.claimCodeStartTimestamp)).toLocaleString()}
                            </p>
                        )}
                        {stamp.claimCodeEndTimestamp && (
                            <p className="text-sm text-gray-500">
                                Available until: {new Date(Number(stamp.claimCodeEndTimestamp)).toLocaleString()}
                            </p>
                        )}
                        <Button
                            className="rounded-full"
                            disabled={disabledClaim || claimCode.length === 0}
                            onClick={handleClaimStamp}
                        >
                            {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim Stamp'}
                        </Button>
                    </div>
                )}

                {admin && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                                Send To
                            </p>
                            <Input placeholder="Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                            <Button className="rounded-full" variant="outline">Upload</Button>
                        </div>
                        <Button className="rounded-full text-xl font-bold" onClick={() => onSend(recipient)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}