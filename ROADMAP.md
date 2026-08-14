# Help Me Make Choice — Implementation Roadmap

## Product direction

Help Me Make Choice is already a working MVP: users can maintain a list of food choices, spin a wheel, and receive a result. The next stage is to turn it from a single-purpose “what should I eat?” page into a reusable general-purpose decision tool while improving maintainability, correctness, accessibility, testing, and project presentation.

The guiding rule for the roadmap is **do not rewrite the application**. Preserve the current experience, improve the foundation first, and then add capabilities in small, reviewable pull requests.

---

## Current strengths

- Working Next.js / React application with Ant Design UI.
- Responsive wheel implementation using canvas.
- Add, remove, reset, duplicate prevention, and persisted session state already exist.
- Jest + Testing Library tests cover the main user flow.
- Static export and GitHub Pages deployment are already configured and the latest deployment is successful.
- Husky, ESLint, Jest coverage, and Sonar configuration already provide a quality-tooling foundation.

## Main gaps

1. `app/page.tsx` owns data, persistence, validation, state management, and presentation.
2. `Wheel.tsx` mixes wheel math, randomness, animation, canvas rendering, and UI state.
3. Persistence uses `sessionStorage`, so customized choices disappear after the browser session ends.
4. The product is hard-coded around food even though the repository already has enhancement stories for general categories.
5. Accessibility and reduced-motion behavior need improvement.
6. GitHub Pages deployment builds the project but does not currently use lint/tests as a deployment quality gate.
7. README is still the default create-next-app content.
8. Static assets include unused starter files and an oversized icon asset.

---

# Recommended execution order

## Phase 1 — Foundation and safety

### 1. #16 — Extract choice state, presets, and storage from `app/page.tsx`

**Purpose:** make future feature work inexpensive and safe.

Target architecture (names are suggestions, not requirements):

```text
app/
  components/
    Wheel.tsx
    ChoiceList.tsx
    PresetSelector.tsx
  data/
    presets.ts
  hooks/
    useChoices.ts
    useChoiceStorage.ts
  lib/
    choices.ts
    wheel.ts
  page.tsx
```

Keep this PR behavior-preserving. Do not combine it with large UI changes.

### 2. #21 — Add PR quality checks

Add CI for:

```bash
npm ci
npm run lint
npm test -- --runInBand
npm run build
```

This should land early so every later Codex-generated PR is automatically checked.

### 3. #18 — Extract and harden wheel winner logic

Select the winner intentionally and derive the target rotation from that winner. This is easier to test than selecting an arbitrary rotation and reverse-calculating the winner afterward.

Important cases to test:

- first segment
- last segment
- every segment for several item counts
- boundary angles
- repeated spins
- very large accumulated rotations

---

## Phase 2 — Make the app reusable

### 4. #17 — Versioned persistent local storage

Move user state to `localStorage` behind the storage abstraction from #16.

Suggested conceptual schema:

```ts
type StoredChoiceState = {
  version: 2;
  activePresetId: string;
  lists: Record<string, string[]>;
};
```

The exact schema may differ, but it should be versioned so future migrations are possible.

### 5. #19 — Preset categories / general choice picker

This is the concrete implementation of existing product stories #2 and #11.

Initial suggested presets:

- Food
- Drinks / Milk Tea
- Activities
- Places
- Custom

Food remains the default first-run experience.

The page should gradually become product-generic. For example, the app-level identity can remain **Help Me Make Choice**, while preset-specific copy can say “今天吃什么”, “今天喝什么”, etc.

### 6. #24 — Editable/reorderable/importable lists

After presets and persistent storage exist, improve list management:

- edit an item
- reorder items
- clear with confirmation
- import/export

Prefer accessible move-up/move-down controls before adding a drag-and-drop library unless drag-and-drop clearly improves the UX.

---

## Phase 3 — UX and polish

### 7. #20 — Accessibility and reduced motion

Focus on the complete decision flow rather than isolated ARIA attributes:

1. user can understand available choices
2. user can operate controls with keyboard
3. spin state is communicated
4. result is announced
5. reduced-motion users can receive an immediate or shortened result

Also correct the document language: the current UI is Chinese while the root HTML language is English.

### 8. #22 — Static asset cleanup/performance

Remove unused starter assets and shrink icon resources. Confirm all paths under the GitHub Pages base path after the cleanup.

### 9. #23 — Product-quality README

The README should show the project as a real portfolio application, not a generated Next.js starter.

Recommended top section:

```text
Help Me Make Choice
Short explanation
Live Demo | Screenshot
Features
```

Then document architecture, commands, contribution workflow, deployment, and roadmap.

---

# Existing stories

## #2 — STORY: Enhancement

Keep this as the high-level product story. #19 is the first major concrete implementation task for it.

## #11 — Dropdown options to select different default category items

Keep this issue as the original product requirement. #19 should satisfy most or all of it. Close #11 after #19 is merged and acceptance criteria are verified.

---

# Suggested future backlog (do not prioritize before the roadmap above)

These ideas can become separate issues after the core roadmap is stable:

### Internationalization

- Chinese / English language switch
- preset text and metadata translation
- persist language preference

### Shareable choice lists

Encode a small list in the URL so a user can share a decision wheel without requiring a backend.

Example concept:

```text
/helpmemakechoice/?list=...
```

For long lists, use compressed URL-safe encoding or introduce a backend only if there is a demonstrated need.

### Decision history

Store recent winners locally and optionally provide:

- recent results
- avoid-last-winner mode
- statistics per choice

Avoid turning the selection algorithm into hidden weighting unless the UI explicitly explains it.

### Weighted choices

Allow optional weights while keeping uniform probability as the default.

### Installable PWA

This project is a good fit for an offline-capable PWA because it is static and primarily local-state driven.

### Better visual themes

Allow palette/theme changes only after the decision and accessibility experience is stable.

---

# Pull request strategy

Use one issue per pull request whenever practical.

Suggested branch naming:

```text
refactor/16-choice-state
ci/21-quality-checks
refactor/18-wheel-math
feature/17-local-storage
feature/19-presets
feature/24-list-management
ux/20-accessibility
perf/22-assets
docs/23-readme
```

A PR is ready to merge when:

- issue acceptance criteria are satisfied
- tests cover new behavior
- lint passes
- production build passes
- no unrelated refactor is included
- screenshots are included for meaningful UI changes

---

# Codex workflow

For each issue, give Codex the issue as the source of truth and ask it to:

1. inspect the repository before changing code
2. summarize the intended implementation
3. implement only that issue
4. add/update tests
5. run lint, tests, and build
6. summarize changed files and any follow-up work

A useful prompt pattern is:

```text
Implement GitHub issue #<number> in this repository.
Treat the issue acceptance criteria as requirements.
Inspect existing architecture and tests before editing.
Keep the change scoped to this issue; do not implement later roadmap items.
Add or update tests for the new behavior.
Run lint, tests, and production build before finishing.
If an acceptance criterion cannot be completed, explain exactly why instead of silently skipping it.
```

---

# Definition of the next milestone

The first meaningful milestone is complete when #16, #17, #18, #19, and #21 are merged.

At that point Help Me Make Choice will have:

- a maintainable internal structure
- persistent user state
- reliably tested wheel selection
- multiple decision categories
- automatic PR quality checks

That is the point where the repository moves from a small demo into a strong extensible portfolio project.
