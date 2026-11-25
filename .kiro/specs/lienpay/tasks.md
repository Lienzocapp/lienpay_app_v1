# Implementation Plan: LienPay

## Overview

This plan converts the LienPay design into a series of incremental, test-driven coding steps organized into the **12 implementation phases** defined in the design's *Phase Boundaries* section. Each task builds on prior tasks and ends by wiring new code into the existing app so there is no orphaned code.

Key rules that apply to every task:

- **Shared core, no duplicates.** Design tokens, typography, `Application_State`, `Mock_Service`, navigation config, the `Animation_System`, and the 23 reusable components are each authored **exactly once** and shared by both experiences (Req 14.2, 14.3, 14.6; Design: *Architecture*, *Components and Interfaces*).
- **Mock only, no network.** No task may add a real banking/PAN/Aadhaar/UPI/mutual-fund/pledge/payment API or any outbound network request; all async goes through the centralized `Mock_Service` (Req 13.1, 13.2; Design: *Mock Service Architecture*).
- **Screen content source of truth.** Every task that builds an individual screen MUST take the screen's exact copy, labels, fields, buttons, cards, values, states, and visual structure from the **LienPay Application Design Specification / screenshots** (the higher-precedence source), and MUST NOT invent screen content; where content is not yet supplied in text it must first be captured from the Design Specification/screenshots (Req 18.1, 20.1, 20.2, 20.4; Design: *Conflicts & Ambiguities — screen content source of truth*).
- **Character-for-character values.** All mandated financial values/labels are reproduced exactly through the central `Mock_Service` and the Indian formatter (Req 12.4; Design: *Data Models*, *Initial_Snapshot*).
- **Property-based tests** implement the 8 correctness properties (one PBT per property, fast-check) and are tagged `// Feature: lienpay, Property {number}: {property_text}` (Design: *Correctness Properties*, *Testing Strategy*).
- Sub-tasks marked with `*` are optional test tasks and can be skipped for a faster MVP; they are never core implementation.

## Tasks

- [x] 1. Phase 1 — Project scaffold and tooling (Foundation)
  - [x] 1.1 Scaffold the Vite + React 18 + TypeScript application and folder structure
    - Create the Vite/React/TS project and the `src/` folder structure from the design (`design-system/`, `state/`, `mock/`, `animation/`, `formatting/`, `navigation/`, `landing/`, `product/`) with `main.tsx` bootstrap.
    - Add `app-router.tsx` placeholder mount point (implemented fully in 4.12).
    - _Requirements: 17.1, 14.2_
    - _Design: Technology Choices, Folder Structure_
  - [x] 1.2 Configure the test toolchain (Vitest + React Testing Library + fast-check)
    - Add Vitest, RTL, and fast-check with a single-run script (no watch mode) and a jsdom environment.
    - _Requirements: 14.2_
    - _Design: Technology Choices, Testing Strategy_

- [ ] 2. Phase 1 — Design tokens, typography, and self-hosted fonts (Design System)
  - [ ] 2.1 Author centralized color tokens (7 fixed colors)
    - Create `design-system/tokens/tokens.css` and typed `tokens.ts` exposing exactly Background `#050505`, Panel `#111111`, Border `#252525`, Primary White `#FFFFFF`, Secondary Grey `#A0A0A0`, Primary Neon Green `#B6FF00`, Bright Neon Green `#AFFF00` as the single source consumed by all components.
    - _Requirements: 1.1, 1.2, 1.4, 1.9, 1.10, 14.2_
    - _Design: Technology Choices, Folder Structure_
  - [ ] 2.2 Author the centralized typography scale
    - Create `design-system/tokens/typography.css` defining font size/weight/line-height per text style from one central source, including the rule that key financial values render ≥1.5× adjacent label/body text.
    - _Requirements: 2.3, 2.4, 2.5, 14.2_
    - _Design: Technology Choices, Folder Structure_
  - [ ] 2.3 Bundle and load Satoshi locally via `@font-face` (no CDN)
    - Add local Satoshi woff2 assets under `design-system/fonts/satoshi/` and an `@font-face` declaration; define a single sans-serif fallback family preserving scale/weight/layout on load failure. No external network/CDN load.
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 2.8_
    - _Design: Technology Choices, Folder Structure, Error Handling_
  - [ ] 2.4 Add the non-token color validation (build-time lint) and token fallback path
    - Add a lint rule that flags any hard-coded color outside the seven tokens and a runtime default-token fallback that records unresolved-token conditions while preserving dark high-contrast presentation.
    - _Requirements: 1.3, 1.8, 3.5_
    - _Design: Technology Choices, Error Handling_
  - [ ]* 2.5 Write unit tests for token exposure, fallback, and color lint
    - Assert all seven tokens resolve from the single source, unknown text style falls back to default body style, and disallowed colors are flagged.
    - _Requirements: 1.3, 2.5, 3.5_
    - _Design: Error Handling_

- [x] 3. Phase 1 — Pure logic layer (formatter, state, resolver, reducers, validators)
  - [x] 3.1 Implement the Indian currency formatter
    - Create `formatting/inr.ts` with `formatINR(paise)` (Indian lakh grouping, per-value decimal formatting) and `parseINR(string)` inverse, no Western grouping/rounding/reformatting.
    - _Requirements: 12.4, 7.1, 21.6_
    - _Design: Data Models, Financial State Updates_
  - [x]* 3.2 Write property test for currency formatting round-trip
    - **Property 3: Indian currency formatting round-trip and grouping**
    - Tag: `// Feature: lienpay, Property 3: For any non-negative integer paise amount, formatting it produces a rupee string using Indian lakh digit grouping with the value's own decimal formatting, and parsing that formatted string returns the original amount (round-trip identity).`
    - **Validates: Requirements 12.4, 7.1, 21.6**
    - _Design: Correctness Properties (Property 3)_
  - [x] 3.3 Define status enumerations and the full `Application_State` shape
    - Create the `StepStatus`/`PledgeStatus`/`ActivationStatus`/`CreditHealth` enums and the typed `ApplicationState` interface (onboarding/verification/portfolio/pledge/bank/mandate/agreement/e-sign/final-review/activation status, financial display strings + paise mirrors, collections, `session` incl. `asyncInFlight`).
    - _Requirements: 19.1, 19.3_
    - _Design: State Model_
  - [x] 3.4 Author the canonical `Initial_Snapshot` and seed data
    - Create `state/initialSnapshot.ts` with the frozen snapshot (Portfolio ₹4,72,000, Credit_Limit ₹2,21,500, Available ₹2,21,500, Used ₹0, LTV fixed `"34%"`, Credit_Health `"Healthy"`, paise mirrors) and 5 seeded transactions (`origin: "seed"`) + repayments (Outstanding ₹24,680, Amount Due ₹8,240) sourced character-for-character from mock data.
    - _Requirements: 12.1, 12.2, 12.3, 19.2, 19.3, 19.5_
    - _Design: Initial_Snapshot (canonical), Data Models, Conflicts & Ambiguities (1, 2)_
  - [x] 3.5 Implement the Zustand store, `resetToSnapshot`, and selector skeleton
    - Create `state/store.ts` (in-memory/session-scoped store initialized from `INITIAL_SNAPSHOT`), `resetToSnapshot()` action, and `state/selectors.ts` skeleton (`selectCreditPosition`, `selectTransactions`, `selectActiveNavMode`, `selectResumeStep`).
    - _Requirements: 19.1, 19.2, 19.4, 19.7, 11.12, 5.9, 5.10_
    - _Design: State Model, Store choice/selectors/propagation_
  - [x]* 3.6 Write property test for reset-to-snapshot
    - **Property 6: Reset-to-snapshot is canonical and idempotent**
    - Tag: `// Feature: lienpay, Property 6: For any mutated Application_State, applying resetToSnapshot yields a state whose mandated values deep-equal the canonical INITIAL_SNAPSHOT, and applying resetToSnapshot twice produces the same result as applying it once (idempotence).`
    - **Validates: Requirements 19.7, 11.12, 5.10, 19.2**
    - _Design: Correctness Properties (Property 6)_
  - [x] 3.7 Implement the pure, read-only resume-step resolver
    - Create `state/resumeResolver.ts` with `resolveResumeStep(state)` returning the first incomplete step in the fixed 20-step order; no mutations, no status transitions, triggers no mock operations.
    - _Requirements: 22.8, 22.9, 22.10, 22.11_
    - _Design: Onboarding Resume Logic, Resolver is READ-ONLY_
  - [x]* 3.8 Write property test for resume resolver first-incomplete-step
    - **Property 1: Resume resolver returns the first incomplete step**
    - Tag: `// Feature: lienpay, Property 1: For any Application_State, the resume-step resolver returns the first step in the fixed 20-step order whose completion predicate is false, and every step preceding the returned step is complete (no completed step is ever restarted). If no activation step is complete, it returns the first pending onboarding step rather than any newly created screen.`
    - **Validates: Requirements 22.10, 22.8, 22.11**
    - _Design: Correctness Properties (Property 1)_
  - [x]* 3.9 Write property test for fixed 20-screen order invariance
    - **Property 2: Fixed 20-screen order is invariant**
    - Tag: `// Feature: lienpay, Property 2: For any Application_State, the ordered list of step ids produced by the resolver equals the mandated 20-screen sequence exactly (same items, same order, length 20) — no screen is added, removed, reordered, or inserted.`
    - **Validates: Requirements 5.1, 5.3, 7.7, 22.9**
    - _Design: Correctness Properties (Property 2)_
  - [x] 3.10 Implement the financial pay/repay reducers and store actions (paise arithmetic)
    - Create `state/reducers/financial.ts` with pure `recordPayment`/`recordRepayment` (paise integers, `availableCreditPaise + usedCreditPaise == creditLimitPaise`, non-negative used, display strings re-derived via `formatINR`; LTV/Credit_Health never recomputed) and wire `recordPayment`/`recordRepayment` store actions.
    - _Requirements: 21.4, 11.10, 11.11, 19.8, 19.3, 19.5_
    - _Design: Financial State Updates, State Model_
  - [x]* 3.11 Write property test for the credit-position invariant
    - **Property 4: Credit position invariant across any pay/repay sequence**
    - Tag: `// Feature: lienpay, Property 4: For any Initial_Snapshot and any finite sequence of simulated payment and repayment operations with amounts within the credit limit, after applying the sequence the equality availableCreditPaise + usedCreditPaise == creditLimitPaise holds, usedCreditPaise never becomes negative, and the displayed availableCredit/usedCredit strings equal the Indian-formatted values of the respective paise fields.`
    - **Validates: Requirements 21.4, 11.10, 19.8**
    - _Design: Correctness Properties (Property 4)_
  - [x]* 3.12 Write property test for fixed LTV and Credit_Health
    - **Property 7: LTV and Credit_Health are fixed display values**
    - Tag: `// Feature: lienpay, Property 7: For any sequence of pay/repay/pledge/credit-change operations, the ltv value remains the string "34%" and creditHealth remains "Healthy" — neither is ever recomputed from other state values.`
    - **Validates: Requirements 19.3, 19.5**
    - _Design: Correctness Properties (Property 7)_
  - [x] 3.13 Implement input validators
    - Create validators for required/whitespace and typed fields (mobile 10–15 digits, OTP exactly 6 digits, name 1–50 chars, bank fields) returning accept/reject with the offending field.
    - _Requirements: 6.5, 6.6, 8.3, 5.5_
    - _Design: Correctness Properties (Property 8), Error Handling_
  - [x]* 3.14 Write property test for input validators
    - **Property 8: Input validators reject empty, whitespace-only, and malformed input**
    - Tag: `// Feature: lienpay, Property 8: For any string that is empty or composed entirely of whitespace (and, for typed fields, any string violating the field's format such as a mobile number outside 10–15 digits or an OTP not exactly 6 digits), the corresponding validator rejects the input; for any well-formed value within the defined bounds, the validator accepts it.`
    - **Validates: Requirements 6.5, 6.6, 8.3, 5.5**
    - _Design: Correctness Properties (Property 8)_

- [ ] 4. Phase 1 — Mock service, animation system, reusable components, and route split
  - [x] 4.1 Implement the centralized `Mock_Service`, delay helpers, and central dataset
    - Create `mock/mockService.ts` (the full `MockService` interface: reads + simulated verification/setup + `processPledge` + `makeDemoPayment`/`makeRepayment`), `mock/delay.ts` (500–2000ms standard; 2000–5000ms for Pledge Processing), and `mock/data/*` from one central dataset. Success/error/unknown-request behavior; no outbound network.
    - _Requirements: 12.5, 12.6, 13.1, 13.2, 13.3, 13.4, 13.5, 7.6_
    - _Design: Mock Service Architecture_
  - [x]* 4.2 Write integration/smoke tests for delay bounds and no-network
    - Assert standard delays fall in 500–2000ms, Pledge Processing in 2000–5000ms, and that `fetch`/`XMLHttpRequest` are never called with external endpoints.
    - _Requirements: 13.1, 13.2, 13.3, 7.6_
    - _Design: Testing Strategy_
  - [x] 4.3 Implement animation contracts and the shared reduced-motion gate
    - Create `animation/contracts.ts` (durations/thresholds) and a `prefersReducedMotion()` helper consumed by both experiences.
    - _Requirements: 16.1, 16.5, 16.6, 4.8_
    - _Design: Animation Architecture, Reduced-motion gate_
  - [x] 4.4 Implement the restrained product motion utilities (built once)
    - Create `animation/product/` utilities `screenTransition` (200–400ms), `valueCountUp` (300–800ms), `fadeSlide`, `microInteraction` (100–250ms), ease-based only, honoring reduced-motion; native scrolling only.
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 17.4, 17.6_
    - _Design: Animation Architecture (Product utilities)_
  - [x] 4.5 Implement centralized navigation config and guards
    - Create `navigation/navConfig.ts` fixed-length tuples (`PRE_ACTIVATION_NAV` length 3, `ACTIVE_NAV` length 4) and `navigation/guards.ts` `assertNav()` enforcing exactly 3 / exactly 4 items, excluding Profile/Notifications/Pay/Learn/CreditLimitIncrease/Activate from bottom nav.
    - _Requirements: 9.1, 9.5, 10.1, 10.2, 10.9, 11.13, 11.14, 21.2_
    - _Design: Navigation Architecture, Enforcing exactly-N tabs_
  - [ ]* 4.6 Write unit tests for nav guards
    - Assert `PRE_ACTIVATION_NAV` is exactly Home/Benefits/Learn (3), `ACTIVE_NAV` is exactly Home/Transactions/Repayments/Portfolio (4), and forbidden items (profile, notifications, pay, learn, creditLimitIncrease, activate) are rejected.
    - _Requirements: 9.1, 9.5, 10.1, 10.2, 10.9, 11.13, 11.14, 21.2_
    - _Design: Enforcing exactly-N tabs, Testing Strategy_
  - [x] 4.7 Build the primitive input/button components
    - Build `PrimaryButton`, `SecondaryButton`, `InputField`, `OTPInput` consuming tokens, with visible focus indicators, accessible labels, and 44px minimum touch targets. Content/structure per the Design Specification.
    - _Requirements: 14.1, 14.5, 14.6, 3.7, 3.8, 15.1_
    - _Design: Components and Interfaces, Accessibility_
  - [x] 4.8 Build the layout/frame components
    - Build `AppShell` (TopBar + content + BottomNavigation frame), `TopBar` (Profile + Notifications icon-only controls with accessible labels), `BottomNavigation` (renders strictly from the active tuple; active item uses neon accent plus a non-color indicator).
    - _Requirements: 14.1, 3.6, 3.8, 10.4_
    - _Design: Components and Interfaces, Accessibility_
  - [x] 4.9 Build the financial/content card components
    - Build `FinancialCard`, `MetricCard`, `StatusCard`, `FundCard`, `TransactionCard`, `RepaymentCard`, `CreditHealthCard`, `ProgressStepper`, `ProcessTimeline`, `StickySummary`, `NotificationItem` using tokens, rounded corners, dark borders, and required contrast. Content/structure per the Design Specification.
    - _Requirements: 14.1, 14.5, 14.6, 3.1, 3.3_
    - _Design: Components and Interfaces_
  - [x] 4.10 Build the feedback/overlay components
    - Build `BottomSheet`, `Modal`, `SuccessState`, `ErrorState`, `LoadingState` for confirmations, success, validation/mock-failure, and async loading.
    - _Requirements: 14.1, 13.5, 11.7, 11.8_
    - _Design: Components and Interfaces, Error Handling_
  - [ ]* 4.11 Write component tests for the 23 reusable components
    - Assert identical rendering/behavior across usages, token consumption (token change propagates), visible focus, accessible labels on icon-only controls, non-color active indicator, and 44px targets.
    - _Requirements: 14.3, 14.5, 14.6, 3.6, 3.7, 3.8_
    - _Design: Components and Interfaces, Accessibility, Testing Strategy_
  - [x] 4.12 Implement the entry-level route split
    - Implement `app-router.tsx` with `React.lazy` + `Suspense` creating independent `landing` (`/`) and `app` (`/app`) chunks, both importing the shared core; landing motion libs kept out of the app chunk.
    - _Requirements: 17.1, 17.2, 17.5, 17.6, 4.14_
    - _Design: Architecture, Experience separation (code-splitting)_

- [ ] 5. Checkpoint — Shared core compiles and components render
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Phase 2 — Landing page (Experience A)
  - [ ] 6.1 Implement the Landing route with a landing-only motion runtime
    - Build `landing/LandingPage.tsx` and dynamically import Lenis + GSAP/ScrollTrigger inside the landing chunk only; smooth inertial scrolling (settles 0.8–1.2s, ≥60fps) scoped to Landing. Content/structure from the Design Specification.
    - _Requirements: 4.1, 4.7, 17.3, 17.5, 4.14_
    - _Design: Animation Architecture (Landing), Experience separation_
  - [ ] 6.2 Build the Landing sections and cinematic effects
    - Build hero, pinned/sticky storytelling sections, cards, animated financial numbers (to exact final value over 1000–2000ms), section/text reveals (≥10% visible, opacity 0→1, translate 16–32px→0 over 400–800ms), and the scroll navbar transition. Copy/values from the Design Specification (no invented content).
    - _Requirements: 4.2, 4.4, 4.9, 4.10, 4.12, 4.13, 20.1, 20.2, 20.4_
    - _Design: Animation Architecture (Landing), Conflicts & Ambiguities (screen content)_
  - [ ] 6.3 Apply parallax, glow limits, mobile-perf, and reduced-motion for Landing
    - Parallax max 60px; ≤3 glow elements/screen with subtle green-glow transition; reduce/disable parallax + glow below 768px; disable all reveals/parallax/number/glow/pinned motion under reduced-motion (present final states immediately); transform/opacity only.
    - _Requirements: 4.3, 4.6, 4.8, 4.11, 4.14, 1.6_
    - _Design: Animation Architecture (Landing), Reduced-motion gate_
  - [ ]* 6.4 Write tests for landing isolation and reduced-motion
    - Assert landing motion libs are not in the app chunk and that reduced-motion renders completed final states.
    - _Requirements: 4.8, 17.5, 17.6_
    - _Design: Testing Strategy_

- [x] 7. Phase 3 — Pre-Activation shell, Activate_Account_CTA, and resume wiring
  - [x] 7.1 Implement the state-aware `/app` entry redirect
    - `/app` renders no screen; it reads `activationStatus` and redirects `inactive`/`in_progress` → `/app/pre/home`, `active` → `/app/active/home`.
    - _Requirements: 22.14, 10.8_
    - _Design: Navigation Architecture (state-aware entry point)_
  - [x]* 7.2 Write unit tests for the `/app` redirect
    - Assert `inactive` and `in_progress` route to `/app/pre/home` and `active` routes to `/app/active/home`.
    - _Requirements: 22.14, 10.8_
    - _Design: Testing Strategy_
  - [x] 7.3 Implement the Pre_Activation_Nav and `/app/pre/*` routes
    - Wire `BottomNavigation` in pre-activation mode with exactly Home/Benefits/Learn and the `/app/pre/home`, `/app/pre/benefits`, `/app/pre/learn`, `/app/pre/onboarding/:step` routes; active item shows neon accent + non-color indicator.
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 3.6_
    - _Design: Navigation Architecture (Pre-Activation route table)_
  - [x] 7.4 Build the Pre-Activation Home screen (screen 6) and the Activate_Account_CTA
    - Build screen 6 and render the `Activate_Account_CTA` as a prominent primary button below main content, spaced above the bottom safe area, background `#B6FF00` with dark `#050505` text, rounded styling, ≥44px target, label "Activate Account", subtle press/hover micro-interaction, no excessive glow, only the 7 tokens. Copy/structure from the Design Specification.
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.12, 20.1, 20.2, 20.4_
    - _Design: Onboarding Resume Logic, Responsive Architecture, Conflicts & Ambiguities (screen content)_
  - [x] 7.5 Wire the CTA to the read-only resolver with async-safety guards
    - On press, run `resolveResumeStep` (read-only) and navigate to `/app/pre/onboarding/{stepId}`; add `session.asyncInFlight` and `selectActivateCtaDisabled` so the CTA is disabled while any blocking op runs and the in-flight flag makes the press idempotent (no duplicate/concurrent operation); hide CTA when `activationStatus === "active"`.
    - _Requirements: 22.8, 22.10, 22.11, 22.13, 13.5_
    - _Design: CTA call path, Activate_Account_CTA async safety, Implementation Rule_
  - [x]* 7.6 Write unit tests for the CTA call path and async-safety guard
    - Assert the CTA routes via the resolver to the correct existing screen, is disabled while a blocking op is in progress, ignores rapid double-tap (idempotent), never triggers a mock op itself, and is hidden when active.
    - _Requirements: 22.8, 22.10, 22.11, 22.13, 13.5_
    - _Design: Activate_Account_CTA async safety, Testing Strategy_
  - [x] 7.7 Build the Benefits and pre-activation Learn screens
    - Build `/app/pre/benefits` and `/app/pre/learn` content from the Design Specification (no invented content).
    - _Requirements: 9.1, 20.1, 20.2, 20.4_
    - _Design: Navigation Architecture (Pre-Activation route table)_
  - [x] 7.8 Wire the ProgressStepper (1..20) into the onboarding flow context
    - Display the current screen position as a number 1–20 within the `/app/pre/onboarding/:step` flow using `ProgressStepper`.
    - _Requirements: 5.4_
    - _Design: Components and Interfaces (ProgressStepper)_

- [ ] 8. Checkpoint — Pre-activation shell and CTA route correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Phase 4 — Eligibility, Fund Selection, and Pledge (screens 7–10)
  - [x] 9.1 Build the Portfolio / Credit Eligibility screen (7)
    - Display portfolio value and credit eligibility exactly from `Mock_Service` demo data (Indian grouping, per-value decimals, no reformatting) via `FinancialCard`; content from the Design Specification.
    - _Requirements: 7.1, 12.4, 20.1, 20.2, 20.4_
    - _Design: Mock Service Architecture, Data Models, Conflicts & Ambiguities (screen content)_
  - [x] 9.2 Build the Fund Selection screen (8)
    - Render each mock fund as a `FundCard` (max 50), toggle selected state and update the selected count within 200ms, update `selectedFunds` in state, show a `StickySummary`. Content from the Design Specification.
    - _Requirements: 7.2, 7.3, 20.1, 20.2, 20.4_
    - _Design: Mock Service Architecture, Components and Interfaces_
  - [x] 9.3 Build the Pledge Consent screen (9)
    - Require confirmed consent AND ≥1 selected fund to advance; otherwise remain on screen and show the consent+fund-required message; preserve selection.
    - _Requirements: 7.4, 7.5, 20.1, 20.2, 20.4_
    - _Design: Error Handling, Conflicts & Ambiguities (screen content)_
  - [x] 9.4 Build the Pledge Processing screen (10) with long-running simulation
    - Show `ProcessTimeline`/`LoadingState` for 2–5s via `Mock_Service.processPledge`; on success set pledge success and advance directly to KYC (11) without reordering; on failure remain and show error preserving selected funds.
    - _Requirements: 7.6, 7.7, 7.8, 13.5_
    - _Design: Mock Service Architecture (delay strategy), Navigation, Error Handling_
  - [x]* 9.5 Write unit tests for fund toggle, consent gate, and pledge failure
    - Assert selected-count updates on toggle, advancement is blocked without consent or with zero funds, and pledge failure keeps the screen with preserved funds.
    - _Requirements: 7.3, 7.5, 7.8_
    - _Design: Testing Strategy, Error Handling_

- [ ] 10. Phase 5 — KYC, Bank, Mandate, Agreement, e-Sign (screens 11–17)
  - [ ] 10.1 Build the KYC (11), Aadhaar (12), and Selfie (13) screens
    - Submit each via `Mock_Service` (simulated success after 500–2000ms, `LoadingState` shown), advance to the next verification screen; content from the Design Specification.
    - _Requirements: 8.1, 13.3, 13.5, 20.1, 20.2, 20.4_
    - _Design: Mock Service Architecture, Conflicts & Ambiguities (screen content)_
  - [ ] 10.2 Build the Bank Account screen (14) with validation
    - Capture bank details via `InputField`; on valid submit call `Mock_Service` (500–2000ms success); on empty/malformed field reject, show the field error, and retain entered values.
    - _Requirements: 8.2, 8.3, 13.3, 20.1, 20.2, 20.4_
    - _Design: Mock Service Architecture, Error Handling_
  - [ ] 10.3 Build the Auto-Debit / Mandate screen (15)
    - Authorize the mandate via `Mock_Service` (500–2000ms simulated success); content from the Design Specification.
    - _Requirements: 8.4, 13.3, 20.1, 20.2, 20.4_
    - _Design: Mock Service Architecture_
  - [ ] 10.4 Build the Agreement (16) and e-Sign (17) screens
    - Present the Agreement, then require the e-Sign action to advance to Final Credit Review; if e-Sign is not completed, prevent advancement and show the e-Sign-required error. Content from the Design Specification.
    - _Requirements: 8.5, 8.6, 20.1, 20.2, 20.4_
    - _Design: Error Handling, Conflicts & Ambiguities (screen content)_
  - [ ]* 10.5 Write unit tests for bank validation, e-Sign gate, and verification loading
    - Assert malformed bank input is rejected with retained values, e-Sign incompletion blocks advancement, and a `LoadingState` shows during simulated verification.
    - _Requirements: 8.3, 8.6, 13.5_
    - _Design: Error Handling, Testing Strategy_

- [ ] 11. Checkpoint — Onboarding flow to e-Sign complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Phase 6 — Activation and navigation swap (screens 18–20)
  - [x] 12.1 Build the Final Credit Review (18) and Activation (19) screens
    - Confirm on both screens to advance through the fixed sequence; content/values from the Design Specification.
    - _Requirements: 8.7, 5.1, 5.2, 20.1, 20.2, 20.4_
    - _Design: Navigation Architecture, Conflicts & Ambiguities (screen content)_
  - [x] 12.2 Build the Activation Success screen (20) and `activateAccount()`
    - On completion, call `activateAccount()` to set `activationStatus = "active"` and terminate the Pre_Activation_Flow (no further onboarding screen); show `SuccessState`.
    - _Requirements: 8.7, 5.6, 22.14, 19.8_
    - _Design: Active-account transition (nav swap), Financial State Updates_
  - [x] 12.3 Implement the activation nav swap in `AppShell`
    - `selectActiveNavMode` swaps `PRE_ACTIVATION_NAV` → `ACTIVE_NAV` and routes `/app/pre/*` → `/app/active/home` when active; labels swap to Home/Transactions/Repayments/Portfolio; Activate_Account_CTA hidden.
    - _Requirements: 10.8, 22.13, 22.14, 22.15_
    - _Design: Active-account transition (nav swap)_
  - [x]* 12.4 Write unit tests for the activation nav-swap
    - Assert reaching active state swaps `/app/pre/*` → `/app/active/*`, presents exactly the 4 tabs, and hides the CTA.
    - _Requirements: 10.8, 22.13, 22.15_
    - _Design: Testing Strategy_

- [x] 13. Phase 7 — Active Home
  - [x] 13.1 Wire the Active Bottom_Navigation (4 tabs), `/app/active/*` routes, and Top_Bar
    - Render exactly Home/Transactions/Repayments/Portfolio (left-to-right); route `/app/active/*`; Profile and Notifications only in the Top_Bar (not tabs), navigation within time budgets, active state with neon accent + non-color indicator.
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.9_
    - _Design: Navigation Architecture (Active route table), Accessibility_
  - [x] 13.2 Build the Active Home screen (credit position)
    - Display Credit_Limit, Available_Credit, Used_Credit, current LTV, Credit_Health via selectors (`FinancialCard`/`MetricCard`/`CreditHealthCard`); reachable Pay entry point. Content from the Design Specification.
    - _Requirements: 11.1, 11.9, 19.4, 20.1, 20.2, 20.4_
    - _Design: State Model, Data Flow, Conflicts & Ambiguities (screen content)_
  - [x]* 13.3 Write unit tests for the 4-tab enforcement
    - Assert exactly four bottom-nav items and that Profile/Notifications are not tabs.
    - _Requirements: 10.1, 10.2, 10.9_
    - _Design: Testing Strategy_

- [x] 14. Phase 8 — Transactions and Payment (Pay) flow
  - [x] 14.1 Build the Transactions screen
    - Render `TransactionCard` list most-recent-first with specified interaction behavior; empty-state when no records; error-state (retain previous values) when mock data fails. Content from the Design Specification.
    - _Requirements: 11.2, 11.7, 11.8, 20.1, 20.2, 20.4_
    - _Design: Data Models, Error Handling_
  - [x]* 14.2 Write unit tests for Transactions empty and error states
    - Assert the empty-state message with no records and the data-load error message retaining previous values.
    - _Requirements: 11.7, 11.8_
    - _Design: Error Handling, Testing Strategy_
  - [x] 14.3 Build the Pay experience (Scan QR / Enter UPI ID / Pay Contact / Bills)
    - Present the four Pay actions via `BottomSheet`, reachable from Home and not a bottom-nav tab; amounts formatted per Req 12; simulated entirely through `Mock_Service`. Content from the Design Specification.
    - _Requirements: 21.1, 21.2, 21.5, 21.6, 20.1, 20.2, 20.4_
    - _Design: Navigation (`/app/active/pay/*`), Mock Service Architecture_
  - [x] 14.4 Implement the DMart demo payment (₹1,856)
    - Complete demo payment (Merchant "DMart", Amount ₹1,856, Payment Method "LienPay Credit Line") via `Mock_Service.makeDemoPayment` → `recordPayment` appends a distinct `origin: "demo_payment"` transaction and updates Available/Used centrally; all dependents update.
    - _Requirements: 21.3, 21.4, 11.10, 11.11, 19.8_
    - _Design: Financial State Updates (DMart demo payment), Data Models_
  - [x]* 14.5 Write property test for the demo payment
    - **Property 5: Demo payment appends a distinct transaction counted exactly once**
    - Tag: `// Feature: lienpay, Property 5: For any Initial_Snapshot, completing the DMart ₹1,856 demo payment prepends exactly one new transaction with origin: "demo_payment" and a distinct id (never merging with the seeded DMart entry), increases the transaction count by exactly one, and increases usedCreditPaise by exactly the demo-payment amount (single, non-duplicated count).`
    - **Validates: Requirements 21.3, 21.4, 12.2**
    - _Design: Correctness Properties (Property 5)_
  - [x]* 14.6 Write unit tests for payment propagation
    - Assert a completed demo payment updates Available_Credit, Used_Credit, and the transactions list, and that dependent UI (Home/Portfolio/Transactions) reflects the change.
    - _Requirements: 21.4, 11.11, 19.8_
    - _Design: Data Flow, Testing Strategy_

- [x] 15. Phase 9 — Repayments
  - [x] 15.1 Build the Repayments screen
    - Display Outstanding Amount ₹24,680, Amount Due ₹8,240, specified repayment actions, and history via `RepaymentCard`; empty-state when no history. Content from the Design Specification.
    - _Requirements: 11.3, 11.7, 12.3, 20.1, 20.2, 20.4_
    - _Design: Components and Interfaces, Error Handling_
  - [x] 15.2 Wire the repayment action to central state
    - Repayment action calls `Mock_Service.makeRepayment` → `recordRepayment` updates Used/Available (paise, non-negative) and outstanding/amount-due strings centrally; all dependents update.
    - _Requirements: 11.10, 11.11, 19.8_
    - _Design: Financial State Updates (Repayment reducer)_
  - [x]* 15.3 Write unit tests for Repayments empty state and propagation
    - Assert the empty-state with no history and that a repayment updates dependent UI.
    - _Requirements: 11.7, 11.11, 19.8_
    - _Design: Error Handling, Testing Strategy_

- [ ] 16. Checkpoint — Active account core (Home, Transactions, Pay, Repayments)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 17. Phase 10 — Portfolio and Credit Limit Increase
  - [x] 17.1 Build the Portfolio screen
    - Display Total Portfolio Value, Eligible Portfolio and Credit Eligibility, Credit_Limit, Available_Credit, current LTV, Credit_Health, Pledged Investments, and Fund Holdings via shared cards/selectors. Content from the Design Specification.
    - _Requirements: 11.4, 19.4, 20.1, 20.2, 20.4_
    - _Design: State Model, Data Flow, Conflicts & Ambiguities (screen content)_
  - [x] 17.2 Build the Credit Limit Increase experience in-screen
    - Present the Potential Credit Limit Increase within the Portfolio screen; it is never a fifth bottom-nav tab.
    - _Requirements: 11.4, 11.13, 20.1, 20.2, 20.4_
    - _Design: Navigation Architecture (Active route table)_
  - [x]* 17.3 Write unit test that Credit Limit Increase is not a tab
    - Assert the active bottom nav still has exactly four items with no Credit Limit Increase tab.
    - _Requirements: 11.13_
    - _Design: Testing Strategy_

- [x] 18. Phase 11 — Learn, Profile, and Notifications
  - [x] 18.1 Build the active Learn experience (reachable, not a tab)
    - Make Learn reachable via its specified access points; it is not a bottom-nav item in the Active_Account_Experience. Content from the Design Specification.
    - _Requirements: 11.14, 20.1, 20.2, 20.4_
    - _Design: Navigation Architecture (Active route table)_
  - [x] 18.2 Build the Profile screen (Top_Bar access)
    - Reachable from the Top_Bar Profile control; display the account-management content from the Design Specification.
    - _Requirements: 11.5, 10.6, 10.7, 20.1, 20.2, 20.4_
    - _Design: Navigation Architecture, Accessibility_
  - [x] 18.3 Build the Notifications screen (Top_Bar access)
    - Reachable from the Top_Bar Notifications control; render items via `NotificationItem`; empty-state when no records; error-state on data-load failure. Content from the Design Specification.
    - _Requirements: 11.6, 11.7, 11.8, 10.6, 10.7, 20.1, 20.2, 20.4_
    - _Design: Components and Interfaces, Error Handling_
  - [x]* 18.4 Write unit tests for Notifications empty state and Learn access
    - Assert the Notifications empty-state and that Learn is reachable but not a bottom-nav tab.
    - _Requirements: 11.7, 11.14_
    - _Design: Testing Strategy_

- [x] 19. Phase 12 — Responsive QA, motion polish, and UX/accessibility QA
  - [x] 19.1 Implement responsive shells and breakpoint behavior
    - Product_Application renders in a centered phone-like column at ≥768px (never stretched); Landing_Page full-width with content capped at 1280px centered at ≥1024px; fluid layout below 390px; no horizontal scroll/clipping/overlap at 390/393/430/768/1024/2560px.
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
    - _Design: Responsive Architecture_
  - [x] 19.2 Apply the accessibility and motion-polish pass across the app
    - Ensure visible keyboard focus, accessible labels on all icon-only controls, 44px targets, contrast (≥4.5:1 body, ≥3:1 large), non-color active/selected indicators, and reduced-motion final states across both experiences; product screen transitions/value count-ups within Req 16 bounds.
    - _Requirements: 3.1, 3.6, 3.7, 3.8, 16.2, 16.3, 16.6, 4.8_
    - _Design: Accessibility, Animation Architecture_
  - [x] 19.3 Audit and complete error/empty/loading states across all screens
    - Verify each async operation shows `LoadingState`, each list screen shows empty/error states, and financial-data-load failure never renders placeholder/blank/partial values.
    - _Requirements: 11.7, 11.8, 12.6, 13.5_
    - _Design: Error Handling_
  - [x]* 19.4 Write automated accessibility and responsive layout tests
    - Assert contrast/label/focus and no horizontal scroll/clipping at 390/393/430/768/1024/2560px, plus the centered phone shell and 1280px landing cap.
    - _Requirements: 3.1, 3.7, 3.8, 15.1, 15.2, 15.3, 15.4, 15.5_
    - _Design: Responsive Architecture, Accessibility, Testing Strategy_
  - [x]* 19.5 Write responsive tests for the Activate_Account_CTA
    - Assert the CTA is fully visible, above the mobile safe area, and never overlaps the Bottom_Navigation/fixed elements at 390/393/430/768/1024px+.
    - _Requirements: 22.16, 22.2_
    - _Design: Responsive Architecture_

- [ ] 20. Final checkpoint — All requirements verified
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for a faster MVP; core implementation tasks are never optional.
- Each task references specific granular requirement clauses and the design section it derives from for traceability.
- Property-based tests (fast-check) implement the 8 correctness properties one-to-one, each tagged `// Feature: lienpay, Property {number}: {property_text}`, and cover only the pure logic layer (resolver, reducers, formatter, snapshot reset, validators).
- Example-based unit tests cover the nav guards, the `/app` redirect, the activation nav-swap, the Activate_Account_CTA async-safety guard, and empty/error states.
- Every screen task uses the LienPay Application Design Specification / screenshots as the source of truth for exact copy, labels, fields, values, and structure, and must not invent content (Req 18.1, 20.1, 20.2, 20.4).
- No task introduces real integrations or outbound network requests; all async is simulated by the centralized `Mock_Service`.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "2.2", "2.3", "3.1", "3.3"] },
    { "id": 2, "tasks": ["2.4", "2.5", "3.2", "3.4", "3.13"] },
    { "id": 3, "tasks": ["3.5", "3.7", "3.14", "4.1", "4.3"] },
    { "id": 4, "tasks": ["3.6", "3.8", "3.9", "3.10", "4.2", "4.4", "4.5"] },
    { "id": 5, "tasks": ["3.11", "3.12", "4.6", "4.7", "4.9", "4.10"] },
    { "id": 6, "tasks": ["4.8"] },
    { "id": 7, "tasks": ["4.11", "4.12"] },
    { "id": 8, "tasks": ["6.1", "7.1", "7.3"] },
    { "id": 9, "tasks": ["6.2", "6.3", "7.2", "7.4", "7.7", "7.8"] },
    { "id": 10, "tasks": ["6.4", "7.5"] },
    { "id": 11, "tasks": ["7.6", "9.1", "9.2", "9.3"] },
    { "id": 12, "tasks": ["9.4", "10.1", "10.2", "10.3"] },
    { "id": 13, "tasks": ["9.5", "10.4"] },
    { "id": 14, "tasks": ["10.5", "12.1"] },
    { "id": 15, "tasks": ["12.2"] },
    { "id": 16, "tasks": ["12.3"] },
    { "id": 17, "tasks": ["12.4", "13.1"] },
    { "id": 18, "tasks": ["13.2", "13.3"] },
    { "id": 19, "tasks": ["14.1", "15.1", "17.1", "18.1", "18.2", "18.3"] },
    { "id": 20, "tasks": ["14.2", "14.3", "15.2", "15.3", "17.2", "17.3", "18.4"] },
    { "id": 21, "tasks": ["14.4"] },
    { "id": 22, "tasks": ["14.5", "14.6"] },
    { "id": 23, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 24, "tasks": ["19.4", "19.5"] }
  ]
}
```
