# synth-personas -- Specification

## 1. Overview

`synth-personas` is a deterministic synthetic user persona generator for AI testing. It creates coherent, diverse user personas -- complete with demographics, personality traits, communication styles, behavioral patterns, and technical profiles -- using statistical distributions and trait correlation rules, without calling any LLM. Each generated persona is internally consistent: a 72-year-old retired librarian does not communicate like a 23-year-old software engineer, and the generator enforces these coherence constraints algorithmically. The package produces both structured `Persona` objects for programmatic use and LLM system prompt snippets for role-playing evaluation scenarios.

The gap this package fills is specific and well-defined. AI applications need testing with diverse user populations -- different ages, technical literacy levels, communication styles, cultural backgrounds, patience thresholds, and accessibility needs. But test engineers overwhelmingly write test inputs from their own perspective: technically literate, grammatically correct, concise, English-native. The result is that chatbots, AI assistants, and LLM-powered products are tested against a narrow, developer-biased slice of the user population. When a 68-year-old user writes a paragraph-long, meandering question with uncertain punctuation, or when a frustrated customer types an all-caps complaint with spelling errors, or when a non-native English speaker uses formal but awkward phrasing -- the system encounters input it was never tested against, and failures emerge in production.

In the Python ecosystem, tools exist for generating synthetic personas. Tencent's Persona Hub uses LLM inference to generate persona descriptions, but it is Python-only, requires API keys, and produces unstructured text rather than typed objects with discrete trait values. Google's Synthetic-Persona-Chat is a research dataset and toolkit for generating persona-grounded conversations, but it is also Python-only, requires model inference, and targets dialogue research rather than practical testing workflows. In the JavaScript/TypeScript ecosystem, faker.js generates random demographic data -- names, addresses, phone numbers, email addresses -- but treats each field as an independent random variable. A faker-generated "person" might be a 19-year-old with the occupation "Chief Executive Officer" and the company "Retirement Living Associates." There is no coherence, no personality model, no communication style, and no way to use the generated identity as a testing persona. No JavaScript/TypeScript tool generates internally consistent user personas with correlated traits, communication style parameters, and behavioral patterns suitable for AI testing.

`synth-personas` fills this gap. Given a count and optional constraints, it generates personas where every trait is statistically consistent with every other trait. The trait correlation engine ensures that age influences technical literacy, occupation correlates with education and vocabulary, personality traits (Big Five OCEAN model) drive communication style, and context (motivation, frustration level, product familiarity) shapes behavioral patterns. The generation is entirely deterministic: the same configuration and seed always produce the same personas. No API keys, no model inference, no network access. It runs in milliseconds, making it suitable for CI pipelines, batch test generation, and interactive development.

Beyond generating persona objects, `synth-personas` produces two derived outputs that make personas immediately useful. First, it generates LLM system prompt snippets that describe the persona in natural language, suitable for instructing an LLM to role-play as that persona during evaluation. Second, it generates heuristic messages -- text that reflects the persona's communication style (formality, verbosity, typo rate, emoji usage) on a given topic -- without requiring LLM inference. These heuristic messages are not fluent natural language; they are structured approximations that test whether a system handles diverse communication styles. For higher-quality persona-driven messages, the system prompt snippet can be fed to an LLM.

`synth-personas` provides both a TypeScript/JavaScript API for programmatic use and a CLI for terminal and shell-script use. The API returns typed `Persona` objects with full trait data. The CLI prints personas as JSON, JSONL, or CSV and generates system prompts to stdout. Both interfaces support seeded generation, constraint-based filtering, diversity optimization, and batch output.

---

## 2. Goals and Non-Goals

### Goals

- Provide a `generate(options?)` function that returns a single random `Persona` with all trait dimensions populated and internally consistent.
- Provide a `generateBatch(count, options?)` function that returns an array of `Persona` objects optimized for diversity across all trait dimensions.
- Provide a `generateTargeted(criteria, count?)` function that returns personas matching specific demographic, personality, or behavioral criteria while remaining internally coherent.
- Provide a `generateMessage(persona, topic, options?)` function that produces a heuristic text message reflecting the persona's communication style (formality, verbosity, typo rate, emoji usage, vocabulary complexity) on a given topic.
- Provide a `generateConversation(persona, turns, options?)` function that produces a multi-turn `Message[]` array simulating the persona's conversational behavior over time (follow-up likelihood, patience degradation, detail escalation).
- Provide a `toSystemPrompt(persona, options?)` function that converts a persona into a natural language system prompt for LLM role-playing.
- Provide a `createGenerator(config)` factory that returns a configured `PersonaGenerator` instance with reusable settings for repeated generation.
- Implement a trait correlation engine that enforces statistical consistency across trait dimensions: age correlates with technical literacy, occupation correlates with education, personality traits (Big Five) correlate with communication style, and all correlations are configurable.
- Generate personas deterministically: the same configuration and random seed always produce the same personas. Use a seeded PRNG for all randomized operations.
- Support five generation strategies: **random** (single persona with correlation constraints), **diverse set** (batch optimized for maximum trait spread), **targeted** (matching user-specified criteria), **cluster-based** (representing distinct user segments), and **from distribution** (matching real-world demographic statistics).
- Provide diversity metrics for generated persona sets: dimensional coverage, demographic spread, communication style variety, and uniqueness scores.
- Provide a CLI (`synth-personas`) that generates personas and outputs them as JSON, JSONL, or CSV, and generates system prompts to stdout.
- Ship complete TypeScript type definitions. All public types are exported. All configuration objects are fully typed.
- Keep runtime dependencies at zero. All generation uses built-in data tables, statistical distributions, and string manipulation. No NLP models, no network access, no external data files.

### Non-Goals

- **Not an LLM-based persona generator.** This package does not call any LLM to generate persona descriptions, names, or messages. All generation is rule-based and deterministic. Rule-based generation produces predictable, auditable, reproducible personas at the cost of naturalness. For LLM-generated personas with higher narrative quality, use the `toSystemPrompt()` output to instruct an LLM.
- **Not a faker.js replacement.** This package does not generate random addresses, phone numbers, credit card numbers, or other structured fake data. It generates coherent user personas with personality and behavioral traits. For structured fake data, use faker.js. The two are complementary: faker.js can fill in surface details (email address, mailing address) for a persona generated by `synth-personas`.
- **Not a dialogue system.** The `generateMessage()` and `generateConversation()` functions produce heuristic text that reflects persona communication style. They do not produce fluent, contextually appropriate natural language conversation. They produce approximations useful for testing message handling, not for simulating realistic human dialogue. For realistic dialogue, use `toSystemPrompt()` with an LLM.
- **Not a demographic research tool.** The built-in demographic distributions, correlation weights, and trait ranges are approximations designed for testing diversity, not for producing statistically accurate representations of real populations. The distributions are configurable so users can supply their own data.
- **Not a psychological assessment tool.** Big Five personality scores and communication style parameters are simplified models used for generating diverse test personas, not clinical or psychometric instruments. The trait names and scales are borrowed from personality psychology for familiarity, but the implementation does not claim psychological validity.
- **Not a bias detection framework.** While generated personas can be used to test for bias in AI systems (e.g., does the system respond differently to personas of different demographics?), `synth-personas` does not measure, score, or report bias. It generates the diverse test inputs; bias analysis is performed by evaluation tools like `eval-dataset`, `output-grade`, or `llm-regression`.

---

## 3. Target Users and Use Cases

### Eval Engineers Testing for User Diversity

Engineers who maintain evaluation datasets for LLM-powered products. Their hand-written test cases use developer-style language: concise, grammatically correct, technically precise. They need test inputs that represent the full spectrum of real users -- elderly non-technical users, frustrated customers, non-native speakers, verbose explainers, terse minimalists. They use `synth-personas` to generate 50 diverse personas, then use `generateMessage(persona, topic)` to produce 50 stylistically varied versions of the same question. These persona-driven inputs expose failures that developer-written tests miss: the chatbot that mishandles all-caps input, the search feature that fails on misspelled queries, the assistant that gives overly technical answers to non-technical users.

### Chatbot Stress Testing Teams

Teams that test conversational AI systems under diverse user conditions. A chatbot must handle a patient, detail-oriented user who asks follow-up questions as well as an impatient user who expects immediate answers. They generate persona sets with targeted behavioral extremes -- patience level 1 (very impatient) to 5 (very patient), verbosity level 1 (terse) to 5 (verbose) -- and use `generateConversation()` to simulate multi-turn interactions. Each persona's conversation exhibits different patterns: the impatient user escalates quickly, the detail-oriented user asks clarifying questions, the casual user uses slang and emoji.

### UX Researchers Simulating User Segments

Researchers who need synthetic user profiles representing distinct market segments. They use `generateTargeted()` with criteria like `{ age: { min: 55, max: 80 }, technicalLiteracy: { max: 2 } }` to generate a cohort of older, less technical users, and separately generate a cohort of young, technically savvy users. They compare how an AI product's language, complexity, and interaction patterns serve each segment. The system prompt snippets allow them to have an LLM role-play as each persona, generating realistic test conversations for UX review.

### Bias Detection and Fairness Testing

Engineers who test whether AI systems exhibit differential behavior across demographic groups. They generate persona sets that are identical in every dimension except one (e.g., same age, education, communication style, but different gender or ethnicity), then send the same query through each persona's communication style. Differences in system response quality, tone, or correctness across the controlled dimension indicate potential bias. The deterministic generation and explicit trait control make this analysis reproducible and auditable.

### Accessibility Testing Engineers

Engineers who test AI products for accessibility across varying technical abilities and communication needs. They generate personas with low technical literacy, high typo rates (simulating motor impairment or screen reader usage), extreme verbosity (simulating cognitive processing differences), and specific device preferences (mobile-only, screen reader). The generated messages reflect these accessibility-relevant communication patterns, testing whether the AI system degrades gracefully or fails.

### Teams Integrating with the npm-master Ecosystem

Developers using `eval-dataset` for dataset management, `fewshot-gen` for test case variation, and `llm-regression` for regression testing. `synth-personas` sits upstream: it generates the user personas that drive test input generation. A persona can be passed to `fewshot-gen` seeds to style the variations, fed into `eval-dataset` as metadata on test cases, or used with `llm-regression` to test whether a prompt update disproportionately degrades performance for specific user profiles.

---

## 4. Core Concepts

### Persona

A persona is a coherent synthetic user profile with correlated traits across multiple dimensions. It is not a random bag of independent attributes -- it is a simulated individual where demographics, personality, communication style, and behavioral patterns are statistically consistent with each other. A persona answers the question: "What kind of person is sending this message to the AI system?"

Every persona contains trait values across six dimensions:

1. **Demographics**: age, gender, name, occupation, education level, location, primary language, income bracket.
2. **Personality**: Big Five (OCEAN) scores -- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism -- each on a 0-1 continuous scale.
3. **Technical profile**: technical literacy (1-5), digital native (boolean), preferred devices, platform familiarity.
4. **Communication style**: formality (1-5), verbosity (1-5), emoji usage (none/light/heavy), typo rate (0-1), politeness (1-5), directness (1-5), vocabulary complexity (1-5), sentence length tendency (short/medium/long).
5. **Behavioral traits**: patience (1-5), detail orientation (1-5), follow-up likelihood (0-1), complaint tendency (0-1), escalation speed (1-5).
6. **Context**: motivation (information-seeking/task-completion/exploration/frustration), product familiarity (new/returning/expert), session context (first-contact/mid-conversation/returning-after-absence).

### Trait Coherence

Trait coherence is the constraint that persona attributes must be statistically plausible when considered together. The trait correlation engine enforces coherence during generation. Without coherence, a generated persona might be a 16-year-old with a PhD, a "software architect" with technical literacy 1, or a person with Extraversion 0.1 (extremely introverted) and verbosity 5 (extremely talkative). These combinations are not impossible but are statistically implausible, and generating them systematically would produce unrealistic test data.

Coherence is enforced through pairwise trait correlations: weighted conditional distributions that influence one trait based on another's value. Correlations are directional (age influences technical literacy, not the reverse) and configurable (users can adjust or override correlation weights).

### Trait Correlation Engine

The trait correlation engine is the core algorithmic component. It generates trait values in dependency order, where each trait's distribution is conditioned on previously generated traits. The engine operates in three phases:

1. **Anchor traits**: Generate independent traits that serve as anchors for dependent traits. Age and base personality (Big Five) are anchor traits because they influence many other dimensions but are not themselves conditioned on other traits in the generation model.
2. **Dependent traits**: Generate traits whose distributions are conditioned on anchor traits. Technical literacy is conditioned on age and occupation. Communication style is conditioned on personality and education. Behavioral traits are conditioned on personality and context.
3. **Derived traits**: Compute traits that are deterministic functions of other traits. The `digitalNative` boolean is derived from age (born after ~1990). Vocabulary complexity is derived from education level and formality. System prompt text is derived from all traits.

### Distribution

A distribution defines the probability of each value a trait can take. Distributions are the building blocks of the correlation engine. Every trait has a base distribution (the unconditioned probability) and zero or more conditional adjustments (how the distribution shifts when another trait has a specific value).

Distribution types used:

- **Categorical**: A set of discrete values with weights. `occupation` has a categorical distribution over a list of occupations.
- **Discrete uniform**: Equal probability across a range of integers. Used as the base for 1-5 scale traits before conditioning.
- **Gaussian (discretized)**: A normal distribution discretized to integer values. Age uses a Gaussian centered on 38 with standard deviation 15, clamped to 18-90.
- **Weighted random**: A general-purpose distribution where each value has an explicit weight. Weights are normalized to probabilities at selection time.

### Communication Style

Communication style is the set of parameters that determine how a persona expresses themselves in text. It is the bridge between the abstract persona (demographics, personality) and the concrete output (generated messages). Communication style encompasses:

- **Formality** (1-5): 1 = very casual ("hey whats up"), 5 = very formal ("I would like to respectfully inquire").
- **Verbosity** (1-5): 1 = terse ("ETA?"), 5 = verbose (three paragraphs for a simple question).
- **Emoji usage** (none/light/heavy): none = no emoji ever, light = occasional emoji, heavy = emoji in every sentence.
- **Typo rate** (0-1): Probability of introducing a typo per word. 0.0 = perfect spelling, 0.15 = frequent typos.
- **Politeness** (1-5): 1 = blunt/rude ("Fix this now"), 5 = extremely polite ("I'm so sorry to bother you, but if it's not too much trouble...").
- **Directness** (1-5): 1 = indirect/circumlocutory ("I was wondering if perhaps there might be a way to..."), 5 = direct ("How do I reset my password?").
- **Vocabulary complexity** (1-5): 1 = simple words ("big", "good", "bad"), 5 = sophisticated vocabulary ("substantial", "exemplary", "detrimental").
- **Sentence length tendency** (short/medium/long): Affects the average sentence length in generated messages.

### System Prompt Snippet

A system prompt snippet is a natural language paragraph that describes the persona's identity, communication style, and behavioral tendencies in a format suitable for use as an LLM system prompt. When an LLM is instructed with this prompt, it role-plays as the described persona, producing messages that reflect the persona's traits.

Example system prompt snippet for a generated persona:

```
You are Margaret Chen, a 67-year-old retired high school English teacher from Portland, Oregon.
You have a bachelor's degree in Education and are not very comfortable with technology. You
communicate in a formal, polite style with complete sentences and proper grammar. You tend to
be verbose, providing context and background before asking your question. You never use emoji
or internet slang. You are patient and willing to follow instructions step by step, but you
sometimes struggle with technical terminology and need things explained in plain language. You
are contacting customer support because you cannot figure out how to change your password on
the new website redesign. You are slightly frustrated but remain courteous.
```

### Diversity Optimization

Diversity optimization ensures that a batch of generated personas covers the trait space broadly rather than clustering around the statistical center. Without optimization, random generation produces personas that are mostly middle-aged, middle-income, moderately technical, moderately formal -- because these are the modes of the base distributions. Diversity optimization uses a max-min distance algorithm: after generating an initial batch, it iteratively replaces the persona closest to any other persona (in multi-dimensional trait space) with a new random persona, until the minimum pairwise distance across all personas exceeds a threshold or a maximum iteration count is reached.

---

## 5. Persona Schema

### Complete Persona Object

```typescript
interface Persona {
  /** Unique identifier for this persona. Auto-generated UUID. */
  id: string;

  /** The PRNG seed that produced this persona. For reproducibility. */
  seed: number;

  // ── Demographics ────────────────────────────────────────────────

  demographics: {
    /** Full name. Generated from locale-appropriate name lists. */
    name: string;

    /** Age in years. Range: 18-90. */
    age: number;

    /** Gender identity. */
    gender: 'male' | 'female' | 'non-binary';

    /** Current or most recent occupation. */
    occupation: string;

    /** Highest education level completed. */
    education: 'none' | 'high-school' | 'some-college' | 'bachelors' | 'masters' | 'doctorate';

    /** Geographic location (city, region, or country). */
    location: string;

    /** Primary language. */
    language: string;

    /** Approximate income bracket. */
    incomeBracket: 'low' | 'middle' | 'upper-middle' | 'high';
  };

  // ── Personality (Big Five / OCEAN) ──────────────────────────────

  personality: {
    /** Openness to experience. 0 = closed/conventional, 1 = open/curious. */
    openness: number;

    /** Conscientiousness. 0 = spontaneous/careless, 1 = organized/disciplined. */
    conscientiousness: number;

    /** Extraversion. 0 = introverted/reserved, 1 = extraverted/outgoing. */
    extraversion: number;

    /** Agreeableness. 0 = competitive/challenging, 1 = cooperative/trusting. */
    agreeableness: number;

    /** Neuroticism. 0 = emotionally stable/calm, 1 = emotionally reactive/anxious. */
    neuroticism: number;
  };

  // ── Technical Profile ──────────────────────────────────────────

  technical: {
    /** Technical literacy. 1 = novice, 5 = expert. */
    literacy: 1 | 2 | 3 | 4 | 5;

    /** Born after ~1990; grew up with digital technology. */
    digitalNative: boolean;

    /** Primary devices used. */
    preferredDevices: Array<'desktop' | 'laptop' | 'tablet' | 'smartphone'>;

    /** Familiarity with the specific platform/product. */
    platformFamiliarity: 'none' | 'basic' | 'intermediate' | 'advanced';
  };

  // ── Communication Style ────────────────────────────────────────

  communication: {
    /** Formality level. 1 = very casual, 5 = very formal. */
    formality: 1 | 2 | 3 | 4 | 5;

    /** Verbosity level. 1 = terse, 5 = very verbose. */
    verbosity: 1 | 2 | 3 | 4 | 5;

    /** Emoji usage frequency. */
    emojiUsage: 'none' | 'light' | 'heavy';

    /** Probability of a typo per word. 0.0 = perfect, up to ~0.2. */
    typoRate: number;

    /** Politeness level. 1 = blunt, 5 = extremely polite. */
    politeness: 1 | 2 | 3 | 4 | 5;

    /** Directness level. 1 = very indirect, 5 = very direct. */
    directness: 1 | 2 | 3 | 4 | 5;

    /** Vocabulary complexity. 1 = simple, 5 = sophisticated. */
    vocabularyComplexity: 1 | 2 | 3 | 4 | 5;

    /** Typical sentence length. */
    sentenceLength: 'short' | 'medium' | 'long';
  };

  // ── Behavioral Traits ──────────────────────────────────────────

  behavior: {
    /** Patience level. 1 = very impatient, 5 = very patient. */
    patience: 1 | 2 | 3 | 4 | 5;

    /** Detail orientation. 1 = vague, 5 = extremely detailed. */
    detailOrientation: 1 | 2 | 3 | 4 | 5;

    /** Probability of sending a follow-up message. 0.0 = never, 1.0 = always. */
    followUpLikelihood: number;

    /** Tendency to complain. 0.0 = never complains, 1.0 = always complains. */
    complaintTendency: number;

    /** How quickly frustration escalates. 1 = slow, 5 = fast. */
    escalationSpeed: 1 | 2 | 3 | 4 | 5;
  };

  // ── Context ────────────────────────────────────────────────────

  context: {
    /** Why the persona is interacting with the AI system. */
    motivation: 'information-seeking' | 'task-completion' | 'exploration' | 'frustration';

    /** Familiarity with the product. */
    productFamiliarity: 'new' | 'returning' | 'expert';

    /** Session context. */
    sessionContext: 'first-contact' | 'mid-conversation' | 'returning-after-absence';
  };

  // ── Derived ────────────────────────────────────────────────────

  /** Natural language system prompt for LLM role-playing as this persona. */
  systemPrompt: string;

  /** Short one-line summary of the persona. */
  summary: string;
}
```

### Trait Value Ranges

| Dimension | Trait | Type | Range / Values | Default Distribution |
|---|---|---|---|---|
| Demographics | age | number | 18-90 | Gaussian(38, 15), clamped |
| Demographics | gender | enum | male, female, non-binary | 48%, 48%, 4% |
| Demographics | education | enum | 6 levels | Weighted by age/occupation |
| Demographics | incomeBracket | enum | 4 levels | Weighted by education/occupation |
| Personality | openness | number | 0.0-1.0 | Gaussian(0.5, 0.2), clamped |
| Personality | conscientiousness | number | 0.0-1.0 | Gaussian(0.5, 0.2), clamped |
| Personality | extraversion | number | 0.0-1.0 | Gaussian(0.5, 0.2), clamped |
| Personality | agreeableness | number | 0.0-1.0 | Gaussian(0.5, 0.2), clamped |
| Personality | neuroticism | number | 0.0-1.0 | Gaussian(0.5, 0.2), clamped |
| Technical | literacy | integer | 1-5 | Conditioned on age, occupation |
| Technical | digitalNative | boolean | true/false | Derived: age < 36 |
| Communication | formality | integer | 1-5 | Conditioned on education, age, personality |
| Communication | verbosity | integer | 1-5 | Conditioned on extraversion, personality |
| Communication | emojiUsage | enum | none, light, heavy | Conditioned on age, formality |
| Communication | typoRate | number | 0.0-0.2 | Conditioned on education, age, device |
| Communication | politeness | integer | 1-5 | Conditioned on agreeableness, culture |
| Communication | directness | integer | 1-5 | Conditioned on extraversion, culture |
| Communication | vocabularyComplexity | integer | 1-5 | Conditioned on education, occupation |
| Behavior | patience | integer | 1-5 | Conditioned on neuroticism, context |
| Behavior | followUpLikelihood | number | 0.0-1.0 | Conditioned on conscientiousness, patience |
| Behavior | complaintTendency | number | 0.0-1.0 | Conditioned on neuroticism, agreeableness |
| Behavior | escalationSpeed | integer | 1-5 | Conditioned on neuroticism, patience |

---

## 6. Trait Correlation Engine

### Overview

The trait correlation engine generates trait values in dependency order, where each trait's probability distribution is conditioned on previously generated traits. This produces personas that are internally consistent without requiring LLM inference.

The engine models correlations as conditional distribution adjustments. When generating trait B conditioned on trait A, the engine takes B's base distribution and applies a shift proportional to A's value and the A-to-B correlation weight. The correlation weight is a signed number between -1.0 and 1.0: positive means A and B tend to move together, negative means they tend to move oppositely, and 0 means they are independent.

### Generation Order

Traits are generated in a fixed dependency order. Traits earlier in the order influence traits later in the order. The order is:

1. **Age** (anchor -- unconditioned)
2. **Gender** (anchor -- unconditioned)
3. **Personality: Big Five scores** (anchor -- unconditioned, drawn from independent Gaussians)
4. **Occupation** (conditioned on age, education tendencies)
5. **Education** (conditioned on age, occupation)
6. **Income bracket** (conditioned on education, occupation, age)
7. **Location** (conditioned on occupation, income)
8. **Language** (conditioned on location)
9. **Name** (conditioned on gender, language/location)
10. **Technical literacy** (conditioned on age, occupation, education)
11. **Digital native** (derived from age)
12. **Preferred devices** (conditioned on age, technical literacy)
13. **Platform familiarity** (conditioned on technical literacy, context)
14. **Formality** (conditioned on education, age, extraversion)
15. **Verbosity** (conditioned on extraversion, openness)
16. **Emoji usage** (conditioned on age, formality)
17. **Typo rate** (conditioned on education, age, preferred devices)
18. **Politeness** (conditioned on agreeableness, age, culture)
19. **Directness** (conditioned on extraversion, culture)
20. **Vocabulary complexity** (conditioned on education, occupation, formality)
21. **Sentence length** (conditioned on verbosity, formality)
22. **Patience** (conditioned on neuroticism, context motivation)
23. **Detail orientation** (conditioned on conscientiousness, openness)
24. **Follow-up likelihood** (conditioned on conscientiousness, patience)
25. **Complaint tendency** (conditioned on neuroticism, agreeableness)
26. **Escalation speed** (conditioned on neuroticism, patience)
27. **Context fields** (motivation, product familiarity, session context -- configurable or random)
28. **System prompt** (derived from all traits)
29. **Summary** (derived from key traits)

### Correlation Matrix

The correlation matrix defines pairwise influence weights between traits. Each entry `correlation[A][B]` is a weight in the range [-1.0, 1.0] that determines how much trait A shifts trait B's distribution.

**Key correlations (representative subset)**:

| Source Trait | Target Trait | Weight | Rationale |
|---|---|---|---|
| age (high) | technical literacy | -0.4 | Older users tend toward lower technical literacy |
| age (low, <30) | emoji usage | +0.5 | Younger users more likely to use emoji |
| age (high) | formality | +0.3 | Older users tend toward more formal communication |
| age (high) | patience | +0.2 | Older users tend to be slightly more patient |
| education (high) | vocabulary complexity | +0.6 | Higher education correlates with richer vocabulary |
| education (high) | typo rate | -0.3 | Higher education correlates with fewer typos |
| education (high) | formality | +0.3 | Higher education correlates with more formal style |
| occupation (technical) | technical literacy | +0.7 | Technical occupations strongly predict technical literacy |
| occupation (technical) | directness | +0.3 | Technical professionals tend to be more direct |
| extraversion (high) | verbosity | +0.5 | Extraverts tend to be more verbose |
| extraversion (high) | emoji usage | +0.3 | Extraverts use more emoji |
| extraversion (low) | formality | +0.2 | Introverts tend toward slightly more formal writing |
| agreeableness (high) | politeness | +0.6 | Agreeable people are more polite |
| agreeableness (high) | complaint tendency | -0.4 | Agreeable people complain less |
| agreeableness (low) | directness | +0.3 | Less agreeable people are more blunt |
| neuroticism (high) | patience | -0.5 | Neurotic individuals are less patient |
| neuroticism (high) | complaint tendency | +0.4 | Neurotic individuals complain more |
| neuroticism (high) | escalation speed | +0.5 | Neurotic individuals escalate faster |
| conscientiousness (high) | detail orientation | +0.6 | Conscientious people are more detail-oriented |
| conscientiousness (high) | follow-up likelihood | +0.4 | Conscientious people are more likely to follow up |
| openness (high) | vocabulary complexity | +0.3 | Open individuals tend toward richer vocabulary |
| openness (high) | verbosity | +0.2 | Open individuals tend toward slightly more verbose expression |
| context: frustration | patience | -0.6 | Frustrated users arrive with less patience |
| context: frustration | complaint tendency | +0.5 | Frustrated users are more likely to complain |
| smartphone (primary device) | typo rate | +0.2 | Mobile typing produces more typos |
| smartphone (primary device) | sentence length | -0.3 | Mobile users tend toward shorter messages |

### Conditional Distribution Algorithm

For a target trait T with base distribution D_base and conditioning traits C_1, C_2, ..., C_n with correlation weights w_1, w_2, ..., w_n:

1. Compute the combined shift: `shift = sum(w_i * normalize(C_i))`, where `normalize(C_i)` maps the conditioning trait's value to the range [-1, 1] (0.0 maps to -1, 0.5 maps to 0, 1.0 maps to +1 for continuous traits; enum values map to predefined positions).
2. Adjust the base distribution's center: for Gaussian distributions, shift the mean by `shift * range / 2`. For categorical distributions, multiply each category's weight by `exp(shift * category_position)` and renormalize.
3. Sample from the adjusted distribution using the seeded PRNG.
4. Clamp the result to the trait's valid range.

### Custom Correlations

Users can override or extend the default correlation matrix:

```typescript
const generator = createGenerator({
  correlations: {
    // Override: make age-to-technical-literacy correlation stronger
    'age->technical.literacy': -0.7,

    // Override: remove the education-to-formality correlation
    'demographics.education->communication.formality': 0,

    // Add custom: income correlates with device preference
    'demographics.incomeBracket->technical.preferredDevices': 0.4,
  },
});
```

Correlation keys use the format `source.path->target.path` where paths reference trait fields using dot notation relative to the Persona object.

### Occupation Table

The occupation table defines a set of occupations with associated trait influence profiles. Each occupation entry specifies the occupation name, typical education range, income range, and technical literacy adjustment.

**Representative occupation entries (the full table contains approximately 60 occupations)**:

| Occupation | Education Range | Income Tendency | Tech Literacy Adjustment |
|---|---|---|---|
| Software engineer | bachelors-masters | upper-middle | +2 |
| Teacher | bachelors-masters | middle | 0 |
| Nurse | bachelors | middle | 0 |
| Retired | varies | varies | -1 |
| Student | some-college | low | +1 |
| Accountant | bachelors | middle-upper-middle | +1 |
| Construction worker | high-school | middle | -1 |
| Doctor | doctorate | high | +1 |
| Retail worker | high-school-some-college | low-middle | -1 |
| Lawyer | doctorate | high | 0 |
| Graphic designer | bachelors | middle | +1 |
| Truck driver | high-school | middle | -1 |
| Freelance writer | bachelors | low-middle | 0 |
| Data scientist | masters-doctorate | upper-middle-high | +2 |
| Chef | high-school-some-college | middle | -1 |
| Social worker | bachelors-masters | low-middle | 0 |
| Marketing manager | bachelors | upper-middle | +1 |
| Electrician | high-school-some-college | middle | 0 |
| Librarian | masters | middle | +1 |
| Stay-at-home parent | varies | varies | 0 |

### Name Generation

Names are generated from built-in first-name and last-name lists, conditioned on gender and locale. The name lists contain approximately 200 first names per gender (male, female, gender-neutral) and 200 last names spanning multiple cultural backgrounds (English, Spanish, Chinese, Indian, Arabic, Japanese, Korean, German, French, African). The locale configuration determines the weighting of cultural name pools.

---

## 7. Generation Strategies

### 7.1 Random Generation

The simplest strategy. Generate a single persona by sampling all traits in dependency order, applying the correlation engine at each step.

**Algorithm**:
1. Initialize the PRNG with the configured seed.
2. Sample anchor traits (age, gender, Big Five) from their base distributions.
3. Sample each dependent trait in order, conditioning on previously generated values.
4. Compute derived traits (digitalNative, systemPrompt, summary).
5. Return the `Persona` object.

**When to use**: Quick one-off persona generation, exploring the trait space, generating a single persona for a targeted test.

```typescript
import { generate } from 'synth-personas';

const persona = generate();
console.log(persona.summary);
// "Margaret Chen, 67, retired teacher, formal and verbose communicator"
```

### 7.2 Diverse Set Generation

Generate N personas optimized for maximum diversity across all trait dimensions. This strategy ensures the generated set covers the full trait space rather than clustering around distribution modes.

**Algorithm**:
1. Generate `N * oversampling_factor` (default: 3x) candidate personas using random generation with sequential PRNG seeds.
2. Compute pairwise distances between all candidates in multi-dimensional trait space. Distance is computed as a weighted Euclidean distance across normalized trait values, where each trait dimension is weighted by its configured importance.
3. Initialize the selected set with the candidate that is furthest from the centroid of all candidates (the most "unusual" persona).
4. Iteratively add the candidate that maximizes the minimum distance to any already-selected persona (max-min diversity selection).
5. Continue until N personas are selected.

**Trait distance computation**: Each trait is normalized to [0, 1] before distance computation. Continuous traits (personality scores, rates) are used directly. Integer scale traits (1-5) are normalized by dividing by 5. Categorical traits are encoded as one-hot vectors. The distance between two personas is: `sqrt(sum(weight_i * (trait_i_a - trait_i_b)^2))`.

**When to use**: Generating a representative test population, creating evaluation datasets that cover diverse user types, batch testing across user segments.

```typescript
import { generateBatch } from 'synth-personas';

const personas = generateBatch(50, { seed: 42 });
// 50 personas with maximized diversity across all trait dimensions
```

### 7.3 Targeted Generation

Generate personas matching specific criteria while remaining internally coherent. The user specifies constraints on one or more traits, and the generator produces personas that satisfy those constraints while allowing unconstrained traits to vary naturally (subject to correlation rules).

**Algorithm**:
1. Parse criteria into trait constraints: exact values, ranges, or sets.
2. For each persona to generate, sample traits in dependency order. When reaching a constrained trait, draw from the constrained range or set instead of the base (conditioned) distribution. When reaching an unconstrained trait that depends on a constrained trait, apply correlations normally -- the constraint on the upstream trait propagates naturally through the correlation engine.
3. Validate that the generated persona satisfies all criteria. If not (due to conflicting constraints), retry with a different PRNG draw, up to a maximum retry count.
4. If the criteria are fundamentally contradictory (e.g., `age: 20, education: 'doctorate'`), the generator succeeds but emits a warning that the persona has unusual trait combinations.

**Criteria syntax**:

```typescript
interface PersonaCriteria {
  demographics?: {
    age?: number | { min?: number; max?: number };
    gender?: 'male' | 'female' | 'non-binary';
    occupation?: string | string[];
    education?: Education | Education[];
    location?: string;
    language?: string;
    incomeBracket?: IncomeBracket | IncomeBracket[];
  };
  personality?: {
    openness?: number | { min?: number; max?: number };
    conscientiousness?: number | { min?: number; max?: number };
    extraversion?: number | { min?: number; max?: number };
    agreeableness?: number | { min?: number; max?: number };
    neuroticism?: number | { min?: number; max?: number };
  };
  technical?: {
    literacy?: number | { min?: number; max?: number };
    digitalNative?: boolean;
  };
  communication?: {
    formality?: number | { min?: number; max?: number };
    verbosity?: number | { min?: number; max?: number };
    emojiUsage?: EmojiUsage | EmojiUsage[];
    politeness?: number | { min?: number; max?: number };
    directness?: number | { min?: number; max?: number };
  };
  behavior?: {
    patience?: number | { min?: number; max?: number };
    detailOrientation?: number | { min?: number; max?: number };
  };
  context?: {
    motivation?: Motivation | Motivation[];
    productFamiliarity?: ProductFamiliarity | ProductFamiliarity[];
  };
}
```

**When to use**: Generating specific user segments for targeted testing ("elderly non-technical users", "frustrated expert users", "formal high-education users").

```typescript
import { generateTargeted } from 'synth-personas';

const elderlyPersonas = generateTargeted(
  {
    demographics: { age: { min: 65, max: 85 } },
    technical: { literacy: { max: 2 } },
  },
  10,
);
// 10 personas aged 65-85 with low technical literacy, other traits correlated naturally
```

### 7.4 Cluster-Based Generation

Generate personas representing distinct user segments. The user specifies cluster definitions (named groups with criteria), and the generator produces a balanced set with personas from each cluster.

**Algorithm**:
1. Parse cluster definitions: each cluster has a name, criteria, and count (or weight).
2. For each cluster, generate the specified number of personas using targeted generation with the cluster's criteria.
3. Within each cluster, apply diversity optimization to ensure within-cluster variety (avoid generating 10 identical elderly personas).
4. Return the full persona array with each persona tagged with its cluster name.

**When to use**: Simulating market segments, A/B testing across user types, creating representative test populations with known segment proportions.

```typescript
import { generateBatch } from 'synth-personas';

const personas = generateBatch(30, {
  clusters: [
    {
      name: 'tech-savvy-young',
      criteria: { demographics: { age: { max: 30 } }, technical: { literacy: { min: 4 } } },
      count: 10,
    },
    {
      name: 'elderly-novice',
      criteria: { demographics: { age: { min: 65 } }, technical: { literacy: { max: 2 } } },
      count: 10,
    },
    {
      name: 'frustrated-customer',
      criteria: { context: { motivation: 'frustration' }, behavior: { patience: { max: 2 } } },
      count: 10,
    },
  ],
});
```

### 7.5 From Distribution

Generate personas matching a real-world demographic distribution. The user provides target percentages for demographic traits, and the generator produces a persona set that matches those proportions.

**Algorithm**:
1. Parse the target distribution: a set of trait-value-percentage tuples.
2. Compute target counts for each trait value based on the total persona count and target percentages.
3. Generate personas in rounds, tracking the current distribution. In each round, determine which trait values are underrepresented relative to the target, and generate a persona with criteria favoring the underrepresented values.
4. After all personas are generated, verify the final distribution matches the target within a configurable tolerance.

**When to use**: Matching a known user population (e.g., "our users are 60% age 25-44, 25% age 45-64, 15% age 65+"), generating personas that mirror census data or user analytics.

```typescript
import { generateBatch } from 'synth-personas';

const personas = generateBatch(100, {
  distribution: {
    'demographics.age': [
      { range: { min: 18, max: 24 }, weight: 0.15 },
      { range: { min: 25, max: 44 }, weight: 0.40 },
      { range: { min: 45, max: 64 }, weight: 0.30 },
      { range: { min: 65, max: 90 }, weight: 0.15 },
    ],
    'demographics.gender': [
      { value: 'male', weight: 0.48 },
      { value: 'female', weight: 0.48 },
      { value: 'non-binary', weight: 0.04 },
    ],
  },
});
```

---

## 8. Message Generation

### Overview

Message generation transforms a persona and a topic into a text message that reflects the persona's communication style. The generated text is not fluent natural language -- it is a heuristic approximation constructed by applying persona-driven transformations to template sentences. The purpose is to produce stylistically diverse inputs for testing, not to simulate human conversation.

### Heuristic Message Pipeline

Given a `Persona` and a `topic` string, the message pipeline operates in five stages:

**Stage 1: Template selection**

Select a sentence template from the template bank based on the topic and the persona's motivation:

- `information-seeking`: "I need help with {topic}", "Can you tell me about {topic}", "I have a question about {topic}"
- `task-completion`: "I'm trying to {topic}", "How do I {topic}", "I need to {topic}"
- `exploration`: "I'm curious about {topic}", "What can you tell me about {topic}", "I'd like to learn about {topic}"
- `frustration`: "I'm having a problem with {topic}", "{topic} isn't working", "I can't figure out {topic}"

The template bank contains approximately 10 templates per motivation category. The seeded PRNG selects among them.

**Stage 2: Formality adjustment**

Adjust the template text based on `communication.formality`:

- Formality 1-2 (casual): Apply contractions, remove "please" and "thank you", use lowercase sentence starts, add casual starters ("hey", "yo", "so").
- Formality 3 (neutral): Leave as-is.
- Formality 4-5 (formal): Expand contractions, add "please" and "I would appreciate", use formal address ("I would like to inquire about"), add closing politeness ("Thank you for your time.").

**Stage 3: Verbosity adjustment**

Adjust message length based on `communication.verbosity`:

- Verbosity 1 (terse): Strip to the core question. Remove filler, context, and pleasantries. Example: "password reset?"
- Verbosity 2: One short sentence.
- Verbosity 3: One to two sentences with basic context.
- Verbosity 4: Two to three sentences with context and explanation.
- Verbosity 5 (verbose): Three to five sentences with background, context, explanation of what was already tried, and a polite closing. Example: "Hello, I hope you're doing well. I've been using your service for about three years now and I've always been quite satisfied. However, I'm running into an issue with {topic}. I've tried looking through the help section and I've also asked a friend, but neither approach has resolved my problem. Would you be able to help me with this?"

Verbosity text expansions are generated from a bank of filler phrases, context sentences, and closing phrases selected by the seeded PRNG.

**Stage 4: Style application**

Apply persona-specific style transformations:

- **Typo injection**: For each word, with probability `communication.typoRate`, introduce a random typo using the same mechanisms as `fewshot-gen`'s `typo-inject` strategy (adjacent key swap, doubled letter, or letter transposition).
- **Emoji injection**: If `communication.emojiUsage` is `light`, append one emoji from a curated list at the end. If `heavy`, insert emoji after sentences and in place of some punctuation.
- **Vocabulary adjustment**: If `communication.vocabularyComplexity` is 1-2, replace complex words with simple synonyms from a built-in word list ("utilize" -> "use", "assistance" -> "help"). If 4-5, replace simple words with complex synonyms ("help" -> "assistance", "use" -> "utilize").
- **Capitalization**: If formality is 1 and the persona is young, apply lowercase throughout. If the persona's context is frustration and neuroticism is high, apply occasional ALL CAPS to emphasized words.
- **Punctuation**: Casual personas may omit periods. Frustrated personas may use multiple exclamation marks. Formal personas always use proper punctuation.

**Stage 5: Sentence length adjustment**

Adjust sentence length based on `communication.sentenceLength`:

- `short`: Break long sentences at conjunctions and commas. Target 5-10 words per sentence.
- `medium`: Leave as-is. Target 10-20 words per sentence.
- `long`: Combine short sentences with conjunctions. Target 20-35 words per sentence.

### Example Generated Messages

Same topic ("resetting my password"), three different personas:

**Persona A**: 24-year-old software engineer, casual, terse, high tech literacy, light emoji.
```
how do i reset my pw? cant find the option in settings
```

**Persona B**: 71-year-old retired teacher, formal, verbose, low tech literacy, no emoji.
```
Good afternoon. I am writing to ask for your assistance with a matter regarding my
account password. I believe I need to reset it, but I am not entirely sure how to go
about doing so on your website. I have looked through several pages but I was unable
to locate the appropriate option. Could you kindly walk me through the steps? I would
be most grateful for your help. Thank you.
```

**Persona C**: 35-year-old parent, frustrated, moderate formality, moderate verbosity, some typos.
```
I need to reset my password and its not workign. I've tried the forgot password link
three times and it keeps saying the email wasnt found. This is really frustraing, I
have things I need to do on my account!!
```

### Conversation Generation

`generateConversation()` produces a `Message[]` array simulating a multi-turn conversation from the persona's perspective. Each turn is generated using the heuristic message pipeline with adjustments for turn position:

- **Turn 1**: Initial message. Uses the persona's default communication style.
- **Turn 2+**: Follow-up messages. If `behavior.followUpLikelihood` is below the PRNG threshold, the conversation ends. Otherwise, the follow-up is generated with:
  - Reduced patience (patience decreases by `1 / behavior.patience` per turn for low-patience personas).
  - Increased directness (follow-ups tend to be more direct than initial messages).
  - Context references ("As I mentioned earlier...", "I already tried that...").
  - Escalation markers for frustrated personas ("I've been waiting for 20 minutes", "Can I speak to a manager?").

```typescript
interface Message {
  /** The turn number (1-indexed). */
  turn: number;

  /** The message text. */
  text: string;

  /** The persona's emotional state at this turn. */
  emotionalState: 'neutral' | 'satisfied' | 'confused' | 'frustrated' | 'angry';

  /** Whether this is the final message (conversation ends). */
  isFinal: boolean;
}
```

---

## 9. System Prompt Generation

### Overview

`toSystemPrompt()` converts a `Persona` into a natural language paragraph that instructs an LLM to role-play as that persona. The system prompt describes the persona's identity, communication style, behavioral tendencies, and current context in second person ("You are..."). The output is suitable for use as a system message in LLM API calls.

### Template Structure

The system prompt is assembled from template segments, each driven by specific persona traits:

1. **Identity**: "You are {name}, a {age}-year-old {occupation} from {location}."
2. **Education**: "You have a {education} degree in {field}." (field is inferred from occupation).
3. **Technical profile**: "You are {literacy_description} with technology." Where literacy_description maps: 1 = "very unfamiliar", 2 = "not very comfortable", 3 = "reasonably comfortable", 4 = "quite comfortable", 5 = "highly proficient".
4. **Communication style**: "You communicate in a {formality_adj}, {verbosity_adj} style." With additional clauses for extreme values: "You {never/sometimes/frequently} use emoji." "You {always/sometimes/never} use proper grammar and spelling."
5. **Personality summary**: Generated from the most extreme Big Five scores. If openness > 0.7: "You are curious and open to new ideas." If neuroticism > 0.7: "You tend to feel anxious and stressed easily." Only the top 2-3 most extreme traits are mentioned to keep the prompt concise.
6. **Behavioral tendencies**: "You are {patience_adj} and {detail_adj}." With context-specific additions for frustrated personas: "You are growing impatient and may become confrontational if your issue is not resolved quickly."
7. **Context**: "You are contacting {product} because {motivation_description}. You are a {familiarity_adj} user."

### Configurable Template

Users can provide a custom template string with placeholder variables:

```typescript
import { toSystemPrompt } from 'synth-personas';

const prompt = toSystemPrompt(persona, {
  template: `You are {name}, age {age}. Occupation: {occupation}.
You communicate {formality_adv}. Your technical skill is {literacy}/5.
Current mood: {emotional_context}.`,
});
```

Available template variables correspond to all persona trait fields plus derived descriptive variants (`formality_adj`, `verbosity_adj`, `literacy_description`, etc.).

### Prompt Quality Levels

The `toSystemPrompt()` function supports three quality levels controlling prompt length and detail:

- **`brief`**: 1-2 sentences. Identity and communication style only. Suitable for quick experiments.
- **`standard`** (default): 4-6 sentences. Identity, communication style, personality highlights, and context. Suitable for most evaluation scenarios.
- **`detailed`**: 8-12 sentences. All trait dimensions described explicitly with behavioral instructions. Suitable for extended role-play scenarios and detailed testing.

```typescript
const brief = toSystemPrompt(persona, { level: 'brief' });
// "You are Margaret Chen, a 67-year-old retired teacher. You communicate formally
//  and are not comfortable with technology."

const detailed = toSystemPrompt(persona, { level: 'detailed' });
// Full multi-paragraph persona description with behavioral instructions.
```

---

## 10. Diversity Metrics

### Overview

When generating a batch of personas, diversity metrics quantify how well the set covers the trait space. These metrics help users assess whether their generated persona set is sufficiently diverse for comprehensive testing.

### Dimensional Coverage

For each trait dimension, dimensional coverage measures what fraction of the trait's value range is represented in the persona set.

- **Continuous traits** (0-1): Divide the range into 10 bins. Coverage = (bins with at least one persona) / 10.
- **Integer scale traits** (1-5): Coverage = (distinct values present) / 5.
- **Categorical traits**: Coverage = (distinct values present) / (total possible values).

Overall dimensional coverage is the mean coverage across all trait dimensions.

### Demographic Diversity Index

A composite score based on Shannon entropy across demographic categories:

```
H = -sum(p_i * log2(p_i))
```

Where `p_i` is the proportion of personas in each category. Computed separately for gender, education, income bracket, and occupation category (grouped into broad categories: technical, creative, service, professional, manual, retired/student). The demographic diversity index is the normalized mean entropy: `mean(H_dimension / log2(n_categories_dimension))`.

A score of 1.0 means perfectly uniform distribution across all demographic categories. A score near 0 means the persona set is concentrated in a single category.

### Communication Style Spread

The standard deviation of each communication style parameter across the persona set, averaged and normalized. A high spread means personas communicate in varied styles; a low spread means they are stylistically similar.

### Uniqueness Score

The minimum pairwise distance across all personas in normalized trait space. A higher minimum distance means no two personas are "too similar." The uniqueness score is: `min(distance(persona_i, persona_j)) for all i != j`, normalized to [0, 1].

### Diversity Report

```typescript
interface DiversityReport {
  /** Overall dimensional coverage, 0-1. */
  dimensionalCoverage: number;

  /** Per-dimension coverage, 0-1. */
  perDimensionCoverage: Record<string, number>;

  /** Demographic diversity index, 0-1 (Shannon entropy normalized). */
  demographicDiversity: number;

  /** Communication style spread, 0-1. */
  communicationStyleSpread: number;

  /** Minimum pairwise uniqueness score, 0-1. */
  uniquenessScore: number;

  /** Overall diversity score: weighted mean of the above. */
  overallScore: number;

  /** Persona count. */
  personaCount: number;

  /** Warnings (e.g., "no personas with age > 70", "all personas have formality 3"). */
  warnings: string[];
}
```

```typescript
import { generateBatch, computeDiversity } from 'synth-personas';

const personas = generateBatch(50, { seed: 42 });
const report = computeDiversity(personas);

console.log(report.overallScore);          // 0.87
console.log(report.dimensionalCoverage);   // 0.91
console.log(report.demographicDiversity);  // 0.85
console.log(report.warnings);             // []
```

---

## 11. API Design

### Installation

```bash
npm install synth-personas
```

### Top-Level Function: `generate`

Generate a single random persona.

```typescript
import { generate } from 'synth-personas';

const persona = generate();
console.log(persona.demographics.name);    // "Margaret Chen"
console.log(persona.demographics.age);     // 67
console.log(persona.communication.formality); // 5
console.log(persona.summary);             // "Margaret Chen, 67, retired teacher, formal and verbose communicator"
```

With options:

```typescript
const persona = generate({ seed: 42, locale: 'en-US' });
```

### Batch Function: `generateBatch`

Generate multiple personas with diversity optimization.

```typescript
import { generateBatch } from 'synth-personas';

const personas = generateBatch(20, { seed: 42 });
console.log(personas.length);  // 20
console.log(personas[0].id);   // deterministic UUID based on seed
```

With cluster-based generation:

```typescript
const personas = generateBatch(30, {
  seed: 42,
  clusters: [
    { name: 'novice', criteria: { technical: { literacy: { max: 2 } } }, count: 15 },
    { name: 'expert', criteria: { technical: { literacy: { min: 4 } } }, count: 15 },
  ],
});
```

### Targeted Function: `generateTargeted`

Generate personas matching specific criteria.

```typescript
import { generateTargeted } from 'synth-personas';

const personas = generateTargeted(
  {
    demographics: { age: { min: 60, max: 80 }, gender: 'female' },
    technical: { literacy: { max: 2 } },
    context: { motivation: 'frustration' },
  },
  5,
  { seed: 42 },
);
// 5 frustrated elderly women with low technical literacy
```

### Message Function: `generateMessage`

Generate a persona-style message on a given topic.

```typescript
import { generate, generateMessage } from 'synth-personas';

const persona = generate({ seed: 42 });
const message = generateMessage(persona, 'resetting my password');
console.log(message);
// Output varies by persona communication style
```

With options:

```typescript
const message = generateMessage(persona, 'resetting my password', {
  seed: 100,
  maxLength: 500,
  includeGreeting: true,
  includeClosing: true,
});
```

### Conversation Function: `generateConversation`

Generate a multi-turn conversation from the persona's perspective.

```typescript
import { generate, generateConversation } from 'synth-personas';

const persona = generate({ seed: 42 });
const messages = generateConversation(persona, 5, {
  topic: 'billing dispute',
  seed: 100,
});

for (const msg of messages) {
  console.log(`Turn ${msg.turn} [${msg.emotionalState}]: ${msg.text}`);
}
// Turn 1 [neutral]: I have a question about a charge on my account...
// Turn 2 [confused]: I looked at my statement but I still don't understand...
// Turn 3 [frustrated]: This is the third time I've asked about this...
```

### System Prompt Function: `toSystemPrompt`

Convert a persona to an LLM system prompt.

```typescript
import { generate, toSystemPrompt } from 'synth-personas';

const persona = generate({ seed: 42 });

const brief = toSystemPrompt(persona, { level: 'brief' });
const standard = toSystemPrompt(persona);
const detailed = toSystemPrompt(persona, { level: 'detailed' });
const custom = toSystemPrompt(persona, {
  template: 'You are {name}, age {age}. Style: {formality_adj}. Tech level: {literacy}/5.',
});
```

### Factory Function: `createGenerator`

For repeated use with fixed configuration.

```typescript
import { createGenerator } from 'synth-personas';

const generator = createGenerator({
  seed: 42,
  locale: 'en-US',
  correlations: {
    'age->technical.literacy': -0.6,
  },
});

const persona1 = generator.generate();
const batch = generator.generateBatch(20);
const targeted = generator.generateTargeted({ demographics: { age: { min: 60 } } }, 5);
const message = generator.generateMessage(persona1, 'account settings');
```

### Diversity Function: `computeDiversity`

Compute diversity metrics for a persona set.

```typescript
import { generateBatch, computeDiversity } from 'synth-personas';

const personas = generateBatch(50, { seed: 42 });
const report = computeDiversity(personas);
console.log(report.overallScore);  // 0.87
```

### Type Definitions

```typescript
// ── Options ─────────────────────────────────────────────────────────

/** Options for generate() and generateBatch(). */
interface PersonaOptions {
  /** PRNG seed for deterministic generation. Default: 42. */
  seed?: number;

  /** Locale for name generation and cultural defaults. Default: 'en-US'. */
  locale?: string;

  /** Custom correlation overrides. */
  correlations?: Record<string, number>;

  /** Cluster definitions for cluster-based generation. */
  clusters?: ClusterDefinition[];

  /** Target demographic distribution. */
  distribution?: Record<string, DistributionTarget[]>;

  /** Diversity optimization settings. */
  diversity?: {
    /** Oversampling factor for diversity selection. Default: 3. */
    oversamplingFactor?: number;

    /** Minimum pairwise distance threshold. Default: 0.1. */
    minDistance?: number;

    /** Maximum iterations for diversity optimization. Default: 100. */
    maxIterations?: number;
  };
}

/** Cluster definition for cluster-based generation. */
interface ClusterDefinition {
  /** Cluster name, attached to each persona as metadata. */
  name: string;

  /** Trait criteria for personas in this cluster. */
  criteria: PersonaCriteria;

  /** Number of personas to generate in this cluster. */
  count: number;
}

/** Target distribution entry. */
interface DistributionTarget {
  /** Exact value to match (for categorical traits). */
  value?: string | number | boolean;

  /** Range to match (for continuous/integer traits). */
  range?: { min?: number; max?: number };

  /** Target proportion (0-1). */
  weight: number;
}

// ── Message Options ─────────────────────────────────────────────────

/** Options for generateMessage(). */
interface MessageOptions {
  /** PRNG seed for message text generation. Default: persona's seed. */
  seed?: number;

  /** Maximum character length. Default: unlimited. */
  maxLength?: number;

  /** Include a greeting (Hi, Hello, etc.). Default: determined by persona. */
  includeGreeting?: boolean;

  /** Include a closing (Thanks, Best regards, etc.). Default: determined by persona. */
  includeClosing?: boolean;
}

/** Options for generateConversation(). */
interface ConversationOptions extends MessageOptions {
  /** Conversation topic. Required. */
  topic: string;

  /** Maximum turns. Default: 5. */
  maxTurns?: number;
}

// ── System Prompt Options ───────────────────────────────────────────

/** Options for toSystemPrompt(). */
interface SystemPromptOptions {
  /** Detail level. Default: 'standard'. */
  level?: 'brief' | 'standard' | 'detailed';

  /** Custom template string with {variable} placeholders. */
  template?: string;

  /** Product/service name to include in context. */
  productName?: string;
}

// ── Generator ───────────────────────────────────────────────────────

/** Configuration for createGenerator(). */
interface GeneratorConfig extends PersonaOptions {
  /** Default message options for generateMessage(). */
  messageDefaults?: MessageOptions;

  /** Default system prompt options for toSystemPrompt(). */
  systemPromptDefaults?: SystemPromptOptions;
}

/** A configured persona generator instance. */
interface PersonaGenerator {
  /** Generate a single persona. */
  generate(options?: Partial<PersonaOptions>): Persona;

  /** Generate a diverse batch. */
  generateBatch(count: number, options?: Partial<PersonaOptions>): Persona[];

  /** Generate personas matching criteria. */
  generateTargeted(
    criteria: PersonaCriteria,
    count?: number,
    options?: Partial<PersonaOptions>,
  ): Persona[];

  /** Generate a message in persona's style. */
  generateMessage(persona: Persona, topic: string, options?: MessageOptions): string;

  /** Generate a multi-turn conversation. */
  generateConversation(
    persona: Persona,
    turns: number,
    options?: ConversationOptions,
  ): Message[];

  /** Convert persona to LLM system prompt. */
  toSystemPrompt(persona: Persona, options?: SystemPromptOptions): string;

  /** Compute diversity metrics for a persona set. */
  computeDiversity(personas: Persona[]): DiversityReport;

  /** The generator's configuration. */
  readonly config: Readonly<GeneratorConfig>;
}
```

---

## 12. Reproducibility

### Seeded PRNG

All random operations use a seeded pseudorandom number generator (PRNG). The PRNG implementation is a Mulberry32 algorithm -- a simple, fast, 32-bit PRNG with good statistical properties and a small state (single 32-bit integer). Mulberry32 is chosen for its simplicity (implementable in ~10 lines of JavaScript), speed, and sufficient quality for persona generation (it is not cryptographic, but persona generation does not require cryptographic randomness).

### Deterministic Guarantees

Same seed + same configuration = same personas. Specifically:

- `generate({ seed: 42 })` always returns the same `Persona` object.
- `generateBatch(10, { seed: 42 })` always returns the same 10 `Persona` objects in the same order.
- `generateMessage(persona, 'topic', { seed: 100 })` always returns the same string.
- Adding or removing correlation overrides does not affect the output of unrelated traits (each trait's PRNG sub-seed is computed from the global seed and the trait name, so changing one trait's generation does not cascade to others).

### Seed Derivation

To prevent correlated outputs across different operations, the PRNG seed for each operation is derived from the global seed combined with a context string:

- Per-persona seed (in batch mode): `hash(globalSeed + personaIndex)`
- Per-trait seed: `hash(personaSeed + traitName)`
- Per-message seed: `hash(messageSeed + turnNumber)`

The hash function is a simple string hash (djb2 or FNV-1a) that maps strings to 32-bit integers.

---

## 13. Configuration

### Default Configuration

All options have sensible defaults. The simplest usage requires no arguments:

```typescript
import { generate } from 'synth-personas';
const persona = generate();
// Uses seed=42, locale='en-US', default correlations, no constraints
```

### Configuration Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `seed` | `number` | `42` | PRNG seed for deterministic generation. |
| `locale` | `string` | `'en-US'` | Locale for name generation and cultural defaults. |
| `correlations` | `Record<string, number>` | Built-in matrix | Custom correlation weight overrides. |
| `clusters` | `ClusterDefinition[]` | `undefined` | Cluster definitions for segmented generation. |
| `distribution` | `Record<string, DistributionTarget[]>` | `undefined` | Target demographic distribution. |
| `diversity.oversamplingFactor` | `number` | `3` | Candidates generated per requested persona for diversity selection. |
| `diversity.minDistance` | `number` | `0.1` | Minimum normalized pairwise distance between selected personas. |
| `diversity.maxIterations` | `number` | `100` | Maximum iterations for diversity optimization. |

### Configuration File

The CLI searches for a configuration file in the current directory:

1. `.synth-personas.json`
2. `synth-personas` key in `package.json`

```json
{
  "seed": 42,
  "locale": "en-US",
  "correlations": {
    "age->technical.literacy": -0.6,
    "demographics.education->communication.formality": 0.5
  },
  "diversity": {
    "oversamplingFactor": 5,
    "minDistance": 0.15
  }
}
```

### Configuration Precedence

1. Built-in defaults.
2. Configuration file (`.synth-personas.json`).
3. CLI flags.
4. Programmatic options in `PersonaOptions`.

---

## 14. CLI Design

### Installation and Invocation

```bash
# Global install
npm install -g synth-personas
synth-personas generate --count 10

# npx (no install)
npx synth-personas generate --count 10

# Package script
# package.json: { "scripts": { "personas": "synth-personas generate --count 50 -o personas.json" } }
npm run personas
```

### CLI Binary Name

`synth-personas`

### Commands

The CLI has four commands: `generate`, `message`, `prompt`, and `diversity`.

```
synth-personas <command> [options]

Commands:
  generate    Generate synthetic personas
  message     Generate a persona-style message
  prompt      Generate an LLM system prompt from a persona
  diversity   Compute diversity metrics for a persona set

General:
  --version   Print version and exit.
  --help      Print help and exit.
```

### `generate` Command

```
synth-personas generate [options]

Count:
  --count, -n <n>          Number of personas to generate. Default: 1.

Targeting:
  --age <range>            Age constraint. Example: --age 60-80
  --gender <value>         Gender constraint. Values: male, female, non-binary.
  --occupation <value>     Occupation constraint. Example: --occupation "software engineer"
  --education <value>      Education constraint. Values: none, high-school, some-college,
                           bachelors, masters, doctorate.
  --tech-literacy <range>  Technical literacy constraint. Example: --tech-literacy 1-2
  --motivation <value>     Motivation constraint. Values: information-seeking,
                           task-completion, exploration, frustration.

Generation:
  --seed <n>               PRNG seed. Default: 42.
  --locale <locale>        Locale. Default: en-US.
  --strategy <strategy>    Generation strategy: random, diverse, targeted, cluster.
                           Default: diverse (for count > 1), random (for count = 1).

Output:
  --output, -o <path>      Output file path. Default: stdout.
  --format <format>        Output format: json, jsonl, csv. Default: json.
  --pretty                 Pretty-print JSON output.
  --fields <fields>        Comma-separated fields to include in output.
                           Default: all fields.
  --summary-only           Output only the summary line per persona.
```

### `message` Command

```
synth-personas message [options]

Input:
  --persona <path>         Path to a persona JSON file (single persona).
  --persona-inline <json>  Inline persona JSON string.
  --topic <topic>          Message topic. Required.

Options:
  --seed <n>               PRNG seed for message generation.
  --max-length <n>         Maximum message character length.
  --greeting               Include a greeting.
  --closing                Include a closing.

Output:
  --output, -o <path>      Output file path. Default: stdout.
```

### `prompt` Command

```
synth-personas prompt [options]

Input:
  --persona <path>         Path to a persona JSON file (single persona).
  --persona-inline <json>  Inline persona JSON string.

Options:
  --level <level>          Detail level: brief, standard, detailed. Default: standard.
  --template <template>    Custom template string.
  --product <name>         Product name for context.

Output:
  --output, -o <path>      Output file path. Default: stdout.
```

### `diversity` Command

```
synth-personas diversity [options]

Input:
  <file>                   Path to a personas JSON or JSONL file.

Output:
  --format <format>        Output format: human, json. Default: human.
  --output, -o <path>      Output file path. Default: stdout.
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success. |
| `1` | Error. Invalid options, file not found, or generation failure. |
| `2` | Usage error. Invalid flags, missing required arguments. |

### CLI Output Examples

**Generate 3 personas (summary)**:

```
$ synth-personas generate -n 3 --summary-only

  synth-personas v0.1.0

  1. Margaret Chen, 67, retired teacher, formal and verbose communicator
  2. Jaylen Washington, 28, software engineer, casual and direct communicator
  3. Priya Sharma, 45, marketing manager, moderate formality, detail-oriented

  Generated 3 personas (seed: 42) in 4ms
```

**Diversity report**:

```
$ synth-personas diversity personas.json

  synth-personas v0.1.0

  Persona count: 50

  Overall diversity score:          0.87

  Dimensional coverage:             0.91
  Demographic diversity:            0.85
  Communication style spread:       0.89
  Uniqueness score:                 0.78

  Per-dimension coverage:
    age                             1.00  (all bins covered)
    gender                          1.00
    education                       1.00
    occupation                      0.85
    technical literacy              1.00
    formality                       1.00
    verbosity                       1.00
    emoji usage                     1.00
    politeness                      0.80
    directness                      1.00

  Warnings: none
```

### Environment Variables

| Environment Variable | Equivalent Flag |
|---------------------|-----------------|
| `SYNTH_PERSONAS_SEED` | `--seed` |
| `SYNTH_PERSONAS_LOCALE` | `--locale` |
| `SYNTH_PERSONAS_CONFIG` | `--config` |

---

## 15. Integration

### With eval-dataset

`eval-dataset` manages evaluation datasets. `synth-personas` generates the user personas that enrich those datasets with diverse test inputs. The integration adds persona metadata to test cases, enabling analysis by user segment.

```typescript
import { generateBatch, generateMessage } from 'synth-personas';
import { createDataset } from 'eval-dataset';

const personas = generateBatch(20, { seed: 42 });
const topic = 'How do I cancel my subscription?';

let dataset = createDataset({
  name: 'persona-driven-eval',
  description: 'Eval dataset with persona-diverse inputs for cancellation flow',
});

for (const persona of personas) {
  const message = generateMessage(persona, topic);
  dataset = dataset.add({
    input: message,
    expected: 'Cancellation instructions...',
    category: persona.context.motivation,
    tags: [
      `age-${persona.demographics.age < 30 ? 'young' : persona.demographics.age < 60 ? 'middle' : 'senior'}`,
      `tech-${persona.technical.literacy <= 2 ? 'low' : persona.technical.literacy >= 4 ? 'high' : 'mid'}`,
      `formality-${persona.communication.formality <= 2 ? 'casual' : persona.communication.formality >= 4 ? 'formal' : 'neutral'}`,
    ],
    metadata: {
      personaId: persona.id,
      personaSummary: persona.summary,
    },
  });
}
```

### With fewshot-gen

`fewshot-gen` generates test case variations from seed examples. `synth-personas` can style those seeds to represent diverse user voices. Instead of writing developer-style seeds and relying on `fewshot-gen` to add variations, use personas to write the seeds themselves.

```typescript
import { generateBatch, generateMessage } from 'synth-personas';
import { generate as fewshotGenerate } from 'fewshot-gen';

const personas = generateBatch(5, { seed: 42 });

// Generate persona-styled seed inputs
const seeds = personas.map(p => ({
  input: generateMessage(p, 'return a defective product'),
  category: p.summary,
}));

// Generate variations from persona-styled seeds
const { cases } = fewshotGenerate(seeds, {
  families: ['perturbation', 'edge-case'],
  maxCases: 100,
});
```

### With llm-regression

`llm-regression` detects regressions between prompt versions. `synth-personas` enables testing whether a prompt update disproportionately degrades performance for specific user segments.

```typescript
import { generateBatch, toSystemPrompt } from 'synth-personas';
import { runRegression } from 'llm-regression';

const personas = generateBatch(20, { seed: 42 });

// Test each persona's interaction with both prompt versions
const testInputs = personas.map(p => ({
  id: p.id,
  input: `[User persona: ${p.summary}]\n\nHow do I change my email address?`,
  systemPrompt: toSystemPrompt(p),
  metadata: { personaSummary: p.summary, ageGroup: p.demographics.age < 40 ? 'young' : 'older' },
}));

const report = await runRegression(testInputs, baselinePrompt, candidatePrompt, llmFn);
// Analyze: does the new prompt regress specifically for older or non-technical personas?
```

### With synthdata-gen

`synthdata-gen` generates general synthetic data from schemas. `synth-personas` complements it by generating the human/user dimension of test data. Use `synth-personas` for user profiles and `synthdata-gen` for application-specific data (orders, tickets, records) associated with those users.

```typescript
import { generateBatch } from 'synth-personas';
import { generateFromSchema } from 'synthdata-gen';

const personas = generateBatch(50, { seed: 42 });

// For each persona, generate a synthetic support ticket
const tickets = personas.map(p => ({
  user: { name: p.demographics.name, age: p.demographics.age },
  ticket: generateFromSchema({
    type: 'support-ticket',
    fields: {
      subject: { type: 'string', category: 'support' },
      priority: { type: 'enum', values: ['low', 'medium', 'high'] },
    },
  }),
  userMessage: generateMessage(p, 'account issue'),
}));
```

---

## 16. Testing Strategy

### Unit Tests

Unit tests cover each module in isolation:

- **PRNG**: Verify determinism (same seed = same sequence), distribution quality (chi-squared test over 10,000 samples), and independence (different seeds produce different sequences).
- **Correlation engine**: Verify that conditional distributions shift correctly. Given `age = 75` and `age->technical.literacy` weight of -0.4, technical literacy should average below 3 over many samples. Test with 1,000 samples and verify the mean is statistically below the unconditioned mean.
- **Individual trait generators**: Verify each trait produces values within its valid range, respects constraints when provided, and responds to conditioning traits in the expected direction.
- **Name generator**: Verify names are generated from the correct cultural pool based on locale and gender. Verify determinism.
- **Diversity optimizer**: Verify that diverse set generation produces higher minimum pairwise distance than random generation over 100 trials.
- **System prompt generator**: Verify output contains expected persona elements (name, age, occupation, communication style descriptions). Verify all three quality levels produce different-length outputs. Verify custom templates substitute variables correctly.
- **Message generator**: Verify output reflects persona traits: high-formality personas produce messages with "please" and complete sentences; high-typo-rate personas produce messages with typos; verbose personas produce longer messages than terse personas.

### Integration Tests

Integration tests verify end-to-end behavior:

- **Full pipeline**: Generate 100 personas with default settings. Verify all personas have complete, valid trait values. Verify no persona has incoherent trait combinations (as defined by a coherence validation function).
- **Targeted generation**: Generate 20 personas with criteria `{ age: { min: 60 }, technical: { literacy: { max: 2 } } }`. Verify all 20 have age >= 60 and literacy <= 2. Verify other traits are within valid ranges and reflect expected correlations.
- **Batch diversity**: Generate 50 personas with diversity optimization. Compute diversity metrics. Verify overall score exceeds 0.7.
- **Message diversity**: Generate messages for 10 different personas on the same topic. Verify messages differ in formality, length, and vocabulary. Verify high-typo-rate personas produce messages with more character-level errors than low-typo-rate personas.
- **Conversation generation**: Generate a 5-turn conversation for a frustrated persona. Verify emotional state progresses from neutral toward frustrated/angry. Verify message tone escalates.
- **Determinism**: Generate the same batch twice with the same seed. Verify byte-identical output.
- **CLI output**: Run CLI commands and verify exit codes, output format (valid JSON/JSONL/CSV), and persona validity.

### Property-Based Tests

- **Range validity**: For any generated persona, every trait value is within its defined range.
- **Correlation direction**: Over 500 random personas, traits with positive correlation have positive Pearson correlation coefficient. Traits with negative correlation have negative coefficient.
- **Diversity monotonicity**: For diverse set generation, increasing the oversampling factor does not decrease the diversity score.
- **Constraint satisfaction**: Targeted generation always satisfies the given constraints (no exceptions, verified over 1,000 trials with random criteria combinations).

---

## 17. Performance

### Generation Speed

- **Single persona**: < 1ms. Trait generation is arithmetic operations on a seeded PRNG.
- **Batch of 100 personas (random)**: < 10ms. Each persona is independent.
- **Batch of 100 personas (diverse)**: < 50ms. Diversity optimization requires pairwise distance computation (O(n^2) on the oversampled set).
- **Batch of 1,000 personas (diverse)**: < 500ms. Pairwise distance on 3,000 candidates is the bottleneck.
- **Message generation**: < 1ms per message. Template selection and string manipulation.
- **Conversation generation (5 turns)**: < 5ms. Five sequential message generations.
- **System prompt generation**: < 1ms. Template interpolation.
- **Diversity metrics (50 personas)**: < 10ms. Pairwise distance and entropy computation.

### Memory

- **Single persona**: ~2 KB (JSON serialized).
- **Batch of 1,000 personas**: ~2 MB. Easily fits in memory.
- **Built-in data tables** (names, occupations, correlation matrix): ~100 KB. Loaded once, shared across all generations.
- **Diversity optimization working set** (3,000 candidates for a 1,000-persona batch): ~6 MB. Freed after selection.

### Scalability

The package is designed for generating hundreds to low thousands of personas. For larger volumes (10,000+), the pairwise distance computation in diversity optimization becomes the bottleneck (O(n^2)). At 10,000 personas with 3x oversampling, this is 30,000^2 = 900 million distance computations. For large batches, users should disable diversity optimization or use cluster-based generation (which applies diversity optimization within clusters, keeping n small).

---

## 18. Dependencies

### Runtime Dependencies

**Zero.** The package uses no runtime dependencies. All functionality is implemented using:

- Node.js built-in `crypto` module for UUID generation.
- Arithmetic operations for PRNG (Mulberry32).
- Built-in string manipulation for message and prompt generation.
- Built-in data tables (TypeScript objects) for names, occupations, correlation weights, and templates.

### Development Dependencies

| Dependency | Purpose |
|---|---|
| `typescript` | TypeScript compiler. |
| `vitest` | Test runner. |
| `eslint` | Linter. |

### Node.js Version

Node.js >= 18. Uses ES2022 language features (private class fields, `Array.prototype.at()`, `Object.hasOwn()`).

---

## 19. File Structure

```
synth-personas/
├── package.json
├── tsconfig.json
├── SPEC.md
├── README.md
├── src/
│   ├── index.ts                  # Public API exports
│   ├── types.ts                  # All TypeScript interfaces and type definitions
│   ├── generator.ts              # PersonaGenerator class and factory
│   ├── persona.ts                # Single persona generation logic
│   ├── correlation.ts            # Trait correlation engine
│   ├── distributions.ts          # Statistical distribution implementations
│   ├── prng.ts                   # Mulberry32 seeded PRNG
│   ├── diversity.ts              # Diversity optimization and metrics
│   ├── message.ts                # Heuristic message generation
│   ├── conversation.ts           # Multi-turn conversation generation
│   ├── system-prompt.ts          # System prompt generation
│   ├── traits/
│   │   ├── demographics.ts       # Age, gender, occupation, education generators
│   │   ├── personality.ts        # Big Five personality trait generators
│   │   ├── technical.ts          # Technical profile generators
│   │   ├── communication.ts      # Communication style generators
│   │   └── behavior.ts           # Behavioral trait generators
│   ├── data/
│   │   ├── names.ts              # First/last name lists by locale and gender
│   │   ├── occupations.ts        # Occupation table with trait profiles
│   │   ├── correlations.ts       # Default correlation matrix
│   │   ├── templates.ts          # Message templates by motivation
│   │   ├── vocabulary.ts         # Simple/complex word lists for vocab adjustment
│   │   └── locations.ts          # Location lists by locale
│   ├── cli.ts                    # CLI entry point and argument parsing
│   └── __tests__/
│       ├── generate.test.ts      # Single persona generation tests
│       ├── batch.test.ts         # Batch generation and diversity tests
│       ├── targeted.test.ts      # Targeted generation tests
│       ├── correlation.test.ts   # Correlation engine tests
│       ├── message.test.ts       # Message generation tests
│       ├── conversation.test.ts  # Conversation generation tests
│       ├── system-prompt.test.ts # System prompt generation tests
│       ├── diversity.test.ts     # Diversity metrics tests
│       ├── prng.test.ts          # PRNG determinism and quality tests
│       ├── traits.test.ts        # Individual trait generator tests
│       └── cli.test.ts           # CLI integration tests
└── dist/                         # Compiled output (gitignored)
```

---

## 20. Implementation Roadmap

### Phase 1: Core Generation (MVP)

Deliver the foundational persona generation capability.

1. **PRNG**: Implement Mulberry32 with seed derivation.
2. **Types**: Define all TypeScript interfaces (`Persona`, `PersonaOptions`, `PersonaCriteria`, etc.).
3. **Distribution primitives**: Implement Gaussian, categorical, and weighted random distributions.
4. **Correlation engine**: Implement conditional distribution adjustment with the default correlation matrix.
5. **Trait generators**: Implement all trait generators (demographics, personality, technical, communication, behavior, context) with correlation conditioning.
6. **Data tables**: Build name lists, occupation table, and location lists.
7. **`generate()`**: Wire up single persona generation.
8. **`generateBatch()`**: Implement batch generation without diversity optimization (random strategy only).
9. **Tests**: Unit tests for PRNG, distributions, correlations, trait generators, and full persona generation.

### Phase 2: Diversity and Targeting

Add diversity optimization and constrained generation.

1. **Diversity optimizer**: Implement max-min distance selection with oversampling.
2. **Diversity metrics**: Implement `computeDiversity()` with dimensional coverage, demographic diversity, communication spread, and uniqueness score.
3. **Targeted generation**: Implement `generateTargeted()` with criteria parsing and constraint satisfaction.
4. **Cluster-based generation**: Implement cluster definitions and within-cluster diversity.
5. **Distribution matching**: Implement from-distribution generation strategy.
6. **Tests**: Integration tests for diversity, targeting, and distribution matching.

### Phase 3: Message and Prompt Generation

Add the output generation capabilities.

1. **Message templates**: Build template bank organized by motivation.
2. **Message pipeline**: Implement the 5-stage heuristic message pipeline (template selection, formality, verbosity, style, sentence length).
3. **Vocabulary adjustment**: Build simple/complex synonym word lists.
4. **Typo injection**: Implement QWERTY-aware typo injection.
5. **`generateMessage()`**: Wire up single message generation.
6. **Conversation generation**: Implement `generateConversation()` with turn-based state evolution.
7. **System prompt generation**: Implement `toSystemPrompt()` with three quality levels and custom templates.
8. **Tests**: Unit and integration tests for messages, conversations, and system prompts.

### Phase 4: CLI and Polish

Add the CLI and finalize for release.

1. **CLI argument parsing**: Implement command parsing for `generate`, `message`, `prompt`, and `diversity` commands.
2. **CLI output formats**: Implement JSON, JSONL, and CSV output formatting.
3. **Configuration file loading**: Implement `.synth-personas.json` discovery and merging.
4. **README**: Write comprehensive README with installation, quick start, API reference, and examples.
5. **CLI tests**: Integration tests for all CLI commands.
6. **Performance benchmarks**: Verify generation speed targets are met.

---

## 21. Example Use Cases

### Chatbot Stress Testing

Generate 100 diverse personas and simulate each one asking the same 10 questions. This produces 1,000 test inputs (100 personas x 10 questions) with realistic stylistic variation. Identify which persona types cause the chatbot to fail.

```typescript
import { generateBatch, generateMessage } from 'synth-personas';

const personas = generateBatch(100, { seed: 42 });
const questions = [
  'How do I reset my password?',
  'What are your business hours?',
  'I want a refund',
  'Can I speak to a manager?',
  'Your app crashed',
];

const testCases = personas.flatMap(persona =>
  questions.map(q => ({
    input: generateMessage(persona, q),
    personaId: persona.id,
    personaSummary: persona.summary,
    originalQuestion: q,
  })),
);

// Feed testCases to evaluation pipeline
```

### Bias Detection Across Demographics

Generate controlled persona pairs that differ only in a single demographic trait. Compare system responses.

```typescript
import { generateTargeted, generateMessage } from 'synth-personas';

// Generate pairs: same age, education, communication style, but different gender
const malePersonas = generateTargeted(
  { demographics: { gender: 'male', age: 35 }, communication: { formality: 3 } },
  20,
  { seed: 42 },
);

const femalePersonas = generateTargeted(
  { demographics: { gender: 'female', age: 35 }, communication: { formality: 3 } },
  20,
  { seed: 42 },
);

const topic = 'I want to negotiate a higher salary';
const maleMessages = malePersonas.map(p => generateMessage(p, topic));
const femaleMessages = femalePersonas.map(p => generateMessage(p, topic));

// Send both sets through the AI system, compare response quality and tone
```

### Accessibility Evaluation

Generate personas with traits that simulate accessibility-relevant communication patterns.

```typescript
import { generateTargeted, generateMessage } from 'synth-personas';

// Low technical literacy, high typo rate (simulating motor impairment or screen reader)
const accessibilityPersonas = generateTargeted(
  {
    technical: { literacy: { max: 2 } },
    communication: { verbosity: { min: 4 } },
  },
  15,
  { seed: 42 },
);

const topic = 'navigate the settings menu';
for (const persona of accessibilityPersonas) {
  const message = generateMessage(persona, topic);
  console.log(`[${persona.summary}]`);
  console.log(message);
  console.log();
}
// Verify the AI system provides clear, step-by-step, jargon-free guidance
```

### Eval Dataset Enrichment

Use personas to generate stylistically diverse versions of existing eval dataset inputs.

```typescript
import { loadDataset } from 'eval-dataset';
import { generateBatch, generateMessage, toSystemPrompt } from 'synth-personas';

const dataset = await loadDataset('qa-eval.json');
const personas = generateBatch(10, { seed: 42 });

// For each test case in the dataset, generate 10 persona-styled versions
const enrichedCases = dataset.cases.flatMap(tc =>
  personas.map(persona => ({
    input: generateMessage(persona, tc.input),
    expected: tc.expected,
    metadata: {
      ...tc.metadata,
      originalInput: tc.input,
      personaId: persona.id,
      personaSummary: persona.summary,
      personaSystemPrompt: toSystemPrompt(persona, { level: 'brief' }),
    },
    tags: [...(tc.tags ?? []), `persona-${persona.id.slice(0, 8)}`],
  })),
);

// 10x the dataset size with persona-driven input diversity
```

### LLM Role-Play for Simulated User Testing

Use personas as LLM role-play instructions to generate realistic multi-turn test conversations.

```typescript
import { generateBatch, toSystemPrompt } from 'synth-personas';

const personas = generateBatch(20, { seed: 42 });

for (const persona of personas) {
  const systemPrompt = toSystemPrompt(persona, {
    level: 'detailed',
    productName: 'Acme Support Bot',
  });

  // Use systemPrompt as the system message when calling an LLM
  // The LLM role-plays as this persona, generating realistic user messages
  // that reflect the persona's communication style, technical literacy, and context
  const llmResponse = await callLLM({
    system: systemPrompt,
    user: 'Start a conversation with Acme Support Bot about a billing issue.',
  });

  console.log(`Persona: ${persona.summary}`);
  console.log(`Simulated message: ${llmResponse}`);
}
```
