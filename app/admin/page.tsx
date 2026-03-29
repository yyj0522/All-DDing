'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { INGREDIENTS } from '@/lib/skillData';
import { FOOD_NAMES, CRAFT_NAMES, getCookingPeriod, getCraftingPeriod } from '@/lib/professionData';

const SEEDS = ["토마토 씨앗", "양파 씨앗", "마늘 씨앗"];
const VARIABLE_ITEMS = ["정제된 광석", "단단한 주괴", "스태미나 드링크 I", "맹수의 발톱"];

export default function AdminPage() {
  const [isLocalhost, setIsLocalhost] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'prices' | 'release' | 'feedback' | 'statistics' | 'votes'>('prices');
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  const [isFoodSaving, setIsFoodSaving] = useState(false);
  const [isCraftSaving, setIsCraftSaving] = useState(false);
  const [isVariableSaving, setIsVariableSaving] = useState(false);
  const [isIngredientSaving, setIsIngredientSaving] = useState(false);
  const [isReleaseSaving, setIsReleaseSaving] = useState(false);
  
  const [notesList, setNotesList] = useState<any[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteVersion, setNoteVersion] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'unread' | 'read'>('unread');

  const [farmingCount, setFarmingCount] = useState<number>(0);
  const [oceanCount, setOceanCount] = useState<number>(0);
  const [fabricCount, setFabricCount] = useState<number>(0);
  const [neoforgeCount, setNeoforgeCount] = useState<number>(0);

  const [polls, setPolls] = useState<any[]>([]);
  const [showPollForm, setShowPollForm] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['찬성', '반대']);

  const currentCookingPeriod = getCookingPeriod();
  const currentCraftingPeriod = getCraftingPeriod();

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      setIsLocalhost(true);
      fetchPrices();
      fetchNotes();
      fetchFeedbacks();
      fetchStatistics();
      fetchVotes();
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
        if (row.category === 'ingredient' && !SEEDS.includes(row.item_name) && !VARIABLE_ITEMS.includes(row.item_name)) {
          displayPrice = Number((row.price / 64).toFixed(4));
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

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch('/api/admin/fetch?target=feedbacks');
      const data = await res.json();
      if (Array.isArray(data)) setFeedbacks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStatistics = async () => {
    try {
      const res = await fetch('/api/admin/fetch?target=statistics');
      const data = await res.json();
      setFarmingCount(data.farmCount || 0);
      setOceanCount(data.ocCount || 0);
      setFabricCount(data.fbCount || 0);
      setNeoforgeCount(data.neoCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchVotes = async () => {
    const { data: pollsData } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
    const { data: votesData } = await supabase.from('feature_votes').select('poll_id, vote_type');
    
    if (pollsData && votesData) {
      const pollsWithResults = pollsData.map(poll => {
        const pollVotes = votesData.filter(v => v.poll_id === poll.id);
        const options = poll.options || ['찬성', '반대'];
        
        const results = options.map((opt: string) => ({
          label: opt,
          count: pollVotes.filter(v => v.vote_type === opt).length
        }));

        return { ...poll, results, total: pollVotes.length };
      });
      setPolls(pollsWithResults);
    }
  };

  const togglePollStatus = async (pollId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await fetch('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ action: 'toggle_poll', id: pollId, payload: { status: newStatus } })
    });
    fetchVotes();
  };

  const deletePoll = async (pollId: number) => {
    if (!confirm('정말 이 투표를 삭제하시겠습니까? 관련된 투표 데이터도 모두 삭제됩니다.')) return;
    await fetch('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_poll', id: pollId })
    });
    fetchVotes();
  };

  const submitNewPoll = async () => {
    if (!newPollTitle || newPollOptions.some(opt => !opt.trim())) return alert('제목과 옵션을 모두 입력해주세요.');
    const res = await fetch('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'create_poll', 
        payload: { title: newPollTitle, description: newPollDesc, options: newPollOptions, status: 'active' } 
      })
    });
    
    if (res.ok) {
      setShowPollForm(false);
      setNewPollTitle('');
      setNewPollDesc('');
      setNewPollOptions(['찬성', '반대']);
      fetchVotes();
    } else {
      alert('투표 생성에 실패했습니다.');
    }
  };

  const handlePriceChange = (name: string, value: string) => {
    const num = parseFloat(value);
    setPrices(prev => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
  };

  const saveFoodPrices = async () => {
    if (!confirm(`현재 시간 기준 주기로 요리 시세를 저장하시겠습니까?\n적용 주기: ${currentCookingPeriod}`)) return;
    setIsFoodSaving(true);
    const updates = Object.entries(prices).filter(([name]) => FOOD_NAMES.includes(name)).map(([name, price]) => ({ item_name: name, price: price, category: 'food', period: currentCookingPeriod }));
    const { error } = await supabase.from('item_prices').upsert(updates, { onConflict: 'item_name, period' });
    setIsFoodSaving(false);
    if (error) alert('요리 시세 저장 실패: ' + error.message);
    else alert('요리 시세가 성공적으로 업데이트되었습니다.');
  };

  const saveCraftPrices = async () => {
    if (!confirm(`현재 시간 기준 주기로 공예품 시세를 저장하시겠습니까?\n적용 주기: ${currentCraftingPeriod}`)) return;
    setIsCraftSaving(true);
    const updates = Object.entries(prices).filter(([name]) => CRAFT_NAMES.includes(name)).map(([name, price]) => ({ item_name: name, price: price, category: 'craft', period: currentCraftingPeriod }));
    const { error } = await supabase.from('item_prices').upsert(updates, { onConflict: 'item_name, period' });
    setIsCraftSaving(false);
    if (error) alert('공예품 시세 저장 실패: ' + error.message);
    else alert('공예품 시세가 성공적으로 업데이트되었습니다.');
  };

  const saveVariablePrices = async () => {
    if (!confirm('전문가 변동 시세를 현재 시세로 업데이트 하시겠습니까?')) return;
    setIsVariableSaving(true);
    const updates = Object.entries(prices).filter(([name]) => VARIABLE_ITEMS.includes(name)).map(([name, price]) => ({ item_name: name, price: price, category: 'ingredient', period: 'current' }));
    const { error } = await supabase.from('item_prices').upsert(updates, { onConflict: 'item_name, period' });
    setIsVariableSaving(false);
    if (error) alert('전문가 시세 저장 실패: ' + error.message);
    else alert('전문가 시세가 성공적으로 업데이트되었습니다.');
  };

  const saveIngredientsOnly = async () => {
    if (!confirm('기본 재료 시세만 현재 글로벌 시세로 업데이트 하시겠습니까?')) return;
    setIsIngredientSaving(true);
    const ingredientNames = Object.values(INGREDIENTS).flat();
    const updates = Object.entries(prices).filter(([name]) => ingredientNames.includes(name)).map(([name, price]) => {
      let dbPrice = price;
      if (!SEEDS.includes(name) && !VARIABLE_ITEMS.includes(name)) dbPrice = price * 64;
      return { item_name: name, price: dbPrice, category: 'ingredient', period: 'current' };
    });
    const { error } = await supabase.from('item_prices').upsert(updates, { onConflict: 'item_name, period' });
    setIsIngredientSaving(false);
    if (error) alert('기본 재료 시세 저장 실패: ' + error.message);
    else alert('기본 재료 시세만 성공적으로 업데이트되었습니다.');
  };

  const saveReleaseNote = async () => {
    if (!noteVersion || !noteTitle || !noteContent) return alert('입력해주세요.');
    setIsReleaseSaving(true);
    if (editingNoteId) {
      const { error } = await supabase.from('release_notes').update({ version: noteVersion, title: noteTitle, content: noteContent }).eq('id', editingNoteId);
      if (error) alert('수정 실패: ' + error.message); else alert('수정되었습니다.');
    } else {
      const { error } = await supabase.from('release_notes').insert([{ version: noteVersion, title: noteTitle, content: noteContent }]);
      if (error) alert('등록 실패: ' + error.message); else alert('등록되었습니다.');
    }
    setIsReleaseSaving(false); cancelEdit(); fetchNotes();
  };

  const editNote = (note: any) => { setEditingNoteId(note.id); setNoteVersion(note.version); setNoteTitle(note.title); setNoteContent(note.content); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const deleteNote = async (id: number) => { if (!confirm('삭제하시겠습니까?')) return; const { error } = await supabase.from('release_notes').delete().eq('id', id); if (!error) { alert('삭제되었습니다.'); if (editingNoteId === id) cancelEdit(); fetchNotes(); } };
  const cancelEdit = () => { setEditingNoteId(null); setNoteVersion(''); setNoteTitle(''); setNoteContent(''); };

  const markAsRead = async (id: number) => {
    await fetch('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ action: 'read_feedback', id })
    });
    fetchFeedbacks();
  };

  const deleteFeedback = async (id: number) => {
    if (!confirm('해당 문의를 완전히 삭제하시겠습니까?')) return;
    await fetch('/api/admin/action', {
      method: 'POST',
      body: JSON.stringify({ action: 'delete_feedback', id })
    });
    fetchFeedbacks();
  };

  const filteredFeedbacks = feedbacks.filter(fb => feedbackFilter === 'unread' ? !fb.is_read : fb.is_read);

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
        <header className="mb-10 flex flex-col xl:flex-row xl:items-end justify-between border-b border-white/10 pb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black text-rose-500 tracking-tighter mb-2">ALL-DDING ADMIN</h1>
            <p className="text-gray-400 text-sm">글로벌 시세, 패치노트, 투표 및 유저 의견 관리 시스템</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-[#111] p-1.5 rounded-xl border border-white/5">
            <button onClick={() => setActiveTab('prices')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'prices' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>서버 시세 관리</button>
            <button onClick={() => setActiveTab('release')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'release' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>패치노트 관리</button>
            <button onClick={() => setActiveTab('feedback')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors relative ${activeTab === 'feedback' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>
              의견 및 제보
              {feedbacks.filter(f => !f.is_read).length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-pulse"></span>}
            </button>
            <button onClick={() => { setActiveTab('votes'); fetchVotes(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'votes' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>투표 현황</button>
            <button onClick={() => { setActiveTab('statistics'); fetchStatistics(); }} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'statistics' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}>통계 현황</button>
          </div>
        </header>

        {activeTab === 'prices' && (
           <div className="animate-fade-in-up space-y-12 max-w-5xl mx-auto pb-32">
             <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white border-l-4 border-indigo-500 pl-3 mb-1">요리 완성품 시세 (3일 변동)</h2>
                   <p className="text-xs text-gray-500 ml-4">저장 시 현재 시간 기준 주기(<span className="text-indigo-400">{currentCookingPeriod}</span>)로 자동 누적 기록됩니다.</p>
                 </div>
                 <button onClick={saveFoodPrices} disabled={isFoodSaving} className="bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-400 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.15)] whitespace-nowrap">
                   {isFoodSaving ? '저장 중...' : '요리 시세 업데이트'}
                 </button>
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
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white border-l-4 border-cyan-500 pl-3 mb-2">공예품 시세 (1일 변동)</h2>
                   <p className="text-cyan-400 text-xs font-bold pl-4">저장 시 현재 시간 기준 주기(<span className="text-cyan-400">{currentCraftingPeriod}</span>)로 자동 누적 기록됩니다.</p>
                 </div>
                 <button onClick={saveCraftPrices} disabled={isCraftSaving} className="bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-400 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.15)] whitespace-nowrap">
                   {isCraftSaving ? '저장 중...' : '공예품 시세 업데이트'}
                 </button>
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
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white border-l-4 border-emerald-500 pl-3 mb-2">기본 재료 시세 관리</h2>
                   <p className="text-emerald-400 text-xs font-bold pl-4">이 데이터는 주기 없이 'current'로 현재 글로벌 시세로 덮어씌워집니다.</p>
                 </div>
                 <button onClick={saveIngredientsOnly} disabled={isIngredientSaving} className="bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-400 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] whitespace-nowrap">
                   {isIngredientSaving ? '재료 저장 중...' : '기본 재료 시세 업데이트'}
                 </button>
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
                             <label className="text-xs text-gray-400 font-bold flex justify-between">{name}<span className={isSeed ? "text-rose-400" : "text-gray-600"}>{isSeed ? '(1셋)' : '(1개)'}</span></label>
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
           </div>
        )}

        {activeTab === 'release' && (
          <div className="animate-fade-in-up flex flex-col xl:flex-row gap-8 max-w-7xl mx-auto">
            
            <div className="flex-[2] bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl h-fit">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white border-l-4 border-rose-500 pl-3">{editingNoteId ? '패치노트 수정' : '신규 패치노트 작성'}</h2>
                {editingNoteId && <button onClick={cancelEdit} className="text-xs font-bold text-gray-400 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg">작성 취소</button>}
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
                  <button onClick={saveReleaseNote} disabled={isReleaseSaving} className="bg-white text-black hover:bg-gray-200 font-black px-10 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                    {isReleaseSaving ? '처리 중...' : (editingNoteId ? '수정 내용 반영' : '라이브 서버에 즉시 발행')}
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

        {activeTab === 'feedback' && (
          <div className="animate-fade-in-up max-w-5xl mx-auto pb-32">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl min-h-[600px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white border-l-4 border-blue-500 pl-3 mb-1">사용자 의견 및 제보함</h2>
                  <p className="text-xs text-gray-500 ml-4">유저들이 남긴 건의사항과 버그 제보를 확인합니다.</p>
                </div>
                <div className="flex gap-2 bg-[#111] p-1.5 rounded-xl border border-white/10">
                  <button onClick={() => setFeedbackFilter('unread')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${feedbackFilter === 'unread' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>안 읽은 의견 ({feedbacks.filter(f => !f.is_read).length})</button>
                  <button onClick={() => setFeedbackFilter('read')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${feedbackFilter === 'read' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}>읽은 의견</button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {filteredFeedbacks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 py-20">
                    <p>{feedbackFilter === 'unread' ? '새로운 의견이 없습니다.' : '보관된 의견이 없습니다.'}</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((fb) => (
                    <div key={fb.id} className="bg-black border border-white/10 rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 group hover:border-white/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-gray-500 text-xs font-mono">{new Date(fb.created_at).toLocaleString()}</span>
                          {fb.email && <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/20">답변 요청: {fb.email}</span>}
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{fb.content}</p>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-24">
                        {!fb.is_read && <button onClick={() => markAsRead(fb.id)} className="flex-1 md:flex-none bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 text-xs py-2 rounded-lg font-bold transition-colors">읽음 처리</button>}
                        <button onClick={() => deleteFeedback(fb.id)} className="flex-1 md:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs py-2 rounded-lg font-bold transition-colors">삭제</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'votes' && (
          <div className="animate-fade-in-up max-w-5xl mx-auto pb-32">
            
            {showPollForm && (
              <div className="bg-[#111] border border-purple-500/30 rounded-2xl p-6 mb-8 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                <h3 className="text-lg font-bold text-white mb-4">새로운 투표 생성</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">투표 제목</label>
                    <input type="text" value={newPollTitle} onChange={(e) => setNewPollTitle(e.target.value)} placeholder="예) 다음 업데이트 최우선 순위는?" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1">상세 설명 (선택)</label>
                    <textarea value={newPollDesc} onChange={(e) => setNewPollDesc(e.target.value)} placeholder="투표에 대한 자세한 설명을 적어주세요." className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500 resize-none h-20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2">선택지 설정</label>
                    {newPollOptions.map((opt, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input type="text" value={opt} onChange={(e) => {
                          const newOpts = [...newPollOptions];
                          newOpts[idx] = e.target.value;
                          setNewPollOptions(newOpts);
                        }} className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500" />
                        {newPollOptions.length > 2 && (
                          <button onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== idx))} className="bg-red-500/10 text-red-400 px-3 rounded-lg hover:bg-red-500/20 font-bold text-sm">X</button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => setNewPollOptions([...newPollOptions, ''])} className="text-purple-400 text-xs font-bold mt-1 hover:text-purple-300">+ 선택지 추가</button>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button onClick={() => setShowPollForm(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm font-bold">취소</button>
                    <button onClick={submitNewPoll} className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md">투표 등록하기</button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-white border-l-4 border-purple-500 pl-3">유저 투표 진행 결과</h2>
                <button onClick={() => setShowPollForm(!showPollForm)} className="bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-400 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                  {showPollForm ? '닫기' : '+ 새 투표 만들기'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {polls.length === 0 ? (
                  <p className="text-gray-500 text-sm col-span-2 text-center py-10">등록된 투표가 없습니다.</p>
                ) : (
                  polls.map((poll) => (
                    <div key={poll.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                      {poll.status === 'closed' && <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>}
                      
                      <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-4 z-20 relative">
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-white break-keep">{poll.title}</h3>
                          </div>
                          {poll.description && <p className="text-xs text-gray-400 mt-1 break-keep leading-relaxed">{poll.description}</p>}
                          <p className="text-[10px] text-gray-600 mt-2">ID: {poll.id} • {new Date(poll.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <button 
                            onClick={() => togglePollStatus(poll.id, poll.status)}
                            className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer z-20 ${poll.status === 'active' ? 'bg-purple-500/20 text-purple-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-gray-500/20 text-gray-400 hover:bg-purple-500/20 hover:text-purple-400'}`}
                          >
                            {poll.status === 'active' ? '진행 중 (종료하기)' : '종료됨 (다시 열기)'}
                          </button>
                          <button onClick={() => deletePoll(poll.id)} className="text-[10px] text-gray-500 hover:text-red-400 z-20 transition-colors">삭제</button>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-2 mb-4 z-20 relative">
                        <span className="text-3xl font-black text-white">{poll.total}</span>
                        <span className="text-sm text-gray-500 font-bold mb-1">명 참여</span>
                      </div>

                      <div className="space-y-3 z-20 relative">
                        {poll.results.map((res: any, idx: number) => {
                          const percentage = poll.total > 0 ? Math.round((res.count / poll.total) * 100) : 0;
                          const colorClass = idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-rose-500' : idx === 2 ? 'bg-emerald-500' : 'bg-amber-500';
                          const textColorClass = idx === 0 ? 'text-indigo-400' : idx === 1 ? 'text-rose-400' : idx === 2 ? 'text-emerald-400' : 'text-amber-400';
                          
                          return (
                            <div key={res.label}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className={`${textColorClass} font-bold`}>{res.label}</span>
                                <span className="text-white font-bold">{res.count}명 <span className="text-gray-500 text-xs font-normal">({percentage}%)</span></span>
                              </div>
                              <div className="w-full bg-black rounded-full h-2">
                                <div className={`${colorClass} h-2 rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="animate-fade-in-up max-w-5xl mx-auto pb-32">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white border-l-4 border-yellow-500 pl-3 mb-8">기능 사용 통계 현황</h2>
              
              <h3 className="text-sm text-gray-400 font-bold mb-4 ml-1">이미지 저장 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-[#111] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center group hover:border-green-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm font-bold mb-2">요리 시세 전광판 저장</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">{farmingCount.toLocaleString()}</span>
                    <span className="text-green-500 font-bold">회</span>
                  </div>
                </div>

                <div className="bg-[#111] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center group hover:border-cyan-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-cyan-500/10 text-cyan-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm font-bold mb-2">공예품 시세 전광판 저장</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">{oceanCount.toLocaleString()}</span>
                    <span className="text-cyan-500 font-bold">회</span>
                  </div>
                </div>
              </div>

              <h3 className="text-sm text-gray-400 font-bold mb-4 ml-1">타이머 모드 다운로드 통계</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center group hover:border-rose-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm font-bold mb-2">Fabric 버전 다운로드</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">{fabricCount.toLocaleString()}</span>
                    <span className="text-rose-500 font-bold">회</span>
                  </div>
                </div>

                <div className="bg-[#111] p-8 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center group hover:border-emerald-500/50 transition-all duration-300">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <p className="text-gray-400 text-sm font-bold mb-2">NeoForge 버전 다운로드</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">{neoforgeCount.toLocaleString()}</span>
                    <span className="text-emerald-500 font-bold">회</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; } input[type="number"] { -moz-appearance: textfield; }`}} />
    </div>
  );
}