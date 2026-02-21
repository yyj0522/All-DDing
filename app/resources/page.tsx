import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">자료실</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed tracking-wide">
            플레이를 돕는 공식 인증 도구 및 유저들이 제작한 꿀팁 시트지를 모아두었습니다.
          </p>
        </div>

        <div className="mb-10 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-sm shadow-xl">
          <h3 className="text-rose-400 font-bold flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            모드 사용 전 필독
          </h3>
          <p className="text-gray-300 leading-relaxed ml-7">
            본 자료실에 등록된 <span className="font-bold text-white">타이머 모드</span>는 공식 문의를 거쳐 사용 및 배포 허가를 받은 안전한 파일입니다. <br className="hidden md:block"/>
            단, <span className="text-rose-300 font-bold">해당 모드를 임의로 수정/변조하여 사용하거나, 본 사이트에서 제공하지 않은 비인가 커스텀 모드를 사용하여 발생하는 모든 게임 내 불이익(정지 등)은 사용자 본인에게 있으며 올띵은 일체 책임지지 않습니다.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-16">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-5 flex-1">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">Fabric 타이머 모드</h2>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[10px] font-bold text-cyan-300 tracking-widest border border-cyan-500/30">공식 허가됨</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">인게임 제작 시간 및 쿨타임을 직관적으로 표시해주는 편의성 모드입니다.</p>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <Link href="/resources/guide" className="w-full sm:w-auto bg-black hover:bg-white/5 text-gray-300 font-bold tracking-widest px-6 py-3.5 rounded-xl transition-all duration-300 border border-white/10 flex justify-center items-center gap-2 whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                사용법 안내
              </Link>
              <button className="w-full sm:w-auto bg-white/5 hover:bg-cyan-600 text-white font-bold tracking-widest px-8 py-3.5 rounded-xl transition-all duration-300 border border-white/10 flex justify-center items-center gap-2 whitespace-nowrap group">
                <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                다운로드
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111] to-[#050505] border border-white/5 rounded-3xl p-8 md:p-10 relative overflow-hidden text-center flex flex-col items-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-gray-400">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 relative z-10">유저 제작 자료를 제보해주세요!</h2>
          <p className="text-gray-400 text-sm max-w-lg leading-relaxed relative z-10 mb-6">
            개인적으로 개발하신 유용한 스프레드시트, 정보 정리 이미지, 기타 툴 등이 있다면 공유해주세요. 
            검토 후 작성자의 닉네임과 함께 이 공간에 게시해 드립니다.
          </p>
          <div className="bg-black border border-white/10 px-6 py-3 rounded-lg text-sm font-bold text-gray-300 relative z-10 font-mono select-all shadow-inner">
            제보 및 문의 : alldding_support@example.com
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}