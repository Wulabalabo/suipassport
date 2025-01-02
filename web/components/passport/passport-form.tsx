"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

export const passportFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().optional().or(z.literal('')),
  introduction: z.string().optional(),
  x: z.string().optional().or(z.literal('')),
  github: z.string().optional().or(z.literal('')),
});

export type PassportFormValues = z.infer<typeof passportFormSchema>;

interface PassportFormProps {
  onSubmit: (values: PassportFormValues) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<PassportFormValues>;
  submitButtonText?: string;
}

export function PassportForm({ 
  onSubmit, 
  isSubmitting = false, 
  defaultValues,
  submitButtonText = "Save Changes"
}: PassportFormProps) {
  const form = useForm<PassportFormValues>({
    resolver: zodResolver(passportFormSchema),
    defaultValues: defaultValues || {
      name: "",
      avatar: "",
      introduction: "",
      x: "",
      github: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center justify-center space-y-4">
              <FormControl>
                <div className="flex flex-col items-center gap-4">
                  <ImageUpload
                    value={field.value ?? ''}
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
                  <Input disabled={!!defaultValues?.name} placeholder="Your name" {...field} />
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
                  <FormLabel>Twitter (optional)</FormLabel>
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
                  <FormLabel>GitHub (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="GitHub username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : submitButtonText}
        </Button>
      </form>
    </Form>
  );
}