import crypto from "crypto";
import { NextResponse } from "next/server";

import { generateClient } from "aws-amplify/data";

import "@/amplify-config";

import { type Schema } from "@/amplify/data/resource";

// Ensure Node.js runtime for access to Node 'crypto'
export const runtime = "nodejs";

// Heuristic email extraction
const isEmail = (v: unknown): v is string =>
  typeof v === "string" && /.+@.+\..+/.test(v);

function tryArrayFirstEmail(
  arr: any[] | undefined,
  keys: string[]
): string | undefined {
  if (!Array.isArray(arr)) return undefined;
  for (const item of arr) {
    for (const k of keys) {
      const maybe = item?.[k];
      if (isEmail(maybe)) return maybe;
    }
  }
  return undefined;
}

// Try to find the actual booking object in various Cal.com payload shapes
function extractBooking(payload: any): any {
  return (
    payload?.data?.booking ||
    payload?.payload?.booking ||
    payload?.booking ||
    payload?.data ||
    payload?.payload ||
    payload ||
    {}
  );
}

function deepFindEmail(
  obj: any,
  excludeKeys: string[] = ["organizer"],
  depth = 0
): string | undefined {
  if (!obj || typeof obj !== "object" || depth > 4) return undefined;
  if (Array.isArray(obj)) {
    for (const el of obj) {
      const found = deepFindEmail(el, excludeKeys, depth + 1);
      if (found) return found;
    }
    return undefined;
  }
  for (const [key, value] of Object.entries(obj)) {
    if (excludeKeys.includes(key)) continue;
    if (key.toLowerCase().includes("email") && isEmail(value)) return value;
    const nested = deepFindEmail(value, excludeKeys, depth + 1);
    if (nested) return nested;
  }
  return undefined;
}

function resolveBuyerEmail(booking: any): string | undefined {
  // Strong preferences first
  const fromAttendees = tryArrayFirstEmail(booking?.attendees, [
    "email",
    "emailAddress",
  ]);
  if (fromAttendees) return fromAttendees;
  const fromInvitees = tryArrayFirstEmail(booking?.invitees, [
    "email",
    "emailAddress",
  ]);
  if (fromInvitees) return fromInvitees;
  const direct =
    booking?.attendee?.email ||
    booking?.invitee?.email ||
    booking?.attendeeEmail;
  if (isEmail(direct)) return direct;
  const fromCommon =
    booking?.responses?.email ||
    booking?.answers?.email ||
    booking?.fields?.email ||
    booking?.email ||
    booking?.metadata?.buyerEmail;
  if (isEmail(fromCommon)) return fromCommon;
  // Last resort: deep search (avoids organizer branch by default)
  return deepFindEmail(booking);
}

function verifySignature(headers: Headers, rawBody: string): boolean {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  // Secret must be present in all environments
  if (!secret) {
    return false;
  }

  // Gather possible signature headers Cal.com may send
  const candidates = [
    "x-cal-signature-256",
    "x-cal-signature",
    "cal-signature",
    "x-webhook-signature",
  ];
  let incoming: string | null = null;
  for (const h of candidates) {
    const val = headers.get(h);
    if (val) {
      incoming = val;
      break;
    }
  }
  if (!incoming) return false;

  const normalize = (s: string) => s.trim().toLowerCase();

  // If header uses a key=value list (e.g., t=...,v1=hash or sha256=hash), extract the hash and timestamp
  const parts = incoming.split(",").map((p) => p.trim());
  let providedHash: string | undefined;
  let timestamp: string | undefined;
  for (const p of parts) {
    const [k, v] = p.split("=");
    if (!v) continue;
    const key = k.toLowerCase();
    if (key === "v1" || key === "sha256" || key === "signature") {
      providedHash = v;
    } else if (key === "t" || key === "timestamp") {
      timestamp = v;
    } else if (parts.length === 1 && !providedHash) {
      // Single token without key, assume the whole header is the hash
      providedHash = p;
    }
  }
  if (!providedHash) {
    providedHash = incoming;
  }

  // Compute expected hashes
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody, "utf8");
  const bodyOnly = hmac.digest("hex");

  let matches = normalize(providedHash) === normalize(bodyOnly);

  // If timestamp is present, Cal.com may sign `${t}.${body}`
  if (!matches && timestamp) {
    const hmac2 = crypto.createHmac("sha256", secret);
    hmac2.update(`${timestamp}.${rawBody}`, "utf8");
    const tsBody = hmac2.digest("hex");
    matches = normalize(providedHash) === normalize(tsBody);
  }

  if (!matches) return false;

  // Timing safe equality when lengths match
  try {
    const a = Buffer.from(providedHash, "hex");
    const b = Buffer.from(
      matches && timestamp
        ? crypto
            .createHmac("sha256", secret)
            .update(`${timestamp}.${rawBody}`, "utf8")
            .digest("hex")
        : bodyOnly,
      "hex"
    );
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    // Fallback to boolean match if parsing as hex fails
    return matches;
  }
}

export async function GET() {
  // Health check endpoint for "Ping test" in Cal.com
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    // Early entry log to confirm route is hit and headers visible
    try {
      const headerKeys: string[] = [];
      request.headers.forEach((_v, k) => headerKeys.push(k));
    } catch {}
    // Ensure secret is configured; otherwise treat as server misconfiguration
    if (!process.env.CALCOM_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Server misconfigured: CALCOM_WEBHOOK_SECRET not set" },
        { status: 500 }
      );
    }
    // Read raw body for signature verification
    const rawBody = await request.text();
    // Verify webhook
    if (!verifySignature(request.headers, rawBody)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      payload = {};
    }
    const eventType =
      payload?.type || payload?.event || payload?.triggerEvent || "";
    const booking = extractBooking(payload);

    const client = generateClient<Schema>();

    // Normalize fields from Cal.com payloads
    // Prefer booking UID which is unique per meeting; avoid eventType IDs
    const providerEventId =
      booking?.uid ||
      booking?.booking?.uid ||
      booking?.bookingId ||
      booking?.id ||
      booking?.reference ||
      booking?.uuid ||
      booking?.eventId;
    const startTimeUtc =
      booking?.startTime ||
      booking?.start_time ||
      booking?.start ||
      booking?.start_time_utc ||
      payload?.data?.startTime ||
      payload?.payload?.startTime;
    const endTimeUtc =
      booking?.endTime ||
      booking?.end_time ||
      booking?.end ||
      booking?.end_time_utc ||
      payload?.data?.endTime ||
      payload?.payload?.endTime;
    const joinUrl =
      booking?.hangoutLink ||
      booking?.meetingUrl ||
      booking?.videoCallUrl ||
      booking?.join_url;
    const buyerEmail = resolveBuyerEmail(booking);
    // Enhanced buyerId extraction to handle multiple Cal.com payload formats
    let buyerId =
      booking?.metadata?.buyerId ||
      booking?.buyerId ||
      booking?.["custom-buyerId"] ||
      booking?.userId ||
      booking?.attendee?.id ||
      booking?.invitee?.id ||
      (Array.isArray(booking?.attendees)
        ? booking.attendees[0]?.id
        : undefined) ||
      (Array.isArray(booking?.invitees) ? booking.invitees[0]?.id : undefined);

    // Try parsing metadata if it's a JSON string
    if (!buyerId && booking?.metadata && typeof booking.metadata === "string") {
      try {
        const parsedMetadata = JSON.parse(booking.metadata);
        buyerId = parsedMetadata?.buyerId;
      } catch {
        // Ignore parsing errors
      }
    }

    // Also check responses/answers/fields for buyerId
    if (!buyerId) {
      buyerId =
        booking?.responses?.buyerId ||
        booking?.answers?.buyerId ||
        booking?.fields?.buyerId;
    }

    if (buyerId && isEmail(buyerId)) {
      buyerId = booking?.metadata?.buyerId;
    }

    // If Cal.com didn't forward buyerId, try to look it up by email
    if (!buyerId && buyerEmail) {
      try {
        // Search for existing bookings with this email to get the correct buyerId
        const existingBookings = await client.models.MeetingBooking.list({
          filter: {
            buyerEmail: { eq: String(buyerEmail) },
          },
          limit: 1,
          authMode: "apiKey",
        });

        const existingBooking = existingBookings?.data?.[0];
        if (
          existingBooking?.buyerId &&
          !existingBooking.buyerId.startsWith("unknown-")
        ) {
          buyerId = existingBooking.buyerId;
        }
      } catch (error) {}
    }

    const timezone =
      booking?.timezone ||
      booking?.timeZone ||
      payload?.data?.timezone ||
      payload?.payload?.timezone;
    const providerEventTypeId = booking?.eventTypeId || booking?.event_type_id;
    const statusMap: Record<string, "BOOKED" | "CANCELED"> = {
      BOOKING_CREATED: "BOOKED",
      "booking.created": "BOOKED",
      EVENT_CREATED: "BOOKED",
      "booking.rescheduled": "BOOKED",
      BOOKING_CANCELLED: "CANCELED",
      "booking.canceled": "CANCELED",
      EVENT_CANCELLED: "CANCELED",
    };
    const normalizedStatus = statusMap[eventType] || "BOOKED";

    // Safe datetime parsing
    const toIso = (v: unknown): string | null => {
      const d = new Date(v as any);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const isoStartTime = toIso(startTimeUtc);
    const isoEndTime = toIso(endTimeUtc);

    // Basic request logging for debugging (lightweight)
    try {
      const rootKeys =
        payload && typeof payload === "object"
          ? Object.keys(payload).slice(0, 12)
          : [];
      const dataKeys =
        payload?.data && typeof payload.data === "object"
          ? Object.keys(payload.data).slice(0, 12)
          : [];
      const bookingKeys =
        booking && typeof booking === "object"
          ? Object.keys(booking).slice(0, 12)
          : [];
    } catch {}

    if (!providerEventId || !isoStartTime || !isoEndTime) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    if (!buyerEmail) {
      try {
        const aLen = Array.isArray(booking?.attendees)
          ? booking.attendees.length
          : 0;
        const iLen = Array.isArray(booking?.invitees)
          ? booking.invitees.length
          : 0;
      } catch {}
    }

    // Allow forcing create-only behavior for debugging
    const alwaysCreate = process.env.CALCOM_ALWAYS_CREATE === "1";
    // Enforce single active booking per buyer
    if (normalizedStatus === "BOOKED" && (buyerId || buyerEmail)) {
      try {
        let conflict: any | undefined;
        if (buyerId) {
          const res = await client.models.MeetingBooking.list({
            filter: {
              buyerId: { eq: String(buyerId) },
              status: { eq: "BOOKED" },
            },
            limit: 1,
            authMode: "apiKey",
          });
          conflict = res?.data?.[0];
        }
        if (!conflict && buyerEmail) {
          const res2 = await client.models.MeetingBooking.list({
            filter: {
              buyerEmail: { eq: String(buyerEmail) },
              status: { eq: "BOOKED" },
            },
            limit: 1,
            authMode: "apiKey",
          });
          conflict = res2?.data?.[0];
        }
        if (conflict) {
          if (!conflict.providerEventId && providerEventId) {
            try {
              await client.models.MeetingBooking.update(
                {
                  id: conflict.id,
                  providerEventId: String(providerEventId),
                  updatedAt: new Date().toISOString(),
                },
                { authMode: "apiKey" }
              );
            } catch {}
          }
          return NextResponse.json({
            ok: true,
            action: "duplicate-skipped",
            existingId: conflict.id,
          });
        }
      } catch (e) {}
    }
    // Upsert by providerEventId (paginate to avoid early-empty pages)
    let existingRecord: any | undefined;
    if (!alwaysCreate) {
      let nextToken: string | undefined = undefined;
      do {
        const page = await client.models.MeetingBooking.list({
          filter: { providerEventId: { eq: String(providerEventId) } },
          nextToken,
          authMode: "apiKey",
        });
        if (page?.data && page.data.length > 0) {
          existingRecord = page.data[0];
          break;
        }
        const token = (page as any)?.nextToken as string | undefined;
        nextToken = token;
      } while (nextToken);
    }

    if (existingRecord) {
      const record = existingRecord;
      const { data: updated } = await client.models.MeetingBooking.update(
        {
          id: record.id!,
          startTimeUtc: isoStartTime,
          endTimeUtc: isoEndTime,
          joinUrl: joinUrl || record.joinUrl,
          timezone: timezone || record.timezone,
          status: normalizedStatus,
          ...(buyerEmail ? { buyerEmail: String(buyerEmail) } : {}),
          // Backfill buyerId if we now have a non-email one and stored value was email-like
          ...(buyerId && !isEmail(buyerId) && record.buyerId !== buyerId
            ? { buyerId: String(buyerId) }
            : {}),
          updatedAt: new Date().toISOString(),
        },
        { authMode: "apiKey" }
      );

      return NextResponse.json({
        ok: true,
        id: updated?.id,
        action: "updated",
      });
    }

    const sanitizedBuyerId =
      buyerId && !isEmail(buyerId) ? buyerId : booking?.metadata?.buyerId;
    const effectiveBuyerId =
      sanitizedBuyerId || `unknown-${String(providerEventId)}`;
    const { data: created } = await client.models.MeetingBooking.create(
      {
        buyerId: String(effectiveBuyerId),
        ...(buyerEmail ? { buyerEmail: String(buyerEmail) } : {}),
        startTimeUtc: isoStartTime,
        endTimeUtc: isoEndTime,
        timezone: String(timezone || ""),
        provider: "cal.com",
        providerEventId: String(providerEventId),
        providerEventTypeId: providerEventTypeId
          ? String(providerEventTypeId)
          : undefined,
        joinUrl: joinUrl ? String(joinUrl) : undefined,
        status: normalizedStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { authMode: "apiKey" }
    );

    return NextResponse.json({ ok: true, id: created?.id, action: "created" });
  } catch (error) {
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
