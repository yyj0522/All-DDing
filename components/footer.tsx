'use client';

import { useState } from 'react';

export default function Footer() {
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);

  return (
    <>
      <footer className="relative z-10 w-full border-t border-white/5 bg-[#050505] mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1">
            <span className="text-xl font-black text-white tracking-widest mb-1" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
              올띵
            </span>
            <span className="text-xs font-medium text-fuchsia-500/80 tracking-wide mb-4">
              띵타이쿤 플레이어를 위한 비공식 종합 도구 모음
            </span>
            
            <div className="text-[10px] text-gray-500/70 space-y-1.5 font-medium leading-relaxed">
              <p>
                올띵(All-Dding)은 띵타이쿤 유저가 제작한 <span className="font-bold text-gray-400">비공식 사이트</span>이며 공식 운영진과 무관합니다.
              </p>
              <p>
                사이트 내 사용된 모든 게임 관련 이미지 및 리소스의 출처와 저작권은 <span className="font-bold text-gray-400">'띵타이쿤 온라인'</span>에 있습니다.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end text-sm shrink-0 gap-4">
            <div className="flex flex-col items-center md:items-end">
              <span className="text-gray-400 font-bold mb-1 text-xs">문의 및 오류/제보/건의</span>
              <a href="mailto:projectc029@gmail.com" className="text-gray-300 hover:text-white transition-colors font-mono font-medium text-xs bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                projectc029@gmail.com
              </a>
            </div>
            
            <button 
              onClick={() => setIsDeveloperModalOpen(true)}
              className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold px-4 py-2 rounded-lg border border-fuchsia-500/20 transition-all shadow-[0_0_10px_rgba(217,70,239,0.1)] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              개발자 (Developer)
            </button>
          </div>
        </div>
      </footer>

      {isDeveloperModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsDeveloperModalOpen(false)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500 to-blue-500"></div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-white">안녕하세요! </h3>
                <button onClick={() => setIsDeveloperModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="text-sm text-gray-300 leading-relaxed space-y-4 mb-6">
                <p>
                  개발을 공부하는 학생으로 사이트 프로젝트로 몇 가지 사이트를 만들어서 운영중에 있습니다.
                  시간이 날 때 제가 만든 다른 사이트들도 방문해주시면 감사하겠습니다.
                </p>
                <p className="font-bold text-white pt-2 border-t border-white/10">
                  혹시 이런 서비스도 필요하지 않으신가요? <br/>
                  <span className="text-xs text-gray-400 font-normal">제가 운영 중인 다른 유용한 사이트들입니다!</span>
                </p>
              </div>

              <div className="space-y-3">
                <a href="https://mulgacheck.com" target="_blank" rel="noopener noreferrer" className="block group bg-[#111] hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/50 p-4 rounded-xl transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-blue-400 text-base group-hover:text-blue-300">물가체크 (MulgaCheck)</span>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">해외여행 가기 전, 체크는 물가체크에서!</p>
                </a>

                <a href="https://easypick-ai.com" target="_blank" rel="noopener noreferrer" className="block group bg-[#111] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 p-4 rounded-xl transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-emerald-400 text-base group-hover:text-emerald-300">픽이지 (EasyPick-AI)(베타)</span>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">어려운 PC 조립? AI가 용도에 맞춰 견적을 짜드립니다.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}