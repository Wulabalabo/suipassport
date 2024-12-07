import { z } from "zod";

export const createStampFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    point: z.string().min(1, "Point is required"),
    image: z.any().optional(),
  })
  
export type CreateStampFormValues = z.infer<typeof createStampFormSchema>