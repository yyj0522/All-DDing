import { SKILL_DATA, Profession } from '@/lib/skillData';

interface SkillTreeProps {
  profTab: Profession;
  levels: Record<string, number>;
  onLevelChange: (id: string, delta: number) => void;
}

export default function SkillTree({ profTab, levels, onLevelChange }: SkillTreeProps) {
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
    
    return (
      <div className={`inline-block w-40 md:w-44 bg-[#0a0a0a] border-2 rounded-2xl p-3 flex flex-col items-center gap-2 shadow-lg transition-all z-10 ${isUnlocked ? (lv > 0 ? 'border-amber-500 bg-amber-500/5' : 'border-gray-600') : 'border-gray-800 opacity-40'}`}>
        <div className={`mx-auto w-10 h-10 rounded-lg border flex items-center justify-center text-[10px] font-bold overflow-hidden ${isUnlocked ? 'bg-white/5 border-white/20 text-white' : 'bg-black border-gray-700 text-gray-600'}`}>
          <img 
            src={`/${folderName}/${id}_${lv > 0 ? 'on' : 'off'}.png`} 
            alt={skill.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="text-[11px] md:text-xs font-bold text-white text-center leading-tight h-8 flex items-center justify-center break-keep w-full px-1">{skill.name}</div>
        <div className="flex items-center gap-2 bg-black rounded-xl p-1.5 w-full justify-between border border-white/5 mt-1">
          <button onClick={() => onLevelChange(id, -1)} disabled={lv === 0} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-white/5 rounded-lg">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" /></svg>
          </button>
          <span className={`text-[10px] md:text-xs font-black tracking-widest ${lv > 0 ? 'text-amber-400' : 'text-gray-500'}`}>{lv}/{skill.max}</span>
          <button onClick={() => onLevelChange(id, 1)} disabled={!isUnlocked || lv === skill.max} className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-white disabled:opacity-30 bg-white/5 rounded-lg">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
      </div>
    );
  };

  if (profTab === '재배') {
    return (
      <div className="skill-tree min-w-max mx-auto transform scale-[0.8] md:scale-95 origin-top">
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
                    <ul><li><SkillBox id="f12" /><ul><li><SkillBox id="f13" /></li></ul></li></ul>
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
      <div className="skill-tree min-w-max mx-auto transform scale-[0.8] md:scale-95 origin-top">
        <ul>
          <li><SkillBox id="m1" />
            <ul>
              <li><SkillBox id="m2" />
                <ul><li><SkillBox id="m3" /><ul><li><SkillBox id="m4" /></li></ul></li></ul>
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
                    <div className="absolute bottom-0 left-1/2 w-[50%] h-[30px] border-b-2 border-l-2 border-[#3f3f46] rounded-bl-[12px] -ml-[1px] z-0"></div>
                  </li>
                  <li className="!pb-[30px] relative">
                    <SkillBox id="m13" />
                    <div className="absolute bottom-0 right-1/2 w-[50%] h-[30px] border-b-2 border-r-2 border-[#3f3f46] rounded-br-[12px] -mr-[1px] z-0"></div>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-[-2px]">
                  <div className="w-[2px] h-[20px] bg-[#3f3f46] z-0"></div>
                  <SkillBox id="m14" />
                  <div className="w-[2px] h-[25px] bg-[#3f3f46] z-0"></div>
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
      <div className="skill-tree min-w-max mx-auto transform scale-[0.8] md:scale-95 origin-top">
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
                    <ul><li><SkillBox id="o17" /><ul><li><SkillBox id="o18" /></li></ul></li></ul>
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
      <div className="skill-tree min-w-max mx-auto transform scale-[0.8] md:scale-95 origin-top">
        <ul>
          <li><SkillBox id="h1" />
            <ul>
              <li><SkillBox id="h2" />
                <ul className="!pb-0">
                  <li className="!pb-[30px] relative">
                    <SkillBox id="h3" />
                    <div className="absolute bottom-0 left-1/2 w-[50%] h-[30px] border-b-2 border-l-2 border-[#3f3f46] rounded-bl-[12px] -ml-[1px] z-0"></div>
                  </li>
                  <li className="!pb-[30px] relative">
                    <SkillBox id="h4" />
                    <div className="absolute bottom-0 right-1/2 w-[50%] h-[30px] border-b-2 border-r-2 border-[#3f3f46] rounded-br-[12px] -mr-[1px] z-0"></div>
                  </li>
                </ul>
                <div className="flex flex-col items-center mt-[-2px]">
                  <div className="w-[2px] h-[20px] bg-[#3f3f46] z-0"></div>
                  <SkillBox id="h5" />
                </div>
              </li>
              <li><SkillBox id="h6" />
                <ul><li><SkillBox id="h7" /><ul><li><SkillBox id="h8" /></li></ul></li></ul>
              </li>
              <li><SkillBox id="h9" />
                <ul><li><SkillBox id="h10" /><ul><li><SkillBox id="h11" /><ul><li><SkillBox id="h12" /></li></ul></li></ul></li></ul>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    );
  }

  return null;
}