import type { AssessmentLanguage, QuestionnaireQuestion } from './questionnaire.types'

export interface AssessmentAnswer {
  questionId: string
  selectedOptionId: string
  structuredScore: number
  followUpText: string
  answeredAt: string
}

export interface AssessmentSession {
  language: AssessmentLanguage
  id: string
  questionnaireVersion: string
  status: 'in-progress' | 'awaiting-content' | 'completed'
  currentQuestionIndex: number
  answers: AssessmentAnswer[]
  startedAt: string
  completedAt: string | null
  isDemoPreview?: boolean
  customTitle?: string | null
  isPinned?: boolean
  isArchived?: boolean
  featureVector?: number[] | null
}

export interface AssessmentIndicatorResponse {
  indicatorId: string
  indicatorLabel: string
  selectedAnswer: string
  followUpQuestion: string
  followUpAnswer: string
}

export interface AssessmentResult {
  assessmentId: string
  category: 'Low' | 'Moderate' | 'High'
  modelVersion: string
  probabilities: Record<'Low' | 'Moderate' | 'High', number>
  generatedAt: string
  explanation?: string | null
  recommendation?: string | null
  influentialIndicators?: Array<{
    indicatorId: string
    indicatorLabel: string
    selectedAnswer: string
    supportChangePercentagePoints: number
  }>
  influenceMethod?: 'sometimes-one-at-a-time' | null
  indicatorResponses?: AssessmentIndicatorResponse[]
  totalScore?: number | null
  maxScore?: number | null
}

export interface AssessmentProcessingJob {
  id: string
  assessmentId: string
  mode: 'model'
  status: 'running' | 'failed' | 'completed'
  stageId: string | null
  stageIndex: number
  totalStages: number
  attempt: number
  startedAt: string
  updatedAt: string
  completedAt: string | null
  failureCode: string | null
  resultAvailable: boolean
  result: AssessmentResult | null
}

export type AssessmentStage =
  | 'question'
  | 'follow-up'
  | 'ready-next'
  | 'awaiting-content'
  | 'completed'

export interface AssessmentProcessingStep {
  id: string
  label: string
  description: string
}

export interface AssessmentSessionRecord {
  session: AssessmentSession
  questions: QuestionnaireQuestion[]
  processingJob?: AssessmentProcessingJob | null
}
