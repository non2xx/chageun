# 혼클로드 (honclwd)

**A Claude Code workflow plugin that helps non-developers build safely, on their own.**
비개발자가 **혼자서도 안전하게** 만들 수 있도록 돕는 Claude Code 워크플로우 플러그인입니다.

It replies in your language (Korean or English) — even if you can't read code, safety gates and plain-language explanations have your back.
코드를 직접 읽지 못해도, 안전장치와 쉬운 설명(사용자 언어에 맞춰 — 한국어/영어)이 옆에서 받쳐줍니다.

→ [English](#english) · [한국어](#한국어)

---

## English

### What it does

- **Task kickoff card** — agree on "what" and "how far" *before* building.
- **Verification gates** — adversarially review the plan and the code (plan-validator / pr-reviewer) to catch risks early.
- **Real run-through** — don't stop at reading code; actually launch the UI in an isolated test environment and click through it.
- **Plain-language summary** — explains technical results as "what I just did, and what could go wrong."
- **Stop rules** — asks first before hard-to-undo actions (deletes, deploys, external sends, cost, exposure).
- **Referencing** — finds and distills competitors / similar cases during planning.
- **Product map** — keeps a living feature list and screen structure (IA) up to date.
- **Design-system consistency** — checks whether new screens match existing design rules, and proposes registering new patterns.

> Language-adaptive: the workflow replies in the language you use (defaults to Korean). The source content is Korean, but Claude reads it and answers you in your language.

### Install

```
/plugin marketplace add JasonKwak93/honclwd
/plugin install honclwd
```

The workflow turns on automatically when a new session starts — no config files to edit. If you don't see an activation notice at session start, see Troubleshooting.

### What gets installed with it (important)

This plugin uses the **Superpowers** methodology skills (brainstorming, planning, debugging, …) from the `claude-plugins-official` marketplace.
- Superpowers is **auto-installed as a dependency** (you don't install it separately).
- Auto-install works reliably on **recent Claude Code (v2.1.143+ recommended)**.
- **Manual install if auto-install didn't happen (in this order):**
  ```
  /plugin marketplace add claude-plugins-official
  /plugin install superpowers
  ```
  Install from the **same source (`claude-plugins-official`)** as honclwd's dependency so versions/marketplaces don't diverge.

### Troubleshooting

- **No activation notice / gates & skills don't run:** the workflow didn't turn on. ① Confirm Superpowers is installed (manual install above). ② This plugin uses `node` — check `node -v`. ③ For already-open sessions, run `/reload-plugins` or open a new session.

---

## 한국어

### 무엇을 해주나요

- **작업 시작 카드** — 만들기 전에 "무엇을·어디까지" 합의하고 시작합니다.
- **검증 게이트** — 계획과 코드를 *적대적으로* 검수해(plan-validator / pr-reviewer) 위험을 미리 잡습니다.
- **실제 구동 검증** — 화면·앱을 코드로만 끝내지 않고, 격리된 테스트 환경에서 실제로 띄워보고 눌러봅니다.
- **쉬운 요약** — 기술 결과를 "지금 무엇을 했고, 잘못되면 어떤 일이 생기는지"로 풀어 설명합니다(사용자 언어로).
- **멈춤 규칙** — 되돌리기 어려운 일(삭제·배포·외부 전송·비용·노출) 앞에서는 먼저 확인을 받습니다.
- **레퍼런싱** — 기획 중 비슷한 사례·경쟁사를 찾아 정리합니다.
- **제품 지도** — 기능 목록과 화면 구조(IA)를 자동으로 정리·갱신합니다.
- **디자인 시스템 정합성** — 새 화면이 기존 디자인 규칙과 맞는지 보고, 새 패턴은 규칙으로 등록 제안합니다.

> 언어 적응형: 워크플로우는 사용자가 쓰는 언어로 응답합니다(기본 한국어). 소스는 한국어지만 Claude가 읽고 사용자 언어로 답합니다.

### 설치

```
/plugin marketplace add JasonKwak93/honclwd
/plugin install honclwd
```

설치하면 **새 세션이 시작될 때 워크플로우가 자동으로 켜집니다.** 따로 설정 파일을 편집할 필요가 없습니다. (세션 시작 시 활성 안내가 안 보이면 아래 "문제 해결"을 보세요.)

### 함께 설치되는 것 (중요)

이 플러그인은 `claude-plugins-official` 마켓플레이스의 **Superpowers** 방법론 스킬(아이디어 정리·계획·디버깅 등)을 사용합니다.
- Superpowers는 **의존성으로 자동 설치**됩니다(직접 따로 설치하지 않아도 됩니다).
- **Claude Code 최신 버전(권장 v2.1.143 이상)** 에서 자동 설치가 안정적으로 동작합니다.
- **자동 설치가 안 됐을 때 수동 설치(이 순서 그대로):**
  ```
  /plugin marketplace add claude-plugins-official
  /plugin install superpowers
  ```
  honclwd의 의존성과 **같은 출처(`claude-plugins-official`)**에서 설치해야 버전·마켓플레이스가 어긋나지 않습니다.

### 문제 해결

- **세션 시작 안내가 안 보인다 / 게이트·스킬이 안 돈다:** 워크플로우가 안 켜진 것입니다. ① Superpowers 설치 확인(위 수동 설치) ② 이 플러그인은 `node`를 쓰므로 `node -v`로 node 설치 확인 ③ 이미 열린 세션은 `/reload-plugins` 하거나 새 세션을 연다.

---

## 구성 / Components

- `rules/operating-rules.md` — 워크플로우 본체(세션 시작 시 자동 적용) / workflow core (auto-applied at session start)
- `skills/referencing/SKILL.md` — 기획 중 레퍼런스 조사 / reference research during planning
- `skills/product-map/SKILL.md` — 기능 명세·IA 구조 정리/갱신 / living feature spec & IA
- `skills/design-system/SKILL.md` — 디자인 규칙 검증·갱신 / design-rule checks & updates
- `agents/plan-validator.md` — 계획 검수 게이트 / plan review gate
- `agents/pr-reviewer.md` — 코드 검수 게이트 / code review gate
- `agents/code-implementer.md` — 단순·기계적 코드 구현 담당 / mechanical implementation worker

## 라이선스 / License

MIT
