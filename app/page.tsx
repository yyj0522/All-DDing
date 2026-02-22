'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import confetti from 'canvas-confetti';
import { ITEM_IMAGES } from '@/lib/skillData';
import { supabase } from '@/lib/supabase';

const RECIPES = [
  { id: "c01", name: "토마토 스파게티", maxPrice: 864, isHard: false, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "c02", name: "어니언 링", maxPrice: 1296, isHard: false, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "c03", name: "갈릭 케이크", maxPrice: 810, isHard: false, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "c04", name: "삼겹살 토마토 찌개", maxPrice: 2039, isHard: false, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c05", name: "삼색 아이스크림", maxPrice: 3022, isHard: true, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "c06", name: "마늘 양갈비 핫도그", maxPrice: 1832, isHard: false, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "c07", name: "달콤 시리얼", maxPrice: 2578, isHard: true, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "c08", name: "로스트 치킨 파이", maxPrice: 2253, isHard: false, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "c09", name: "스윗 치킨 햄버거", maxPrice: 3612, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "c10", name: "토마토 파인애플 피자", maxPrice: 3455, isHard: true, ingredients: { "토마토 베이스": 2, "마늘 베이스": 2, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "c11", name: "양파 수프", maxPrice: 3797, isHard: true, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "c12", name: "허브 삼겹살 찜", maxPrice: 2982, isHard: false, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c13", name: "토마토 라자냐", maxPrice: 4181, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "c14", name: "딥 크림 빠네", maxPrice: 3837, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "c15", name: "트리플 소갈비 꼬치", maxPrice: 4307, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } },
];

export default function Home() {
  const [subtitle, setSubtitle] = useState('모든 것');
  const [isGlitching, setIsGlitching] = useState(false);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});
  const [releaseNotes, setReleaseNotes] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const triggerExplosion = () => {
    if (!subtitleRef.current) return;
    const rect = subtitleRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 150,
      spread: 360,
      origin: { x, y },
      colors: ['#818cf8', '#22d3ee', '#ffffff', '#a5f3fc', '#c7d2fe'],
      ticks: 150, 
      gravity: 0.6, 
      scalar: 0.8, 
      startVelocity: 45, 
      shapes: ['circle', 'square'], 
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: priceData }, { data: notesData }] = await Promise.all([
        supabase.from('item_prices').select('*'),
        supabase.from('release_notes').select('*').order('created_at', { ascending: false }).limit(3)
      ]);

      if (priceData) {
        const pm: Record<string, number> = {};
        priceData.forEach(row => { pm[row.item_name] = row.price; });
        setDbPrices(pm);
      }
      
      if (notesData) {
        setReleaseNotes(notesData);
      }
      
      setIsLoaded(true);
    };

    fetchData();

    const glitchStartTimer = setTimeout(() => setIsGlitching(true), 1000);
    const explosionAndChangeTimer = setTimeout(() => { triggerExplosion(); setSubtitle('All thing'); }, 2200);
    const glitchStopTimer = setTimeout(() => setIsGlitching(false), 2250);

    return () => {
      clearTimeout(glitchStartTimer);
      clearTimeout(explosionAndChangeTimer);
      clearTimeout(glitchStopTimer);
    };
  }, []);

  const top3Recipes = useMemo(() => {
    if (!isLoaded || Object.keys(dbPrices).length === 0) return [];

    return RECIPES.map(recipe => {
      // 스킬 보너스 없이 순수한 DB 가격(NPC 기본가)만 사용
      const currentMarketPrice = dbPrices[recipe.name] || 0;
      const percentToMax = recipe.maxPrice === 0 ? 0 : Math.min((currentMarketPrice / recipe.maxPrice) * 100, 100);

      return { name: recipe.name, percentToMax, currentMarketPrice };
    })
    .sort((a, b) => b.percentToMax - a.percentToMax || b.currentMarketPrice - a.currentMarketPrice)
    .slice(0, 3);
  }, [dbPrices, isLoaded]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-white/20 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight">
            띵타이쿤의{' '}
            <span ref={subtitleRef} className={`relative inline-block ${isGlitching ? 'animate-glitch text-indigo-300' : 'transition-colors duration-300'}`}>
              {subtitle}
            </span>,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              All-DDing
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base font-medium tracking-wide mx-auto md:mx-0">
            올띵은 띵타이쿤 플레이어들을 위한 비공식 비영리 종합 가이드 및 도구 모음 사이트입니다. <br className="hidden md:block"/> 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16">
          <Link href="/efficiency" className="group col-span-1 md:col-span-3 relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#111] to-[#050505] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex flex-col justify-center pr-4">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">최고가 대비 TOP 3</h2>
              <p className="text-indigo-400 text-xs font-bold mb-2 tracking-widest uppercase">실시간 시장가 기준 정렬</p>
              <p className="text-gray-500 text-sm font-medium mb-6">스킬 레벨이 반영되지 않은 순수 요리 가격을 확인하세요.</p>
              <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                나의 음식 효율 보러가기
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col gap-3">
              {top3Recipes.map((item, index) => {
                const colors = [
                  { border: 'border-yellow-500/20', shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]', numBg: 'from-yellow-300 to-yellow-600', numText: 'text-black', percentText: 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' },
                  { border: 'border-white/5', shadow: '', numBg: 'from-gray-300 to-gray-500', numText: 'text-black', percentText: 'text-gray-300' },
                  { border: 'border-white/5', shadow: '', numBg: 'from-amber-600 to-amber-800', numText: 'text-white', percentText: 'text-amber-600' }
                ][index];

                return (
                  <div key={item.name} className={`flex items-center justify-between p-3.5 md:p-4 rounded-2xl bg-white/[0.02] border ${colors.border} ${colors.shadow}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.numBg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`text-sm font-black ${colors.numText}`}>{index + 1}</span>
                      </div>
                      <div className="w-10 h-10 bg-black/50 rounded-lg border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img src={`/foods/${ITEM_IMAGES[item.name]}.png`} alt={item.name} className="w-7 h-7 object-contain" style={{ imageRendering: 'pixelated' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                      <span className={`font-bold ${index === 0 ? 'text-lg text-white' : 'text-gray-300'}`}>{item.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end pl-4">
                      <div className={`font-black whitespace-nowrap ${index === 0 ? 'text-xl' : 'text-lg'} ${colors.percentText}`}>
                        {item.currentMarketPrice.toLocaleString()} G
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold whitespace-nowrap mt-0.5">
                        최고가 대비 <span className={item.percentToMax >= 80 ? 'text-emerald-400' : 'text-white'}>{item.percentToMax.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {top3Recipes.length === 0 && <div className="text-gray-500 text-center py-6 text-sm">시세 정보를 불러오는 중입니다...</div>}
            </div>
          </Link>

          <Link href="/profession" className="group col-span-1 rounded-3xl p-6 md:p-8 bg-[#0a0a0a] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between min-h-[200px]">
             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
             </div>
             <div>
                <h3 className="text-xl font-bold text-white mb-2">전문가</h3>
                <p className="text-gray-500 text-sm leading-relaxed">각 직업별 특화된 계산기와 편의 기능을 제공합니다.</p>
             </div>
          </Link>

          <Link href="/map" className="group rounded-3xl p-6 md:p-8 bg-[#0a0a0a] border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">아일랜드 지도</h3>
              <p className="text-gray-500 text-sm leading-relaxed">농장, 양식장, 서식지의 위치를 직관적으로 파악하세요.</p>
            </div>
          </Link>

          <Link href="/resources" className="group rounded-3xl p-6 md:p-8 bg-[#0a0a0a] border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between min-h-[200px]">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">자료실</h3>
              <p className="text-gray-500 text-sm leading-relaxed">타이머 모드, 물가 체크 시트지 등 도구를 제공합니다.</p>
            </div>
          </Link>
        </div>

        <section className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
            <h2 className="text-xl font-bold text-white">올띵 릴리즈 노트</h2>
          </div>
          <div className="space-y-4">
            {releaseNotes.map(note => (
              <div key={note.id} className="flex flex-col md:flex-row md:items-center gap-4">
                <span className="text-indigo-400 font-bold text-sm whitespace-nowrap border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-lg">{note.version}</span>
                <Link href={`/release/${note.id}`} className="text-gray-300 text-sm hover:text-white transition-colors">{note.title}</Link>
                <span className="text-gray-600 text-xs md:ml-auto font-mono">
                  {new Date(note.created_at).toISOString().split('T')[0]}
                </span>
              </div>
            ))}
            {releaseNotes.length === 0 && <p className="text-gray-500 text-sm">등록된 패치노트가 없습니다.</p>}
          </div>
        </section>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: -3px 0 #818cf8, 3px 0 #22d3ee; }
          20% { transform: translate(-5px, 2px); }
          40% { transform: translate(-2px, -4px); text-shadow: 4px 0 #818cf8, -4px 0 #22d3ee; }
          60% { transform: translate(4px, 3px); }
          80% { transform: translate(2px, -3px); text-shadow: -3px 0 #818cf8, 3px 0 #22d3ee; }
          100% { transform: translate(0); }
        }
        .animate-glitch {
          animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite;
        }
      `}</style>
    </div>
  );
}