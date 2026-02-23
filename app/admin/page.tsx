'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { INGREDIENTS } from '@/lib/skillData';
import { FOOD_NAMES, CRAFT_NAMES, getCookingPeriod, getCraftingPeriod } from '@/lib/professionData';

const SEEDS = ["토마토 씨앗", "양파 씨앗", "마늘 씨앗"];
const VARIABLE_ITEMS = ["정제된 광석", "단단한 주괴", "스태미나 드링크 I", "맹수의 발톱"];

export default function AdminPage() {
  const [isLocalhost, setIsLocalhost] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'prices' | 'release'>('prices');
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [notesList, setNotesList] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteVersion, setNoteVersion] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const currentCookingPeriod = getCookingPeriod();
  const currentCraftingPeriod = getCraftingPeriod();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setIsLocalhost(true);
      fetchPrices();
      fetchNotes();
    } else {
      setIsLocalhost(false);
    }
  }, []);

  const fetchPrices = async () => {
    const { data, error } = await supabase.from('item_prices').select('*').order('created_at', { ascending: true });
    if (data && !error) {
      const priceMap: Record<string, number> = {};
      data.forEach(row => {
        let displayPrice = row.price;
        if (row.category === 'ingredient' && !SEEDS.includes(row.item_name)) {
          displayPrice = Math.round(row.price / 64);
        }
        priceMap[row.item_name] = displayPrice;
      });
      setPrices(priceMap);
    }
  };

  const fetchNotes = async () => {
    const { data, error } = await supabase.from('release_notes').select('*').order('created_at', { ascending: false });
    if (data && !error) setNotesList(data);
  };

  const handlePriceChange = (name: string, value: string) => {
    const num = parseInt(value);
    setPrices(prev => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const savePrices = async () => {
    if (!confirm(`현재 시간 기준 주기로 변동 시세를 저장하시겠습니까?\n요리 주기: ${currentCookingPeriod}\n공예품 주기: ${currentCraftingPeriod}`)) return;
    setIsSaving(true);
    const updates = Object.entries(prices).map(([name, price]) => {
      const isFood = FOOD_NAMES.includes(name);
      const isSeed = SEEDS.includes(name);
      const isCraft = CRAFT_NAMES.includes(name);
      let dbPrice = price;
      let category = 'ingredient';
      let period = 'current';

      if (isFood) {
        category = 'food';
        period = currentCookingPeriod;
      } else if (isCraft) {
        category = 'craft'; 
        period = currentCraftingPeriod;
      } else if (!isSeed) {
        dbPrice = price * 64;
      }
      return { item_name: name, price: dbPrice, category: category, period: period };
    });

    const { error } = await supabase.from('item_prices').upsert(updates, { onConflict: 'item_name, period' });
    setIsSaving(false);
    if (error) alert('저장 실패: ' + error.message);
    else alert('성공적으로 업데이트되었습니다.');
  };

  const saveReleaseNote = async () => {
    if (!noteVersion || !noteTitle || !noteContent) return alert('입력해주세요.');
    setIsSaving(true);
    if (editingNoteId) {
      const { error } = await supabase.from('release_notes').update({ version: noteVersion, title: noteTitle, content: noteContent }).eq('id', editingNoteId);
      if (error) alert('수정 실패: ' + error.message);
      else alert('수정되었습니다.');
    } else {
      const { error } = await supabase.from('release_notes').insert([{ version: noteVersion, title: noteTitle, content: noteContent }]);
      if (error) alert('등록 실패: ' + error.message);
      else alert('등록되었습니다.');
    }
    setIsSaving(false);
    cancelEdit();
    fetchNotes();
  };

  const editNote = (note: any) => { setEditingNoteId(note.id); setNoteVersion(note.version); setNoteTitle(note.title); setNoteContent(note.content); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const deleteNote = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    const { error } = await supabase.from('release_notes').delete().eq('id', id);
    if (error) alert('삭제 실패: ' + error.message);
    else { alert('삭제되었습니다.'); if (editingNoteId === id) cancelEdit(); fetchNotes(); }
  };
  const cancelEdit = () => { setEditingNoteId(null); setNoteVersion(''); setNoteTitle(''); setNoteContent(''); };

  if (isLocalhost === null) return <div className="min-h-screen bg-[#050505]"></div>;
  if (isLocalhost === false) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-black text-rose-500 mb-4">403 FORBIDDEN</h1>
        <p className="text-gray-400">관리자 로컬 환경에서만 접근 가능합니다.</p>
        <a href="/" className="mt-8 text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4">메인으로 돌아가기</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-rose-500 tracking-tighter mb-2">ALL-DDING ADMIN</h1>
            <p className="text-gray-400 text-sm">글로벌 시세 및 패치노트 관리 시스템</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('prices')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'prices' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>서버 시세 관리</button>
            <button onClick={() => setActiveTab('release')} className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'release' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>패치노트 관리</button>
          </div>
        </header>

        {activeTab === 'prices' && (
          <div className="animate-fade-in-up space-y-12 max-w-5xl mx-auto pb-32">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white border-l-4 border-indigo-500 pl-3 mb-1">요리 완성품 시세 (3일 변동)</h2>
                  <p className="text-xs text-gray-500 ml-4">저장 시 현재 시간 기준 주기(<span className="text-indigo-400">{currentCookingPeriod}</span>)로 자동 누적 기록됩니다.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {FOOD_NAMES.map(name => (
                  <div key={name} className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold truncate">{name}</label>
                    <input type="number" value={prices[name] || ''} onChange={(e) => handlePriceChange(name, e.target.value)} placeholder="0" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col mb-6">
                <h2 className="text-xl font-bold text-white border-l-4 border-cyan-500 pl-3 mb-2">공예품 시세 (1일 변동)</h2>
                <p className="text-cyan-400 text-xs font-bold pl-4">저장 시 현재 시간 기준 주기(<span className="text-cyan-400">{currentCraftingPeriod}</span>)로 자동 누적 기록됩니다.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CRAFT_NAMES.map(name => (
                  <div key={name} className="flex flex-col gap-1.5 relative">
                    <label className="text-xs text-gray-400 font-bold">{name}</label>
                    <input type="number" value={prices[name] === 0 ? '' : prices[name] || ''} onChange={(e) => handlePriceChange(name, e.target.value)} placeholder="0" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 pr-8" />
                    <span className="absolute right-3 top-[26px] text-xs text-gray-600 font-bold">G</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col mb-6">
                <h2 className="text-xl font-bold text-white border-l-4 border-amber-500 pl-3 mb-2">전문가 변동 시세</h2>
                <p className="text-amber-400 text-xs font-bold pl-4">위 변동 주기 없이 'current'로 저장됩니다.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {VARIABLE_ITEMS.map(name => (
                  <div key={name} className="flex flex-col gap-1.5 relative">
                    <label className="text-xs text-gray-400 font-bold">{name}</label>
                    <input type="number" value={prices[name] === 0 ? '' : prices[name] || ''} onChange={(e) => handlePriceChange(name, e.target.value)} placeholder="0" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 pr-8" />
                    <span className="absolute right-3 top-[26px] text-xs text-gray-600 font-bold">G</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col mb-6">
                <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-3 mb-2">기본 재료 시세 관리</h2>
                <p className="text-emerald-400 text-xs font-bold pl-4">이 데이터는 주기 없이 'current'로 현재 글로벌 시세로 덮어씌워집니다.</p>
              </div>
              <div className="space-y-8">
                {Object.entries(INGREDIENTS).map(([cat, items]) => (
                  <div key={cat}>
                    <h3 className="text-sm text-gray-500 font-black tracking-widest mb-4 uppercase">{cat}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {items.map(name => {
                        const isSeed = SEEDS.includes(name);
                        return (
                          <div key={name} className="flex flex-col gap-1.5 relative">
                            <label className="text-xs text-gray-400 font-bold flex justify-between">
                              {name}
                              <span className={isSeed ? "text-rose-400" : "text-gray-600"}>{isSeed ? '(1셋)' : '(개당)'}</span>
                            </label>
                            <input type="number" value={prices[name] === 0 ? '' : prices[name] || ''} onChange={(e) => handlePriceChange(name, e.target.value)} placeholder="0" className="bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 pr-8" />
                            <span className="absolute right-3 top-[26px] text-xs text-gray-600 font-bold">G</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] to-transparent flex justify-center z-50 pointer-events-none">
              <button onClick={savePrices} disabled={isSaving} className="pointer-events-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-4 rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-1">
                {isSaving ? '서버 기록 중...' : '자동 주기로 데이터 서버에 반영하기'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'release' && (
          <div className="animate-fade-in-up flex flex-col xl:flex-row gap-8">
            <div className="flex-[2] bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl h-fit">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white border-l-4 border-rose-500 pl-3">
                  {editingNoteId ? '패치노트 수정' : '신규 패치노트 작성'}
                </h2>
                {editingNoteId && (
                  <button onClick={cancelEdit} className="text-xs font-bold text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg">작성 취소</button>
                )}
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400 mb-2">버전 (예: v1.3.0)</label>
                    <input type="text" value={noteVersion} onChange={(e) => setNoteVersion(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 font-mono" />
                  </div>
                  <div className="flex-[3]">
                    <label className="block text-xs font-bold text-gray-400 mb-2">패치노트 제목</label>
                    <input type="text" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="직업 스킬트리 밸런스 조정 및 UI 개선" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2">상세 내용 (마크다운 지원)</label>
                  <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} rows={15} placeholder="- 내용" className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 resize-none leading-relaxed" />
                </div>
                <div className="flex justify-end pt-4 border-t border-white/5">
                  <button onClick={saveReleaseNote} disabled={isSaving} className="bg-white text-black hover:bg-gray-200 font-black px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                    {isSaving ? '처리 중...' : (editingNoteId ? '수정 내용 반영' : '라이브 서버에 즉시 발행')}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-2xl h-fit max-h-[800px] flex flex-col">
              <h3 className="text-lg font-bold text-white mb-4">발행된 패치노트 목록</h3>
              <div className="overflow-y-auto custom-scrollbar flex-1 pr-2 space-y-3">
                {notesList.map((note) => (
                  <div key={note.id} className="bg-black border border-white/5 p-4 rounded-xl flex flex-col gap-3 group hover:border-white/20 transition-colors">
                    <div>
                      <span className="text-rose-400 font-mono text-xs font-bold bg-rose-500/10 px-2 py-0.5 rounded">{note.version}</span>
                      <h4 className="text-white font-bold mt-2 text-sm line-clamp-2">{note.title}</h4>
                      <p className="text-gray-500 text-[10px] mt-1">{new Date(note.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editNote(note)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs py-2 rounded-lg font-bold transition-colors">수정</button>
                      <button onClick={() => deleteNote(note.id)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs py-2 rounded-lg font-bold transition-colors">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type="number"] { -moz-appearance: textfield; }`}} />
    </div>
  );
}