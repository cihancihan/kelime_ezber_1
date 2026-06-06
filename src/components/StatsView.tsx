import { useEffect, useState } from 'react';
import { getStats } from '../lib/api';
import { Stats } from '../types';
import { motion } from 'motion/react';
import { Database, Clock, Zap } from 'lucide-react';

export default function StatsView() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 font-sans">Your Progress</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
          >
            <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl mb-4">
              <Database className="w-8 h-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">{stats.totalWords}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Words</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center text-center ring-2 ring-indigo-500 ring-offset-2"
          >
            <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">{stats.dueReviews}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Due for Review</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center text-center"
          >
            <div className="p-4 bg-green-50 text-green-500 rounded-2xl mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <div className="text-4xl font-black text-slate-900 mb-1">{stats.totalLearned}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mastered</div>
          </motion.div>
        </div>

        {Object.keys(stats.levels || {}).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50"
          >
            <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-6 text-center">Words by CEFR Level</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => {
                const count = stats.levels?.[level];
                if (!count) return null;
                return (
                  <div key={level} className="flex flex-col items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 min-w-[80px]">
                    <div className="text-2xl font-black text-indigo-600 mb-1">{level}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{count} {count === 1 ? 'word' : 'words'}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
