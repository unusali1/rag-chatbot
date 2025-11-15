// src/app/api/fb-webhook/route.ts
import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

console.log("[FB] Webhook loaded at", new Date().toISOString());

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("[FB] GET verify:", { mode, token: token?.slice(0, 5) + "..." });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("[FB] POST received:", JSON.stringify(body, null, 2));

  // Acknowledge immediately
  setImmediate(() => processWebhook(body).catch(console.error));

  return NextResponse.json({ status: "ok" });
}

async function processWebhook(body: any) {
  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message?.is_echo || event.delivery || event.read) continue;

      if (event.message) {
        const psid = event.sender.id;
        const text = event.message.text;

        console.log("[FB] User message:", { psid, text });

        try {
          const aiReply = await getAIResponse(text);
          const finalReply = aiReply.trim() || "Hello! How can I help? 😊";
          console.log("[FB] Bot reply:", finalReply);

          await sendMessage(psid, finalReply);
        } catch (err: any) {
          console.log("[FB] ERROR:", err.message);
          await sendMessage(psid, "Sorry, I'm busy. Team will reply soon! 😊");
        }
      }
    }
  }
}

async function getAIResponse(userText: string): Promise<string> {
  console.log("[FB] Calling /api/chat...");

  const res = await fetch(`${SITE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content: userText }] }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.log("[FB] Chat API FAILED:", res.status, err);
    throw new Error(`Chat API ${res.status}: ${err}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let reply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n");

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.slice(6).trim();
        if (!jsonStr || jsonStr === "[DONE]") continue;

        try {
          const msg = JSON.parse(jsonStr);
          if (msg.role === "assistant" && msg.content) {
            reply += msg.content;
          }
        } catch (e) {
          console.log("[FB] SSE parse error:", jsonStr);
        }
      }
    }
  }

  return reply;
}

async function sendMessage(psid: string, text: string) {
  console.log(`[FB] Sending to PSID ${psid}:`, text);

  const sendRes = await fetch(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text },
      }),
    }
  );

  if (!sendRes.ok) {
    const err = await sendRes.text();
    console.log("[FB] Send FAILED:", sendRes.status, err);
  } else {
    console.log("[FB] Reply sent successfully");
  }
}