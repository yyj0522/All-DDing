'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

type Category = '전체' | '농장' | '광산' | '양식장' | '과수원' | '서식지' | '푸른석상' | '하얀석상';

const MARKERS = [
  { id: 'farm_tomato', name: '토마토 농장', x: -560, z: -70, realX: -620, realZ: -95, cat: '농장' },
  { id: 'farm_onion', name: '양파 농장', x: -280, z: 100, realX: -320, realZ: 5, cat: '농장' },
  { id: 'farm_garlic', name: '마늘 농장', x: -570, z: 380, realX: -565, realZ: 290, cat: '농장' },
  { id: 'mine_corum', name: '코룸 광산', x: -600, z: 250, realX: -645, realZ: 170, cat: '광산' },
  { id: 'mine_lipton', name: '리프톤 광산', x: -175, z: -40, realX: -195, realZ: -70, cat: '광산' },
  { id: 'mine_serent', name: '세렌트 광산', x: 0, z: 225, realX: -5, realZ: 175, cat: '광산' },
  { id: 'aqua_oyster', name: '굴 양식장', x: -400, z: -175, realX: -415, realZ: -180, cat: '양식장' },
  { id: 'aqua_conch', name: '소라/문어 양식장', x: -780, z: 520, realX: -754, realZ: -410, cat: '양식장' },
  { id: 'aqua_seaweed', name: '미역/성게 양식장', x: -250, z: 510, realX: -300, realZ: 420, cat: '양식장' },
  { id: 'orchard_pineapple', name: '파인애플 과수원', x: -455, z: -10, realX: -475, realZ: -45, cat: '과수원' },
  { id: 'orchard_coconut', name: '코넛 과수원', x: -295, z: 275, realX: -295, realZ: 235, cat: '과수원' },
  { id: 'hab_giraffe', name: '기린/코끼리 서식지', x: -470, z: 80, realX: -525, realZ: -20, cat: '서식지' },
  { id: 'hab_hippo', name: '하마/플라밍고 서식지', x: -260, z: -50, realX: -310, realZ: -100, cat: '서식지' },
  { id: 'hab_meerkat', name: '미어캣/사슴 서식지', x: 20, z: 350, realX: -5, realZ: 230, cat: '서식지' },
  { id: 'hab_bear', name: '곰 서식지', x: 20, z: 0, realX: -5, realZ: -65, cat: '서식지' },
  { id: 'hab_turkey', name: '칠면조 서식지', x: -50, z: -160, realX: -75, realZ: -205, cat: '서식지' },
  { id: 'blue_1', name: '푸른석상 (초입)', x: -527, z: 20, realX: -542, realZ: -33, cat: '푸른석상' },
  { id: 'blue_2', name: '푸른석상 (구릉)', x: -653, z: 350, realX: -668, realZ: 289, cat: '푸른석상' },
  { id: 'blue_3', name: '푸른석상 (계곡)', x: -218, z: 360, realX: -240, realZ: 298, cat: '푸른석상' },
  { id: 'blue_4', name: '푸른석상 (성 옛터)', x: -357, z: 235, realX: -377, realZ: 178, cat: '푸른석상' },
  { id: 'blue_5', name: '푸른석상 (골짜기)', x: -338, z: 14, realX: -359, realZ: -37, cat: '푸른석상' },
  { id: 'white_1', name: '하얀석상 (산맥)', x: -60, z: -140, realX: -85, realZ: -187, cat: '하얀석상' },
  { id: 'white_2', name: '하얀석상 (마을 옛터)', x: 26, z: 89, realX: -2, realZ: 35, cat: '하얀석상' },
  { id: 'white_3', name: '하얀석상 (계곡)', x: -71, z: 310, realX: -87, realZ: 253, cat: '하얀석상' },
];

const CAT_COLORS: Record<string, { bg: string, text: string, ring: string }> = {
  '농장': { bg: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  '광산': { bg: 'bg-slate-400', text: 'text-slate-400', ring: 'ring-slate-400/30' },
  '양식장': { bg: 'bg-cyan-400', text: 'text-cyan-400', ring: 'ring-cyan-400/30' },
  '과수원': { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/30' },
  '서식지': { bg: 'bg-rose-500', text: 'text-rose-500', ring: 'ring-rose-500/30' },
  '푸른석상': { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500/30' },
  '하얀석상': { bg: 'bg-gray-100', text: 'text-gray-100', ring: 'ring-gray-100/30' },
};

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";
const ZOOM_LEVEL = 2.5;

const getMapPosition = (mcX: number, mcZ: number) => {
  const offsetX = -10, offsetZ = -100;
  const finalX = mcX + offsetX, finalZ = mcZ + offsetZ;
  const ref1_mcX = -735, ref1_mcZ = -217, ref1_pctX = 18.66, ref1_pctY = 25.06;
  const ref2_mcX = 25, ref2_mcZ = 129, ref2_pctX = 75.63, ref2_pctY = 58.89;
  const scaleX = (ref2_pctX - ref1_pctX) / (ref2_mcX - ref1_mcX);
  const scaleY = (ref2_pctY - ref1_pctY) / (ref2_mcZ - ref1_mcZ);
  return { left: `${ref1_pctX + (finalX - ref1_mcX) * scaleX}%`, top: `${ref1_pctY + (finalZ - ref1_mcZ) * scaleY}%` };
};

export default function MapPage() {
  const [activeCat, setActiveCat] = useState<Category>('전체');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [mag, setMag] = useState({ active: false, x: 0, y: 0, mapW: 0, mapH: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleExit = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleExit);
    return () => document.removeEventListener('fullscreenchange', handleExit);
  }, []);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (mag.active) { setMag({ ...mag, active: false }); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    let cx, cy;
    if ('touches' in e) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }
    setMag({ active: true, x: cx - rect.left, y: cy - rect.top, mapW: rect.width, mapH: rect.height });
  };

  const renderMarkers = (isMag: boolean) => (
    MARKERS.filter(m => activeCat === '전체' || m.cat === activeCat).map((m) => {
      const pos = getMapPosition(m.x, m.z);
      const colors = CAT_COLORS[m.cat];
      const isSel = selectedMarkerId === m.id;
      return (
        <div 
          key={m.id} 
          className={`absolute -translate-x-1/2 -translate-y-full pointer-events-auto transition-all ${isSel ? 'z-[1001]' : 'z-[100]'}`} 
          style={pos}
        >
          <div className="relative cursor-pointer flex flex-col items-center pb-1" onClick={(e) => { if (isMag) return; e.stopPropagation(); setSelectedMarkerId(isSel ? null : m.id); }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 md:w-7 md:h-7 drop-shadow-md ${colors.text} transition-transform ${isSel ? 'scale-125 -translate-y-1' : ''}`}>
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 ${isSel ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className={`bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 px-3 py-2 rounded-xl shadow-2xl flex flex-col items-center min-w-[115px] ring-2 ${colors.ring}`}>
              <span className={`text-[9px] font-black tracking-widest uppercase mb-0.5 ${colors.text}`}>{m.cat}</span>
              <span className="text-xs font-bold text-white whitespace-nowrap">{m.name}</span>
              <div className="w-full h-px bg-white/5 my-1.5"></div>
              <div className="flex gap-2 text-[10px] font-mono font-bold text-gray-300">
                <span>X: {m.realX}</span><span>Z: {m.realZ}</span>
              </div>
            </div>
            <div className="w-2.5 h-2.5 bg-[#0a0a0a] border-r border-b border-white/10 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      );
    })
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex flex-col relative overflow-x-hidden">
      <div className="absolute top-[-10%] left-[-5%] w-full h-[40%] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none"></div>
      <Header />
      <main className="relative z-10 flex-1 max-w-[1200px] w-full mx-auto px-4 pt-28 md:pt-40 pb-20 flex flex-col items-center">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full max-w-[1000px] mb-8 border-b border-white/5 pb-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">아일랜드 <span className="text-emerald-500">지도</span></h1>
            <p className="text-gray-400 text-xs md:text-base max-w-lg break-keep px-2 italic opacity-80">지도를 클릭하여 확대하고 마커를 눌러 좌표를 확인하세요.</p>
          </div>
          <button onClick={handleFullscreen} className="md:hidden flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-5 py-3 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
            모바일 전체화면
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start justify-center w-full relative max-w-[1100px]">
          <div className="w-full lg:w-44 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
            {(['전체', '농장', '광산', '과수원', '양식장', '서식지', '푸른석상', '하얀석상'] as Category[]).map((cat) => (
              <button key={cat} onClick={() => { setActiveCat(cat); setSelectedMarkerId(null); }} className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all border-2 ${activeCat === cat ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-lg' : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:border-white/20'}`}>{cat}</button>
            ))}
          </div>

          <div ref={mapContainerRef} className={`flex-1 w-full relative flex justify-center bg-[#050505] rounded-[1.5rem] p-1 border border-white/5 ${isFullscreen ? 'flex items-center justify-center !p-0 bg-black' : ''}`}>
            <div className={`relative w-full max-w-[900px] transition-all duration-300 rounded-xl ${mag.active ? 'cursor-auto' : 'cursor-crosshair'}`} onClick={handleMapClick}>
              <img src={`${STORAGE_BASE_URL}/map.png`} alt="Map" className="w-full h-auto block select-none rounded-lg" draggable={false} />
              <div className="absolute inset-0 pointer-events-none">{renderMarkers(false)}</div>
              {mag.active && (
                <>
                  <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px]" onClick={(e) => { e.stopPropagation(); setMag({ ...mag, active: false }); }} />
                  <div className="absolute border-[2px] border-white/40 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden z-[120] bg-[#050505] pointer-events-none" style={{ width: 'min(240px, 55vw)', height: 'min(240px, 55vw)', left: mag.x, top: mag.y, transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)' }}>
                    <div className="absolute origin-top-left" style={{ width: mag.mapW * ZOOM_LEVEL, height: mag.mapH * ZOOM_LEVEL, left: `calc(min(120px, 27.5vw) - ${mag.x * ZOOM_LEVEL}px)`, top: `calc(min(120px, 27.5vw) - ${mag.y * ZOOM_LEVEL}px)` }}>
                      <img src={`${STORAGE_BASE_URL}/map.png`} className="w-full h-auto block" alt="" />
                      <div className="absolute inset-0">{renderMarkers(true)}</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            {isFullscreen && (
               <button onClick={() => document.exitFullscreen()} className="fixed top-6 right-6 z-[2000] bg-black/80 p-4 rounded-full text-white border border-white/20 shadow-2xl font-black">X</button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}