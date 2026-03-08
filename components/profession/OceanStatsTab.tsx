'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getCachedPrices, supabase } from '@/lib/supabase';
import { getImagePath, CRAFT_MAX_PRICES, getCraftingPeriod } from '@/lib/professionData';
import { toPng } from 'html-to-image';

const FIXED_ORDER = [
  "조개껍데기 브로치",
  "푸른 향수병",
  "자개 손거울",
  "분홍 헤어핀",
  "자개 부채",
  "흑진주 시계"
];

export default function OceanStatsTab() {
  const [dbData, setDbData] = useState<any[]>([]);
  const [selectedCraft, setSelectedCraft] = useState(FIXED_ORDER[0]);
  const [latestPeriod, setLatestPeriod] = useState<string>(getCraftingPeriod());
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const allData = await getCachedPrices();
      const data = allData.filter((d: any) => d.category === 'craft');
      
      if (data && data.length > 0) {
        setDbData(data);
        const periods = Array.from(new Set(data.map((d: any) => d.period))).filter(Boolean);
        if (periods.length > 0) setLatestPeriod(periods[periods.length - 1] as string);
      }
    };
    fetchData();
  }, []);

  const processedData = useMemo(() => {
    return FIXED_ORDER.map(name => {
      const history = dbData
        .filter(d => d.item_name === name && d.period)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (history.length === 0) return { name, current: 0, diff: 0, percent: 0, history: [] };

      const currentItem = history[history.length - 1];
      const prevItem = history.length > 1 ? history[history.length - 2] : currentItem;
      const current = currentItem.price;
      const diff = current - prevItem.price;
      const maxPrice = CRAFT_MAX_PRICES[name] || 1;
      const percent = Math.round((current / maxPrice) * 100);

      return { name, current, diff, percent, history };
    });
  }, [dbData]);

  const selectedData = processedData.find(d => d.name === selectedCraft) || { history: [] };
  const graphData = selectedData.history.slice(-5).map((h: any) => ({ period: h.period, price: h.price }));

  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        width: 1600,
        style: { transform: 'scale(1)', margin: '0' }
      });
      const link = document.createElement('a');
      link.download = `올띵_해양공예품시세_${latestPeriod}.png`;
      link.href = dataUrl;
      link.click();

      await supabase.from('image_download_logs').insert([{ category: 'ocean' }]);

    } catch (error) {
      console.error(error);
    }
  };

  const renderLineChart = () => {
    if (graphData.length === 0) return null;
    const width = 600;
    const height = 250;
    const paddingX = 60;
    const paddingTop = 40;
    const paddingBottom = 40;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingTop - paddingBottom;

    const minPrice = Math.min(...graphData.map((d: any) => d.price));
    const maxPrice = Math.max(...graphData.map((d: any) => d.price));
    const range = maxPrice - minPrice || 1;
    const graphMin = Math.max(0, minPrice - range * 0.2);
    const graphMax = maxPrice + range * 0.2;

    const getX = (index: number) => graphData.length === 1 ? width / 2 : paddingX + (index * (usableWidth / (graphData.length - 1)));
    const getY = (price: number) => height - paddingBottom - ((price - graphMin) / (graphMax - graphMin)) * usableHeight;

    const points = graphData.map((d: any, i: number) => `${getX(i)},${getY(d.price)}`).join(' ');
    const areaPoints = `${getX(0)},${height - paddingBottom} ${points} ${getX(graphData.length - 1)},${height - paddingBottom}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-xl overflow-visible">
        <defs>
          <linearGradient id="oceanAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#oceanAreaGrad)" />
        <polyline points={points} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {graphData.map((d: any, i: number) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.price)} r="6" fill="#0a0a0a" stroke="#22d3ee" strokeWidth="3" />
            <text x={getX(i)} y={getY(d.price) - 15} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">{d.price.toLocaleString()} G</text>
            <text x={getX(i)} y={height - 10} fill="#6b7280" fontSize="12" fontWeight="bold" textAnchor="middle">{d.period}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full relative">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">공예품 변동 시세 트렌드</h3>
            <p className="text-sm text-gray-400">최근 5일 동안의 가격 변동폭입니다.</p>
          </div>
          <div className="flex items-center gap-3 bg-black border border-white/10 px-4 py-2.5 rounded-xl">
            <span className="text-xs font-bold text-gray-500">품목 선택</span>
            <select value={selectedCraft} onChange={(e) => setSelectedCraft(e.target.value)} className="bg-transparent text-cyan-400 text-sm font-bold focus:outline-none">
              {FIXED_ORDER.map(name => <option key={name} value={name} className="bg-[#0a0a0a]">{name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 w-full relative pt-4">
          {renderLineChart()}
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-1">해양 공예품 시세 전광판</h3>
            <p className="text-xs text-gray-500">현재 주기 기준, 직전 주기 대비 등락폭을 고정된 순서로 표시합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-lg text-xs font-bold">{latestPeriod} 기준</span>
            <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-white/5 hover:bg-cyan-600 text-white border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              이미지로 저장
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {processedData.map((craft, idx) => {
            const isUp = craft.diff > 0;
            const imgPath = getImagePath(craft.name);
            return (
              <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedCraft(craft.name)}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center overflow-hidden p-1">
                    {imgPath ? <img src={imgPath} alt={craft.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} /> : <span className="text-[8px] text-gray-500">IMG</span>}
                  </div>
                  <span className="text-sm md:text-base font-bold text-white">{craft.name}</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
                  <div className="text-right min-w-[80px]">
                    <span className="text-amber-400 font-black text-base md:text-lg">{craft.current.toLocaleString()}</span>
                    <span className="text-amber-600 font-bold text-xs ml-1">Gold</span>
                  </div>
                  <div className={`flex items-center gap-1 min-w-[70px] justify-end ${isUp ? 'text-red-500' : craft.diff < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                    <span className="font-bold text-sm">{Math.abs(craft.diff).toLocaleString()}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : craft.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
                    </svg>
                  </div>
                  <div className="hidden md:block min-w-[120px] text-right">
                    <span className="text-gray-500 text-xs font-bold">( 최고가의 <span className="text-white">{craft.percent}%</span> )</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed top-[-10000px] left-[-10000px] opacity-0 pointer-events-none z-[-50]">
        <div ref={captureRef} style={{ width: '1600px', minWidth: '1600px', backgroundColor: '#0a0a0a', fontFamily: 'sans-serif' }} className="p-16 flex flex-col gap-14">
          
          <div className="flex justify-between items-end border-b-4 border-white/10 pb-10">
            <div>
              <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 tracking-tight">ALL-DDING 공예품 시세</h2>
              <p className="text-gray-400 text-3xl font-medium tracking-wide">띵타이쿤 실시간 해양 공예품 시세 전광판</p>
            </div>
            <div className="bg-cyan-500/10 border-4 border-cyan-500/30 px-10 py-5 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.15)]">
              <span className="text-cyan-400 font-black text-4xl tracking-wider">{latestPeriod} 기준</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-10 w-full">
            {processedData.map((craft, idx) => {
              const isUp = craft.diff > 0;
              const imgPath = getImagePath(craft.name);
              
              return (
                <div key={idx} className="flex flex-col items-center bg-[#111] border-[3px] border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-cyan-500/20 via-cyan-500/5 to-transparent"></div>

                  <div className="relative z-10 w-56 h-56 mb-10 mt-4 flex items-center justify-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                    {imgPath ? <img src={imgPath} alt={craft.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} /> : <div className="w-full h-full bg-gray-800 rounded-3xl"></div>}
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center mb-10 h-[140px] justify-start w-full">
                    <h4 className="text-5xl font-black text-white mb-6 text-center break-keep-all leading-tight">{craft.name}</h4>
                    <div className="bg-black/60 border-2 border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                      <span className="text-gray-400 text-xl font-bold">최고가 대비</span>
                      <span className="text-white font-black text-3xl">{craft.percent}%</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-full bg-black/60 border-2 border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-4 mt-auto shadow-2xl">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-amber-400 tracking-tighter">{craft.current.toLocaleString()}</span>
                      <span className="text-amber-600 font-bold text-3xl">G</span>
                    </div>
                    <div className={`flex items-center justify-center gap-3 w-full px-5 py-3 rounded-2xl font-black text-3xl ${isUp ? 'bg-red-500/10 text-red-500' : craft.diff < 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      <span>{Math.abs(craft.diff).toLocaleString()}</span>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : craft.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-10 border-t-4 border-white/10 flex justify-center items-center text-gray-500 text-3xl font-bold">
            <span className="text-white/40">Provided by <span className="text-white/80">올띵 (ALL-DDING)</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}