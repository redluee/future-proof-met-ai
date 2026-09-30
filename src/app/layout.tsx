import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minor Portfolio - Steven Heijn",
  description: "Leeruitkomsten, stories en bewijsmateriaal per sprint van de HBO-ICT Minor van Steven Heijn",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">{children}</body>
    </html>
  );
}
