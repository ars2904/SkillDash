'use client';
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define pages that SHOULD NOT have a sidebar
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
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