import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minor Portfolio - Steven Heijn",
  description: "Leeruitkomsten, stories en bewijsmateriaal per sprint van de HBO-ICT Minor van Steven Heijn",
  icons: {
    icon: "/favicon.svg",
  },
};

// Runs before first paint so a saved light theme does not flash dark.
const THEME_SCRIPT = `try{if(localStorage.getItem("theme")==="light"){var d=document.documentElement;d.classList.remove("dark");d.classList.add("light");d.dataset.themeTarget="light"}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark" data-theme-target="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div id="page">{children}</div>
        <ThemeToggle />
      </body>
    </html>
  );
}
