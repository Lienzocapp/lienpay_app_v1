# LienPay — project context (always applies)

LienPay is a **mobile-first demo/prototype** of a credit line backed by pledged
mutual funds. Everything is **mocked** — there are no real PAN, Aadhaar, MF, UPI,
bank, KYC or e-sign integrations, and none must ever be added.

Read `docs/LIENPAY_HANDOVER.md` for the full status, product flow and open items.

## Stack (do not replace or add alternatives)

- React 18 + TypeScript + Vite 5
- **Zustand** for state — one single store, `src/state/store.ts`
- **React Router 6 with HashRouter** (URLs look like `/#/app/pre/home`)
- **CSS Modules + design tokens**. There is NO Tailwind — never install it.
- framer-motion for restrained motion
- Vitest + React Testing Library + fast-check
- Capacitor 8 wraps the build for Android/iOS

## Source-of-truth order

1. `docs/` — product documentation (`LienPay_Beta_Flow_Design_Changes_v2.docx`,
   `LienPay_Learn_Section_FAQ.docx`)
2. `docs/Design/References/` — approved screenshots; these define the **visuals**
3. Existing code — defines the technical foundation

When your design judgement conflicts with a reference, the reference wins. Never
invent business rules, financial values or product copy that the docs already
define.

## Hard rules

- **Never hardcode a user name.** The name comes from `session.userName` via
  `personalGreeting()` in `src/product/greeting.ts`. With no name stored, the
  greeting degrades to "Good morning/afternoon/evening" alone — never a
  placeholder like "[Name]" or a sample name.
- **Colour literals live in exactly one file**: `src/design-system/tokens/tokens.ts`.
  Everywhere else use `var(--color-*)` or `colorVar()`. `npm run lint` fails the
  build otherwise.
- **Do not edit shared Active-screen CSS classes** (`.creditCard`, `.activity*`,
  `.spendCard`) — several screens share them. Add screen-scoped classes instead
  (`.pf*` Portfolio, `.txn*` Transactions, `.rp*` Repayments, `.hero*` Home).
- **Public asset URLs must go through `src/design-system/assets/visuals.ts`**,
  which builds them from `import.meta.env.BASE_URL`. `vite.config.ts` sets
  `base: "./"` for the Capacitor WebView, so a hardcoded `/assets/...` path
  works on the web but breaks in the native app.
- **`vercel.json` accepts no comment keys.** Vercel's schema rejects unknown
  properties and the whole deployment fails before building. (This already cost
  two failed deploys.)
- Do not commit `.kiro/settings/mcp.json` — MCP configs can hold tokens.
- Never weaken or delete a test to make the suite pass. If a product change is
  intentional, update the assertion and say why.

## Brand tokens (approved — do not change without being asked)

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#050505` | near-black base |
| `--color-panel` | `#111111` | cards |
| `--color-border` | `#252525` | borders |
| `--color-text-primary` | `#FFFFFF` | primary text |
| `--color-text-secondary` | `#A0A0A0` | muted text |
| `--color-green` | `#C5F82A` | brand lime accent |
| `--color-green-bright` | `#D2FF4D` | bright accent |
| `--color-warning` | `#F5A524` | urgency only |
| `--color-reward` | `#8B5CF6` | rewards tile only |

Glow is deliberately **subtle** — the references are nearly flat. Font is Satoshi.

## Canonical demo figures (keep internally consistent)

Credit limit **₹2,21,500** · available **₹2,21,500** · used **₹0** · LTV **34%**
(Healthy) · portfolio **₹4,72,000** · eligible investments **₹2,21,500** ·
eligible credit **₹80,000** · advertised range **₹25,000 – ₹10,00,000** ·
outstanding **₹24,680** · amount due **₹8,240** · minimum due **₹4,120** ·
30 days interest-free · 12% p.a.

These live in `src/mock/data/` (`portfolio.ts`, `funds.ts`, `eligibility.ts`,
`repayments.ts`, `transactions.ts`) — never hardcoded in JSX.

Demo PAN: `ABCDE1234F` succeeds; `AAAAA0000A` is deterministically declined.

## Verification — run all four before claiming done

```bash
npm run typecheck     # tsc --noEmit
npm run lint          # stylelint + non-token colour validation
npx vitest run        # expect 53 files / 184 tests passing
npm run build         # tsc && vite build  (also proves typecheck)
```

`npm run build` runs `tsc` first, so a passing build proves the typecheck too.
The editor language server sometimes misses unused imports that `tsc` catches —
always run the real build before committing.

## Deployment

Vercel, connected to GitHub `utpalladla-business-ideas/lienpay`, branch `main`.
**`git push` is the deploy trigger** — there is no Vercel CLI or token here.
Config: `vercel.json` (framework vite, `npm run build`, output `dist`). Live at
`https://lienpay-sigma.vercel.app`. No environment variables are needed.

After pushing, check the Vercel dashboard: a red **Error** badge means the build
never ran, so nothing from that commit is live.
