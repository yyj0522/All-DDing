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
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-white/20 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-[1000px] w-full mx-auto px-4 pt-28 md:pt-40 pb-24 md:pb-20">
        <div className="mb-8 text-center w-full px-2 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-3 transition-colors">
            업데이트 <span className="text-indigo-600 dark:text-indigo-500 transition-colors">노트</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-base tracking-wide max-w-xl mx-auto break-keep opacity-80 transition-colors">
            올띵의 새로운 기능 업데이트 및 버그 수정 내역을 확인하세요.
          </p>
        </div>

        <section className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-10 shadow-md dark:shadow-2xl transition-colors">
          {isLoading ? (
            <div className="text-center py-20 flex flex-col items-center gap-4 transition-colors">
              <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="text-gray-500 font-bold text-sm">불러오는 중...</span>
            </div>
          ) : (
            <div className="flex flex-col">
              {releaseNotes.map(note => (
                <Link 
                  href={`/note/${note.id}`} 
                  key={note.id} 
                  className="group flex flex-col md:flex-row md:items-center gap-3 md:gap-6 border-b border-gray-200 dark:border-white/5 py-5 md:py-6 first:pt-2 last:border-0 last:pb-2 hover:bg-gray-50 dark:hover:bg-[#111113] rounded-2xl -mx-4 px-4 transition-all duration-300"
                >
                  <div className="flex-shrink-0">
                    <span className="inline-block text-indigo-700 dark:text-indigo-400 font-black text-[11px] md:text-xs border border-indigo-200 dark:border-transparent bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1.5 rounded-lg shadow-sm dark:shadow-none tracking-widest transition-colors">
                      {note.version}
                    </span>
                  </div>
                  <div className="flex-1 text-gray-900 dark:text-gray-100 text-base md:text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {note.title}
                  </div>
                  <div className="flex-shrink-0 text-gray-500 dark:text-gray-500 text-[11px] md:text-sm font-bold font-mono transition-colors">
                    {new Date(note.created_at).toISOString().split('T')[0]}
                  </div>
                </Link>
              ))}
              {releaseNotes.length === 0 && (
                <div className="text-center py-16 flex flex-col items-center transition-colors">
                  <svg className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" /></svg>
                  <span className="text-gray-500 dark:text-gray-400 font-bold">등록된 패치노트가 없습니다.</span>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}