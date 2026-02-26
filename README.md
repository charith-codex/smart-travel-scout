# Smart Travel Scout

A "Smart Travel Scout" web application built with Next.js, Shadcn UI, React Hook Form, and the Vercel AI SDK (Gemini). It takes a user's natural language request (e.g. "a chilled beach weekend with surfing vibes under $100"), processes it via an LLM, and strictly returns matched packages from a specific travel inventory.

## Assignment Submission Questions with Answers

### 1. The "Under the Hood" Moment

The trickiest part was getting the LLM to return clean, structured data instead of doing whatever it felt like.

When I first wired up the API route, Gemini kept responding with a markdown code block literally returning `json { ... }` as a string. So my `JSON.parse` would blow up, or I'd get the right shape but with completely made-up travel package IDs that didn't exist anywhere in my inventory. That second bug was particularly annoying because the app _looked_ like it was working it rendered cards and everything but the data was fabricated.

To debug it, I started by `console.log`-ing the raw response object from the SDK before any parsing. That's when I saw the markdown fences wrapping the JSON. I also added a manual cross-reference check: after getting the LLM's suggested IDs, loop through them and discard any that don't exist in the local `travelInventory` array. That killed the hallucination problem dead.

The real fix for the formatting issue was switching to the Vercel AI SDK's `generateText` with `Output.object({ schema: aiResponseSchema })`. Instead of asking the model to "please return JSON", the SDK constrains the output at the API level using the Zod schema I defined in `lib/types.ts`. The model physically cannot return a markdown block it has to conform to the schema. That removed an entire class of bugs overnight.

### 2. The Scalability Thought

Right now the app works fine with 5 packages because I can just dump all of them into the system prompt. But if there were 50,000 packages, that approach falls apart immediately context windows aren't infinite, and even if they were, passing 50k items to an LLM on every request would be absurdly expensive and slow.

The architecture I'd shift to is basically what I already partially built in `lib/embeddings.ts`, just taken to its logical conclusion:

1. **Pre-compute embeddings offline.** Every travel package gets converted into a vector (title + location + tags + price as a single string) using a text embedding model and stored in a vector database like Pinecone or Supabase pgvector. This is a one-time job that runs when new packages are added, not on every user request.

2. **Semantic retrieval at query time.** When a user types their request, embed that query and run a nearest-neighbor search against the vector DB to pull back the top 10–20 most semantically similar packages. This is fast milliseconds and replaces the current step of passing the whole inventory into the prompt.

3. **LLM as a reranker, not a searcher.** Now the LLM only sees those 10–20 candidates. Its job is just to pick the best ones and write a reason. Cheap, fast, accurate.

4. **Cache repeated queries.** If two users search the same phrase, the embedding and the LLM call are identical, so I'd cache the result. The `unstable_cache` wrapper I'm already using in the route is the first step of this it just needs a real distributed cache (Redis, Upstash) instead of in-memory to work across serverless instances.

### 3. The AI Reflection

I used GitHub Copilot (with Claude under the hood) throughout the build.

The specific moment where it led me wrong was when I was setting up the Vercel AI SDK to do structured output. Copilot confidently suggested using `generateObject` imported from `"ai"` which, to be fair, used to be the correct approach. But when I dropped it in and ran the dev server, I got a deprecation warning in the console and the types weren't lining up properly with how the SDK now handled schema validation.

I went and actually read the Vercel AI SDK docs myself, found that the current pattern is `generateText` combined with `Output.object({ schema: ... })` they had restructured the API. I grabbed the relevant docs URL, pasted it into the Copilot chat, and told it "use this instead." It immediately rewrote the route handler correctly. The final version you see in `app/api/scout/route.ts` uses `import { generateText, Output } from "ai"` which is the up-to-date pattern.

The lesson was pretty simple: AI tools are trained on historical data, so they'll suggest patterns that were correct six months ago but are now deprecated. Always sanity-check against the current official docs, especially for fast-moving SDKs.

---

## Technical Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Form Handling:** React Hook Form + @hookform/resolvers
- **Validation (Frontend & AI Out):** Zod
- **AI Integration:** Vercel AI SDK (`generateObject`) + Google Gemini (`gemini-2.5-flash`)
