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
  const isLoginPage = pathname === '/login';  // ← YOUR HOMEPAGE!

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {/* Show briefing when they land on login (first visit) */}
        {isLoginPage && <SystemBriefing />}
        
        <NotificationHandler />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />

        <div className="flex">
          {pathname !== '/login' && <Sidebar />}
          <main className={`flex-1 min-h-screen p-8 ${pathname !== '/login' ? 'ml-64' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
