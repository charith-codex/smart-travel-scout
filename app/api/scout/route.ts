import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { NextResponse } from "next/server";
import { travelInventory } from "@/lib/data/inventory";
import { aiResponseSchema, TravelResult } from "@/lib/types";

// ---------------------------------------------------------------------------
// In-memory rate limiter
// ---------------------------------------------------------------------------
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    // First request in the window or window has expired
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

// ---------------------------------------------------------------------------
// Programmatic Matching Rubric
// Applied BEFORE the LLM call to hard-filter the inventory.
// ---------------------------------------------------------------------------
interface RubricFilters {
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

function applyRubric(
  inventory: typeof travelInventory,
  filters: RubricFilters,
) {
  const { minPrice, maxPrice, tags } = filters;

  return inventory.filter((item) => {
    // Price rubric: item must be within the specified range
    if (minPrice !== undefined && item.price < minPrice) return false;
    if (maxPrice !== undefined && item.price > maxPrice) return false;

    // Tag rubric: if the user selected tags, item must share at least one
    if (tags && tags.length > 0) {
      const hasMatchingTag = tags.some((t) => item.tags.includes(t));
      if (!hasMatchingTag) return false;
    }

    return true;
  });
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  // --- Rate limiting ---
  const ip = getClientIp(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      {
        error: `Too many requests. Please wait ${retryAfter} second${retryAfter !== 1 ? "s" : ""} before trying again.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  try {
    const body = await req.json();
    const { query, minPrice, maxPrice, tags } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // --- Apply programmatic rubric before calling the LLM ---
    const rubricFilters: RubricFilters = {
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
      tags: Array.isArray(tags) && tags.length > 0 ? tags : undefined,
    };

    const filteredInventory = applyRubric(travelInventory, rubricFilters);

    // If the rubric eliminates everything, skip the LLM entirely
    if (filteredInventory.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Build a human-readable description of the rubric for the LLM
    const rubricDescription: string[] = [];
    if (
      rubricFilters.minPrice !== undefined ||
      rubricFilters.maxPrice !== undefined
    ) {
      const lo = rubricFilters.minPrice ?? 0;
      const hi = rubricFilters.maxPrice ?? "∞";
      rubricDescription.push(`price range: $${lo}–$${hi}`);
    }
    if (rubricFilters.tags && rubricFilters.tags.length > 0) {
      rubricDescription.push(
        `required tags (at least one): ${rubricFilters.tags.join(", ")}`,
      );
    }

    const rubricNote =
      rubricDescription.length > 0
        ? `\n      PRE-SCREENING APPLIED: The inventory has already been filtered by a programmatic rubric (${rubricDescription.join("; ")}). Only items that passed the rubric are provided below.`
        : "";

    const inventoryContext = JSON.stringify(filteredInventory, null, 2);

    const systemPrompt = `
      You are an expert travel assistant. Your task is to match the user's travel request 
      with the best-matching options from the provided inventory.
      
      CRITICAL RULE: You MUST ONLY suggest items that exist in the inventory below. 
      Do not invent, hallucinate, or suggest any locations, destinations, or items outside of this inventory.
      ${rubricNote}
      
      Inventory (pre-screened):
      ${inventoryContext}
      
      Instructions:
      1. Read the user's request.
      2. Find the items in the inventory that best match the request (consider location, price, and tags).
      3. If no items match, return an empty array for results.
      4. For each matching item, extract its exact 'id'.
      5. Provide a short 'reason' explaining why it matches, explicitly mentioning price, tags, or location.
    `;

    // --- Call Gemini via Vercel AI SDK ---
    const { output } = await generateText({
      model: google("gemini-2.5-flash"),
      output: Output.object({ schema: aiResponseSchema }),
      system: systemPrompt,
      prompt: query,
      temperature: 0,
    });

    // Enrich LLM results with full inventory data (only from filtered set)
    const enrichedResults: TravelResult[] = [];

    for (const match of output.results) {
      const inventoryItem = filteredInventory.find(
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
