import { readFileSync } from "node:fs";
import { join } from "node:path";
import { listTree } from "../build/lib/fsutil.mjs";

// 두 트리에서 파일 목록과, manifest 제외 파일들의 바이트 동일성을 비교.
export function diffTrees(aDir, bDir, { ignore = [] } = {}) {
  const a = listTree(aDir).filter((f) => !ignore.includes(f));
  const b = listTree(bDir).filter((f) => !ignore.includes(f));
  const onlyA = a.filter((f) => !b.includes(f));
  const onlyB = b.filter((f) => !a.includes(f));
  const changed = [];
  for (const f of a.filter((f) => b.includes(f))) {
    if (!readFileSync(join(aDir, f)).equals(readFileSync(join(bDir, f)))) changed.push(f);
  }
  return { onlyA, onlyB, changed };
}
