import { cookies } from "next/headers";

const ADMIN_USERNAME = "Steven";
const ADMIN_PASSWORD = "Duimpie2.0";
const SESSION_COOKIE_NAME = "minor_session";
const SESSION_TOKEN = "steven_minor_authenticated_session_token_2026";

export function checkCredentials(user: string, pass: string): boolean {
  return (
    user.trim().toLowerCase() === ADMIN_USERNAME.toLowerCase() &&
    pass === ADMIN_PASSWORD
  );
}

export async function getSession(): Promise<{ isAuthenticated: boolean; username: string | null }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (sessionCookie && sessionCookie.value === SESSION_TOKEN) {
      return { isAuthenticated: true, username: ADMIN_USERNAME };
    }
  } catch {
    // If cookies() is called outside request context
  }
  return { isAuthenticated: false, username: null };
}

export async function requireAuth(): Promise<boolean> {
  const session = await getSession();
  return session.isAuthenticated;
}

export { SESSION_COOKIE_NAME, SESSION_TOKEN, ADMIN_USERNAME };
