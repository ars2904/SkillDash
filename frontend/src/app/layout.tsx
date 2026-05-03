'use client';
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from 'sonner';
import NotificationHandler from "@/components/NotificationHandler";
import SystemBriefing from "@/components/SystemBriefing";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <title>SkillDash — Freelance Platform</title>
        <meta name="description" content="SkillDash: A gamified freelance platform connecting clients and experts." />
      </head>
      <body className="bg-black text-white antialiased">
        {pathname === '/login' && <SystemBriefing />}

        <NotificationHandler />
        <Toaster theme="dark" position="bottom-right" richColors closeButton />

        <div className="flex">
          {/* Hide sidebar on auth pages and admin pages (admin has its own sidebar) */}
          {!isAuthPage && !isAdminPage && <Sidebar />}
          <main className={`flex-1 min-h-screen ${!isAuthPage && !isAdminPage ? 'ml-64 p-8' : isAdminPage ? '' : 'p-8'}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}