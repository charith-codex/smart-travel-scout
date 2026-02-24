# Smart Travel Scout

A "Smart Travel Scout" web application built with Next.js, Shadcn UI, React Hook Form, and the Vercel AI SDK (Gemini). It takes a user's natural language request (e.g. "a chilled beach weekend with surfing vibes under $100"), processes it via an LLM, and strictly returns matched packages from a specific travel inventory.

## Assignment Submission: "Passion Check" Questions

### 1. The "Under the Hood" Moment

**Technical Hurdle:** The biggest hurdle was ensuring the LLM _strictly_ only returned IDs from the provided inventory without hallucinating structural elements in the JSON or inventing new locations.
**Debugging:** Initially, the LLM might have returned plain text or a markdown code block containing JSON.
**Solution:** I utilized the **Vercel AI SDK's `generateObject`** method combined with `zod`. By passing a strictly typed `zod` schema to the LLM via the SDK, it forces the LLM to adhere to the `aiResponseSchema`. Furthermore, as an absolute fail-safe, the returned `id` properties are cross-referenced against the local `travelInventory` array in the backend. If an ID doesn't exist locally, it is simply discarded before sending the response to the frontend.

### 2. The Scalability Thought

**Handling 50,000 Travel Packages:**
Passing 50,000 packages into the LLM's system prompt context window would be extremely inefficient, expensive, and lead to poor information retrieval (the "lost in the middle" problem).
**The Approach (RAG):**

1. **Vector Database / Embeddings:** I would pre-compute embeddings for every travel package (concatenating the title, location, and tags) and store them in a vector database (like Pinecone, Supabase pgvector, or Qdrant).
2. **Hybrid Retrieval (Top-K):** When a user submits a query, I would perform a semantic similarity search (using the query's embedding) and a keyword search (BM25) against the vector database to retrieve the top ~10-20 most relevant packages.
3. **LLM Filtering:** I would ONLY pass those top 10-20 candidates into the LLM system prompt. The LLM would act as a reranker and reasoner, selecting the absolute best matches from that tiny subset and providing the required `reason`.
4. **Caching:** I would cache embedded user queries. If a new user searches the exact same phrase, we skip the embedding step entirely.

### 3. The AI Reflection

**AI Tool Used:** I used Google's Gemini Experimental system (Antigravity Agent) acting as an autonomous paired programming assistant.
**Correction Instance:** During the planning phase, the AI initially proposed using the raw `@google/genai` SDK to make API calls to the LLM.
**Correction:** As the human engineer, I realized it would be much more robust to use the **Vercel AI SDK (`ai` and `@ai-sdk/google`)**. Making this switch allowed for significantly easier, native Zod schema validation using `generateObject` and makes the entire codebase model-agnostic (meaning switching from Gemini to OpenAI to Claude in the future requires changing only one line of code). I instructed the AI to rewrite the project implementation plan utilizing the AI SDK instead.

---

## Technical Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Form Handling:** React Hook Form + @hookform/resolvers
- **Validation (Frontend & AI Out):** Zod
- **AI Integration:** Vercel AI SDK (`generateObject`) + Google Gemini (`gemini-2.5-flash`)
