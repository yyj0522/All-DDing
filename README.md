<div align="center">

# 올띵 (Alldding)
**마인크래프트 띵타이쿤 유저를 위한 종합 수익 최적화 및 편의성 웹 서비스**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

[🌐 웹사이트 바로가기](https://all-dding.pages.dev/)

</div>

## 프로젝트 소개 (Overview)
**올띵(Alldding)**은 마인크래프트 경제 서버 '띵타이쿤' 유저들이 겪는 복잡한 인게임 수익 계산 및 스태미나 분배의 어려움을 해결하기 위해 기획된 웹 애플리케이션입니다. 

기존에는 유저들이 직접 수기로 엑셀을 두드리며 연금술 레시피와 어패류 확률을 계산해야 했습니다. 올띵은 이러한 Pain Point를 파악하여, **실시간 탐욕(Greedy) 알고리즘**을 통해 현재 보유한 재고를 기반으로 최적의 수익 창출 경로를 1초 만에 제시합니다.

## 핵심 기능 (Key Features)
* **실시간 연금품 최적화 계산기:** 사용자의 창고 재고와 바닐라 아이템 시세를 입력받아, 가장 높은 순수익을 낼 수 있는 연쇄 가공 청사진(Blueprint)을 시각적인 Flow/Grid UI로 제공합니다.
* **스태미나 효율 추천 시스템:** 낚싯대 강화 수치, 전문가 스킬 레벨, 각인석 확률 등 인게임 확률 데이터를 바탕으로 남은 스태미나를 가장 효율적으로 소모할 수 있는 채집 경로를 추천합니다.
* **패치노트 & 자료실 (BaaS 연동):** Supabase를 활용하여 관리자가 실시간으로 업데이트 노트를 작성하고, 인게임 타이머 모드 등의 리소스 다운로드 기능을 제공합니다.
* **반응형 UI 및 다크/라이트 모드:** 모바일, 태블릿, PC 모든 환경에서 레이아웃 붕괴 없이 깔끔하게 동작하며, 사용자의 눈 피로도를 고려해 동적인 다크/라이트 모드 전환을 지원합니다.

## 기술 스택 및 도입 배경 (Tech Stack & Architecture)
* **프론트엔드 (Next.js 14, React, TypeScript)**
  * 복잡한 상태 관리와 즉각적인 피드백이 필요한 계산기 도구의 특성상 컴포넌트 단위의 상태 관리가 용이한 React를 채택했습니다. 
  * 검색 엔진 최적화(SEO)와 빠른 초기 로딩 속도(SSR/SSG)를 확보하기 위해 Next.js의 App Router 방식을 도입했습니다.
* **스타일링 (Tailwind CSS)**
  * 일관된 디자인 시스템 유지 및 다크/라이트 모드의 빠른 적용, 반응형 디자인(Breakpoints) 대응을 위해 유틸리티 우선의 Tailwind CSS를 사용했습니다.
* **백엔드/BaaS (Supabase)**
  * 프론트엔드 개발에 집중하면서도 안정적인 관계형 DB(PostgreSQL)를 활용하고, 파일 다운로드 로그 및 패치노트 데이터를 실시간으로 관리하기 위함입니다.
* **배포 (Cloudflare Pages)**
  * Next.js와의 완벽한 호환성 및 Edge 네트워크를 활용한 전역적인 빠른 정적 에셋 서빙을 위해 도입했습니다.

## 트러블 슈팅 및 UX 최적화 (Troubleshooting)

### 1. 거대 UI 실시간 렌더링 시 레이아웃 붕괴 및 프레임 드랍 해결
* **문제 상황:** 사용자가 재고 숫자를 수정할 때마다 최하위 재료부터 최종 연성품까지 수십 개의 청사진(Blueprint) UI가 실시간으로 재계산되며 렌더링 병목 및 화면 튕김(Scroll Jumping) 현상이 발생했습니다.
* **해결 방안:** 1. `<input>`의 타이핑 이벤트에 **Debouncing(디바운싱)** 기법을 적용하여 입력이 0.3초간 멈췄을 때만 상태를 업데이트하도록 제어했습니다.
  2. React 18의 **`useDeferredValue`**를 도입하여, 사용자의 숫자 입력(UI 업데이트)은 즉각적으로 반응하되 무거운 최적화 연산과 하단 뷰 렌더링은 백그라운드에서 한 박자 늦게(Deferred) 처리되도록 분리했습니다.
  3. CSS 전역 속성으로 `overflow-anchor: none`을 부여하여 브라우저의 강제 스크롤 개입을 차단, 부드러운 사용자 경험을 구현했습니다.

### 2. 시뮬레이터 알고리즘 간의 기준점 불일치 해결 및 가이드 동선 최적화
* **문제 상황:** '일일 수익' 페이지는 무한한 재료를 가정한 이론상 최대 총매출을 보여주는 반면, '스태미나 추천' 페이지는 실제 재고 기반 알고리즘을 타면서 바닐라 블록 매입 비용까지 차감하여 두 시뮬레이터 간 결과값에 60만 골드 이상의 괴리가 발생했습니다. 
* **해결 방안:** 1. 두 비즈니스 로직의 기준을 **'바닐라 재료 매입 비용이 차감된 최종 순수익(Net Profit)'**으로 일원화하여 유저 혼란을 방지했습니다. 
  2. 또한, 최종 조립만 수행하는 0성 연금품의 특성을 반영하여, 유저가 인게임에서 실제로 행동하는 동선과 동일하게 1~3성 하위 연성 트리에 0성 사전 제작 요구량을 자동으로 주입(Injection)하고 시각적인 뱃지로 안내하도록 시뮬레이터를 고도화했습니다.

## 설치 및 로컬 실행 방법 (Getting Started)

```powershell
# 1. 저장소 클론
git clone [https://github.com/yyj0522/alldding.git](https://github.com/yyj0522/alldding.git)

# 2. 프로젝트 폴더로 이동
cd alldding

# 3. 의존성 패키지 설치
npm install

# 4. 환경변수 설정
# 프로젝트 루트 경로에 .env.local 파일을 생성하고 아래 데이터를 입력합니다.
New-Item -Path . -Name ".env.local" -ItemType "file" -Value "NEXT_PUBLIC_SUPABASE_URL=`"your_supabase_url`"`nNEXT_PUBLIC_SUPABASE_ANON_KEY=`"your_supabase_key`""

# 5. 개발 서버 실행
npm run dev
