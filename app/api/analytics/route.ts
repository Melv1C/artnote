import { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';

// Valid event types for validation
const VALID_EVENT_TYPES = [
  'page_view_start',
  'page_view_end',
  'notice_view_start',
  'notice_view_end',
  'cookie_accept',
  'cookie_reject',
  'interaction',
] as const;

const VALID_PAGE_CATEGORIES = ['home', 'notice', 'about', 'dashboard', 'other'] as const;

type EventType = (typeof VALID_EVENT_TYPES)[number];
type PageCategory = (typeof VALID_PAGE_CATEGORIES)[number];

interface AnalyticsPayload {
  eventType?: string;
  timestamp?: string;
  visitorId?: string | null;
  sessionId?: string | null;
  noticeId?: string | null;
  path?: string | null;
  pageCategory?: string | null;
  referrer?: string | null;
  durationMs?: number | null;
  meta?: Record<string, unknown> | null;
}

/**
 * Sanitize and truncate string to max length
 */
function sanitizeString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value);
  return str.length > maxLength ? str.slice(0, maxLength) : str;
}

/**
 * Validate event type
 */
function isValidEventType(eventType: string): eventType is EventType {
  return VALID_EVENT_TYPES.includes(eventType as EventType);
}

/**
 * Parse User-Agent to extract browser, OS, and device info
 */
function parseUserAgent(ua: string): {
  browser: string | null;
  browserVer: string | null;
  os: string | null;
  deviceType: string;
} {
  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    browser: result.browser.name ?? null,
    browserVer: result.browser.version ?? null,
    os: result.os.name ?? null,
    deviceType: result.device.type ?? 'desktop',
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let payload: AnalyticsPayload;
    try {
      const text = await request.text();
      payload = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate event type
    const eventType = sanitizeString(payload.eventType, 64);
    if (!eventType || !isValidEventType(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Parse and validate timestamp
    let timestamp: Date;
    if (payload.timestamp) {
      const parsed = new Date(payload.timestamp);
      timestamp = isNaN(parsed.getTime()) ? new Date() : parsed;
    } else {
      timestamp = new Date();
    }

    // Sanitize all string fields
    const visitorId = sanitizeString(payload.visitorId, 64);
    const sessionId = sanitizeString(payload.sessionId, 64);
    const noticeId = sanitizeString(payload.noticeId, 64);
    const path = sanitizeString(payload.path, 200);
    const referrer = sanitizeString(payload.referrer, 200);

    // Validate page category
    const rawPageCategory = sanitizeString(payload.pageCategory, 20);
    const pageCategory =
      rawPageCategory && VALID_PAGE_CATEGORIES.includes(rawPageCategory as PageCategory)
        ? rawPageCategory
        : null;

    // Validate and sanitize duration
    const durationMs =
      typeof payload.durationMs === 'number' && payload.durationMs >= 0
        ? Math.min(Math.round(payload.durationMs), 86400000) // Max 24 hours
        : null;

    // Parse User-Agent (do NOT store raw UA string)
    const userAgent = request.headers.get('user-agent') ?? '';
    const { browser, browserVer, os, deviceType } = parseUserAgent(userAgent);

    // Sanitize meta (limit to small object)
    let meta: Record<string, unknown> | null = null;
    if (payload.meta && typeof payload.meta === 'object') {
      const metaStr = JSON.stringify(payload.meta);
      if (metaStr.length <= 1000) {
        meta = payload.meta;
      }
    }

    // Insert analytics event
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        timestamp,
        visitorId,
        sessionId,
        noticeId,
        path,
        pageCategory,
        referrer,
        browser,
        browserVer,
        os,
        deviceType,
        durationMs,
        meta: meta as Prisma.InputJsonValue | undefined,
      },
    });

    // Return 204 No Content (success with no body)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Analytics API error:', error);
    // Return 500 but don't expose internal errors
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
