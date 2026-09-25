import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EventMart",
  description: "EventMart electronics store",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <AuthProvider>
        <body className="min-h-full flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
            }}
          />
        </body>
      </AuthProvider>
    </html>
  );
}
