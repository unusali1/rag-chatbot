// src/app/api/fb-webhook/route.ts
import { NextResponse } from "next/server";

const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN!;
const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

console.log("[FB] Webhook loaded");

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  console.log("[FB] GET verify:", { mode, token, challenge });

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("[FB] POST received:", JSON.stringify(body, null, 2));

  // 🔥 IMMEDIATELY ACKNOWLEDGE to Facebook
  // Do NOT wait for processing
  setImmediate(() => processWebhook(body).catch(console.error));

  return NextResponse.json({ status: "ok" }); // ← Return 200 instantly
}

// Move all logic to a separate async function
async function processWebhook(body: any) {
  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      if (event.message && !event.message.is_echo) {
        const psid = event.sender.id;
        const text = event.message.text;

        console.log("[FB] User message:", { psid, text });

        try {
          const res = await fetch(`${SITE_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
          });

          if (!res.ok) throw new Error(`Chat API ${res.status}`);

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
              } catch (e) {
                // Ignore JSON parse errors in stream
              }
            }
          }

          const finalReply = reply.trim() || "Hello! How can I help? 😊";
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

// Helper to send message
async function sendMessage(psid: string, text: string) {
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
    console.log("[FB] Send error:", sendRes.status, err);
  } else {
    console.log("[FB] Reply sent successfully");
  }
}