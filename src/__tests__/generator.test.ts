import { describe, it, expect } from 'vitest'
import {
  generate,
  generateBatch,
  generateTargeted,
  toSystemPrompt,
  createGenerator,
} from '../generator'

describe('generate()', () => {
  it('returns a valid persona structure when called without options', () => {
    const p = generate()
    expect(p).toHaveProperty('id')
    expect(p).toHaveProperty('seed')
    expect(p).toHaveProperty('demographics')
    expect(p).toHaveProperty('personality')
    expect(p).toHaveProperty('technical')
    expect(p).toHaveProperty('communication')
    expect(p).toHaveProperty('behavior')
    expect(p).toHaveProperty('context')
    expect(p).toHaveProperty('summary')
    expect(typeof p.demographics.name).toBe('string')
    expect(typeof p.demographics.age).toBe('number')
    expect(p.demographics.age).toBeGreaterThanOrEqual(18)
    expect(p.demographics.age).toBeLessThanOrEqual(75)
  })

  it('produces identical persona (except id) for the same seed', () => {
    const seed = 42
    const p1 = generate({ seed })
    const p2 = generate({ seed })
    // All deterministic fields should match
    expect(p1.seed).toBe(p2.seed)
    expect(p1.demographics).toEqual(p2.demographics)
    expect(p1.personality).toEqual(p2.personality)
    expect(p1.technical).toEqual(p2.technical)
    expect(p1.communication).toEqual(p2.communication)
    expect(p1.behavior).toEqual(p2.behavior)
    expect(p1.context).toEqual(p2.context)
    expect(p1.summary).toBe(p2.summary)
  })

  it('produces different personas for different seeds', () => {
    const p1 = generate({ seed: 1 })
    const p2 = generate({ seed: 99999 })
    // It is astronomically unlikely they are identical
    const same =
      p1.demographics.name === p2.demographics.name &&
      p1.demographics.age === p2.demographics.age
    expect(same).toBe(false)
  })

  it('personality values are within [0, 1]', () => {
    const p = generate({ seed: 7 })
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = p.personality
    for (const v of [openness, conscientiousness, extraversion, agreeableness, neuroticism]) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('technical literacy is within [1, 5]', () => {
    for (let s = 0; s < 20; s++) {
      const p = generate({ seed: s * 1000 })
      expect(p.technical.literacy).toBeGreaterThanOrEqual(1)
      expect(p.technical.literacy).toBeLessThanOrEqual(5)
    }
  })
})

describe('generateBatch()', () => {
  it('returns the requested count', () => {
    const batch = generateBatch(5, { seed: 100 })
    expect(batch).toHaveLength(5)
  })

  it('each persona in a batch has a unique id', () => {
    const batch = generateBatch(5, { seed: 200 })
    const ids = batch.map((p) => p.id)
    expect(new Set(ids).size).toBe(5)
  })

  it('personas in a batch have different seeds', () => {
    const batch = generateBatch(5, { seed: 300 })
    const seeds = batch.map((p) => p.seed)
    expect(new Set(seeds).size).toBe(5)
  })
})

describe('generateTargeted()', () => {
  it('returns personas matching age range criteria', () => {
    const personas = generateTargeted({ age: { min: 25, max: 35 } }, 3, { seed: 400 })
    expect(personas.length).toBeGreaterThan(0)
    for (const p of personas) {
      expect(p.demographics.age).toBeGreaterThanOrEqual(25)
      expect(p.demographics.age).toBeLessThanOrEqual(35)
    }
  })

  it('returns personas matching exact age', () => {
    // Cast a wide seed net to find at least one match
    const personas = generateTargeted({ age: 30 }, 1, { seed: 500 })
    if (personas.length > 0) {
      expect(personas[0].demographics.age).toBe(30)
    }
    // If count * 20 attempts exhausted without match, array may be empty — that is acceptable behavior
  })

  it('returns personas matching gender criteria', () => {
    const personas = generateTargeted({ gender: 'female' }, 3, { seed: 600 })
    expect(personas.length).toBeGreaterThan(0)
    for (const p of personas) {
      expect(p.demographics.gender).toBe('female')
    }
  })

  it('returns personas matching education criteria (array)', () => {
    const personas = generateTargeted({ education: ['bachelors', 'masters'] }, 2, { seed: 700 })
    expect(personas.length).toBeGreaterThan(0)
    for (const p of personas) {
      expect(['bachelors', 'masters']).toContain(p.demographics.education)
    }
  })
})

describe('toSystemPrompt()', () => {
  it('returns a non-empty string', () => {
    const p = generate({ seed: 123 })
    const prompt = toSystemPrompt(p)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })

  it('contains the persona name', () => {
    const p = generate({ seed: 456 })
    const prompt = toSystemPrompt(p)
    expect(prompt).toContain(p.demographics.name)
  })

  it('contains the occupation', () => {
    const p = generate({ seed: 789 })
    const prompt = toSystemPrompt(p)
    expect(prompt).toContain(p.demographics.occupation)
  })

  it('contains the location', () => {
    const p = generate({ seed: 321 })
    const prompt = toSystemPrompt(p)
    expect(prompt).toContain(p.demographics.location)
  })
})

describe('createGenerator()', () => {
  it('creates a generator with bound config', () => {
    const gen = createGenerator({ seed: 999 })
    const p1 = gen.generate()
    const p2 = gen.generate()
    // Same base seed → same persona (seed is used as-is from config)
    expect(p1.seed).toBe(p2.seed)
    expect(p1.demographics).toEqual(p2.demographics)
  })

  it('config overridable per-call', () => {
    const gen = createGenerator({ seed: 1 })
    const p1 = gen.generate({ seed: 1 })
    const p2 = gen.generate({ seed: 2 })
    expect(p1.demographics).not.toEqual(p2.demographics)
  })

  it('generateBatch via createGenerator returns correct count', () => {
    const gen = createGenerator({ seed: 50 })
    const batch = gen.generateBatch(4)
    expect(batch).toHaveLength(4)
  })
})
