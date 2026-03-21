import { mulberry32, pick, randInt, randFloat, randGaussian } from './prng'
import { FIRST_NAMES_EN, LAST_NAMES_EN, OCCUPATIONS, LOCATIONS_EN, DEVICES } from './data'
import type {
  Persona,
  PersonaOptions,
  PersonaCriteria,
  PersonaDemographics,
  PersonaTechnical,
  PersonaContext,
} from './types'
import { randomUUID } from 'crypto'

export function generate(options?: PersonaOptions): Persona {
  const seed = options?.seed ?? Math.floor(Math.random() * 2 ** 32)
  const rng = mulberry32(seed)

  // DEMOGRAPHICS — anchor traits first
  const age = randInt(18, 75, rng)
  const gender = pick(['male', 'female', 'non-binary', 'prefer not to say'], rng)
  const firstName = pick(FIRST_NAMES_EN, rng)
  const lastName = pick(LAST_NAMES_EN, rng)

  // Education correlates with age
  const eduRoll = rng()
  const education = (
    age < 22
      ? 'some-college'
      : eduRoll < 0.15
      ? 'phd'
      : eduRoll < 0.35
      ? 'masters'
      : eduRoll < 0.6
      ? 'bachelors'
      : eduRoll < 0.8
      ? 'some-college'
      : 'high-school'
  ) as PersonaDemographics['education']

  const occupation = pick(OCCUPATIONS, rng)
  const location = pick(LOCATIONS_EN, rng)

  const incomeRoll = rng()
  const incomeBracket = (
    incomeRoll < 0.25
      ? 'low'
      : incomeRoll < 0.55
      ? 'middle'
      : incomeRoll < 0.8
      ? 'upper-middle'
      : 'high'
  ) as PersonaDemographics['incomeBracket']

  // PERSONALITY — Big Five
  const openness = randGaussian(0.5, 0.2, rng)
  const conscientiousness = randGaussian(0.5, 0.2, rng)
  const extraversion = randGaussian(0.5, 0.2, rng)
  const agreeableness = randGaussian(0.6, 0.15, rng) // slightly positive skew
  const neuroticism = randGaussian(0.4, 0.2, rng)

  // TECHNICAL — correlates with age + education
  const ageBonus = Math.max(0, 1 - (age - 30) / 40)
  const eduBonus = ['phd', 'masters', 'bachelors'].includes(education) ? 0.2 : 0
  const rawLiteracy = randFloat(1, 5, rng, 0) + ageBonus + eduBonus
  const literacy = Math.min(5, Math.max(1, Math.round(rawLiteracy))) as 1 | 2 | 3 | 4 | 5
  const digitalNative = age < 35 ? rng() < 0.8 : rng() < 0.3
  const numDevices = randInt(1, 3, rng)
  const preferredDevices = [
    'smartphone',
    ...DEVICES.filter((d) => d !== 'smartphone').slice(0, numDevices - 1),
  ]
  const platformFamiliarity = (
    literacy <= 2
      ? 'basic'
      : literacy === 3
      ? 'intermediate'
      : literacy === 4
      ? 'advanced'
      : 'expert'
  ) as PersonaTechnical['platformFamiliarity']

  // COMMUNICATION — correlates with personality traits
  const formality = Math.round(randFloat(1, 5, rng, 0))
  const verbosity = Math.round(1 + extraversion * 4)
  const politeness = Math.round(1 + agreeableness * 4)
  const directness = Math.round(1 + (1 - agreeableness) * 4)
  const vocabularyComplexity = Math.round(1 + openness * 4)
  const emojiUsage = pick(
    ['none', 'none', 'light', 'light', 'heavy'],
    rng,
  ) as 'none' | 'light' | 'heavy'
  const typoRate = Math.max(0, randFloat(0, 0.3, rng) - literacy * 0.04)
  const sentenceLength = (
    verbosity <= 2 ? 'short' : verbosity <= 3 ? 'medium' : 'long'
  ) as 'short' | 'medium' | 'long'

  // BEHAVIOR
  const patience = randFloat(0, 1, rng)
  const detailOrientation = randFloat(0, 1, rng)
  const followUpLikelihood = randFloat(0, 1, rng)
  const complaintTendency = Math.max(0, randFloat(0, 0.8, rng) - agreeableness * 0.3)
  const escalationSpeed = Math.round(1 + neuroticism * 4)

  // CONTEXT
  const motivation = pick(
    ['information-seeking', 'task-completion', 'exploration', 'frustration'],
    rng,
  ) as PersonaContext['motivation']
  const productFamiliarity = pick(
    ['new', 'returning', 'expert'],
    rng,
  ) as PersonaContext['productFamiliarity']
  const sessionContext = pick(
    ['focused', 'multitasking', 'rushed'],
    rng,
  ) as PersonaContext['sessionContext']

  const summary =
    `${firstName} ${lastName}, ${age}-year-old ${occupation} from ${location}. ` +
    (extraversion > 0.6
      ? 'Outgoing and communicative.'
      : extraversion < 0.4
      ? 'Reserved and thoughtful.'
      : 'Balanced communicator.') +
    ` Tech literacy: ${literacy}/5.`

  return {
    id: randomUUID(),
    seed,
    demographics: {
      name: `${firstName} ${lastName}`,
      age,
      gender,
      occupation,
      education,
      location,
      language: 'en',
      incomeBracket,
    },
    personality: { openness, conscientiousness, extraversion, agreeableness, neuroticism },
    technical: { literacy, digitalNative, preferredDevices, platformFamiliarity },
    communication: {
      formality,
      verbosity,
      politeness,
      directness,
      vocabularyComplexity,
      emojiUsage,
      typoRate,
      sentenceLength,
    },
    behavior: { patience, detailOrientation, followUpLikelihood, complaintTendency, escalationSpeed },
    context: { motivation, productFamiliarity, sessionContext },
    summary,
  }
}

export function generateBatch(count: number, options?: PersonaOptions): Persona[] {
  const baseSeed = options?.seed ?? Math.floor(Math.random() * 2 ** 32)
  return Array.from({ length: count }, (_, i) => generate({ ...options, seed: baseSeed + i }))
}

export function generateTargeted(
  criteria: PersonaCriteria,
  count = 1,
  options?: PersonaOptions,
): Persona[] {
  const results: Persona[] = []
  let attempts = 0
  const baseSeed = options?.seed ?? Math.floor(Math.random() * 2 ** 32)
  while (results.length < count && attempts < count * 20) {
    const p = generate({ ...options, seed: baseSeed + attempts })
    if (matchesCriteria(p, criteria)) results.push(p)
    attempts++
  }
  return results
}

function matchesCriteria(persona: Persona, criteria: PersonaCriteria): boolean {
  if (criteria.age !== undefined) {
    if (typeof criteria.age === 'number' && persona.demographics.age !== criteria.age) return false
    if (typeof criteria.age === 'object') {
      if (criteria.age.min !== undefined && persona.demographics.age < criteria.age.min) return false
      if (criteria.age.max !== undefined && persona.demographics.age > criteria.age.max) return false
    }
  }
  if (criteria.gender && ![criteria.gender].flat().includes(persona.demographics.gender))
    return false
  if (criteria.education && ![criteria.education].flat().includes(persona.demographics.education))
    return false
  return true
}

export function toSystemPrompt(persona: Persona): string {
  const { demographics: d, personality: p, communication: c, technical: t, context: ctx } = persona
  return (
    `You are ${d.name}, a ${d.age}-year-old ${d.occupation} from ${d.location}. ` +
    `Your communication style is ${c.formality >= 4 ? 'formal' : c.formality <= 2 ? 'casual' : 'neutral'}, ` +
    `${c.verbosity >= 4 ? 'verbose' : c.verbosity <= 2 ? 'concise' : 'moderate'}, and ` +
    `${c.politeness >= 4 ? 'very polite' : c.politeness <= 2 ? 'direct' : 'courteous'}. ` +
    `Tech literacy: ${t.literacy}/5. Currently ${ctx.motivation.replace('-', ' ')}. ` +
    `${p.neuroticism > 0.6 ? 'You tend to be anxious and reactive.' : p.extraversion > 0.7 ? 'You are energetic and expressive.' : ''}`
  )
}

export function createGenerator(config?: PersonaOptions) {
  return {
    generate: (opts?: PersonaOptions) => generate({ ...config, ...opts }),
    generateBatch: (count: number, opts?: PersonaOptions) =>
      generateBatch(count, { ...config, ...opts }),
    generateTargeted: (criteria: PersonaCriteria, count?: number, opts?: PersonaOptions) =>
      generateTargeted(criteria, count, { ...config, ...opts }),
    toSystemPrompt,
    config: config ?? {},
  }
}
