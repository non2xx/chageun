// chageun finish-work — Stop 훅.
// 에이전트가 "이제 ~하겠습니다"처럼 작업을 하겠다고 말만 하고 실제 도구 실행 없이 턴을 끝내면
// 되돌려 지금 하게 한다(보수적: 통과 넓게 / 차단 좁게). 결정론적, 외부 호출 없음, 실패 시 안전 통과.
// 개인/회사 정보 없음. shouldBlock는 finish-work-codex.mjs와 동일 로직(듀얼 미러 — 함께 갱신).

// 사용자 대기/질문 신호가 있으면 통과(chageun가 정상적으로 묻고 멈추는 경우).
// bare "알려"·"검토"는 제외 — 약속 문장("검토하겠습니다")까지 통과시켜 브레이크를 무력화했음.
// 의문형("검토할까요?"·"알려주세요")은 [?]·할까요·주세요가 여전히 잡는다.
const WAIT_RE = /[?]|할까요|갈까요|드릴까요|주세요|골라|선택|진행해도|어느|확인해|괜찮(을까|나요)|승인|합의|기다리|다음\s*단계|진행\s*보고|멈춤|shall i|would you|do you want|let me know|which option|approve|confirm|waiting for/i;
// 명백한 미래형 작업 약속만 차단. 작업 동사는 현재형(합니다)도 약속으로 보지만,
// 보고성 동사(검토·보고·알려·공유·설명·정리)는 미래형(하겠/할게)에서만 잡는다 —
// "다음과 같이 정리합니다"처럼 지금 실제로 요약하는 현재형 마무리를 오차단하지 않도록.
const PROMISE_RE = /(이제|곧|다음(엔|은)?|바로)\s*[^.!?\n]{0,40}(?:(구현|만들|작성|수정|실행|추가|저장|시작|진행)(하겠|할게|할께|하겠습니다|할게요|합니다)|(검토|보고|알려|공유|설명|정리)(하겠|할게|할께|하겠습니다|할게요))|(완료|끝나|이후|나중)[^.!?\n]{0,20}(알려|보고|공유|검토)[^.!?\n]{0,10}(드리|하)(겠|ㄹ게)|\b(I'?ll|I will|let me|now I|next,? I)\b[^.!?\n]{0,60}\b(implement|create|write|add|run|fix|save|build|start|proceed|review|report|share|explain|summarize)\b/i;

// 끝 400자만 검사. 대기 신호가 있으면 통과, 없고 약속만 있으면 차단.
function shouldBlock(text) {
  const tail = (text || "").trim().slice(-400);
  if (!tail) return false;
  if (WAIT_RE.test(tail)) return false;
  return PROMISE_RE.test(tail);
}

const REASON = "직전 응답이 작업을 하겠다고 말만 하고 실제로 하지 않은 채 끝났습니다. 지금 그 작업을 도구로 수행하세요. 작업이 끝났거나 사용자만 줄 수 있는 입력이 필요할 때만 턴을 끝내세요.";

function roleOf(o) { return o.type || (o.message && o.message.role) || ""; }
function msgOf(o) { return o.message || o; }
function textOf(m) {
  const c = m && m.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.filter((b) => b && b.type === "text").map((b) => b.text || "").join("\n");
  return "";
}
function endedWithTool(m) {
  if (!m) return false;
  if (m.stop_reason === "tool_use") return true;
  const c = m.content;
  if (Array.isArray(c) && c.length) {
    const last = c[c.length - 1];
    if (last && last.type === "tool_use") return true;
  }
  return false;
}

function run() {
  let raw = "";
  process.stdin.on("data", (d) => { raw += d; });
  process.stdin.on("end", () => {
    try {
      const input = JSON.parse(raw);
      if (input.stop_hook_active === true) return process.exit(0);
      const tpath = input.transcript_path;
      if (!tpath) return process.exit(0);
      const fs = require("fs");
      if (!fs.existsSync(tpath)) return process.exit(0);

      const objs = [];
      for (const ln of fs.readFileSync(tpath, "utf8").split("\n")) {
        const s = ln.trim();
        if (!s) continue;
        try { objs.push(JSON.parse(s)); } catch (_) { /* skip */ }
      }
      let lastIdx = -1;
      for (let i = objs.length - 1; i >= 0; i--) {
        if (roleOf(objs[i]) === "assistant") { lastIdx = i; break; }
      }
      if (lastIdx === -1) return process.exit(0);
      if (endedWithTool(msgOf(objs[lastIdx]))) return process.exit(0);

      const texts = [];
      for (let i = lastIdx; i >= 0; i--) {
        if (roleOf(objs[i]) !== "assistant") break;
        const t = textOf(msgOf(objs[i]));
        if (t) texts.unshift(t);
      }
      const text = texts.join("\n").trim();
      if (!text) return process.exit(0);

      if (!shouldBlock(text)) return process.exit(0);
      process.stdout.write(JSON.stringify({ decision: "block", reason: REASON }));
      process.exit(0);
    } catch (_) {
      process.exit(0); // 어떤 예외든 안전 통과(chageun를 막지 않는다).
    }
  });
}

module.exports = { shouldBlock, WAIT_RE, PROMISE_RE };
if (require.main === module) run();
