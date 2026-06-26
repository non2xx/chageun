import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const G = join(ROOT, "test", "golden", "claude");

// 현재 Claude 플러그인을 구성하는 추적 파일들(루트 기준 상대경로).
const ENTRIES = [
  ".claude-plugin/plugin.json",
  ".claude-plugin/marketplace.json",
  "hooks/hooks.json",
  "hooks/activate.js",
  "hooks/finish-work.js",
  "rules/operating-rules.md",
  "skills/referencing/SKILL.md",
  "skills/product-map/SKILL.md",
  "skills/design-system/SKILL.md",
  "skills/monitoring/SKILL.md",
  "skills/security-scan/SKILL.md",
  "agents/plan-validator.md",
  "agents/pr-reviewer.md",
  "agents/code-implementer.md",
  "assets/chageun-flow.png",
  "README.md",
  "LICENSE",
];

rmSync(G, { recursive: true, force: true });
for (const rel of ENTRIES) {
  const src = join(ROOT, rel);
  if (!existsSync(src)) throw new Error("스냅샷 대상 없음: " + rel);
  const dst = join(G, rel);
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst);
}
console.log(`골든 캡처 완료: ${ENTRIES.length}개 → test/golden/claude/`);
