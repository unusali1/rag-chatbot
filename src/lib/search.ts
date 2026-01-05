// src/lib/search.ts
import { getPineconeIndex } from "./pinecone";
import { generateEmbedding } from "./embeddings";

export interface SearchResult {
  id: string;
  content: string;
  source?: string;
  chunkIndex?: number;
  score: number;
}

export async function searchDocuments(
  query: string,
  options: {
    topK?: number;
    minScoreThreshold?: number;
    filter?: Record<string, any>;
    namespace?: string; // now correctly handled
  } = {}
): Promise<SearchResult[]> {
  const {
    topK = 5,
    minScoreThreshold = 0.7,
    filter,
    namespace,
  } = options;

  try {
    const queryEmbedding = await generateEmbedding(query);
    const index = await getPineconeIndex();

    // Step 1: Select namespace (if provided), otherwise use default (empty string)
    const indexNamespace = namespace ? index.namespace(namespace) : index;

    // Step 2: Perform query — note: NO `namespace` field here!
    const results = await indexNamespace.query({
      vector: queryEmbedding,
      topK: topK + 10, // fetch extra for filtering
      includeMetadata: true,
      filter, // metadata filter works the same
    });

    const matches = results.matches ?? [];

    return matches
      .filter((match) => (match.score ?? 0) >= minScoreThreshold)
      .slice(0, topK)
      .map((match) => ({
        id: match.id,
        content: (match.metadata?.content as string) ?? "",
        source: match.metadata?.source as string | undefined,
        chunkIndex: match.metadata?.chunkIndex as number | undefined,
        score: match.score ?? 0,
      }));
  } catch (error: any) {
    console.error("Pinecone search error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }
}