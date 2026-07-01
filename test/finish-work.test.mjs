import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { shouldBlock } = require(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "hooks", "finish-work.js"));

// 막아야 하는 것 — 작업을 하겠다 약속만 하고 끝냄(도구 실행 없이).
test("약속만 하고 끝난 응답은 차단", () => {
  assert.equal(shouldBlock("이제 로그인 폼을 구현하겠습니다. 완료되면 알려드리겠습니다"), true);
  assert.equal(shouldBlock("이제 코드를 검토하겠습니다"), true, "검토 약속(Fable 지적 사례)");
  assert.equal(shouldBlock("완료되면 알려드리겠습니다"), true, "보고 약속만 남기고 끝");
  assert.equal(shouldBlock("바로 수정하겠습니다"), true);
  assert.equal(shouldBlock("Now I will implement the login form."), true);
  assert.equal(shouldBlock("Let me review the changes."), true);
});

// 통과해야 하는 것 — 정상적으로 묻거나, 이미 했거나, 마무리 보고.
test("질문·완료·정상 마무리는 통과(false-block 방지)", () => {
  assert.equal(shouldBlock("저장하시겠어요?"), false, "질문");
  assert.equal(shouldBlock("다르게 할까요?"), false, "선택 질문");
  assert.equal(shouldBlock("확인해 주세요"), false, "사용자에게 요청");
  assert.equal(shouldBlock("코드를 검토했습니다. 문제 없습니다."), false, "과거형(이미 함)");
  assert.equal(shouldBlock("테스트 3개 전부 통과했습니다."), false, "완료 보고");
  assert.equal(shouldBlock("결과를 정리하면 다음과 같습니다."), false, "요약 도입부");
  assert.equal(shouldBlock("다음과 같이 정리합니다: 파일 3개 수정."), false, "현재형 요약(보고성 동사 오차단 방지)");
  assert.equal(shouldBlock("이제 결과를 공유합니다."), false, "현재형 공유");
  assert.equal(shouldBlock("이제 변경 내용을 설명합니다."), false, "현재형 설명");
  assert.equal(shouldBlock("승인해 주시면 진행하겠습니다."), false, "승인 대기");
  assert.equal(shouldBlock(""), false, "빈 텍스트");
});
