// synth-personas - Generate diverse synthetic user personas for AI testing
export {
  generate,
  generateBatch,
  generateTargeted,
  toSystemPrompt,
  createGenerator,
} from './generator'

export type {
  Persona,
  PersonaOptions,
  PersonaCriteria,
  PersonaDemographics,
  PersonaPersonality,
  PersonaTechnical,
  PersonaCommunication,
  PersonaBehavior,
  PersonaContext,
} from './types'
