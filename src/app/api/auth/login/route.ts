import { NextResponse } from "next/server";
import { checkCredentials, SESSION_COOKIE_NAME, SESSION_TOKEN, ADMIN_USERNAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Gebruikersnaam en wachtwoord vereist" }, { status: 400 });
    }

    if (!checkCredentials(username, password)) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username: ADMIN_USERNAME });
    response.cookies.set(SESSION_COOKIE_NAME, SESSION_TOKEN, {
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
