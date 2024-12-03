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
import * as z from "zod"
import { useState } from "react"
import Image from "next/image"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  point: z.string().min(1, "Point is required"),
  image: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateStampDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      point: "",
      image: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    console.log(values)
    // Handle form submission
    setIsOpen(false)
    form.reset()
    setPreviewImage(null)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
        form.setValue('image', file)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewImage(reader.result as string)
        form.setValue('image', file)
      }
      reader.readAsDataURL(file)
    }
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
                    <FormLabel>Name</FormLabel>
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
                    <FormLabel>Description</FormLabel>
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
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleImageDrop}
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        {previewImage ? (
                          <div className="relative w-full h-40">
                            <Image
                              src={previewImage}
                              alt="Preview"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Drag & drop to upload
                          </div>
                        )}
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          value={field.value?.fileName}
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
                    <FormLabel>Point</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number" {...field} />
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
                setPreviewImage(null)
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