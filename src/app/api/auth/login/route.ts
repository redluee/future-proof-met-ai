import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, getAdminUsername, SESSION_COOKIE_NAME } from "@/lib/auth";

// In-memory rate limiting map: ip -> { count, resetTime }
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const attempts = loginAttempts.get(ip);

    if (attempts && attempts.resetTime > now) {
      if (attempts.count >= MAX_ATTEMPTS) {
        const remainingSec = Math.ceil((attempts.resetTime - now) / 1000);
        return NextResponse.json(
          { error: `Te veel mislukte pogingen. Probeer opnieuw over ${Math.ceil(remainingSec / 60)} minuten.` },
          { status: 429 }
        );
      }
    } else if (attempts && attempts.resetTime <= now) {
      loginAttempts.delete(ip);
    }

    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Gebruikersnaam en wachtwoord vereist" }, { status: 400 });
    }

    if (!checkCredentials(username, password)) {
      // Record failed attempt
      const current = loginAttempts.get(ip) || { count: 0, resetTime: now + LOCKOUT_WINDOW_MS };
      current.count += 1;
      current.resetTime = now + LOCKOUT_WINDOW_MS;
      loginAttempts.set(ip, current);

      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
    }

    // Reset rate limit on successful login
    loginAttempts.delete(ip);

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, username: getAdminUsername() });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Serverfout bij inloggen" }, { status: 500 });
  }
}
