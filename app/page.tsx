'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import confetti from 'canvas-confetti';

export default function Home() {
  const [subtitle, setSubtitle] = useState('모든 것');
  const [isGlitching, setIsGlitching] = useState(false);
  const subtitleRef = useRef<HTMLSpanElement>(null);
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
    const glitchStartTimer = setTimeout(() => {
      setIsGlitching(true);
    }, 1000);

    const explosionAndChangeTimer = setTimeout(() => {
      triggerExplosion(); 
      setSubtitle('All thing'); 
    }, 2200);

    const glitchStopTimer = setTimeout(() => {
      setIsGlitching(false);
    }, 2250);

    return () => {
      clearTimeout(glitchStartTimer);
      clearTimeout(explosionAndChangeTimer);
      clearTimeout(glitchStopTimer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-white/20 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight">
            띵타이쿤의{' '}
            <span 
              ref={subtitleRef}
              className={`relative inline-block ${isGlitching ? 'animate-glitch text-indigo-300' : 'transition-colors duration-300'}`}
            >
              {subtitle}
            </span>,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              All-DDing
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base font-medium tracking-wide mx-auto md:mx-0">
            올띵은 띵타이쿤 플레이어들을 위한 비영리 종합 가이드 및 도구 모음 사이트입니다. <br className="hidden md:block"/> 
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-16">
          <Link href="/efficiency" className="group col-span-1 md:col-span-3 relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#111] to-[#050505] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/3 flex flex-col justify-center pr-4">
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">실시간 마진 TOP 3</h2>
              <p className="text-indigo-400 text-xs font-bold mb-2 tracking-widest uppercase">02-21 ~ 02-24 요리 효율 순위</p>
              <p className="text-gray-500 text-sm font-medium mb-6">스킬 레벨 및 현재 시세가 반영된 실시간 최고 마진 요리를 확인하세요.</p>
              <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-sm group-hover:translate-x-2 transition-transform">
                시뮬레이터 열기 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l7-7m7-7H3" /></svg>
              </div>
            </div>

            <div className="w-full md:w-2/3 flex flex-col gap-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                    <span className="text-sm font-black text-black">1</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[8px] text-gray-500 flex-shrink-0">IMG</div>
                  <span className="font-bold text-lg text-white">트리플 소갈비 꼬치</span>
                </div>
                <div className="text-right flex flex-col items-end pl-4">
                  <div className="text-yellow-400 font-black text-xl drop-shadow-[0_0_8px_rgba(250,204,21,0.4)] whitespace-nowrap">85.4%</div>
                  <div className="text-[10px] text-gray-500 font-bold whitespace-nowrap">최고가 대비</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center">
                    <span className="text-sm font-black text-black">2</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[8px] text-gray-500 flex-shrink-0">IMG</div>
                  <span className="font-bold text-gray-200">딥 크림 빠네</span>
                </div>
                <div className="text-right flex flex-col items-end pl-4">
                  <div className="text-gray-300 font-black text-lg whitespace-nowrap">72.1%</div>
                  <div className="text-[10px] text-gray-500 font-bold whitespace-nowrap">최고가 대비</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                    <span className="text-sm font-black text-white">3</span>
                  </div>
                  <div className="w-8 h-8 bg-white/10 rounded border border-white/20 flex items-center justify-center text-[8px] text-gray-500 flex-shrink-0">IMG</div>
                  <span className="font-bold text-gray-300">토마토 라쟈냐</span>
                </div>
                <div className="text-right flex flex-col items-end pl-4">
                  <div className="text-amber-600 font-black text-lg whitespace-nowrap">68.9%</div>
                  <div className="text-[10px] text-gray-500 font-bold whitespace-nowrap">최고가 대비</div>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/profession" className="group rounded-3xl p-6 md:p-8 bg-[#0a0a0a] border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between min-h-[200px]">
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
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-indigo-400 font-bold text-sm whitespace-nowrap border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-lg">v1.1.0 업데이트</span>
              <span className="text-gray-300 text-sm">페이지 간 상태 유지를 위한 상단 공통 네비게이션 적용</span>
              <span className="text-gray-600 text-xs md:ml-auto font-mono">2026-02-22</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-gray-400 font-bold text-sm whitespace-nowrap border border-white/10 bg-white/5 px-3 py-1 rounded-lg">v1.0.5 패치</span>
              <span className="text-gray-400 text-sm">메인 화면 레이아웃 최적화 및 텍스트 렌더링 개선</span>
              <span className="text-gray-600 text-xs md:ml-auto font-mono">2026-02-22</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="text-gray-400 font-bold text-sm whitespace-nowrap border border-white/10 bg-white/5 px-3 py-1 rounded-lg">v1.0.1 핫픽스</span>
              <span className="text-gray-400 text-sm">개인 스킬 및 가격 설정 로컬 스토리지 자동 저장 기능 적용</span>
              <span className="text-gray-600 text-xs md:ml-auto font-mono">2026-02-21</span>
            </div>
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