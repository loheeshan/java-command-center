import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Java Command Center", template: "%s · Java Command Center" },
  description: "Interactive Java, OOP & Spring Boot preparation for the 5COSC019W Lab-Based Practical.",
};

export const viewport: Viewport = { themeColor: "#0b0f17", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
