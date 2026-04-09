'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useTheme } from 'next-themes';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const ITEM_IMAGES: Record<string, string> = {
  '토마토 씨앗': `${STORAGE_BASE_URL}/ingredients/tomato_seed.png`,
  '양파 씨앗': `${STORAGE_BASE_URL}/ingredients/onion_seed.png`,
  '마늘 씨앗': `${STORAGE_BASE_URL}/ingredients/garlic_seed.png`,
  '에르칼의 장갑': `${STORAGE_BASE_URL}/islandbox/treaure_relic1.png`,
  '스태미나 드링크 I': `${STORAGE_BASE_URL}/stamina/stamina_drink_1.png`,
  '스태미나 드링크 II': `${STORAGE_BASE_URL}/stamina/stamina_drink_2.png`,
  '스태미나 드링크 III': `${STORAGE_BASE_URL}/stamina/stamina_drink_3.png`,
  '스태미나 드링크 IV': `${STORAGE_BASE_URL}/stamina/stamina_drink_4.png`,
  '이그논의 탈리즈만': `${STORAGE_BASE_URL}/islandbox/treaure_relic2.png`,
  '스킬 프리즘': `${STORAGE_BASE_URL}/sailing/skill_prism.png`,
  '신화 특수 인챈트 캡슐': `${STORAGE_BASE_URL}/f1/mythic_special_box.png`,
  '카르세나의 룬': `${STORAGE_BASE_URL}/islandbox/treaure_relic3.png`,
  '실바르의 보석함': `${STORAGE_BASE_URL}/islandbox/treaure_relic4.png`,
  '신화 열쇠': `${STORAGE_BASE_URL}/ocean_items/mythic_key.png`,
  '아르데온의 반지': `${STORAGE_BASE_URL}/islandbox/treaure_relic5.png`,
  '상급 미끼 인챈트북': `${STORAGE_BASE_URL}/islandbox/common_general_enchant_book.png`,
  '겉날개': `${STORAGE_BASE_URL}/sailing/ItemSprite_elytra.png`,
  '좀비 인챈트북 (10%)': `${STORAGE_BASE_URL}/islandbox/normal_special_enchant_book.png`,
  '스켈레톤 인챈트북 (10%)': `${STORAGE_BASE_URL}/islandbox/normal_special_enchant_book.png`,
  '거미 인챈트북 (10%)': `${STORAGE_BASE_URL}/islandbox/normal_special_enchant_book.png`,
  '크리퍼 인챈트북 (10%)': `${STORAGE_BASE_URL}/islandbox/normal_special_enchant_book.png`,
};

const BOX_DATA = {
  rookie: {
    name: '루키 상자',
    video: `${STORAGE_BASE_URL}/islandbox/rookie_box.mp4`,
    slotWeights: [{ slots: 1, chance: 50 }, { slots: 2, chance: 35 }, { slots: 3, chance: 15 }],
    drops: [
      { name: '토마토 씨앗', min: 5, max: 15, chance: 35 },
      { name: '양파 씨앗', min: 5, max: 15, chance: 30 },
      { name: '마늘 씨앗', min: 5, max: 15, chance: 16 },
      { name: '에르칼의 장갑', min: 1, max: 1, chance: 10 },
      { name: '스태미나 드링크 I', min: 1, max: 1, chance: 8 },
      { name: '스킬 프리즘', min: 1, max: 1, chance: 1 },
    ]
  },
  normal: {
    name: '노멀 상자',
    video: `${STORAGE_BASE_URL}/islandbox/normal_box.mp4`,
    slotWeights: [{ slots: 1, chance: 60 }, { slots: 2, chance: 40 }],
    drops: [
      { name: '토마토 씨앗', min: 10, max: 30, chance: 25 },
      { name: '양파 씨앗', min: 10, max: 30, chance: 20 },
      { name: '마늘 씨앗', min: 10, max: 30, chance: 15 },
      { name: '이그논의 탈리즈만', min: 1, max: 1, chance: 13 },
      { name: '스태미나 드링크 I', min: 2, max: 2, chance: 11 },
      { name: '스태미나 드링크 II', min: 1, max: 1, chance: 7 },
      { name: '스킬 프리즘', min: 1, max: 1, chance: 5 },
      { name: '스킬 프리즘', min: 2, max: 2, chance: 3 },
      { name: '스킬 프리즘', min: 3, max: 3, chance: 1 },
      //{ name: '좀비 인챈트북 (10%)', min: 1, max: 1, chance: 1 },
      //{ name: '스켈레톤 인챈트북 (10%)', min: 1, max: 1, chance: 1 },
      //{ name: '거미 인챈트북 (10%)', min: 1, max: 1, chance: 1 },
      //{ name: '크리퍼 인챈트북 (10%)', min: 1, max: 1, chance: 1 },
    ]
  },
  legend: {
    name: '전설 상자',
    video: `${STORAGE_BASE_URL}/islandbox/legendary_box.mp4`,
    slotWeights: [{ slots: 1, chance: 100 }],
    drops: [
      { name: '신화 특수 인챈트 캡슐', min: 1, max: 1, chance: 30 },
      { name: '스태미나 드링크 III', min: 1, max: 1, chance: 25 },
      { name: '스킬 프리즘', min: 1, max: 1, chance: 13 },
      { name: '스킬 프리즘', min: 2, max: 2, chance: 9 },
      { name: '카르세나의 룬', min: 1, max: 1, chance: 7 },
      { name: '스킬 프리즘', min: 3, max: 3, chance: 6 },
      { name: '실바르의 보석함', min: 1, max: 1, chance: 5 },
      { name: '스킬 프리즘', min: 4, max: 4, chance: 3 },
      { name: '신화 열쇠', min: 1, max: 1, chance: 2 },
    ]
  },
  mythic: {
    name: '신화 상자',
    video: `${STORAGE_BASE_URL}/islandbox/mythic_box.mp4`,
    slotWeights: [{ slots: 1, chance: 100 }],
    drops: [
      { name: '스킬 프리즘', min: 3, max: 10, chance: 40 },
      { name: '스킬 프리즘', min: 11, max: 15, chance: 25 },
      { name: '스태미나 드링크 III', min: 3, max: 3, chance: 15 },
      { name: '스태미나 드링크 IV', min: 1, max: 1, chance: 10 },
      { name: '아르데온의 반지', min: 1, max: 1, chance: 5 },
      { name: '상급 미끼 인챈트북', min: 1, max: 1, chance: 3 },
      { name: '겉날개', min: 1, max: 1, chance: 2 },
    ]
  }
};

export default function IslandBoxSimulator() {
  const [selectedBoxKey, setSelectedBoxKey] = useState<keyof typeof BOX_DATA>('rookie');
  const [isOpening, setIsOpening] = useState(false);
  const [results, setResults] = useState<{ name: string; count: number }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [showRates, setShowRates] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeBox = BOX_DATA[selectedBoxKey];
  const { theme } = useTheme();

  useEffect(() => {
    setIsOpening(false);
    setShowResult(false);
    setResults([]);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  }, [selectedBoxKey]);

  const getSlotCount = (weights: { slots: number; chance: number }[]) => {
    const rand = Math.random() * 100;
    let sum = 0;
    for (const w of weights) {
      sum += w.chance;
      if (rand <= sum) return w.slots;
    }
    return weights[0].slots;
  };

  const getRandomDrop = (drops: { name: string; min: number; max: number; chance: number }[]) => {
    const rand = Math.random() * 100;
    let sum = 0;
    for (const d of drops) {
      sum += d.chance;
      if (rand <= sum) {
        const count = Math.floor(Math.random() * (d.max - d.min + 1)) + d.min;
        return { name: d.name, count };
      }
    }
    return null;
  };

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    const slotCount = getSlotCount(activeBox.slotWeights);
    const itemMap: Record<string, number> = {};
    
    for (let i = 0; i < slotCount; i++) {
      const drop = getRandomDrop(activeBox.drops);
      if (drop) {
        itemMap[drop.name] = (itemMap[drop.name] || 0) + drop.count;
      }
    }

    const aggregatedResults = Object.entries(itemMap).map(([name, count]) => ({ name, count }));
    setResults(aggregatedResults);

    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleReset = () => {
    setIsOpening(false);
    setShowResult(false);
    setResults([]);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleCanvasClick = () => {
    if (showResult) {
      handleReset();
    } else if (!isOpening) {
      handleOpen();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        if (e.code === 'Space') e.preventDefault();
        handleCanvasClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpening, showResult, selectedBoxKey, results]);

  return (
    <div className="w-full space-y-6 animate-fade-in relative text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-lg gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors">아일랜드 보물상자</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">아일랜드에서 획득한 보물상자를 개봉합니다.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-white/5 pb-4 transition-colors">
        {(Object.keys(BOX_DATA) as Array<keyof typeof BOX_DATA>).map(key => (
          <button
            key={key}
            onClick={() => {
              if (!isOpening) setSelectedBoxKey(key);
            }}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              selectedBoxKey === key
                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-500/30'
                : 'bg-transparent text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {BOX_DATA[key].name}
          </button>
        ))}
        
        <div className="ml-auto flex items-center gap-3">
          <button 
            onClick={handleReset} 
            className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 text-sm font-semibold border border-red-200 dark:border-red-500/30 rounded-lg transition-colors"
          >
            초기화
          </button>
          <button 
            onClick={() => setShowRates(true)} 
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-sm font-semibold border border-gray-200 dark:border-white/5 rounded-lg transition-colors"
          >
            확률표
          </button>
        </div>
      </div>

      <div className="w-full relative">
        <div 
          className="border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden h-[500px] flex flex-col items-center justify-center shadow-sm dark:shadow-inner w-full cursor-pointer bg-gray-100 dark:bg-black transition-colors"
          onClick={handleCanvasClick}
        >
          <video
            key={selectedBoxKey}
            ref={videoRef}
            src={activeBox.video}
            muted
            playsInline
            preload="auto"
            onEnded={() => setShowResult(true)}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />

          {!isOpening && !showResult && (
            <div className="absolute bottom-6 z-20 pointer-events-none">
              <p className="text-white font-bold text-lg bg-black/60 dark:bg-black/40 px-6 py-2 rounded-full backdrop-blur-md animate-pulse shadow-md dark:shadow-none transition-colors">
                화면을 클릭하여 상자 열기
              </p>
            </div>
          )}

          {showResult && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 dark:bg-black/60 backdrop-blur-sm animate-fade-in p-6 transition-colors">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 transition-colors">획득 아이템</h3>
              <div className="flex flex-wrap justify-center gap-6">
                {results.map((item, idx) => (
                  <div key={idx} className="bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 p-4 rounded-xl flex flex-col items-center justify-center min-w-[120px] shadow-md dark:shadow-none transition-colors">
                    <img src={ITEM_IMAGES[item.name] || `${STORAGE_BASE_URL}/unknown.png`} alt={item.name} className="w-16 h-16 mb-3 object-contain drop-shadow-sm dark:drop-shadow-none" />
                    <p className="text-gray-900 dark:text-white font-semibold text-sm text-center transition-colors">{item.name}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-base mt-1 transition-colors">{item.count}개</p>
                  </div>
                ))}
              </div>
              <p className="absolute bottom-6 text-gray-600 dark:text-gray-400 text-sm animate-pulse transition-colors">화면을 클릭하여 닫기</p>
            </div>
          )}
        </div>
      </div>

      {showRates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl transition-colors">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#1a1a1a] transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{activeBox.name} 확률표</h3>
              <button onClick={() => setShowRates(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 overflow-y-auto custom-scrollbar">
              <div className="mb-4 p-3.5 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl text-xs text-yellow-800 dark:text-yellow-100/90 leading-relaxed transition-colors">
                <span className="font-bold text-yellow-600 dark:text-yellow-400 transition-colors">※ 확률 안내:</span><br/>
                공식 위키에 누락된 정보인 '개봉 시 등장하는 아이템 종류 수(1~3종)'의 확률 가중치와, 
                '1~15개'처럼 수량 범위로 나타나는 아이템의 세부 개별 획득 확률은 일반적인 균등 분포를 임의로 적용하여 구현되었습니다.<br/>
                 따라서 실제 인게임 상자의 체감 획득 수량 및 확률과 다소 차이가 있을 수 있음을 알려드립니다.
              </div>
              <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300 transition-colors">
                <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 uppercase transition-colors">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">아이템</th>
                    <th className="px-4 py-3 text-right">개수</th>
                    <th className="px-4 py-3 text-right rounded-tr-lg">확률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5 transition-colors">
                  {activeBox.drops.map((drop, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white transition-colors">{drop.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-300 transition-colors">{drop.min === drop.max ? drop.min : `${drop.min}~${drop.max}`}개</td>
                      <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 transition-colors">{drop.chance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-500/20 text-xs text-gray-600 dark:text-gray-400 transition-colors">
                <p className="font-semibold text-blue-600 dark:text-blue-300 mb-1 transition-colors">상자 슬롯 확률</p>
                <ul className="list-disc list-inside pl-2">
                  {activeBox.slotWeights.map((w, i) => (
                    <li key={i}>{w.slots}종류 아이템 등장: {w.chance}%</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}