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
    <div className="w-full flex flex-col gap-6 transition-colors duration-300">
      <div className="relative w-full max-w-xl mx-auto mb-2">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="제작품 또는 재료 이름으로 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-400 dark:focus:ring-indigo-500/50 transition-all shadow-sm dark:shadow-inner placeholder-gray-400 dark:placeholder-gray-600"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center transition-colors shadow-sm dark:shadow-none">
          <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg className="w-8 h-8 text-gray-500 dark:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors">검색 결과가 없습니다</h3>
          <p className="text-sm text-gray-500 transition-colors">다른 키워드로 다시 검색해 보세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {filteredRecipes.map((recipe, idx) => {
            const mainImgPath = getImagePath(recipe.name);
            return (
              <div key={idx} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:border-stone-300 dark:hover:border-stone-500/30 transition-colors shadow-sm hover:shadow-md dark:shadow-xl group flex flex-col justify-between">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-all p-2">
                      {mainImgPath ? (
                        <img src={mainImgPath} alt={recipe.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-gray-600 font-bold transition-colors">IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black tracking-widest text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-500/10 px-2 py-0.5 rounded uppercase transition-colors">{recipe.type}</span>
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 transition-colors">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {recipe.time}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight transition-colors">{recipe.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-black/50 rounded-xl p-4 border border-gray-200 dark:border-white/5 h-full transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-500 transition-colors">필요 재료</p>
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-500/20 transition-colors">{recipe.facility}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {recipe.ingredients.map((ing: string, i: number) => {
                      const ingImgPath = getImagePath(ing);
                      return (
                        <span key={i} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
                          {ingImgPath ? (
                            <img src={ingImgPath} alt={ing} className="w-4 h-4 object-contain drop-shadow-sm" style={{ imageRendering: 'pixelated' }} />
                          ) : (
                            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden transition-colors"><span className="text-[6px] text-gray-500 dark:text-black">img</span></div>
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
      )}
    </div>
  );
}