import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import StarField from "@/components/StarField";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });
const handelGothic = localFont({
  src: "./fonts/HandelGothicDBold.woff",
  variable: "--font-handel-gothic",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Twilight Imperium Timer",
  description: "Keep track of who's taking too long!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body
        className={`relative ${handelGothic.variable} antialiased`}
      >
        <StarField />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
