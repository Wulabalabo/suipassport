'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { createStampFormSchema, CreateStampFormValues } from "@/types/form"
import { ImageUpload } from "@/components/ui/image-upload"

interface CreateStampDialogProps {
  handleCreateStamp: (values: CreateStampFormValues) => void;
}

export function CreateStampDialog({ handleCreateStamp }: CreateStampDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateStampFormValues>({
    resolver: zodResolver(createStampFormSchema),
    defaultValues: {
      name: "",
      description: "",
      point: "",
      image: "",
      claimCode: "",
      startDate: undefined,
      endDate: undefined
    },
  })

  const onSubmit = async (values: CreateStampFormValues) => {
    setIsSubmitting(true);
    // Handle form submission
    handleCreateStamp(values);
    setIsOpen(false)
    form.reset()
  }



  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full text-sm px-4 py-2 lg:text-base">Create new Stamp</Button>
      </DialogTrigger>
      <DialogContent hideCloseButton className="sm:max-w-[425px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-4xl font-bold text-left">Create Stamp</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center space-y-4">
                    <FormControl>
                      <div className="flex flex-col items-center gap-4">
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
              <FormField
                control={form.control}
                name="point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Point*</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="claimCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Claim Code (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Claim Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ? field.value.toString() : ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (optional)</FormLabel>
                    <FormControl>
                        <Input type="date" {...field} value={field.value ? field.value.toString() : ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <div className="bottom-0 border-t bg-white px-6 py-4 mt-auto">
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setIsOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              onClick={form.handleSubmit(onSubmit)}
            >
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 