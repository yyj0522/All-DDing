'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getCachedPrices, supabase } from '@/lib/supabase';
import { FOOD_NAMES, getImagePath, FOOD_MAX_PRICES } from '@/lib/professionData';
import { toPng } from 'html-to-image';
import { useTheme } from 'next-themes';

export default function FarmingStatsTab() {
  const [dbData, setDbData] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState(FOOD_NAMES[0]);
  const [latestPeriod, setLatestPeriod] = useState<string>('데이터 불러오는 중...');
  const captureRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      const allData = await getCachedPrices();
      const data = allData.filter((d: any) => d.category === 'food');
      
      if (data && data.length > 0) {
        setDbData(data);
        const periods = Array.from(new Set(data.map((d: any) => d.period))).filter(Boolean);
        if (periods.length > 0) {
          setLatestPeriod(periods[periods.length - 1] as string);
        }
      }
    };
    fetchData();
  }, []);

  const processedData = useMemo(() => {
    return FOOD_NAMES.map(name => {
      const history = dbData
        .filter(d => d.item_name === name && d.period)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      if (history.length === 0) return { name, current: 0, diff: 0, percent: 0, history: [] };
      
      const currentItem = history[history.length - 1];
      const prevItem = history.length > 1 ? history[history.length - 2] : currentItem;
      const current = currentItem.price;
      const diff = current - prevItem.price;
      const maxPrice = FOOD_MAX_PRICES[name] || 1;
      const percent = Math.round((current / maxPrice) * 100);
      
      return { name, current, diff, percent, history };
    }).sort((a, b) => b.percent - a.percent);
  }, [dbData]);

  const top3Data = processedData.slice(0, 3);
  const remainingData = processedData.slice(3);

  const selectedFoodData = processedData.find(d => d.name === selectedFood) || { history: [] };
  const graphData = selectedFoodData.history.slice(-5).map((h: any) => ({ period: h.period, price: h.price }));
  
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
      link.download = `올띵_요리시세_${latestPeriod}.png`;
      link.href = dataUrl;
      link.click();

      await supabase.from('image_download_logs').insert([{ category: 'farming' }]);

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

    const isLight = theme === 'light';
    const pointColor = isLight ? '#16a34a' : '#4ade80';
    const textColor = isLight ? '#111827' : 'white';
    const circleFill = isLight ? '#ffffff' : '#0a0a0a';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-md dark:drop-shadow-xl overflow-visible">
        <defs>
          <linearGradient id="farmAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={pointColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={pointColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#farmAreaGrad)" />
        <polyline points={points} fill="none" stroke={pointColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {graphData.map((d: any, i: number) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.price)} r="6" fill={circleFill} stroke={pointColor} strokeWidth="3" />
            <text x={getX(i)} y={getY(d.price) - 15} fill={textColor} fontSize="14" fontWeight="bold" textAnchor="middle">{d.price.toLocaleString()} G</text>
            <text x={getX(i)} y={height - 10} fill="#6b7280" fontSize="12" fontWeight="bold" textAnchor="middle">{d.period}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full relative transition-colors duration-300">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-sm dark:shadow-2xl flex flex-col min-h-[400px] transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-gray-200 dark:border-white/5 pb-6 transition-colors">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">요리 변동 시세 트렌드</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors">최근 5주기 동안의 가격 변동폭입니다.</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 px-4 py-2.5 rounded-xl transition-colors">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-500">품목 선택</span>
            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)} className="bg-transparent text-green-600 dark:text-green-400 text-sm font-bold focus:outline-none transition-colors">
              {FOOD_NAMES.map(name => <option key={name} value={name} className="bg-white dark:bg-[#0a0a0a]">{name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 w-full relative pt-4">
          {renderLineChart()}
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-2xl transition-colors">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-600 mb-1">ALL-DDING 요리 시세 전광판</h3>
            <p className="text-xs text-gray-500 dark:text-gray-500">현재 주기 기준, 직전 주기 대비 등락폭을 최고가 도달율 순으로 표시합니다.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 px-3 py-1 rounded-lg text-xs font-bold transition-colors">{latestPeriod} 기준</span>
            <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 hover:bg-green-500 dark:hover:bg-green-600 text-gray-700 dark:text-white hover:text-white border border-gray-200 dark:border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              이미지로 저장
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {processedData.map((food, idx) => {
            const isUp = food.diff > 0;
            const imgPath = getImagePath(food.name);
            return (
              <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-xl p-3 md:p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedFood(food.name)}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white dark:bg-white/5 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden p-1 transition-colors">
                    {imgPath ? <img src={imgPath} alt={food.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} /> : <span className="text-[8px] text-gray-400 dark:text-gray-500">IMG</span>}
                  </div>
                  <span className="text-sm md:text-base font-bold text-gray-900 dark:text-white transition-colors">{food.name}</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
                  <div className="text-right min-w-[80px]">
                    <span className="text-amber-600 dark:text-amber-400 font-black text-base md:text-lg transition-colors">{food.current.toLocaleString()}</span>
                    <span className="text-amber-700 dark:text-amber-600 font-bold text-xs ml-1 transition-colors">Gold</span>
                  </div>
                  <div className={`flex items-center gap-1 min-w-[70px] justify-end font-bold text-sm ${isUp ? 'text-red-500' : food.diff < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                    <span>{Math.abs(food.diff).toLocaleString()}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : food.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
                    </svg>
                  </div>
                  <div className="hidden md:block min-w-[120px] text-right">
                    <span className="text-gray-500 dark:text-gray-500 text-xs font-bold transition-colors">( 최고가의 <span className="text-gray-900 dark:text-white transition-colors">{food.percent}%</span> )</span>
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
              <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-4 tracking-tight">ALL-DDING 요리 시세</h2>
              <p className="text-gray-400 text-3xl font-medium tracking-wide">띵타이쿤 실시간 요리 시세 전광판</p>
            </div>
            <div className="bg-green-500/10 border-4 border-green-500/30 px-10 py-5 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.15)]">
              <span className="text-green-400 font-black text-4xl tracking-wider">{latestPeriod} 기준</span>
            </div>
          </div>

          <div className="flex gap-8 w-full">
            {top3Data.map((food, idx) => {
              const isUp = food.diff > 0;
              const imgPath = getImagePath(food.name);
              
              let rankStyle = {
                glow: "from-yellow-500/20 via-yellow-500/5 to-transparent",
                text: "text-yellow-400",
                border: "border-yellow-500/40",
                bg: "bg-yellow-500/10",
                shadow: "shadow-[0_0_50px_rgba(234,179,8,0.2)]"
              };
              
              if (idx === 1) {
                rankStyle = {
                  glow: "from-slate-300/20 via-slate-300/5 to-transparent",
                  text: "text-slate-200",
                  border: "border-slate-300/40",
                  bg: "bg-slate-300/10",
                  shadow: "shadow-[0_0_50px_rgba(203,213,225,0.15)]"
                };
              } else if (idx === 2) {
                rankStyle = {
                  glow: "from-amber-700/30 via-amber-700/5 to-transparent",
                  text: "text-amber-500",
                  border: "border-amber-700/40",
                  bg: "bg-amber-700/10",
                  shadow: "shadow-[0_0_50px_rgba(180,83,9,0.2)]"
                };
              }

              return (
                <div key={idx} className="flex-1 flex flex-col items-center bg-[#111] border-[3px] border-white/10 rounded-[3rem] p-10 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-80 bg-gradient-to-b ${rankStyle.glow}`}></div>

                  <div className={`relative z-10 flex flex-col items-center justify-center w-28 h-28 rounded-3xl mb-10 border-2 backdrop-blur-md ${rankStyle.bg} ${rankStyle.border} ${rankStyle.shadow}`}>
                    <span className="text-xl text-white/70 font-black mb-[-6px] tracking-widest">RANK</span>
                    <span className={`text-5xl font-black ${rankStyle.text}`}>{idx + 1}</span>
                  </div>

                  <div className="relative z-10 w-48 h-48 mb-10 flex items-center justify-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]">
                    {imgPath ? <img src={imgPath} alt={food.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} /> : <div className="w-full h-full bg-gray-800 rounded-3xl"></div>}
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center mb-10 h-[160px] justify-start w-full">
                    <h4 className="text-5xl font-black text-white mb-6 text-center break-keep-all leading-tight">{food.name}</h4>
                    <div className="bg-black/60 border-2 border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
                      <span className="text-gray-400 text-xl font-bold">최고가 대비</span>
                      <span className="text-white font-black text-3xl">{food.percent}%</span>
                    </div>
                  </div>
                  
                  <div className="relative z-10 w-full bg-black/60 border-2 border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center gap-4 mt-auto shadow-2xl">
                    <div className="flex items-baseline gap-2">
                      <span className="text-6xl font-black text-amber-400 tracking-tighter">{food.current.toLocaleString()}</span>
                      <span className="text-amber-600 font-bold text-3xl">G</span>
                    </div>
                    <div className={`flex items-center justify-center gap-3 w-full px-5 py-3 rounded-2xl font-black text-3xl ${isUp ? 'bg-red-500/10 text-red-500' : food.diff < 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                      <span>{Math.abs(food.diff).toLocaleString()}</span>
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : food.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-8 mt-2">
            {remainingData.map((food, idx) => {
              const isUp = food.diff > 0;
              const imgPath = getImagePath(food.name);
              return (
                <div key={idx} className="bg-[#111] border-2 border-white/10 rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden shadow-lg gap-4">
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-20 h-20 bg-black/50 rounded-2xl border-2 border-white/10 flex items-center justify-center p-3 shadow-inner">
                      {imgPath ? <img src={imgPath} alt={food.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} /> : <div className="w-full h-full bg-gray-800 rounded-xl"></div>}
                    </div>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="text-2xl font-bold text-white leading-tight">{food.name}</span>
                      <span className="text-gray-500 text-lg font-bold">최고가 <span className="text-gray-300">{food.percent}%</span></span>
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-white/5"></div>

                  <div className="flex flex-col items-center gap-2 w-full pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-amber-400 tracking-tight">{food.current.toLocaleString()}</span>
                      <span className="text-amber-600 font-bold text-xl">G</span>
                    </div>
                    <div className={`flex items-center gap-1 font-black text-2xl ${isUp ? 'text-red-500' : food.diff < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                      <span>{Math.abs(food.diff).toLocaleString()}</span>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : food.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
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