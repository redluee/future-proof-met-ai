import fs from "fs";
import path from "path";
import type {
  MinorSprint,
  MinorSprintFull,
  MinorStory,
  MinorStoryWithSprint,
  MinorStoryCriterion,
  MinorStoryEvidence,
  MinorSelfEvaluation,
  MinorTeacherAssessment,
  MinorFeedbackEntry,
  MinorReflection,
  MinorVacation,
  MinorStoryType,
  MinorPeerHelp,
  MinorDashboardStats,
  MinorSprintExportData,
  MinorSprintExportStory,
} from "@/types/minor";

interface MinorDatabaseData {
  version: number;
  exportedAt: string;
  sprints: MinorSprint[];
  stories: MinorStory[];
  criteria: MinorStoryCriterion[];
  evidence: MinorStoryEvidence[];
  selfEvaluations: MinorSelfEvaluation[];
  teacherAssessments: MinorTeacherAssessment[];
  feedbackEntries: MinorFeedbackEntry[];
  reflections: MinorReflection[];
  peerHelp: MinorPeerHelp[];
  vacations: MinorVacation[];
  storyTypes: MinorStoryType[];
}

export const DEFAULT_STORY_TYPES = [
  {
    code: "US",
    name: "User Story",
    description: "Standaard functionele user story",
    color: "#10b981",
    isDefault: true,
    defaultQualityCriteria: [
      { text: "Definition of Done gehaald", indent: 0 },
      { text: "Getest volgens acceptatiecriteria", indent: 0 },
      { text: "Code en documentatie gedocumenteerd met bewijslast", indent: 0 },
    ],
  },
  {
    code: "RS",
    name: "Research Story",
    description: "Onderzoek en analyse story",
    color: "#f97316",
    isDefault: true,
    defaultQualityCriteria: [
      { text: "Onderzoeksvraag en methodiek helder gedefinieerd", indent: 0 },
      { text: "Resultaten en conclusies onderbouwd met bronnen", indent: 0 },
      { text: "Aanbevelingen of vervolgstappen geformuleerd", indent: 0 },
    ],
  },
  {
    code: "LS",
    name: "Learning Story",
    description: "Persoonlijk leertraject story",
    color: "#a855f7",
    isDefault: true,
    defaultQualityCriteria: [
      { text: "Leerdoelen en leeractiviteiten geëxpliceerd", indent: 0 },
      { text: "Reflectie op opgedane kennis en vaardigheden", indent: 0 },
      { text: "Bewijsstukken gekoppeld aan leeruitkomsten", indent: 0 },
    ],
  },
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

class MinorDB {
  private data: MinorDatabaseData | null = null;
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "minor-data.json");
  }

  private getData(): MinorDatabaseData {
    if (this.data) return this.data;

    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        this.data = JSON.parse(raw);
        return this.data!;
      }
    } catch (err) {
      console.error("Error reading database from disk:", err);
    }

    // Fallback if file doesn't exist
    this.data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      sprints: [],
      stories: [],
      criteria: [],
      evidence: [],
      selfEvaluations: [],
      teacherAssessments: [],
      feedbackEntries: [],
      reflections: [],
      peerHelp: [],
      vacations: [],
      storyTypes: [],
    };
    return this.data;
  }

  private persist() {
    if (!this.data) return;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch {
      // In serverless / Vercel read-only filesystem, try writing to /tmp
      try {
        const tmpPath = path.join("/tmp", "minor-data.json");
        fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), "utf-8");
      } catch (e) {
        console.warn("Could not persist to disk in serverless environment:", e);
      }
    }

    // Optional GitHub commit sync if environment variables are configured
    this.syncToGitHub().catch(() => {});
  }

  private async syncToGitHub() {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; // format: "owner/repo"
    if (!token || !repo || !this.data) return;

    try {
      const url = `https://api.github.com/repos/${repo}/contents/data/minor-data.json`;
      const getRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      let sha: string | undefined;
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      const content = Buffer.from(JSON.stringify(this.data, null, 2)).toString("base64");
      await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Auto-sync minor database update",
          content,
          sha,
        }),
      });
    } catch (e) {
      console.warn("GitHub sync error:", e);
    }
  }

  private nextId(items: { id: number }[]): number {
    return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  }

  // --- Vacations & Date Calculation ---

  getVacations(): MinorVacation[] {
    return [...this.getData().vacations].sort((a, b) => a.startDate.localeCompare(b.startDate));
  }

  createVacation(data: { name: string; startDate: string; endDate: string }): MinorVacation {
    const db = this.getData();
    const item: MinorVacation = {
      id: this.nextId(db.vacations),
      userId: 1,
      name: data.name.trim(),
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date().toISOString(),
    };
    db.vacations.push(item);
    this.persist();
    return item;
  }

  updateVacation(id: number, data: Partial<{ name: string; startDate: string; endDate: string }>): MinorVacation | null {
    const db = this.getData();
    const idx = db.vacations.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    db.vacations[idx] = {
      ...db.vacations[idx],
      name: data.name !== undefined ? data.name.trim() : db.vacations[idx].name,
      startDate: data.startDate !== undefined ? data.startDate : db.vacations[idx].startDate,
      endDate: data.endDate !== undefined ? data.endDate : db.vacations[idx].endDate,
    };
    this.persist();
    return db.vacations[idx];
  }

  deleteVacation(id: number): boolean {
    const db = this.getData();
    const idx = db.vacations.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    db.vacations.splice(idx, 1);
    this.persist();
    return true;
  }

  calculateSprintDates(startDateStr: string, durationDays: number = 14) {
    const vacations = this.getVacations();
    let start = parseDate(startDateStr);
    let effectiveDuration = durationDays;
    let extendedDays = 0;
    const overlappingVacationNames: string[] = [];

    let currentEnd = addDays(start, effectiveDuration - 1);
    let hasChanged = true;
    const countedVacationDates = new Set<string>();

    while (hasChanged) {
      hasChanged = false;
      for (const vac of vacations) {
        const vacStart = parseDate(vac.startDate);
        const vacEnd = parseDate(vac.endDate);

        const overlapStart = start > vacStart ? start : vacStart;
        const overlapEnd = currentEnd < vacEnd ? currentEnd : vacEnd;

        if (overlapStart <= overlapEnd) {
          if (!overlappingVacationNames.includes(vac.name)) {
            overlappingVacationNames.push(vac.name);
          }

          let cur = new Date(overlapStart);
          while (cur <= overlapEnd) {
            const dateKey = formatDate(cur);
            if (!countedVacationDates.has(dateKey)) {
              countedVacationDates.add(dateKey);
              extendedDays++;
              hasChanged = true;
            }
            cur = addDays(cur, 1);
          }
        }
      }

      if (hasChanged) {
        currentEnd = addDays(start, effectiveDuration + extendedDays - 1);
      }
    }

    // Show & Grow date (Wednesday in the last week of the sprint)
    let showAndGrow = new Date(currentEnd);
    while (showAndGrow.getDay() !== 3) {
      showAndGrow = addDays(showAndGrow, -1);
    }
    if (showAndGrow < start) {
      showAndGrow = new Date(start);
      while (showAndGrow.getDay() !== 3) {
        showAndGrow = addDays(showAndGrow, 1);
      }
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(currentEnd),
      durationDays,
      extendedDays,
      extensionReason: overlappingVacationNames.length > 0 ? overlappingVacationNames.join(", ") : null,
      showAndGrowDate: formatDate(showAndGrow),
    };
  }

  // --- Story Types ---

  getStoryTypes(): MinorStoryType[] {
    const db = this.getData();
    const map = new Map<string, MinorStoryType>();
    db.storyTypes.forEach((t) => map.set(t.code, t));

    return DEFAULT_STORY_TYPES.map((def, idx) => {
      const custom = map.get(def.code);
      if (custom) return custom;
      return {
        id: -(idx + 1),
        userId: 1,
        code: def.code,
        name: def.name,
        description: def.description,
        color: def.color,
        isDefault: true,
        defaultQualityCriteria: def.defaultQualityCriteria,
        createdAt: new Date().toISOString(),
      };
    });
  }

  createStoryType(data: { code: string; name: string; description?: string; color?: string; defaultQualityCriteria?: any[] }): MinorStoryType {
    const db = this.getData();
    const item: MinorStoryType = {
      id: this.nextId(db.storyTypes),
      userId: 1,
      code: data.code.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description?.trim() || null,
      color: data.color || null,
      isDefault: false,
      defaultQualityCriteria: data.defaultQualityCriteria || [],
      createdAt: new Date().toISOString(),
    };
    db.storyTypes.push(item);
    this.persist();
    return item;
  }

  updateStoryType(id: number, data: Partial<MinorStoryType>): MinorStoryType | null {
    const db = this.getData();
    const idx = db.storyTypes.findIndex((st) => st.id === id);
    if (idx === -1) return null;
    db.storyTypes[idx] = { ...db.storyTypes[idx], ...data };
    this.persist();
    return db.storyTypes[idx];
  }

  deleteStoryType(id: number): boolean {
    const db = this.getData();
    const idx = db.storyTypes.findIndex((st) => st.id === id);
    if (idx === -1) return false;
    db.storyTypes.splice(idx, 1);
    this.persist();
    return true;
  }

  resetDefaultStoryTypes() {
    const db = this.getData();
    db.storyTypes = [];
    this.persist();
    return this.getStoryTypes();
  }

  // --- Sprints ---

  getSprints(): MinorSprint[] {
    return [...this.getData().sprints].sort((a, b) => b.id - a.id);
  }

  getSprint(id: number): MinorSprint | null {
    return this.getData().sprints.find((s) => s.id === id) || null;
  }

  getNextSprintNumber(): { nextNumber: string; nextName: string } {
    const sprints = this.getData().sprints;
    const numericNums = sprints
      .map((s) => parseInt(s.sprintNumber, 10))
      .filter((n) => !isNaN(n));
    const maxNum = numericNums.length > 0 ? Math.max(...numericNums) : 0;
    const nextNumber = String(maxNum + 1);
    return { nextNumber, nextName: `Sprint ${nextNumber}` };
  }

  getSprintFull(id: number): MinorSprintFull | null {
    const sprint = this.getSprint(id);
    if (!sprint) return null;

    const db = this.getData();
    const stories = db.stories
      .filter((st) => st.sprintId === id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.id - b.id)
      .map((st) => {
        const criteria = db.criteria
          .filter((c) => c.storyId === st.id)
          .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);
        const evidence = db.evidence
          .filter((e) => e.storyId === st.id)
          .sort((a, b) => a.id - b.id);
        return { ...st, criteria, evidence };
      });

    let selfEvaluations = db.selfEvaluations
      .filter((se) => se.sprintId === id)
      .sort((a, b) => a.learningOutcome - b.learningOutcome);

    let teacherAssessments = db.teacherAssessments
      .filter((ta) => ta.sprintId === id)
      .sort((a, b) => a.learningOutcome - b.learningOutcome);

    let reflection = db.reflections.find((r) => r.sprintId === id) || null;

    const feedback = db.feedbackEntries
      .filter((f) => f.sprintId === id)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.id - b.id);

    return {
      ...sprint,
      stories,
      selfEvaluations,
      teacherAssessments,
      feedback,
      reflection,
    };
  }

  createSprint(data: {
    sprintNumber?: string;
    name?: string;
    startDate: string;
    endDate?: string;
    durationDays?: number;
    showAndGrowDate?: string;
    status?: "planned" | "active" | "completed" | "archived";
  }): MinorSprint {
    const db = this.getData();
    const calc = this.calculateSprintDates(data.startDate, data.durationDays ?? 14);
    const nextInfo = this.getNextSprintNumber();

    const sprintNumber = data.sprintNumber?.trim() || nextInfo.nextNumber;
    const name = data.name?.trim() || `Sprint ${sprintNumber}`;

    const sprint: MinorSprint = {
      id: this.nextId(db.sprints),
      userId: 1,
      sprintNumber,
      name,
      startDate: data.startDate,
      endDate: data.endDate || calc.endDate,
      durationDays: data.durationDays ?? calc.durationDays,
      showAndGrowDate: data.showAndGrowDate || calc.showAndGrowDate,
      extendedDays: calc.extendedDays,
      extensionReason: calc.extensionReason,
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.sprints.push(sprint);

    // Initialize 5 self-evaluations, 5 teacher assessments, and 1 reflection
    for (let lu = 1; lu <= 5; lu++) {
      db.selfEvaluations.push({
        id: this.nextId(db.selfEvaluations),
        sprintId: sprint.id,
        learningOutcome: lu,
        level: "-",
        argumentation: "",
        updatedAt: new Date().toISOString(),
      });

      db.teacherAssessments.push({
        id: this.nextId(db.teacherAssessments),
        sprintId: sprint.id,
        learningOutcome: lu,
        assessment: "-",
        notes: "",
        evaluatedAt: null,
      });
    }

    db.reflections.push({
      id: this.nextId(db.reflections),
      sprintId: sprint.id,
      date: formatDate(new Date()),
      whatLearned: "",
      whatRetained: "",
      whatChange: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.persist();
    return sprint;
  }

  updateSprint(id: number, data: Partial<MinorSprint>): MinorSprint | null {
    const db = this.getData();
    const idx = db.sprints.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const existing = db.sprints[idx];
    let extendedDays = data.extendedDays ?? existing.extendedDays;
    let extensionReason = data.extensionReason !== undefined ? data.extensionReason : existing.extensionReason;
    let endDate = data.endDate ?? existing.endDate;
    let showAndGrowDate = data.showAndGrowDate ?? existing.showAndGrowDate;

    if (data.startDate && data.startDate !== existing.startDate && !data.endDate) {
      const calc = this.calculateSprintDates(data.startDate, data.durationDays ?? existing.durationDays);
      endDate = calc.endDate;
      showAndGrowDate = calc.showAndGrowDate;
      extendedDays = calc.extendedDays;
      extensionReason = calc.extensionReason;
    }

    db.sprints[idx] = {
      ...existing,
      ...data,
      extendedDays,
      extensionReason,
      endDate,
      showAndGrowDate,
      updatedAt: new Date().toISOString(),
    };

    this.persist();
    return db.sprints[idx];
  }

  deleteSprint(id: number): boolean {
    const db = this.getData();
    const idx = db.sprints.findIndex((s) => s.id === id);
    if (idx === -1) return false;

    // Delete stories belonging to sprint
    const storyIds = db.stories.filter((st) => st.sprintId === id).map((st) => st.id);
    db.stories = db.stories.filter((st) => st.sprintId !== id);
    db.criteria = db.criteria.filter((c) => !storyIds.includes(c.storyId));
    db.evidence = db.evidence.filter((e) => !storyIds.includes(e.storyId));

    // Delete evaluations, assessments, reflections, feedback
    db.selfEvaluations = db.selfEvaluations.filter((se) => se.sprintId !== id);
    db.teacherAssessments = db.teacherAssessments.filter((ta) => ta.sprintId !== id);
    db.reflections = db.reflections.filter((r) => r.sprintId !== id);
    db.feedbackEntries = db.feedbackEntries.filter((f) => f.sprintId !== id);

    // Unlink peer help
    db.peerHelp.forEach((p) => {
      if (p.sprintId === id) p.sprintId = null;
    });

    db.sprints.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Stories ---

  getStories(sprintId?: number | null): MinorStoryWithSprint[] {
    const db = this.getData();
    const sprintMap = new Map<number, MinorSprint>();
    db.sprints.forEach((s) => sprintMap.set(s.id, s));

    let filtered = db.stories;
    if (sprintId !== undefined) {
      filtered = filtered.filter((st) => st.sprintId === sprintId);
    }

    return filtered
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.id - b.id)
      .map((st) => {
        const criteria = db.criteria
          .filter((c) => c.storyId === st.id)
          .sort((a, b) => a.orderIndex - b.orderIndex || a.id - b.id);
        const evidence = db.evidence
          .filter((e) => e.storyId === st.id)
          .sort((a, b) => a.id - b.id);
        const sprint = st.sprintId ? sprintMap.get(st.sprintId) : undefined;
        return {
          ...st,
          criteria,
          evidence,
          sprintNumber: sprint?.sprintNumber,
          sprintName: sprint?.name,
          sprintStatus: sprint?.status,
        };
      });
  }

  createStory(data: {
    sprintId?: number | null;
    storyTypeCode?: string;
    storyNumber?: string;
    title: string;
    asA?: string;
    iWant?: string;
    soThat?: string;
    learningOutcomes?: number[];
    status?: "todo" | "in_progress" | "done";
    orderIndex?: number;
    presentationData?: any;
    acceptanceCriteria?: { text: string; isCompleted?: boolean; indent?: number }[];
    qualityCriteria?: { text: string; isCompleted?: boolean; indent?: number }[];
    evidence?: { type: "link" | "github" | "document" | "app"; title: string; url: string }[];
  }): MinorStory {
    const db = this.getData();
    const story: MinorStory = {
      id: this.nextId(db.stories),
      sprintId: data.sprintId ?? null,
      userId: 1,
      storyTypeCode: data.storyTypeCode || "US",
      storyNumber: data.storyNumber || null,
      title: data.title.trim(),
      asA: data.asA?.trim() || null,
      iWant: data.iWant?.trim() || null,
      soThat: data.soThat?.trim() || null,
      learningOutcomes: data.learningOutcomes || [],
      status: data.status || "todo",
      orderIndex: data.orderIndex || 0,
      presentationData: data.presentationData || null,
      createdAt: new Date().toISOString(),
    };
    db.stories.push(story);

    const createdCriteria: MinorStoryCriterion[] = [];
    if (data.acceptanceCriteria) {
      data.acceptanceCriteria.forEach((ac, idx) => {
        const c: MinorStoryCriterion = {
          id: this.nextId(db.criteria),
          storyId: story.id,
          type: "acceptance",
          orderIndex: idx + 1,
          indent: ac.indent || 0,
          text: ac.text.trim(),
          isCompleted: Boolean(ac.isCompleted),
        };
        db.criteria.push(c);
        createdCriteria.push(c);
      });
    }

    if (data.qualityCriteria) {
      data.qualityCriteria.forEach((qc, idx) => {
        const c: MinorStoryCriterion = {
          id: this.nextId(db.criteria),
          storyId: story.id,
          type: "quality",
          orderIndex: idx + 1,
          indent: qc.indent || 0,
          text: qc.text.trim(),
          isCompleted: Boolean(qc.isCompleted),
        };
        db.criteria.push(c);
        createdCriteria.push(c);
      });
    }

    const createdEvidence: MinorStoryEvidence[] = [];
    if (data.evidence) {
      data.evidence.forEach((ev) => {
        const e: MinorStoryEvidence = {
          id: this.nextId(db.evidence),
          storyId: story.id,
          type: ev.type,
          title: ev.title.trim(),
          url: ev.url.trim(),
          createdAt: new Date().toISOString(),
        };
        db.evidence.push(e);
        createdEvidence.push(e);
      });
    }

    this.persist();
    return { ...story, criteria: createdCriteria, evidence: createdEvidence };
  }

  updateStory(id: number, data: Partial<MinorStory> & {
    acceptanceCriteria?: { id?: number; text: string; isCompleted?: boolean; indent?: number }[];
    qualityCriteria?: { id?: number; text: string; isCompleted?: boolean; indent?: number }[];
    evidence?: { id?: number; type: "link" | "github" | "document" | "app"; title: string; url: string }[];
  }): MinorStory | null {
    const db = this.getData();
    const idx = db.stories.findIndex((st) => st.id === id);
    if (idx === -1) return null;

    db.stories[idx] = {
      ...db.stories[idx],
      sprintId: data.sprintId !== undefined ? data.sprintId : db.stories[idx].sprintId,
      storyTypeCode: data.storyTypeCode || db.stories[idx].storyTypeCode,
      storyNumber: data.storyNumber !== undefined ? data.storyNumber : db.stories[idx].storyNumber,
      title: data.title ? data.title.trim() : db.stories[idx].title,
      asA: data.asA !== undefined ? data.asA : db.stories[idx].asA,
      iWant: data.iWant !== undefined ? data.iWant : db.stories[idx].iWant,
      soThat: data.soThat !== undefined ? data.soThat : db.stories[idx].soThat,
      learningOutcomes: data.learningOutcomes || db.stories[idx].learningOutcomes,
      status: data.status || db.stories[idx].status,
      orderIndex: data.orderIndex !== undefined ? data.orderIndex : db.stories[idx].orderIndex,
      presentationData: data.presentationData !== undefined ? data.presentationData : db.stories[idx].presentationData,
    };

    if (data.acceptanceCriteria !== undefined || data.qualityCriteria !== undefined) {
      // Re-sync criteria if supplied
      if (data.acceptanceCriteria !== undefined) {
        db.criteria = db.criteria.filter((c) => !(c.storyId === id && c.type === "acceptance"));
        data.acceptanceCriteria.forEach((ac, i) => {
          db.criteria.push({
            id: ac.id || this.nextId(db.criteria),
            storyId: id,
            type: "acceptance",
            orderIndex: i + 1,
            indent: ac.indent || 0,
            text: ac.text.trim(),
            isCompleted: Boolean(ac.isCompleted),
          });
        });
      }
      if (data.qualityCriteria !== undefined) {
        db.criteria = db.criteria.filter((c) => !(c.storyId === id && c.type === "quality"));
        data.qualityCriteria.forEach((qc, i) => {
          db.criteria.push({
            id: qc.id || this.nextId(db.criteria),
            storyId: id,
            type: "quality",
            orderIndex: i + 1,
            indent: qc.indent || 0,
            text: qc.text.trim(),
            isCompleted: Boolean(qc.isCompleted),
          });
        });
      }
    }

    if (data.evidence !== undefined) {
      db.evidence = db.evidence.filter((e) => e.storyId !== id);
      data.evidence.forEach((ev) => {
        db.evidence.push({
          id: ev.id || this.nextId(db.evidence),
          storyId: id,
          type: ev.type,
          title: ev.title.trim(),
          url: ev.url.trim(),
          createdAt: new Date().toISOString(),
        });
      });
    }

    this.persist();

    const criteria = db.criteria.filter((c) => c.storyId === id);
    const evidence = db.evidence.filter((e) => e.storyId === id);
    return { ...db.stories[idx], criteria, evidence };
  }

  deleteStory(id: number): boolean {
    const db = this.getData();
    const idx = db.stories.findIndex((st) => st.id === id);
    if (idx === -1) return false;
    db.stories.splice(idx, 1);
    db.criteria = db.criteria.filter((c) => c.storyId !== id);
    db.evidence = db.evidence.filter((e) => e.storyId !== id);
    this.persist();
    return true;
  }

  toggleCriterion(criterionId: number, isCompleted: boolean): MinorStoryCriterion | null {
    const db = this.getData();
    const item = db.criteria.find((c) => c.id === criterionId);
    if (!item) return null;
    item.isCompleted = isCompleted;
    this.persist();
    return item;
  }

  // --- Evaluations & Assessments ---

  saveSelfEvaluations(sprintId: number, evaluations: { learningOutcome: number; level: "V" | "NV" | "-"; argumentation?: string }[]) {
    const db = this.getData();
    evaluations.forEach((ev) => {
      const existing = db.selfEvaluations.find(
        (se) => se.sprintId === sprintId && se.learningOutcome === ev.learningOutcome
      );
      if (existing) {
        existing.level = ev.level;
        existing.argumentation = ev.argumentation || null;
        existing.updatedAt = new Date().toISOString();
      } else {
        db.selfEvaluations.push({
          id: this.nextId(db.selfEvaluations),
          sprintId,
          learningOutcome: ev.learningOutcome,
          level: ev.level,
          argumentation: ev.argumentation || null,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    this.persist();
    return db.selfEvaluations.filter((se) => se.sprintId === sprintId);
  }

  autoSelfEvaluations(sprintId: number): MinorSelfEvaluation[] {
    const db = this.getData();
    const doneStories = db.stories.filter((st) => st.sprintId === sprintId && st.status === "done");
    const passedLUs = new Set<number>();
    doneStories.forEach((st) => {
      (st.learningOutcomes || []).forEach((lu) => passedLUs.add(lu));
    });

    const evaluations = [1, 2, 3, 4, 5].map((lu) => ({
      learningOutcome: lu,
      level: (passedLUs.has(lu) ? "V" : "-") as "V" | "NV" | "-",
      argumentation: passedLUs.has(lu) ? "Automatisch toegekend op basis van afgeronde user stories." : "",
    }));

    return this.saveSelfEvaluations(sprintId, evaluations);
  }

  saveTeacherAssessments(sprintId: number, assessments: { learningOutcome: number; assessment: "V" | "O" | "-"; notes?: string; evaluatedAt?: string }[]) {
    const db = this.getData();
    assessments.forEach((as) => {
      const existing = db.teacherAssessments.find(
        (ta) => ta.sprintId === sprintId && ta.learningOutcome === as.learningOutcome
      );
      if (existing) {
        existing.assessment = as.assessment;
        existing.notes = as.notes || null;
        existing.evaluatedAt = as.evaluatedAt || new Date().toISOString();
      } else {
        db.teacherAssessments.push({
          id: this.nextId(db.teacherAssessments),
          sprintId,
          learningOutcome: as.learningOutcome,
          assessment: as.assessment,
          notes: as.notes || null,
          evaluatedAt: as.evaluatedAt || new Date().toISOString(),
        });
      }
    });
    this.persist();
    return db.teacherAssessments.filter((ta) => ta.sprintId === sprintId);
  }

  // --- Reflections & Feedback ---

  getReflection(sprintId: number): MinorReflection | null {
    return this.getData().reflections.find((r) => r.sprintId === sprintId) || null;
  }

  saveReflection(sprintId: number, data: { date?: string; whatLearned?: string; whatRetained?: string; whatChange?: string }): MinorReflection {
    const db = this.getData();
    let r = db.reflections.find((ref) => ref.sprintId === sprintId);
    if (r) {
      r.date = data.date || r.date;
      r.whatLearned = data.whatLearned !== undefined ? data.whatLearned : r.whatLearned;
      r.whatRetained = data.whatRetained !== undefined ? data.whatRetained : r.whatRetained;
      r.whatChange = data.whatChange !== undefined ? data.whatChange : r.whatChange;
      r.updatedAt = new Date().toISOString();
    } else {
      r = {
        id: this.nextId(db.reflections),
        sprintId,
        date: data.date || formatDate(new Date()),
        whatLearned: data.whatLearned || null,
        whatRetained: data.whatRetained || null,
        whatChange: data.whatChange || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.reflections.push(r);
    }
    this.persist();
    return r;
  }

  getFeedback(sprintId: number): MinorFeedbackEntry[] {
    return this.getData().feedbackEntries
      .filter((f) => f.sprintId === sprintId)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0) || a.id - b.id);
  }

  createFeedback(sprintId: number, data: { date: string; fromWhom: string; feedback: string; action: string; orderIndex?: number }): MinorFeedbackEntry {
    const db = this.getData();
    const item: MinorFeedbackEntry = {
      id: this.nextId(db.feedbackEntries),
      sprintId,
      date: data.date,
      fromWhom: data.fromWhom.trim(),
      feedback: data.feedback.trim(),
      action: data.action.trim(),
      orderIndex: data.orderIndex || 0,
      createdAt: new Date().toISOString(),
    };
    db.feedbackEntries.push(item);
    this.persist();
    return item;
  }

  updateFeedback(id: number, data: Partial<MinorFeedbackEntry>): MinorFeedbackEntry | null {
    const db = this.getData();
    const idx = db.feedbackEntries.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    db.feedbackEntries[idx] = { ...db.feedbackEntries[idx], ...data };
    this.persist();
    return db.feedbackEntries[idx];
  }

  deleteFeedback(id: number): boolean {
    const db = this.getData();
    const idx = db.feedbackEntries.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    db.feedbackEntries.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Peer Help ---

  getPeerHelp(): MinorPeerHelp[] {
    return [...this.getData().peerHelp].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }

  createPeerHelp(data: { sprintId?: number | null; date: string; peerName: string; description: string; links?: string }): MinorPeerHelp {
    const db = this.getData();
    const item: MinorPeerHelp = {
      id: this.nextId(db.peerHelp),
      userId: 1,
      sprintId: data.sprintId ?? null,
      date: data.date,
      peerName: data.peerName.trim(),
      description: data.description.trim(),
      links: data.links?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    db.peerHelp.push(item);
    this.persist();
    return item;
  }

  updatePeerHelp(id: number, data: Partial<MinorPeerHelp>): MinorPeerHelp | null {
    const db = this.getData();
    const idx = db.peerHelp.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    db.peerHelp[idx] = { ...db.peerHelp[idx], ...data };
    this.persist();
    return db.peerHelp[idx];
  }

  deletePeerHelp(id: number): boolean {
    const db = this.getData();
    const idx = db.peerHelp.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    db.peerHelp.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Dashboard Stats ---

  getDashboardStats(): MinorDashboardStats {
    const db = this.getData();
    const sprints = [...db.sprints].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id);
    const activeSprint = sprints.find((s) => s.status === "active") || sprints[sprints.length - 1] || null;

    let daysUntilShowAndGrow: number | null = null;
    let nextShowAndGrowDate: string | null = null;
    if (activeSprint?.showAndGrowDate) {
      nextShowAndGrowDate = activeSprint.showAndGrowDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = parseDate(activeSprint.showAndGrowDate);
      target.setHours(0, 0, 0, 0);
      daysUntilShowAndGrow = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    const officialPasses: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const projectedPasses: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const ta of db.teacherAssessments) {
      if (ta.assessment === "V" && ta.learningOutcome >= 1 && ta.learningOutcome <= 5) {
        officialPasses[ta.learningOutcome] = (officialPasses[ta.learningOutcome] || 0) + 1;
      }
    }

    // Prognosis: Each sprint awards at most 1 'V' per learning outcome covered by stories or already officially passed.
    for (const s of sprints) {
      const sprintAssessments = db.teacherAssessments.filter((a) => a.sprintId === s.id);

      if (s.status === "completed" || s.status === "archived") {
        for (const a of sprintAssessments) {
          if (a.assessment === "V" && a.learningOutcome >= 1 && a.learningOutcome <= 5) {
            projectedPasses[a.learningOutcome] = (projectedPasses[a.learningOutcome] || 0) + 1;
          }
        }
      } else {
        // Active or planned sprint:
        const officiallyPassedInSprint = new Set<number>();
        for (const a of sprintAssessments) {
          if (a.assessment === "V" && a.learningOutcome >= 1 && a.learningOutcome <= 5) {
            projectedPasses[a.learningOutcome] = (projectedPasses[a.learningOutcome] || 0) + 1;
            officiallyPassedInSprint.add(a.learningOutcome);
          }
        }

        // Stories in sprint define targeted LUs (at most 1 projected V per covered LU for this sprint)
        const sprintStories = db.stories.filter((st) => st.sprintId === s.id);
        const coveredLUs = new Set<number>();
        for (const st of sprintStories) {
          (st.learningOutcomes || []).forEach((lu) => {
            if (typeof lu === "number" && lu >= 1 && lu <= 5) {
              coveredLUs.add(lu);
            }
          });
        }

        for (const lu of coveredLUs) {
          const isAssessedO = sprintAssessments.some((a) => a.learningOutcome === lu && a.assessment === "O");
          if (!officiallyPassedInSprint.has(lu) && !isAssessedO) {
            projectedPasses[lu] = (projectedPasses[lu] || 0) + 1;
          }
        }
      }
    }

    let activeSprintWarnings = null;
    if (activeSprint) {
      const activeStories = db.stories.filter((st) => st.sprintId === activeSprint.id);
      const uniqueLUs = new Set<number>();
      activeStories.forEach((st) => {
        (st.learningOutcomes || []).forEach((lu) => uniqueLUs.add(lu));
      });

      activeSprintWarnings = {
        fewLearningOutcomes: uniqueLUs.size < 3,
        missingLU5: !uniqueLUs.has(5),
        uniqueLUsCount: uniqueLUs.size,
      };
    }

    const recentPeerHelp = [...db.peerHelp]
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
      .slice(0, 5);

    return {
      activeSprint,
      nextShowAndGrowDate,
      daysUntilShowAndGrow,
      officialPasses,
      projectedPasses,
      totalSprints: sprints.length,
      activeSprintWarnings,
      recentPeerHelp,
    };
  }

  // --- Export & Import ---

  exportSprintJson(sprintId: number): MinorSprintExportData {
    const full = this.getSprintFull(sprintId);
    if (!full) throw new Error("Sprint not found");

    const stories: MinorSprintExportStory[] = full.stories.map((st) => ({
      storyTypeCode: st.storyTypeCode,
      storyNumber: st.storyNumber,
      title: st.title,
      asA: st.asA,
      iWant: st.iWant,
      soThat: st.soThat,
      learningOutcomes: st.learningOutcomes,
      status: st.status,
      orderIndex: st.orderIndex,
      presentationData: st.presentationData,
      acceptanceCriteria: (st.criteria || [])
        .filter((c) => c.type === "acceptance")
        .map((c) => ({ text: c.text, isCompleted: c.isCompleted, indent: c.indent })),
      qualityCriteria: (st.criteria || [])
        .filter((c) => c.type === "quality")
        .map((c) => ({ text: c.text, isCompleted: c.isCompleted, indent: c.indent })),
      evidence: (st.evidence || []).map((e) => ({ type: e.type, title: e.title, url: e.url })),
    }));

    return {
      version: 1,
      sprintNumber: full.sprintNumber,
      name: full.name,
      startDate: full.startDate,
      endDate: full.endDate,
      durationDays: full.durationDays,
      showAndGrowDate: full.showAndGrowDate,
      extendedDays: full.extendedDays,
      extensionReason: full.extensionReason,
      status: full.status,
      stories,
      feedback: full.feedback.map((f) => ({
        date: f.date,
        fromWhom: f.fromWhom,
        feedback: f.feedback,
        action: f.action,
        orderIndex: f.orderIndex,
      })),
      selfEvaluations: full.selfEvaluations.map((se) => ({
        learningOutcome: se.learningOutcome,
        level: se.level,
        argumentation: se.argumentation,
      })),
      teacherAssessments: full.teacherAssessments.map((ta) => ({
        learningOutcome: ta.learningOutcome,
        assessment: ta.assessment,
        notes: ta.notes,
        evaluatedAt: ta.evaluatedAt,
      })),
      reflection: full.reflection
        ? {
            date: full.reflection.date,
            whatLearned: full.reflection.whatLearned,
            whatRetained: full.reflection.whatRetained,
            whatChange: full.reflection.whatChange,
          }
        : null,
    };
  }

  importSprint(rawData: any, targetSprintId?: number, options?: { overwrite?: boolean; customName?: string; customSprintNumber?: string }): MinorSprintFull {
    const data = rawData.sprint && typeof rawData.sprint === "object" ? rawData.sprint : rawData;
    const shouldOverwrite = Boolean(options?.overwrite ?? rawData.overwrite ?? data.overwrite);
    const customName = options?.customName || rawData.customName || data.name;
    const customNumber = options?.customSprintNumber || rawData.customSprintNumber || data.sprintNumber;

    let sprint: MinorSprint;
    if (targetSprintId) {
      const existing = this.getSprint(targetSprintId);
      if (!existing) throw new Error("Target sprint not found");
      sprint = existing;

      if (shouldOverwrite) {
        this.updateSprint(sprint.id, {
          sprintNumber: customNumber || sprint.sprintNumber,
          name: customName || sprint.name,
          startDate: data.startDate || sprint.startDate,
          endDate: data.endDate || sprint.endDate,
          durationDays: data.durationDays || sprint.durationDays,
          showAndGrowDate: data.showAndGrowDate || sprint.showAndGrowDate,
          extendedDays: data.extendedDays !== undefined ? data.extendedDays : sprint.extendedDays,
          extensionReason: data.extensionReason !== undefined ? data.extensionReason : sprint.extensionReason,
          status: data.status || sprint.status,
        });
        // Remove existing stories and feedback
        const db = this.getData();
        const storyIds = db.stories.filter((st) => st.sprintId === sprint.id).map((st) => st.id);
        db.stories = db.stories.filter((st) => st.sprintId !== sprint.id);
        db.criteria = db.criteria.filter((c) => !storyIds.includes(c.storyId));
        db.evidence = db.evidence.filter((e) => !storyIds.includes(e.storyId));
        db.feedbackEntries = db.feedbackEntries.filter((f) => f.sprintId !== sprint.id);
      }
    } else {
      sprint = this.createSprint({
        sprintNumber: customNumber,
        name: customName,
        startDate: data.startDate || formatDate(new Date()),
        endDate: data.endDate,
        durationDays: data.durationDays,
        showAndGrowDate: data.showAndGrowDate,
        status: data.status,
      });
    }

    // Add stories
    if (Array.isArray(data.stories)) {
      data.stories.forEach((st: any, idx: number) => {
        this.createStory({
          sprintId: sprint.id,
          storyTypeCode: st.storyTypeCode,
          storyNumber: st.storyNumber,
          title: st.title || `Story ${idx + 1}`,
          asA: st.asA,
          iWant: st.iWant,
          soThat: st.soThat,
          learningOutcomes: st.learningOutcomes,
          status: st.status,
          orderIndex: st.orderIndex ?? idx,
          presentationData: st.presentationData,
          acceptanceCriteria: st.acceptanceCriteria,
          qualityCriteria: st.qualityCriteria,
          evidence: st.evidence,
        });
      });
    }

    // Add feedback
    if (Array.isArray(data.feedback)) {
      data.feedback.forEach((f: any) => {
        this.createFeedback(sprint.id, f);
      });
    }

    // Evaluations
    if (Array.isArray(data.selfEvaluations)) {
      this.saveSelfEvaluations(sprint.id, data.selfEvaluations);
    }
    if (Array.isArray(data.teacherAssessments)) {
      this.saveTeacherAssessments(sprint.id, data.teacherAssessments);
    }
    if (data.reflection) {
      this.saveReflection(sprint.id, data.reflection);
    }

    return this.getSprintFull(sprint.id)!;
  }
}

export const db = new MinorDB();
