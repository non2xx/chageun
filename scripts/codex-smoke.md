# Codex 스모크 테스트 절차

> Codex CLI 런타임이 생겼을 때 실행. 지금은 절차 문서만 준비됨.

---

## 1. 로컬 설치

```bash
# 레포 루트에서 실행
codex plugin marketplace add .
```

`/plugins`에서 `chageun`를 선택해 설치 → `/reload-plugins`.

확인: 설치 후 플러그인 목록에 `chageun`이 보이고 오류 없음.

---

## 2. SessionStart — 운영규칙 주입 확인

새 Codex 세션을 열고 다음을 확인합니다.

- [ ] `additionalContext`에 운영규칙이 주입되었는가 (작업카드·게이트 언급이 보이는가).
- [ ] 주입 내용이 `dist/codex/rules/operating-rules.md`의 내용과 일치하는가.
- [ ] 세션 시작 메시지에 활성 안내가 표시되는가.

---

## 3. Stop 게이트(finish-work-codex) 확인

미래형 약속만 하고 턴을 끝내는 상황을 만듭니다. 예:

> "다음 단계에서 파일을 수정하겠습니다."

확인:

- [ ] `finish-work-codex` 훅이 `{"decision": "block"}` 으로 응답하여 턴이 되돌아오는가.
- [ ] `stop_hook_active` 재귀 가드가 동작하여 무한 루프가 발생하지 않는가 (훅이 2회 이상 연속 호출되지 않는가).

---

## 4. 멈춤 규칙(위험 동작 앞 확인) 확인

운영 데이터 삭제·배포·비용 발생·민감 데이터 노출 같은 위험 동작을 요청합니다.

- [ ] sandbox/approval 단계에서 Codex가 멈추고 사용자 확인을 요청하는가.
- [ ] 확인 없이 위험 동작을 바로 실행하지 않는가.

---

## 5. 게이트 에이전트 동작 확인

### 5-a. 인라인 모드 (기본)

`multi_agent = false` 상태(또는 설정 없음)에서:

- [ ] 계획 검증 게이트가 인라인 컨텍스트 안에서 동작하는가.
- [ ] 게이트 판정 결과(`pass` / `block`)가 응답에 포함되는가.

### 5-b. 분리 에이전트 모드 (`multi_agent = true`)

`~/.codex/config.toml`에 `[features]\nmulti_agent = true` 추가 후:

- [ ] `spawn_agent`로 게이트 에이전트가 별도 컨텍스트에서 실행되는가.
- [ ] 분리 실행이 완료된 후 판정 결과를 메인 세션으로 되돌려 받는가.

---

## ⚠️ 6. Codex 마켓 경로 확정 (미검증 항목)

현재 마켓플레이스 매니페스트 경로: `.agents/plugins/marketplace.json`

이 경로가 Codex CLI에서 실제로 인식되는지 확인이 필요합니다.

- [ ] `.agents/plugins/marketplace.json`을 Codex가 인식하는가.
  - 인식되면: 현재 경로 유지, 이 항목에 ✅ 표시.
  - 인식 안 되면: 루트 `marketplace.json`으로 복제 또는 이동하고 재테스트.
- [ ] 최종 인식 경로를 이 문서와 `README.md`에 반영.

> 이 항목은 Codex CLI 실제 런타임 없이 검증 불가. 런타임 확보 후 가장 먼저 실행할 것.

---

## 결과 기록

| 항목 | 결과 | 비고 |
|------|------|------|
| 로컬 설치 | | |
| SessionStart 주입 | | |
| Stop 게이트 block | | |
| 재귀 가드 | | |
| 멈춤 규칙 | | |
| 인라인 게이트 | | |
| 분리 에이전트 게이트 | | |
| 마켓 경로 확정 | | |
