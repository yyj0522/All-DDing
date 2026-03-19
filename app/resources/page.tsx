'use client';

import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { supabase } from '@/lib/supabase';

export default function ResourcesPage() {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  const handleDownload = async (fileType: string, fileUrl: string, fileName: string) => {
    try {
      await supabase.from('file_download_logs').insert([{ file_type: fileType }]);
    } catch (error) {
      console.error(error);
    }
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500/30 relative flex flex-col">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      <Header />

      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">자료실</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed tracking-wide">
            띵타이쿤 플레이를 돕는 모드를 다운로드 받을 수 있는 공간입니다.
          </p>
        </div>

        <div className="mb-10 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-sm shadow-xl">
          <h3 className="text-rose-400 font-bold flex items-center gap-2 mb-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            모드 사용 전 필독
          </h3>
          <p className="text-gray-300 leading-relaxed ml-7">
            본 자료실에 등록된 <span className="font-bold text-white">타이머 모드</span>는 개인 유저가 만든 모드로 띵타이쿤에서 공식적으로 제공하는 모드가 아닙니다. 개인이 제작해 문의를 통해 사용 및 배포 허가를 받은 모드입니다. <br className="hidden md:block"/>
            또한, <span className="text-rose-300 font-bold">해당 모드를 임의로 수정/변조하여 사용하거나, 타이머 모드 이외의 비인가 커스텀 모드를 사용하여 발생하는 모든 게임 내 불이익(정지 등)은 사용자 본인에게 있으며 올띵은 일체 책임지지 않습니다. 띵타이쿤의 규정,운영정책 변경시 이 페이지는 삭제될 수 있습니다.</span>
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div className="flex items-center gap-5 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-white">타이머 모드</h2>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-[10px] font-bold text-cyan-300 tracking-widest border border-cyan-500/30">공식 허가됨</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">인게임 제작 시간 및 쿨타임을 직관적으로 표시해주는 편의성 모드입니다.</p>
            </div>
          </div>
          
          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => handleDownload('fabric', 'https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-fabric-1.0.1.jar', 'timermod-fabric-1.0.1.jar')}
              className="w-full sm:w-auto bg-white/5 hover:bg-cyan-600 text-white font-bold tracking-widest px-6 py-3.5 rounded-xl transition-all duration-300 border border-white/10 flex justify-center items-center gap-2 whitespace-nowrap group"
            >
              <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Fabric 버전
            </button>
            <button 
              onClick={() => handleDownload('neoforge', 'https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-neoforge-1.0.1.jar', 'timermod-neoforge-1.0.1.jar')}
              className="w-full sm:w-auto bg-white/5 hover:bg-emerald-600 text-white font-bold tracking-widest px-6 py-3.5 rounded-xl transition-all duration-300 border border-white/10 flex justify-center items-center gap-2 whitespace-nowrap group"
            >
              <svg className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              NeoForge 버전
            </button>
          </div>
        </div>

        <div className="mb-16 text-center border-t border-white/5 pt-16 pb-10">
          <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-4 block">Tutorial & Guide</span>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">타이머 모드 사용법</h2>
          <p className="text-gray-400">설치부터 인게임 적용까지, 단계별로 쉽고 빠르게 알아봅니다.</p>
        </div>

        <article className="space-y-20">
          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">1</span>
              모드 파일 적용하기
            </h3>
            <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0a]">
               <img src={`${STORAGE_BASE_URL}/guide/guide1.png`} alt="모드 파일 적용 가이드" className="w-full h-auto object-contain block" />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              다운로드 받은 <code className="bg-black border border-white/10 px-2 py-1 rounded text-cyan-300 text-sm">timermod-fabric-1.0.1.jar</code> 또는 <code className="bg-black border border-white/10 px-2 py-1 rounded text-emerald-300 text-sm">timermod-neoforge-1.0.1.jar</code> 파일을 본인이 사용하는 로더(Fabric/NeoForge)에 맞춰 마인크래프트 설치 폴더 내의 <code className="bg-black border border-white/10 px-2 py-1 rounded text-cyan-300 text-sm">mods</code> 폴더에 넣어주세요. 패브릭 환경의 경우 <code className="bg-black border border-white/10 px-2 py-1 rounded text-cyan-300 text-sm">Fabric api</code> 파일이 함께 설치되어 있어야 정상 작동합니다. 오류나 적용이 안된다면 하단 의견남기기를 해주시면 최대한 빠른 답장 드리겠습니다.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">2</span>
              인게임 설정 창 호출 (F12)
            </h3>
            <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0a]">
               <img src={`${STORAGE_BASE_URL}/guide/guide2.png`} alt="인게임 설정 창 가이드" className="w-full h-auto object-contain block" />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              게임 접속 후 <strong className="text-white">F12 키</strong>를 누르면 제작시간 감소 스킬 설정 창이 나타납니다. 이곳에서 각 스킬의 현재 레벨을 설정하면, 쿨타임 감소가 적용됩니다. 또한, 처음 모드 적용 시 위치설정버튼을 통해 위치를 잡아주셔야합니다.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">3</span>
              작동여부 확인
            </h3>
            <div className="w-full border border-white/10 rounded-2xl overflow-hidden bg-[#0a0a0a]">
               <img src={`${STORAGE_BASE_URL}/guide/guide3.png`} alt="작동 여부 확인 가이드" className="w-full h-auto object-contain block" />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              모드가 정상작동한다면 청사진에서 아이템 가공 시 우측하단에 타이머가 작동하게 됩니다.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}