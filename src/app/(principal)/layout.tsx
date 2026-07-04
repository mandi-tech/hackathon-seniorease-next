import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "../../styles/globals.css";
import { getDynamicThemeStyles } from "../../styles/theme";
import Navbar from "@/src/components/ui/Navbar";
import AntdThemeProvider from "@/src/styles/AntdThemeProvider";
import { AuthProvider } from "@/src/contexts/AuthContext";

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "SeniorEase",
  description: "Facilitando o dia a dia do idoso",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className={`${atkinson.variable}  h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: getDynamicThemeStyles() }} />
      </head>
      <AuthProvider>
        <AntdThemeProvider>
          <body className="min-h-full flex flex-col">
            <Navbar />
            <section className="flex justify-center w-full mt-8">
              <div className="w-[90%] xl:w-[80%] mb-8">{children}</div>
            </section>
          </body>
        </AntdThemeProvider>
      </AuthProvider>
    </html>
  );
}

