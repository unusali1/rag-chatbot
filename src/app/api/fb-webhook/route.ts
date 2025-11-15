// src/app/api/fb-webhook/route.ts
import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

// ── DEBUG LOGGING ─────────────────────────────────────
function log(...args: any[]) {
  console.log("[FB WEBHOOK]", new Date().toISOString(), ...args);
}

// ── SEND MESSAGE ───────────────────────────────────────
async function sendMessage(psid: string, text: string) {
  const body = { recipient: { id: psid }, message: { text } };
  log("Sending reply:", text.slice(0, 100));

  const res = await fetch(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    log("Graph API ERROR:", res.status, err);
    throw new Error("Graph API failed");
  }
  log("Reply sent successfully");
}

// ── GET BOT REPLY ──────────────────────────────────────
async function getBotReply(userText: string) {
  const payload = { messages: [{ role: "user", content: userText }] };

  log("Calling /api/chat with:", userText);
  const res = await fetch(`${SITE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    log("Chat API ERROR:", res.status, err);
    throw new Error("Chat API failed");
  }

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
      } catch {}
    }
  }

  const final = reply.trim();
  log("Bot reply:", final.slice(0, 200));
  return final;
}

// ── GET: Verify ────────────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  log("GET verify:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// ── POST: Receive Message ───────────────────────────────
export async function POST(req: Request) {
  const body = await req.json();
  log("POST received:", JSON.stringify(body, null, 2));

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message && !event.message.is_echo) {
        const psid = event.sender.id;
        const text = event.message.text;

        log("User message:", { psid, text });

        try {
          const reply = await getBotReply(text);
          if (reply) await sendMessage(psid, reply);
        } catch (err: any) {
          log("ERROR:", err.message);
          await sendMessage(psid, "Sorry, I'm busy. Our team will reply soon! 😊");
        }
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}