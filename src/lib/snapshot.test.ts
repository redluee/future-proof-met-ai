import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadSnapshot, parseSnapshot } from "./snapshot";

const root = join(import.meta.dir, "../..");
const sample = () => JSON.parse(readFileSync(join(root, "fixtures/snapshot.sample.json"), "utf8"));

describe("snapshot contract", () => {
  it("accepts the committed snapshot and the sample", () => {
    expect(loadSnapshot(join(root, "data/minor-snapshot.json")).version).toBe(1);
    expect(parseSnapshot(sample()).sprints).toHaveLength(1);
  });

  it("rejects a wrong version or missing fields", () => {
    expect(() => parseSnapshot({ ...sample(), version: 2 })).toThrow();
    const noStories = sample();
    delete noStories.sprints[0].stories;
    expect(() => parseSnapshot(noStories)).toThrow();
    expect(() => parseSnapshot(null)).toThrow();
  });

  it("keeps the protected paths n8n writes to", () => {
    for (const path of ["data/minor-snapshot.json", "public/minor", "src/types/snapshot.ts", "src/lib/snapshot.ts"]) {
      expect(existsSync(join(root, path))).toBe(true);
    }
  });

  it("keeps the site read-only", () => {
    const forbidden = [/writeFile/, /writeFileSync/, /api\.github\.com/, /process\.env\.GITHUB/, /AUTH_PASSWORD/];
    const walk = (dir: string): string[] =>
      Array.from(new Bun.Glob("**/*.{ts,tsx}").scanSync({ cwd: dir })).map((f: string) => join(dir, f));
    for (const file of walk(join(root, "src")).filter((f) => !f.endsWith(".test.ts"))) {
      const text = readFileSync(file, "utf8");
      for (const pattern of forbidden) expect({ file, hit: pattern.test(text) }).toEqual({ file, hit: false });
    }
  });
});
