'use client';

import Image from 'next/image';
import { SKILL_DATA, Profession } from '@/lib/skillData';

interface SkillTreeProps {
  profTab: Profession;
  levels: Record<string, number>;
  onLevelChange: (id: string, delta: number) => void;
}

export default function SkillTree({ profTab, levels, onLevelChange }: SkillTreeProps) {
  const STORAGE_BASE_URL = "https://cdn.jsdelivr.net/gh/yyj0522/alldding-assets@main";

  const SkillBox = ({ id }: { id: string }) => {
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
    if (id === 'f22') imageId = 'f15';
    if (id === 'f23') imageId = 'f4'; // 식은 커피 먹기지 -> 불 더 올려! 아이콘 공유
    if (id === 'm16') imageId = 'm5'; // 귀하신 몸값 -> 주괴 좀 사주괴 아이콘 공유
    if (id === 'o19') imageId = 'o18'; // 연금은 계속된다 -> 바다처럼 넓은 아이콘 공유

    return (
      <div className={`relative inline-flex flex-col items-center w-[100px] sm:w-[145px] border-2 rounded-[1.25rem] p-2 sm:p-2.5 gap-1.5 shadow-sm hover:shadow-md transition-all z-10 ${
        isUnlocked 
        ? (lv > 0 
            ? 'border-amber-400 dark:border-amber-500/50 bg-amber-50 dark:bg-[#1a140a] shadow-md' 
            : 'border-gray-300 dark:border-transparent bg-white dark:bg-[#111113]') 
        : 'border-gray-200 dark:border-transparent bg-gray-50 dark:bg-[#0a0a0a] opacity-70'
      }`}>
        <div className={`absolute -top-3 px-2.5 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black z-20 shadow-sm transition-colors ${
          lv > 0 
          ? 'bg-amber-500 text-white dark:bg-amber-500 dark:text-white' 
          : (isUnlocked ? 'bg-gray-700 text-white dark:bg-gray-600' : 'bg-gray-300 text-gray-500 dark:bg-gray-800 dark:text-gray-600')
        }`}>
          {lv} / {skill.max}
        </div>
        
        <div className={`relative w-9 h-9 sm:w-11 sm:h-11 mt-1 rounded-xl border flex items-center justify-center overflow-hidden transition-colors shadow-inner ${
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
        </div>
        
        <div className={`text-[9px] sm:text-[11px] font-black text-center leading-tight h-6 flex items-center justify-center break-keep w-full tracking-tight ${isUnlocked ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'}`}>
          {skill.name}
        </div>
        
        <div className="flex w-full gap-1.5 mt-0.5">
          <button 
            onClick={() => onLevelChange(id, -1)} 
            disabled={lv === 0} 
            className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg py-1 transition-all active:scale-95 shadow-sm disabled:shadow-none"
          >
            <span className="text-xs sm:text-sm font-black leading-none mb-[1px]">-</span>
          </button>
          <button 
            onClick={() => onLevelChange(id, 1)} 
            disabled={!isUnlocked || lv === skill.max} 
            className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg py-1 transition-all active:scale-95 shadow-sm disabled:shadow-none"
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
          <li><SkillBox id="f1" />
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
          <li><SkillBox id="m1" />
            <ul>
              <li><SkillBox id="m2" />
                <ul>
                  <li><SkillBox id="m3" />
                    <ul>
                      <li><SkillBox id="m4" />
                        <ul>
                          <li><SkillBox id="m16" /></li>
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
          <li><SkillBox id="o1" />
            <ul>
              <li><SkillBox id="o2" />
                <ul>
                  <li><SkillBox id="o3" />
                    <ul><li><SkillBox id="o4" /><ul><li><SkillBox id="o5" /><ul><li><SkillBox id="o6" /></li></ul></li></ul></li></ul>
                  </li>
                  <li><SkillBox id="o7" />
                    <ul><li><SkillBox id="o8" /><ul><li><SkillBox id="o9" /><ul><li><SkillBox id="o10" /></li></ul></li></ul></li></ul>
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
                              <li><SkillBox id="o19" /></li>
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
          <li><SkillBox id="h1" />
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