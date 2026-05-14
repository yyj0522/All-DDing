'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const runtime = 'edge';

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoteDetail = async () => {
      if (!params.id) return;

      const { data, error } = await supabase
        .from('release_notes')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (data && !error) {
        setNote(data);
      }
      setIsLoading(false);
    };

    fetchNoteDetail();
  }, [params.id]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-indigo-500/30 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 dark:to-transparent pointer-events-none transition-colors duration-300"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-[860px] w-full mx-auto px-4 sm:px-6 pt-32 md:pt-40 pb-24 md:pb-32">
        <button 
          onClick={() => router.push('/note')}
          className="group flex items-center gap-2.5 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300 mb-10 text-xs font-black w-fit tracking-wide"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          업데이트 목록
        </button>

        {isLoading ? (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10 md:p-16 shadow-lg flex flex-col items-center justify-center min-h-[50vh] transition-colors">
            <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <span className="text-gray-500 dark:text-gray-400 font-bold tracking-tight">노트 데이터를 불러오는 중입니다</span>
          </div>
        ) : !note ? (
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-[2.5rem] p-10 md:p-16 shadow-lg flex flex-col items-center justify-center min-h-[50vh] transition-colors text-center">
            <div className="w-24 h-24 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <span className="font-black text-2xl text-gray-900 dark:text-white mb-2">노트를 찾을 수 없습니다</span>
            <span className="font-medium text-gray-500 dark:text-gray-400">존재하지 않거나 삭제된 패치노트입니다.</span>
          </div>
        ) : (
          <article className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
            <div className="bg-gray-50 dark:bg-[#0c0c0e] px-8 md:px-12 py-10 md:py-14 border-b border-gray-200 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="inline-flex items-center text-white font-black text-xs md:text-sm bg-indigo-500 px-3.5 py-1.5 rounded-xl shadow-sm tracking-widest uppercase">
                  {note.version}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-bold font-mono flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {new Date(note.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.3] tracking-tight break-keep">
                {note.title}
              </h1>
            </div>

            <div className="px-8 md:px-12 py-10 md:py-16 prose prose-lg prose-gray dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-img:rounded-2xl prose-img:shadow-md">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap break-words">
                {note.content || "상세 내용이 없습니다."}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0c0c0e] px-8 md:px-12 py-6 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/10 rounded-full text-gray-500 hover:text-indigo-500 hover:border-indigo-200 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
              </button>
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}