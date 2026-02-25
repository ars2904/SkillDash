'use client';
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from 'sonner';
import NotificationHandler from "@/components/NotificationHandler";
import SystemBriefing from "@/components/SystemBriefing";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('ROOT LAYOUT RENDER');
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register'; // ← UPDATED

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {/* Show briefing when they land on login (first visit) */}
        {pathname === '/login' && <SystemBriefing />}
        
        <NotificationHandler />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />

        <div className="flex">
          {!isAuthPage && <Sidebar />} {/* ← UPDATED */}
          <main className={`flex-1 min-h-screen p-8 ${!isAuthPage ? 'ml-64' : ''}`}> {/* ← UPDATED */}
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}