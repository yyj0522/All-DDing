'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { supabase } from '@/lib/supabase';

export default function NotePage() {
  const [releaseNotes, setReleaseNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from('release_notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setReleaseNotes(data);
      }
      setIsLoading(false);
    };

    fetchNotes();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100 to-transparent dark:from-indigo-900/20 dark:to-transparent rounded-full blur-[120px] pointer-events-none opacity-60 transition-colors duration-300"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-[900px] w-full mx-auto px-4 sm:px-6 pt-32 md:pt-40 pb-24 md:pb-32">
        <div className="mb-16 md:mb-24 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 transition-colors">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 transition-colors">
              업데이트 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-400">노트</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg tracking-tight max-w-xl break-keep transition-colors font-medium">
              올띵의 새로운 기능 추가, 개선 사항 및 버그 수정 내역을 가장 먼저 확인하세요.
            </p>
          </div>
        </div>

        <section className="relative">
          {isLoading ? (
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6 md:gap-10 animate-pulse">
                  <div className="hidden md:flex flex-col items-center">
                    <div className="w-3 h-3 bg-gray-200 dark:bg-gray-800 rounded-full mt-2"></div>
                    <div className="w-[1px] h-full bg-gray-200 dark:bg-gray-800 my-2"></div>
                  </div>
                  <div className="flex-1 bg-white dark:bg-[#111111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8 h-32"></div>
                </div>
              ))}
            </div>
          ) : releaseNotes.length === 0 ? (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-[2rem] text-center py-24 flex flex-col items-center transition-colors shadow-sm">
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
              </div>
              <span className="text-gray-900 dark:text-white font-black text-xl mb-2">등록된 내역이 없습니다</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium text-sm">새로운 업데이트 노트가 곧 추가될 예정입니다.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-6 md:gap-10 relative">
              <div className="hidden md:block absolute left-[5.5px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-indigo-500 via-gray-200 to-transparent dark:via-gray-800 rounded-full"></div>
              
              {releaseNotes.map((note, index) => {
                const isLatest = index === 0;
                const noteDate = new Date(note.created_at);
                const dateStr = noteDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

                return (
                  <div key={note.id} className="flex gap-4 md:gap-10 relative group">
                    <div className="hidden md:flex flex-col items-center z-10 pt-6">
                      <div className={`w-3.5 h-3.5 rounded-full border-4 transition-colors duration-300 ${isLatest ? 'bg-white border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]' : 'bg-gray-100 border-gray-300 dark:bg-black dark:border-gray-700 group-hover:border-indigo-400'}`}></div>
                    </div>
                    
                    <Link 
                      href={`/note/${note.id}`} 
                      className="flex-1 bg-white dark:bg-[#0c0c0e] border border-gray-200 dark:border-white/5 rounded-[2rem] p-6 md:p-10 shadow-sm hover:shadow-xl dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 block"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <span className={`font-black text-[11px] md:text-xs px-3 py-1.5 rounded-xl tracking-widest uppercase shadow-sm ${isLatest ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'}`}>
                            {note.version}
                          </span>
                          {isLatest && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-200 dark:border-transparent">Latest</span>
                          )}
                        </div>
                        <span className="text-gray-500 dark:text-gray-500 text-xs md:text-sm font-bold font-mono bg-gray-50 dark:bg-[#111111] px-3 py-1.5 rounded-lg border border-gray-100 dark:border-white/5 w-fit">
                          {dateStr}
                        </span>
                      </div>
                      
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors tracking-tight leading-snug mb-3">
                        {note.title}
                      </h2>
                      
                      <div className="text-gray-600 dark:text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed opacity-90">
                        {note.content?.replace(/[#*`_]/g, '') || "업데이트 상세 내용을 확인하려면 클릭하세요."}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}