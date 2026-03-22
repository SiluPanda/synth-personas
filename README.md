# synth-personas

Deterministic synthetic user persona generator for AI testing, simulation, and UX research.

[![npm version](https://img.shields.io/npm/v/synth-personas.svg)](https://www.npmjs.com/package/synth-personas)
[![license](https://img.shields.io/npm/l/synth-personas.svg)](https://github.com/SiluPanda/synth-personas/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/synth-personas.svg)](https://www.npmjs.com/package/synth-personas)
[![types](https://img.shields.io/npm/types/synth-personas.svg)](https://www.npmjs.com/package/synth-personas)

---

## Description

`synth-personas` generates diverse, internally consistent synthetic user personas from a single numeric seed. Each persona carries correlated traits across six dimensions -- demographics, Big Five personality, technical literacy, communication style, behavioral patterns, and session context -- all produced deterministically with zero runtime dependencies and no network access.

The package solves a specific problem in AI testing: test engineers write inputs from their own perspective -- technically literate, grammatically correct, concise. Real users are far more varied. A 68-year-old retiree writes differently from a 23-year-old software engineer. A frustrated customer communicates differently from someone casually exploring. `synth-personas` generates the full spectrum of user profiles so your AI system can be tested against realistic diversity.

Key properties:

- **Deterministic**: Same seed always produces the same persona. Reproducible across runs, machines, and CI pipelines.
- **Correlated traits**: Age influences technical literacy, personality drives communication style, education shapes vocabulary. No incoherent combinations like a 19-year-old PhD holder.
- **Zero dependencies**: Pure TypeScript. No LLM calls, no API keys, no external data files.
- **Millisecond generation**: Suitable for CI pipelines, batch test generation, and interactive development.

---

## Installation

```bash
npm install synth-personas
```

Requires Node.js >= 18.

---

## Quick Start

Generate a single persona:

```typescript
import { generate } from 'synth-personas'

const persona = generate()
console.log(persona.summary)
// "Sarah Johnson, 34-year-old Designer from London, UK. Balanced communicator. Tech literacy: 3/5."
```

Generate with a fixed seed for reproducibility:

```typescript
const persona = generate({ seed: 42 })
// Always returns the same persona for seed 42
```

Generate a batch of diverse personas:

```typescript
import { generateBatch } from 'synth-personas'

const personas = generateBatch(10, { seed: 100 })
// Returns 10 distinct personas with seeds 100..109
```

Generate personas matching specific criteria:

```typescript
import { generateTargeted } from 'synth-personas'

const young = generateTargeted(
  { age: { min: 22, max: 30 }, education: 'bachelors' },
  5,
  { seed: 200 }
)
```

Convert a persona to an LLM system prompt:

```typescript
import { generate, toSystemPrompt } from 'synth-personas'

const persona = generate({ seed: 42 })
const prompt = toSystemPrompt(persona)
// "You are Sarah Johnson, a 34-year-old Designer from London, UK.
//  Your communication style is neutral, moderate, and courteous.
//  Tech literacy: 3/5. Currently task completion."
```

---

## Features

- **Single persona generation** with optional seed for deterministic output
- **Batch generation** producing multiple unique personas from a single base seed
- **Targeted generation** with criteria-based filtering on age, gender, and education
- **System prompt conversion** turning any persona into a ready-to-use LLM role-play prompt
- **Factory pattern** via `createGenerator()` for reusable configuration across calls
- **Big Five personality model** (OCEAN) with Gaussian distributions and trait correlations
- **Communication style modeling** covering formality, verbosity, politeness, directness, vocabulary complexity, emoji usage, typo rate, and sentence length
- **Behavioral modeling** including patience, detail orientation, follow-up likelihood, complaint tendency, and escalation speed
- **Session context** capturing motivation, product familiarity, and session state
- **Seedable PRNG** (Mulberry32) ensuring full reproducibility without external state

---

## API Reference

### `generate(options?): Persona`

Generates a single persona. If no seed is provided, a random seed is selected.

```typescript
import { generate } from 'synth-personas'

const persona = generate()              // random seed
const persona = generate({ seed: 42 })  // deterministic
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `options` | `PersonaOptions` | Optional. Configuration for generation. |

**Returns**: A `Persona` object with all trait dimensions populated.

---

### `generateBatch(count, options?): Persona[]`

Generates multiple personas. Each persona receives a sequential seed derived from the base seed (`baseSeed + 0`, `baseSeed + 1`, ..., `baseSeed + count - 1`).

```typescript
import { generateBatch } from 'synth-personas'

const personas = generateBatch(10, { seed: 100 })
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `count` | `number` | Number of personas to generate. |
| `options` | `PersonaOptions` | Optional. Configuration applied to all personas in the batch. |

**Returns**: An array of `Persona` objects with length equal to `count`.

---

### `generateTargeted(criteria, count?, options?): Persona[]`

Generates personas matching specific criteria. Internally generates candidates and filters them against the criteria, retrying up to `count * 20` attempts.

```typescript
import { generateTargeted } from 'synth-personas'

// Age range
const seniors = generateTargeted({ age: { min: 60, max: 75 } }, 5, { seed: 300 })

// Exact age
const thirty = generateTargeted({ age: 30 }, 1, { seed: 400 })

// Gender filter (string or array)
const female = generateTargeted({ gender: 'female' }, 3)

// Education filter (string or array)
const grads = generateTargeted({ education: ['bachelors', 'masters'] }, 5)

// Combined criteria
const targeted = generateTargeted(
  { age: { min: 25, max: 40 }, gender: 'male', education: 'masters' },
  3,
  { seed: 500 }
)
```

**Parameters**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `criteria` | `PersonaCriteria` | -- | Filtering criteria (see below). |
| `count` | `number` | `1` | Number of matching personas to return. |
| `options` | `PersonaOptions` | -- | Optional. Configuration for generation. |

**Returns**: An array of `Persona` objects matching the criteria. The array may contain fewer than `count` elements if not enough matches are found within the retry budget.

---

### `toSystemPrompt(persona): string`

Converts a persona into a natural language system prompt suitable for instructing an LLM to role-play as that persona.

The prompt includes the persona's name, age, occupation, location, communication style descriptors (formal/casual/neutral, verbose/concise/moderate, polite/direct/courteous), technical literacy, current motivation, and personality-driven behavioral notes.

```typescript
import { generate, toSystemPrompt } from 'synth-personas'

const persona = generate({ seed: 42 })
const prompt = toSystemPrompt(persona)
```

**Parameters**

| Name | Type | Description |
|------|------|-------------|
| `persona` | `Persona` | A persona object to convert. |

**Returns**: A string containing the system prompt.

---

### `createGenerator(config?): PersonaGenerator`

Creates a reusable generator instance with shared configuration. All methods on the returned object accept optional overrides that are merged with the factory-level config.

```typescript
import { createGenerator } from 'synth-personas'

const gen = createGenerator({ seed: 1 })

const persona = gen.generate()                    // uses seed 1
const other = gen.generate({ seed: 99 })          // overrides to seed 99
const batch = gen.generateBatch(5)                // 5 personas from seed 1..5
const targeted = gen.generateTargeted(
  { age: { min: 25, max: 40 } },
  3
)
const prompt = gen.toSystemPrompt(persona)
```

**Returns**: An object with the following methods:

| Method | Signature |
|--------|-----------|
| `generate` | `(opts?: PersonaOptions) => Persona` |
| `generateBatch` | `(count: number, opts?: PersonaOptions) => Persona[]` |
| `generateTargeted` | `(criteria: PersonaCriteria, count?: number, opts?: PersonaOptions) => Persona[]` |
| `toSystemPrompt` | `(persona: Persona) => string` |
| `config` | The resolved configuration object (read-only). |

---

## Configuration

### `PersonaOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `seed` | `number` | Random | PRNG seed for deterministic generation. |
| `locale` | `string` | -- | Reserved for future locale-based name/location selection. |

### `PersonaCriteria`

Criteria for targeted generation. All fields are optional.

| Property | Type | Description |
|----------|------|-------------|
| `age` | `number \| { min?: number; max?: number }` | Exact age or age range. |
| `gender` | `string \| string[]` | One or more gender values to match. |
| `education` | `string \| string[]` | One or more education levels to match. |
| `literacy` | `number \| { min?: number; max?: number }` | Technical literacy value or range (1--5). |
| `extraversion` | `{ min?: number; max?: number }` | Extraversion range (0--1). |
| `[key: string]` | `unknown` | Additional criteria fields (extensible). |

---

## Persona Structure

Every generated persona conforms to the `Persona` interface:

```typescript
interface Persona {
  id: string                     // UUID, unique per call
  seed: number                   // PRNG seed used for this persona

  demographics: {
    name: string                 // Full name
    age: number                  // 18--75
    gender: string               // "male" | "female" | "non-binary" | "prefer not to say"
    occupation: string           // From built-in occupation table
    education: string            // "none" | "high-school" | "some-college" | "bachelors" | "masters" | "phd"
    location: string             // City and country
    language: string             // Primary language code
    incomeBracket: string        // "low" | "middle" | "upper-middle" | "high"
  }

  personality: {                 // Big Five (OCEAN), all 0--1
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }

  technical: {
    literacy: number             // 1--5
    digitalNative: boolean
    preferredDevices: string[]   // e.g. ["smartphone", "laptop"]
    platformFamiliarity: string  // "basic" | "intermediate" | "advanced" | "expert"
  }

  communication: {
    formality: number            // 1--5
    verbosity: number            // 1--5
    politeness: number           // 1--5
    directness: number           // 1--5
    vocabularyComplexity: number // 1--5
    emojiUsage: string           // "none" | "light" | "heavy"
    typoRate: number             // 0--1
    sentenceLength: string       // "short" | "medium" | "long"
  }

  behavior: {
    patience: number             // 0--1
    detailOrientation: number    // 0--1
    followUpLikelihood: number   // 0--1
    complaintTendency: number    // 0--1
    escalationSpeed: number      // 1--5
  }

  context: {
    motivation: string           // "information-seeking" | "task-completion" | "exploration" | "frustration"
    productFamiliarity: string   // "new" | "returning" | "expert"
    sessionContext: string       // "focused" | "multitasking" | "rushed"
  }

  summary: string                // Human-readable one-line description
}
```

### Trait Correlations

Traits are not generated independently. The engine enforces statistical coherence:

| Source Trait | Target Trait | Effect |
|-------------|-------------|--------|
| Age (high) | Technical literacy | Decreases |
| Age (low, < 35) | Digital native | More likely `true` |
| Education (higher) | Technical literacy | Increases |
| Extraversion | Verbosity | Proportional (1 + extraversion * 4) |
| Agreeableness | Politeness | Proportional (1 + agreeableness * 4) |
| Agreeableness (inverse) | Directness | Inversely proportional |
| Openness | Vocabulary complexity | Proportional |
| Neuroticism | Escalation speed | Proportional |
| Agreeableness | Complaint tendency | Decreases |
| Age (< 22) | Education | Capped at "some-college" |

---

## Error Handling

### Targeted generation exhaustion

`generateTargeted()` retries up to `count * 20` attempts to find matching personas. If the criteria are too restrictive, the returned array may contain fewer elements than requested. Always check the length of the returned array:

```typescript
const results = generateTargeted({ age: 99 }, 5, { seed: 0 })
if (results.length < 5) {
  console.warn(`Only found ${results.length} matching personas`)
}
```

### Contradictory criteria

Criteria that are statistically unlikely (e.g., `age: 20` combined with `education: 'phd'`) will rarely produce matches. The generator does not throw -- it returns whatever matches it finds within the retry budget.

### Seed overflow

Seeds are 32-bit unsigned integers. The generator uses `Math.floor(Math.random() * 2 ** 32)` for random seeds. Providing seeds outside this range may produce unexpected but non-throwing behavior.

---

## Advanced Usage

### Reproducible test suites

Pin seeds in your test configuration to produce identical persona sets across runs:

```typescript
import { generateBatch, toSystemPrompt } from 'synth-personas'

const TEST_SEED = 20240101
const personas = generateBatch(50, { seed: TEST_SEED })

for (const persona of personas) {
  const prompt = toSystemPrompt(persona)
  // Feed prompt to your LLM under test
  // Assert on response quality per persona profile
}
```

### Bias and fairness testing

Generate controlled persona sets that differ along a single dimension:

```typescript
import { generateTargeted, toSystemPrompt } from 'synth-personas'

const male = generateTargeted({ gender: 'male', age: { min: 30, max: 40 } }, 10, { seed: 1 })
const female = generateTargeted({ gender: 'female', age: { min: 30, max: 40 } }, 10, { seed: 1 })

// Compare LLM responses across gender while holding other traits roughly constant
for (let i = 0; i < male.length; i++) {
  const malePrompt = toSystemPrompt(male[i])
  const femalePrompt = toSystemPrompt(female[i])
  // ... send same query through both persona prompts, compare responses
}
```

### Combining with evaluation frameworks

Use generated personas as metadata in eval datasets:

```typescript
import { generate, toSystemPrompt } from 'synth-personas'

function buildEvalCase(seed: number, question: string) {
  const persona = generate({ seed })
  return {
    input: question,
    systemPrompt: toSystemPrompt(persona),
    metadata: {
      personaSeed: persona.seed,
      age: persona.demographics.age,
      techLiteracy: persona.technical.literacy,
      communicationStyle: persona.communication.formality,
    },
  }
}
```

### Factory pattern for shared configuration

When generating across multiple call sites with the same base configuration:

```typescript
import { createGenerator } from 'synth-personas'

const gen = createGenerator({ seed: 42 })

// All calls share the base seed
const singlePersona = gen.generate()
const batch = gen.generateBatch(20)
const targeted = gen.generateTargeted({ education: 'phd' }, 5)
```

---

## TypeScript

`synth-personas` is written in TypeScript and ships type declarations alongside the compiled JavaScript. All public interfaces are exported:

```typescript
import type {
  Persona,
  PersonaOptions,
  PersonaCriteria,
  PersonaDemographics,
  PersonaPersonality,
  PersonaTechnical,
  PersonaCommunication,
  PersonaBehavior,
  PersonaContext,
} from 'synth-personas'
```

The package targets ES2022 and uses CommonJS module format. Type declarations (`.d.ts`) and source maps are included in the published `dist/` directory.

---

## License

MIT
