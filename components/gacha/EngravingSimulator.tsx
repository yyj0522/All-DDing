'use client';

export default function EngravingSimulator() {
  return (
    <div className="w-full space-y-6 animate-fade-in relative text-gray-900 dark:text-gray-200 transition-colors duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-lg gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 transition-colors">각인석</h2>
        </div>
      </div>

      <div className="w-full relative">
        <div className="border border-gray-200 dark:border-white/10 rounded-2xl relative overflow-hidden h-[500px] flex flex-col items-center justify-center shadow-sm dark:shadow-inner w-full bg-gray-100 dark:bg-[#0c0c0c] transition-colors">
          <h3 className="text-2xl font-black text-gray-500 dark:text-gray-500 tracking-tight">
            업데이트 예정
          </h3>
        </div>
      </div>
      
    </div>
  );
}