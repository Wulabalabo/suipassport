import { z } from "zod";

export const createStampFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    point: z.string().min(1, "Point is required"),
    image: z.any().optional(),
    claimCode: z.string().max(20, "Claim code must be less than 20 characters").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    totalCountLimit: z.number().min(0, "Total count limit must be greater than 0 or infinite").optional(),
    userCountLimit: z.number().min(1, "User count limit must be greater than 0 or infinite").optional(),
  })
  
export type CreateStampFormValues = z.infer<typeof createStampFormSchema>