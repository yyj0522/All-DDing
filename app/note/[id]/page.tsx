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
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-indigo-200 dark:selection:bg-white/20 relative flex flex-col transition-colors duration-300">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none transition-colors duration-300"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-[900px] w-full mx-auto px-4 pt-28 md:pt-36 pb-24 md:pb-20">
        <button 
          onClick={() => router.push('/note')}
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md dark:shadow-xl transition-all duration-300 mb-6 md:mb-8 text-xs md:text-sm font-bold w-fit"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          목록으로 돌아가기
        </button>

        <section className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-12 shadow-md dark:shadow-2xl transition-colors">
          {isLoading ? (
            <div className="text-center py-24 flex flex-col items-center gap-4 transition-colors">
              <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-500/30 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
              <span className="text-gray-500 font-bold">내용을 불러오는 중입니다...</span>
            </div>
          ) : !note ? (
            <div className="text-center py-24 text-gray-500 flex flex-col items-center transition-colors">
              <svg className="w-14 h-14 mb-4 text-gray-300 dark:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="font-bold text-lg text-gray-600 dark:text-gray-400">존재하지 않거나 삭제된 패치노트입니다.</span>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 dark:border-white/10 pb-6 md:pb-8 mb-6 md:mb-8 transition-colors">
                <div className="flex items-center gap-3 mb-4 md:mb-5">
                  <span className="inline-block text-indigo-700 dark:text-indigo-400 font-black text-[11px] md:text-xs border border-indigo-200 dark:border-transparent bg-indigo-100 dark:bg-indigo-500/20 px-3 py-1.5 rounded-lg shadow-sm dark:shadow-none tracking-widest transition-colors">
                    {note.version}
                  </span>
                  <span className="text-gray-500 dark:text-gray-500 text-xs md:text-sm font-bold font-mono transition-colors">
                    {new Date(note.created_at).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight transition-colors">
                  {note.title}
                </h1>
              </div>

              <div className="prose prose-gray dark:prose-invert max-w-none transition-colors">
                <div className="text-gray-700 dark:text-gray-300 leading-loose text-sm md:text-base font-medium whitespace-pre-wrap break-words transition-colors">
                  {note.content || "상세 내용이 없습니다."}
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}