'use client'

import { PaginationControls } from "@/components/ui/pagination-controls"
import { SearchFilterBar } from "@/components/ui/search-filter-bar"
import { useEffect, useState } from "react"
import { StampDialog } from "@/components/user/stamp-dialog"
import { StampItem, VerifyStampParams, DisplayStamp } from "@/types/stamp"
import { CreateStampFormValues } from "@/types/form"
import { batch_send_stamp, create_event_stamp, delete_stamp, send_stamp } from "@/contracts/stamp"
import { useUserProfile } from "@/contexts/user-profile-context"
import { useBetterSignAndExecuteTransaction } from "@/hooks/use-better-tx"
import { claim_stamp } from "@/contracts/claim"
import { usePassportsStamps } from "@/contexts/passports-stamps-context"
import { useNetworkVariables } from "@/contracts"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { useStampCRUD } from "@/hooks/use-stamp-crud"
import { isValidSuiAddress } from "@mysten/sui/utils"
import { getDisplayStamps } from "@/utils"
import { apiFetch } from "@/lib/apiClient"
import { showToast } from "@/lib/toast"
import { StampHeader } from "@/components/stamps/stamp-header"
import { StampGrid } from "@/components/stamps/stamp-grid"
import { useStampFiltering } from "@/hooks/use-stamp-filtering"
import { getEventFromDigest } from "@/contracts/query"
import { CreateOrUpdateStampParams } from "@/types/stamp"

interface AdminStampProps {
    stamps: StampItem[] | null;
    admin: boolean
}

export default function AdminStamp({ stamps, admin }: AdminStampProps) {
    const [selectedStamp, setSelectedStamp] = useState<DisplayStamp | null>(null)
    const [displayStamps, setDisplayStamps] = useState<DisplayStamp[]>([])
    const [displayDialog, setDisplayDialog] = useState(false)
    const { userProfile } = useUserProfile();
    const currentAccount = useCurrentAccount()
    const { refreshPassportStamps } = usePassportsStamps()
    const { refreshProfile } = useUserProfile()
    const { verifyClaimStamp, createStamp,deleteStamp } = useStampCRUD()
    const networkVariables = useNetworkVariables()

    const { handleSignAndExecuteTransaction: handleCreateStampTx } = useBetterSignAndExecuteTransaction({
        tx: create_event_stamp
    })
    const { handleSignAndExecuteTransaction: handleClaimStampTx } = useBetterSignAndExecuteTransaction({
        tx: claim_stamp
    })
    const { handleSignAndExecuteTransaction: handleSendStampTx, isLoading: isSending } = useBetterSignAndExecuteTransaction({
        tx: send_stamp
    })
    const { handleSignAndExecuteTransaction: handleBatchSendStampTx, isLoading: isBatchSending } = useBetterSignAndExecuteTransaction({
        tx: batch_send_stamp
    })
    const { handleSignAndExecuteTransaction: handleDeleteStampTx, isLoading: isDeleting } = useBetterSignAndExecuteTransaction({
        tx: delete_stamp
    })


    const handleStampClaim = async (claimCode: string) => {
        const isConnected = await apiFetch<{ isConnected: boolean }>('/api/check', { method: 'GET' });
        if (!isConnected.isConnected) {
            showToast.error("Database connection error")
            return
        }
        if (!selectedStamp?.id || !userProfile?.passport_id) {
            showToast.error("You should have a passport to claim a stamp")
            return;
        }
        const stamps = userProfile?.stamps
        if (stamps?.some(stamp => stamp.name.split("#")[0] === selectedStamp?.name)) {
            showToast.error(`You have already have this stamp`)
            return
        }
        if (selectedStamp.claimCount && selectedStamp.totalCountLimit !== 0 && selectedStamp?.claimCount >= selectedStamp.totalCountLimit!) {
            showToast.error("Stamp is claimed out")
            return
        }
        const requestBody: VerifyStampParams = {
            stamp_id: selectedStamp?.id,
            claim_code: claimCode,
            passport_id: userProfile?.id.id,
            last_time: userProfile?.last_time
        }
        const data = await verifyClaimStamp(requestBody)

        if (!data.signature || !data.valid) {
            showToast.error("Invalid claim code")
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
            showToast.success("Stamp claimed successfully")
            await refreshProfile(currentAccount?.address ?? '', networkVariables)
            await refreshPassportStamps(networkVariables)
        }).execute()
    }

    //Todo: what if onStampCreated failed?
    const handleCreateStamp = async (values: CreateStampFormValues) => {
        if (!userProfile?.admincap) {
            showToast.error("Only admin can create stamp")
            return
        }
        handleCreateStampTx({
            adminCap: userProfile.admincap,
            event: values.name,
            description: values.description,
            image_url: values.image,
            points: Number(values.point)
        }).onSuccess(async (result) => {
            if (!result) {
                showToast.error("Something went wrong")
                return
            }
            console.log("result", result)
            await Promise.all([                
                await onStampCreated(result.digest, values),
                await refreshPassportStamps(networkVariables),
            ])
            showToast.success("Stamp created successfully")
        }).onError((e) => {
            showToast.error(e.message)
        }).execute()
    }
    const handleSendStamp = async (recipient: string) => {
        if (!isValidSuiAddress(recipient)) {
            showToast.error("Invalid address")
            return
        }
        if (!userProfile?.admincap || !selectedStamp?.id) return
        {/* check if user has this stamp */ }
        // const dbUser = await fetchUserByAddress(recipient)
        // if (dbUser?.data?.results[0]?.address && isValidSuiAddress(dbUser?.data?.results[0]?.address)) {
        //     const stamps = dbUser?.data?.results[0]?.stamps
        //     const parsedStamps: stamp[] = Array.isArray(stamps) ? stamps : JSON.parse(stamps as unknown as string)
        //     if (parsedStamps.some(stamp => stamp.id === selectedStamp?.id)) {
        //         showToast.error("User already has this stamp")
        //         return
        //     }
        // }

        handleSendStampTx({
            adminCap: userProfile?.admincap,
            event: selectedStamp?.id,
            name: selectedStamp?.name,
            recipient: recipient
        }).onSuccess(async () => {
            showToast.success("Stamp sent successfully")
            await refreshPassportStamps(networkVariables)
        }).execute()
    }
    const handleMultipleSendStamp = async (addresses: string[]) => {
        if (!userProfile?.admincap || !selectedStamp?.id) return
        handleBatchSendStampTx({
            adminCap: userProfile?.admincap,
            event: selectedStamp?.id,
            name: selectedStamp?.name,
            recipients: addresses
        }).onSuccess(async () => {
            showToast.success("Stamps sent successfully")
            await refreshPassportStamps(networkVariables)
            setDisplayDialog(false)
        }).execute()
    }
    const handleDeleteStamp = async () => {
        if (!userProfile?.admincap || !selectedStamp?.id) return
        handleDeleteStampTx({
            adminCap: userProfile?.admincap,
            event: selectedStamp?.id,
            name: selectedStamp?.name
        }).onSuccess(async () => {
            showToast.success("Stamp deleted successfully")
            await deleteStamp(selectedStamp?.id)
            await refreshPassportStamps(networkVariables)
        }).onError((e) => {
            showToast.error(e.message)
        }).execute()
    }

    const onStampCreated = async (digest: string, values: CreateStampFormValues) => {   
        const stamp = await getEventFromDigest(digest)

        const claimStamp: CreateOrUpdateStampParams = {
            stamp_id: stamp.id,
            claim_code: values.claimCode && values.claimCode.length > 0 ? values.claimCode : null,
            claim_code_start_timestamp: values.startDate ? new Date(values.startDate).getTime().toString() : null,
            claim_code_end_timestamp: values.endDate ? new Date(values.endDate).getTime().toString() : null,
            total_count_limit: values.totalCountLimit ?? null,
            user_count_limit: values.userCountLimit ?? null,
            public_claim: values.publicClaim ?? false
        }
        await createStamp(claimStamp)
    }


    useEffect(() => {
        if (!stamps) return;
        
        if (userProfile) {
            const stampsWithClaimable = getDisplayStamps(stamps, userProfile);
            console.log(stampsWithClaimable)
            setDisplayStamps(stampsWithClaimable);
        } else {
            setDisplayStamps(stamps);
        }
    }, [stamps, userProfile])

    const ITEMS_PER_PAGE = 4
    const {
        currentStamps,
        totalPages,
        currentPage,
        shouldShowPagination,
        setCurrentPage,
        setSearchQuery,
        handleFilterChange
    } = useStampFiltering({ stamps: displayStamps, itemsPerPage: ITEMS_PER_PAGE })

    const handleSelectStamp = (stamp: DisplayStamp) => {
        setSelectedStamp(stamp)
        setDisplayDialog(true)
    }

    return (
        <div className="p-6 lg:flex lg:gap-16">
            <StampHeader admin={admin} handleCreateStamp={handleCreateStamp} />
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

                <div className="lg:hidden">
                    <StampGrid
                        stamps={currentStamps}
                        onSelectStamp={handleSelectStamp}
                        isMobile
                    />
                </div>
                <div className="hidden lg:block">
                    <StampGrid
                        stamps={currentStamps}
                        onSelectStamp={handleSelectStamp}
                    />
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
                    onDelete={handleDeleteStamp}
                    isLoading={isSending || isBatchSending || isDeleting}
                    onCloseClick={() => {
                        setDisplayDialog(false)
                        setSelectedStamp(null)
                    }}
                />
            </div>
        </div>
    )
}