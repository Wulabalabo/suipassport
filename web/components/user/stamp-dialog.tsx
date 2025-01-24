'use client'

import { StampItem } from "@/types/stamp"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { LinkIcon, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { isClaimable, parseExcel } from "@/utils"
import { useUserProfile } from "@/contexts/user-profile-context"

interface StampDialogProps {
    stamp: StampItem | null
    open: boolean
    admin?: boolean
    isLoading?: boolean
    isClaimable?: boolean
    onOpenChange: (open: boolean) => void
    onClaim?: (claimCode: string) => Promise<void>
    onSend?: (recipient: string) => Promise<void>
    onMultipleSend?: (addresses: string[]) => Promise<void>
    onCloseClick?: () => void
}


function DetailItem({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="gap-y-4 flex flex-col">
            <h4 className="text-sm text-muted-foreground">{label}</h4>
            <p className="text">{value || 'Not available'}</p>
        </div>
    )
}

export function StampDialog({ stamp, open, admin, isLoading, onOpenChange, onClaim, onSend, onMultipleSend, onCloseClick }: StampDialogProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [recipient, setRecipient] = useState('')
    const [claimCode, setClaimCode] = useState('')
    const [isClaiming, setIsClaiming] = useState(false)
    const [canClaim, setCanClaim] = useState(false)
    const [alreadyClaimed, setAlreadyClaimed] = useState(false)
    const [addresses, setAddresses] = useState<string[]>([])
    const { userProfile } = useUserProfile()

    const handleClaimStamp = async () => {
        if (!claimCode || !stamp?.id) return
        setIsClaiming(true)
        if(onClaim){
            await onClaim(claimCode)
        }
        setIsClaiming(false)
        resetAndClose()
    }

    const resetAndClose = () => {
        setAddresses([])
        setRecipient('')
        setClaimCode('')
        setIsClaiming(false)
        setAlreadyClaimed(false)
        onOpenChange(false)
        onCloseClick?.()
    }

    const handleDownload = () => {
        // 创建一个隐藏的 a 标签来触发下载
        const link = document.createElement('a')
        link.href = '/templates/address-template.xlsx'
        link.download = 'address-template.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

    const handleUpload = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.xlsx,.xls'
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                const addresses = await parseExcel(file)
                setAddresses(addresses)
            }
        }
        input.click()
    }

    useEffect(() => {
        if(stamp?.publicClaim){
            setClaimCode("00000")
        }
        if(stamp) setCanClaim(isClaimable(stamp))
        if(userProfile?.db_profile?.stamps?.find((s) => s.id === stamp?.id)){    
            setAlreadyClaimed(true)
        }
    }, [stamp, claimCode, userProfile?.db_profile?.stamps])


    return (
        <Dialog open={open} onOpenChange={resetAndClose}>
            <DialogContent
                className="overflow-y-auto lg:p-6 lg:max-w-screen-md w-11/12 focus:outline-none"
                hideCloseButton
                aria-description="Stamp Dialog"
                aria-describedby={undefined}
            >
                <DialogHeader className="flex flex-row justify-between">
                    <DialogTitle className="flex justify-between gap-x-4 items-center text-3xl font-bold">
                        <p className="text-primary">{stamp?.name.split('#')[0]}{alreadyClaimed && <span className="text-muted-foreground"> (Claimed)</span>}</p>
                        <p className="text-primary">{stamp?.name.split('#')[1] ?  '#' + stamp?.name.split('#')[1] : ''}</p>
                    </DialogTitle>
                    <X
                        className="w-6 h-6 cursor-pointer hover:opacity-70"
                        onClick={resetAndClose}
                    />
                </DialogHeader>

                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-x-12 lg:py-9">
                    {/* Image Container */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="w-40 h-40 aspect-square rounded-full bg-card border border-border shadow-md shadow-border flex items-center justify-center relative overflow-hidden self-center">
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
                                onLoad={() => setIsImageLoading(false)}
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
                        <Button variant="outline" className="rounded-full bg-transparent border border-gray-400 text-lg font-me" onClick={() => window.open(`https://testnet.suivision.xyz/object/${stamp?.id}`, '_blank')} disabled={isLoading}><LinkIcon className="w-4 h-4 text-gray-400" />SuiVision</Button>
                    </div>
                </div>
                {canClaim && stamp?.hasClaimCode && !admin && !alreadyClaimed && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex items-center justify-between gap-2">
                           {!stamp.publicClaim && <div className="flex items-center gap-2 w-2/3">
                                <p className="text-sm text-gray-500 flex-shrink-0">
                                    Claim Code
                                </p>
                                <Input disabled={stamp.publicClaim} placeholder={stamp.publicClaim ? "00000" : "Claim Code"} value={claimCode} onChange={(e) => setClaimCode(e.target.value)} />
                            </div>}
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
                            disabled={!canClaim || claimCode.length === 0 && !stamp.publicClaim}
                            onClick={handleClaimStamp}
                        >
                            {isClaiming ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim Stamp'}
                        </Button>
                    </div>
                )}

                {admin && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <Input 
                                        placeholder="Enter wallet address" 
                                        value={recipient} 
                                        onChange={(e) => setRecipient(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        className="rounded-full whitespace-nowrap"
                                        variant="outline"
                                        onClick={handleUpload}
                                    >
                                        Upload CSV
                                    </Button>
                                    <Button
                                        className="rounded-full whitespace-nowrap"
                                        variant="ghost"
                                        onClick={handleDownload}
                                    >
                                        Get Template
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {addresses.length > 0 && (
                            <div className="max-h-[200px] overflow-y-auto border rounded-lg p-4 space-y-2">
                                {addresses.map((address, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">{address}</span>
                                        <span className="text-gray-400">#{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {addresses.length === 0 && <Button className="rounded-full text-xl font-bold" onClick={() => onSend && onSend(recipient)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                        </Button>}
                        {addresses.length > 0 && <Button className="rounded-full text-xl font-bold" onClick={() => onMultipleSend && onMultipleSend(addresses)} disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Multiple'}
                        </Button>}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}