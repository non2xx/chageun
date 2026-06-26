import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCodex } from "../build/adapters/codex.mjs";

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");

test("buildCodex는 Codex 플러그인 트리를 만든다", () => {
  const out = join(mkdtempSync(join(tmpdir(), "bx-")), "codex");
  buildCodex(SRC, out);
  const p = JSON.parse(readFileSync(join(out, ".codex-plugin/plugin.json"), "utf8"));
  assert.equal(p.name, "chageun");
  assert.equal(p.skills, "./skills/");
  assert.equal(p.hooks, "./hooks/hooks-codex.json");
  assert.ok(!("dependencies" in p), "Codex plugin.json에 dependencies 없어야");
  for (const f of [
    "hooks/hooks-codex.json", "hooks/activate-codex.mjs", "hooks/finish-work-codex.mjs",
    "rules/operating-rules.md", "codex/operating-rules-addendum.md", "codex/gate-agents.md", "codex/codex-tools.md",
    "README.md", "LICENSE",
  ]) assert.ok(existsSync(join(out, f)), f);
  for (const s of ["referencing","product-map","design-system","monitoring","security-scan"])
    assert.ok(existsSync(join(out, "skills", s, "SKILL.md")), s);
  // 공유 operating-rules는 원본과 동일(미수정)
  assert.equal(readFileSync(join(out,"rules/operating-rules.md"),"utf8"), readFileSync(join(SRC,"rules/operating-rules.md"),"utf8"));
});
