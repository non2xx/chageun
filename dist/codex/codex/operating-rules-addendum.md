# 차근 운영 규칙 — Codex 적응 보충

> 이 문서는 Codex 세션 시작 시 `operating-rules.md`에 **자동으로 덧붙여집니다.**
> 원본 운영 규칙의 모든 내용은 그대로 유효하며, 아래는 Codex 환경에서 다르게 읽어야 할 항목만 기술합니다.

## 모델 이름 변환

`operating-rules.md`에 등장하는 모델 이름을 Codex에서는 다음과 같이 읽습니다:

| 운영 규칙의 표기 | Codex에서의 의미 |
|---|---|
| **Opus** | 강한 모델 (reasoning effort: high) |
| **Sonnet** | 빠른 모델 (reasoning effort: 기본/낮음) |

## 도구 호출 변환

운영 규칙의 "Agent tool 호출" · "서브에이전트 띄우기"는 Codex에서 `spawn_agent`로 실행합니다.
`spawn_agent` 사용에는 **`[features] multi_agent=true`** 가 필요합니다.

상세 도구 매핑은 `codex/codex-tools.md`를 참조하세요.

## 실제 구동 검증 도구 (run/verify 대체)

운영 규칙의 "실제 구동 검증"은 Claude 전용 `run`·`verify` 스킬을 전제로 쓰지만, Codex엔 그 스킬이 없습니다. **없다고 이 단계를 건너뛰지 마세요** — 차근이 가장 자랑하는 단계입니다. Codex에서는 shell로 대체합니다:

- **띄우기(시각):** shell로 프로젝트 dev 서버를 기동(`npm run dev`·`npm start` 등, 백그라운드) → **Playwright**(있으면)로 화면을 열어 스크린샷·요소 확인. Playwright가 없으면 `curl`로 응답·상태코드라도 확인하고 "시각 확인 제한됨"을 명시.
- **눌러보기(동작):** Playwright로 대표+엣지 데이터(빈값·경계·아주 긴 값)로 버튼·저장·삭제를 실제 실행. 성공 기준을 시나리오로 항목별 통과/실패 판정.
- **테스트 환경·운영 쓰기 hard-block은 그대로:** 운영 데이터 쓰기 검증은 격리 환경 없으면 보류(운영에서 시도 금지). 이 규칙은 플랫폼 무관.
- Playwright·dev 서버 기동이 불가한 환경이면 "동작 검증 안 됨 — 미검증 출시 위험"으로 **보고만** 하고 얼버무리지 않습니다.

## 게이트 에이전트 실행

운영 규칙의 검증 게이트(plan-validator · pr-reviewer · code-implementer)는 Codex에서 다음 방식으로 실행합니다:

- **인라인 우선 (기본):** `[features] multi_agent=true` 없이도 동작. 메인 에이전트가 게이트 시점에 `codex/gate-agents.md`의 해당 에이전트 지시문을 **직접 따라** 검증을 수행합니다.
- **선택적 분리:** `multi_agent=true`가 활성화된 경우 `spawn_agent`로 독립 에이전트를 띄워 신선한 컨텍스트로 실행할 수 있습니다.

각 에이전트의 지시문 전문과 호출 방법은 `codex/gate-agents.md`를 참조하세요.

## Superpowers 스킬 (소프트 의존)

운영 규칙이 Superpowers 스킬(brainstorming · writing-plans · systematic-debugging 등)을 참조하는 경우:

- Superpowers가 **설치돼 있으면**: 그 스킬을 그대로 사용합니다.
- Superpowers가 **없으면**: 차근 운영 규칙의 지시문만으로 진행합니다. 스킬을 찾지 못한다고 워크플로를 중단하지 않습니다(자동 설치를 시도하지도 않습니다).

## instructions file

Codex에서 프로젝트 수준 지시 파일은 프로젝트 루트 `AGENTS.md`입니다.
운영 규칙이 `CLAUDE.md`를 언급하는 경우 `AGENTS.md`로 읽습니다.
