// chageun pretooluse — PreToolUse 하드 차단 훅(Claude 전용).
// "말로 된 브레이크"를 기계 브레이크로: 되돌리기 불가능한 소수 고위험 패턴만 결정론적으로 막는다.
// 얇은 그물이지 만능 아님 — 확실히 파괴적인 경우만 차단(오탐 회피). 매치 시 exit 2 + stderr 사유.
// 예외·불확실은 안전 통과(exit 0). 외부 호출 없음. 개인/회사 정보 없음.
// NOTE: Codex 훅은 PreToolUse를 지원하지 않아 이 방어는 Claude에만 있다(Codex는 텍스트 멈춤규칙에 의존).

const { block, reasonFor } = require("./pretooluse-core.js");

let raw = "";
process.stdin.on("data", (d) => { raw += d; });
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(raw);
    const hit = block(input.tool_name, input.tool_input || {});
    if (hit) {
      process.stderr.write(reasonFor(hit));
      process.exit(2); // PreToolUse: exit 2 = 도구 호출 차단, stderr를 Claude에 전달
    }
  } catch (_) { /* 안전 통과 */ }
  process.exit(0);
});
