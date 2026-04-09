'use client';

import { useState, useMemo } from 'react';
import { getImagePath } from '@/lib/professionData';

interface RecipeProps {
  recipes: any[];
}

export default function RecipeTab({ recipes }: RecipeProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return recipes;
    
    const lowerTerm = searchTerm.toLowerCase();
    return recipes.filter(recipe => {
      const matchName = recipe.name.toLowerCase().includes(lowerTerm);
      const matchIngredient = recipe.ingredients.some((ing: string) => 
        ing.toLowerCase().includes(lowerTerm)
      );
      
      return matchName || matchIngredient;
    });
  }, [recipes, searchTerm]);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 animate-fade-in-up transition-colors duration-300">
      <div className="relative w-full max-w-xl mx-auto mb-2 md:mb-4">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <span className="text-gray-400 dark:text-gray-500 font-black text-sm transition-colors">검색</span>
        </div>
        <input 
          type="text" 
          placeholder="제작품 또는 재료 이름 입력..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-[#111113] border border-gray-300 dark:border-transparent text-gray-900 dark:text-white text-sm md:text-base font-black rounded-[1.25rem] pl-16 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm dark:shadow-none placeholder-gray-400 dark:placeholder-gray-600"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-3 my-auto h-fit px-3 py-1.5 bg-gray-100 dark:bg-black/50 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg font-black text-xs transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="w-full bg-gray-50 dark:bg-[#111113] border border-gray-300 dark:border-transparent rounded-[2rem] p-16 text-center flex flex-col items-center justify-center transition-colors shadow-sm dark:shadow-none">
          <span className="text-4xl mb-4 opacity-50">🔍</span>
          <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight transition-colors">검색 결과가 없습니다</h3>
          <p className="text-sm font-bold text-gray-500 transition-colors">다른 키워드로 다시 검색해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
          {filteredRecipes.map((recipe, idx) => {
            const mainImgPath = getImagePath(recipe.name);
            return (
              <div key={idx} className="bg-white dark:bg-[#0a0a0a] border border-gray-300 dark:border-transparent rounded-[2rem] p-5 md:p-6 hover:border-gray-400 dark:hover:border-white/10 transition-all duration-300 shadow-md hover:shadow-lg dark:shadow-2xl group flex flex-col h-full relative overflow-hidden">
                <div className="flex justify-between items-start mb-5 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 dark:bg-black/50 rounded-2xl border border-gray-200 dark:border-transparent flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform duration-300 p-2.5 shadow-inner dark:shadow-none">
                      {mainImgPath ? (
                        <img src={mainImgPath} alt={recipe.name} className="w-full h-full object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-black transition-colors">IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] md:text-[10px] font-black tracking-widest text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md uppercase transition-colors border border-gray-200 dark:border-transparent">
                          {recipe.type}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 dark:bg-transparent px-2 py-0.5 rounded-md border border-gray-200 dark:border-transparent transition-colors">
                          소요시간: {recipe.time}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight transition-colors">{recipe.name}</h3>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-[#111113] rounded-2xl p-4 md:p-5 border border-gray-200 dark:border-transparent h-full transition-colors flex flex-col shadow-inner dark:shadow-none relative z-10">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200 dark:border-white/5 transition-colors">
                    <p className="text-xs font-black text-gray-700 dark:text-gray-400 transition-colors">필요 재료</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-amber-700 dark:text-amber-500 bg-amber-100 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200 dark:border-transparent tracking-widest transition-colors">
                        제작 시설
                      </span>
                      <span className="text-[10px] font-black text-gray-800 dark:text-gray-300 transition-colors">{recipe.facility}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {recipe.ingredients.map((ing: string, i: number) => {
                      const ingImgPath = getImagePath(ing);
                      return (
                        <div key={i} className="bg-white dark:bg-black border border-gray-200 dark:border-transparent text-gray-800 dark:text-gray-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-2 transition-colors shadow-sm dark:shadow-none">
                          {ingImgPath ? (
                            <img src={ingImgPath} alt={ing} className="w-4 h-4 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                          ) : (
                            <span className="text-[9px] text-gray-400 font-bold">재료</span>
                          )}
                          {ing}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}