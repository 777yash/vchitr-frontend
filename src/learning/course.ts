export interface StudyLevel { id: string; title: string; description: string; available: boolean }
export interface SubjectPreference {
  subjectId: string; subjectName: string; selectedLevel: string | null;
  courseId: string | null; levels: StudyLevel[];
  course?: Course | null;
}
export interface ChapterSummary { id: string; title: string }
export interface Lesson extends ChapterSummary {
  goal: string; concepts: string[]; example: { problem: string; steps: string[] };
  watchFor: string; questionCount: number; adaptiveAvailable?: boolean;
}
export interface Question {
  id: string; concept: string; difficulty: string; prompt: string; options: string[];
  answer?: number; explanation?: string;
}
export interface AttemptSummary {
  id: string; testId: string; submittedAt: string; correct: number; total: number; percent: number;
  kind?: 'chapter' | 'adaptive' | 'final'; selection?: Selection;
}
export interface Attempt {
  id: string; testId: string; submittedAt: string | null; revision: number;
  answers: Record<string, number>; questions: Question[];
  correct?: number; total?: number; percent?: number;
  kind?: 'chapter' | 'adaptive' | 'final'; selection?: Selection; insights?: Insights;
}
export interface Progress { read: string[]; history: AttemptSummary[]; finalUnlocked: boolean }
export interface Course { id: string; title: string; chapters: ChapterSummary[]; progress: Progress }
export interface Test { testId: string; title: string; questionCount: number; attempt: Attempt | null; history: AttemptSummary[]; kind?: string; insights?: Insights; adaptiveAvailable?: boolean }
export interface Selection { focusConcepts: string[]; difficultyMix: Record<string, number>; mode: 'fresh' | 'revision'; freshCount: number; repeatedQuestionIds: string[] }
export interface ConceptInsight {
  id: string; title: string; explanation: string; example: { problem: string; steps: string[] };
  commonMistake: string; checklist: string[]; evidenceCount: number; correct: number; percent: number | null;
  priority: number; status: 'insufficient' | 'revise' | 'practise' | 'positive'; nextDifficulty: string;
}
export interface Insights { chapterId: string; concepts: ConceptInsight[] }
