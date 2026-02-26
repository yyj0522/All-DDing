import { INGREDIENTS, ITEM_IMAGES } from '@/lib/skillData';

interface Props {
  prices: Record<string, number>;
  handlePriceChange: (item: string, value: string) => void;
  saveAll: () => void;
}

const SEEDS = ["토마토 씨앗", "양파 씨앗", "마늘 씨앗"];
const VARIABLE_ITEMS = ["정제된 광석", "단단한 주괴", "스태미나 드링크 I", "맹수의 발톱"];

export default function PriceSheetTab({ prices, handlePriceChange, saveAll }: Props) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in-up max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">개인 커스텀 재료 단가 시트</h2>
          <div className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-4 py-3 rounded-xl text-sm font-bold w-fit flex flex-col gap-1">
            <span>입력하시는 모든 재료의 가격은 <span className="text-white text-base">1세트(64개)</span> 기준 가격으로 입력해주세요.</span>
            <span className="text-amber-500/70 text-xs">※ 씨앗 및 단일 변동 아이템은 1세트(또는 1개) 가격 그대로 입력합니다.</span>
          </div>
        </div>
        <button onClick={saveAll} className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-black px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] whitespace-nowrap h-fit hover:scale-[1.02]">
          전체 설정 저장하기
        </button>
      </div>
      
      <div className="flex flex-col gap-12">
        {Object.entries(INGREDIENTS).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-black tracking-widest text-gray-500 mb-4 border-l-2 border-indigo-500 pl-3 uppercase">
              {category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item, idx) => {
                const isSingleItem = SEEDS.includes(item) || VARIABLE_ITEMS.includes(item);
                
                let displayPrice = '';
                if (prices[item] !== undefined && prices[item] !== null) {
                  displayPrice = prices[item].toString();
                }

                return (
                  <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/20 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <img 
                          src={`/ingredients/${ITEM_IMAGES[item] || 'default'}.png`} 
                          alt={item}
                          className="w-6 h-6 object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                      <label className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors truncate w-[70px] flex flex-col" title={item}>
                        <span>{item}</span>
                        <span className="text-[10px] text-gray-600 font-normal mt-0.5">
                          {isSingleItem ? '(1세트/1개)' : '(1세트)'}
                        </span>
                      </label>
                    </div>
                    <div className="relative w-24 flex-shrink-0">
                      <input 
                        type="number" 
                        placeholder="0"
                        value={displayPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            handlePriceChange(item, '');
                            return;
                          }
                          handlePriceChange(item, val);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-2 pr-6 text-white text-right text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-600">G</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}