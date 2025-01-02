'use client'

import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useEffect, useState } from "react"
import { CreateStampDialog } from "./components/create-stamp-dialog"
import { StampDialog } from "@/components/user/stamp-dialog"
import { StampItem } from "@/types/stamp"
import { CreateStampFormValues } from "@/types/form"
import { batch_send_stamp, create_event_stamp, send_stamp } from "@/contracts/stamp"
import { useUserProfile } from "@/contexts/user-profile-context"
import { useToast } from "@/hooks/use-toast"
import { useBetterSignAndExecuteTransaction } from "@/hooks/use-better-tx"
import { getEventFromDigest } from "@/contracts/query"
import { ClaimStamp } from "@/lib/validations/claim-stamp"
import { getDataFromEffects } from "@/lib/utils"
import { claim_stamp } from "@/contracts/claim"
import { ClaimStampResponse } from "@/types"
import { usePassportsStamps } from "@/contexts/passports-stamps-context"
import { useNetworkVariables } from "@/contracts"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useClaimStamps } from "@/hooks/use-stamp-crud"
import { useUserCrud } from "@/hooks/use-user-crud"
import { stamp } from "@/types/db"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { isClaimable } from "@/utils"
import StampCard from "./components/stamp-card"

interface AdminStampProps {
    stamps: StampItem[] | null;
    admin: boolean
}

export type DisplayStamp = StampItem & {
    isClaimable: boolean
}

export default function AdminStamp({ stamps, admin }: AdminStampProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedStamp, setSelectedStamp] = useState<DisplayStamp | null>(null)
    const [displayStamps, setDisplayStamps] = useState<DisplayStamp[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [sortDirection, setSortDirection] = useState<'all' | 'claimable'>('all')
    const [displayDialog, setDisplayDialog] = useState(false)
    const { userProfile } = useUserProfile();
    const currentAccount = useCurrentAccount()
    const { refreshPassportStamps } = usePassportsStamps()
    const { refreshProfile } = useUserProfile()
    const { createClaimStamp,isLoading:isCreatingClaimStamp } = useClaimStamps()
    const { toast } = useToast();
    const { updateUserData,fetchUserByAddress,createNewUser,isLoading:isUserLoading } = useUserCrud()
    const networkVariables = useNetworkVariables()
    const { handleSignAndExecuteTransaction: handleCreateStampTx } = useBetterSignAndExecuteTransaction({
        tx: create_event_stamp
    })
    const { handleSignAndExecuteTransaction: handleClaimStampTx } = useBetterSignAndExecuteTransaction({
        tx: claim_stamp
    })
    const { handleSignAndExecuteTransaction: handleSendStampTx,isLoading:isSending } = useBetterSignAndExecuteTransaction({
        tx: send_stamp
    })
    const { handleSignAndExecuteTransaction: handleBatchSendStampTx,isLoading:isBatchSending } = useBetterSignAndExecuteTransaction({
        tx: batch_send_stamp
    })


    const handleStampClaim = async (claimCode: string) => {
        if (!selectedStamp?.id || !userProfile?.db_profile) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "You should have a passport to claim a stamp",
            });
            return;
        }
        const stamps = userProfile?.db_profile?.stamps as stamp[]
        const parsedStamps: stamp[] = Array.isArray(stamps) ? stamps : JSON.parse(stamps as unknown as string)
        if (parsedStamps.some(stamp => stamp.id===selectedStamp?.id)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `You have already have this stamp`,
            });
            return
        }
        if( selectedStamp.claimCount && selectedStamp.totalCountLimit!==0 && selectedStamp?.claimCount>=selectedStamp.totalCountLimit!){
            toast({
                variant: "destructive",
                title: "Error",
                description: "Stamp is claimed out",
            });
            return
        }
        const requestBody = {
            stamp_id: selectedStamp?.id,
            claim_code: claimCode,
            passport_id: userProfile?.id.id,
            last_time: userProfile?.last_time
        }
        console.log(requestBody)
        const result = await fetch("/api/claim-stamps/verify", {
            method: "POST",
            body: JSON.stringify(requestBody)
        })
        const data = await result.json() as ClaimStampResponse

        if (!data.signature || !data.valid) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Invalid claim code",
            });
            return
        }

        // Convert signature object to array
        const signatureArray = Object.values(data.signature)

        await handleClaimStampTx({
            event: selectedStamp?.id ?? "",
            passport: userProfile?.id.id ?? "",
            name: selectedStamp?.name ?? "",
            sig: signatureArray
        }).onSuccess(async () => {
            await onStampClaimed()
            await refreshProfile(currentAccount?.address ?? '', networkVariables)
            await refreshPassportStamps(networkVariables)
            toast({
                title: "Stamp claimed successfully",
                description: "Stamp claimed successfully",
            })
        }).execute()
    }

    const handleCreateStamp = async (values: CreateStampFormValues) => {
        if (!userProfile?.db_profile) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Database connection error",
            });
            return
        }
        if (!userProfile?.admincap) return;
        handleCreateStampTx({
            adminCap: userProfile.admincap,
            event: values.name,
            description: values.description,
            image_url: values.image,
            points: Number(values.point)
        }).onSuccess(async (result) => {
            if (result?.effects) {
                await onStampCreated(result.effects, values)
                refreshPassportStamps(networkVariables)
            }

            toast({
                title: "Stamp created successfully",
                description: "Stamp created successfully",
            });
        }).onError((e) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message,
            });
        }).execute()
    }
    const handleSendStamp = async (recipient: string) => {
        if(!isValidSuiAddress(recipient)){
            toast({
                variant: "destructive",
                title: "Error",
                description: "Invalid address",
            });
            return
        }
        if (!userProfile?.admincap || !selectedStamp?.id) return
        {/* check if user has this stamp */}
        let dbUser = await fetchUserByAddress(recipient)
        if(dbUser?.data?.results[0]?.address && isValidSuiAddress(dbUser?.data?.results[0]?.address)){
            const stamps = dbUser?.data?.results[0]?.stamps as stamp[]  
            const parsedStamps: stamp[] = Array.isArray(stamps) ? stamps : JSON.parse(stamps as unknown as string)
            if(parsedStamps.some(stamp=>stamp.id===selectedStamp?.id)){
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "User already has this stamp",
                });
                return
            }
        }

        handleSendStampTx({
            adminCap: userProfile?.admincap,
            event: selectedStamp?.id,
            name: selectedStamp?.name,
            recipient: recipient
        }).onSuccess(async () => {
            toast({
                title: 'Stamp sent successfully',
                description: 'Stamp sent successfully',
            })
            await refreshPassportStamps(networkVariables)
        }).execute()
    }
    const handleMultipleSendStamp = async (addresses: string[]) => {
        if(!userProfile?.admincap || !selectedStamp?.id) return
        handleBatchSendStampTx({
            adminCap: userProfile?.admincap,
            event: selectedStamp?.id,
            name: selectedStamp?.name,
            recipients: addresses
        }).onSuccess(async () => {
            toast({
                title: 'Stamps sent successfully',
                description: 'Stamps sent successfully',
            })
            await refreshPassportStamps(networkVariables)
            setDisplayDialog(false)
        }).execute()
    }

    const onStampCreated = async (effects: string, values?: CreateStampFormValues) => {
        const digest = getDataFromEffects(effects)
        if (!digest) return
        const stamp = await getEventFromDigest(digest)
        console.log(stamp)
        // Check if createStampValues exists before using it
        if (!values) {
            console.error('createStampValues is undefined');
            return;
        }

        const claimStamp: ClaimStamp = {
            stamp_id: stamp.id,
            claim_code: values.claimCode && values.claimCode.length > 0 ? values.claimCode : null,
            claim_code_start_timestamp: values.startDate ? new Date(values.startDate).getTime().toString() : null,
            claim_code_end_timestamp: values.endDate ? new Date(values.endDate).getTime().toString() : null,
            total_count_limit: values.totalCountLimit ?? null,
            user_count_limit: values.userCountLimit ?? null
        }
        console.log('Creating claim stamp:', claimStamp);
        const data = await createClaimStamp(claimStamp)
        console.log(data)
    }
    const onStampClaimed = async () => {
        if (!userProfile?.current_user || !selectedStamp?.id) return
        await updateUserData(userProfile?.current_user, {
            stamp: { id: selectedStamp?.id, claim_count: 1 },
            points: selectedStamp?.points
        })
        await fetch(`/api/claim-stamps/add`, {
            method: "PATCH",
            body: JSON.stringify({
                stamp_id: selectedStamp?.id
            })
        })
    }


    useEffect(()=>{
        if(stamps){
            const stampsWithClaimable = stamps.map(stamp=>({...stamp,isClaimable:isClaimable(stamp)}))
            setDisplayStamps(stampsWithClaimable)
        }
    },[stamps])

    const handleFilterChange = (value: string) => {
        setSortDirection(value === 'All' ? 'all' : 'claimable')
    }
    // Filter and sort stamps
    const filteredStamps = displayStamps
        ?.filter(stamp =>
            (stamp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stamp.id.includes(searchQuery)) &&
            (sortDirection === 'all' || (sortDirection === 'claimable' && stamp.isClaimable))
        )
        .sort((a, b) => {
            const dateA = new Date(a.timestamp ?? 0).getTime()
            const dateB = new Date(b.timestamp ?? 0).getTime()
            return dateB - dateA
        })

    const ITEMS_PER_PAGE = 3
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const currentStamps = filteredStamps?.slice(startIndex, endIndex)
    const totalPages = Math.max(1, Math.ceil((filteredStamps?.length ?? 0) / ITEMS_PER_PAGE))
    const shouldShowPagination = (filteredStamps?.length ?? 0) > ITEMS_PER_PAGE

    return (
        <div className="p-6 lg:flex lg:gap-16">
            <div className="lg:max-w-sm flex flex-col">
                <div className="flex justify-between items-center">
                    <p className="text-4xl font-bold py-6">Stamps</p>
                    <div className="lg:hidden">
                        {admin && <CreateStampDialog handleCreateStamp={handleCreateStamp} />}
                    </div>
                </div>
                <p className="text-lg py-9">Here are the latest stamps awarded to the Sui community, celebrating  achievements and contributions.</p>
                <div className="lg:block hidden mt-auto">
                    {admin && <CreateStampDialog handleCreateStamp={handleCreateStamp} />}
                </div>
            </div>
            <div className="py-6 lg:w-full lg:py-0">
                <div className="lg:flex justify-between ">
                    <SearchFilterBar
                        searchPlaceholder="Search by name"
                        onSearchChange={setSearchQuery}
                        filterOptions={[
                            {
                                value: "All",
                                label: "All"
                            },
                            {
                                value: "Claimable",
                                label: "Claimable"
                            }
                        ]}
                        onFilterChange={handleFilterChange}
                    />
                    <div className="py-4 lg:block hidden">
                        {shouldShowPagination && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
                <div className="pt-6 space-y-2 lg:hidden">
                    {currentStamps?.map((stamp) => (
                        <div
                            key={stamp.id}
                            onClick={() => {
                                setSelectedStamp(stamp)
                                setDisplayDialog(true)
                            }}
                            className={`flex justify-between items-center bg-gray-200 rounded-sm p-5 hover:bg-gray-300 transition-colors cursor-pointer $`}
                        >
                            <div className="font-bold text-lg">{stamp.name}</div>
                            {stamp.isClaimable && <div className="text-blue-400">Claimable</div>}
                        </div>
                    ))}
                </div>
                <div className="lg:block hidden pt-6">
                    <div className="grid grid-cols-3 gap-6">
                        {currentStamps?.map((stamp) => (
                            <StampCard key={stamp.id} stamp={stamp} setSelectedStamp={()=>{
                                setSelectedStamp(stamp)
                                setDisplayDialog(true)
                            }} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="py-4 lg:hidden">
                {shouldShowPagination && (
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>
            <StampDialog
                stamp={selectedStamp}
                open={displayDialog}
                admin={admin}
                onOpenChange={(open) => !open && setSelectedStamp(null)}
                onClaim={handleStampClaim}
                onSend={handleSendStamp}
                onMultipleSend={handleMultipleSendStamp}
                isLoading={isSending || isCreatingClaimStamp || isUserLoading || isBatchSending}
                onCloseClick={()=>{
                    setDisplayDialog(false)
                    setSelectedStamp(null)
                }}
            />
        </div>
    )
}