import { ImageResponse } from "next/og";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getGoogleDriveDirectLink, formatDesignations } from "@/lib/utils";
import { computePassportStats } from "@/lib/passport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// THADAM palette (mirrors the @theme tokens in globals.css).
const PAPER = "#FBF7F2";
const INK = "#2B1F26";
const INK_SOFT = "#5D4E56";
const INK_FAINT = "#99878F";
const BRAND = "#D41367";
const GOLD = "#C4881A";
const HAIRLINE = "#EBDEDC";

// Google-Fonts loader that returns TTF/OTF bytes Satori can use. The `&text=`
// param is essential: with it, Google serves truetype (which Satori reads);
// without it, Google serves woff2 (which it can't). Memoized per family+glyphset.
// Degrades to null (built-in font) on any failure.
const fontCache = new Map<string, ArrayBuffer>();
// IE11 advertises no woff2 support, so Google serves woff (which Satori reads);
// a modern UA would serve woff2 (which it can't). Request a single static weight,
// never a variable-axis range, or Google returns a variable woff2.
const LEGACY_UA =
  "Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko";
async function loadGoogleFont(
  familyParam: string,
  text: string
): Promise<ArrayBuffer | null> {
  const key = `${familyParam}::${text}`;
  if (fontCache.has(key)) return fontCache.get(key)!;
  try {
    const url = `https://fonts.googleapis.com/css2?family=${familyParam}&text=${encodeURIComponent(
      text
    )}`;
    const css = await (
      await fetch(url, { headers: { "User-Agent": LEGACY_UA } })
    ).text();
    const match = css.match(/src:\s*url\(([^)]+)\)/);
    if (!match?.[1]) return null;
    const res = await fetch(match[1]);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    fontCache.set(key, buf);
    return buf;
  } catch {
    return null;
  }
}

async function fetchAvatarDataUri(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const direct = getGoogleDriveDirectLink(url);
    const res = await fetch(direct);
    if (!res.ok) return null;
    const input = Buffer.from(await res.arrayBuffer());
    // Satori (next/og) only decodes PNG/JPEG — Supabase serves WebP, which makes
    // it throw. Transcode to PNG (and shrink) via sharp so the format is safe.
    const jpeg = await sharp(input)
      .resize(480, 480, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.id },
    include: {
      club: true,
      projectRoles: true,
      attendance: true,
      boardMemberships: { include: { financialYear: true } },
    },
  });

  if (!member) {
    return new Response("Not found", { status: 404 });
  }

  const stats = computePassportStats(member);
  const name = member.name || "Rotaract Member";
  // Portfolio / board designation is the identity that matters on the card;
  // fall back to profession, then a neutral label.
  const role =
    formatDesignations(member.boardMemberships) || member.profession || "Club Member";
  const clubName = member.club?.name || "Rotaract Club";
  const initial = name.charAt(0).toUpperCase();

  // Every glyph that appears on the card, so the subsetted fonts include them all.
  const glyphs =
    `${name}${role}${clubName}${stats.statusBadge}${initial}THADAM` +
    `Hours Events Projects Awards Member since ${stats.memberSince ?? ""}` +
    "0123456789·";

  const [fraunces, figtree, figtreeBold, avatar] = await Promise.all([
    loadGoogleFont("Fraunces:wght@600", glyphs),
    loadGoogleFont("Figtree:wght@500", glyphs),
    loadGoogleFont("Figtree:wght@700", glyphs),
    fetchAvatarDataUri(member.avatar),
  ]);

  const fonts: { name: string; data: ArrayBuffer; weight: 500 | 600 | 700; style: "normal" }[] = [];
  if (fraunces) fonts.push({ name: "Fraunces", data: fraunces, weight: 600, style: "normal" });
  if (figtree) fonts.push({ name: "Figtree", data: figtree, weight: 500, style: "normal" });
  if (figtreeBold) fonts.push({ name: "Figtree", data: figtreeBold, weight: 700, style: "normal" });

  // next/og requires at least one font — bail with a clear message rather than
  // letting Satori throw the opaque "not iterable".
  if (!fonts.length) {
    return new Response(
      "Passport render failed — no fonts could be loaded (Google Fonts unreachable?).",
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }

  const display = fraunces ? "Fraunces" : "Figtree";

  const stat = (value: string | number, label: string, withRule: boolean) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        paddingLeft: withRule ? 24 : 0,
        marginLeft: withRule ? 24 : 0,
        borderLeft: withRule ? `1px solid ${HAIRLINE}` : "none",
      }}
    >
      <div style={{ fontFamily: display, fontSize: 72, color: INK, lineHeight: 1 }}>
        {String(value)}
      </div>
      <div
        style={{
          fontFamily: "Figtree",
          fontWeight: 700,
          fontSize: 22,
          color: INK_FAINT,
          textTransform: "uppercase",
          letterSpacing: 3,
          marginTop: 12,
        }}
      >
        {label}
      </div>
    </div>
  );

  const element = (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: PAPER,
          fontFamily: "Figtree",
        }}
      >
        {/* Cranberry crown */}
        <div style={{ display: "flex", height: 20, width: "100%", background: BRAND }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "80px 88px 64px",
          }}
        >
          {/* Club eyebrow */}
          <div
            style={{
              fontFamily: "Figtree",
              fontWeight: 700,
              fontSize: 26,
              color: GOLD,
              textTransform: "uppercase",
              letterSpacing: 6,
            }}
          >
            {clubName}
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", marginTop: 72 }}>
            {avatar ? (
              <img
                src={avatar}
                width={240}
                height={240}
                style={{
                  width: 240,
                  height: 240,
                  borderRadius: 240,
                  objectFit: "cover",
                  border: `8px solid ${PAPER}`,
                  boxShadow: `0 0 0 2px ${HAIRLINE}`,
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 240,
                  height: 240,
                  borderRadius: 240,
                  background: "#F6EDE9",
                  color: BRAND,
                  fontFamily: display,
                  fontSize: 120,
                }}
              >
                {initial}
              </div>
            )}
          </div>

          {/* Name + role */}
          <div
            style={{
              fontFamily: display,
              fontSize: 96,
              color: INK,
              marginTop: 48,
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "Figtree",
              fontWeight: 500,
              fontSize: 32,
              color: INK_SOFT,
              marginTop: 12,
            }}
          >
            {role}
          </div>

          {/* Status badge */}
          <div style={{ display: "flex", marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: BRAND,
                color: "#FFFFFF",
                fontFamily: "Figtree",
                fontWeight: 700,
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: 2,
                padding: "14px 28px",
                borderRadius: 999,
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {Array.from({ length: stats.stars }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 12,
                      background: "#FFFFFF",
                    }}
                  />
                ))}
              </div>
              {stats.statusBadge}
            </div>
          </div>

          {/* Spacer */}
          <div style={{ display: "flex", flex: 1 }} />

          {/* Stats */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              paddingTop: 40,
              borderTop: `1px solid ${HAIRLINE}`,
            }}
          >
            {stat(stats.totalHours, "Hours", false)}
            {stat(stats.totalEvents, "Events", true)}
            {stat(stats.totalProjects, "Projects", true)}
            {stat(stats.awards, "Awards", true)}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 48,
            }}
          >
            <div
              style={{
                fontFamily: "Figtree",
                fontWeight: 700,
                fontSize: 22,
                color: INK_FAINT,
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              {stats.memberSince ? `Member since ${stats.memberSince}` : "Rotaract Member"}
            </div>
            <div
              style={{
                fontFamily: display,
                fontSize: 30,
                color: BRAND,
              }}
            >
              THADAM
            </div>
          </div>
        </div>
      </div>
  );

  try {
    const image = new ImageResponse(element, {
      width: 1080,
      height: 1350,
      fonts: fonts.length ? (fonts as any) : undefined,
    });

    // Buffer the PNG rather than returning ImageResponse's ReadableStream.
    // The dev server (Node 25 + Next 16) fails to pipe streamed responses
    // ("failed to pipe response / not iterable"); a buffered Response avoids it.
    const buf = await image.arrayBuffer();

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-cache, must-revalidate",
    };
    if (new URL(req.url).searchParams.get("dl") === "1") {
      const safe = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      headers["Content-Disposition"] = `attachment; filename="${safe}-passport.png"`;
    }

    return new Response(buf, { headers });
  } catch (err) {
    // Surface the real reason instead of the opaque pipe error.
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error("[passport] image generation failed:", message);
    return new Response(`Passport render failed — ${message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
