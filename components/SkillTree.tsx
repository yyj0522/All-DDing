'use client';

import Image from 'next/image';
import { SKILL_DATA, Profession } from '@/lib/skillData';

interface SkillTreeProps {
  profTab: Profession;
  levels: Record<string, number>;
  onLevelChange: (id: string, delta: number) => void;
  selectedSkill?: string | null;
  onSelectSkill?: (id: string | null) => void;
}

export default function SkillTree({ profTab, levels, onLevelChange, selectedSkill, onSelectSkill }: SkillTreeProps) {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  const getBaseDesc = (effect: string) => {
    if (effect.includes('경험치')) return '관련 활동 시 획득하는 경험치량이 증가합니다.';
    if (effect.includes('판매가')) return '생산품 및 전리품의 판매 가격이 영구적으로 증가합니다.';
    if (effect.includes('시간') || effect.includes('초')) return '작업 및 가공에 소요되는 시간이 단축됩니다.';
    if (effect.includes('확률') || effect.includes('특수')) return '특수 아이템 획득 및 이벤트 발생 확률이 증가합니다.';
    if (effect.includes('슬롯')) return '작업 대기 및 보관에 필요한 슬롯 개수가 확장됩니다.';
    if (effect.includes('콤보')) return '연속 작업 시 발동하는 콤보 효과가 강화됩니다.';
    if (effect.includes('해금')) return '새로운 기능이나 NPC가 잠금 해제됩니다.';
    if (effect.includes('범위')) return '한 번에 작업이 적용되는 타일 범위가 확장됩니다.';
    if (effect.includes('추가') || effect.includes('드롭')) return '채집 시 추가 아이템 획득량이 증가합니다.';
    return '해당 스킬의 고유 능력이 강화됩니다.';
  };

  const SkillBox = ({ id, isRoot = false }: { id: string, isRoot?: boolean }) => {
    const skill = SKILL_DATA[profTab]?.[id];
    if(!skill) return null;
    const lv = levels[id] || 0;
    
    let isUnlocked = false;
    if (skill.req && skill.req2) {
      isUnlocked = (levels[skill.req] || 0) > 0 || (levels[skill.req2] || 0) > 0;
    } else if (skill.req) {
      isUnlocked = (levels[skill.req] || 0) > 0;
    } else {
      isUnlocked = true;
    }

    const folderName = 
      profTab === '재배' ? 'farm_skill' : 
      profTab === '채광' ? 'mine_skill' : 
      profTab === '해양' ? 'ocean_skill' : 
      'hunt_skill';

    let imageId = id;
    if (id === 'h14') imageId = 'h6';
    if (id === 'h15') imageId = 'h14';
    if (id === 'h16') imageId = 'h15';
    if (id === 'm16') imageId = 'm5'; 
    if (id === 'm17') imageId = 'm17'; 
    if (id === 'o19') imageId = 'o18'; 

    const isSelected = selectedSkill === id;
    const currentEffect = lv > 0 ? skill.costs[lv - 1].effect : "효과 없음";

    return (
      <div 
        onClick={() => {
          if (lv > 0) {
            onSelectSkill?.(isSelected ? null : id);
          }
        }}
        className={`relative inline-flex flex-col items-center w-[100px] sm:w-[145px] border-2 rounded-[1.25rem] p-2 sm:p-2.5 gap-1.5 shadow-sm transition-all z-10 hover:z-50 ${lv > 0 ? 'cursor-pointer hover:shadow-md' : 'cursor-default'} ${
        isUnlocked 
        ? (lv > 0 
          ? (isSelected ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 shadow-md ring-2 ring-rose-200 dark:ring-rose-900/50' : 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-[#1a140a]') 
          : (isSelected ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-950/10 ring-2 ring-rose-200 dark:ring-rose-900/30' : 'border-gray-300 dark:border-transparent bg-white dark:bg-[#111113]')) 
        : 'border-gray-200 dark:border-transparent bg-gray-50 dark:bg-[#0a0a0a]' 
      }`}>
        <div className={`absolute -top-3 px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black z-20 shadow-sm transition-colors ${
          lv > 0 
          ? (isSelected ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white dark:bg-amber-500') 
          : (isUnlocked ? 'bg-gray-700 text-white dark:bg-gray-600' : 'bg-gray-300 text-gray-500 dark:bg-gray-800 dark:text-gray-600')
        }`}>
          {lv} / {skill.max}
        </div>
        
        <div className={`relative w-9 h-9 sm:w-11 sm:h-11 mt-1 rounded-xl border flex items-center justify-center overflow-visible transition-colors shadow-inner group cursor-help ${
          isUnlocked ? 'bg-gray-100 dark:bg-black/50 border-transparent' : 'bg-gray-200 dark:bg-black/80 border-transparent'
        }`}>
          <Image 
            src={`${STORAGE_BASE_URL}/${folderName}/${imageId}_on.png`} 
            alt={skill.name}
            fill
            unoptimized={true}
            loading="eager"
            priority={true}
            className={`object-contain p-1.5 transition-all duration-300 ${lv > 0 ? 'grayscale-0 opacity-100 drop-shadow-sm' : 'grayscale opacity-60 dark:opacity-40 blur-[0.3px]'}`}
            style={{ imageRendering: 'pixelated' }}
          />

          <div className={`absolute ${isRoot ? 'top-full mt-3' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-max min-w-[220px] max-w-[320px] px-4 bg-gray-900 border border-gray-700 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-[9999] scale-95 group-hover:scale-100 ${isRoot ? 'origin-top' : 'origin-bottom'} flex flex-col gap-2 items-center text-center`}>
            <p className="text-[11px] font-bold text-gray-300 leading-relaxed break-keep w-full">{getBaseDesc(skill.costs[0].effect)}</p>
            <div className="w-full h-[1px] bg-gray-700"></div>
            <div className="w-full">
              <p className="text-[10px] text-gray-500 font-bold mb-0.5">현재 {lv}레벨 효과</p>
              <p className="text-[12px] font-black text-amber-400 break-keep whitespace-normal">{currentEffect}</p>
            </div>
            <div className={`absolute ${isRoot ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'} left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 border-gray-700 rotate-45`}></div>
          </div>
        </div>
        
        <div className={`text-[9px] sm:text-[11px] font-black text-center leading-tight h-6 flex items-center justify-center break-keep w-full tracking-tight ${isUnlocked ? (isSelected ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-gray-200') : 'text-gray-400 dark:text-gray-600'}`}>
          {skill.name}
        </div>
        
        <div className="flex w-full gap-1.5 mt-0.5">
          <button 
            onClick={(e) => { e.stopPropagation(); onLevelChange(id, -1); }} 
            disabled={lv === 0} 
            className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg py-1 transition-all active:scale-95 shadow-sm disabled:shadow-none cursor-pointer"
          >
            <span className="text-xs sm:text-sm font-black leading-none mb-[1px]">-</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onLevelChange(id, 1); }} 
            disabled={!isUnlocked || lv === skill.max} 
            className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg py-1 transition-all active:scale-95 shadow-sm disabled:shadow-none cursor-pointer"
          >
            <span className="text-xs sm:text-sm font-black leading-none mb-[1px]">+</span>
          </button>
        </div>
      </div>
    );
  };

  if (profTab === '재배') {
    return (
      <div className="skill-tree flex justify-center min-w-max mx-auto transform scale-[0.85] md:scale-100 origin-top [&_li]:!px-[1px] sm:[&_li]:!px-[2px] [&_li]:!mx-0 transition-colors duration-300">
        <ul>
          <li><SkillBox id="f1" isRoot={true} />
            <ul>
              <li><SkillBox id="f2" />
                <ul>
                  <li><SkillBox id="f8" />
                    <ul><li><SkillBox id="f9" /><ul><li><SkillBox id="f10" /></li></ul></li></ul>
                  </li>
                  <li><SkillBox id="f4" />
                    <ul><li><SkillBox id="f5" /><ul><li><SkillBox id="f6" /><ul><li><SkillBox id="f7" /></li></ul></li></ul></li></ul>
                  </li>
                </ul>
              </li>
              <li><SkillBox id="f3" />
                <ul>
                  <li><SkillBox id="f11" />
                    <ul>
                      <li><SkillBox id="f12" />
                        <ul>
                          <li><SkillBox id="f13" />
                            <ul>
                              <li><SkillBox id="f18" />
                                <ul>
                                  <li><SkillBox id="f20" />
                                    <ul>
                                      <li><SkillBox id="f19" />
                                        <ul>
                                          <li><SkillBox id="f23" /></li>
                                        </ul>
                                      </li>
                                      <li><SkillBox id="f21" /></li>
                                    </ul>
                                  </li>
                                </ul>
                              </li>
                              <li><SkillBox id="f22" /></li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li><SkillBox id="f14" />
                    <ul><li><SkillBox id="f15" /><ul><li><SkillBox id="f16" /><ul><li><SkillBox id="f17" /></li></ul></li></ul></li></ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  if (profTab === '채광') {
    return (
      <div className="skill-tree flex justify-center min-w-max mx-auto transform scale-[0.85] md:scale-100 origin-top [&_li]:!px-[1px] sm:[&_li]:!px-[2px] [&_li]:!mx-0 transition-colors duration-300">
        <ul>
          <li><SkillBox id="m1" isRoot={true} />
            <ul>
              <li><SkillBox id="m2" />
                <ul>
                  <li><SkillBox id="m3" />
                    <ul>
                      <li><SkillBox id="m4" />
                        <ul>
                          <li><SkillBox id="m16" />
                            <ul>
                              <li><SkillBox id="m17" /></li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li><SkillBox id="m5" />
                <ul>
                  <li><SkillBox id="m6" />
                    <ul>
                      <li><SkillBox id="m7" /><ul><li><SkillBox id="m9" /></li></ul></li>
                      <li><SkillBox id="m8" /><ul><li><SkillBox id="m10" /></li></ul></li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li><SkillBox id="m11" />
                <ul className="!pb-0">
                  <li className="!pb-[30px] relative">
                    <SkillBox id="m12" />
                    <div className="absolute bottom-0 left-1/2 w-[50%] h-[30px] border-b-2 border-l-2 border-gray-400 dark:border-[#3f3f46] rounded-bl-[12px] -ml-[1px] z-0 transition-colors"></div>
                  </li>
                  <li className="!pb-[30px] relative">
                    <SkillBox id="m13" />
                    <div className="absolute bottom-0 right-1/2 w-[50%] h-[30px] border-b-2 border-r-2 border-gray-400 dark:border-[#3f3f46] rounded-br-[12px] -mr-[1px] z-0 transition-colors"></div>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-[-2px]">
                  <div className="w-[2px] h-[20px] bg-gray-400 dark:bg-[#3f3f46] z-0 transition-colors"></div>
                  <SkillBox id="m14" />
                  <div className="w-[2px] h-[25px] bg-gray-400 dark:bg-[#3f3f46] z-0 transition-colors"></div>
                  <SkillBox id="m15" />
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  if (profTab === '해양') {
    return (
      <div className="skill-tree flex justify-center min-w-max mx-auto transform scale-[0.85] md:scale-100 origin-top [&_li]:!px-[1px] sm:[&_li]:!px-[2px] [&_li]:!mx-0 transition-colors duration-300">
        <ul>
          <li><SkillBox id="o1" isRoot={true} />
            <ul>
              <li><SkillBox id="o2" />
                <ul>
                  <li><SkillBox id="o3" />
                    <ul><li><SkillBox id="o4" /><ul><li><SkillBox id="o5" /><ul><li><SkillBox id="o6" /></li></ul></li></ul></li></ul>
                  </li>
                  <li><SkillBox id="o7" />
                    <ul><li><SkillBox id="o8" /><ul><li><SkillBox id="o9" /><ul><li><SkillBox id="o10" /><ul><li><SkillBox id="o20" /></li></ul></li></ul></li></ul></li></ul>
                  </li>
                </ul>
              </li>
              <li><SkillBox id="o11" />
                <ul>
                  <li><SkillBox id="o12" />
                    <ul><li><SkillBox id="o13" /><ul><li><SkillBox id="o14" /><ul><li><SkillBox id="o15" /></li></ul></li></ul></li></ul>
                  </li>
                  <li><SkillBox id="o16" />
                    <ul>
                      <li><SkillBox id="o17" />
                        <ul>
                          <li><SkillBox id="o18" />
                            <ul>
                              <li><SkillBox id="o19" />
                                <ul>
                                  <li><SkillBox id="o21" /></li>
                                  <li><SkillBox id="o22" /></li>
                                </ul>
                              </li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  if (profTab === '사냥') {
    return (
      <div className="skill-tree flex justify-center min-w-max mx-auto transform scale-[0.85] md:scale-100 origin-top [&_li]:!px-[1px] sm:[&_li]:!px-[2px] [&_li]:!mx-0 transition-colors duration-300">
        <ul>
          <li><SkillBox id="h1" isRoot={true} />
            <ul>
              <li><SkillBox id="h2" />
                <ul className="!pb-0">
                  <li className="!pb-[30px] relative">
                    <SkillBox id="h3" />
                    <div className="absolute bottom-0 left-1/2 w-[50%] h-[30px] border-b-2 border-l-2 border-gray-400 dark:border-[#3f3f46] rounded-bl-[12px] -ml-[1px] z-0 transition-colors"></div>
                  </li>
                  <li className="!pb-[30px] relative">
                    <SkillBox id="h4" />
                    <div className="absolute bottom-0 right-1/2 w-[50%] h-[30px] border-b-2 border-r-2 border-gray-400 dark:border-[#3f3f46] rounded-br-[12px] -mr-[1px] z-0 transition-colors"></div>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-[-2px]">
                  <div className="w-[2px] h-[20px] bg-gray-400 dark:bg-[#3f3f46] z-0 transition-colors"></div>
                  <SkillBox id="h5" />
                  <div className="w-[2px] h-[25px] bg-gray-400 dark:bg-[#3f3f46] z-0 transition-colors"></div>
                  <SkillBox id="h13" />
                </div>
              </li>
              <li><SkillBox id="h6" />
                <ul>
                  <li><SkillBox id="h7" />
                    <ul>
                      <li><SkillBox id="h8" />
                        <ul className="!pb-0">
                          <li>
                            <SkillBox id="h14" />
                          </li>
                          <li>
                            <SkillBox id="h15" />
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              <li><SkillBox id="h9" />
                <ul>
                  <li><SkillBox id="h10" />
                    <ul>
                      <li><SkillBox id="h11" />
                        <ul>
                          <li><SkillBox id="h12" />
                            <ul><li><SkillBox id="h16" /></li></ul>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  return null;
}