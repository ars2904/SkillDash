
'use client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useUserStore } from '@/store/useUserStore';

export default function NotificationHandler() {
  const { user } = useUserStore();

  useEffect(() => {
    if (!user?.id) return;

    const checkNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/notifications/${user.id}`);
        const data = await res.json();

        data.forEach((notif: any) => {
          // Trigger the Sonner Toast
          toast(notif.type.toUpperCase(), {
            description: notif.content,
            duration: 4000,
          });
        });
      } catch (err) {
        console.error("Failed to sync notifications", err);
      }
    };

    const interval = setInterval(checkNotifications, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [user?.id]);

  return null; 
}