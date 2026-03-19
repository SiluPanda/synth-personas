# synth-personas — Task Breakdown

## Phase 1: Project Scaffolding & Foundational Modules

- [ ] **Install dev dependencies** — Add `typescript`, `vitest`, and `eslint` as devDependencies in `package.json`. Verify `npm install` succeeds and lock file is generated. | Status: not_done
- [ ] **Configure vitest** — Add a `vitest.config.ts` (or configure in `package.json`) so `npm run test` discovers `src/__tests__/*.test.ts` files. | Status: not_done
- [ ] **Configure eslint** — Add an ESLint config file that works with TypeScript and the project's `tsconfig.json`. Verify `npm run lint` runs cleanly on the empty project. | Status: not_done
- [ ] **Add CLI bin entry to package.json** — Add `"bin": { "synth-personas": "dist/cli.js" }` so the CLI is available after global install or via `npx`. | Status: not_done
- [ ] **Create src directory structure** — Create the full file structure from spec section 19: `src/types.ts`, `src/prng.ts`, `src/distributions.ts`, `src/correlation.ts`, `src/persona.ts`, `src/generator.ts`, `src/diversity.ts`, `src/message.ts`, `src/conversation.ts`, `src/system-prompt.ts`, `src/cli.ts`, `src/traits/` (demographics.ts, personality.ts, technical.ts, communication.ts, behavior.ts), `src/data/` (names.ts, occupations.ts, correlations.ts, templates.ts, vocabulary.ts, locations.ts), and `src/__tests__/`. | Status: not_done

## Phase 2: Type Definitions

- [ ] **Define Persona interface** — Implement the complete `Persona` interface in `src/types.ts` with all six trait dimensions (demographics, personality, technical, communication, behavior, context) plus derived fields (`systemPrompt`, `summary`, `id`, `seed`) exactly as specified in section 5. | Status: not_done
- [ ] **Define Demographics types** — Define the `demographics` sub-interface with `name: string`, `age: number`, `gender: 'male' | 'female' | 'non-binary'`, `occupation: string`, `education` (6-level enum), `location: string`, `language: string`, `incomeBracket` (4-level enum). | Status: not_done
- [ ] **Define Personality types** — Define the `personality` sub-interface with Big Five OCEAN scores (openness, conscientiousness, extraversion, agreeableness, neuroticism) as `number` (0-1 continuous). | Status: not_done
- [ ] **Define Technical types** — Define the `technical` sub-interface with `literacy: 1|2|3|4|5`, `digitalNative: boolean`, `preferredDevices: Array<'desktop'|'laptop'|'tablet'|'smartphone'>`, `platformFamiliarity: 'none'|'basic'|'intermediate'|'advanced'`. | Status: not_done
- [ ] **Define Communication types** — Define the `communication` sub-interface with all 8 style parameters: formality, verbosity, emojiUsage, typoRate, politeness, directness, vocabularyComplexity, sentenceLength. | Status: not_done
- [ ] **Define Behavior types** — Define the `behavior` sub-interface with patience, detailOrientation, followUpLikelihood, complaintTendency, escalationSpeed. | Status: not_done
- [ ] **Define Context types** — Define the `context` sub-interface with motivation (4 values), productFamiliarity (3 values), sessionContext (3 values). | Status: not_done
- [ ] **Define PersonaOptions interface** — Define `PersonaOptions` with `seed`, `locale`, `correlations`, `clusters`, `distribution`, and `diversity` sub-object as specified in section 11. | Status: not_done
- [ ] **Define PersonaCriteria interface** — Define the full `PersonaCriteria` interface supporting exact values, ranges (`{ min?, max? }`), and arrays for all trait dimensions, as specified in section 7.3. | Status: not_done
- [ ] **Define ClusterDefinition interface** — Define `ClusterDefinition` with `name: string`, `criteria: PersonaCriteria`, `count: number`. | Status: not_done
- [ ] **Define DistributionTarget interface** — Define `DistributionTarget` with optional `value`, optional `range: { min?, max? }`, and required `weight: number`. | Status: not_done
- [ ] **Define Message interface** — Define `Message` with `turn: number`, `text: string`, `emotionalState: 'neutral'|'satisfied'|'confused'|'frustrated'|'angry'`, `isFinal: boolean`. | Status: not_done
- [ ] **Define MessageOptions interface** — Define `MessageOptions` with `seed`, `maxLength`, `includeGreeting`, `includeClosing`. | Status: not_done
- [ ] **Define ConversationOptions interface** — Define `ConversationOptions` extending `MessageOptions` with `topic: string` and `maxTurns`. | Status: not_done
- [ ] **Define SystemPromptOptions interface** — Define `SystemPromptOptions` with `level: 'brief'|'standard'|'detailed'`, `template: string`, `productName: string`. | Status: not_done
- [ ] **Define GeneratorConfig interface** — Define `GeneratorConfig` extending `PersonaOptions` with `messageDefaults` and `systemPromptDefaults`. | Status: not_done
- [ ] **Define PersonaGenerator interface** — Define the `PersonaGenerator` interface with methods `generate`, `generateBatch`, `generateTargeted`, `generateMessage`, `generateConversation`, `toSystemPrompt`, `computeDiversity`, and readonly `config`. | Status: not_done
- [ ] **Define DiversityReport interface** — Define `DiversityReport` with `dimensionalCoverage`, `perDimensionCoverage`, `demographicDiversity`, `communicationStyleSpread`, `uniquenessScore`, `overallScore`, `personaCount`, `warnings`. | Status: not_done
- [ ] **Export all public types from index.ts** — Ensure all interfaces and type aliases are exported from `src/index.ts`. | Status: not_done

## Phase 3: PRNG & Distribution Primitives

- [ ] **Implement Mulberry32 PRNG** — Implement the Mulberry32 seeded PRNG in `src/prng.ts`. It must accept a 32-bit integer seed and produce deterministic sequences. Same seed must always produce the same sequence. Expose `next(): number` (0-1 float), `nextInt(min, max): number`, and a method to derive sub-seeds. | Status: not_done
- [ ] **Implement seed derivation via hash** — Implement a string hash function (djb2 or FNV-1a) that maps `(globalSeed + contextString)` to a 32-bit integer. Used for per-persona seeds (`hash(globalSeed + personaIndex)`), per-trait seeds (`hash(personaSeed + traitName)`), and per-message seeds (`hash(messageSeed + turnNumber)`). | Status: not_done
- [ ] **Implement Gaussian distribution (discretized)** — In `src/distributions.ts`, implement a discretized Gaussian distribution. Accept mean, stddev, and clamp range. Return a sampled integer or float clamped to the valid range. Used for age (Gaussian(38,15) clamped 18-90) and personality scores (Gaussian(0.5,0.2) clamped 0-1). | Status: not_done
- [ ] **Implement categorical distribution** — Implement a categorical distribution that accepts a set of values with weights, normalizes them to probabilities, and samples using the PRNG. Used for occupation, gender, education, etc. | Status: not_done
- [ ] **Implement discrete uniform distribution** — Implement a uniform distribution across a range of integers. Used as the base for 1-5 scale traits before conditioning. | Status: not_done
- [ ] **Implement weighted random distribution** — Implement a general-purpose weighted random distribution where each value has an explicit weight. Weights are normalized to probabilities at selection time. | Status: not_done
- [ ] **Write PRNG tests** — `src/__tests__/prng.test.ts`: Verify determinism (same seed = same sequence), verify different seeds produce different sequences, verify distribution quality (chi-squared test over 10,000 samples for uniform distribution), verify sub-seed derivation produces independent sequences. | Status: not_done

## Phase 4: Data Tables

- [ ] **Build name lists** — In `src/data/names.ts`, create first-name lists (~200 per gender: male, female, gender-neutral) and last-name lists (~200 spanning English, Spanish, Chinese, Indian, Arabic, Japanese, Korean, German, French, African backgrounds). Organize by locale for weighted selection. | Status: not_done
- [ ] **Build occupation table** — In `src/data/occupations.ts`, create ~60 occupation entries with associated trait profiles: occupation name, education range, income tendency, technical literacy adjustment. Include all occupations from the spec table plus ~40 more for diversity. | Status: not_done
- [ ] **Build default correlation matrix** — In `src/data/correlations.ts`, define the full pairwise correlation matrix with all weights from spec section 6 (age->techLiteracy: -0.4, education->vocabComplexity: +0.6, extraversion->verbosity: +0.5, agreeableness->politeness: +0.6, neuroticism->patience: -0.5, etc.). Use the `source.path->target.path` key format. | Status: not_done
- [ ] **Build message templates** — In `src/data/templates.ts`, create ~10 templates per motivation category (information-seeking, task-completion, exploration, frustration) with `{topic}` placeholders. Also include filler phrases, context sentences, closing phrases for verbosity expansion, and casual/formal starters. | Status: not_done
- [ ] **Build vocabulary word lists** — In `src/data/vocabulary.ts`, create simple-to-complex synonym mappings (e.g., "use"/"utilize", "help"/"assistance", "big"/"substantial", "good"/"exemplary", "bad"/"detrimental") for vocabulary complexity adjustment in message generation. | Status: not_done
- [ ] **Build location lists** — In `src/data/locations.ts`, create location lists organized by locale, including city/region/country combinations. Occupations and income should influence location selection. | Status: not_done

## Phase 5: Trait Correlation Engine

- [ ] **Implement correlation engine core** — In `src/correlation.ts`, implement the conditional distribution adjustment algorithm: given a target trait T with base distribution, conditioning traits C_1..C_n with weights w_1..w_n, compute the combined shift, adjust the distribution center, sample, and clamp. For Gaussian distributions, shift the mean. For categorical distributions, multiply weights by `exp(shift * position)` and renormalize. | Status: not_done
- [ ] **Implement normalize function for conditioning traits** — Map each conditioning trait's value to [-1, 1]: continuous 0-1 traits map linearly, integer 1-5 traits map via `(value - 3) / 2`, enum values map to predefined positions. | Status: not_done
- [ ] **Support custom correlation overrides** — Allow users to pass `correlations: Record<string, number>` in options. Merge custom correlations with the default matrix, where custom entries override defaults. Support the `source.path->target.path` key format. | Status: not_done
- [ ] **Implement generation order enforcement** — Ensure traits are generated in the fixed dependency order specified in section 6: age, gender, Big Five, occupation, education, income, location, language, name, technical literacy, digitalNative, devices, platformFamiliarity, formality, verbosity, emojiUsage, typoRate, politeness, directness, vocabComplexity, sentenceLength, patience, detailOrientation, followUpLikelihood, complaintTendency, escalationSpeed, context fields, systemPrompt, summary. | Status: not_done
- [ ] **Write correlation engine tests** — `src/__tests__/correlation.test.ts`: Verify conditional distributions shift correctly. Given age=75 and age->techLiteracy weight -0.4, techLiteracy should average below 3 over 1,000 samples. Test multiple correlation pairs. Verify custom overrides work. Verify zero-weight correlations produce no shift. | Status: not_done

## Phase 6: Trait Generators

- [ ] **Implement age generator** — In `src/traits/demographics.ts`, generate age from Gaussian(38, 15) clamped to 18-90. Age is an anchor trait (unconditioned). | Status: not_done
- [ ] **Implement gender generator** — Generate gender from categorical distribution: male 48%, female 48%, non-binary 4%. Gender is an anchor trait. | Status: not_done
- [ ] **Implement Big Five personality generators** — In `src/traits/personality.ts`, generate all five OCEAN scores independently from Gaussian(0.5, 0.2) clamped to 0-1. These are anchor traits. | Status: not_done
- [ ] **Implement occupation generator** — Generate occupation from the occupation table, conditioned on age. Younger personas bias toward student/entry-level, older personas toward retired/senior roles. Use the occupation table's education range and income tendency for subsequent conditioning. | Status: not_done
- [ ] **Implement education generator** — Generate education level conditioned on age and occupation. Use the occupation table's education range as the primary driver. Younger ages (18-22) bias toward lower education levels. | Status: not_done
- [ ] **Implement income bracket generator** — Generate income bracket conditioned on education, occupation, and age. Higher education and technical/professional occupations bias toward higher income. | Status: not_done
- [ ] **Implement location generator** — Generate location conditioned on occupation and income. Use locale-appropriate location lists from `src/data/locations.ts`. | Status: not_done
- [ ] **Implement language generator** — Generate primary language conditioned on location. Most locations default to the locale's primary language. | Status: not_done
- [ ] **Implement name generator** — Generate name conditioned on gender and language/location. Select from culturally appropriate first/last name pools in `src/data/names.ts`. | Status: not_done
- [ ] **Implement technical literacy generator** — In `src/traits/technical.ts`, generate technical literacy (1-5) conditioned on age, occupation, and education. Apply correlation weights: age(high)->techLiteracy(-0.4), occupation(technical)->techLiteracy(+0.7). | Status: not_done
- [ ] **Implement digitalNative derivation** — Derive `digitalNative` boolean from age: `true` if age < 36 (born after ~1990). This is a deterministic derivation, not a random sample. | Status: not_done
- [ ] **Implement preferred devices generator** — Generate preferred devices conditioned on age and technical literacy. Younger/tech-savvy personas favor smartphones and laptops. Older personas may favor desktop or tablet. | Status: not_done
- [ ] **Implement platform familiarity generator** — Generate platform familiarity conditioned on technical literacy and context. Higher technical literacy increases the chance of 'advanced' familiarity. | Status: not_done
- [ ] **Implement formality generator** — In `src/traits/communication.ts`, generate formality (1-5) conditioned on education, age, and extraversion. Higher education and older age bias toward higher formality. Extraversion(low) slightly increases formality. | Status: not_done
- [ ] **Implement verbosity generator** — Generate verbosity (1-5) conditioned on extraversion and openness. High extraversion strongly increases verbosity (+0.5). High openness slightly increases verbosity (+0.2). | Status: not_done
- [ ] **Implement emoji usage generator** — Generate emoji usage (none/light/heavy) conditioned on age and formality. Younger users and low-formality personas favor emoji. Age(low,<30)->emojiUsage(+0.5). | Status: not_done
- [ ] **Implement typo rate generator** — Generate typo rate (0.0-0.2) conditioned on education, age, and preferred devices. Higher education reduces typos (-0.3). Smartphone as primary device increases typos (+0.2). | Status: not_done
- [ ] **Implement politeness generator** — Generate politeness (1-5) conditioned on agreeableness and age/culture. High agreeableness strongly increases politeness (+0.6). Older age slightly increases politeness. | Status: not_done
- [ ] **Implement directness generator** — Generate directness (1-5) conditioned on extraversion and culture. High extraversion increases directness. Low agreeableness increases directness (+0.3). | Status: not_done
- [ ] **Implement vocabulary complexity generator** — Generate vocabulary complexity (1-5) conditioned on education, occupation, and formality. Higher education strongly increases vocab complexity (+0.6). Openness also contributes (+0.3). | Status: not_done
- [ ] **Implement sentence length generator** — Generate sentence length (short/medium/long) conditioned on verbosity and formality. High verbosity and high formality bias toward long sentences. | Status: not_done
- [ ] **Implement patience generator** — In `src/traits/behavior.ts`, generate patience (1-5) conditioned on neuroticism and context motivation. High neuroticism reduces patience (-0.5). Frustration context reduces patience (-0.6). | Status: not_done
- [ ] **Implement detail orientation generator** — Generate detail orientation (1-5) conditioned on conscientiousness and openness. High conscientiousness strongly increases detail orientation (+0.6). | Status: not_done
- [ ] **Implement follow-up likelihood generator** — Generate follow-up likelihood (0-1) conditioned on conscientiousness and patience. High conscientiousness increases follow-up likelihood (+0.4). | Status: not_done
- [ ] **Implement complaint tendency generator** — Generate complaint tendency (0-1) conditioned on neuroticism and agreeableness. High neuroticism increases complaints (+0.4). High agreeableness decreases complaints (-0.4). | Status: not_done
- [ ] **Implement escalation speed generator** — Generate escalation speed (1-5) conditioned on neuroticism and patience. High neuroticism increases escalation speed (+0.5). | Status: not_done
- [ ] **Implement context fields generator** — Generate motivation, productFamiliarity, and sessionContext from categorical distributions. These can be constrained via options or randomized. | Status: not_done
- [ ] **Implement summary derivation** — Generate a one-line summary string from key traits (name, age, occupation, communication style highlights). Example: "Margaret Chen, 67, retired teacher, formal and verbose communicator". | Status: not_done
- [ ] **Implement UUID generation for persona id** — Generate a unique `id` for each persona using Node.js `crypto` module. The UUID should be deterministic based on the persona's seed for reproducibility. | Status: not_done
- [ ] **Write trait generator tests** — `src/__tests__/traits.test.ts`: For each trait generator, verify: (a) values are within valid range, (b) constraints are respected, (c) conditioning shifts the distribution in the expected direction over many samples, (d) determinism with same seed. | Status: not_done

## Phase 7: Single Persona Generation (`generate()`)

- [ ] **Implement `generate()` function** — In `src/persona.ts`, implement the `generate(options?)` function that: initializes PRNG with seed (default 42), samples anchor traits, samples dependent traits in order with correlation conditioning, computes derived traits, returns a complete `Persona` object. | Status: not_done
- [ ] **Wire up `generate()` export** — Export `generate` from `src/index.ts` as a top-level function. | Status: not_done
- [ ] **Handle default options** — If no options provided, use seed=42, locale='en-US', default correlations, no constraints. | Status: not_done
- [ ] **Write single generation tests** — `src/__tests__/generate.test.ts`: Verify a persona has all fields populated, all values within range, determinism (same seed = same persona), different seeds produce different personas. | Status: not_done

## Phase 8: Batch Generation (`generateBatch()`)

- [ ] **Implement `generateBatch()` function** — Implement batch generation in `src/persona.ts` or `src/generator.ts`. Accept `count` and `options`. Generate `count` personas using sequential per-persona seeds derived from the global seed. | Status: not_done
- [ ] **Implement random batch strategy** — For the random strategy, generate `count` personas independently. Each persona gets seed `hash(globalSeed + index)`. | Status: not_done
- [ ] **Wire up `generateBatch()` export** — Export `generateBatch` from `src/index.ts`. | Status: not_done
- [ ] **Auto-select strategy** — Default to `diverse` strategy for count > 1, `random` for count = 1, unless explicitly overridden via options. | Status: not_done
- [ ] **Write batch generation tests** — `src/__tests__/batch.test.ts`: Verify correct count, all personas valid, determinism, all personas have unique IDs, sequential seeds produce different personas. | Status: not_done

## Phase 9: Diversity Optimization & Metrics

- [ ] **Implement trait normalization for distance** — Normalize all trait values to [0, 1]: continuous 0-1 traits used directly, integer 1-5 divided by 5, categorical traits encoded as one-hot vectors. | Status: not_done
- [ ] **Implement pairwise distance computation** — Compute weighted Euclidean distance between two personas in normalized trait space: `sqrt(sum(weight_i * (trait_i_a - trait_i_b)^2))`. Allow configurable dimension weights. | Status: not_done
- [ ] **Implement max-min diversity selection** — In `src/diversity.ts`, implement the diversity optimization algorithm: (1) oversample N*factor candidates, (2) compute pairwise distances, (3) seed with the most "unusual" candidate (furthest from centroid), (4) iteratively select the candidate maximizing minimum distance to any selected persona, (5) stop at N personas. | Status: not_done
- [ ] **Integrate diversity optimization into generateBatch** — When strategy is `diverse` (default for count > 1), apply max-min diversity selection to the generated candidates. Support configurable `oversamplingFactor` (default 3), `minDistance` (default 0.1), `maxIterations` (default 100). | Status: not_done
- [ ] **Implement dimensional coverage metric** — For each trait dimension: continuous traits divided into 10 bins (coverage = bins with >= 1 persona / 10), integer scale traits (coverage = distinct values / 5), categorical traits (coverage = distinct values / total possible). Overall = mean across dimensions. | Status: not_done
- [ ] **Implement demographic diversity index** — Compute Shannon entropy `H = -sum(p_i * log2(p_i))` separately for gender, education, income, and occupation category. Normalize by `log2(n_categories)`. Return the mean normalized entropy. | Status: not_done
- [ ] **Implement communication style spread** — Compute standard deviation of each communication style parameter across the persona set, average and normalize. | Status: not_done
- [ ] **Implement uniqueness score** — Compute minimum pairwise distance across all personas in normalized trait space, normalized to [0, 1]. | Status: not_done
- [ ] **Implement `computeDiversity()` function** — Combine all metrics into a `DiversityReport` object. Compute overall score as a weighted mean. Generate warnings for underrepresented trait ranges (e.g., "no personas with age > 70"). | Status: not_done
- [ ] **Wire up `computeDiversity()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Write diversity tests** — `src/__tests__/diversity.test.ts`: Verify diverse set has higher minimum pairwise distance than random set over 100 trials. Verify metrics are computed correctly. Verify oversampling factor increase does not decrease diversity score (monotonicity). Verify dimensional coverage, entropy, and uniqueness calculations against hand-computed values. | Status: not_done

## Phase 10: Targeted Generation (`generateTargeted()`)

- [ ] **Implement criteria parsing** — Parse `PersonaCriteria` into trait constraints: exact values, ranges `{ min, max }`, or value sets (arrays). Map criteria paths to trait generation steps. | Status: not_done
- [ ] **Implement constrained trait sampling** — During trait generation in dependency order, when a constrained trait is reached, sample from the constrained range/set instead of the base conditioned distribution. Unconstrained traits that depend on constrained traits use correlations normally. | Status: not_done
- [ ] **Implement retry logic for conflicting constraints** — If a generated persona fails to satisfy all constraints (due to conflicting criteria), retry with a different PRNG draw up to a max retry count. If criteria are fundamentally contradictory (e.g., age=20 + education=doctorate), succeed but emit a warning. | Status: not_done
- [ ] **Implement `generateTargeted()` function** — Accept `criteria`, `count` (default 1), and `options`. Return `Persona[]` matching the criteria. | Status: not_done
- [ ] **Wire up `generateTargeted()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Write targeted generation tests** — `src/__tests__/targeted.test.ts`: Generate 20 personas with `{ age: { min: 60 }, technical: { literacy: { max: 2 } } }`. Verify all 20 satisfy constraints. Verify other traits are in valid ranges. Verify contradictory constraints produce warnings. Run 1,000 trials with random criteria to verify constraint satisfaction (property test). | Status: not_done

## Phase 11: Cluster-Based Generation

- [ ] **Implement cluster-based generation** — In `generateBatch()`, when `clusters` option is provided: parse cluster definitions, generate the specified count per cluster using targeted generation with cluster criteria, apply within-cluster diversity optimization, tag each persona with its cluster name. | Status: not_done
- [ ] **Handle cluster count balancing** — If total cluster counts don't match the requested batch count, adjust proportionally or raise an error. | Status: not_done
- [ ] **Write cluster generation tests** — Verify correct count per cluster, each persona satisfies its cluster's criteria, within-cluster diversity is optimized, cluster names are attached to personas. | Status: not_done

## Phase 12: From-Distribution Generation

- [ ] **Implement distribution matching generation** — In `generateBatch()`, when `distribution` option is provided: parse target trait-value-percentage tuples, compute target counts, generate personas in rounds tracking current distribution, favor underrepresented values in each round. | Status: not_done
- [ ] **Implement distribution tolerance check** — After all personas are generated, verify the final distribution matches targets within a configurable tolerance. Report deviations. | Status: not_done
- [ ] **Write distribution matching tests** — Verify generated set matches target proportions within tolerance. Test with age range distributions and gender distributions from the spec examples. | Status: not_done

## Phase 13: Message Generation (`generateMessage()`)

- [ ] **Implement template selection (Stage 1)** — Select a sentence template from the template bank based on the topic and persona's motivation. Use the seeded PRNG to pick from ~10 templates per motivation category. Substitute `{topic}` placeholder. | Status: not_done
- [ ] **Implement formality adjustment (Stage 2)** — Adjust template text based on `communication.formality`: 1-2 applies contractions, removes politeness, adds casual starters; 3 leaves as-is; 4-5 expands contractions, adds formal address and politeness markers. | Status: not_done
- [ ] **Implement verbosity adjustment (Stage 3)** — Adjust message length based on `communication.verbosity`: 1 strips to core question; 2 one short sentence; 3 one-two sentences with context; 4 two-three sentences; 5 three-five sentences with background, explanation, and closing. Use filler/context/closing phrase banks. | Status: not_done
- [ ] **Implement typo injection (Stage 4a)** — For each word, with probability `communication.typoRate`, introduce a random typo: adjacent key swap, doubled letter, or letter transposition. QWERTY-aware key adjacency map. | Status: not_done
- [ ] **Implement emoji injection (Stage 4b)** — If emojiUsage is `light`, append one emoji from curated list at end. If `heavy`, insert emoji after sentences and in place of some punctuation. Use curated, topic-appropriate emoji list. | Status: not_done
- [ ] **Implement vocabulary adjustment (Stage 4c)** — If vocabularyComplexity 1-2, replace complex words with simple synonyms. If 4-5, replace simple words with complex synonyms. Use the synonym mappings from `src/data/vocabulary.ts`. | Status: not_done
- [ ] **Implement capitalization adjustment (Stage 4d)** — Casual young personas: lowercase throughout. Frustrated high-neuroticism personas: occasional ALL CAPS on emphasized words. Formal personas: proper capitalization. | Status: not_done
- [ ] **Implement punctuation adjustment (Stage 4e)** — Casual personas may omit periods. Frustrated personas use multiple exclamation marks. Formal personas always use proper punctuation. | Status: not_done
- [ ] **Implement sentence length adjustment (Stage 5)** — `short`: break long sentences at conjunctions/commas (target 5-10 words). `medium`: leave as-is (10-20 words). `long`: combine short sentences with conjunctions (20-35 words). | Status: not_done
- [ ] **Implement `generateMessage()` function** — Wire up all 5 stages into a single pipeline. Accept persona, topic, and optional MessageOptions (seed, maxLength, includeGreeting, includeClosing). Return the generated message string. | Status: not_done
- [ ] **Wire up `generateMessage()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Write message generation tests** — `src/__tests__/message.test.ts`: Verify high-formality personas produce messages with "please" and complete sentences. Verify high-typo-rate personas have more character errors. Verify verbose personas produce longer messages. Verify terse personas produce short messages. Verify emoji presence/absence matches emojiUsage. Verify determinism. Verify maxLength is respected. | Status: not_done

## Phase 14: Conversation Generation (`generateConversation()`)

- [ ] **Implement turn-based state evolution** — Track persona state across turns: patience degrades by `1/behavior.patience` per turn for low-patience personas. Directness increases in follow-ups. Frustrated personas add escalation markers. | Status: not_done
- [ ] **Implement follow-up decision logic** — After each turn, use `behavior.followUpLikelihood` and the PRNG to decide if the conversation continues. If below threshold, mark the message as `isFinal: true`. | Status: not_done
- [ ] **Implement emotional state progression** — Track and return `emotionalState` per turn: starts at 'neutral', progresses based on patience degradation and persona traits. Frustrated personas trend toward 'frustrated' and 'angry'. Patient personas stay 'neutral' or 'satisfied'. | Status: not_done
- [ ] **Implement context references in follow-ups** — Follow-up messages include phrases like "As I mentioned earlier...", "I already tried that...", and escalation markers for frustrated personas ("I've been waiting...", "Can I speak to a manager?"). | Status: not_done
- [ ] **Implement `generateConversation()` function** — Accept persona, turns (max), and ConversationOptions (topic, seed, maxTurns). Return `Message[]` array. | Status: not_done
- [ ] **Wire up `generateConversation()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Write conversation generation tests** — `src/__tests__/conversation.test.ts`: Verify correct number of turns (up to max). Verify emotional state progresses for frustrated persona. Verify isFinal is set on last message. Verify follow-up likelihood affects conversation length. Verify determinism. | Status: not_done

## Phase 15: System Prompt Generation (`toSystemPrompt()`)

- [ ] **Implement identity segment** — "You are {name}, a {age}-year-old {occupation} from {location}." | Status: not_done
- [ ] **Implement education segment** — "You have a {education} degree in {field}." where field is inferred from occupation. | Status: not_done
- [ ] **Implement technical profile segment** — "You are {literacy_description} with technology." Map literacy 1-5 to descriptions: "very unfamiliar", "not very comfortable", "reasonably comfortable", "quite comfortable", "highly proficient". | Status: not_done
- [ ] **Implement communication style segment** — "You communicate in a {formality_adj}, {verbosity_adj} style." Add clauses for emoji usage, grammar/spelling tendencies. | Status: not_done
- [ ] **Implement personality summary segment** — Generate from the 2-3 most extreme Big Five scores (>0.7 or <0.3). Map each to natural language descriptions. | Status: not_done
- [ ] **Implement behavioral tendencies segment** — "You are {patience_adj} and {detail_adj}." Add frustration-specific additions for frustrated personas. | Status: not_done
- [ ] **Implement context segment** — "You are contacting {product} because {motivation_description}. You are a {familiarity_adj} user." | Status: not_done
- [ ] **Implement brief quality level** — 1-2 sentences: identity and communication style only. | Status: not_done
- [ ] **Implement standard quality level** — 4-6 sentences: identity, communication style, personality highlights, context. This is the default. | Status: not_done
- [ ] **Implement detailed quality level** — 8-12 sentences: all trait dimensions described explicitly with behavioral instructions. | Status: not_done
- [ ] **Implement custom template support** — Accept a template string with `{variable}` placeholders. Map all persona trait fields plus derived descriptive variants (formality_adj, verbosity_adj, literacy_description, etc.) to template variables. Substitute all placeholders. | Status: not_done
- [ ] **Implement `toSystemPrompt()` function** — Accept persona and optional SystemPromptOptions. Return the assembled system prompt string. | Status: not_done
- [ ] **Wire up `toSystemPrompt()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Wire system prompt into persona generation** — The `systemPrompt` field on the Persona object should be populated during generation using `toSystemPrompt(persona)` with standard level. | Status: not_done
- [ ] **Write system prompt tests** — `src/__tests__/system-prompt.test.ts`: Verify output contains persona name, age, occupation, and communication style descriptions. Verify brief < standard < detailed in length. Verify custom templates substitute variables correctly. Verify all three levels produce valid output for diverse personas. | Status: not_done

## Phase 16: Factory Function (`createGenerator()`)

- [ ] **Implement `createGenerator()` factory** — In `src/generator.ts`, implement a factory function that accepts `GeneratorConfig` and returns a `PersonaGenerator` instance. The instance stores the config and provides all generation methods with the stored defaults. | Status: not_done
- [ ] **Implement config merging on method calls** — Each method on `PersonaGenerator` accepts optional partial options that merge with the stored config defaults. Method-level options override factory-level config. | Status: not_done
- [ ] **Wire up `createGenerator()` export** — Export from `src/index.ts`. | Status: not_done
- [ ] **Write generator factory tests** — Verify factory produces a generator with all methods. Verify factory-level seed is used as default. Verify method-level options override factory config. Verify custom correlations are applied. | Status: not_done

## Phase 17: CLI Implementation

- [ ] **Implement CLI entry point** — In `src/cli.ts`, set up the CLI entry point with a shebang (`#!/usr/bin/env node`), parse top-level `--version` and `--help` flags. Print version from package.json. | Status: not_done
- [ ] **Implement `generate` command** — Parse flags: `--count/-n`, `--age`, `--gender`, `--occupation`, `--education`, `--tech-literacy`, `--motivation`, `--seed`, `--locale`, `--strategy`, `--output/-o`, `--format`, `--pretty`, `--fields`, `--summary-only`. Call the appropriate generation function based on flags. | Status: not_done
- [ ] **Implement `message` command** — Parse flags: `--persona` (file path), `--persona-inline` (JSON string), `--topic` (required), `--seed`, `--max-length`, `--greeting`, `--closing`, `--output/-o`. Read persona from file or inline JSON, call `generateMessage()`. | Status: not_done
- [ ] **Implement `prompt` command** — Parse flags: `--persona`, `--persona-inline`, `--level`, `--template`, `--product`, `--output/-o`. Call `toSystemPrompt()`. | Status: not_done
- [ ] **Implement `diversity` command** — Accept a file path positional argument (JSON or JSONL personas file). Parse flags: `--format` (human/json), `--output/-o`. Call `computeDiversity()`. | Status: not_done
- [ ] **Implement JSON output format** — Serialize persona(s) as pretty-printed or compact JSON. | Status: not_done
- [ ] **Implement JSONL output format** — Serialize each persona as one JSON line (no newlines within the JSON). | Status: not_done
- [ ] **Implement CSV output format** — Flatten persona objects to columns. Handle nested fields with dot notation (e.g., `demographics.age`). Support `--fields` to select specific columns. | Status: not_done
- [ ] **Implement summary-only output** — When `--summary-only` is set, output only the summary line per persona with numbering. | Status: not_done
- [ ] **Implement configuration file loading** — Search for `.synth-personas.json` in CWD, then `synth-personas` key in `package.json`. Merge config with CLI flags (CLI flags take precedence). Respect `SYNTH_PERSONAS_CONFIG` env var for custom config path. | Status: not_done
- [ ] **Implement environment variable support** — Read `SYNTH_PERSONAS_SEED`, `SYNTH_PERSONAS_LOCALE`, `SYNTH_PERSONAS_CONFIG` environment variables. Apply configuration precedence: defaults < config file < env vars < CLI flags. | Status: not_done
- [ ] **Implement exit codes** — Exit 0 on success, 1 on error (file not found, generation failure), 2 on usage error (invalid flags, missing required arguments). | Status: not_done
- [ ] **Implement file output (-o flag)** — When `--output` is specified, write to file instead of stdout. | Status: not_done
- [ ] **Implement generation timing** — Display timing info in human-readable output: "Generated N personas (seed: X) in Yms". | Status: not_done
- [ ] **Write CLI tests** — `src/__tests__/cli.test.ts`: Test all four commands with various flag combinations. Verify exit codes. Verify output format validity (parseable JSON, valid JSONL, valid CSV). Verify `--summary-only` output. Verify config file loading. Verify environment variable support. | Status: not_done

## Phase 18: Integration Tests

- [ ] **Full pipeline integration test** — Generate 100 personas with default settings. Verify all have complete, valid trait values. Run a coherence validation function that checks for statistically implausible combinations. | Status: not_done
- [ ] **Targeted generation integration test** — Generate 20 personas with `{ age: { min: 60 }, technical: { literacy: { max: 2 } } }`. Verify all 20 satisfy constraints. Verify correlated traits reflect expected patterns (e.g., higher formality for older personas). | Status: not_done
- [ ] **Batch diversity integration test** — Generate 50 personas with diversity optimization. Compute diversity metrics. Verify overall score exceeds 0.7. | Status: not_done
- [ ] **Message diversity integration test** — Generate messages for 10 different personas on the same topic. Verify messages differ in formality, length, vocabulary. Verify high-typo-rate personas have more errors than low-typo-rate personas. | Status: not_done
- [ ] **Conversation integration test** — Generate a 5-turn conversation for a frustrated persona. Verify emotional state progresses toward frustrated/angry. Verify tone escalation. | Status: not_done
- [ ] **Determinism integration test** — Generate the same batch twice with the same seed. Verify byte-identical JSON output. | Status: not_done
- [ ] **CLI output integration test** — Run CLI commands via child process. Verify exit codes, output format validity (JSON/JSONL/CSV), and persona correctness. | Status: not_done

## Phase 19: Property-Based Tests

- [ ] **Range validity property test** — For any generated persona (over many random seeds), verify every trait value is within its defined range. | Status: not_done
- [ ] **Correlation direction property test** — Over 500 random personas, verify traits with positive correlation have positive Pearson correlation coefficient, and traits with negative correlation have negative coefficient. | Status: not_done
- [ ] **Diversity monotonicity property test** — For diverse set generation, verify that increasing the oversampling factor does not decrease the diversity score. | Status: not_done
- [ ] **Constraint satisfaction property test** — Run targeted generation 1,000 times with random criteria combinations. Verify constraint satisfaction 100% of the time. | Status: not_done

## Phase 20: Performance Verification

- [ ] **Benchmark single persona generation** — Verify single persona generation completes in < 1ms. | Status: not_done
- [ ] **Benchmark batch of 100 (random)** — Verify < 10ms. | Status: not_done
- [ ] **Benchmark batch of 100 (diverse)** — Verify < 50ms. | Status: not_done
- [ ] **Benchmark batch of 1,000 (diverse)** — Verify < 500ms. | Status: not_done
- [ ] **Benchmark message generation** — Verify < 1ms per message. | Status: not_done
- [ ] **Benchmark conversation generation (5 turns)** — Verify < 5ms. | Status: not_done
- [ ] **Benchmark system prompt generation** — Verify < 1ms. | Status: not_done
- [ ] **Benchmark diversity metrics (50 personas)** — Verify < 10ms. | Status: not_done
- [ ] **Verify memory usage** — Single persona ~2KB serialized, batch of 1,000 ~2MB, built-in data tables ~100KB. | Status: not_done

## Phase 21: Documentation

- [ ] **Write README.md** — Comprehensive README with: package overview, installation instructions, quick start example, API reference for all public functions (`generate`, `generateBatch`, `generateTargeted`, `generateMessage`, `generateConversation`, `toSystemPrompt`, `createGenerator`, `computeDiversity`), CLI usage reference, configuration reference, integration examples (eval-dataset, fewshot-gen, llm-regression, synthdata-gen), and badge/metadata. | Status: not_done
- [ ] **Add JSDoc comments to all public functions** — Every exported function, interface, and type alias must have JSDoc comments describing purpose, parameters, return value, and a usage example. | Status: not_done
- [ ] **Document configuration file format** — In the README, document the `.synth-personas.json` format, `package.json` `synth-personas` key, and environment variables with examples. | Status: not_done
- [ ] **Document correlation customization** — Explain how to override correlations using the `source.path->target.path` key format with examples. | Status: not_done

## Phase 22: Final Polish & Publishing Prep

- [ ] **Verify zero runtime dependencies** — Confirm `package.json` has no `dependencies` entries. All functionality uses built-in Node.js APIs and bundled data tables. | Status: not_done
- [ ] **Verify TypeScript strict mode** — Ensure the project compiles cleanly under `"strict": true` with no type errors. | Status: not_done
- [ ] **Run full test suite and verify all pass** — `npm run test` with all tests passing. | Status: not_done
- [ ] **Run linter and verify clean** — `npm run lint` with no errors or warnings. | Status: not_done
- [ ] **Run build and verify clean** — `npm run build` produces `dist/` with `.js`, `.d.ts`, and `.d.ts.map` files. | Status: not_done
- [ ] **Verify package.json metadata** — Ensure `name`, `version`, `description`, `main`, `types`, `files`, `bin`, `keywords`, `license`, `engines` are all set correctly. Add relevant `keywords` (e.g., "persona", "synthetic", "testing", "AI", "evaluation"). | Status: not_done
- [ ] **Bump version to 0.1.0** — Confirm version is set to `0.1.0` for initial release. | Status: not_done
- [ ] **Verify deterministic output** — Run the full generation pipeline with seed=42 and confirm the output matches expected fixtures. | Status: not_done
- [ ] **Test npx invocation** — Verify `npx synth-personas generate -n 3 --summary-only` works after `npm pack`. | Status: not_done
