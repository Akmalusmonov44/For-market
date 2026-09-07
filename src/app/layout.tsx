import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { LanguageProvider } from "@/components/i18n/LanguageContext";

export const metadata: Metadata = {
  title: "DoConBoshqar — Do'koningizni oson boshqaring",
  description: "Mahsulotlar, sotuvlar, ombor, xarajatlar va foydani bitta tizimda boshqaring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <LanguageProvider>
          <ToastProvider>{children}</ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
