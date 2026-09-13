export interface StudyLevel { id: string; title: string; description: string; available: boolean }
export interface SubjectPreference {
  subjectId: string; subjectName: string; selectedLevel: string | null;
  courseId: string | null; levels: StudyLevel[];
}
export interface ChapterSummary { id: string; title: string }
export interface Lesson extends ChapterSummary {
  goal: string; concepts: string[]; example: { problem: string; steps: string[] };
  watchFor: string; questionCount: number;
}
export interface Question {
  id: string; concept: string; difficulty: string; prompt: string; options: string[];
  answer?: number; explanation?: string;
}
export interface AttemptSummary {
  id: string; testId: string; submittedAt: string; correct: number; total: number; percent: number;
}
export interface Attempt {
  id: string; testId: string; submittedAt: string | null; revision: number;
  answers: Record<string, number>; questions: Question[];
  correct?: number; total?: number; percent?: number;
}
export interface Progress { read: string[]; history: AttemptSummary[]; finalUnlocked: boolean }
export interface Course { id: string; title: string; chapters: ChapterSummary[]; progress: Progress }
export interface Test { testId: string; title: string; questionCount: number; attempt: Attempt | null; history: AttemptSummary[] }
