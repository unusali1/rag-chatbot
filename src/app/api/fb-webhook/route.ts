// src/app/api/fb-webhook/route.ts
import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

// ──────────────────────────────────────
// Send reply via Graph API
// ──────────────────────────────────────
async function sendMessage(psid: string, text: string) {
  const body = {
    recipient: { id: psid },
    message: { text },
  };

  await fetch(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

// ──────────────────────────────────────
// Call your existing /api/chat (single-turn)
// ──────────────────────────────────────
async function getBotReply(userText: string) {
  const payload = {
    messages: [{ role: "user", content: userText }],
  };

  const res = await fetch(`${SITE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Chat API error");

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let reply = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split("\n").filter(Boolean)) {
      try {
        const msg = JSON.parse(line);
        if (msg.role === "assistant" && msg.content) {
          reply += msg.content;
        }
      } catch {
        // ignore malformed lines
      }
    }
  }
  return reply.trim();
}

// ──────────────────────────────────────
// GET  → Verify webhook
// ──────────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// ──────────────────────────────────────
// POST → Receive messages
// ──────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.json();

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message && !event.message.is_echo) {
        const psid = event.sender.id;
        const text = event.message.text;

        try {
          const reply = await getBotReply(text);
          await sendMessage(psid, reply);
        } catch (err) {
          console.error("Bot error:", err);
          await sendMessage(
            psid,
            "Sorry, I'm having trouble right now. Our team will contact you soon! 😊"
          );
        }
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}