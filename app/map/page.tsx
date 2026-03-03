'use client';

import { useState, useRef } from 'react';
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

const STORAGE_BASE_URL = "https://kwefkeqvltaiixylcewm.supabase.co/storage/v1/object/public/alldding-assets";

const getMapPosition = (mcX: number, mcZ: number) => {
  const offsetX = -10; 
  const offsetZ = -100;
  const finalX = mcX + offsetX;
  const finalZ = mcZ + offsetZ;
  const ref1_mcX = -735; const ref1_mcZ = -217;
  const ref1_pctX = 18.66; const ref1_pctY = 25.06;
  const ref2_mcX = 25; const ref2_mcZ = 129;
  const ref2_pctX = 75.63; const ref2_pctY = 58.89;
  const scaleX = (ref2_pctX - ref1_pctX) / (ref2_mcX - ref1_mcX);
  const scaleY = (ref2_pctY - ref1_pctY) / (ref2_mcZ - ref1_mcZ);
  const pctX = ref1_pctX + (finalX - ref1_mcX) * scaleX;
  const pctY = ref1_pctY + (finalZ - ref1_mcZ) * scaleY;
  return { left: `${pctX}%`, top: `${pctY}%` };
};

const ZOOM_LEVEL = 2.5; 

export default function MapPage() {
  const [activeCat, setActiveCat] = useState<Category>('전체');
  const [mag, setMag] = useState({ active: false, x: 0, y: 0, mapW: 0, mapH: 0 });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mag.active) {
      setMag({ ...mag, active: false });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMag({ active: true, x, y, mapW: rect.width, mapH: rect.height });
  };

  const renderMapContent = (isMagnifier = false) => (
    <>
      <img 
        src={`${STORAGE_BASE_URL}/map.png`} 
        alt="아일랜드 상세 지도" 
        className="w-full h-auto block pointer-events-none select-none"
        draggable={false}
        style={isMagnifier ? { imageRendering: '-webkit-optimize-contrast' as any } : {}}
      />
      <div className="absolute inset-0 pointer-events-none">
        {MARKERS.filter(m => activeCat === '전체' || m.cat === activeCat).map((marker) => {
          const pos = getMapPosition(marker.x, marker.z);
          const colors = CAT_COLORS[marker.cat];
          return (
            <div 
              key={marker.id} 
              className={`absolute z-10 -translate-x-1/2 -translate-y-full flex flex-col items-center ${isMagnifier ? '' : 'group hover:z-50 pointer-events-auto'}`}
              style={pos}
            >
              <div className="relative cursor-pointer flex flex-col items-center pb-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 md:w-7 md:h-7 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] ${colors.text} transition-transform ${isMagnifier ? '' : 'group-hover:scale-125 group-hover:-translate-y-2'}`}>
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="absolute top-full pointer-events-none whitespace-nowrap mt-[-2px]">
                 <span className={`bg-black/80 backdrop-blur-md border border-white/10 text-gray-200 font-bold px-1.5 py-0.5 rounded shadow-sm ${isMagnifier ? 'text-xs' : 'text-[10px]'}`}>
                   {marker.name}
                 </span>
              </div>
              {!isMagnifier && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-3 group-hover:translate-y-0 z-50">
                  <div className={`bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl shadow-2xl flex flex-col items-center min-w-[130px] ring-2 ${colors.ring}`}>
                    <span className={`text-[10px] font-black tracking-widest uppercase mb-1 ${colors.text}`}>{marker.cat}</span>
                    <span className="text-sm font-bold text-white whitespace-nowrap">{marker.name}</span>
                    <div className="w-full h-px bg-white/10 my-2"></div>
                    <div className="flex gap-3 text-xs font-mono font-bold">
                      <span className="text-gray-400">X: <span className="text-gray-200">{marker.realX}</span></span>
                      <span className="text-gray-400">Z: <span className="text-gray-200">{marker.realZ}</span></span>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-[#0a0a0a] border-r border-b border-white/10 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-emerald-500/30 flex flex-col relative overflow-x-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none"></div>
      <Header />
      <main className="relative z-10 flex-1 max-w-[1200px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20 flex flex-col items-center">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full max-w-[1150px] mb-10 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4">아일랜드 지도</h1>
            <p className="text-gray-400 text-sm md:text-base tracking-wide">
              지도 위를 클릭하여 상세 위치를 돋보기로 확인하고, 마커에 마우스를 올려 인게임 좌표를 파악하세요.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/10 px-6 py-3.5 rounded-2xl shadow-xl flex-shrink-0 h-fit">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-sm font-bold text-gray-400">돋보기 확대 배율</span>
            <span className="text-emerald-400 font-black text-lg">{ZOOM_LEVEL * 100}%</span>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full relative max-w-[1150px]">
          <div className="w-full lg:w-48 flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto custom-scrollbar pb-2 lg:pb-0">
            {(['전체', '농장', '광산', '과수원', '양식장', '서식지', '푸른석상', '하얀석상'] as Category[]).map((cat) => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-5 py-3.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap text-left ${activeCat === cat ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-[#0a0a0a] border border-white/5 text-gray-500 hover:text-white hover:border-white/20'}`}>{cat}</button>
            ))}
          </div>
          <div className="flex-1 w-full relative flex justify-center my-8 lg:my-0">
            <div className={`relative w-full max-w-[950px] transition-all duration-300 ${mag.active ? 'cursor-auto' : 'cursor-crosshair hover:opacity-90'}`} onClick={handleMapClick}>
              {renderMapContent(false)}
              {mag.active && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMag({ ...mag, active: false }); }} />
                  <div className="absolute border-[3px] border-white/30 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-50 bg-[#050505] pointer-events-none" style={{ width: 360, height: 360, left: mag.x, top: mag.y, transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}>
                    <div className="absolute origin-top-left" style={{ width: mag.mapW * ZOOM_LEVEL, height: mag.mapH * ZOOM_LEVEL, left: 180 - (mag.x * ZOOM_LEVEL), top: 180 - (mag.y * ZOOM_LEVEL) }}>
                      {renderMapContent(true)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}