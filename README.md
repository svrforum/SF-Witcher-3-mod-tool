# W3 Mod Manager

위쳐 3: 와일드 헌트 모드를 쉽게 설치하고 관리할 수 있는 Windows 데스크톱 앱입니다.

**[최신 릴리즈 다운로드](https://github.com/svrforum/SF-Witcher-3-mod-tool/releases/latest)**

## 주요 기능

- **모드 설치/삭제** — .zip, .rar 파일을 드래그 없이 클릭 한번으로 설치
- **활성화/비활성화** — 모드를 삭제하지 않고 토글로 켜고 끌 수 있음
- **로드 순서 관리** — 드래그앤드롭으로 모드 로드 순서 변경
- **스크립트 병합** — 모드 간 스크립트 충돌을 자동으로 감지하고 3-way 병합
- **추천 모드 브라우저** — 커뮤니티 추천 모드를 카테고리별로 탐색, Nexus 다운로드 페이지로 바로 이동
- **프리셋 시스템** — 모드 구성을 프리셋으로 저장/공유, 기본 추천 프리셋 제공
- **게임 경로 자동 감지** — Steam, GOG, Epic Games 자동 인식
- **게임 버전 자동 감지** — Next-Gen / Classic 자동 구분
- **한국어/영어 지원**
- **자동 업데이트** — 새 버전 출시 시 자동 알림

## 설치 방법

### 인스톨러 (.exe)
1. [Releases](https://github.com/svrforum/SF-Witcher-3-mod-tool/releases/latest)에서 `W3-Mod-Manager-Setup-x.x.x.exe` 다운로드
2. 실행하여 설치
3. 시작 메뉴 또는 바탕화면 바로가기로 실행

### 포터블 (.zip)
1. [Releases](https://github.com/svrforum/SF-Witcher-3-mod-tool/releases/latest)에서 `W3-Mod-Manager-x.x.x-win.zip` 다운로드
2. 원하는 위치에 압축 해제
3. `W3 Mod Manager.exe` 실행

## 사용 방법

### 첫 실행
1. 언어 선택 (한국어/English)
2. 위쳐 3 설치 경로 자동 감지 (실패 시 수동 선택)

### 모드 설치
1. 좌측 "모드 관리" 메뉴 클릭
2. "모드 추가" 버튼 클릭
3. Nexus Mods에서 다운받은 .zip 또는 .rar 파일 선택
4. 자동으로 설치 완료

### 추천 모드 다운로드
1. 좌측 "모드 검색" 메뉴 클릭
2. 카테고리별 추천 모드 확인 (필수, 그래픽, 게임플레이, 편의성)
3. "Nexus에서 다운로드" 버튼으로 다운로드 페이지 이동
4. 다운받은 파일을 "모드 추가"로 설치

### 스크립트 병합
1. 좌측 "스크립트 병합" 메뉴 클릭
2. 충돌이 감지되면 "전체 병합" 클릭
3. 자동 병합 불가능한 경우 수동 해결

## 기술 스택

| 구성 요소 | 기술 |
|-----------|------|
| 프레임워크 | Electron + React + TypeScript |
| 빌드 | electron-vite |
| UI | Tailwind CSS v4 |
| 상태 관리 | Zustand |
| 다국어 | react-i18next |
| 압축 해제 | adm-zip, node-unrar-js |
| 스크립트 병합 | node-diff3 (3-way merge) |
| 배포 | electron-builder (NSIS + portable) |

## 프로젝트 구조

```
SF-Witcher-3-mod-tool/
├── src/
│   ├── main/                    # Electron 메인 프로세스
│   │   ├── index.ts             # 앱 진입점, 윈도우 생성
│   │   ├── ipc-handlers.ts      # IPC 핸들러 (모든 백엔드 API)
│   │   ├── modules/
│   │   │   ├── game-detector.ts # Steam/GOG/Epic 경로 감지
│   │   │   ├── mod-manager.ts   # 모드 설치/삭제/활성화/순서
│   │   │   ├── script-merger.ts # 스크립트 충돌 감지 + 3-way 병합
│   │   │   ├── bundle-parser.ts # W3 .bundle 파일 파서
│   │   │   ├── nexus-client.ts  # Nexus Mods API 클라이언트
│   │   │   ├── preset-manager.ts# 프리셋 CRUD + GitHub 자동 업데이트
│   │   │   ├── config-manager.ts# 앱 설정 저장/로드
│   │   │   ├── operation-queue.ts# 파일 작업 직렬 큐
│   │   │   └── logger.ts       # 구조화 로그 (일별 로테이션)
│   │   └── utils/
│   │       ├── archive.ts       # ZIP/RAR/7z 압축 해제
│   │       ├── registry.ts      # Windows 레지스트리 읽기
│   │       └── process-check.ts # witcher3.exe 실행 감지
│   ├── preload/                 # IPC 브릿지
│   └── renderer/src/            # React UI
│       ├── components/
│       │   ├── layout/          # Sidebar, TitleBar, Toast
│       │   ├── mods/            # ModList, ModCard (드래그앤드롭)
│       │   ├── merger/          # ConflictList, DiffView
│       │   ├── nexus/           # 추천 모드 브라우저
│       │   ├── presets/         # 프리셋 목록/편집기
│       │   ├── settings/        # 설정 페이지
│       │   └── setup/           # 첫 실행 설정 마법사
│       ├── stores/              # Zustand 스토어
│       ├── hooks/               # React 커스텀 훅
│       ├── i18n/                # 한국어/영어 번역
│       └── styles/              # Tailwind 테마 (위쳐 다크 테마)
├── resources/
│   ├── presets/                 # 기본 추천 프리셋 (GitHub에서 자동 업데이트)
│   └── icons/                  # 앱 아이콘
├── tests/                       # Vitest 테스트 (54개)
└── .github/workflows/           # CI/CD (Windows 빌드 + 자동 릴리즈)
```

## 개발 환경 설정

### 요구 사항
- Node.js 20+
- npm

### 시작하기

```bash
# 저장소 클론
git clone https://github.com/svrforum/SF-Witcher-3-mod-tool.git
cd SF-Witcher-3-mod-tool

# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 테스트 실행
npm test

# 프로덕션 빌드
npm run build

# Windows 배포판 생성 (Windows에서만)
npm run dist
```

## 기여하기

기여를 환영합니다! 아래 방법으로 참여할 수 있습니다.

### 버그 리포트
[Issues](https://github.com/svrforum/SF-Witcher-3-mod-tool/issues)에서 버그를 신고해주세요.
- 사용 중인 앱 버전
- 위쳐 3 버전 (Next-Gen / Classic)
- 게임 플랫폼 (Steam / GOG / Epic)
- 재현 방법
- 에러 메시지 (있다면)

### 추천 모드 추가/수정
`resources/presets/default-presets.json`을 수정하여 PR을 보내주세요. 이 파일은 앱에서 자동으로 GitHub에서 최신 버전을 가져옵니다.

각 모드 항목 형식:
```json
{
  "name": "모드 이름",
  "nexusUrl": "https://www.nexusmods.com/witcher3/mods/ID",
  "loadOrder": 0,
  "notes": "모드 설명 (한국어)",
  "needsMerge": false
}
```

### 번역 추가
`src/renderer/src/i18n/` 디렉토리에 새 언어 JSON 파일을 추가하고, `src/renderer/src/i18n/index.ts`에 등록하면 됩니다.

### 코드 기여

1. 이 저장소를 Fork
2. 기능 브랜치 생성: `git checkout -b feature/my-feature`
3. 변경 사항 커밋: `git commit -m "Add my feature"`
4. 브랜치 푸시: `git push origin feature/my-feature`
5. Pull Request 생성

#### 코드 스타일
- TypeScript strict 모드
- React 함수형 컴포넌트
- Zustand로 상태 관리
- IPC 핸들러는 항상 `{ success, data?, error? }` 형태 반환

#### 테스트
```bash
npm test           # 전체 테스트
npm run test:watch # 감시 모드
```

새 기능 추가 시 관련 테스트도 함께 작성해주세요.

## 라이선스

MIT License

## 면책 조항

이 프로젝트는 CD Projekt Red와 공식적인 관련이 없습니다. The Witcher는 CD Projekt Red의 등록 상표입니다. 이 도구는 커뮤니티에서 만든 비공식 모드 관리 도구입니다.
