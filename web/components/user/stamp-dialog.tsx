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
import { isValidSuiAddress } from "@mysten/sui/utils"
import { send_stamp } from "@/contracts/stamp"
import { useNetworkVariables } from "@/config"
import { useUserProfile } from "@/contexts/user-profile-context"
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import { useToast } from "@/hooks/use-toast"

interface StampDialogProps {
    stamp: StampItem | null
    open: boolean
    admin?: boolean
    onOpenChange: (open: boolean) => void
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
    const [recipient, setRecipient] = useState('')
    const networkVariables = useNetworkVariables()
    const { userProfile } = useUserProfile()
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const { toast } = useToast()

    const handleSendStamp = async () => {
        if (!recipient || !isValidSuiAddress(recipient) || !userProfile?.admincap || !stamp?.id) return
        const tx = await send_stamp(networkVariables, userProfile?.admincap, stamp?.id, stamp?.name, recipient)
        await signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: () => {
                toast({
                    title: 'Stamp sent successfully',
                    description: 'Stamp sent successfully',
                })
                onOpenChange(false)
            }
        })
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="h-[90vh] overflow-y-auto lg:h-auto lg:max-h-[90vh] lg:p-6 lg:max-w-screen-md"
                hideCloseButton={true}
            >
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

                <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-x-12 lg:py-9">
                    {/* Image Container */}
                    <div className="w-full lg:w-1/2 flex flex-col">
                        <div className="w-full min-w-40 max-h-40 aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {isImageLoading && (
                                <Skeleton className="absolute inset-0" />
                            )}
                            <Image
                                src={stamp?.imageUrl ?? '/mockStamp.png'}
                                alt={stamp?.name ?? ''}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="rounded-lg object-cover transition-opacity duration-300"
                                style={{ opacity: isImageLoading ? 0 : 1, objectFit: 'contain' }}
                                onLoad={() => setIsImageLoading(false)}
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
                            label="Point"
                            value={stamp?.points}
                        />
                    </div>
                </div>

                {admin && (
                    <div className="flex flex-col gap-4 gap-y-6 pt-6">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500 flex-shrink-0">
                                Send To
                            </p>
                            <Input placeholder="Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                            <Button className="rounded-full" variant="outline">Upload</Button>
                        </div>
                        <Button className="rounded-full text-xl font-bold" onClick={handleSendStamp}>Send</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}