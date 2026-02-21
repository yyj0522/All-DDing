export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-white/5 bg-[#050505] mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="text-xl font-black text-white tracking-widest mb-1" style={{ textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>
            올띵
          </span>
          <span className="text-xs font-medium text-gray-500 tracking-wide">
            띵타이쿤 플레이어를 위한 비영리 팬 메이드 종합 도구 모음
          </span>
        </div>
        <div className="flex flex-col items-center md:items-end text-sm">
          <span className="text-gray-400 font-bold mb-1">문의 및 오류/제보</span>
          <a href="mailto:alldding_support@example.com" className="text-gray-300 hover:text-white transition-colors font-mono font-medium">
            alldding_support@example.com
          </a>
        </div>
      </div>
    </footer>
  );
}