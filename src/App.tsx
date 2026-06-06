/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import AddWord from './components/AddWord';
import ReviewQuiz from './components/ReviewQuiz';
import StatsView from './components/StatsView';
import { BookOpen, Zap, BarChart2 } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'learn' | 'quiz' | 'stats';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('learn');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-200">
      {/* Top Navigation */}
      <header className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              V
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">VocabBlitz</span>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-xl">
            <NavButton 
              active={activeTab === 'learn'} 
              onClick={() => setActiveTab('learn')}
              icon={<BookOpen className="w-4 h-4" />}
              label="Learn"
            />
            <NavButton 
              active={activeTab === 'quiz'} 
              onClick={() => setActiveTab('quiz')}
              icon={<Zap className="w-4 h-4" />}
              label="Quiz"
            />
            <NavButton 
              active={activeTab === 'stats'} 
              onClick={() => setActiveTab('stats')}
              icon={<BarChart2 className="w-4 h-4" />}
              label="Stats"
            />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 max-w-5xl mx-auto px-4">
        {activeTab === 'learn' && <AddWord />}
        {activeTab === 'quiz' && <ReviewQuiz />}
        {activeTab === 'stats' && <StatsView />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200",
        active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
