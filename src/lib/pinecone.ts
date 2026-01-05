// src/lib/pinecone.ts
import { Pinecone } from "@pinecone-database/pinecone";

if (!process.env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is missing");
}
if (!process.env.PINECONE_INDEX) {
  throw new Error("PINECONE_INDEX is missing");
}

const pineconeClient = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

export const pinecone = pineconeClient;
export const indexName = process.env.PINECONE_INDEX;

export async function getPineconeIndex() {
  const indexList = await pinecone.listIndexes();
  const indexExists = indexList.indexes?.some(idx => idx.name === indexName);

  if (!indexExists) {
    // Create index if it doesn't exist (only needed once)
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536, // text-embedding-3-small = 1536 dims
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1", // or your preferred region
        },
      },
    });

    // Wait for index to be ready
    console.log("Creating Pinecone index... waiting for readiness");
    await new Promise(resolve => setTimeout(resolve, 30000)); // rough wait
  }

  return pinecone.index(indexName);
}