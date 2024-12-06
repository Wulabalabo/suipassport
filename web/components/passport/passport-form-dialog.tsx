"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import Image from "next/image";
import { RainbowButton } from "../ui/rainbow-button";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useNetworkVariables } from "@/config";
import { useRouter } from "next/navigation";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/contexts/user-profile-context";
export const passportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().min(1, "Please upload an avatar"),
  introduction: z.string().min(10, "Introduction must be at least 10 characters"),
  x: z.string().optional(),
  github: z.string().optional(),
  email: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof passportFormSchema>;

interface PassportFormDialogProps {
  onSubmit: (values: FormValues) => Promise<void>;
}

export function PassportFormDialog({ onSubmit }: PassportFormDialogProps) {
  const currentAccount = useCurrentAccount();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPassport, setHasPassport] = useState(false);
  const networkVariables = useNetworkVariables();
  const router = useRouter();
  const { toast } = useToast();
  const { refreshProfile, userProfile } = useUserProfile();
  useEffect(() => {
    if (currentAccount && isValidSuiAddress(currentAccount.address)) {
      if(userProfile){
        setHasPassport(true)
      } else {
        refreshProfile(currentAccount.address, networkVariables)
      }
    } else {
      setHasPassport(false);
    }
  }, [currentAccount, networkVariables, refreshProfile, userProfile]);

  const handleViewProfile = () => {
    if (currentAccount) {
      router.push(`/user/${currentAccount.address}`);
    }
  }

  const handleOpen = () => {
    if (currentAccount && isValidSuiAddress(currentAccount.address)) {
      setOpen(true);
    } else {
      toast({
        title: "Please connect your wallet first",
        description: "Please connect your wallet to create your passport",
      });
      setOpen(false);
    }
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(passportFormSchema),
    defaultValues: {
      name: "",
      avatar: "",
      introduction: "",
      x: "",
      github: "",
      email: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting passport:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {!hasPassport ? (
        <Dialog open={open} onOpenChange={handleOpen}>
          <DialogTrigger asChild>
            <RainbowButton>Get Your Passport</RainbowButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Your Passport</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center justify-center space-y-4">
                      <FormLabel>Avatar</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center gap-4">
                          {field.value && (
                            <div className="relative h-24 w-24 rounded-full overflow-hidden">
                              <Image
                                src={field.value}
                                alt="Avatar"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Introduction</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief introduction about yourself"
                            className="resize-none h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="x"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter)</FormLabel>
                          <FormControl>
                            <Input placeholder="@username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="github"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GitHub</FormLabel>
                          <FormControl>
                            <Input placeholder="GitHub username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Create Passport"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      ) : (
        <RainbowButton onClick={handleViewProfile}>Your Profile</RainbowButton>
      )}
    </>
  );
} 