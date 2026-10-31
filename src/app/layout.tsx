import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/store/ReduxProvider";
import { AffiliateTracker } from "@/components/global/affiliate/affiliate-tracker";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PASLEARN | Home",
  description: "Course Hub for teachers and students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AffiliateTracker />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
