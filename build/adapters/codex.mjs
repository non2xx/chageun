import { rmSync, mkdirSync, cpSync } from "node:fs";
import { join } from "node:path";
import { loadManifest, codexPluginJson } from "../lib/manifest.mjs";
import { copyTree, writeJson } from "../lib/fsutil.mjs";

export function buildCodex(srcDir, outDir) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const m = loadManifest(srcDir);

  writeJson(join(outDir, ".codex-plugin", "plugin.json"), codexPluginJson(m));

  // 훅 (Codex)
  mkdirSync(join(outDir, "hooks"), { recursive: true });
  for (const f of ["hooks-codex.json", "activate-codex.mjs", "finish-work-codex.mjs"])
    cpSync(join(srcDir, "hooks", f), join(outDir, "hooks", f));

  // 공유 콘텐츠(미수정 복사)
  for (const d of ["skills", "rules", "assets", "codex"]) copyTree(join(srcDir, d), join(outDir, d));
  cpSync(join(srcDir, "README.md"), join(outDir, "README.md"));
  cpSync(join(srcDir, "LICENSE"), join(outDir, "LICENSE"));
}
