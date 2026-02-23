import { useState, useEffect, useMemo } from 'react';
import { getCachedPrices } from '@/lib/supabase';
import { FOOD_NAMES, getImagePath, FOOD_MAX_PRICES } from '@/lib/professionData';

export default function FarmingStatsTab() {
  const [dbData, setDbData] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState(FOOD_NAMES[0]);
  const [latestPeriod, setLatestPeriod] = useState<string>('데이터 불러오는 중...');

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

  const selectedFoodData = processedData.find(d => d.name === selectedFood) || { history: [] };
  const graphData = selectedFoodData.history.slice(-5).map((h: any) => ({ period: h.period, price: h.price }));
  
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
          <linearGradient id="farmAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#farmAreaGrad)" />
        <polyline points={points} fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {graphData.map((d: any, i: number) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.price)} r="6" fill="#0a0a0a" stroke="#4ade80" strokeWidth="3" />
            <text x={getX(i)} y={getY(d.price) - 15} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">{d.price.toLocaleString()} G</text>
            <text x={getX(i)} y={height - 10} fill="#6b7280" fontSize="12" fontWeight="bold" textAnchor="middle">{d.period}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col min-h-[400px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-white/5 pb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">요리 변동 시세 트렌드</h3>
            <p className="text-sm text-gray-400">최근 5주기 동안의 가격 변동폭입니다.</p>
          </div>
          <div className="flex items-center gap-3 bg-black border border-white/10 px-4 py-2.5 rounded-xl">
            <span className="text-xs font-bold text-gray-500">품목 선택</span>
            <select value={selectedFood} onChange={(e) => setSelectedFood(e.target.value)} className="bg-transparent text-green-400 text-sm font-bold focus:outline-none">
              {FOOD_NAMES.map(name => <option key={name} value={name} className="bg-[#0a0a0a]">{name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 w-full relative pt-4">
          {renderLineChart()}
        </div>
      </div>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-4">
          <div>
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mb-1">ALL-DDING 요리 시세 전광판</h3>
            <p className="text-xs text-gray-500">현재 주기 기준, 직전 주기 대비 등락폭을 최고가 도달율 순으로 표시합니다.</p>
          </div>
          <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-xs font-bold">{latestPeriod} 진행중</span>
        </div>
        <div className="space-y-2">
          {processedData.map((food, idx) => {
            const isUp = food.diff > 0;
            const imgPath = getImagePath(food.name);
            return (
              <div key={idx} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl p-3 md:p-4 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedFood(food.name)}>
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center overflow-hidden p-1">
                    {imgPath ? <img src={imgPath} alt={food.name} className="w-full h-full object-contain" style={{imageRendering: 'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} /> : <span className="text-[8px] text-gray-500">IMG</span>}
                  </div>
                  <span className="text-sm md:text-base font-bold text-white">{food.name}</span>
                </div>
                <div className="flex items-center gap-4 md:gap-8 flex-1 justify-end">
                  <div className="text-right min-w-[80px]">
                    <span className="text-amber-400 font-black text-base md:text-lg">{food.current.toLocaleString()}</span>
                    <span className="text-amber-600 font-bold text-xs ml-1">Gold</span>
                  </div>
                  <div className={`flex items-center gap-1 min-w-[70px] justify-end ${isUp ? 'text-red-500' : food.diff < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                    <span className="font-bold text-sm">{Math.abs(food.diff).toLocaleString()}</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      {isUp ? <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z"/> : food.diff < 0 ? <path d="M12 20l-8-8h6V4h4v8h6l-8 8z"/> : <path d="M5 11h14v2H5z"/>}
                    </svg>
                  </div>
                  <div className="hidden md:block min-w-[120px] text-right">
                    <span className="text-gray-500 text-xs font-bold">( 최고가의 <span className="text-white">{food.percent}%</span> )</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}