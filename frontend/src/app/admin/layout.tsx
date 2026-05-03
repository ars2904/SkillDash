'use client';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.is_admin !== 1) {
      toast.error('Access denied', { description: 'Admin clearance required.' });
      router.push('/');
      return;
    }
    setChecked(true);
  }, [user, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Verifying Clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#030303]">
      <AdminSidebar />
      <main className="flex-1 ml-72 p-8 text-white">
        {children}
      </main>
    </div>
  );
}
