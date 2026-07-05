import { cookies } from "next/headers";

const SECRET_KEY = process.env.SESSION_SECRET || "default-session-secret-key-32-chars-long";

async function getSigningKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signJWT(payload: any) {
  const header = { alg: "HS256", typ: "JWT" };
  const enc = new TextEncoder();
  
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const encodedPayload = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 })).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const key = await getSigningKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureString = signatureArray.map(b => String.fromCharCode(b)).join("");
  const encodedSignature = btoa(signatureString).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    
    const key = await getSigningKey();
    const enc = new TextEncoder();
    
    const sigString = atob(signature.replace(/-/g, "+").replace(/_/g, "/"));
    const sigBytes = new Uint8Array(sigString.length);
    for (let i = 0; i < sigString.length; i++) {
      sigBytes[i] = sigString.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(`${header}.${payload}`)
    );
    
    if (!isValid) return null;
    
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decodedPayload;
  } catch (e) {
    return null;
  }
}

export async function setSession(user: { id: string; email: string; name: string; roles: string[] }) {
  const token = await signJWT(user);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;
  return verifyJWT(sessionCookie);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export function hasRole(session: any, roles: string[]) {
  if (!session || !session.roles || !Array.isArray(session.roles)) return false;
  return session.roles.some((r: string) => roles.includes(r));
}

export function adminOnly(session: any) {
  return hasRole(session, ["ADMIN", "CLUB_ADMIN"]);
}

export function financeAdminOnly(session: any) {
  return hasRole(session, ["ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"]);
}
