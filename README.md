<div align="center">

# All-DDing
**마인크래프트 띵타이쿤 팬메이드 헬퍼 사이트 (개인 사이드 프로젝트)**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

[웹사이트 바로가기](https://all-dding.pages.dev/) | [개발일지 바로가기](https://www.notion.so/317040d11fab801dbb7ec64a2de1fa7d?v=317040d11fab80c78913000c9ea11dd9&source=copy_link)

</div>

## 프로젝트 소개 (Overview)
지금까지 진행했던 프로젝트들은 실제 사용자들의 트래픽을 받고 피드백을 수용하며 성장할 수 없었던 '죽은 프로젝트'들이었습니다. 과거 노인 인지력 상승 프로그램 책자를 인터랙티브 웹으로 구현하며 동료와 교수님의 평가만 받았던 아쉬움을 넘어, **실제 타겟층의 평가와 피드백을 받는 서비스**를 만들고 싶었습니다.

개인 개발자가 홍보 없이 트래픽을 모으기란 쉽지 않았습니다. 그러던 중 동시 접속자 수 4천 명, 커뮤니티 가입자 2만 명이 넘는 마인크래프트 사설 경제 서버 '띵타이쿤'의 확실한 유저층에 주목했습니다. 

유저 커뮤니티를 분석한 결과, 방대한 게임 콘텐츠에 비해 공략글, 구글 시트 계산기, 웹 툴 등이 너무 파편화되어 있다는 Pain Point를 파악했습니다. 기존 툴들의 장단점을 흡수하고 차별점을 더해 통합 헬퍼 웹사이트인 **All-DDing**을 배포한 결과, **배포 5일 차 방문자 1,000명 달성 및 2주 차 베스트 공략글 선정(공식 디스코드 최상단 고정)**이라는 유의미한 트래픽과 실제 유저 피드백을 이끌어 낼 수 있었습니다.

## 핵심 기능 (Key Features)
* **전문가 페이지 (수익/스태미나 최적화):** 사용자의 창고 재고와 실시간 바닐라 아이템 시세를 바탕으로 최고 순수익을 낼 수 있는 연금품 조합(청사진 UI)을 도출하고, 스킬/각인 확률 데이터를 계산해 최적의 스태미나 소비 경로를 추천합니다.
* **요리 효율 계산기:** 개인 설정에 입력된 도구 강화 수치, 스킬 레벨, 재료 매입 단가를 기반으로 실시간 시세가 반영된 요리별 순수익과 가성비 효율을 제공합니다.
* **스펙업 가이드 (Benchmarking):** 신규 유저들의 확실한 이정표를 위해, 타 게임(메이플스토리) 스카우터 사이트의 스펙업 효율 순서 기능을 벤치마킹하여 장비/스킬 단계별 성장 가이드라인을 제공합니다.
* **확률형 아이템 시뮬레이터:** 인게임 내의 다양한 확률 강화, 뽑기 상자, 인챈트 확률을 실제 게임 로직과 동일하게 구현하여 리스크 없이 시뮬레이션해 볼 수 있는 테스트 환경을 제공합니다.
* **아일랜드 지도:** 메인 활동 무대인 아일랜드 맵의 지형과 주요 NPC/자원 위치가 마커로 표시된 직관적인 지도를 제공합니다.
* **패치노트 & 자료실 (BaaS 연동):** Supabase를 연동하여 관리자가 실시간으로 업데이트 내역을 등록하고, 인게임 타이머 모드(Mod) 등 편의성 리소스를 배포/다운로드할 수 있는 공간입니다.
* **Custom Auth & 개인설정:** 무거운 Oauth(소셜 로그인) 대신, 오직 사용자 맞춤형 뷰를 제공하기 위한 경량화된 회원가입/로그인 테이블을 자체 구현했습니다. 패스워드는 암호화되어 저장되며, 스태미나 및 단가 데이터 등은 Local Storage와 연동되어 로그인 없이도 빠르게 캐싱/반영됩니다.
* **반응형 UI & 다크 모드:** 모바일/태블릿/PC 환경에서 레이아웃 붕괴 없는 UI를 제공하며, 눈의 피로를 덜어주는 다크/라이트 테마 전환을 지원합니다.

## 기술 스택 및 도입 배경
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
* **해결 방안:** 1. `<input>`의 타이핑 이벤트에 디바운싱 기법을 적용하여 입력이 0.3초간 멈췄을 때만 상태를 업데이트하도록 제어했습니다.
  2. React 18의 useDeferredValue를 도입하여, 사용자의 숫자 입력(UI 업데이트)은 즉각적으로 반응하되 무거운 최적화 연산과 하단 뷰 렌더링은 백그라운드에서 한 박자 늦게(Deferred) 처리되도록 분리했습니다.
  3. CSS 전역 속성으로 `overflow-anchor: none`을 부여하여 브라우저의 강제 스크롤 개입을 차단, 부드러운 사용자 경험을 구현했습니다.

### 2. 시뮬레이터 알고리즘 간의 기준점 불일치 해결 및 가이드 동선 최적화
* **문제 상황:** '일일 수익' 페이지는 무한한 재료를 가정한 이론상 최대 총매출을 보여주는 반면, '스태미나 추천' 페이지는 실제 재고 기반 알고리즘을 타면서 바닐라 블록 매입 비용까지 차감하여 두 시뮬레이터 간 결과값에 60만 골드 이상의 괴리가 발생했습니다. 
* **해결 방안:** 1. 두 비즈니스 로직의 기준을 **'바닐라 재료 매입 비용이 차감된 최종 순수익(Net Profit)'**으로 일원화하여 유저 혼란을 방지했습니다. 
  2. 또한, 최종 조립만 수행하는 0성 연금품의 특성을 반영하여, 유저가 인게임에서 실제로 행동하는 동선과 동일하게 1~3성 하위 연성 트리에 0성 사전 제작 요구량을 자동으로 주입(Injection)하고 시각적인 뱃지로 안내하도록 시뮬레이터를 고도화했습니다.

### 3. 트래픽 폭주로 인한 배포 플랫폼 및 스토리지 한도 초과 장애 극복
* **문제 상황:** 배포 2주 차에 공식 커뮤니티 베스트 공략글로 선정되어 트래픽이 급증함에 따라, 기존에 호스팅 중이던 Vercel의 무료 대역폭 한도를 초과하여 사이트가 12시간 동안 다운되는 장애가 발생했습니다. 또한, 이미지 에셋을 처리하던 Supabase 스토리지 버킷의 월간 무료 한도마저 초과되어 화면에 최신 데이터와 이미지가 정상적으로 불러와지지 않는 문제가 연쇄적으로 발생했습니다.
* **해결 방안:** 1. **호스팅 이전:** 트래픽 초과로 인한 다운타임 방지 및 Edge 네트워크 기반의 안정적인 서빙을 위해 Vercel에서 Cloudflare Pages로 전체 배포 환경을 즉시 마이그레이션했습니다.
  2. **글로벌 CDN 연동:** Supabase 버킷에 집중되던 트래픽과 부하를 분산시키기 위해, 정적 이미지와 모드 다운로드 파일 등을 GitHub 리포지토리로 옮긴 뒤 **jsDelivr CDN**(`https://cdn.jsdelivr.net/gh/...`)을 연동하여 서빙하도록 아키텍처를 개편했습니다. 이를 통해 DB 비용 절감과 무제한 트래픽 대응이라는 두 가지 최적화를 동시에 달성했습니다.

## 🚀 설치 및 로컬 실행 방법 (Getting Started)

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
