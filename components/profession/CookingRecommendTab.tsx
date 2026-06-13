'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCachedPrices } from '@/lib/supabase';

interface Props {
  userStats: any;
}

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const F8_EXPECTED_EXTRA = [0, 0.01, 0.02, 0.03, 0.04, 0.10, 0.14, 0.30];
const F9_GIANT_CHANCE = [0, 0.005, 0.01, 0.03, 0.05];
const F12_SEED_RETURN = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.10, 0.20, 0.30];
const F15_SALE_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.10, 0.15, 0.30, 0.50];
const F5_BULK_BONUS = [0, 0.01, 0.02, 0.03, 0.04, 0.07];
const F4_TIME_REDUCTION = [0, 0.10, 0.30, 0.40, 0.60, 0.80];
const F16_BASE_EXTRA = [0, 0.01, 0.02, 0.06, 0.08, 0.10, 0.18, 0.21, 0.40, 0.45, 1.05];

const RECIPES = [
  { id: "tomato_spaghetti", name: "토마토 스파게티", maxPrice: 864, craftTime: 20, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "onion_ring", name: "어니언 링", maxPrice: 1296, craftTime: 20, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "garlic_cake", name: "갈릭 케이크", maxPrice: 810, craftTime: 20, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "pork_tomato_stew", name: "삼겹살 토마토 찌개", maxPrice: 2039, craftTime: 30, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "tricolor_ice_cream", name: "삼색 아이스크림", maxPrice: 3022, craftTime: 30, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "garlic_mutton_hotdog", name: "마늘 양갈비 핫도그", maxPrice: 1832, craftTime: 30, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "sweet_cereal", name: "달콤 시리얼", maxPrice: 2578, craftTime: 30, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "roast_chicken_pie", name: "로스트 치킨 파이", maxPrice: 2253, craftTime: 30, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "sweet_chicken_burger", name: "스윗 치킨 햄버거", maxPrice: 3612, craftTime: 40, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "tomato_pineapple_pizza", name: "토마토 파인애플 피자", maxPrice: 3077, craftTime: 40, ingredients: { "토마토 베이스": 2, "마늘 베이스": 1, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "onion_soup", name: "양파 수프", maxPrice: 3797, craftTime: 40, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "herb_pork_belly_steam", name: "허브 삼겹살 찜", maxPrice: 2982, craftTime: 40, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "tomato_lasagna", name: "토마토 라자냐", maxPrice: 4181, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "deep_cream_pane", name: "딥 크림 빠네", maxPrice: 3837, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "triple_beef_rib_skewer", name: "트리플 소갈비 꼬치", maxPrice: 4307, craftTime: 50, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } }
];

const RAW_FIXED_PRICES: Record<string, number> = {
  "소금": 2, "요리용 달걀": 3, "요리용 우유": 3, "오일": 4
};

const INVENTORY_CATEGORIES = {
  '씨앗류': ["토마토 씨앗", "양파 씨앗", "마늘 씨앗"],
  '베이스류': ["토마토 베이스", "양파 베이스", "마늘 베이스"],
  '농작물류': ["호박 묶음", "감자 묶음", "당근 묶음", "비트 묶음", "수박 묶음", "달콤한 열매 묶음", "코코넛", "파인애플", "밀", "설탕"],
  '가공품류': ["버터 조각", "치즈 조각", "요리용 소금", "밀가루 반죽", "설탕 큐브"]
};

const MEAT_GROUPS = [
  { label: '기본 부자재', cols: 4, items: ["요리용 우유", "소금", "요리용 달걀", "오일"] },
  { label: '소고기류', cols: 3, items: ["익힌 소 등심", "익힌 소 갈비살", "스테이크"] },
  { label: '양고기류', cols: 3, items: ["익힌 양고기", "익힌 양 갈비살", "익힌 양 다리살"] },
  { label: '닭고기류', cols: 3, items: ["익힌 닭고기", "익힌 닭 다리살", "익힌 닭 가슴살"] },
  { label: '돼지고기류', cols: 3, items: ["익힌 돼지고기", "익힌 돼지 삼겹살", "익힌 돼지 앞다리살"] },
];

const INGREDIENT_FILE_MAP: Record<string, string> = {
  "토마토 씨앗": "tomato_seed", "양파 씨앗": "onion_seed", "마늘 씨앗": "garlic_seed",
  "토마토 베이스": "tomato_base", "양파 베이스": "onion_base", "마늘 베이스": "garlic_base",
  "호박 묶음": "pumpkin_bundle", "감자 묶음": "potato_bundle", "당근 묶음": "carrot_bundle",
  "비트 묶음": "beet_bundle", "수박 묶음": "watermelon_bundle", "달콤한 열매 묶음": "sweet_berry_bundle",
  "코코넛": "coconut", "파인애플": "pineapple", "밀": "wheat", "설탕": "sugar",
  "익힌 돼지고기": "cooked_porkchop", "익힌 돼지 삼겹살": "cooked_pork_belly", "익힌 돼지 앞다리살": "cooked_pork_shoulder",
  "익힌 소 등심": "cooked_beef_sirloin", "익힌 소 갈비살": "cooked_beef_ribs", "스테이크": "steak",
  "익힌 닭고기": "cooked_chicken", "익힌 닭 다리살": "cooked_chicken_leg", "익힌 닭 가슴살": "cooked_chicken_breast",
  "익힌 양고기": "cooked_mutton", "익힌 양 갈비살": "cooked_mutton_ribs", "익힌 양 다리살": "cooked_mutton_leg",
  "소금": "salt", "요리용 달걀": "cooking_egg", "요리용 우유": "cooking_milk", "오일": "oil",
  "버터 조각": "butter_piece", "치즈 조각": "cheese_piece", "요리용 소금": "cooking_salt", "밀가루 반죽": "dough", "설탕 큐브": "sugar_cube"
};

const getIngImage = (name: string) => `${STORAGE_BASE_URL}/ingredients/${INGREDIENT_FILE_MAP[name] || 'default'}.png`;

const getCurrentCyclePeriod = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const kst = new Date(utc + (9 * 3600000));
  
  const base = new Date(Date.UTC(2026, 5, 8, 15, 0, 0)); 
  const diffTime = kst.getTime() - base.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const cycleIndex = Math.floor(diffDays / 3);
  const startKst = new Date(base.getTime() + (cycleIndex * 3) * 24 * 60 * 60 * 1000 + (9 * 3600000));
  const endKst = new Date(startKst.getTime() + 3 * 24 * 60 * 60 * 1000);
  
  const formatStr = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, '0')}월 ${String(d.getUTCDate()).padStart(2, '0')}일`;
  return `${formatStr(startKst)} ~ ${formatStr(endKst)}`;
};

export default function CookingRecommendTab({ userStats }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [timeMins, setTimeMins] = useState<number>(180); 
  const [maxPlotsInput, setMaxPlotsInput] = useState<string | number>(1000); 
  const [calcMode, setCalcMode] = useState<'buy' | 'strict'>('buy');
  
  const [isInventoryVisible, setIsInventoryVisible] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<string>('전체');

  const [inventory, setInventory] = useState<Record<string, { box: number | string, set: number | string, ea: number | string }>>({});
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  const [dbData, setDbData] = useState<any[]>([]);
  const [latestPeriod, setLatestPeriod] = useState<string>('데이터 불러오는 중...');
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simResult, setSimResult] = useState<any>(null);

  const [actualCraftedA, setActualCraftedA] = useState<string>('');
  const [actualCraftedB, setActualCraftedB] = useState<string>('');

  const [party, setParty] = useState<number[]>([]);

  const yieldMap = useMemo(() => {
    const f8Extra = F8_EXPECTED_EXTRA[userStats.f8Lv || 0] || 0;
    const f9Lv = userStats.f9Lv || 0;
    const f9Giant = f9Lv > 0 ? (F9_GIANT_CHANCE[f9Lv] || 0) : 0.0002;
    const f16Extra = F16_BASE_EXTRA[userStats.f16Lv || 0] || 0;
    const getEffectiveCrops = (base: number) => (base * (1 + 6 * f9Giant)) + f8Extra + (f16Extra * 8);
    return { tomato: getEffectiveCrops(2.0), onion: getEffectiveCrops(1.5), garlic: getEffectiveCrops(2.5) };
  }, [userStats]);

  useEffect(() => {
    const savedInv = localStorage.getItem('alldding_cook_inventory');
    const savedSettings = localStorage.getItem('alldding_cook_settings');
    const savedPrices = localStorage.getItem('alldding_prices');
    
    let initialInv: Record<string, { box: number | string, set: number | string, ea: number | string }> = {};
    const allItems = [
      ...INVENTORY_CATEGORIES['씨앗류'], ...INVENTORY_CATEGORIES['베이스류'], 
      ...INVENTORY_CATEGORIES['농작물류'], ...INVENTORY_CATEGORIES['가공품류'],
      ...MEAT_GROUPS.flatMap(g => g.items)
    ];
    allItems.forEach(item => { initialInv[item] = { box: '', set: '', ea: '' }; });

    if (savedInv) {
      try {
        const p = JSON.parse(savedInv);
        Object.keys(p).forEach(k => {
          if(p[k].box === 0) p[k].box = '';
          if(p[k].set === 0) p[k].set = '';
          if(p[k].ea === 0) p[k].ea = '';
        });
        initialInv = { ...initialInv, ...p };
      } catch (e) {}
    }
    setInventory(initialInv);

    if (savedSettings) {
      try {
        const p = JSON.parse(savedSettings);
        if (p.timeMins) setTimeMins(p.timeMins);
        if (p.maxPlots) setMaxPlotsInput(p.maxPlots);
        if (p.calcMode) setCalcMode(p.calcMode);
        if (p.party) setParty(p.party);
      } catch (e) {}
    }

    if (savedPrices) {
      try { setPrices(JSON.parse(savedPrices)); } catch (e) {}
    }

    const fetchDBPrices = async () => {
      try {
        const allData = await getCachedPrices();
        const data = allData.filter((d: any) => d.category === 'food');
        
        if (data && data.length > 0) {
          setDbData(data);
          
          const currentPeriodStr = getCurrentCyclePeriod();
          setLatestPeriod(currentPeriodStr);
          
          const pricesMap: Record<string, number> = {};
          
          RECIPES.forEach(r => {
            const history = data
              .filter((d: any) => d.item_name === r.name && d.period === currentPeriodStr)
              .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            
            if (history.length > 0) {
              pricesMap[r.name] = history[history.length - 1].price;
            } else {
              const fallbackHistory = data
                  .filter((d: any) => d.item_name === r.name)
                  .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              if (fallbackHistory.length > 0) {
                  pricesMap[r.name] = fallbackHistory[fallbackHistory.length - 1].price;
              } else {
                  pricesMap[r.name] = r.maxPrice;
              }
            }
          });
          setCurrentPrices(pricesMap);
        }
      } catch (e) {
      }
      setLoaded(true);
    };

    fetchDBPrices();
  }, []);

  const top5Candidates = useMemo(() => {
    if (!loaded || Object.keys(currentPrices).length === 0) return [];

    return RECIPES.map(r => {
      const currentPrice = currentPrices[r.name] || r.maxPrice; 
      const ratio = currentPrice / r.maxPrice;
      return { ...r, currentPrice, ratio };
    })
    .filter(r => r.currentPrice >= 1000 && r.ratio >= 0.8)
    .sort((a, b) => b.maxPrice - a.maxPrice) 
    .slice(0, 5);
  }, [currentPrices, loaded]);

  const handleInvChange = (item: string, type: 'box' | 'set' | 'ea', val: string) => {
    const numericVal = val.replace(/[^0-9]/g, '');
    const next = { ...inventory, [item]: { ...inventory[item], [type]: numericVal } };
    setInventory(next);
    
    const saveObj: Record<string, any> = {};
    Object.keys(next).forEach(k => {
      saveObj[k] = {
        box: next[k].box === '' ? '' : parseInt(next[k].box as string, 10) || 0,
        set: next[k].set === '' ? '' : parseInt(next[k].set as string, 10) || 0,
        ea: next[k].ea === '' ? '' : parseInt(next[k].ea as string, 10) || 0
      };
    });
    localStorage.setItem('alldding_cook_inventory', JSON.stringify(saveObj));
  };

  const clearInventory = () => {
    if (!confirm('전체 재고 수량을 0으로 초기화하시겠습니까?')) return;
    const cleared: Record<string, any> = {};
    Object.keys(inventory).forEach(k => cleared[k] = { box: '', set: '', ea: '' });
    setInventory(cleared);
    
    const saveObj: Record<string, any> = {};
    Object.keys(cleared).forEach(k => saveObj[k] = { box: 0, set: 0, ea: 0 });
    localStorage.setItem('alldding_cook_inventory', JSON.stringify(saveObj));
  };

  const addPartyMember = () => {
    if (party.length >= 14) return;
    const newParty = [...party, 5];
    setParty(newParty);
    const savedSettings = JSON.parse(localStorage.getItem('alldding_cook_settings') || '{}');
    localStorage.setItem('alldding_cook_settings', JSON.stringify({ ...savedSettings, party: newParty }));
  };

  const removePartyMember = (index: number) => {
    const newParty = party.filter((_, i) => i !== index);
    setParty(newParty);
    const savedSettings = JSON.parse(localStorage.getItem('alldding_cook_settings') || '{}');
    localStorage.setItem('alldding_cook_settings', JSON.stringify({ ...savedSettings, party: newParty }));
  };

  const updatePartyMember = (index: number, level: number) => {
    const newParty = [...party];
    newParty[index] = level;
    setParty(newParty);
    const savedSettings = JSON.parse(localStorage.getItem('alldding_cook_settings') || '{}');
    localStorage.setItem('alldding_cook_settings', JSON.stringify({ ...savedSettings, party: newParty }));
  };

  const formatTimeStr = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  };

  const formatSecs = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  };

  const getInvTotal = (item: string) => {
    const inv = inventory[item];
    if (!inv) return 0;
    const b = parseInt(inv.box as string, 10) || 0;
    const s = parseInt(inv.set as string, 10) || 0;
    const e = parseInt(inv.ea as string, 10) || 0;
    return (b * 3456) + (s * 64) + e;
  };

  const handleRecipeSelect = (name: string) => {
    if (selectedRecipes.includes(name)) {
      setSelectedRecipes(selectedRecipes.filter(r => r !== name));
    } else {
      if (selectedRecipes.length >= 2) {
        return;
      }
      setSelectedRecipes([...selectedRecipes, name]);
    }
  };

  const generateTimeline = (result: any) => {
    const lines: { time: string, text: string, type: string, items?: any[] }[] = [];
    let curTime = new Date();
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatT = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    lines.push({ time: formatT(curTime), text: "스케줄 시작", type: "start" });

    let remainingBaseTime = result.baseProcessTime;

    for (let i = 1; i <= result.growCycles; i++) {
        lines.push({ time: formatT(curTime), text: `${i}회차 재배 시작 (15분 소요)`, type: "grow" });
        curTime = new Date(curTime.getTime() + 15 * 60000);
        
        const harvested = [];
        if (result.netBt > 0) harvested.push({ name: '토마토 베이스', qty: Math.ceil(result.netBt / result.growCycles), type: 'base' });
        if (result.netBo > 0) harvested.push({ name: '양파 베이스', qty: Math.ceil(result.netBo / result.growCycles), type: 'base' });
        if (result.netBg > 0) harvested.push({ name: '마늘 베이스', qty: Math.ceil(result.netBg / result.growCycles), type: 'base' });

        lines.push({ time: formatT(curTime), text: `${i}회차 작물 수확 및 씨앗 회수`, type: "harvest", items: harvested });
        
        if (i < result.growCycles && remainingBaseTime > 0) {
           lines.push({ time: formatT(curTime), text: `대기 시간 활용: 이전 회차 수확 작물 베이스 가공 진행`, type: "process", items: harvested });
           remainingBaseTime -= (15 * 60);
        }
    }

    if (remainingBaseTime > 0) {
        const baseMins = Math.ceil(remainingBaseTime / 60);
        lines.push({ time: formatT(curTime), text: `나머지 수확 작물 베이스 최종 가공 시작`, type: "process" });
        curTime = new Date(curTime.getTime() + baseMins * 60000);
        lines.push({ time: formatT(curTime), text: `베이스 변환 가공 완료`, type: "process_done" });
    }

    if (result.actualSubProcTime > 0) {
        const subMins = Math.ceil(result.actualSubProcTime / 60);
        lines.push({ time: formatT(curTime), text: `나머지 부자재 가공 진행`, type: "sub_process" });
        curTime = new Date(curTime.getTime() + subMins * 60000);
    }

    if (result.cookingTime > 0) {
        const cookMins = Math.ceil(result.cookingTime / 60);
        lines.push({ time: formatT(curTime), text: `최종 요리 제작 시작`, type: "cook" });
        curTime = new Date(curTime.getTime() + cookMins * 60000);
        const cooked = [];
        if (result.a > 0) cooked.push({ id: result.recA.id, name: result.recA.name, qty: result.a, type: 'food' });
        if (result.recB && result.b > 0) cooked.push({ id: result.recB.id, name: result.recB.name, qty: result.b, type: 'food' });
        lines.push({ time: formatT(curTime), text: `요리 완성 및 스케줄 종료`, type: "cook_done", items: cooked });
    }

    return lines;
  };

  const runSimulation = () => {
    if (selectedRecipes.length === 0) return;
    const safeMaxPlots = Math.max(70, Math.min(2000, Number(maxPlotsInput) || 70));
    setMaxPlotsInput(safeMaxPlots);
    
    localStorage.setItem('alldding_cook_settings', JSON.stringify({ timeMins, maxPlots: safeMaxPlots, calcMode, party }));
    setIsSimulating(true);
    setSimProgress(0);
    setActualCraftedA('');
    setActualCraftedB('');

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        calculateCombinationRoute(safeMaxPlots);
        setTimeout(() => setIsSimulating(false), 300);
      }
      setSimProgress(progress);
    }, 50);
  };

  const calculateCombinationRoute = (safeMaxPlots: number) => {
    const availableSecs = timeMins * 60;
    
    const f15Lv = userStats.f15Lv || 0;
    const f15Bonus = F15_SALE_BONUS[f15Lv] || 0;
    const f5Lv = userStats.f5Lv || 0;
    const f5BonusLv = F5_BULK_BONUS[f5Lv] || 0;

    const recA = RECIPES.find(r => r.name === selectedRecipes[0]);
    const recB = selectedRecipes[1] ? RECIPES.find(r => r.name === selectedRecipes[1]) : null;

    if (!recA) return;

    let bestProfit = -Infinity;
    let bestTotalCrafts = -1;
    let bestResult: any = null;

    const invBt = getInvTotal("토마토 베이스");
    const invBo = getInvTotal("양파 베이스");
    const invBg = getInvTotal("마늘 베이스");
    const invSt = getInvTotal("토마토 씨앗");
    const invSo = getInvTotal("양파 씨앗");
    const invSg = getInvTotal("마늘 씨앗");

    let totalSpeedFactor = 1 / (1 - (F4_TIME_REDUCTION[userStats.f4Lv || 0] || 0));
    for (let pLv of party) {
        totalSpeedFactor += 1 / (1 - (F4_TIME_REDUCTION[pLv] || 0));
    }

    const MAX_SEARCH = 15000;

    for (let a = 0; a <= MAX_SEARCH; a++) {
      const bT_a = (recA.ingredients["토마토 베이스"] || 0) * a;
      const bO_a = (recA.ingredients["양파 베이스"] || 0) * a;
      const bG_a = (recA.ingredients["마늘 베이스"] || 0) * a;

      const netBt_a = Math.max(0, bT_a - invBt);
      const netBo_a = Math.max(0, bO_a - invBo);
      const netBg_a = Math.max(0, bG_a - invBg);

      const reqSeedT_a = Math.ceil(Math.round((netBt_a * 8 / yieldMap.tomato) * 1000) / 1000);
      const reqSeedO_a = Math.ceil(Math.round((netBo_a * 8 / yieldMap.onion) * 1000) / 1000);
      const reqSeedG_a = Math.ceil(Math.round((netBg_a * 8 / yieldMap.garlic) * 1000) / 1000);

      if (reqSeedT_a > invSt || reqSeedO_a > invSo || reqSeedG_a > invSg) break; 

      const totalSeeds_a = reqSeedT_a + reqSeedO_a + reqSeedG_a;
      const growCycles_a = totalSeeds_a === 0 ? 0 : Math.ceil(totalSeeds_a / safeMaxPlots);
      const growTimeSecs_a = growCycles_a * 15 * 60;
      
      const baseProcessTime_a = (netBt_a + netBo_a + netBg_a) * 15 / totalSpeedFactor;
      const cookTimeA_a = a * recA.craftTime / totalSpeedFactor;
      const totalProcTime_a = baseProcessTime_a + cookTimeA_a;
      
      const availableOverlap_a = Math.max(0, growCycles_a - 1) * 15 * 60;
      const finalBatchRatio_a = growCycles_a > 0 ? 1 / growCycles_a : 0;
      const actualAddedTime_a = Math.max(totalProcTime_a - availableOverlap_a, totalProcTime_a * finalBatchRatio_a);

      if (growTimeSecs_a + actualAddedTime_a > availableSecs) break;

      for (let b = 0; b <= MAX_SEARCH; b++) {
        if (a === 0 && b === 0) continue;
        if (!recB && b > 0) break;

        const bT = bT_a + (recB ? (recB.ingredients["토마토 베이스"] || 0) * b : 0);
        const bO = bO_a + (recB ? (recB.ingredients["양파 베이스"] || 0) * b : 0);
        const bG = bG_a + (recB ? (recB.ingredients["마늘 베이스"] || 0) * b : 0);

        const netBt = Math.max(0, bT - invBt);
        const netBo = Math.max(0, bO - invBo);
        const netBg = Math.max(0, bG - invBg);

        const reqSeedT = Math.ceil(Math.round((netBt * 8 / yieldMap.tomato) * 1000) / 1000);
        const reqSeedO = Math.ceil(Math.round((netBo * 8 / yieldMap.onion) * 1000) / 1000);
        const reqSeedG = Math.ceil(Math.round((netBg * 8 / yieldMap.garlic) * 1000) / 1000);

        let bottleneckItem = '';
        let bottleneckRatio = 9999;

        const checkBottleneck = (raw: string, required: number) => {
            const available = getInvTotal(raw);
            const currentRatio = required > 0 ? available / required : 9999;
            if (currentRatio < bottleneckRatio) {
              bottleneckRatio = currentRatio;
              bottleneckItem = raw;
            }
            return available;
        };

        checkBottleneck("토마토 씨앗", reqSeedT);
        checkBottleneck("양파 씨앗", reqSeedO);
        checkBottleneck("마늘 씨앗", reqSeedG);

        if (reqSeedT > invSt || reqSeedO > invSo || reqSeedG > invSg) break;

        let missingCost = 0;
        let isStrictFailed = false;
        const flatReqs: Record<string, number> = {};
        const missingRaws: Record<string, { missing: number, price: number, total: number }> = {};

        const addReqs = (recipe: any, qty: number) => {
          for (const [ing, qtyPerCraft] of Object.entries(recipe.ingredients)) {
            if (ing.includes("베이스")) continue;
            const totalNeeded = (qtyPerCraft as number) * qty;
            flatReqs[ing] = (flatReqs[ing] || 0) + totalNeeded;
          }
        };

        addReqs(recA, a);
        if (recB) addReqs(recB, b);

        for (const [raw, totalRawNeeded] of Object.entries(flatReqs)) {
          const available = checkBottleneck(raw, totalRawNeeded);

          if (totalRawNeeded > available) {
            if (calcMode === 'strict') {
              isStrictFailed = true;
              break;
            } else {
              const missing = totalRawNeeded - available;
              const rawPrice = prices[raw] !== undefined ? prices[raw] / 64 : (RAW_FIXED_PRICES[raw] || 0);
              const cost = missing * rawPrice;
              missingRaws[raw] = { missing, price: rawPrice, total: cost };
              missingCost += cost;
            }
          }
        }

        if (isStrictFailed) break; 

        const totalSeeds = reqSeedT + reqSeedO + reqSeedG;
        const growCycles = totalSeeds === 0 ? 0 : Math.ceil(totalSeeds / safeMaxPlots);
        const growTimeSecs = growCycles * 15 * 60;

        const baseProcessTime = (netBt + netBo + netBg) * 15 / totalSpeedFactor;
        const cookTimeA = a * recA.craftTime / totalSpeedFactor;
        const cookTimeB = recB ? b * recB.craftTime / totalSpeedFactor : 0;
        const totalProcTime = baseProcessTime + cookTimeA + cookTimeB;

        const availableOverlap = Math.max(0, growCycles - 1) * 15 * 60;
        const finalBatchRatio = growCycles > 0 ? 1 / growCycles : 0;
        const actualAddedTime = Math.max(totalProcTime - availableOverlap, totalProcTime * finalBatchRatio);

        const totalTimeSecs = growTimeSecs + actualAddedTime;
        
        if (totalTimeSecs > availableSecs) break; 

        const isBulk = (a + b) >= 192;
        const currentPriceA = currentPrices[recA.name] || recA.maxPrice;
        const currentPriceB = recB ? (currentPrices[recB.name] || recB.maxPrice) : 0;

        const baseRevA = a * currentPriceA;
        const baseRevB = recB ? b * currentPriceB : 0;
        const baseRevTotal = baseRevA + baseRevB;

        const f15BonusAmt = Math.floor(baseRevA * f15Bonus) + (recB ? Math.floor(baseRevB * f15Bonus) : 0);
        const f5BonusAmt = isBulk ? Math.floor(baseRevA * f5BonusLv) + (recB ? Math.floor(baseRevB * f5BonusLv) : 0) : 0;

        const revA = baseRevA + Math.floor(baseRevA * f15Bonus) + (isBulk ? Math.floor(baseRevA * f5BonusLv) : 0);
        const revB = baseRevB + Math.floor(baseRevB * f15Bonus) + (isBulk ? Math.floor(baseRevB * f5BonusLv) : 0);
        const profit = revA + revB - missingCost;

        const totalCrafts = a + b;
        
        if (profit > bestProfit || (profit === bestProfit && totalTimeSecs < (bestResult?.totalTimeSecs || 999999))) {
          bestTotalCrafts = totalCrafts;
          bestProfit = profit;

          const reqSeedTotal = reqSeedT + reqSeedO + reqSeedG;
          const f12Lv = userStats.f12Lv || 0;
          const expectedSeedReturn = reqSeedTotal * (F12_SEED_RETURN[f12Lv] || 0);

          const f9Lv = userStats.f9Lv || 0;
          const f9Rate = f9Lv > 0 ? (F9_GIANT_CHANCE[f9Lv] || 0) : 0.0002;
          const expectedExtraCrops = ((reqSeedT * 2.0) + (reqSeedO * 1.5) + (reqSeedG * 2.5)) * 6 * f9Rate;
          const expectedExtraBases = expectedExtraCrops / 8;

          let timelineBase = baseProcessTime;
          let timelineCook = cookTimeA + cookTimeB;
          let timelineOverlap = availableOverlap;
          let remainingBaseAfterOverlap = Math.max(0, timelineBase - timelineOverlap);
          let diff = actualAddedTime - (remainingBaseAfterOverlap + timelineCook);
          
          timelineCook += diff;
          if (timelineCook < 0) {
              timelineBase += timelineCook;
              timelineCook = 0;
          }

          bestResult = {
            a, b, recA, recB, profit, totalTimeSecs, reqSeedT, reqSeedO, reqSeedG, growCycles, overlapTime: availableOverlap,
            missingCost, requiredRaws: flatReqs, missingRaws, isBulkBonusApplied: isBulk,
            baseProcessTime: timelineBase, subProcTime: 0, cookingTime: timelineCook,
            reqBt: bT, reqBo: bO, reqBg: bG, invBt, invBo, invBg, netBt, netBo, netBg,
            bottleneckItem, currentPriceA, currentPriceB, revA, revB,
            isTimeExceeded: false, growTimeSecs,
            baseRevTotal, f15BonusAmt, f5BonusAmt, expectedSeedReturn, expectedExtraCrops, expectedExtraBases,
            f12Lv, f9Lv, f9Rate
          };
        }
      }
    }

    if (bestResult && bestResult.totalTimeSecs < availableSecs) {
        bestResult.isTimeExceeded = true;
    }

    if (bestResult) {
        bestResult.timeline = generateTimeline(bestResult);
    }

    setSimResult(bestResult || { fail: true });
  };

  const handleDeductInventory = () => {
    if (!simResult || simResult.fail) return;

    const actualA = parseInt(actualCraftedA as string, 10) || 0;
    const actualB = parseInt(actualCraftedB as string, 10) || 0;

    if (actualA === 0 && actualB === 0) return;

    const recA = simResult.recA;
    const recB = simResult.recB;

    const reqBt = (recA.ingredients["토마토 베이스"] || 0) * actualA + (recB ? (recB.ingredients["토마토 베이스"] || 0) * actualB : 0);
    const reqBo = (recA.ingredients["양파 베이스"] || 0) * actualA + (recB ? (recB.ingredients["양파 베이스"] || 0) * actualB : 0);
    const reqBg = (recA.ingredients["마늘 베이스"] || 0) * actualA + (recB ? (recB.ingredients["마늘 베이스"] || 0) * actualB : 0);

    const invBt = getInvTotal("토마토 베이스");
    const invBo = getInvTotal("양파 베이스");
    const invBg = getInvTotal("마늘 베이스");

    const usedInvBt = Math.min(invBt, reqBt);
    const usedInvBo = Math.min(invBo, reqBo);
    const usedInvBg = Math.min(invBg, reqBg);

    const netBt = Math.max(0, reqBt - usedInvBt);
    const netBo = Math.max(0, reqBo - usedInvBo);
    const netBg = Math.max(0, reqBg - usedInvBg);

    const reqSeedT = Math.ceil(Math.round((netBt * 8 / yieldMap.tomato) * 1000) / 1000);
    const reqSeedO = Math.ceil(Math.round((netBo * 8 / yieldMap.onion) * 1000) / 1000);
    const reqSeedG = Math.ceil(Math.round((netBg * 8 / yieldMap.garlic) * 1000) / 1000);

    const flatReqs: Record<string, number> = {};
    const addReqs = (recipe: any, qty: number) => {
      for (const [ing, qtyPerCraft] of Object.entries(recipe.ingredients)) {
        if (ing.includes("베이스")) continue;
        const totalNeeded = (qtyPerCraft as number) * qty;
        flatReqs[ing] = (flatReqs[ing] || 0) + totalNeeded;
      }
    };

    addReqs(recA, actualA);
    if (recB) addReqs(recB, actualB);

    const nextInv = { ...inventory };
    const deduct = (itemName: string, amount: number) => {
      if (amount <= 0) return;
      const current = getInvTotal(itemName);
      let remain = current - amount;
      if (remain < 0) remain = 0; 
      
      const b = Math.floor(remain / 3456);
      const s = Math.floor((remain % 3456) / 64);
      const e = remain % 64;

      nextInv[itemName] = {
        box: b === 0 ? '' : b,
        set: s === 0 ? '' : s,
        ea: e === 0 ? '' : e
      };
    };

    deduct("토마토 베이스", usedInvBt);
    deduct("양파 베이스", usedInvBo);
    deduct("마늘 베이스", usedInvBg);

    const f12Lv = userStats.f12Lv || 0;
    const f12Rate = F12_SEED_RETURN[f12Lv] || 0;
    
    const netSeedT = Math.ceil(reqSeedT * (1 - f12Rate));
    const netSeedO = Math.ceil(reqSeedO * (1 - f12Rate));
    const netSeedG = Math.ceil(reqSeedG * (1 - f12Rate));

    deduct("토마토 씨앗", netSeedT);
    deduct("양파 씨앗", netSeedO);
    deduct("마늘 씨앗", netSeedG);

    Object.entries(flatReqs).forEach(([raw, qty]) => {
      deduct(raw, qty);
    });

    setInventory(nextInv);
    const saveObj: Record<string, any> = {};
    Object.keys(nextInv).forEach(k => {
      saveObj[k] = {
        box: parseInt(nextInv[k].box as string, 10) || 0,
        set: parseInt(nextInv[k].set as string, 10) || 0,
        ea: parseInt(nextInv[k].ea as string, 10) || 0
      };
    });
    localStorage.setItem('alldding_cook_inventory', JSON.stringify(saveObj));
    
    setActualCraftedA('');
    setActualCraftedB('');
  };

  const inputBaseClass = "w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[11px] font-black outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-600 text-center shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  const renderInventoryItemNode = (item: string) => (
    <div key={item} className="bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-3 flex flex-col gap-2 hover:border-amber-300 dark:hover:border-amber-500/50 transition-colors shadow-sm w-full">
      <div className="flex items-center gap-2 mb-1">
        <img src={getIngImage(item)} alt="" className="w-5 h-5 object-contain drop-shadow-sm" style={{imageRendering: 'pixelated'}} />
        <span className="text-[11px] sm:text-xs font-black text-gray-800 dark:text-gray-200 truncate">{item}</span>
      </div>
      <div className="flex gap-1.5">
        <div className="relative flex-1">
          <input type="text" value={inventory[item]?.box ?? ''} onChange={(e) => handleInvChange(item, 'box', e.target.value)} onFocus={(e) => e.target.select()} placeholder="0" className={inputBaseClass} />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">상자</span>
        </div>
        <div className="relative flex-1">
          <input type="text" value={inventory[item]?.set ?? ''} onChange={(e) => handleInvChange(item, 'set', e.target.value)} onFocus={(e) => e.target.select()} placeholder="0" className={inputBaseClass} />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">세트</span>
        </div>
        <div className="relative flex-1">
          <input type="text" value={inventory[item]?.ea ?? ''} onChange={(e) => handleInvChange(item, 'ea', e.target.value)} onFocus={(e) => e.target.select()} placeholder="0" className={inputBaseClass} />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">낱개</span>
        </div>
      </div>
    </div>
  );

  if (!loaded) return null;

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in-up pb-10 transition-colors" style={{ overflowAnchor: 'none' }}>
      
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors mb-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md w-max border border-indigo-200 dark:border-transparent mb-2">1. 인프라 조건 설정</h4>
            <div className="flex flex-col gap-2 bg-gray-50 dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm h-full justify-center">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">오늘 요리에 투자할 시간</span>
                  <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{formatTimeStr(timeMins)}</span>
                </div>
                <input type="range" min="30" max="720" step="30" value={timeMins} onChange={(e) => setTimeMins(Number(e.target.value))} className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div className="w-full h-px bg-gray-200 dark:bg-white/10 my-1"></div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">가용 경작지</span>
                  <div className="relative w-24">
                    <input 
                      type="text" 
                      value={maxPlotsInput} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setMaxPlotsInput(val);
                      }} 
                      onBlur={() => {
                        let val = Number(maxPlotsInput);
                        if (val < 70) val = 70;
                        if (val > 2000) val = 2000;
                        setMaxPlotsInput(val);
                      }}
                      className="w-full bg-white dark:bg-black border border-gray-300 dark:border-white/20 rounded-md py-1 pl-2 pr-6 text-[11px] font-black text-indigo-600 dark:text-indigo-400 text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm" 
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-400 pointer-events-none">칸</span>
                  </div>
                </div>
                <input type="range" min="70" max="2000" step="10" value={Number(maxPlotsInput) || 70} onChange={(e) => setMaxPlotsInput(Number(e.target.value))} className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md w-max border border-emerald-200 dark:border-transparent mb-2">2. 스케줄링 연산 모드</h4>
            <div className="flex flex-col bg-gray-50 dark:bg-[#111113] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm h-full justify-center gap-2">
              <div className="flex bg-gray-200/50 dark:bg-black/50 p-1.5 rounded-lg shadow-inner">
                <button type="button" onClick={() => setCalcMode('buy')} className={`relative flex-1 py-2 rounded-md text-[11px] font-black transition-all group flex items-center justify-center gap-1 ${calcMode === 'buy' ? 'bg-white dark:bg-[#1a1a1e] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-300 dark:border-transparent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                  부족 재료 자동 구매
                  <div className="relative flex items-center ml-1">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-current text-[8px] font-bold cursor-help transition-colors text-emerald-500">?</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-gray-800 text-white text-[10px] font-medium rounded-lg shadow-lg z-[100] break-keep leading-relaxed text-left border border-gray-600">
                      씨앗, 베이스만 현재 재고 내에서 철저히 소모량을 계산하고, 고기 등 나머지 바닐라 부자재는 개인설정 단가로 자동 구매했다고 가정하여 순수익을 역산하는 모드입니다.
                    </div>
                  </div>
                </button>
                <button type="button" onClick={() => setCalcMode('strict')} className={`relative flex-1 py-2 rounded-md text-[11px] font-black transition-all group flex items-center justify-center gap-1 ${calcMode === 'strict' ? 'bg-white dark:bg-[#1a1a1e] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-300 dark:border-transparent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                  보유 재고 내에서만 제작
                  <div className="relative flex items-center ml-1">
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-current text-[8px] font-bold cursor-help transition-colors text-emerald-500">?</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-3 bg-gray-800 text-white text-[10px] font-medium rounded-lg shadow-lg z-[100] break-keep leading-relaxed text-left border border-gray-600">
                      씨앗, 베이스, 육류 등 모든 재고 범위를 절대로 초과하지 않고, 가장 먼저 바닥나는 재료(병목)를 기준으로 최적의 제작 수량만 엄격하게 가이드합니다. 추가 구매 안내는 없습니다.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors mb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-indigo-600 dark:text-indigo-400 mb-1">3. 파티 협동 설정 (선택)</h2>
            <p className="text-[11px] text-gray-500 font-bold">마을원을 추가하여 가공/제작 소요 시간을 대폭 단축할 수 있습니다. (최대 14명)</p>
          </div>
          <button 
            type="button"
            onClick={addPartyMember}
            disabled={party.length >= 14}
            className="text-[11px] md:text-xs text-indigo-600 font-black bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800/50 px-4 py-2 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            + 파티원 추가
          </button>
        </div>
        
        {party.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {party.map((lv, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-xl p-2 pl-3 shadow-sm transition-colors">
                <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">마을원 {i+1}</span>
                <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-white/10 px-2 py-1 flex items-center gap-1 transition-colors">
                  <span className="text-[10px] font-bold text-gray-500">불 더 올려!</span>
                  <select 
                    value={lv}
                    onChange={(e) => updatePartyMember(i, Number(e.target.value))}
                    className="bg-transparent text-[11px] font-black text-rose-500 outline-none cursor-pointer appearance-none"
                  >
                    {[0, 1, 2, 3, 4, 5].map(l => <option key={l} value={l} className="bg-white dark:bg-gray-800">Lv.{l}</option>)}
                  </select>
                </div>
                <button type="button" onClick={() => removePartyMember(i)} className="text-gray-400 hover:text-rose-500 ml-1 px-1 transition-colors">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors mb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-amber-600 dark:text-amber-400 mb-1">4. 간편 재고 관리</h2>
            <p className="text-[11px] text-gray-500 font-bold">씨앗, 베이스, 부자재 등 창고 재고를 입력하세요.</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsInventoryVisible(!isInventoryVisible)} 
            className="text-[11px] md:text-xs text-amber-600 font-black bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-800/50 px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            {isInventoryVisible ? '닫기 ▲' : '펼치기 ▼'}
          </button>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${isInventoryVisible ? 'max-h-[5000px] opacity-100 mt-4 border-t border-gray-200 dark:border-white/5 pt-5' : 'max-h-0 opacity-0 mt-0'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-[#111113] p-3 rounded-2xl border border-gray-200 dark:border-transparent">
              <p className="text-[10px] text-gray-500 font-black ml-2 whitespace-nowrap">현재 탭: <span className="text-amber-500">{inventoryTab}</span></p>
              <div className="flex gap-2 overflow-x-auto custom-scrollbar">
                {['전체', '씨앗류', '베이스류', '농작물류', '가공품류', '육류 및 부자재'].map(tab => (
                  <button 
                    type="button"
                    key={tab}
                    onClick={() => setInventoryTab(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black transition-all whitespace-nowrap ${inventoryTab === tab ? 'bg-amber-600 text-white shadow-md' : 'bg-white dark:bg-[#1a1a1e] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 mt-6">
              {(inventoryTab === '전체' || inventoryTab === '씨앗류') && (
                <div className="bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-3 px-1">씨앗류 재고</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {INVENTORY_CATEGORIES['씨앗류'].map(renderInventoryItemNode)}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '베이스류') && (
                <div className="bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-3 px-1">베이스류 (농작물 가공/직발) 재고</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {INVENTORY_CATEGORIES['베이스류'].map(renderInventoryItemNode)}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '농작물류') && (
                <div className="bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-3 px-1">농작물/과일류 재고</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {INVENTORY_CATEGORIES['농작물류'].map(renderInventoryItemNode)}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '가공품류') && (
                <div className="bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-3 px-1">부자재 가공품 재고</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {INVENTORY_CATEGORIES['가공품류'].map(renderInventoryItemNode)}
                  </div>
                </div>
              )}

              {(inventoryTab === '전체' || inventoryTab === '육류 및 부자재') && (
                <div className="bg-white/50 dark:bg-[#0a0a0c]/50 rounded-2xl p-4 shadow-sm border border-amber-100 dark:border-amber-900/30">
                  <h4 className="text-[11px] font-black text-gray-400 tracking-widest uppercase mb-4 px-1">육류 및 기본 부자재 재고</h4>
                  <div className="flex flex-col gap-6">
                    {MEAT_GROUPS.map((group, gIdx) => (
                      <div key={gIdx} className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-[10px] font-black text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">{group.label}</span>
                          <div className="flex-1 h-px bg-gray-200 dark:bg-white/5"></div>
                        </div>
                        <div className={`grid gap-3 grid-cols-1 sm:grid-cols-2 ${group.cols === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} xl:grid-cols-${group.cols}`}>
                          {group.items.map(renderInventoryItemNode)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-white/5 mt-6">
              <button type="button" onClick={clearInventory} className="text-[11px] font-bold px-5 py-2.5 rounded-lg transition-all bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-sm">
                전체 재고 초기화
              </button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[1.5rem] p-5 md:p-6 shadow-sm transition-colors">
        <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 rounded-lg w-max border border-rose-200 dark:border-transparent mb-3">5. 제작 목표 요리 설정 (최대 2종)</h4>
        <p className="text-[11px] font-bold text-gray-500 mb-4 px-1">
          최근 주기 시세(<span className="text-indigo-500">{latestPeriod}</span> 기준), 1,000G 이상이면서 <span className="text-rose-500 font-black">최고가 대비 80% 이상</span>인 Top 5 요리입니다. (품목 최대 2개 선택)
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {top5Candidates.map((r, idx) => {
            const isSelected = selectedRecipes.includes(r.name);
            return (
              <div 
                key={r.name} 
                onClick={() => handleRecipeSelect(r.name)}
                className={`relative p-4 rounded-2xl border cursor-pointer transition-colors ${isSelected ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-400 z-10' : 'bg-gray-50 dark:bg-[#111113] border-gray-200 dark:border-white/5 hover:border-gray-400 dark:hover:border-white/20'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isSelected ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>Top {idx + 1}</span>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">{Math.round(r.ratio * 100)}%</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <img src={`${STORAGE_BASE_URL}/foods/${r.id}.png`} alt="" className="w-8 h-8 object-contain drop-shadow-sm" style={{imageRendering:'pixelated'}} onError={(e) => e.currentTarget.style.display='none'} />
                  <span className="text-xs font-black text-gray-900 dark:text-white truncate">{r.name}</span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm font-black text-gray-900 dark:text-white">{r.currentPrice.toLocaleString()} G</span>
                </div>
              </div>
            );
          })}
        </div>
        {top5Candidates.length === 0 && (
          <div className="p-8 text-center text-xs font-bold text-gray-400 bg-gray-50 dark:bg-[#111113] rounded-2xl border border-dashed border-gray-200 dark:border-white/5 mt-3">
            현재 설정된 단가 기준, 추천할 만한 가치(80% 이상 & 1000G 이상)가 있는 요리가 없습니다.<br/>시세 설정을 다시 확인해주세요.
          </div>
        )}

        <div className="mt-8 flex justify-end relative pt-5 border-t border-gray-200 dark:border-white/5">
          <button type="button" onClick={runSimulation} disabled={isSimulating || top5Candidates.length === 0} className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-black px-10 py-4 rounded-2xl shadow-md transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden group">
            <span className="relative z-10 flex items-center gap-2 text-sm">
              {isSimulating ? `듀얼 시뮬레이션 연산 중... ${simProgress}%` : '선택 조합 연산 시작'}
            </span>
            {isSimulating && <div className="absolute top-0 left-0 h-full bg-emerald-500/20 dark:bg-emerald-500/30 transition-all duration-75" style={{ width: `${simProgress}%` }}></div>}
          </button>
        </div>
      </div>

      {simResult && !isSimulating && (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-6 md:p-8 shadow-md dark:shadow-2xl animate-fade-in-up transition-colors">
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-6">분석 결과</h3>
          
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 p-4 rounded-2xl mb-6 shadow-sm flex gap-3 items-start">
            <span className="text-rose-500 text-lg"></span>
            <p className="text-[11px] md:text-xs font-bold text-rose-700 dark:text-rose-300 leading-relaxed break-keep">
                요리 추천은 작물을 수확하는 시간, 중간중간 휴식을 하거나 제작을 못하는 등의 돌발상황은 고려하지않고 순수하게 작물이 자라는 시간 15분만 반영된 이론상 스케줄 사이클입니다. 5~10%정도 시간이 추가 소요된다고 생각하고 진행하셔야합니다.
            </p>
          </div>

          {simResult.fail ? (
            <div className="py-16 flex flex-col items-center justify-center bg-gray-50 dark:bg-[#111113] rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
              <span className="text-4xl mb-3 font-black text-gray-300">!</span>
              <h4 className="text-sm font-black text-gray-800 dark:text-gray-200 mb-1">수익을 낼 수 있는 요리 조합이 없습니다.</h4>
              <p className="text-[11px] font-bold text-gray-500 text-center">조건(재고 부족, 제한 시간 너무 짧음 등)을 완화하거나<br/>시장 매입 단가를 점검해주세요.</p>
            </div>
          ) : (
            <div className="mt-2 bg-gray-50 dark:bg-[#16161a] rounded-[1.5rem] p-6 lg:p-8 border border-gray-200 dark:border-white/5 shadow-inner">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <h4 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> 
                  상세 가이드
                </h4>
              </div>

              {simResult.isTimeExceeded && (
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl">
                  <p className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 break-keep">
                    안내: 설정하신 가용 시간({formatTimeStr(timeMins)})보다 빠른 {formatSecs(simResult.totalTimeSecs)} 만에 모든 작업 한계치(재고 소진 or 시간부족)에 도달하여 작업을 조기 완료합니다.
                  </p>
                </div>
              )}

              {calcMode === 'strict' && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl">
                  <h5 className="text-[11px] font-black text-rose-800 dark:text-rose-400 mb-2">엄격 모드 병목 재료 안내</h5>
                  <p className="text-[10px] font-bold text-rose-600 dark:text-rose-300 break-keep leading-relaxed flex items-center flex-wrap gap-1">
                    가장 부족한
                    <span className="bg-rose-200 dark:bg-rose-800 text-rose-900 dark:text-rose-100 px-1.5 py-0.5 rounded flex items-center gap-1 mx-1">
                      <img src={getIngImage(simResult.bottleneckItem)} className="w-3.5 h-3.5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                      {simResult.bottleneckItem}
                    </span>
                    재고가 소진되어 더 이상 연산할 수 없습니다. 이 재료를 보충하면 추가 제작이 가능합니다.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-[#111113] border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mb-2 border-b border-indigo-100 dark:border-indigo-500/30 pb-2">최적화 예상 수익명세서</span>
                  
                  <div className="flex flex-col gap-1.5 text-[11px] font-medium text-gray-600 dark:text-gray-400 mb-3">
                    <div className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                      <span className="font-bold">원래 요리 판매 가격</span>
                      <span className="font-bold">+{(simResult.baseRevTotal || 0).toLocaleString()} G</span>
                    </div>

                    <div className="flex flex-col gap-0.5 text-[9px] text-gray-500 pl-2">
                      <div className="flex justify-between items-center">
                        <span>- {simResult.recA.name} ({(simResult.currentPriceA || 0).toLocaleString()}G x {simResult.a}개)</span>
                      </div>
                      {simResult.recB && simResult.b > 0 && (
                        <div className="flex justify-between items-center">
                          <span>- {simResult.recB.name} ({(simResult.currentPriceB || 0).toLocaleString()}G x {simResult.b}개)</span>
                        </div>
                      )}
                    </div>

                    {(userStats.f15Lv || 0) > 0 && (
                      <div className="flex justify-between items-center mt-1">
                        <span>돈 좀 벌어볼까 (Lv.{userStats.f15Lv || 0}) : 상시 적용</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">+{(simResult.f15BonusAmt || 0).toLocaleString()} G</span>
                      </div>
                    )}

                    {simResult.isBulkBonusApplied && (userStats.f5Lv || 0) > 0 && (
                      <div className="flex justify-between items-center mt-1">
                        <span>한 솥 가득 (Lv.{userStats.f5Lv || 0}) : 3세트(192개) 이상 적용</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400">+{(simResult.f5BonusAmt || 0).toLocaleString()} G</span>
                      </div>
                    )}

                    {calcMode === 'buy' && Object.keys(simResult.missingRaws || {}).length > 0 && (
                      <>
                        <div className="flex justify-between items-center mt-1 text-rose-500 border-t border-gray-100 dark:border-white/5 pt-1.5">
                          <span>재료 차감비 (추가 구매)</span>
                          <span className="font-bold">-{Math.floor(simResult.missingCost || 0).toLocaleString()} G</span>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1">
                          {Object.entries(simResult.missingRaws).map(([m, q]: [string, any]) => (
                            <div key={m} className="flex justify-between items-center text-rose-400 pl-2">
                              <div className="flex items-center gap-1.5">
                                <img src={getIngImage(m)} className="w-3.5 h-3.5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                <span className="text-[10px]">{m} ({q.missing}개)</span>
                              </div>
                              <span className="text-[10px] font-bold">-{Math.floor(q.total || 0).toLocaleString()} G</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-indigo-100 dark:border-indigo-500/30 pt-3 mt-auto">
                    <span className="text-xs font-black text-indigo-800 dark:text-indigo-300">최종 순수익</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{(simResult.profit || 0).toLocaleString()} G</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 rounded-2xl p-4 shadow-sm justify-center">
                  <div className="flex flex-col gap-2 h-full max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                     <h5 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 mb-2 sticky top-0 bg-white dark:bg-[#111113] pb-2 border-b border-gray-200 dark:border-white/5 z-10">시간별 상세 진행 가이드</h5>
                     {simResult.timeline && simResult.timeline.map((step: any, i: number) => (
                         <div key={i} className="flex flex-col gap-1.5 bg-gray-50 dark:bg-black/40 p-2.5 rounded-xl border border-gray-100 dark:border-transparent shrink-0">
                             <div className="flex items-center justify-between">
                                 <span className="text-xs font-black text-gray-800 dark:text-gray-200">{step.text}</span>
                                 <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{step.time}</span>
                             </div>
                             {step.items && step.items.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {step.items.map((it: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-[#111113] border border-gray-200 dark:border-white/5 px-2 py-1 rounded text-[10px] font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                                            {it.type === 'food' ? (
                                                <img src={`${STORAGE_BASE_URL}/foods/${it.id}.png`} className="w-3.5 h-3.5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                            ) : (
                                                <img src={getIngImage(it.name)} className="w-3.5 h-3.5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                            )}
                                            {it.name} <span className="text-indigo-600 dark:text-indigo-400">{it.qty}개</span>
                                        </div>
                                    ))}
                                </div>
                             )}
                         </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                
                <div className="bg-white dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/5 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">1</span>
                      </div>
                      <div className="w-px h-full bg-gray-200 dark:bg-white/10 mt-2"></div>
                    </div>
                    <div className="flex flex-col gap-3 pb-2 w-full">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-black text-gray-800 dark:text-gray-200">경작지에 씨앗 배분 및 채집 시작</h5>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 w-fit">
                        총 {simResult.growCycles}회 반복 사이클 진행
                      </span>

                      <div className="bg-gray-50 dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/5 text-[10px] space-y-1.5 mt-1">
                        <p className="font-black text-gray-700 dark:text-gray-300">목표 요리 베이스 요구량</p>
                        <p className="text-gray-600 dark:text-gray-400 font-bold ml-2">토마토 {simResult.reqBt}개 / 양파 {simResult.reqBo}개 / 마늘 {simResult.reqBg}개</p>
                        <p className="font-black text-gray-700 dark:text-gray-300 mt-2">창고 보유 베이스 선 차감</p>
                        <p className="text-gray-600 dark:text-gray-400 font-bold ml-2">보유량: 토마토 {simResult.invBt}개 / 양파 {simResult.invBo}개 / 마늘 {simResult.invBg}개</p>
                        <p className="font-black text-indigo-600 dark:text-indigo-400 mt-2">최종 재배해야 할 부족 베이스</p>
                        <p className="text-indigo-500 dark:text-indigo-300 font-bold ml-2">토마토 {simResult.netBt}개 / 양파 {simResult.netBo}개 / 마늘 {simResult.netBg}개</p>
                      </div>

                      {simResult.growCycles > 0 ? (
                        <>
                          <div className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex mt-2 shadow-inner">
                            {simResult.reqSeedT > 0 && <div className="bg-rose-400 h-full flex items-center justify-center text-[8px] font-black text-white" style={{ width: `${(simResult.reqSeedT / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100}%` }}>토마토 {Math.round((simResult.reqSeedT / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100)}%</div>}
                            {simResult.reqSeedO > 0 && <div className="bg-amber-400 h-full flex items-center justify-center text-[8px] font-black text-white" style={{ width: `${(simResult.reqSeedO / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100}%` }}>양파 {Math.round((simResult.reqSeedO / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100)}%</div>}
                            {simResult.reqSeedG > 0 && <div className="bg-gray-400 h-full flex items-center justify-center text-[8px] font-black text-white" style={{ width: `${(simResult.reqSeedG / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100}%` }}>마늘 {Math.round((simResult.reqSeedG / (simResult.reqSeedT + simResult.reqSeedO + simResult.reqSeedG)) * 100)}%</div>}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                            {simResult.reqSeedT > 0 && (
                              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                <img src={getIngImage('토마토 씨앗')} className="w-8 h-8 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400">토마토 씨앗 (총 {simResult.reqSeedT}개)</span>
                                <span className="text-sm font-black text-rose-800 dark:text-rose-300">사이클당 {Math.ceil(simResult.reqSeedT / simResult.growCycles)}칸</span>
                              </div>
                            )}
                            {simResult.reqSeedO > 0 && (
                              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                <img src={getIngImage('양파 씨앗')} className="w-8 h-8 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">양파 씨앗 (총 {simResult.reqSeedO}개)</span>
                                <span className="text-sm font-black text-amber-800 dark:text-amber-300">사이클당 {Math.ceil(simResult.reqSeedO / simResult.growCycles)}칸</span>
                              </div>
                            )}
                            {simResult.reqSeedG > 0 && (
                              <div className="bg-gray-100 dark:bg-gray-800/30 border border-gray-300 dark:border-gray-600/50 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm">
                                <img src={getIngImage('마늘 씨앗')} className="w-8 h-8 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">마늘 씨앗 (총 {simResult.reqSeedG}개)</span>
                                <span className="text-sm font-black text-gray-800 dark:text-gray-200">사이클당 {Math.ceil(simResult.reqSeedG / simResult.growCycles)}칸</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 mt-3 flex flex-col gap-1.5">
                             <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-800/50 pb-1 mb-0.5">전문가 스킬 효율 분석</span>
                             <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                                 <span>씨앗은 덤이야 (Lv.{userStats.f12Lv || 0}, {((F12_SEED_RETURN[userStats.f12Lv || 0] || 0)*100).toFixed(0)}%)</span>
                                 <span>약 {(simResult.expectedSeedReturn || 0).toFixed(1)}개 회수 예상</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                                 <span>왕 크니까 왕 좋아 (Lv.{userStats.f9Lv || 0}, {((F9_GIANT_CHANCE[userStats.f9Lv || 0] || 0)*100).toFixed(1)}%)</span>
                                 <span>추가 수확 작물 약 {(simResult.expectedExtraCrops || 0).toFixed(1)}개 -&gt; 베이스 약 {((simResult.expectedExtraCrops || 0) / 8).toFixed(2)}개 예상</span>
                             </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 mt-2">
                          안내: 창고의 베이스 재고가 충분하여 재배 사이클을 생략합니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/5 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-black text-amber-600 dark:text-amber-400">2</span>
                      </div>
                      <div className="w-px h-full bg-gray-200 dark:bg-white/10 mt-2"></div>
                    </div>
                    <div className="flex flex-col gap-3 pb-2 w-full">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-black text-gray-800 dark:text-gray-200">수확 작물 베이스 변환 가공</h5>
                      </div>
                      <p className="text-[11px] font-bold text-gray-500">채집한 작물들을 전부 베이스로 가공합니다.</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {simResult.netBt > 0 && (
                          <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 px-4 py-2.5 rounded-xl text-[11px] font-black border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 shadow-sm">
                            <img src={getIngImage('토마토 베이스')} className="w-5 h-5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                            토마토 베이스 가공 {Math.ceil((simResult.reqSeedT * yieldMap.tomato) / 8)}개
                          </div>
                        )}
                        {simResult.netBo > 0 && (
                          <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-4 py-2.5 rounded-xl text-[11px] font-black border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 shadow-sm">
                            <img src={getIngImage('양파 베이스')} className="w-5 h-5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                            양파 베이스 가공 {Math.ceil((simResult.reqSeedO * yieldMap.onion) / 8)}개
                          </div>
                        )}
                        {simResult.netBg > 0 && (
                          <div className="bg-gray-100 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-[11px] font-black border border-gray-300 dark:border-gray-600/50 flex items-center gap-2 shadow-sm">
                            <img src={getIngImage('마늘 베이스')} className="w-5 h-5 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                            마늘 베이스 가공 {Math.ceil((simResult.reqSeedG * yieldMap.garlic) / 8)}개
                          </div>
                        )}
                        {simResult.netBt === 0 && simResult.netBo === 0 && simResult.netBg === 0 && (
                           <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">추가 베이스 가공이 필요하지 않습니다.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 rounded-2xl border border-gray-200 dark:border-white/5 p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">3</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-black text-gray-800 dark:text-gray-200">최종 요리 제작 완료</h5>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1">
                        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/30 w-full sm:w-auto shadow-sm">
                          <img src={`${STORAGE_BASE_URL}/foods/${simResult.recA.id}.png`} className="w-10 h-10 object-contain drop-shadow-sm" style={{imageRendering:'pixelated'}} alt=""/>
                          <span className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-300">{simResult.recA.name} <span className="text-rose-600 dark:text-rose-400 ml-1">{simResult.a}개 완성!</span></span>
                        </div>
                        {simResult.recB && simResult.b > 0 && (
                          <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/30 w-full sm:w-auto shadow-sm">
                            <img src={`${STORAGE_BASE_URL}/foods/${simResult.recB.id}.png`} className="w-10 h-10 object-contain drop-shadow-sm" style={{imageRendering:'pixelated'}} alt=""/>
                            <span className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-300">{simResult.recB.name} <span className="text-rose-600 dark:text-rose-400 ml-1">{simResult.b}개 완성!</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-[#0f0f13] border border-gray-300 dark:border-white/10 rounded-2xl p-6 mt-6 shadow-inner">
                  <div className="mb-4 border-b border-gray-200 dark:border-white/5 pb-3">
                    <h4 className="text-[13px] font-black text-gray-900 dark:text-white">실제 제작 완료 및 창고 재고 반영</h4>
                    <p className="text-[10px] font-bold text-gray-500 mt-1">가이드에 맞춰 요리를 판매하셨다면, 실제 제작한 개수를 입력하여 창고의 재고를 차감하세요.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-white dark:bg-black/50 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm w-full sm:w-auto">
                        <img src={`${STORAGE_BASE_URL}/foods/${simResult.recA.id}.png`} className="w-8 h-8 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                        <div className="flex flex-col gap-1 w-full">
                          <span className="text-[10px] font-black text-gray-800 dark:text-gray-200">{simResult.recA.name}</span>
                          <input type="text" placeholder={`추천: ${simResult.a}개`} value={actualCraftedA} onChange={(e) => setActualCraftedA(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-gray-50 dark:bg-[#1a1a1e] border border-gray-200 dark:border-transparent rounded py-1 px-2 text-[11px] font-black outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                      </div>
                      
                      {simResult.recB && simResult.b > 0 && (
                        <div className="flex items-center gap-2 bg-white dark:bg-black/50 p-2.5 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm w-full sm:w-auto">
                          <img src={`${STORAGE_BASE_URL}/foods/${simResult.recB.id}.png`} className="w-8 h-8 object-contain" style={{imageRendering:'pixelated'}} alt=""/>
                          <div className="flex flex-col gap-1 w-full">
                            <span className="text-[10px] font-black text-gray-800 dark:text-gray-200">{simResult.recB.name}</span>
                            <input type="text" placeholder={`추천: ${simResult.b}개`} value={actualCraftedB} onChange={(e) => setActualCraftedB(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-gray-50 dark:bg-[#1a1a1e] border border-gray-200 dark:border-transparent rounded py-1 px-2 text-[11px] font-black outline-none focus:ring-1 focus:ring-indigo-500 text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={handleDeductInventory}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md transition-all active:scale-95 text-xs whitespace-nowrap h-fit"
                    >
                      창고 재고에 반영하기
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}