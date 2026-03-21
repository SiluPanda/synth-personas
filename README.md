# synth-personas

Generate diverse, deterministic synthetic user personas for AI testing, simulation, and UX research.

Each persona carries correlated traits across demographics, Big Five personality, technical literacy, communication style, behavior, and session context — all derived from a single seed for full reproducibility.

## Install

```bash
npm install synth-personas
```

## Quick Start

### generate()

Generate a single random persona:

```typescript
import { generate } from 'synth-personas'

const persona = generate()
console.log(persona.summary)
// "Sarah Johnson, 34-year-old Designer from London, UK. Balanced communicator. Tech literacy: 3/5."
```

### Seeding for determinism

Pass a seed to get the exact same persona every time:

```typescript
const persona = generate({ seed: 42 })
// Always produces the same persona for seed 42
```

### generateBatch()

Generate multiple personas at once:

```typescript
import { generateBatch } from 'synth-personas'

const personas = generateBatch(10, { seed: 100 })
// Returns 10 distinct personas with seeds 100, 101, ..., 109
```

### generateTargeted()

Generate personas matching specific criteria:

```typescript
import { generateTargeted } from 'synth-personas'

// Young adults with a bachelor's degree
const personas = generateTargeted(
  { age: { min: 22, max: 30 }, education: 'bachelors' },
  5,
  { seed: 200 }
)

// Specific gender
const female = generateTargeted({ gender: 'female' }, 3)
```

Supported criteria fields: `age` (exact number or `{ min, max }`), `gender` (string or array), `education` (string or array).

### toSystemPrompt()

Convert a persona into an LLM system prompt:

```typescript
import { generate, toSystemPrompt } from 'synth-personas'

const persona = generate({ seed: 42 })
const systemPrompt = toSystemPrompt(persona)
// "You are Sarah Johnson, a 34-year-old Designer from London, UK.
//  Your communication style is neutral, moderate, and courteous.
//  Tech literacy: 3/5. Currently task completion."
```

### createGenerator()

Create a reusable generator with shared config:

```typescript
import { createGenerator } from 'synth-personas'

const gen = createGenerator({ seed: 1 })
const persona = gen.generate()
const batch = gen.generateBatch(5)
const targeted = gen.generateTargeted({ age: { min: 25, max: 40 } }, 3)
const prompt = gen.toSystemPrompt(persona)
```

## Persona Structure

```typescript
interface Persona {
  id: string                  // UUID (unique per call, not seeded)
  seed: number
  demographics: {
    name: string; age: number; gender: string; occupation: string
    education: 'none' | 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'phd'
    location: string; language: string
    incomeBracket: 'low' | 'middle' | 'upper-middle' | 'high'
  }
  personality: {              // Big Five, all 0-1
    openness; conscientiousness; extraversion; agreeableness; neuroticism
  }
  technical: {
    literacy: 1 | 2 | 3 | 4 | 5
    digitalNative: boolean
    preferredDevices: string[]
    platformFamiliarity: 'basic' | 'intermediate' | 'advanced' | 'expert'
  }
  communication: {            // formality/verbosity/etc: 1-5
    formality; verbosity; politeness; directness; vocabularyComplexity
    emojiUsage: 'none' | 'light' | 'heavy'
    typoRate: number          // 0-1
    sentenceLength: 'short' | 'medium' | 'long'
  }
  behavior: {                 // patience/detailOrientation/etc: 0-1
    patience; detailOrientation; followUpLikelihood; complaintTendency
    escalationSpeed: number   // 1-5
  }
  context: {
    motivation: 'information-seeking' | 'task-completion' | 'exploration' | 'frustration'
    productFamiliarity: 'new' | 'returning' | 'expert'
    sessionContext: 'focused' | 'multitasking' | 'rushed'
  }
  summary: string
}
```

## License

MIT
