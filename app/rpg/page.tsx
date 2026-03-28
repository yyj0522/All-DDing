'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';

export default function RpgPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <Header />
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center text-center">
        
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-3xl p-10 md:p-14 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-2xl w-full">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            RPG 관련 업데이트 예정
          </h1>
          
          <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full mb-8"></div>
          
          <div className="space-y-5 text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed break-keep">
            <p>
              현재 새롭게 업데이트된 RPG 콘텐츠의 세부 데이터를 파악하고 있습니다.
            </p>
            <p>
              올띵은 1인 개발 및 운영으로, 유저 여러분의 제보가 사이트 업데이트와 개발 방향 설정에 아주 큰 도움이 됩니다.
            </p>
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-5 mt-6">
              <p className="font-bold text-gray-800 dark:text-gray-200">
                추가되었으면 하는 필요한 기능, 직접 정리하신 정보가 있다면 화면 우측 하단의 <span className="text-indigo-600 dark:text-indigo-400 font-black">[의견 남기기]</span> 버튼을 통해 많이 제보해 주시기 바랍니다.
              </p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}