'use client';
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Briefcase, Users, MessageSquare } from 'lucide-react';

// Import the new external components
import PrivateChat from '@/components/PrivateChat';
import JobCard from '@/components/JobCard';
import ConnectionRequestCard from '@/components/ConnectionRequestCard';
import { CardSkeleton, Skeleton } from '@/components/Skeleton';

export default function ClientJobManager() {
  const [myJobs, setMyJobs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Added missing state
  const { user } = useUserStore();

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetching all data in parallel
      const [jobRes, reqRes, friendsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?client_id=${user.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/pending/${user.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/friends/${user.id}`)
      ]);
      
      setMyJobs(await jobRes.json());
      setRequests(await reqRes.json());
      setFriends(await friendsRes.json());
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally {
      setIsLoading(false); // Stop loading after fetch
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (selectedFriend) {
    return (
      <PrivateChat 
        connection={selectedFriend} 
        currentUser={user} 
        onBack={() => setSelectedFriend(null)} 
      />
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* 1. Pending Requests Section */}
      {!isLoading && requests.length > 0 && (
        <section>
          <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
            <Users size={14} /> Incoming Requests
          </h2>
          {requests.map((req: any) => (
            <ConnectionRequestCard key={req.connection_id} req={req} onRefresh={fetchData} />
          ))}
        </section>
      )}

      {/* 2. Active Friends Section */}
      <section>
        <h2 className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
          <MessageSquare size={14} /> Active Connections
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : friends.length === 0 ? (
            <div className="col-span-full p-10 border border-dashed border-gray-900 rounded-3xl text-center">
              <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest">No active connections found.</p>
            </div>
          ) : (
            friends.map((f: any) => (
              <button 
                key={f.id} 
                onClick={() => setSelectedFriend(f)} 
                className="p-5 bg-[#0a0a0a] border border-gray-900 rounded-[1.5rem] flex items-center gap-4 hover:border-orange-500 transition-all text-left group"
              >
                <div className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center font-black text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-all">
                  {f.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-black uppercase">{f.username}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Open Chat</p>
                </div>
              </button>
            ))
          )}
        </div>
      </section>

      {/* 3. Project Management Section */}
      <section>
        <h2 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
          <Briefcase size={14} /> Project Management
        </h2>
        
        <div className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-32 w-full rounded-[2rem]" />
          ) : myJobs.length === 0 ? (
            <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest pl-2">No active projects.</p>
          ) : (
            myJobs.map((job: any) => <JobCard key={job.id} job={job} onRefresh={fetchData} />)
          )}
        </div>
      </section>
    </div>
  );
}