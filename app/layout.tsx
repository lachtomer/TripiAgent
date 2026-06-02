import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import BottomNav from "@/components/BottomNav";
import TopAppBar from "@/components/TopAppBar";
import Toast from "@/components/Toast";
import DynamicDirectionHandler from "@/components/DynamicDirectionHandler";
import AuthGate from "@/components/AuthGate";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TripiAgent",
  description: "Your smart personal travel PWA guide for Italy",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TripiAgent",
  },
};

export const viewport: Viewport = {
  themeColor: "#006400",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex justify-center bg-zinc-100 dark:bg-zinc-950">
        {/* Responsive Viewport Container */}
        <div className="relative w-full max-w-[390px] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen bg-background border-x border-border flex flex-col pb-20">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DynamicDirectionHandler />
            <Toast />
            <AuthGate>
              <TopAppBar />
              <main className="flex-1 flex flex-col">{children}</main>
              <BottomNav />
            </AuthGate>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
