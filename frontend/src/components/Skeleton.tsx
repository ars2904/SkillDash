'use client';

// A basic shimmering block
export function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-gray-900/50 rounded-xl ${className}`} />
  );
}

// A specific skeleton that matches your Connection Cards
export function CardSkeleton() {
  return (
    <div className="p-5 bg-[#0a0a0a] border border-gray-900 rounded-[1.5rem] flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-2 w-1/4" />
      </div>
    </div>
  );
}