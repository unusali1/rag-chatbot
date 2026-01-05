// src/app/upload/actions.ts
"use server";

import pdf from "pdf-parse";
import { getPineconeIndex } from "@/lib/pinecone";
import { generateEmbeddings } from "@/lib/embeddings";
import { chunkContent } from "@/lib/chunking";
import { nanoid } from "nanoid";

const MAX_VECTORS_PER_UPSERT = 100;  // Very safe limit
const MAX_BYTES_PER_UPSERT = 2 * 1024 * 1024; // 2MB

export async function processPdfFile(formData: FormData) {
  try {
    const file = formData.get("pdf") as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const data = await pdf(buffer);

    if (!data.text?.trim()) {
      return { success: false, error: "No text found in PDF" };
    }

    const chunks = await chunkContent(data.text);
    if (chunks.length === 0) {
      return { success: false, error: "Failed to chunk content" };
    }

    const embeddings = await generateEmbeddings(chunks);
    const index = await getPineconeIndex();

    // Prepare all vectors with metadata
    const vectors = chunks.map((chunk, i) => ({
      id: nanoid(),
      values: embeddings[i],
      metadata: {
        content: chunk,
        source: file.name,
        chunkIndex: i,
      },
    }));

    // Batch upsert to stay under 2MB limit
    for (let i = 0; i < vectors.length; i += MAX_VECTORS_PER_UPSERT) {
      const batch = vectors.slice(i, i + MAX_VECTORS_PER_UPSERT);

      // Optional extra safety: check actual byte size
      const batchSizeInBytes = JSON.stringify(batch).length * 2; // rough UTF-16 estimate
      if (batchSizeInBytes > MAX_BYTES_PER_UPSERT) {
        // If still too big, reduce batch size further (very long chunks)
        const smallerBatchSize = Math.floor(MAX_VECTORS_PER_UPSERT / 2);
        for (let j = 0; j < batch.length; j += smallerBatchSize) {
          await index.upsert(batch.slice(j, j + smallerBatchSize));
        }
      } else {
        await index.upsert(batch);
      }
    }

    return {
      success: true,
      message: `Successfully stored ${vectors.length} chunks in Pinecone!`,
      count: vectors.length,
    };
  } catch (error: any) {
    console.error("PDF processing error:", error);
    return {
      success: false,
      error: error.message || "Failed to process PDF",
    };
  }
}