// chageun pretooluse 코어 — 순수 판정 로직(테스트 대상). 고위험·되돌리기불가 소수 패턴만.
"use strict";

// git push --force / -f 차단(단 --force-with-lease는 허용 — 안전한 강제 push).
const FORCE_PUSH = /\bgit\s+push\b[^\n]*?(--force(?!-with-lease)\b|(?:^|\s)-[a-zA-Z]*f\b)/;
// rm 재귀+강제(-rf·-fr·-r -f·--recursive --force)가 루트/홈/현재트리 등 위험 타깃을 지울 때.
const RM_RECURSIVE = /\brm\s+(?:-[a-zA-Z]*\b\s*){0,3}(?:-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*|-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*|--recursive|--force)\b/;
const RM_DANGER_TARGET = /(?:\s|^)(?:\/(?:\s|$|\*)|~\/?\s*$|~\/\s*\*|\$HOME\b|\/\*|\.\s*$|\*\s*$)/;

// 파괴적 SQL(스키마·대량삭제). DELETE는 WHERE 없을 때만.
const SQL_DESTRUCTIVE = /\b(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE\s+(TABLE\s+)?\w)/i;

// 파괴적 SQL 판정: 주석 제거 후 세미콜론으로 문장 분리해 각 문장을 개별 검사
// (뒤 문장의 무관한 WHERE로 앞의 전체삭제가 통과하던 우회·주석 오탐 방지).
function destructiveSql(text) {
  const noComments = String(text || "").replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  for (const stmt of noComments.split(";")) {
    if (SQL_DESTRUCTIVE.test(stmt)) return "sql-destructive";
    if (/\bDELETE\s+FROM\b/i.test(stmt) && !/\bWHERE\b/i.test(stmt)) return "sql-delete-no-where";
  }
  return null;
}

const REASONS = {
  "force-push": "차단: `git push --force`는 남의 커밋을 덮어써 되돌리기 어렵습니다. 필요하면 `--force-with-lease`를 쓰세요(안전 강제 push).",
  "rm-recursive": "차단: 루트/홈/현재 트리 전체를 지우는 `rm -rf`는 되돌릴 수 없습니다. 지울 대상 경로를 구체적으로 좁히세요.",
  "sql-destructive": "차단: DROP/TRUNCATE 같은 파괴적 스키마 명령입니다. 운영 데이터라면 되돌릴 수 없으니, 테스트 환경인지·백업이 있는지 먼저 확인하세요.",
  "sql-delete-no-where": "차단: WHERE 없는 DELETE는 테이블 전체를 지웁니다. 조건(WHERE)을 넣거나 대상을 확인하세요.",
};

// 어떤 도구·입력이 위험한지 판정. 위험하면 사유 키를, 아니면 null.
function block(toolName, toolInput) {
  const name = toolName || "";
  if (name === "Bash") {
    const cmd = String((toolInput && toolInput.command) || "");
    if (FORCE_PUSH.test(cmd)) return "force-push";
    if (RM_RECURSIVE.test(cmd) && RM_DANGER_TARGET.test(cmd)) return "rm-recursive";
    // 파괴적 SQL은 SQL 클라이언트 명령일 때만 검사(커밋 메시지·문자열에 "DROP TABLE"이 들어간
    // 무해한 명령을 오탐하지 않도록).
    if (/\b(psql|mysql|mariadb|sqlite3|mongosh?|clickhouse-client)\b/.test(cmd)) return destructiveSql(cmd);
    return null;
  }
  // Supabase MCP 등 DB 도구로 나가는 파괴적 SQL(가장 위험한 운영 DB 경로 — Bash가 아님).
  // NOTE: matcher는 부분일치라 도구명 `mcp__..._execute_sql`을 잡는다(실 MCP 환경 확인 권장).
  if (/execute_sql|apply_migration/.test(name)) {
    return destructiveSql((toolInput && (toolInput.query || toolInput.sql)) || "");
  }
  return null;
}

function reasonFor(key) { return REASONS[key] || "차단: 되돌리기 어려운 고위험 명령입니다."; }

module.exports = { block, reasonFor };
