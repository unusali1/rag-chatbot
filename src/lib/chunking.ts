import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 200,
  separators: [" "],
});

export async function chunkContent(content: string) {
  return await textSplitter.splitText(content.trim());
}