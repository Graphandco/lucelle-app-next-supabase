// import { ThemeSwitcher } from "@/components/theme-switcher";
import { Geist, Anton } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/header/Header";
import Image from "next/image";

const defaultUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Lucelle App",
  description: "Application de gestion des tâches de la vie quotidienne",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});
const antonSans = Anton({
  display: "swap",
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${antonSans.variable} ${geistSans.className}`} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-5 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5">
                  <div className="flex gap-3 items-center text-xl font-anton">
                    <Link href={"/"}>
                      <Image
                        src="/logo.png"
                        alt="Lucelle App"
                        width={40}
                        height={40}
                        // className="rounded-xl"
                        priority
                        sizes="(max-width: 640px) 100vw, 400px"
                      />
                    </Link>
                    <div className="font-anton">Lucelle'App</div>
                  </div>
                  <Header />
                </div>
              </nav>
              <div className="container flex flex-col gap-20 p-5">{children}</div>
              <Toaster />

              {/* <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>
                  Powered by{" "}
                  <a
                    href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer">
                    Supabase
                  </a>
                </p>
                <ThemeSwitcher />
              </footer> */}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
