'use client'

import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useState } from "react"
import { CreateStampDialog } from "./components/create-stamp-dialog"
import { StampDialog } from "@/components/user/stamp-dialog"
import { StampItem } from "@/types/stamp"
import { CreateStampFormValues } from "@/types/form"
import { create_event_stamp, send_stamp } from "@/contracts/stamp"
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
import { increaseClaimStampCount } from "@/lib/services/claim-stamps"
import { isValidSuiAddress } from "@mysten/sui/utils"

interface AdminStampProps {
    stamps: StampItem[] | null;
    admin: boolean
}

export default function AdminStamp({ stamps, admin }: AdminStampProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedStamp, setSelectedStamp] = useState<StampItem | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
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


    const handleStampClaim = async (claimCode: string) => {
        if (!selectedStamp?.id || !userProfile?.db_profile) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Database connection error or stamp not selected",
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
        let dbUser = await fetchUserByAddress(recipient)
        if(!dbUser?.data?.results[0]?.address){
            dbUser = await createNewUser({
                address: recipient,
                stamps: [],
                points: 0
            })
        }
        console.log("dbUser", dbUser)
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
            await onStampSent(recipient)
            await refreshPassportStamps(networkVariables)
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
        await increaseClaimStampCount(selectedStamp?.id)
    }
    const onStampSent = async (address: string) => {
        if (!selectedStamp?.id || !userProfile?.current_user) return
        await increaseClaimStampCount(selectedStamp?.id)
        await updateUserData(address, {
            stamp: { id: selectedStamp?.id, claim_count: 1 },
            points: selectedStamp?.points
        })
    }


    const handleFilterChange = (value: string) => {
        setSortDirection(value === 'createdAt↑' ? 'asc' : 'desc')
    }
    // Filter and sort stamps
    const filteredStamps = stamps
        ?.filter(stamp =>
            stamp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stamp.id.includes(searchQuery)
        )
        .sort((a, b) => {
            const dateA = new Date(a.timestamp ?? 0).getTime()
            const dateB = new Date(b.timestamp ?? 0).getTime()
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
        })

    const ITEMS_PER_PAGE = 6
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
                        searchPlaceholder="Search by name or ID"
                        onSearchChange={setSearchQuery}
                        filterOptions={[
                            {
                                value: "createdAt↑",
                                label: "Created At ↑"
                            },
                            {
                                value: "createdAt↓",
                                label: "Created At ↓"
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
                            onClick={() => setSelectedStamp(stamp)}
                            className={`flex justify-between items-center bg-gray-200 rounded-sm p-5 hover:bg-gray-300 transition-colors cursor-pointer $`}
                        >
                            <div className="font-bold text-lg">{stamp.name}</div>
                            {stamp.hasClaimCode && <div className="text-blue-400">Claimable</div>}
                        </div>
                    ))}
                </div>
                <div className="lg:block hidden pt-6">
                    <div className="grid grid-cols-3 gap-6">
                        {currentStamps?.map((stamp) => (
                            <div
                                key={stamp.id}
                                onClick={() => setSelectedStamp(stamp)}
                                className={`block bg-white rounded-sm p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                            >
                                <div className="flex flex-col justify-start items-start min-h-[100px] p-4 gap-y-2">
                                    <div className="flex justify-between items-center w-full">
                                        <div className="font-bold text-lg">{stamp.name}</div>
                                        {stamp.hasClaimCode && <div className="animate-bounce text-blue-400">Claimable</div>}
                                    </div>

                                    <div className="text-blue-400 max-w-48">
                                        <p className="truncate">{stamp.description}</p>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Created at: {stamp.timestamp ? new Date(stamp.timestamp).toLocaleDateString() : "N/A"}
                                    </div>
                                </div>
                            </div>
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
                open={!!selectedStamp}
                admin={admin}
                onOpenChange={(open) => !open && setSelectedStamp(null)}
                onClaim={handleStampClaim}
                onSend={handleSendStamp}
                isLoading={isSending || isCreatingClaimStamp || isUserLoading}
            />
        </div>
    )
}