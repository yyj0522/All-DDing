'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { supabase } from '@/lib/supabase';

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
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-white/20 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <Header />

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 pt-32 pb-20">
        <button 
          onClick={() => router.push('/note')}
          className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 text-sm font-bold"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          목록으로 돌아가기
        </button>

        <section className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">내용을 불러오는 중입니다...</div>
          ) : !note ? (
            <div className="text-center py-20 text-gray-500 flex flex-col items-center">
              <svg className="w-12 h-12 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              존재하지 않거나 삭제된 패치노트입니다.
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 pb-8 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block text-indigo-400 font-black text-sm border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-md">
                    {note.version}
                  </span>
                  <span className="text-gray-500 text-sm font-mono">
                    {new Date(note.created_at).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-white leading-tight">
                  {note.title}
                </h1>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
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