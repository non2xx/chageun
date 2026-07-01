import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { block } = require(join(dirname(fileURLToPath(import.meta.url)), "..", "src", "hooks", "pretooluse-core.js"));

const bash = (command) => block("Bash", { command });
const sql = (query) => block("mcp__plugin_supabase_supabase__execute_sql", { query });

test("git push --force 차단 · --force-with-lease 허용", () => {
  assert.equal(bash("git push --force origin main"), "force-push");
  assert.equal(bash("git push -f origin main"), "force-push");
  assert.equal(bash("git push --force-with-lease origin main"), null, "force-with-lease는 허용");
  assert.equal(bash("git push origin main"), null);
});

test("rm 재귀삭제: 루트/홈/현재트리 차단 · 하위 경로 허용", () => {
  assert.equal(bash("rm -rf /"), "rm-recursive");
  assert.equal(bash("rm -rf ~"), "rm-recursive");
  assert.equal(bash("rm -fr /*"), "rm-recursive");
  assert.equal(bash("rm -rf ."), "rm-recursive");
  assert.equal(bash("rm -rf ~/"), "rm-recursive", "홈 루트");
  assert.equal(bash("rm -rf ./build"), null, "구체 하위 경로는 허용");
  assert.equal(bash("rm -rf node_modules"), null);
  assert.equal(bash("rm file.txt"), null);
});

test("파괴적 SQL: Bash(SQL클라이언트)·MCP 차단, 안전 쿼리 허용", () => {
  assert.equal(bash('psql -c "DROP TABLE users"'), "sql-destructive");
  assert.equal(sql("DROP TABLE users"), "sql-destructive");
  assert.equal(sql("TRUNCATE TABLE orders"), "sql-destructive");
  assert.equal(sql("DELETE FROM users"), "sql-delete-no-where");
  assert.equal(sql("DELETE FROM users WHERE id = 1"), null, "WHERE 있으면 허용");
  assert.equal(sql("SELECT * FROM users"), null);
  assert.equal(sql("UPDATE users SET name='x' WHERE id=1"), null);
});

test("SQL: 다중문장 우회 방지 + 주석 무시", () => {
  // 뒤 문장의 무관한 WHERE로 앞의 전체삭제가 통과하면 안 됨.
  assert.equal(sql("DELETE FROM users; SELECT * FROM logs WHERE id=1"), "sql-delete-no-where");
  assert.equal(sql("SELECT 1; DELETE FROM orders WHERE id=1"), null, "각 문장이 안전하면 통과");
  assert.equal(sql("DELETE FROM users -- WHERE 절 나중에"), "sql-delete-no-where", "주석 속 WHERE는 무효");
});

test("관계없는 도구·명령·문자열 속 SQL어는 통과(오탐 방지)", () => {
  assert.equal(block("Read", { file_path: "/x" }), null);
  assert.equal(bash("ls -la"), null);
  assert.equal(bash("npm test"), null);
  assert.equal(bash("git commit -m 'fix DROP TABLE parsing bug'"), null, "커밋 메시지의 DROP은 오탐 아님");
  assert.equal(bash("echo 'DELETE FROM cache'"), null, "SQL 클라이언트 아니면 미검사");
});
