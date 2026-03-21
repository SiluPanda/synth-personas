export interface PersonaDemographics {
  name: string
  age: number
  gender: string
  occupation: string
  education: 'none' | 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'phd'
  location: string
  language: string
  incomeBracket: 'low' | 'middle' | 'upper-middle' | 'high'
}

export interface PersonaPersonality {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number // all 0-1
}

export interface PersonaTechnical {
  literacy: number // 1-5
  digitalNative: boolean
  preferredDevices: string[]
  platformFamiliarity: 'basic' | 'intermediate' | 'advanced' | 'expert'
}

export interface PersonaCommunication {
  formality: number
  verbosity: number
  politeness: number
  directness: number
  vocabularyComplexity: number // all 1-5
  emojiUsage: 'none' | 'light' | 'heavy'
  typoRate: number // 0-1
  sentenceLength: 'short' | 'medium' | 'long'
}

export interface PersonaBehavior {
  patience: number
  detailOrientation: number
  followUpLikelihood: number
  complaintTendency: number // all 0-1
  escalationSpeed: number // 1-5
}

export interface PersonaContext {
  motivation: 'information-seeking' | 'task-completion' | 'exploration' | 'frustration'
  productFamiliarity: 'new' | 'returning' | 'expert'
  sessionContext: 'focused' | 'multitasking' | 'rushed'
}

export interface Persona {
  id: string
  seed: number
  demographics: PersonaDemographics
  personality: PersonaPersonality
  technical: PersonaTechnical
  communication: PersonaCommunication
  behavior: PersonaBehavior
  context: PersonaContext
  summary: string
}

export interface PersonaOptions {
  seed?: number
  locale?: string
}

export interface PersonaCriteria {
  age?: { min?: number; max?: number } | number
  gender?: string | string[]
  education?: string | string[]
  literacy?: { min?: number; max?: number } | number
  extraversion?: { min?: number; max?: number }
  [key: string]: unknown
}
