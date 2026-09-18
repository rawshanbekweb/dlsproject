import { getLabAiConfig, generateCoachResponse } from "@/lib/lab-ai-server";
import { parseCoachRequest } from "@/lib/lab-ai-contract";
import { rateLimit, clientKey, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;
let activeRequests = 0;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export function GET() {
  const config = getLabAiConfig();
  return json({ available: !!config, provider: config ? config.provider === "openai" ? "OpenAI" : "Google Gemini" : null });
}

async function readBody(req: Request): Promise<unknown> {
  if (!req.body) throw new Error("Empty body");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 12_000) { await reader.cancel(); throw new Error("Large body"); }
      chunks.push(chunk.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function POST(req: Request) {
  if (req.headers.get("origin") && req.headers.get("origin") !== new URL(req.url).origin) return json({ error: "Origin rejected" }, 403);
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json({ error: "JSON kerak" }, 415);
  const limit = rateLimit(`lab-coach:${clientKey(req)}`, { limit: 12, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit);
  let input: unknown;
  try { input = await readBody(req); } catch { return json({ error: "So‘rov yaroqsiz yoki juda katta" }, 400); }
  const request = parseCoachRequest(input);
  if (!request) return json({ error: "Mashq yoki javob yaroqsiz" }, 400);
  const config = getLabAiConfig();
  if (!config) return json({ error: "Jonli AI ulanmagan", fallback: true }, 503);
  // Per-process protection, NOT a distributed spending cap. See AI.md for deployment limits.
  const budget = rateLimit("lab-coach:instance", { limit: 200, windowMs: 3_600_000 });
  if (!budget.ok) return tooManyRequests(budget);
  if (activeRequests >= 3) return json({ error: "Nomi band", fallback: true }, 503);
  activeRequests++;
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timer = setTimeout(abort, 10_000);
  req.signal.addEventListener("abort", abort, { once: true });
  try {
    if (req.signal.aborted) controller.abort();
    return json(await generateCoachResponse(request, config, controller.signal));
  } catch {
    return json({ error: "Jonli javob olinmadi", fallback: true }, 503);
  } finally {
    clearTimeout(timer); req.signal.removeEventListener("abort", abort); activeRequests--;
  }
}
