# LienPay — handover & flow document

Written to hand the project to a fresh Kiro session / another machine. Pair this
with `.kiro/steering/lienpay-context.md`, which Kiro loads automatically in every
conversation.

**State at handover:** typecheck PASS · lint PASS · **184/184 tests** ·
production build PASS · deployed to Vercel.
Last commit on `main`: **`faf5ee8`** ("Fix invalid vercel.json key that failed the
last two deployments").

---

## 1. Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Because the app uses **HashRouter**, deep links carry a `#`:

| Screen | URL |
|---|---|
| Pre-activation Home | `/#/app/pre/home` |
| Benefits | `/#/app/pre/benefits` |
| Learn | `/#/app/pre/learn` |
| Learn answer | `/#/app/pre/learn/portfolio-pledged` |
| Any onboarding step | `/#/app/pre/onboarding/<step-id>` |
| Active Home | `/#/app/active/home` |
| Transactions / Repayments / Portfolio | `/#/app/active/transactions` etc. |

State is in-memory only: a page reload resets the demo to the initial snapshot.

---

## 2. Product flow (27 steps, single source of truth)

The order lives in **one** array: `ONBOARDING_STEP_ORDER` in
`src/product/pre-activation/onboardingSteps.ts`. The `StepId` union in
`src/state/resumeResolver.ts` must match it exactly.

```
 1 splash                    →  onboarding
 2 mobile-verification
 3 otp-verification
 4 name-setup                   (captures session.userName)
 5 welcome
 6 pre-activation-home        →  DASHBOARD (tab, not a flow screen)
──────────── "Check My Limit" starts the eligibility journey ────────────
 7 pan-verification             PAN input + format validation
 8 pan-processing               deterministic mock verify + retry
 9 mf-connection                why / what / control + "Connect Investments"
10 mf-consent                   explicit checkbox gate
11 fetching-investments         "Finding your investments" → found
12 portfolio-found              discovered portfolio (central fund data)
13 eligibility-calculation      deterministic calculation
14 credit-limit-result          the ₹80,000 moment
──────────── pledge ────────────
15 fund-selection               existing screen, selection gate
16 pledge-consent               consent + ≥1 fund gate
17 pledge-processing            mockService.processPledge + retry
──────────── existing KYC journey (do not rebuild) ────────────
18 kyc
19 aadhaar-verification
20 selfie-verification
21 bank-account
22 auto-debit-mandate
23 agreement
24 e-sign
25 final-credit-review
26 activation                   card hero + "Activate My Credit Line"
27 activation-success           card visual, activates account → Active Home
```

**Resume behaviour:** `resolveResumeStep(state)` is a pure, read-only function
that returns the first step whose completion predicate is false. The
"Check My Limit" CTA calls it and navigates there, so a user who leaves mid-way
resumes at the right place and never restarts. Each step has a matching status
field in `ApplicationState`.

**Navigation split:** before activation the bottom nav is exactly
**Home · Benefits · Learn**. After `activationStatus === "active"` it becomes
**Home · Transactions · Repayments · Portfolio**. The two must never mix. Profile
and Notifications are Top-Bar destinations, not tabs.

---

## 3. Architecture map

```
src/
  state/            single Zustand store, types, initial snapshot,
                    resumeResolver (pure), selectors, property tests
  mock/             mockService.ts + data/ (portfolio, funds, transactions,
                    repayments, eligibility, pan, notifications)
  design-system/    tokens/ (colour + scale), components/ (generic primitives),
                    assets/visuals.ts (static artwork URLs), fonts/
  navigation/       navConfig (ROUTES), navIcons
  product/
    greeting.ts             time-of-day + personalised greeting
    pre-activation/
      screens/              PreActivationHome, Benefits, Learn, LearnDetail
      onboarding/           the 27 flow screens + OnboardingHost
      learnContent.ts       full FAQ content from the docx
      preIcons.tsx          shared line-art icon set
      PreActivationHeader   avatar + greeting + bell
    active/
      screens/              Home, Transactions, Repayments, Portfolio,
                            Profile, Notifications, Learn
      categoryIcon.tsx      spend-category glyphs for transaction rows
```

Rules that keep this clean: **one** store, **one** mock service, **one** resume
resolver, **one** fund/portfolio dataset, **one** navigation system. Extend them;
never add a parallel copy.

---

## 4. What is complete

- **Onboarding** splash → mobile → OTP → name → welcome, with validation,
  loading, error and retry states.
- **Pre-activation Home / Benefits / Learn**, rebuilt to the design references:
  personalised header, rotating hero with the café photo, credit-range card with
  the **Check My Limit** CTA, fact tiles, everyday-needs strip; Benefits hero with
  the value→credit pair; Learn with working search, popular questions, the
  six-topic grid and a help card.
- **Learn detail** — a new screen at `/app/pre/learn/:questionId` following the
  documented three-part answer shape (direct answer → "What this means for you" →
  "Important to know"). Topic ids open that topic's question list, so all 30
  documented Q&As are reachable. Unknown ids redirect to Learn.
- **Learn content** — all four Popular Questions and all 26 topic Q&As
  transcribed from `LienPay_Learn_Section_FAQ.docx`. The internal topics the doc
  excludes (RBI classification, funding cost, interchange, PSP/TPAP/NPCI
  economics, margins, revenue model) are deliberately absent.
- **Check-My-Limit journey** (steps 7–14) with deterministic mocks and
  loading / success / failure / retry on every async step.
- **Pledge + KYC + activation** — pre-existing screens, wired into the new order.
- **Active account** — Home (credit hero, arc gauge, next payment, credit health,
  recent activity, interest-free/rewards, increase-credit), Transactions
  (day-grouped, search, category filter chips, category glyphs, load-more),
  Repayments, Portfolio.
- **Card visual** — reusable `CardVisual` component rendering the supplied
  hand-and-card artwork on the activation and activation-success screens.
- **Service worker** — network-first for navigations so a deploy is visible
  immediately; cache-first only for hashed assets.

---

## 5. Open items / next steps

1. **Image weight (recommended first).** The four PNGs in
   `public/assets/visuals/` total roughly **6.5 MB**
   (`lienpay-card-hand`, `lienpay-hero-plans`, `lienpay-investments`,
   `lienpay-security`). Add WebP variants (~200 KB each) with a PNG fallback via
   `<picture>`, ideally inside `CardVisual` so every caller benefits.
2. **Activation-journey visual polish.** The flow is complete and correct, but
   steps 18–25 (KYC → e-sign) are functional rather than richly styled. They
   already share the dark/lime language; they'd benefit from the same card and
   spacing treatment as the pre-activation screens.
3. **Reference gaps.** Transactions/Repayments/Portfolio were built from the
   Original references; if refined (Banani-style) versions arrive, those three are
   the ones to revisit.
4. **`ProgressStepper` is now unused.** The global "STEP x of 27" indicator was
   removed from `OnboardingHost` on request. The component and its unit tests
   remain in the design system. Delete both together if you want it gone.
5. **Spec prose is stale.** `.kiro/specs/lienpay/*.md` still describes a
   "20-screen" flow and the old lime `#B6FF00`. The code is correct; the prose was
   left untouched. Worth syncing if those documents are still used.

---

## 6. Gotchas that cost real time

- **`vercel.json` schema is strict.** A `"//"` comment key inside a headers rule
  made Vercel reject the config, and **two consecutive deployments failed before
  building** — the site silently stayed on an older commit. If a deployment shows
  a red *Error* badge, nothing from that commit is live; open the build log first.
- **Service worker staleness.** The original worker was cache-first for *every*
  request including the HTML document, which pins the browser to an old build
  forever. Fixed, but note: a worker cannot evict itself retroactively, so after a
  worker change users need one *Clear site data* (or two reloads) before the fix
  takes effect. Bump `CACHE_NAME` whenever caching behaviour changes.
- **`vite base: "./"`** exists for Capacitor. Always build public-asset URLs from
  `import.meta.env.BASE_URL`.
- **Bundle hashes differ from local builds.** `package.json` uses `^` ranges, so
  Vercel installs its own patch versions. Never use a hash to judge whether a
  deploy is current — grep the live bundle for a distinctive new string instead
  (that technique is how the deployment was actually verified).
- **The editor language server can miss unused imports** that `tsc` rejects. Run
  `npm run build`, not just diagnostics, before committing.
- **Tests that encode product decisions** — update deliberately, never weaken:
  - `src/state/screenOrder.property.test.ts` — the 27-step sequence
  - `src/state/resumeResolver.property.test.ts` — per-step predicates
  - `src/state/resetToSnapshot.property.test.ts` — its `stateOf` destructure must
    list **every** store action; adding an action without adding it here fails
  - `ActivateAccountCTA.test.tsx` — CTA label + resume route
  - `ProductEntry.test.tsx` — three pre-activation nav items, credit range on Home
  - `ActivationNavSwap.test.tsx` — activation-success headline

---

## 7. Recent commit history (newest first)

| Commit | Summary |
|---|---|
| `faf5ee8` | Fix invalid `vercel.json` key that failed the last two deployments |
| `30a9977` | Remove the step counter; rebuild the Welcome card to the reference |
| `78b05d3` | Never cache the HTML document so a deploy is visible immediately |
| `85bfc20` | Fix service worker serving a stale app after deploy |
| `a1c0b23` | Use the supplied hero artwork on Home, Benefits and Learn detail |
| `8bde920` | Check-My-Limit flow, pre-activation screens, CardVisual |

---

## 8. First actions in the new session

1. `npm install`, then run all four verification commands and confirm
   **184/184** tests — that establishes a known-good baseline.
2. Skim `.kiro/steering/lienpay-context.md` (Kiro loads it automatically) and
   this document.
3. Open the reference images in `docs/Design/References/` before any visual work.
4. Pick up from section 5, starting with the image optimisation.
