import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SNAPSHOT_VERSION, type Snapshot } from "@/types/snapshot";

export const SNAPSHOT_PATH = join(process.cwd(), "data", "minor-snapshot.json");

function fail(message: string): never {
  throw new Error(`Invalid minor snapshot: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSnapshot(raw: unknown): Snapshot {
  if (!isRecord(raw)) fail("not an object");
  if (raw.version !== SNAPSHOT_VERSION) fail(`version ${String(raw.version)} is not ${SNAPSHOT_VERSION}`);
  if (typeof raw.generatedAt !== "string") fail("generatedAt missing");
  if (typeof raw.contentHash !== "string") fail("contentHash missing");
  for (const key of ["sprints", "peerHelp", "vacations", "assets"] as const) {
    if (!Array.isArray(raw[key])) fail(`${key} must be an array`);
  }

  for (const sprint of raw.sprints as unknown[]) {
    if (!isRecord(sprint)) fail("sprint is not an object");
    for (const key of ["sprintNumber", "name", "startDate", "endDate"] as const) {
      if (typeof sprint[key] !== "string") fail(`sprint.${key} missing`);
    }
    for (const key of ["stories", "selfEvaluations", "teacherAssessments", "feedback"] as const) {
      if (!Array.isArray(sprint[key])) fail(`sprint.${key} must be an array`);
    }
    for (const story of sprint.stories as unknown[]) {
      if (!isRecord(story)) fail("story is not an object");
      if (typeof story.title !== "string") fail("story.title missing");
      for (const key of ["learningOutcomes", "acceptanceCriteria", "qualityCriteria", "evidence"] as const) {
        if (!Array.isArray(story[key])) fail(`story.${key} must be an array`);
      }
    }
  }

  return raw as unknown as Snapshot;
}

export function loadSnapshot(path: string = SNAPSHOT_PATH): Snapshot {
  return parseSnapshot(JSON.parse(readFileSync(path, "utf8")));
}
