'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; 

export default function Footer() {
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [wantsReply, setWantsReply] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackContent.trim()) {
      alert('문의 내용을 입력해주세요.');
      return;
    }
    if (wantsReply && !userEmail.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('feedbacks').insert([
      { 
        content: feedbackContent, 
        email: wantsReply ? userEmail : null,
        is_read: false 
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert('오류가 발생했습니다: ' + error.message);
    } else {
      alert('소중한 의견이 전송되었습니다. 감사합니다!');
      setFeedbackContent('');
      setWantsReply(false);
      setUserEmail('');
      setIsFeedbackModalOpen(false);
    }
  };

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
              <button 
                onClick={() => setIsFeedbackModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors font-medium text-xs bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/10 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                의견 남기기
              </button>
            </div>
            
            <button 
              onClick={() => setIsDeveloperModalOpen(true)}
              className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold px-4 py-2 rounded-lg border border-fuchsia-500/20 transition-all shadow-[0_0_10px_rgba(217,70,239,0.1)] flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              만든 사람 (Developer)
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
                  개발을 공부하는 학생으로 사이드 프로젝트로 몇 가지 사이트를 만들어서 운영중에 있습니다.
                  시간이 날 때 제가 만든 다른 사이트들도 방문해주시면 감사하겠습니다.
                </p>
              </div>
              <div className="space-y-3">
                <a href="https://mulgacheck.com" target="_blank" rel="noopener noreferrer" className="block group bg-[#111] hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/50 p-4 rounded-xl transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-blue-400 text-base group-hover:text-blue-300">물가체크 (MulgaCheck)(Beta)</span>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">해외여행 가기 전, 체크는 물가체크에서!</p>
                </a>
                <a href="https://easypick-ai.com" target="_blank" rel="noopener noreferrer" className="block group bg-[#111] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 p-4 rounded-xl transition-all">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-emerald-400 text-base group-hover:text-emerald-300">픽이지 (EasyPick-AI)(Beta)</span>
                    <svg className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">어려운 PC 조립? AI가 용도에 맞춰 견적을 짜드립니다.</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setIsFeedbackModalOpen(false)}>
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">의견 보내기</h3>
                  <p className="text-xs text-gray-400">버그 제보, 기능 건의 등 자유롭게 남겨주세요.</p>
                </div>
                <button onClick={() => setIsFeedbackModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <textarea 
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    maxLength={200}
                    rows={5}
                    placeholder="내용을 입력해주세요 (최대 200자)"
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500 resize-none custom-scrollbar"
                  />
                  <div className="text-right text-[10px] text-gray-500 mt-1">{feedbackContent.length} / 200</div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={wantsReply}
                      onChange={(e) => setWantsReply(e.target.value === 'true' ? true : e.target.checked)} // 버그 방지
                      className="peer appearance-none w-4 h-4 border border-gray-600 rounded bg-transparent checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer"
                    />
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-gray-300 select-none">답변을 받고 싶습니다 (선택)</span>
                </label>

                {wantsReply && (
                  <div className="animate-fade-in-up">
                    <input 
                      type="email" 
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="이메일 주소 입력"
                      className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-gray-500 mt-1.5 ml-1">입력하신 이메일은 답변 용도로만 사용되며 안전하게 파기됩니다.</p>
                  </div>
                )}

                <button 
                  onClick={handleFeedbackSubmit}
                  disabled={isSubmitting || feedbackContent.trim().length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? '전송 중...' : '보내기'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}