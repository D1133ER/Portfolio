import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (per IP, resets on restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    if (name.trim().length > 200) {
      return NextResponse.json({ error: 'Name is too long.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (email.length > 320) {
      return NextResponse.json({ error: 'Email is too long.' }, { status: 400 });
    }

    if (message && typeof message === 'string' && message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long (max 5000 chars).' }, { status: 400 });
    }

    // Log the contact submission server-side (replace with email service like Resend/SendGrid)
    // console.log('[Contact Form]', { ... }) — removed for production
    void { name: name.trim(), email: email.trim(), message: (message || '').trim().slice(0, 5000) };

    return NextResponse.json({ success: true, message: 'Message received!' });
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}
