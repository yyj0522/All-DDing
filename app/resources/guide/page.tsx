import Link from 'next/link';
import Image from 'next/image';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-cyan-500/30 pb-20">
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-4 flex items-center justify-between">
        <Link href="/resources" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="hidden md:inline text-xs font-black tracking-widest uppercase">Back to Resources</span>
        </Link>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-lg md:text-xl font-black tracking-widest text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">ALL-DDING</div>
        <div className="w-16"></div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-16 text-center border-b border-white/5 pb-10">
          <span className="text-cyan-400 font-bold text-sm tracking-widest uppercase mb-4 block">Tutorial & Guide</span>
          <h1 className="text-4xl font-black text-white mb-4">Fabric 타이머 모드 사용법</h1>
          <p className="text-gray-400">설치부터 인게임 적용까지, 단계별로 쉽고 빠르게 알아봅니다.</p>
        </div>

        <article className="space-y-20">
          {/* 섹션 1 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">1</span>
              모드 파일 적용하기
            </h2>
            <div className="w-full relative bg-black border border-white/10 rounded-2xl overflow-hidden aspect-video">
              {/* Next.js 공식 Image 컴포넌트로 교체 */}
              <Image 
                src="/guide/guide1.png" 
                alt="모드 파일 적용 가이드" 
                fill 
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              다운로드 받은 <code className="bg-black border border-white/10 px-2 py-1 rounded text-cyan-300 text-sm">Timer_mod.jar</code> 파일을 마인크래프트 설치 폴더 내의 <code className="bg-black border border-white/10 px-2 py-1 rounded text-cyan-300 text-sm">mods</code> 폴더에 넣어주세요. Fabric api 파일이 정상적으로 설치되어 있어야 작동합니다.
            </p>
          </section>

          {/* 섹션 2 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">2</span>
              인게임 설정 창 호출 (F12)
            </h2>
            <div className="w-full relative bg-black border border-white/10 rounded-2xl overflow-hidden aspect-video">
              {/* Next.js 공식 Image 컴포넌트로 교체 */}
              <Image 
                src="/guide/guide2.png" 
                alt="인게임 설정 창 가이드" 
                fill 
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              게임 접속 후 <strong className="text-white">F12 키</strong>를 누르면 제작시간 감소 스킬 설정 창이 나타납니다. 이곳에서 각 스킬의 현재 레벨을 설정하면, 쿨타임 감소가 적용됩니다.
            </p>
          </section>

          {/* 섹션 3 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black">3</span>
              작동 여부 확인
            </h2>
            <div className="w-full relative bg-black border border-white/10 rounded-2xl overflow-hidden aspect-video">
              {/* Next.js 공식 Image 컴포넌트로 교체 */}
              <Image 
                src="/guide/guide3.png" 
                alt="작동 여부 확인 가이드" 
                fill 
                className="object-contain p-2"
                unoptimized
              />
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              모드가 정상 작동한다면 청사진에서 아이템 가공 시 우측 하단에 타이머가 나타나게 됩니다.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}