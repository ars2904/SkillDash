'use client';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { Zap, Target, Briefcase, Calendar, AlertTriangle, X, Plus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export default function JobForm() {
  const { user } = useUserStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expReward, setExpReward] = useState('5');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [category, setCategory] = useState('Development');
  const [urgency, setUrgency] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [skillsRequired, setSkillsRequired] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [categories, setCategories] = useState<string[]>(['Development', 'Design', 'Writing', 'Marketing', 'Data', 'DevOps', 'Mobile', 'AI/ML', 'Other']);
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skillsRequired.includes(newSkill.trim()) && skillsRequired.length < 10) {
      setSkillsRequired([...skillsRequired, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkillsRequired(skillsRequired.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Authentication Error", { description: "You must be logged in." });
      return;
    }

    setLoading(true);

    const jobData = {
      client_id: user.id,
      title,
      description,
      exp_reward: parseInt(expReward),
      category,
      budget_amount: budgetAmount ? parseFloat(budgetAmount) : null,
      deadline: deadline ? deadline : null,
      urgency,
      skills_required: skillsRequired.length > 0 ? skillsRequired.join(', ') : null
    };

    try {
      await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData),
      });

      toast.success("Mission Deployed!", { description: "Your task has been added to the feed." });
      setTitle('');
      setExpReward('5');
      setDescription('');
      setBudgetAmount('');
      setCategory('Development');
      setUrgency('medium');
      setDeadline('');
      setSkillsRequired([]);
    } catch (err: any) {
      toast.error("Deployment Failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-[#0a0a0a] border border-white/5 rounded-3xl space-y-6 animate-in slide-in-from-top-2 duration-500">
      
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Briefcase className="text-orange-500" size={24} />
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Deploy New Mission</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Project Title</label>
          <input 
            type="text" 
            placeholder="e.g., Integrate Auth Handshake" 
            className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Category</label>
          <select 
            className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm cursor-pointer appearance-none"
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Urgency</label>
          <select 
            className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm cursor-pointer appearance-none"
            value={urgency} 
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Experience Reward (EXP)</label>
          <div className="relative">
            <select 
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-orange-500 font-bold outline-none appearance-none focus:border-orange-500 cursor-pointer text-sm"
              value={expReward} 
              onChange={(e) => setExpReward(e.target.value)}
            >
              {[5, 10, 15, 25, 50, 100].map(val => (
                <option key={val} value={val}>{val} EXP</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
              <Target size={14} />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Budget Amount ($)</label>
          <input 
            type="number" 
            placeholder="Optional budget..." 
            className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm"
            value={budgetAmount} 
            onChange={(e) => setBudgetAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Deadline</label>
          <div className="relative">
            <input 
              type="date" 
              className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm appearance-none"
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
              <Calendar size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Required Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {skillsRequired.map(skill => (
            <span key={skill} className="flex items-center gap-1 bg-white/5 border border-white/10 text-xs font-bold text-gray-300 px-3 py-1.5 rounded-lg">
              {skill}
              <X size={12} className="cursor-pointer hover:text-red-400 ml-1" onClick={() => removeSkill(skill)} />
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Add a required skill..." 
            className="flex-1 p-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 transition-all text-sm"
            value={newSkill} 
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Technical Briefing</label>
        <textarea 
          placeholder="Detail the project requirements and expected outcome..." 
          className="w-full p-4 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-orange-500 h-32 resize-none text-sm leading-relaxed"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <button 
        disabled={loading}
        className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-orange-500 hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 tracking-tighter"
      >
        <Zap size={16} fill="currentColor" />
        {loading ? "INITIALIZING..." : "DEPLOY TASK TO FEED"}
      </button>
    </form>
  );
}