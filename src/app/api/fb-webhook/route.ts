// src/app/api/fb-webhook/route.ts
import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

if (!VERIFY_TOKEN || !PAGE_ACCESS_TOKEN || !SITE_URL) {
  throw new Error("Missing required environment variables: FB_VERIFY_TOKEN, FB_PAGE_ACCESS_TOKEN, or NEXT_PUBLIC_SITE_URL");
}

console.log("[FB] Webhook loaded at", new Date().toISOString());

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("[FB] GET verify request:", { mode, token: token?.slice(0, 5) + "..." });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[FB] Webhook verified successfully!");
    return new Response(challenge, { status: 200 });
  }

  console.log("[FB] Verification failed: invalid token or mode");
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error("[FB] Invalid JSON in POST body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[FB] POST received:", JSON.stringify(body, null, 2));

  // Acknowledge immediately to avoid Meta retries
  setImmediate(() => processWebhook(body).catch(console.error));

  return NextResponse.json({ status: "ok" });
}

async function processWebhook(body: any) {
  if (!body?.entry?.length) {
    console.log("[FB] No entries found in webhook payload");
    return;
  }

  for (const entry of body.entry) {
    const pageId = entry.id;
    const time = new Date(entry.time).toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    // === NEW FORMAT: entry.changes (Current Standard in 2025) ===
    if (Array.isArray(entry.changes)) {
      for (const change of entry.changes) {
        if (change.field !== "messages") continue;

        const msg = change.value;
        const senderId = msg.from?.id || msg.sender?.id;
        const recipientId = msg.recipient?.id;
        const message = msg.message;

        if (!senderId || !message?.text) continue;
        if (message.is_echo || msg.delivery || msg.read) continue;

        console.log(`[FB] Message from PSID ${senderId} to Page ${pageId} at ${time}`);
        await handleUserMessage(senderId, message.text);
      }
    }

    // === LEGACY FORMAT: entry.messaging (Fallback) ===
    if (Array.isArray(entry.messaging)) {
      for (const event of entry.messaging) {
        if (event.message?.is_echo || event.delivery || event.read) continue;
        if (!event.message?.text || !event.sender?.id) continue;

        const psid = event.sender.id;
        const text = event.message.text;

        console.log(`[FB] Legacy message from PSID ${psid} at ${time}`);
        await handleUserMessage(psid, text);
      }
    }
  }
}

async function handleUserMessage(psid: string, text: string) {
  try {
    console.log("[FB] Processing message:", { psid, text });

    const aiReply = await getAIResponse(text);
    const finalReply = aiReply.trim() || "Hello! How can I help you today? 😊";

    console.log("[FB] Sending reply:", finalReply);
    await sendMessage(psid, finalReply);
  } catch (err: any) {
    console.error("[FB] Failed to handle message:", err.message);
    await sendMessage(psid, "Sorry, I'm having trouble right now. Our team will reply soon! 😊");
  }
}

async function getAIResponse(userText: string): Promise<string> {
  console.log("[FB] Calling /api/chat for AI response...");

  const res = await fetch(`${SITE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[FB] /api/chat failed:", res.status, errorText);
    throw new Error(`AI API error: ${res.status}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let reply = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          if (parsed.role === "assistant" && parsed.content) {
            reply += parsed.content;
          }
        } catch (e) {
          console.warn("[FB] Failed to parse SSE line:", data);
        }
      }
    }
  } catch (err) {
    console.error("[FB] Stream reading error:", err);
    throw err;
  } finally {
    reader.releaseLock();
  }

  console.log("[FB] AI response received:", reply.substring(0, 100) + (reply.length > 100 ? "..." : ""));
  return reply;
}

async function sendMessage(psid: string, text: string) {
  const payload = {
    recipient: { id: psid },
    message: { text },
  };

  console.log(`[FB] Sending to https://graph.facebook.com/v20.0/me/messages (PSID: ${psid})`);

  const sendRes = await fetch(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  if (!sendRes.ok) {
    const errorText = await sendRes.text();
    console.error("[FB] Failed to send message:", sendRes.status, errorText);
    throw new Error(`Send failed: ${sendRes.status}`);
  }

  console.log("[FB] Message sent successfully to PSID:", psid);
}