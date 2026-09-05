import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "DoConBoshqar — Do'koningizni oson boshqaring",
  description: "Mahsulotlar, sotuvlar, ombor, xarajatlar va foydani bitta tizimda boshqaring.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
