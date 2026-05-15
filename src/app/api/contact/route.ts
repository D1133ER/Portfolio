import { NextRequest, NextResponse } from 'next/server';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-layer Rate Limiter — Contact Form
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Three independent sliding-window buckets applied in order:
 *
 *   1. GLOBAL   — 30 requests / 5 min  (DDoS / bot-flood protection)
 *   2. PER-IP   — 3  requests / 60 min (per-visitor limit)
 *   3. PER-EMAIL— 2  requests / 24 hr  (same sender can't spam via rotating IPs)
 *
 * Sliding window: stores an array of hit timestamps, prunes entries older
 * than the window on every check. More accurate than fixed-window (no
 * "burst at boundary" problem).
 *
 * ⚠ In-memory: state is local to each serverless instance.  On Vercel each
 * cold start begins with empty buckets — acceptable for a portfolio contact
 * form.  For shared state across instances use Upstash Redis / Vercel KV.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Bucket configuration ──────────────────────────────────────────────────────
const LIMITS = {
  global: { windowMs: 5  * 60 * 1_000, max: 30 },   // 30 req / 5 min
  ip:     { windowMs: 60 * 60 * 1_000, max: 3  },   // 3  req / 60 min
  email:  { windowMs: 24 * 60 * 60 * 1_000, max: 2 },// 2  req / 24 hr
} as const;

interface Bucket { hits: number[] }

// ── Sliding-window limiter ────────────────────────────────────────────────────
class SlidingWindowLimiter {
  private store = new Map<string, Bucket>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
    cleanupIntervalMs = 10 * 60 * 1_000, // prune stale entries every 10 min
  ) {
    // Only set up the timer in environments that keep long-running state
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.prune(), cleanupIntervalMs);
      // Don't block process exit in Node
      this.cleanupTimer.unref?.();
    }
  }

  /**
   * Returns whether `key` is currently rate-limited.
   * Mutates the bucket (adds this request's timestamp) only when NOT limited.
   */
  check(key: string): {
    limited:    boolean;
    remaining:  number;
    retryAfter: number;   // seconds until the oldest hit expires (0 if not limited)
    resetAt:    number;   // Unix ms when the window resets for this key
  } {
    const now    = Date.now();
    const cutoff = now - this.windowMs;

    const bucket = this.store.get(key) ?? { hits: [] };
    // Prune hits that have slid out of the window
    bucket.hits = bucket.hits.filter((t) => t > cutoff);

    const count     = bucket.hits.length;
    const remaining = Math.max(0, this.max - count);

    if (count >= this.max) {
      // Oldest hit determines when the next slot opens
      const oldestHit  = bucket.hits[0]!;
      const retryAfter = Math.ceil((oldestHit + this.windowMs - now) / 1_000);
      const resetAt    = oldestHit + this.windowMs;
      this.store.set(key, bucket);
      return { limited: true, remaining: 0, retryAfter, resetAt };
    }

    bucket.hits.push(now);
    this.store.set(key, bucket);
    const resetAt = (bucket.hits[0] ?? now) + this.windowMs;
    return { limited: false, remaining: remaining - 1, retryAfter: 0, resetAt };
  }

  /** Remove entries with no hits in the current window (memory hygiene). */
  private prune() {
    const cutoff = Date.now() - this.windowMs;
    for (const [key, bucket] of this.store) {
      if (!bucket.hits.some((t) => t > cutoff)) this.store.delete(key);
    }
  }
}

// Module-level singletons (persist across requests on warm instances)
const globalLimiter = new SlidingWindowLimiter(LIMITS.global.windowMs, LIMITS.global.max);
const ipLimiter     = new SlidingWindowLimiter(LIMITS.ip.windowMs,     LIMITS.ip.max);
const emailLimiter  = new SlidingWindowLimiter(LIMITS.email.windowMs,  LIMITS.email.max);

// ── Rate-limit response helper ────────────────────────────────────────────────
function tooManyRequests(retryAfter: number, resetAt: number, scope: string) {
  const mins = Math.ceil(retryAfter / 60);
  const msg  =
    scope === 'email'
      ? `This email address has already been used to submit a message recently. Please try again in ${mins > 1 ? `${mins} minutes` : 'a minute'}.`
      : `Too many requests. Please wait ${retryAfter < 60 ? `${retryAfter} seconds` : `${mins} minutes`} before trying again.`;

  return NextResponse.json(
    { error: msg, retryAfter, scope },
    {
      status: 429,
      headers: {
        'Retry-After':          String(retryAfter),
        'X-RateLimit-Limit':    String(LIMITS[scope as keyof typeof LIMITS]?.max ?? ''),
        'X-RateLimit-Remaining':'0',
        'X-RateLimit-Reset':    String(Math.ceil(resetAt / 1_000)),
      },
    },
  );
}

// ── Email delivery via Resend REST API ────────────────────────────────────────
async function sendEmail(name: string, email: string, message: string): Promise<void> {
  const apiKey     = process.env.RESEND_API_KEY;
  const toEmail    = process.env.CONTACT_TO_EMAIL    || 'nischalbhandari11@gmail.com';
  const fromDomain = process.env.RESEND_FROM_DOMAIN  || 'onboarding@resend.dev';

  if (!apiKey) {
    console.log('\n[Contact Form] ⚠️  RESEND_API_KEY not set — logging to console only.');
    console.log('──────────────────────────────────────────');
    console.log(`  Name:    ${name}`);
    console.log(`  Email:   ${email}`);
    console.log(`  Message: ${message}`);
    console.log('──────────────────────────────────────────\n');
    return;
  }

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
      <div style="background:linear-gradient(180deg,#2c6fca,#1244a8);padding:12px 16px;border-radius:6px 6px 0 0;margin:-24px -24px 20px;">
        <h2 style="color:#fff;margin:0;font-size:16px;">📬 New Portfolio Contact Message</h2>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 12px 8px 0;font-weight:bold;color:#555;width:70px;vertical-align:top;">Name</td>
          <td style="padding:8px 0;color:#222;">${escapeHtml(name)}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:8px 12px 8px 0;font-weight:bold;color:#555;vertical-align:top;">Email</td>
          <td style="padding:8px 0;">
            <a href="mailto:${escapeHtml(email)}" style="color:#316ac5;text-decoration:none;">${escapeHtml(email)}</a>
          </td>
        </tr>
      </table>
      <div style="background:#f5f7ff;border-left:4px solid #316ac5;padding:12px 16px;border-radius:0 4px 4px 0;">
        <p style="color:#555;font-weight:bold;margin:0 0 8px;font-size:13px;">Message</p>
        <p style="color:#333;white-space:pre-wrap;margin:0;line-height:1.6;font-size:13px;">${escapeHtml(message)}</p>
      </div>
      <p style="color:#aaa;font-size:11px;margin-top:20px;text-align:center;border-top:1px solid #eee;padding-top:12px;">
        Sent from <a href="https://nischalbhandari.com.np" style="color:#aaa;">nischalbhandari.com.np</a> portfolio contact form
      </p>
    </div>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from:     `Portfolio Contact <${fromDomain}>`,
      to:       [toEmail],
      reply_to: email,
      subject:  `Portfolio Contact from ${name}`,
      html:     htmlBody,
      text:     `New Portfolio Contact\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Resend API error: ${res.status}`);
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {

  // ── Layer 1: Global rate limit ──────────────────────────────────────────────
  const globalResult = globalLimiter.check('__global__');
  if (globalResult.limited) {
    return tooManyRequests(globalResult.retryAfter, globalResult.resetAt, 'global');
  }

  // ── Layer 2: Per-IP rate limit ──────────────────────────────────────────────
  const ip = (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  ).toLowerCase();

  const ipResult = ipLimiter.check(ip);
  if (ipResult.limited) {
    return tooManyRequests(ipResult.retryAfter, ipResult.resetAt, 'ip');
  }

  // ── Parse + validate body ───────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, email, message } = body;

  if (!name || typeof name !== 'string' || !name.trim())
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  if (name.trim().length > 200)
    return NextResponse.json({ error: 'Name is too long.' }, { status: 400 });

  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
  if (email.length > 320)
    return NextResponse.json({ error: 'Email is too long.' }, { status: 400 });

  if (message && typeof message === 'string' && message.length > 5000)
    return NextResponse.json({ error: 'Message is too long (max 5000 chars).' }, { status: 400 });

  // ── Layer 3: Per-sender-email rate limit ────────────────────────────────────
  // Normalise email: lowercase, strip dots in Gmail local-part, strip +tags
  const normEmail = normaliseEmail(email);
  const emailResult = emailLimiter.check(normEmail);
  if (emailResult.limited) {
    return tooManyRequests(emailResult.retryAfter, emailResult.resetAt, 'email');
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  try {
    const cleanName    = name.trim();
    const cleanEmail   = email.trim();
    const cleanMessage = ((message as string) || '').trim().slice(0, 5000);

    await sendEmail(cleanName, cleanEmail, cleanMessage);

    return NextResponse.json(
      { success: true, message: 'Message received!' },
      {
        headers: {
          'X-RateLimit-Limit':     String(LIMITS.ip.max),
          'X-RateLimit-Remaining': String(ipResult.remaining),
          'X-RateLimit-Reset':     String(Math.ceil(ipResult.resetAt / 1_000)),
        },
      },
    );
  } catch (err) {
    console.error('[Contact Form] Send error:', err);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 },
    );
  }
}

/**
 * Normalise an email address to reduce trivial bypass attempts:
 *  - Lowercase the whole address
 *  - For Gmail/Googlemail: remove dots and +tags from the local part
 *  - For other providers: just lowercase
 *
 * Examples:
 *   John.Doe+portfolio@gmail.com  →  johndoe@gmail.com
 *   john+spam@outlook.com         →  john+spam@outlook.com  (only Gmail normalised)
 */
function normaliseEmail(raw: string): string {
  const lower = raw.trim().toLowerCase();
  const [local, domain] = lower.split('@');
  if (!local || !domain) return lower;

  const isGmail = domain === 'gmail.com' || domain === 'googlemail.com';
  if (isGmail) {
    const stripped = local.split('+')[0]!.replace(/\./g, '');
    return `${stripped}@gmail.com`;
  }

  return lower;
}
