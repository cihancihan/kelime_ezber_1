import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getDueReviews, submitReview } from '../lib/api';
import { Word } from '../types';
import { Flame, Clock, Trophy, Frown, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ReviewQuiz() {
  const [queue, setQueue] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5000); // 5 seconds in ms
  const [options, setOptions] = useState<{ text: string, isCorrect: boolean }[]>([]);
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong' | 'timeout'>('idle');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  const currentWord = queue[currentIndex];

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const due = await getDueReviews();
      setQueue(due);
      setCurrentIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentWord && answerState === 'idle') {
      const allOpts = [
        { text: currentWord.translation, isCorrect: true },
        ...currentWord.distractors.slice(0, 3).map(d => ({ text: d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);
      
      setOptions(allOpts);
      
      const TIME_LIMIT = 5000;
      setTimeLeft(TIME_LIMIT);
      lastTickRef.current = Date.now();
      
      const tick = () => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        
        setTimeLeft(prev => {
          const next = prev - delta;
          if (next <= 0) {
            handleTimeout();
            return 0;
          }
          timerRef.current = requestAnimationFrame(tick);
          return next;
        });
      };
      timerRef.current = requestAnimationFrame(tick);
      
      return () => {
        if (timerRef.current) cancelAnimationFrame(timerRef.current);
      };
    }
  }, [currentWord, currentIndex, answerState]);

  const handleTimeout = async () => {
    if (answerState !== 'idle') return;
    setAnswerState('timeout');
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    
    // Submit review as incorrect
    if (currentWord) {
      await submitReview(currentWord.id, false);
    }
    
    setTimeout(nextQuestion, 1500);
  };

  const handleSelect = async (opt: {text: string, isCorrect: boolean}) => {
    if (answerState !== 'idle') return;
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    
    setSelectedOption(opt.text);
    const correct = opt.isCorrect;
    setAnswerState(correct ? 'correct' : 'wrong');
    
    if (currentWord) {
      await submitReview(currentWord.id, correct);
    }
    
    setTimeout(nextQuestion, 1500);
  };

  const nextQuestion = () => {
    setAnswerState('idle');
    setSelectedOption(null);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }} className="text-indigo-500">
          <Clock className="w-12 h-12" />
        </motion.div>
      </div>
    );
  }

  if (queue.length === 0 || currentIndex >= queue.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500 mb-6">
            <Trophy className="h-12 w-12" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4">All Caught Up!</h2>
          <p className="text-lg text-slate-500 font-medium mb-8">You've finished your reviews for now.</p>
          <button 
            onClick={fetchQueue}
            className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition active:scale-95"
          >
            Check Again
          </button>
        </motion.div>
      </div>
    );
  }

  const isCritical = timeLeft < 2000;
  // Dynamic color shift based on time left
  const timerColor = isCritical ? 'bg-red-500' : 'bg-indigo-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 w-full">
      <div className="w-full max-w-lg">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center space-x-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full font-bold">
            <Flame className="w-5 h-5" />
            <span>Streak {currentWord.streak}</span>
          </div>
          <div className="text-slate-400 font-bold tracking-widest text-sm">
            {currentIndex + 1} / {queue.length}
          </div>
        </div>

        {/* Quiz Canvas */}
        <motion.div 
          key={currentWord.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ x: answerState === 'wrong' || answerState === 'timeout' ? [-10, 10, -10, 10, 0] : 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "relative bg-white rounded-[2rem] shadow-2xl p-8 overflow-hidden border-4 transition-colors duration-300",
            answerState === 'correct' ? "border-green-400 shadow-green-200" : 
            answerState === 'wrong' ? "border-red-400 shadow-red-200" : 
            answerState === 'timeout' ? "border-orange-400 shadow-orange-200" : 
            "border-transparent shadow-slate-200/50"
          )}
        >
          {/* Active Timer Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100 overflow-hidden">
             <motion.div 
               className={cn("h-full transition-colors", timerColor)}
               style={{ width: `${(timeLeft / 5000) * 100}%` }}
               animate={{ backgroundColor: isCritical ? "#ef4444" : "#6366f1" }}
             />
          </div>

          <div className="text-center my-12">
            <h2 className="text-5xl font-black tracking-tight text-slate-900 mb-4 flex items-center justify-center space-x-3">
              <span>{currentWord.word}</span>
              {currentWord.level && (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold uppercase tracking-widest align-middle">
                  {currentWord.level}
                </span>
              )}
            </h2>
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400">{currentWord.partOfSpeech}</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {options.map((opt, i) => {
                const isSelected = selectedOption === opt.text;
                let btnStateClass = "bg-slate-50 border-2 border-slate-100 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50";
                
                if (answerState !== 'idle') {
                  if (opt.isCorrect) {
                     btnStateClass = "bg-green-500 border-green-600 text-white shadow-lg shadow-green-500/30 scale-105 z-10";
                  } else if (isSelected && !opt.isCorrect) {
                     btnStateClass = "bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30";
                  } else {
                     btnStateClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
                  }
                }

                return (
                  <motion.button
                    key={opt.text}
                    onClick={() => handleSelect(opt)}
                    disabled={answerState !== 'idle'}
                    whileHover={answerState === 'idle' ? { scale: 1.02 } : {}}
                    whileTap={answerState === 'idle' ? { scale: 0.98 } : {}}
                    className={cn(
                      "relative w-full p-5 rounded-2xl font-bold text-lg transition-all duration-200 text-left cursor-pointer",
                      btnStateClass
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt.text}</span>
                      {answerState !== 'idle' && opt.isCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {answerState !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-x-0 bottom-0 p-6 flex justify-center pointer-events-none"
              >
                <div className={cn(
                  "px-6 py-3 rounded-xl font-black text-white text-xl uppercase tracking-widest shadow-xl",
                  answerState === 'correct' ? "bg-green-500" : 
                  answerState === 'wrong' ? "bg-red-500" : "bg-orange-500"
                )}>
                  {answerState === 'correct' ? 'Perfect!' : 
                   answerState === 'wrong' ? 'Incorrect' : 'Time Up!'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
        
        {/* Helper Context (shows after answer) */}
        <AnimatePresence>
           {answerState !== 'idle' && (
             <motion.div
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               className="mt-6 p-6 bg-slate-900 text-slate-300 rounded-2xl text-center"
             >
               <div className="text-white font-semibold mb-2">Example</div>
               <div className="italic">"{currentWord.example}"</div>
             </motion.div>
           )}
        </AnimatePresence>

      </div>
    </div>
  );
}
