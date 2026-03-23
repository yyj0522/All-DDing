'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/header';
import Footer from '@/components/footer';
import confetti from 'canvas-confetti';
import { supabase, getCachedPrices } from '@/lib/supabase';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ITEM_IMAGES } from '@/lib/skillData';

import { 
  getCookingPeriod, OCEAN_FIXED_PRICES, TOWN_RANKS, STAMINA_DRINKS, 
  MINE_RECIPES, FARMING_RECIPES, OCEAN_RECIPES, HUNT_RECIPES, MINE_FIXED_PRICES,
  PICKAXE_BASE_DROPS, PICKAXE_RELIC_CHANCES, LUCKY_HIT_EFFECTS, 
  GEM_DROP_EFFECTS, FLAMING_PICKAXE_EFFECTS, PRICE_BUFF_EFFECTS, AVG_RELIC_POINTS 
} from '@/lib/professionData';

import RecipeTab from '@/components/profession/RecipeTab';
import MiningStatsTab from '@/components/profession/MiningStatsTab';
import FarmingStatsTab from '@/components/profession/FarmingStatsTab';
import OceanStatsTab from '@/components/profession/OceanStatsTab';
import OceanRevenueTab from '@/components/profession/OceanRevenueTab';
import BaristaTab from '@/components/profession/BaristaTab';
import OceanTradeCalcTab from '@/components/profession/OceanTradeCalcTab';

const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

const RECIPES = [
  { id: "c01", name: "토마토 스파게티", maxPrice: 864, isHard: false, ingredients: { "토마토 베이스": 1, "호박 묶음": 1 } },
  { id: "c02", name: "어니언 링", maxPrice: 1296, isHard: false, ingredients: { "양파 베이스": 1, "감자 묶음": 1 } },
  { id: "c03", name: "갈릭 케이크", maxPrice: 810, isHard: false, ingredients: { "마늘 베이스": 1, "당근 묶음": 1 } },
  { id: "c04", name: "삼겹살 토마토 찌개", maxPrice: 2039, isHard: false, ingredients: { "토마토 베이스": 2, "비트 묶음": 1, "요리용 소금": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c05", name: "삼색 아이스크림", maxPrice: 3022, isHard: true, ingredients: { "양파 베이스": 2, "수박 묶음": 1, "코코넛": 1, "설탕 큐브": 1, "요리용 우유": 1 } },
  { id: "c06", name: "마늘 양갈비 핫도그", maxPrice: 1832, isHard: false, ingredients: { "마늘 베이스": 2, "감자 묶음": 1, "오일": 1, "익힌 양고기": 1, "익힌 양 갈비살": 1 } },
  { id: "c07", name: "달콤 시리얼", maxPrice: 2578, isHard: true, ingredients: { "토마토 베이스": 2, "달콤한 열매 묶음": 1, "파인애플": 1, "밀가루 반죽": 1, "오일": 1 } },
  { id: "c08", name: "로스트 치킨 파이", maxPrice: 2253, isHard: false, ingredients: { "마늘 베이스": 2, "당근 묶음": 1, "버터 조각": 1, "익힌 닭고기": 1, "익힌 닭 다리살": 1 } },
  { id: "c09", name: "스윗 치킨 햄버거", maxPrice: 3612, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "비트 묶음": 1, "달콤한 열매 묶음": 1, "익힌 닭 가슴살": 1, "익힌 닭 다리살": 1 } },
  { id: "c10", name: "토마토 파인애플 피자", maxPrice: 3455, isHard: true, ingredients: { "토마토 베이스": 2, "마늘 베이스": 2, "파인애플": 1, "치즈 조각": 1, "스테이크": 1, "익힌 소 등심": 1 } },
  { id: "c11", name: "양파 수프", maxPrice: 3797, isHard: true, ingredients: { "양파 베이스": 2, "마늘 베이스": 1, "감자 묶음": 1, "코코넛": 1, "버터 조각": 1, "익힌 돼지 앞다리살": 1 } },
  { id: "c12", name: "허브 삼겹살 찜", maxPrice: 2982, isHard: false, ingredients: { "마늘 베이스": 2, "양파 베이스": 1, "호박 묶음": 1, "감자 묶음": 1, "익힌 돼지고기": 1, "익힌 돼지 삼겹살": 1 } },
  { id: "c13", name: "토마토 라자냐", maxPrice: 4181, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "호박 묶음": 1, "밀가루 반죽": 1, "익힌 양 다리살": 1 } },
  { id: "c14", name: "딥 크림 빠네", maxPrice: 3837, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "수박 묶음": 1, "감자 묶음": 1, "치즈 조각": 1, "요리용 우유": 1 } },
  { id: "c15", name: "트리플 소갈비 꼬치", maxPrice: 4307, isHard: false, ingredients: { "토마토 베이스": 1, "양파 베이스": 1, "마늘 베이스": 1, "당근 묶음": 1, "비트 묶음": 1, "설탕 큐브": 1, "익힌 소 갈비살": 1 } },
];

const WIDGET_OPTIONS = [
  { id: 'myStats', name: '내 캐릭터 상세 스펙' },
  { id: 'recipes', name: '통합 조합법 사전' },
  { id: 'marketPrices', name: '통합 변동 시세표' },
  { id: 'dailyRevenue', name: '전문가 일일 예상 수익' },
  { id: 'oceanTrade', name: '해양 종합 거래 계산기' },
  { id: 'barista', name: '바리스타 시뮬레이터' },
  { id: 'timerMod', name: '타이머 모드 다운로드' },
  { id: 'quickLinks', name: '빠른 메뉴 이동' }
];

const DEFAULT_SUB_LAYOUT = ['marketPrices', 'recipes', 'dailyRevenue', 'quickLinks'];

function SortableWidget({ id, children }: { id: string, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, opacity: isDragging ? 0.7 : 1 };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className={`relative group bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 ${isDragging ? 'border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'hover:border-gray-300 dark:hover:border-white/20'} rounded-3xl shadow-sm dark:shadow-xl flex flex-col h-[280px] transition-all overflow-hidden w-full cursor-grab active:cursor-grabbing`}
    >
      <div className="flex-1 relative z-10 p-5 flex flex-col">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [subtitle, setSubtitle] = useState('모든 것');
  const [isGlitching, setIsGlitching] = useState(false);
  const subtitleRef = useRef<HTMLSpanElement>(null);
  
  const [dbPrices, setDbPrices] = useState<Record<string, number>>({});
  const [releaseNotes, setReleaseNotes] = useState<any[]>([]);
  const [cookingPeriod, setCookingPeriod] = useState('');
  
  const [mainWidget, setMainWidget] = useState<string | null>('myStats');
  const [activeSubWidgets, setActiveSubWidgets] = useState<string[]>([]);
  const [isMainWidgetCollapsed, setIsMainWidgetCollapsed] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [recipeTab, setRecipeTab] = useState<'채광'|'재배'|'해양'|'사냥'>('채광');
  const [marketTab, setMarketTab] = useState<'요리'|'해양'>('요리');
  const [revenueTab, setRevenueTab] = useState<'채광'|'해양'|'사냥'>('채광');
  const [targetZone, setTargetZone] = useState<'코룸' | '리프톤' | '세렌트'>('코룸');

  const [userStats, setUserStats] = useState<any>({
    stamina: 3000, townRank: '새싹',
    pickaxeLv: 0, rodLv: 0, hoeLv: 0, weaponLv: 0,
    luckyHitLv: 0, gemDropLv: 0, flamingPickLv: 0, ingotBuffLv: 0, gemBuffLv: 0,
    o11Lv: 0, o12Lv: 0, o14Lv: 0, o16Lv: 0, o17Lv: 0,
    f3Lv: 0, f8Lv: 0, f15Lv: 0, f16Lv: 0, f22Lv: 0,
    h2Lv: 0, h6Lv: 0, h9Lv: 0, h14Lv: 0, h15Lv: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const triggerExplosion = () => {
    if (!subtitleRef.current) return;
    const rect = subtitleRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({ particleCount: 150, spread: 360, origin: { x, y }, colors: ['#818cf8', '#22d3ee', '#ffffff', '#a5f3fc', '#c7d2fe'], ticks: 150, gravity: 0.6, scalar: 0.8, startVelocity: 45, shapes: ['circle', 'square'] });
  };

  useEffect(() => {
    const savedMain = localStorage.getItem('alldding_main_widget');
    const savedSub = localStorage.getItem('alldding_sub_layout');
    const savedCollapsed = localStorage.getItem('alldding_main_widget_collapsed');
    
    if (savedMain !== null) setMainWidget(savedMain === 'none' ? null : savedMain);
    if (savedCollapsed !== null) setIsMainWidgetCollapsed(savedCollapsed === 'true');
    
    if (savedSub) {
      const parsedSub = JSON.parse(savedSub);
      const validSub = parsedSub.filter((id: string) => WIDGET_OPTIONS.some(opt => opt.id === id));
      setActiveSubWidgets(validSub);
    } else {
      setActiveSubWidgets(DEFAULT_SUB_LAYOUT);
    }

    const sLevels = localStorage.getItem('alldding_profession');
    const sTools = localStorage.getItem('alldding_sage_tools');
    const sMisc = localStorage.getItem('alldding_misc_settings');
    
    let uStats = { ...userStats };
    if (sLevels) {
      const p = JSON.parse(sLevels);
      uStats.luckyHitLv = p['m6'] || 0; 
      uStats.gemDropLv = p['m3'] || 0; 
      uStats.flamingPickLv = p['m7'] || 0; 
      uStats.ingotBuffLv = p['m5'] || 0; 
      uStats.gemBuffLv = p['m4'] || 0; 
      uStats.o11Lv = p['o11'] || 0;
      uStats.o12Lv = p['o12'] || 0;
      uStats.o14Lv = p['o14'] || 0;
      uStats.o16Lv = p['o16'] || 0;
      uStats.o17Lv = p['o17'] || 0;
      uStats.f3Lv = p['f3'] || 0;
      uStats.f8Lv = p['f8'] || 0;
      uStats.f15Lv = p['f15'] || 0;
      uStats.f16Lv = p['f16'] || 0;
      uStats.f22Lv = p['f22'] || 0;
      uStats.h2Lv = p['h2'] || 0;
      uStats.h6Lv = p['h6'] || 0;
      uStats.h9Lv = p['h9'] || 0;
      uStats.h14Lv = p['h14'] || 0;
      uStats.h15Lv = p['h15'] || 0;
    }
    if (sTools) {
      const t = JSON.parse(sTools);
      uStats.pickaxeLv = t['pickaxe'] || 0;
      uStats.rodLv = t['rod'] || 0;
      uStats.hoeLv = t['hoe'] || 0;
      uStats.weaponLv = t['weapon'] || 0;
    }
    if (sMisc) {
      const m = JSON.parse(sMisc);
      uStats.townRank = m.townRank || '새싹';
      const baseStamina = TOWN_RANKS.find(r => r.value === uStats.townRank)?.maxStamina || 3000;
      const drinkRecovery = (m.drinkRoutine || []).reduce((sum: number, val: number) => {
        const d = STAMINA_DRINKS.find(drink => drink.value === val);
        return sum + (d?.recovery || 0);
      }, 0);
      uStats.stamina = baseStamina + drinkRecovery;
    }
    setUserStats(uStats);

    setCookingPeriod(getCookingPeriod());
    const fetchData = async () => {
      const [priceData, { data: notesData }] = await Promise.all([
        getCachedPrices(),
        supabase.from('release_notes').select('*').order('created_at', { ascending: false }).limit(3)
      ]);
      if (priceData && priceData.length > 0) {
        const pm: Record<string, number> = {};
        priceData.forEach((row: any) => { pm[row.item_name] = row.price; });
        setDbPrices(pm);
      }
      if (notesData) setReleaseNotes(notesData);
      setIsLoaded(true);
    };
    fetchData();

    const glitchStartTimer = setTimeout(() => setIsGlitching(true), 1000);
    const explosionAndChangeTimer = setTimeout(() => { triggerExplosion(); setSubtitle('All thing'); }, 2200);
    const glitchStopTimer = setTimeout(() => setIsGlitching(false), 2250);
    return () => { clearTimeout(glitchStartTimer); clearTimeout(explosionAndChangeTimer); clearTimeout(glitchStopTimer); };
  }, []);

  const saveLayout = (newMain: string | null, newSub: string[]) => {
    setMainWidget(newMain);
    setActiveSubWidgets(newSub);
    localStorage.setItem('alldding_main_widget', newMain || 'none');
    localStorage.setItem('alldding_sub_layout', JSON.stringify(newSub));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = activeSubWidgets.indexOf(active.id);
      const newIndex = activeSubWidgets.indexOf(over.id);
      saveLayout(mainWidget, arrayMove(activeSubWidgets, oldIndex, newIndex));
    }
  };

  const toggleSubWidget = (id: string) => {
    if (activeSubWidgets.includes(id)) saveLayout(mainWidget, activeSubWidgets.filter(w => w !== id));
    else saveLayout(mainWidget, [...activeSubWidgets, id]);
  };

  const handleMainWidgetChange = (id: string) => {
    const newMain = id === 'none' ? null : id;
    let newSub = [...activeSubWidgets];
    if (mainWidget && mainWidget !== 'none' && !newSub.includes(mainWidget)) newSub.push(mainWidget);
    if (newMain) newSub = newSub.filter(w => w !== newMain);
    saveLayout(newMain, newSub);
  };

  const toggleMainWidgetCollapse = () => {
    setIsMainWidgetCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('alldding_main_widget_collapsed', String(newVal));
      return newVal;
    });
  };

  const allRecipesSorted = useMemo(() => {
    if (!isLoaded || Object.keys(dbPrices).length === 0) return [];
    return RECIPES.map(recipe => {
      const currentMarketPrice = dbPrices[recipe.name] || 0;
      const percentToMax = recipe.maxPrice === 0 ? 0 : Math.min((currentMarketPrice / recipe.maxPrice) * 100, 100);
      return { name: recipe.name, percentToMax, currentMarketPrice, maxPrice: recipe.maxPrice };
    }).sort((a, b) => b.percentToMax - a.percentToMax || b.currentMarketPrice - a.currentMarketPrice);
  }, [dbPrices, isLoaded]);

  const top3Recipes = allRecipesSorted.slice(0, 3);

  const miningResults = useMemo(() => {
    const totalActions = Math.floor(userStats.stamina / 10);
    const baseDrop = userStats.pickaxeLv > 0 ? PICKAXE_BASE_DROPS[userStats.pickaxeLv - 1] : 1; 
    const luckyHit = LUCKY_HIT_EFFECTS[userStats.luckyHitLv] || { chance: 0, amount: 0 };
    const totalOres = totalActions * (baseDrop + (luckyHit.chance * luckyHit.amount));
    const flamingChance = FLAMING_PICKAXE_EFFECTS[userStats.flamingPickLv] || 0;
    const expectedIngots = Math.floor((totalOres / 16) + (totalActions * flamingChance));

    const gemDrop = GEM_DROP_EFFECTS[userStats.gemDropLv] || { chance: 0, amount: 0 };
    const expectedGems = totalActions * (userStats.gemDropLv > 0 ? (gemDrop.chance * gemDrop.amount) : 0);

    const relicChance = userStats.pickaxeLv > 0 ? PICKAXE_RELIC_CHANCES[userStats.pickaxeLv - 1] : 0;
    const expectedRelics = totalActions * relicChance;

    const baseIngotPrice = MINE_FIXED_PRICES.ingots.find(i => i.zone === targetZone)?.base || 0;
    const baseGemPrice = MINE_FIXED_PRICES.gems.find(g => g.zone === targetZone)?.base || 0;

    const finalIngotPrice = Math.floor(baseIngotPrice * (1 + (PRICE_BUFF_EFFECTS[userStats.ingotBuffLv] || 0)));
    const finalGemPrice = Math.floor(baseGemPrice * (1 + (PRICE_BUFF_EFFECTS[userStats.gemBuffLv] || 0)));

    return { 
      expectedIngots, expectedGems, expectedRelics, expectedRelicPoints: expectedRelics * AVG_RELIC_POINTS, 
      ingotRevenue: expectedIngots * finalIngotPrice, gemRevenue: expectedGems * finalGemPrice, 
      totalRevenue: (expectedIngots * finalIngotPrice) + (expectedGems * finalGemPrice) 
    };
  }, [userStats, targetZone]);

  const renderMyStatsFull = () => (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 shrink-0">
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">마을 등급</p>
          <p className="text-base font-black text-gray-900 dark:text-white">{userStats.townRank}</p>
        </div>
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">총 스태미나</p>
          <p className="text-base font-black text-emerald-500 dark:text-emerald-400">{userStats.stamina.toLocaleString()}</p>
        </div>
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">세이지 곡괭이</p>
          <p className="text-base font-black text-stone-500 dark:text-stone-400">+{userStats.pickaxeLv}</p>
        </div>
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">세이지 낚싯대</p>
          <p className="text-base font-black text-blue-500 dark:text-blue-400">+{userStats.rodLv}</p>
        </div>
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">세이지 괭이</p>
          <p className="text-base font-black text-green-500 dark:text-green-400">+{userStats.hoeLv}</p>
        </div>
        <div className="bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 text-center shadow-inner">
          <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase">세이지 무기</p>
          <p className="text-base font-black text-rose-500 dark:text-rose-400">+{userStats.weaponLv}</p>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-stone-50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-500/20 rounded-2xl p-5">
          <h4 className="text-sm font-black text-stone-600 dark:text-stone-400 mb-4 border-b border-stone-200 dark:border-stone-500/20 pb-2">채광 핵심 스킬</h4>
          <div className="grid grid-cols-2 gap-y-3 text-[11px] md:text-xs font-bold">
            <span className="text-gray-500 dark:text-gray-400">럭키히트</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.luckyHitLv}</span>
            <span className="text-gray-500 dark:text-gray-400">보석드롭</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.gemDropLv}</span>
            <span className="text-gray-500 dark:text-gray-400">불붙은 곡괭이</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.flamingPickLv}</span>
            <span className="text-gray-500 dark:text-gray-400">주괴 판매버프</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.ingotBuffLv}</span>
            <span className="text-gray-500 dark:text-gray-400">보석 판매버프</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.gemBuffLv}</span>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-5">
          <h4 className="text-sm font-black text-blue-600 dark:text-blue-400 mb-4 border-b border-blue-200 dark:border-blue-500/20 pb-2">해양 핵심 스킬</h4>
          <div className="grid grid-cols-2 gap-y-3 text-[11px] md:text-xs font-bold">
            <span className="text-gray-500 dark:text-gray-400">심해 채집꾼</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.o11Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">조개 좀 사조개</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.o12Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">조개 무한리필</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.o14Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">프리미엄 한정가</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.o16Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">별별별!</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.o17Lv}</span>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/20 rounded-2xl p-5">
          <h4 className="text-sm font-black text-green-600 dark:text-green-400 mb-4 border-b border-green-200 dark:border-green-500/20 pb-2">재배 핵심 스킬</h4>
          <div className="grid grid-cols-2 gap-y-3 text-[11px] md:text-xs font-bold">
            <span className="text-gray-500 dark:text-gray-400">후르츠 파티</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.f3Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">오늘도 풍년이다!</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.f8Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">돈 좀 벌어볼까?</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.f15Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">불붙은 괭이</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.f16Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">커피값이 밥값</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.f22Lv}</span>
          </div>
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5">
          <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 mb-4 border-b border-rose-200 dark:border-rose-500/20 pb-2">사냥 핵심 스킬</h4>
          <div className="grid grid-cols-2 gap-y-3 text-[11px] md:text-xs font-bold">
            <span className="text-gray-500 dark:text-gray-400">끝까지 간다!</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.h2Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">값어치 증명</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.h6Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">야수의 심장</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.h9Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">상태 좋네!</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.h14Lv}</span>
            <span className="text-gray-500 dark:text-gray-400">넌 이제 내 거야!</span><span className="text-gray-900 dark:text-white text-right">Lv.{userStats.h15Lv}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const getWidgetContent = (id: string, isMain: boolean) => {
    switch (id) {
      case 'myStats':
        return {
          title: '내 캐릭터 상세 스펙',
          content: isMain ? renderMyStatsFull() : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">마일 등급: <span className="text-gray-900 dark:text-white">{userStats.townRank}</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">보유 스태미나: {userStats.stamina.toLocaleString()}</p>
              <Link href="/settings" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">상세 스펙 확인 및 설정</Link>
            </div>
          )
        };

      case 'recipes':
        return {
          title: '통합 조합법 사전',
          content: isMain ? (
            <div className="flex flex-col h-full">
              <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-white/10 pb-2 shrink-0">
                {['채광', '재배', '해양', '사냥'].map(tab => (
                  <button key={tab} onClick={() => setRecipeTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${recipeTab === tab ? 'bg-gray-900 dark:bg-white text-white dark:text-black shadow-lg shadow-gray-200 dark:shadow-white/10' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>{tab}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {recipeTab === '채광' && <RecipeTab recipes={MINE_RECIPES} />}
                {recipeTab === '재배' && <RecipeTab recipes={FARMING_RECIPES} />}
                {recipeTab === '해양' && <RecipeTab recipes={OCEAN_RECIPES} />}
                {recipeTab === '사냥' && <RecipeTab recipes={HUNT_RECIPES} />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">모든 직업의 조합법을 한눈에</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">채광, 재배, 해양, 사냥의 필수 조합법과 재료를 검색하고 확인하세요.</p>
              <Link href="/profession" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">조합법 보러가기</Link>
            </div>
          )
        };

      case 'marketPrices':
        return {
          title: '통합 변동 시세표',
          content: isMain ? (
            <div className="flex flex-col h-full">
              <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-white/10 pb-2 shrink-0">
                <button onClick={() => setMarketTab('요리')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketTab === '요리' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>요리 (3일 주기)</button>
                <button onClick={() => setMarketTab('해양')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketTab === '해양' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>해양 공예품 (1일 주기)</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {marketTab === '요리' ? <FarmingStatsTab /> : <OceanStatsTab />}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">실시간 시세 트렌드 파악</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">요리 3일 주기, 해양 공예품 1일 주기 변동 시세를 한눈에 파악하세요.</p>
              <Link href="/profession" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">시세표 확인하기</Link>
            </div>
          )
        };

      case 'dailyRevenue':
        return {
          title: '전문가 일일 예상 수익',
          content: isMain ? (
            <div className="flex flex-col h-full">
              <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-white/10 pb-2 shrink-0">
                <button onClick={() => setRevenueTab('채광')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${revenueTab === '채광' ? 'bg-stone-600 text-white shadow-lg shadow-stone-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>채광</button>
                <button onClick={() => setRevenueTab('해양')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${revenueTab === '해양' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>해양</button>
                <button onClick={() => setRevenueTab('사냥')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${revenueTab === '사냥' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}>사냥</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                {revenueTab === '채광' && <MiningStatsTab userStats={userStats} targetZone={targetZone} setTargetZone={setTargetZone} results={miningResults} />}
                {revenueTab === '해양' && <OceanRevenueTab userStats={userStats} />}
                {revenueTab === '사냥' && (
                  <div className="h-full flex flex-col items-center justify-center bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl p-6 text-center">
                    <svg className="w-12 h-12 text-rose-500 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <p className="text-base font-bold text-gray-900 dark:text-white mb-2">데이터 수집 중</p>
                    <p className="text-sm text-rose-500 dark:text-rose-200/60 leading-relaxed">사냥 전문가의 정확한 수익 예측을 위해<br/>충분한 데이터를 수집하고 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-500/10 text-stone-500 dark:text-stone-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">정확한 일일 기대 수익</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">내 스펙(능력치, 스킬, 도구)을 기반으로 각 직업별 하루 기대 수익을 계산합니다.</p>
              <Link href="/profession" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">수익 계산하기</Link>
            </div>
          )
        };

      case 'oceanTrade':
        return {
          title: '해양 종합 거래 계산기',
          content: isMain ? (
            <div className="h-full overflow-y-auto custom-scrollbar -mx-2 px-2"><OceanTradeCalcTab userStats={userStats} /></div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">유저 거래 & 최적 루트 산출</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">거래 단가를 바탕으로 총액을 계산하거나, 1개당 마진이 가장 높은 연금품을 추천받으세요.</p>
              <Link href="/profession" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">계산기 열기</Link>
            </div>
          )
        };

      case 'barista':
        return {
          title: '바리스타 시뮬레이터',
          content: isMain ? (
            <div className="h-full overflow-y-auto custom-scrollbar -mx-2 px-2"><BaristaTab /></div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-700/20 text-amber-600 dark:text-amber-500 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 8h-3V4H3c-1.103 0-2 .897-2 2v11c0 1.103.897 2 2 2h15c1.103 0 2-.897 2-2v-5c0-1.103-.897-2-2-2zm-2 9H4V6h12v11zm2-2h-2V10h2v5z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">카페 납품 효율 분석</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">각 음료별 원가와 수익을 분석하고 가장 효율적인 납품 전략을 세워보세요.</p>
              <Link href="/profession" className="mt-auto w-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2.5 rounded-xl text-xs font-bold transition-colors">시뮬레이터 열기</Link>
            </div>
          )
        };

      case 'timerMod':
        return {
          title: '타이머 모드 퀵 다운',
          content: isMain ? (
            <div className="flex flex-col h-full items-center justify-center text-center p-6">
               <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-6 shadow-sm dark:shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                 <svg className="w-10 h-10 text-rose-500 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               </div>
               <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Timer-Mod v1.0.1</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 max-w-md leading-relaxed">띵타이쿤 내의 각종 제작, 가공, 제련 소요 시간을 화면에 직관적으로 띄워주는 필수 편의성 모드입니다.</p>
               <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                 <a href="https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-fabric-1.0.1.jar" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl transition-colors shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 text-lg">Fabric 다운로드</a>
                 <a href="https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-neoforge-1.0.1.jar" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-lg">NeoForge 다운로드</a>
               </div>
            </div>
          ) : (
            <div className="flex flex-col h-full items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 flex items-center justify-center mb-3"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Timer-Mod</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 px-2 leading-relaxed">제작/가공 시간을 화면에 띄워주는 필수 모드를 빠르게 다운로드하세요.</p>
              <div className="mt-auto w-full grid grid-cols-2 gap-2">
                <a href="https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-fabric-1.0.1.jar" className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg text-[11px] font-bold transition-colors">Fabric 용</a>
                <a href="https://raw.githubusercontent.com/yyj0522/alldding-assets/main/files/timermod-neoforge-1.0.1.jar" className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white py-2 rounded-lg text-[11px] font-bold transition-colors">NeoForge 용</a>
              </div>
            </div>
          )
        };

      case 'quickLinks':
        return {
          title: '빠른 메뉴 이동',
          content: (
            <div className="h-full flex flex-col justify-center gap-3">
              <Link href="/profession" className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/5 hover:border-amber-400 dark:hover:border-amber-500/40 rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-gray-100 dark:hover:bg-white/5">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">전문가 기능 전체보기</span>
              </Link>
              <Link href="/map" className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/5 hover:border-emerald-400 dark:hover:border-emerald-500/40 rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-gray-100 dark:hover:bg-white/5">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg></div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">아일랜드 인터랙티브 지도</span>
              </Link>
              <Link href="/resources" className="bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/5 hover:border-cyan-400 dark:hover:border-cyan-500/40 rounded-xl p-3 flex items-center gap-3 transition-all hover:bg-gray-100 dark:hover:bg-white/5">
                <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">마인크래프트 모드 자료실</span>
              </Link>
            </div>
          )
        };

      default: return { title: '', content: null };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-black/20 dark:selection:bg-white/20 relative flex flex-col transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none !important; margin: 0 !important; }
        input[type="number"] { -moz-appearance: textfield !important; }
        @keyframes glitch {
          0% { transform: translate(0); text-shadow: -3px 0 #818cf8, 3px 0 #22d3ee; }
          20% { transform: translate(-5px, 2px); }
          40% { transform: translate(-2px, -4px); text-shadow: 4px 0 #818cf8, -4px 0 #22d3ee; }
          60% { transform: translate(4px, 3px); }
          80% { transform: translate(2px, -3px); text-shadow: -3px 0 #818cf8, 3px 0 #22d3ee; }
          100% { transform: translate(0); }
        }
        .animate-glitch { animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite; }
      `}} />

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none z-0 transition-colors duration-300"></div>
      <Header />
      
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-4 pt-32 md:pt-40 pb-20">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-4 leading-tight">
              띵타이쿤의{' '}
              <span 
                ref={subtitleRef} 
                className={`relative inline-block ${isGlitching ? 'animate-glitch text-indigo-600 dark:text-cyan-300' : subtitle === 'All thing' ? 'text-indigo-600 dark:text-cyan-300' : 'text-gray-900 dark:text-gray-100'} transition-colors duration-300`}
              >
                {subtitle}
              </span>,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-500 dark:from-cyan-400 dark:to-indigo-400 drop-shadow-md dark:drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">All-DDing</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed text-sm md:text-base font-medium tracking-wide mx-auto md:mx-0">
              올띵은 띵타이쿤 유저들을 위한 <span className="font-bold text-red-500 dark:text-red-400 underline underline-offset-4 decoration-red-500/50">비공식</span> 종합 도구 모음 사이트입니다.
            </p>
          </div>
          <div className="flex justify-center md:justify-end shrink-0">
            <button onClick={() => setIsSettingsOpen(true)} className="bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-[#1a1a1e] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-300 text-xs font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-sm dark:shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              대시보드 위젯 편집
            </button>
          </div>
        </div>

        {mainWidget && (
          <div className="w-full mb-8 animate-fade-in-up">
            <div className={`bg-white dark:bg-[#0a0a0c] border border-gray-200 dark:border-white/10 rounded-3xl shadow-sm dark:shadow-2xl overflow-hidden flex flex-col relative transition-colors ${isMainWidgetCollapsed ? 'h-auto' : 'h-auto min-h-[600px]'}`}>
              <div className="bg-gray-100 dark:bg-[#111113] border-b border-gray-200 dark:border-white/5 p-3 flex items-center justify-between shrink-0 sticky top-0 z-50 transition-colors">
                <div className="flex items-center gap-2 w-20 sm:w-24 pl-1">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 rounded-lg py-1.5 px-4 text-center max-w-sm mx-auto shadow-sm dark:shadow-none">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 font-mono">{getWidgetContent(mainWidget, true).title}</span>
                </div>
                <div className="w-20 sm:w-24 flex justify-end pr-1">
                  <button 
                    onClick={toggleMainWidgetCollapse}
                    className="text-[10px] sm:text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 px-2 sm:px-3 py-1 rounded transition-colors"
                  >
                    {isMainWidgetCollapsed ? '펼치기' : '접기'}
                  </button>
                </div>
              </div>
              {!isMainWidgetCollapsed && (
                <div className="p-4 md:p-8">
                  {getWidgetContent(mainWidget, true).content}
                </div>
              )}
            </div>
          </div>
        )}

        {isLoaded ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={activeSubWidgets} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
                {activeSubWidgets.map(id => (
                  <SortableWidget key={id} id={id}>
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-white/5 shrink-0 flex items-center gap-2">
                      <div className="w-1.5 h-3 bg-cyan-500 rounded-full"></div>
                      {getWidgetContent(id, false).title}
                    </h3>
                    <div className="flex-1">
                      {getWidgetContent(id, false).content}
                    </div>
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="h-[280px] flex items-center justify-center mb-10"><p className="text-gray-500 animate-pulse font-bold">대시보드 위젯 동기화 중...</p></div>
        )}

        <section className="mb-10 bg-white dark:bg-gradient-to-r dark:from-[#111113] dark:to-[#0a0a0c] border border-gray-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-br-[100px] blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-white/5 pb-4 relative z-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <div className="w-2 h-5 bg-indigo-500 rounded-full"></div>
              최고가 대비 요리 TOP 3
            </h2>
            <span className="text-xs text-gray-600 dark:text-gray-500 font-bold bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">{cookingPeriod} 기준</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {top3Recipes.map((item, index) => {
              const colors = [
                { border: 'border-yellow-500/20', shadow: 'shadow-md dark:shadow-[0_0_15px_rgba(234,179,8,0.1)]', numBg: 'from-yellow-300 to-yellow-600', numText: 'text-black', percentText: 'text-yellow-600 dark:text-yellow-400' },
                { border: 'border-gray-200 dark:border-white/5', shadow: 'shadow-sm dark:shadow-none', numBg: 'from-gray-300 to-gray-500', numText: 'text-black', percentText: 'text-gray-600 dark:text-gray-300' },
                { border: 'border-gray-200 dark:border-white/5', shadow: 'shadow-sm dark:shadow-none', numBg: 'from-amber-600 to-amber-800', numText: 'text-white', percentText: 'text-amber-600' }
              ][index];
              return (
                <div key={item.name} className={`flex items-center justify-between p-4 md:p-5 rounded-2xl bg-gray-50 dark:bg-black/40 border ${colors.border} ${colors.shadow} hover:bg-gray-100 dark:hover:bg-white/5 transition-colors group`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colors.numBg} flex items-center justify-center shrink-0`}>
                      <span className={`text-sm font-black ${colors.numText}`}>{index + 1}</span>
                    </div>
                    <div className="w-12 h-12 bg-white dark:bg-black/60 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 p-2 group-hover:scale-110 transition-transform shadow-sm dark:shadow-none">
                      <img src={`${STORAGE_BASE_URL}/foods/${ITEM_IMAGES[item.name]}.png`} alt={item.name} className="w-full h-full object-contain drop-shadow-md" style={{ imageRendering: 'pixelated' }} />
                    </div>
                    <span className={`font-bold text-sm md:text-base ${index === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>{item.name}</span>
                  </div>
                  <div className="text-right flex flex-col items-end pl-4">
                    <div className={`font-black whitespace-nowrap text-lg md:text-xl ${colors.percentText}`}>{item.currentMarketPrice.toLocaleString()} G</div>
                    <div className="text-[11px] text-gray-500 font-bold whitespace-nowrap mt-1 bg-white dark:bg-white/5 px-2 py-0.5 rounded border border-gray-200 dark:border-transparent">효율 {item.percentToMax.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
            {top3Recipes.length === 0 && <div className="col-span-3 text-gray-500 text-center py-6 text-sm">시세 정보를 불러오는 중입니다...</div>}
          </div>
        </section>

        <section className="bg-white dark:bg-gradient-to-r dark:from-[#111113] dark:to-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 dark:bg-white/5 rounded-bl-[100px] blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">올띵 업데이트 노트</h2>
            </div>
            <Link href="/note" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1 text-xs md:text-sm font-bold group bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-transparent">전체보기<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>
          </div>
          <div className="space-y-3 relative z-10">
            {releaseNotes.map(note => (
              <div key={note.id} className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 p-4 rounded-xl hover:border-gray-300 dark:hover:border-white/20 transition-colors group">
                <span className="text-cyan-600 dark:text-cyan-400 font-bold text-xs whitespace-nowrap bg-cyan-100 dark:bg-cyan-500/10 px-2 py-1 rounded inline-block w-fit border border-cyan-200 dark:border-cyan-500/20">{note.version}</span>
                <Link href={`/note/${note.id}`} className="text-gray-700 dark:text-gray-300 text-sm font-bold hover:text-gray-900 dark:hover:text-white transition-colors">{note.title}</Link>
                <span className="text-gray-500 dark:text-gray-600 text-xs md:ml-auto font-mono mt-1 md:mt-0">{new Date(note.created_at).toISOString().split('T')[0]}</span>
              </div>
            ))}
            {releaseNotes.length === 0 && <p className="text-gray-500 text-sm text-center py-4">등록된 패치노트가 없습니다.</p>}
          </div>
        </section>
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg md:max-w-2xl shadow-2xl animate-fade-in-up flex flex-col max-h-[90vh] overflow-hidden">
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 shrink-0">대시보드 편집</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 shrink-0">나만의 메인 화면을 구성해 보세요.</p>
            
            <div className="flex flex-col md:flex-row gap-6 min-h-0 flex-1">
              <div className="flex-1 flex flex-col min-h-0 shrink-0">
                <label className="block text-xs font-bold text-cyan-600 dark:text-cyan-400 mb-2">화면 중앙 메인 위젯 (1개)</label>
                <select value={mainWidget || 'none'} onChange={(e) => handleMainWidgetChange(e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500">
                  <option value="none">사용 안 함 (창 닫기)</option>
                  {WIDGET_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2 shrink-0">하단 서브 위젯 (다중 선택 가능)</label>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 max-h-[40vh] md:max-h-full">
                  {WIDGET_OPTIONS.map(option => {
                    const isMain = mainWidget === option.id;
                    return (
                      <label key={option.id} className={`flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-white/5 transition-colors ${isMain ? 'bg-gray-100 dark:bg-black/20 opacity-50 cursor-not-allowed' : 'bg-white dark:bg-black/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'}`}>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{option.name} {isMain && '(메인 사용중)'}</span>
                        <input type="checkbox" disabled={isMain} checked={isMain || activeSubWidgets.includes(option.id)} onChange={() => toggleSubWidget(option.id)} className="w-4 h-4 rounded bg-white dark:bg-black border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer" />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 shrink-0">
              <button onClick={() => setIsSettingsOpen(false)} className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-black py-3.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-lg shadow-gray-200 dark:shadow-white/10">설정 완료</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}