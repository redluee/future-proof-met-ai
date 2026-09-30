/*
 * DATA CONTRACT with S-Base (backend/src/modules/minor/public-snapshot.ts).
 * data/minor-snapshot.json is written by the n8n workflow "minor-publish".
 * Change this format only together with S-Base and n8n, and bump `version`.
 */

export const SNAPSHOT_VERSION = 1;

export type SelfLevel = "V" | "NV" | "-";
export type TeacherLevel = "V" | "O" | "-";
export type StoryStatus = "todo" | "in_progress" | "done";
export type EvidenceType = "link" | "github" | "document" | "app";

export interface SnapshotCriterion {
  text: string;
  isCompleted: boolean;
  indent: number;
}

export interface SnapshotLink {
  url: string;
  title?: string;
  name?: string;
}

export interface SnapshotPresentation {
  enabled?: boolean;
  summary?: string;
  bullets?: string[];
  demoUrl?: string;
  demoTitle?: string;
  images?: Array<{ url: string; caption?: string }>;
  links?: SnapshotLink[];
  websites?: SnapshotLink[];
  documents?: Array<{ title: string; url: string }>;
}

export interface SnapshotStory {
  storyTypeCode: string;
  storyNumber: string | null;
  title: string;
  asA: string | null;
  iWant: string | null;
  soThat: string | null;
  learningOutcomes: number[];
  status: StoryStatus;
  orderIndex: number;
  presentationData: SnapshotPresentation | null;
  acceptanceCriteria: SnapshotCriterion[];
  qualityCriteria: SnapshotCriterion[];
  evidence: Array<{ type: EvidenceType; title: string; url: string }>;
}

export interface SnapshotSprint {
  sprintNumber: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  showAndGrowDate: string;
  extendedDays: number;
  extensionReason: string | null;
  status: "planned" | "active" | "completed";
  stories: SnapshotStory[];
  selfEvaluations: Array<{ learningOutcome: number; level: SelfLevel; argumentation: string | null }>;
  teacherAssessments: Array<{
    learningOutcome: number;
    assessment: TeacherLevel;
    notes: string | null;
    evaluatedAt: string | null;
  }>;
  reflection: {
    date: string;
    whatLearned: string | null;
    whatRetained: string | null;
    whatChange: string | null;
  } | null;
  feedback: Array<{ date: string; feedback: string; action: string }>;
}

export interface Snapshot {
  version: number;
  generatedAt: string;
  contentHash: string;
  sprints: SnapshotSprint[];
  peerHelp: Array<{ date: string; sprintNumber: string | null; description: string; links: string | null }>;
  vacations: Array<{ name: string; startDate: string; endDate: string }>;
  assets: Array<{ path: string; sha256: string; size: number }>;
}
