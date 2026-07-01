import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../src/hooks/finish-work-codex.mjs";

test("stop_hook_active면 통과(재귀가드)", () => {
  assert.equal(decide({ stop_hook_active: true, last_assistant_message: "이제 구현하겠습니다" }).block, false);
});
test("대기 신호(질문)면 통과", () => {
  assert.equal(decide({ last_assistant_message: "이대로 진행할까요?" }).block, false);
});
test("미래형 작업 약속만 있고 끝나면 차단", () => {
  const r = decide({ last_assistant_message: "이제 로그인 폼을 구현하겠습니다." });
  assert.equal(r.block, true);
  assert.match(r.reason, /지금/);
});
test("빈/일반 메시지는 통과(보수적)", () => {
  assert.equal(decide({ last_assistant_message: "완료했습니다." }).block, false);
});
// Claude판과 동일 로직 검증(듀얼 미러 표류 방지) — bare 알려·검토 제거 + 보고성 약속 차단.
test("검토·보고 약속만 하고 끝나면 차단(Fable 지적 사례)", () => {
  assert.equal(decide({ last_assistant_message: "이제 코드를 검토하겠습니다" }).block, true);
  assert.equal(decide({ last_assistant_message: "완료되면 알려드리겠습니다" }).block, true);
});
test("과거형·요약·요청은 통과(false-block 방지)", () => {
  assert.equal(decide({ last_assistant_message: "코드를 검토했습니다. 문제 없습니다." }).block, false);
  assert.equal(decide({ last_assistant_message: "확인해 주세요" }).block, false);
  assert.equal(decide({ last_assistant_message: "결과를 정리하면 다음과 같습니다." }).block, false);
});
