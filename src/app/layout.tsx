import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-context";
import { NavHeader } from "@/components/nav-header";
import { MinorSubnav } from "@/components/subnav";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Minor Portfolio - Steven Heijn",
  description: "Portfolio voor de HBO-ICT Minor van Steven Heijn",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="nl" className="dark">
      <body className="min-h-screen flex flex-col bg-black text-white antialiased">
        <AuthProvider initialAuth={session.isAuthenticated} initialUsername={session.username}>
          <NavHeader />
          <MinorSubnav />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
