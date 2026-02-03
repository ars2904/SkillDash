// app/layout.tsx

'use client';
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";
import { Toaster } from 'sonner';
import NotificationHandler from "@/components/NotificationHandler"; // We'll create this below

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {/* The Handler sits here invisibly and listens for SQL updates */}
        <NotificationHandler /> 
        
        {/* The Toaster is the container that actually draws the popups */}
        <Toaster theme="dark" position="bottom-right" richColors closeButton />

        <div className="flex">
          {!isAuthPage && <Sidebar />}
          <main className={`flex-1 min-h-screen p-8 ${!isAuthPage ? 'ml-64' : ''}`}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}