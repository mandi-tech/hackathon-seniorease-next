import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "../../styles/globals.css";
import { getDynamicThemeStyles } from "../../styles/theme";
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
    <html
      lang="pt-br"
      className={`${atkinson.variable}  h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: getDynamicThemeStyles() }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

