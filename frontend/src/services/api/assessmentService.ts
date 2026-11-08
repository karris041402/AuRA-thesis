import type { AssessmentProcessingJob, AssessmentSession, AssessmentSessionRecord } from '../../types/assessment.types'
import type { AssessmentLanguage, QuestionnaireQuestion } from '../../types/questionnaire.types'
import type { SessionMetadataUpdate } from '../../types/history.types'

const basePath = '/api/v1/assessments'

interface AssessmentApiRecord extends AssessmentSessionRecord {
  session: AssessmentSession
  questions: QuestionnaireQuestion[]
}

async function request(path = '', init: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(`${basePath}${path}`, {
      ...init,
      credentials: 'include',
      cache: 'no-store',
      headers: init.body
        ? { 'Content-Type': 'application/json', ...init.headers }
        : init.headers,
    })
  } catch {
    throw new Error('Could not connect to AuRA. Start the backend and try again.')
  }
}

async function readRecord(response: Response): Promise<AssessmentSessionRecord> {
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = body && typeof body === 'object' && 'error' in body ? body.error : null
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'AuRA could not save this assessment.'
    throw new Error(message)
  }
  if (!body || typeof body !== 'object' || !('session' in body) || !('questions' in body) ||
    !body.session || typeof body.session !== 'object' || !Array.isArray(body.questions))
    throw new Error('AuRA returned invalid assessment data. Please try again.')
  return body as AssessmentApiRecord
}

async function readSession(response: Response): Promise<AssessmentSession> {
  return (await readRecord(response)).session
}

async function readProcessingJob(response: Response): Promise<AssessmentProcessingJob> {
  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    const error = body && typeof body === 'object' && 'error' in body ? body.error : null
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'AuRA could not load processing status.'
    throw new Error(message)
  }
  if (!body || typeof body !== 'object' || !('status' in body) || !('stageIndex' in body) ||
    !('assessmentId' in body) || !('resultAvailable' in body) || !('result' in body) ||
    !('mode' in body) || body.mode !== 'model' ||
    (body.status !== 'running' && body.status !== 'failed' && body.status !== 'completed') ||
    typeof body.stageIndex !== 'number' || typeof body.resultAvailable !== 'boolean')
    throw new Error('AuRA returned invalid processing status.')
  if (body.result !== null) {
    if (!body.result || typeof body.result !== 'object') throw new Error('AuRA returned an invalid model result.')
    const result = body.result as Record<string, unknown>
    const probabilities = result.probabilities
    if (typeof result.assessmentId !== 'string' ||
      (result.category !== 'Low' && result.category !== 'Moderate' && result.category !== 'High') ||
      typeof result.modelVersion !== 'string' || typeof result.generatedAt !== 'string' ||
      ('explanation' in result && result.explanation !== null && typeof result.explanation !== 'string') ||
      ('recommendation' in result && result.recommendation !== null && typeof result.recommendation !== 'string') ||
      ('totalScore' in result && result.totalScore !== null && typeof result.totalScore !== 'number') ||
      ('maxScore' in result && result.maxScore !== null && typeof result.maxScore !== 'number') ||
      ('influenceMethod' in result && result.influenceMethod !== null && result.influenceMethod !== 'sometimes-one-at-a-time') ||
      !probabilities || typeof probabilities !== 'object')
      throw new Error('AuRA returned an invalid model result.')
    if ('indicatorResponses' in result && (!Array.isArray(result.indicatorResponses) ||
      result.indicatorResponses.some((item) => !item || typeof item !== 'object' ||
        typeof item.indicatorId !== 'string' || typeof item.indicatorLabel !== 'string' ||
        typeof item.selectedAnswer !== 'string' || typeof item.followUpQuestion !== 'string' ||
        typeof item.followUpAnswer !== 'string')))
      throw new Error('AuRA returned invalid parent response data.')
    if ('influentialIndicators' in result && (!Array.isArray(result.influentialIndicators) ||
      result.influentialIndicators.some((item) => !item || typeof item !== 'object' ||
        typeof item.indicatorId !== 'string' || typeof item.indicatorLabel !== 'string' ||
        typeof item.selectedAnswer !== 'string' || typeof item.supportChangePercentagePoints !== 'number' ||
        !Number.isFinite(item.supportChangePercentagePoints))))
      throw new Error('AuRA returned invalid indicator explanation data.')
    const values = ['Low', 'Moderate', 'High'].map((label) => (probabilities as Record<string, unknown>)[label])
    if (values.some((value) => typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) ||
      Math.abs((values as number[]).reduce((sum, value) => sum + value, 0) - 1) > 0.001)
      throw new Error('AuRA returned invalid model support values.')
  }
  if (body.resultAvailable !== (body.result !== null))
    throw new Error('AuRA returned inconsistent model-result status.')
  return body as AssessmentProcessingJob
}

async function write(path: string, method: 'POST' | 'PUT', body?: unknown): Promise<Response> {
  return request(path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

export const assessmentService = {
  async listSessions(): Promise<AssessmentSessionRecord[]> {
    const response = await request()
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) {
      const error = body && typeof body === 'object' && 'error' in body ? body.error : null
      const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'AuRA could not load saved assessments.'
      throw new Error(message)
    }
    if (!Array.isArray(body)) throw new Error('AuRA returned invalid assessment history.')
    return body as AssessmentSessionRecord[]
  },
  async createSession(language: AssessmentLanguage): Promise<AssessmentSessionRecord> {
    return readRecord(await write('', 'POST', {
      language,
      questionnaireVersion: 'revised-pilot-testing-2-v1',
    }))
  },
  async getSession(id: string): Promise<AssessmentSessionRecord> {
    return readRecord(await request(`/${id}`))
  },
  async updateSessionMetadata(id: string, metadata: SessionMetadataUpdate): Promise<AssessmentSessionRecord> {
    return readRecord(await request(`/${id}/metadata`, {
      method: 'PATCH',
      body: JSON.stringify(metadata),
    }))
  },
  async saveStructuredAnswer(session: AssessmentSession, optionId: string): Promise<AssessmentSession> {
    return readSession(await write(`/${session.id}/answers/q${session.currentQuestionIndex + 1}`, 'PUT', {
      selectedOptionId: optionId,
    }))
  },
  async saveFollowUp(session: AssessmentSession, text: string): Promise<AssessmentSession> {
    const currentAnswer = session.answers.find((answer) => answer.questionId === `q${session.currentQuestionIndex + 1}`)
    if (!currentAnswer) throw new Error('Choose an answer before sending your follow-up.')
    return readSession(await write(`/${session.id}/answers/q${session.currentQuestionIndex + 1}`, 'PUT', {
      selectedOptionId: currentAnswer.selectedOptionId,
      followUpText: text,
    }))
  },
  async submitAnswer(session: AssessmentSession, optionId: string, text: string): Promise<AssessmentSessionRecord> {
    return readRecord(await write(
      `/${session.id}/answers/q${session.currentQuestionIndex + 1}`,
      'PUT',
      { selectedOptionId: optionId, followUpText: text },
    ))
  },
  async nextQuestion(session: AssessmentSession): Promise<AssessmentSession> {
    return readSession(await write(`/${session.id}/advance`, 'POST'))
  },
  async startProcessing(id: string): Promise<AssessmentProcessingJob> {
    return readProcessingJob(await write(`/${id}/processing`, 'POST'))
  },
  async getProcessing(id: string): Promise<AssessmentProcessingJob> {
    return readProcessingJob(await request(`/${id}/processing`))
  },
  async retryProcessing(id: string): Promise<AssessmentProcessingJob> {
    return readProcessingJob(await write(`/${id}/processing/retry`, 'POST'))
  },
  async deleteSession(id: string): Promise<void> {
    const response = await request(`/${id}`, { method: 'DELETE' })
    if (response.ok) return
    const body: unknown = await response.json().catch(() => null)
    const error = body && typeof body === 'object' && 'error' in body ? body.error : null
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
      ? error.message
      : 'AuRA could not delete this assessment.'
    throw new Error(message)
  },
}
