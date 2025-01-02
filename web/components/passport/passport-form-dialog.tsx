"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { RainbowButton } from "../ui/rainbow-button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariables } from "@/contracts";
import { useRouter } from "next/navigation";
import { isValidSuiAddress, isValidSuiObjectId } from "@mysten/sui/utils";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/contexts/user-profile-context";
import { X } from "lucide-react";
import { PassportForm, PassportFormValues } from "./passport-form";

export function PassportFormDialog({ onSubmit, isLoading }: { onSubmit: (values: PassportFormValues) => Promise<void>, isLoading: boolean }) {
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPassport, setHasPassport] = useState(false);
  const networkVariables = useNetworkVariables();
  const router = useRouter();
  const { toast } = useToast();
  const { userProfile } = useUserProfile();

  useEffect(() => {
    async function checkProfile() {
      if (currentAccount?.address && isValidSuiAddress(currentAccount.address)) {
        if (userProfile && isValidSuiObjectId(userProfile.id.id)) {
          setHasPassport(true);
        } else {
          setHasPassport(false);
        }
      } else {
        setHasPassport(false);
      }
    }

    checkProfile();
  }, [currentAccount, networkVariables, userProfile]);

  const handleViewProfile = () => {
    if (currentAccount) {
      router.push(`/user/${currentAccount.address}`);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && (!currentAccount || !isValidSuiAddress(currentAccount.address))) {
      toast({
        title: "Please connect your wallet first",
        description: "Please connect your wallet to create your passport",
      });
      return;
    }
    setOpen(newOpen);
  };

  async function handleSubmit(values: PassportFormValues) {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      setOpen(false);
    } catch (error) {
      console.error("Error submitting passport:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!hasPassport ? (
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <RainbowButton disabled={isLoading}>Get Your Passport</RainbowButton>
          </DialogTrigger>
          <DialogContent hideCloseButton className="sm:max-w-[500px] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>Create Your Passport</DialogTitle>
                <DialogClose asChild>
                  <div className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                  </div>
                </DialogClose>
              </div>
            </DialogHeader>
            <PassportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitButtonText="Create Passport" />
          </DialogContent>
        </Dialog>
      ) : (
        <RainbowButton onClick={handleViewProfile}>Your Profile</RainbowButton>
      )}
    </>
  );
} 