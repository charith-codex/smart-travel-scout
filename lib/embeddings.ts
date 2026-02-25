import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed, embedMany, cosineSimilarity } from "ai";
import { travelInventory } from "@/lib/data/inventory";
import { TravelItem } from "@/lib/types";

// ---------------------------------------------------------------------------
// Embedding model
// ---------------------------------------------------------------------------
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// ---------------------------------------------------------------------------
// Text representation
// Convert a TravelItem into a rich text string for embedding.
// Includes title, location, tags, and price to maximise semantic coverage.
// ---------------------------------------------------------------------------
export function itemToEmbeddingText(item: TravelItem): string {
  return `${item.title} in ${item.location}. Tags: ${item.tags.join(", ")}. Price: $${item.price}.`;
}

// ---------------------------------------------------------------------------
// Module-level embedding cache
// Embeddings are computed once per process lifetime and reused across requests.
// Re-computing only happens if the module is cold-started (e.g. new deploy).
// ---------------------------------------------------------------------------
type CachedEmbedding = { item: TravelItem; embedding: number[] };

let embeddingCache: CachedEmbedding[] | null = null;

async function getInventoryEmbeddings(): Promise<CachedEmbedding[]> {
  if (embeddingCache) return embeddingCache;

  const texts = travelInventory.map(itemToEmbeddingText);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });

  embeddingCache = travelInventory.map((item, i) => ({
    item,
    embedding: embeddings[i],
  }));

  return embeddingCache;
}

// ---------------------------------------------------------------------------
// Top-k semantic retrieval
//
// Given a user query and a pre-filtered candidate list (from the rubric),
// embed the query and rank candidates by cosine similarity.
// Returns at most `topK` items, ordered by relevance.
//
// If candidates.length <= topK the full list is returned without an LLM call,
// since no narrowing is needed.
// ---------------------------------------------------------------------------
export async function getTopKCandidates(
  query: string,
  candidates: TravelItem[],
  topK: number = 5,
): Promise<TravelItem[]> {
  // No narrowing needed — return everything
  if (candidates.length <= topK) return candidates;

  // Get (cached) inventory embeddings
  const inventoryEmbeddings = await getInventoryEmbeddings();

  // Embed the user query
  const { embedding: queryEmbedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // Keep only embeddings for items that survived the rubric filter
  const candidateIds = new Set(candidates.map((c) => c.id));
  const candidateEmbeddings = inventoryEmbeddings.filter(({ item }) =>
    candidateIds.has(item.id),
  );

  // Score each candidate by cosine similarity to the query
  const scored = candidateEmbeddings.map(({ item, embedding }) => ({
    item,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  // Sort descending by similarity, take top-k
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(({ item }) => item);
}
