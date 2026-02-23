import { getImagePath } from '@/lib/professionData';

interface RecipeProps {
  recipes: any[];
}

export default function RecipeTab({ recipes }: RecipeProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {recipes.map((recipe, idx) => {
        const mainImgPath = getImagePath(recipe.name);
        return (
          <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 hover:border-stone-500/30 transition-colors shadow-xl group flex flex-col justify-between">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform p-2">
                  {mainImgPath ? (
                    <img src={mainImgPath} alt={recipe.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <span className="text-[10px] text-gray-600 font-bold">IMG</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black tracking-widest text-stone-400 bg-stone-500/10 px-2 py-0.5 rounded uppercase">{recipe.type}</span>
                    <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {recipe.time}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">{recipe.name}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-black/50 rounded-xl p-4 border border-white/5 h-full">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-gray-500">필요 재료</p>
                <p className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{recipe.facility}</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {recipe.ingredients.map((ing: string, i: number) => {
                  const ingImgPath = getImagePath(ing);
                  return (
                    <span key={i} className="bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      {ingImgPath ? (
                        <img src={ingImgPath} alt={ing} className="w-4 h-4 object-contain" style={{ imageRendering: 'pixelated' }} />
                      ) : (
                        <div className="w-3 h-3 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden"><span className="text-[6px] text-black">img</span></div>
                      )}
                      {ing}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}