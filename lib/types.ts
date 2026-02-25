import { z } from "zod";

// Type for a travel item from the inventory
export type TravelItem = {
  id: number;
  title: string;
  location: string;
  price: number;
  tags: string[];
};

// Zod schema for the AI response
export const aiResponseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z
          .number()
          .describe(
            "The exact ID of the matching travel item from the provided inventory.",
          ),
        reason: z
          .string()
          .min(10, "Reason must be at least 10 characters.")
          .describe(
            "A short explanation of why this item matches the user's request, referencing tags, price, or location.",
          ),
      }),
    )
    .describe(
      "An array of matched travel items. If there are no good matches, return an empty array.",
    ),
});

// Type inferred from the Zod schema for use in the frontend
export type AIResponse = z.infer<typeof aiResponseSchema>;

// Type for the combined AI reason with the actual inventory item data
export type TravelResult = TravelItem & {
  reason: string;
};

// All unique tags available in the inventory
export const ALL_TAGS = [
  "cold",
  "nature",
  "hiking",
  "history",
  "culture",
  "walking",
  "animals",
  "adventure",
  "photography",
  "beach",
  "surfing",
  "young-vibe",
  "climbing",
  "view",
] as const;

// Zod schema for the frontend search form
export const searchFormSchema = z.object({
  query: z
    .string()
    .min(3, "Please enter a slightly longer text to get better results."),
  minPrice: z.coerce.number().min(0, "Min price must be 0 or more.").optional(),
  maxPrice: z.coerce.number().min(0, "Max price must be 0 or more.").optional(),
  tags: z.array(z.string()).optional(),
});

export type SearchFormValues = z.infer<typeof searchFormSchema>;
