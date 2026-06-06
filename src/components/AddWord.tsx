import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { addWord } from '../lib/api';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { Word } from '../types';

export default function AddWord() {
  const [inputWord, setInputWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedWord, setAddedWord] = useState<Word | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWord.trim()) return;
    
    setIsSubmitting(true);
    setAddedWord(null);
    try {
      const result = await addWord(inputWord.trim());
      setAddedWord(result);
      setInputWord('');
    } catch (error) {
      console.error(error);
      alert('Failed to process word. Ensure AI credits and valid English word.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 mb-8"
        >
          <Brain className="h-8 w-8" />
        </motion.div>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Smart Input</h1>
        <p className="text-slate-500 mb-8 font-medium">Enter a single English word. AI will handle the rest.</p>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
          <div className="relative flex p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="e.g. ubiquitous"
              disabled={isSubmitting}
              className="w-full bg-transparent px-4 py-3 text-lg font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputWord.trim()}
              className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {addedWord && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900 flex items-center space-x-3">
                  <span>{addedWord.word}</span>
                  {addedWord.level && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-widest">
                      {addedWord.level}
                    </span>
                  )}
                </h3>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold uppercase tracking-wider">
                  {addedWord.partOfSpeech}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Translation</div>
                  <div className="text-lg font-semibold text-slate-800">{addedWord.translation}</div>
                </div>
                
                {addedWord.synonyms && addedWord.synonyms.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Synonyms</div>
                    <div className="flex flex-wrap gap-2">
                      {addedWord.synonyms.map((s, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Context</div>
                  <div className="text-slate-600 italic border-l-4 border-indigo-200 pl-4 py-1">
                    "{addedWord.example}"
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
