import { connectDB } from "@/lib/db";
import { AnalyticsEvent } from "@/models";
import { parseUserAgent } from "@/lib/utils";

interface TrackEventOptions {
  resourceType: "file" | "link";
  resourceId: string;
  eventType: "view" | "mission_start" | "mission_complete" | "download" | "click";
  ip?: string;
  userAgent?: string;
  referrer?: string;
}

export async function trackEvent(opts: TrackEventOptions) {
  try {
    await connectDB();
    const ua = opts.userAgent ? parseUserAgent(opts.userAgent) : {};
    await AnalyticsEvent.create({
      resourceType: opts.resourceType,
      resourceId: opts.resourceId,
      eventType: opts.eventType,
      ip: opts.ip ? hashIp(opts.ip) : undefined,
      userAgent: opts.userAgent?.substring(0, 500),
      ...ua,
      referrer: opts.referrer?.substring(0, 500),
    });
  } catch {}
}

function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function getResourceAnalytics(resourceId: string, days = 30) {
  await connectDB();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const events = await AnalyticsEvent.find({ resourceId, createdAt: { $gte: since } }).lean();

  const byDay: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const byEventType: Record<string, number> = {};

  for (const e of events) {
    const day = (e.createdAt as Date).toISOString().split("T")[0];
    byDay[day] = (byDay[day] || 0) + 1;
    if (e.browser) byBrowser[e.browser] = (byBrowser[e.browser] || 0) + 1;
    if (e.device) byDevice[e.device] = (byDevice[e.device] || 0) + 1;
    byEventType[e.eventType] = (byEventType[e.eventType] || 0) + 1;
  }

  return { total: events.length, byDay, byBrowser, byDevice, byEventType };
}
