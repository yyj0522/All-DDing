'use client';

import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 flex flex-col relative overflow-x-hidden transition-colors duration-300">
      <Header />
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-6 pt-32 pb-20">
        <h1 className="text-3xl font-black mb-8 text-gray-900 dark:text-white transition-colors">개인정보 처리방침</h1>
        
        <div className="space-y-10 text-sm text-gray-700 dark:text-gray-300 leading-relaxed transition-colors">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">1. 개인정보의 수집 및 이용 목적</h2>
            <p>올띵(All-Dding)은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>서비스 이용 기록 분석: 유저의 방문 경로 및 서비스 이용 행태 분석을 통한 품질 개선</li>
              <li>사용자 의견 수렴: 오류 제보 및 건의사항에 대한 답변 제공(사용자 선택 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">2. 수집하는 개인정보 항목</h2>
            <p>올띵은 서비스 이용 과정에서 다음과 같은 정보들이 자동으로 생성되어 수집될 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>자동 수집 항목: 접속 로그, 쿠키(Cookie), 접속 IP 정보, 브라우저 정보, 기기 정보</li>
              <li>피드백 전송 시(선택): 이메일 주소 (답변 제공 목적)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">3. 개인정보 처리 업무의 위탁</h2>
            <p>올띵은 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 외부 전문업체에 위탁하여 운영하고 있습니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <p className="font-bold text-gray-900 dark:text-white mb-2 transition-colors">Google, Inc. (수탁자)</p>
                <ul className="space-y-1 text-xs">
                  <li>위탁 업무: Google Analytics 4를 이용한 이용 행태 분석</li>
                  <li>측정 ID: G-955JJZE49J</li>
                  <li>보유 기간: 14개월</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none transition-colors">
                <p className="font-bold text-gray-900 dark:text-white mb-2 transition-colors">Supabase, Inc. (수탁자)</p>
                <ul className="space-y-1 text-xs">
                  <li>위탁 업무: 피드백 시스템 데이터 보관 및 관리</li>
                  <li>항목: 의견 내용, 이메일 주소(선택)</li>
                  <li>보유 기간: 목적 달성 시 혹은 서비스 종료 시까지</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">4. 개인정보의 파기</h2>
            <p>원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">5. 이용자의 권리</h2>
            <p>이용자는 언제든지 본인의 개인정보 수집에 대한 동의를 철회할 수 있으며, 쿠키 설정을 통해 자동 수집을 거부할 권리가 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">6. 개인정보 보호책임자 및 연락처</h2>
            <p>올띵은 이용자의 개인정보를 보호하고 관련 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <div className="bg-fuchsia-50 dark:bg-fuchsia-500/5 p-4 rounded-xl border border-fuchsia-200 dark:border-fuchsia-500/20 mt-3 transition-colors">
              <ul className="space-y-1">
                <li>이름: Lucas (올띵 관리자)</li>
                <li>연락처: <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold transition-colors">projectc029@gmail.com</span></li>
                <li>문의 방법: 사이트 내 '의견 남기기' 기능 또는 이메일</li>
              </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}