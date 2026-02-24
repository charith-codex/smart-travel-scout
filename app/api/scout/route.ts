import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { travelInventory } from "@/lib/data/inventory";
import { aiResponseSchema, TravelResult } from "@/lib/types";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const inventoryContext = JSON.stringify(travelInventory, null, 2);

    const systemPrompt = `
      You are an expert travel assistant. Your task is to match the user's travel request 
      with the best-matching options from the provided inventory.
      
      CRITICAL RULE: You MUST ONLY suggest items that exist in the inventory below. 
      Do not invent, hallucinate, or suggest any locations, destinations, or items outside of this inventory.
      
      Inventory:
      ${inventoryContext}
      
      Instructions:
      1. Read the user's request.
      2. Find the items in the inventory that best match the request (consider location, price, and tags).
      3. If no items match, return an empty array for results.
      4. For each matching item, extract its exact 'id'.
      5. Provide a short 'reason' explaining why it matches, explicitly mentioning price, tags, or location.
    `;

    // Use Vercel AI SDK to generate a structured response based on zod schema
    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: aiResponseSchema }),
      system: systemPrompt,
      prompt: query,
      temperature: 0,
    });

    // Enrich LLM results with full inventory data
    const enrichedResults: TravelResult[] = [];

    for (const match of output.results) {
      const inventoryItem = travelInventory.find(
        (item) => item.id === match.id,
      );
      if (inventoryItem) {
        enrichedResults.push({
          ...inventoryItem,
          reason: match.reason,
        });
      }
    }

    return NextResponse.json({ results: enrichedResults });
  } catch (error) {
    console.error("Error in scout API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
