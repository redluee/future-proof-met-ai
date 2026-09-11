export interface MinorVacation {
  id: number;
  userId: number;
  name: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface MinorDefaultQualityCriterion {
  text: string;
  indent?: number;
}

export interface MinorStoryType {
  id: number;
  userId: number;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  defaultQualityCriteria?: MinorDefaultQualityCriterion[];
  createdAt: string;
}

export interface MinorStoryCriterion {
  id: number;
  storyId: number;
  type: "acceptance" | "quality";
  orderIndex: number;
  indent?: number;
  text: string;
  isCompleted: boolean;
}

export interface MinorStoryEvidence {
  id: number;
  storyId: number;
  type: "link" | "github" | "document" | "app";
  title: string;
  url: string;
  createdAt: string;
}

export interface MinorStoryPresentationImage {
  url: string;
  caption?: string;
}

export interface MinorStoryPresentationData {
  enabled?: boolean;
  layout?: "auto" | "split" | "media" | "bullets" | "demo";
  bullets?: string[];
  listStyle?: "bullets" | "steps";
  summary?: string;
  demoUrl?: string;
  demoTitle?: string;
  images?: MinorStoryPresentationImage[];
  notes?: string;
}

export interface MinorStory {
  id: number;
  sprintId: number | null;
  userId: number;
  storyTypeCode: string;
  storyNumber: string | null;
  title: string;
  asA: string | null;
  iWant: string | null;
  soThat: string | null;
  learningOutcomes: number[];
  status: "todo" | "in_progress" | "done";
  orderIndex: number;
  presentationData?: MinorStoryPresentationData | null;
  createdAt: string;
  criteria?: MinorStoryCriterion[];
  evidence?: MinorStoryEvidence[];
}

export interface MinorStoryWithSprint extends MinorStory {
  sprintNumber?: string;
  sprintName?: string;
  sprintStatus?: string;
}

export interface MinorSelfEvaluation {
  id: number;
  sprintId: number;
  learningOutcome: number;
  level: "V" | "NV" | "-";
  argumentation: string | null;
  updatedAt: string;
}

export interface MinorTeacherAssessment {
  id: number;
  sprintId: number;
  learningOutcome: number;
  assessment: "V" | "O" | "-";
  notes: string | null;
  evaluatedAt: string | null;
}

export interface MinorFeedbackEntry {
  id: number;
  sprintId: number;
  date: string;
  fromWhom: string;
  feedback: string;
  action: string;
  orderIndex: number;
  createdAt: string;
}

export interface MinorReflection {
  id: number;
  sprintId: number;
  date: string;
  whatLearned: string | null;
  whatRetained: string | null;
  whatChange: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MinorSprint {
  id: number;
  userId: number;
  sprintNumber: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  showAndGrowDate: string;
  extendedDays: number;
  extensionReason: string | null;
  status: "planned" | "active" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface MinorSprintFull extends MinorSprint {
  stories: MinorStory[];
  selfEvaluations: MinorSelfEvaluation[];
  teacherAssessments: MinorTeacherAssessment[];
  feedback: MinorFeedbackEntry[];
  reflection: MinorReflection | null;
}

export interface MinorSprintExportStory {
  storyTypeCode: string;
  storyNumber?: string | null;
  title: string;
  asA?: string | null;
  iWant?: string | null;
  soThat?: string | null;
  learningOutcomes: number[];
  status: "todo" | "in_progress" | "done";
  orderIndex?: number;
  presentationData?: MinorStoryPresentationData | null;
  acceptanceCriteria?: Array<{ text: string; isCompleted: boolean; indent?: number }>;
  qualityCriteria?: Array<{ text: string; isCompleted: boolean; indent?: number }>;
  evidence?: Array<{ type: "link" | "github" | "document" | "app"; title: string; url: string }>;
}

export interface MinorSprintExportData {
  version?: number;
  sprintNumber: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  showAndGrowDate: string;
  extendedDays?: number;
  extensionReason?: string | null;
  status: "planned" | "active" | "completed" | "archived";
  stories: MinorSprintExportStory[];
  feedback?: Array<{ date: string; fromWhom: string; feedback: string; action: string; orderIndex?: number }>;
  selfEvaluations?: Array<{ learningOutcome: number; level: "V" | "NV" | "-"; argumentation?: string | null }>;
  teacherAssessments?: Array<{ learningOutcome: number; assessment: "V" | "O" | "-"; notes?: string | null; evaluatedAt?: string | null }>;
  reflection?: { date: string; whatLearned?: string | null; whatRetained?: string | null; whatChange?: string | null } | null;
}

export interface MinorPeerHelp {
  id: number;
  userId: number;
  sprintId: number | null;
  date: string;
  peerName: string;
  description: string;
  links: string | null;
  createdAt: string;
}

export interface MinorDashboardStats {
  activeSprint: MinorSprint | null;
  nextShowAndGrowDate: string | null;
  daysUntilShowAndGrow: number | null;
  officialPasses: Record<number, number>;
  projectedPasses: Record<number, number>;
  totalSprints: number;
  activeSprintWarnings: {
    fewLearningOutcomes: boolean;
    missingLU5: boolean;
    uniqueLUsCount: number;
  } | null;
  recentPeerHelp: MinorPeerHelp[];
}
