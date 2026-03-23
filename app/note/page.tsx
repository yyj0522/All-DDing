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
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 pt-32 pb-20">
        <div className="mb-10 transition-colors">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 transition-colors">패치노트</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base transition-colors">올띵의 새로운 기능 업데이트 및 버그 수정 내역을 확인하세요.</p>
        </div>

        <section className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-2xl transition-colors">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500 transition-colors">불러오는 중...</div>
          ) : (
            <div className="space-y-6">
              {releaseNotes.map(note => (
                <div key={note.id} className="group flex flex-col md:flex-row md:items-center gap-4 border-b border-gray-200 dark:border-white/5 pb-6 last:border-0 last:pb-0 transition-colors">
                  <div className="flex-shrink-0">
                    <span className="inline-block text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 rounded-lg shadow-sm dark:shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-colors">
                      {note.version}
                    </span>
                  </div>
                  <Link href={`/note/${note.id}`} className="flex-1 text-gray-800 dark:text-gray-200 text-base md:text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-white group-hover:underline underline-offset-4 decoration-indigo-400/50 dark:decoration-indigo-500/50 transition-all">
                    {note.title}
                  </Link>
                  <div className="flex-shrink-0 text-gray-500 dark:text-gray-500 text-sm font-mono transition-colors">
                    {new Date(note.created_at).toISOString().split('T')[0]}
                  </div>
                </div>
              ))}
              {releaseNotes.length === 0 && (
                <div className="text-center py-10 text-gray-500 transition-colors">등록된 패치노트가 없습니다.</div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}