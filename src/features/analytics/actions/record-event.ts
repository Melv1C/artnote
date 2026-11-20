import '@tanstack/react-start/server-only';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import { AnalyticsEventPayloadSchema } from '../lib/events';

/** Browser, OS and device class from a User-Agent. The raw User-Agent is never stored. */
function describeUserAgent(userAgent: string) {
  const { browser, os, device } = new UAParser(userAgent).getResult();
  return {
    browser: browser.name ?? null,
    browserVer: browser.version ?? null,
    os: os.name ?? null,
    deviceType: device.type ?? 'desktop',
  };
}

/**
 * Validate and store one beacon event. Returns false when the payload is not a valid event.
 */
export async function recordAnalyticsEvent(payload: unknown, userAgent: string): Promise<boolean> {
  const parsed = AnalyticsEventPayloadSchema.safeParse(payload);
  if (!parsed.success) return false;

  const { meta, ...event } = parsed.data;
  await prisma.analyticsEvent.create({
    data: {
      ...event,
      ...describeUserAgent(userAgent),
      meta: (meta ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return true;
}
