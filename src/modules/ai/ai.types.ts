export interface IAIChatPayload {
  question: string;
  courseId?: string;
  lessonId?: string;
}

export interface IAIQuizPayload {
  lessonId: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionCount?: number;
}

export interface IAIQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface IAISummaryPayload {
  lessonId?: string;
  courseId?: string;
}

export interface IAISummaryResponse {
  summary: string;
  keyPoints: string[];
  learningObjectives: string[];
}

export interface ICourseRecommendation {
  courseId: string;
  title: string;
  slug: string;
  category: string;
  thumbnail: string;
  reason: string;
}
