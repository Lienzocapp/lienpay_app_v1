/**
 * learnContent — the LienPay Learn section content (single source).
 *
 * Transcribed from the supplied `docs/LienPay_Learn_Section_FAQ.docx`: the four
 * Popular Questions and the six documented topics with their exact questions and
 * answers. No FAQ copy is invented (Req 20.4), and the excluded internal topics
 * listed in the document (RBI reporting classification, issuer funding cost,
 * interchange split, PSP/TPAP/NPCI economics, issuer margin, revenue model) are
 * deliberately NOT present.
 *
 * The document's answer-screen design principle — "a direct answer first, then
 * 'What this means for you', then a short 'Important to know' note" — maps onto
 * the optional `headline` / `bullets` / `important` fields consumed by the Learn
 * detail screen. Those enrichments only restate what the document already says.
 */

/** A single question/answer pair, optionally enriched for the detail screen. */
export interface FaqItem {
  /** Stable id used to route to the Learn detail screen. */
  id?: string;
  q: string;
  a: string;
  /** Short direct answer shown as the detail headline. */
  headline?: string;
  /** "What this means for you" points (documented consequences, not advice). */
  bullets?: readonly string[];
  /** "Important to know" caveat shown in the detail footer card. */
  important?: string;
}

/** A documented Learn topic category. */
export interface LearnTopic {
  id: string;
  title: string;
  summary: string;
  items: readonly FaqItem[];
}

/**
 * Popular questions surfaced at the top of Learn — the document's
 * "Recommended Learn Homepage" list, answered from its Popular Questions
 * section.
 */
export const POPULAR_QUESTIONS: readonly FaqItem[] = [
  {
    id: "portfolio-pledged",
    q: "Will my entire portfolio be pledged?",
    headline: "No, only what you choose.",
    a: "You choose the eligible investments you want to pledge and the amount of credit you want to unlock. Your entire portfolio does not automatically need to be placed under lien.",
    bullets: [
      "You stay in control of what gets pledged",
      "Only selected eligible units are placed under lien",
      "You do not need to activate the maximum available limit",
    ],
    important:
      "Pledged units normally need to be released from lien before they can be redeemed. Exact terms are shown before activation.",
  },
  {
    id: "smaller-limit",
    q: "Can I choose how much credit I want?",
    headline: "Yes, you set the limit you want.",
    a: "If you're eligible for a larger amount but only want ₹50,000, you don't need to activate the maximum available limit.",
    bullets: [
      "Choose a smaller credit line than your eligible amount",
      "Having a credit line does not mean you owe that amount",
      "You owe only what you actually spend",
    ],
    important:
      "Any applicable activation, processing, EMI or other charges are shown clearly before you confirm the relevant action.",
  },
  {
    id: "market-falls",
    q: "What happens if the market falls?",
    headline: "Your investments stay invested.",
    a: "Your investments continue to move with the market. A fall does not mean they are immediately sold. If your collateral position needs attention, we'll alert you and show you what action is required.",
    bullets: [
      "Nothing happens merely because the market has a bad day",
      "Only a portion of your investment value becomes credit, creating a safety buffer",
      "You're notified when action is required on your collateral",
    ],
    important:
      "Investments can be sold only under the circumstances defined in your credit agreement, such as unresolved repayment obligations or failure to restore required collateral after the applicable notices.",
  },
  {
    id: "interest-free",
    q: "What exactly is 30 days interest-free?",
    headline: "Repay in time and pay no interest.",
    a: "Repay eligible spending within the applicable interest-free period and no interest is charged on that spending. Any other applicable charges will be shown before you activate the line.",
    bullets: [
      "Your app shows the exact amount due and the repayment date",
      "You can repay early, there's no need to wait for the due date",
      "Unpaid amounts may begin attracting interest after the period ends",
    ],
    important:
      "The applicable interest rate is shown before activation, and any activation, processing or EMI charges are shown before you confirm.",
  },
] as const;

/** The six documented Learn topics, with their documented questions/answers. */
export const LEARN_TOPICS: readonly LearnTopic[] = [
  {
    id: "how-it-works",
    title: "How LienPay works",
    summary: "What it is and when to use it",
    items: [
      {
        q: "Why would I use this instead of a credit card?",
        a: "LienPay gives you access to credit backed by investments you already own. It can be useful when you want liquidity without redeeming your mutual funds, for example during a month-end cash crunch or an unexpected expense. A credit card may still make more sense for someone whose priority is card rewards.",
        headline: "Credit backed by what you already own.",
      },
      {
        q: "Do I have to use the whole limit?",
        a: "No. If you're eligible for ₹2 lakh but only want ₹50,000 available, you can choose a smaller credit line. Having a ₹50,000 line does not mean you owe ₹50,000. You owe only what you actually spend.",
        headline: "No, you owe only what you spend.",
      },
      {
        q: "Is this only for emergencies?",
        a: "No. You can use it for eligible everyday merchant spends as well. Whether it makes sense to use regularly depends on how you manage repayment.",
        headline: "No, everyday spends work too.",
      },
    ],
  },
  {
    id: "pledging",
    title: "Mutual fund pledging",
    summary: "What gets pledged and what stays yours",
    items: [
      {
        q: "Can I choose which mutual funds to pledge?",
        a: "Yes. You can select from your eligible mutual fund holdings rather than automatically pledging your entire portfolio.",
        headline: "Yes, you select the holdings.",
      },
      {
        q: "Will my whole portfolio be under lien?",
        a: "No. Only the units selected and accepted as collateral are pledged.",
        headline: "No, only accepted units.",
      },
      {
        q: "What happens if I want to sell a pledged fund?",
        a: "Pledged units normally need to be released from lien before they can be redeemed. LienPay will show you which units are pledged and which remain freely available.",
        headline: "Pledged units are released first.",
      },
      {
        q: "What happens after I repay?",
        a: "As your outstanding amount reduces, collateral that is no longer required may become eligible for release.",
        headline: "Collateral can become eligible for release.",
      },
      {
        q: "Can I add more investments if the market falls?",
        a: "Where supported, yes. If additional collateral is required, you may be able to either repay part of the outstanding amount or add eligible mutual fund units.",
        headline: "Where supported, yes.",
      },
    ],
  },
  {
    id: "limit-risk",
    title: "Credit limit & market risk",
    summary: "How your limit and safety buffer work",
    items: [
      {
        q: "How is my credit limit decided?",
        a: "Your limit depends on the current value and type of eligible mutual funds you choose to pledge. Only a portion of their value is made available as credit so there is room for normal market movements.",
        headline: "From the value and type of pledged funds.",
      },
      {
        q: "Why don't I get 100% of my investment value?",
        a: "Because mutual fund values can fall. The difference between your investment value and available credit creates a safety buffer.",
        headline: "The gap is your safety buffer.",
      },
      {
        q: "What happens if my pledged funds fall in value?",
        a: "Nothing happens merely because the market has a bad day. If the collateral falls enough to require action, we'll notify you and show what you can do.",
        headline: "A bad day alone changes nothing.",
      },
      {
        q: "Can my investments ever be sold?",
        a: "Only under circumstances defined in your credit agreement, such as unresolved repayment obligations or failure to restore required collateral after the applicable notices. It is not triggered simply because you made a payment or because markets moved slightly.",
        headline: "Only as defined in your agreement.",
      },
    ],
  },
  {
    id: "payments",
    title: "Payments",
    summary: "Where and how you can spend",
    items: [
      {
        q: "Where can I use the credit line?",
        a: "For eligible merchant payments, such as groceries, restaurants, fuel, pharmacy, shopping and other everyday purchases.",
        headline: "At eligible merchants.",
      },
      {
        q: "Can I transfer the money to my own bank account?",
        a: "No. LienPay is designed for eligible merchant payments, not for moving borrowed money between your own accounts.",
        headline: "No, it's for merchant payments.",
      },
      {
        q: "Can I pay myself through my own business QR?",
        a: "Transactions intended to artificially convert the credit line into cash or cycle funds through related accounts may be restricted. The credit line is intended for genuine purchases from eligible merchants.",
        headline: "Such transactions may be restricted.",
      },
      {
        q: "Can I put the money into an FD for 30 days and earn free interest?",
        a: "No. The product isn't designed to provide unrestricted cash transfers into your bank account. The interest-free period applies to eligible spending, not to borrowing cash for arbitrage.",
        headline: "No, the period applies to spending.",
      },
      {
        q: "Will it work at every UPI merchant?",
        a: "Not necessarily. Availability can depend on the merchant, payment method and network eligibility.",
        headline: "Not necessarily.",
      },
    ],
  },
  {
    id: "interest-repayment",
    title: "Interest & repayment",
    summary: "Due dates, interest and repayment options",
    items: [
      {
        q: "What does 30 days interest-free mean?",
        a: "Repay eligible spending within the applicable interest-free period and no interest is charged on that spending. Your app will show the exact amount due and repayment date.",
        headline: "Repay in time, pay no interest.",
      },
      {
        q: "Are there any charges?",
        a: "Any applicable activation, processing, EMI or other charges will be shown clearly before you confirm the relevant action.",
        headline: "Charges are shown before you confirm.",
      },
      {
        q: "What if I don't repay within the interest-free period?",
        a: "The unpaid amount may begin attracting interest according to your agreed credit-line terms. You'll see the applicable rate before activation.",
        headline: "Interest may begin to apply.",
      },
      {
        q: "Can I repay early?",
        a: "Yes. You don't need to wait until the due date.",
        headline: "Yes, any time before the due date.",
      },
      {
        q: "Can I convert my outstanding into EMI?",
        a: "Eligible spending may be offered an EMI option. You'll see the tenure, rate, fee and total repayment before accepting it.",
        headline: "Eligible spending may be offered EMI.",
      },
    ],
  },
  {
    id: "investments-eligibility",
    title: "My investments & eligibility",
    summary: "Eligible funds, SIPs and portfolio access",
    items: [
      {
        q: "Which mutual funds can I use?",
        a: "LienPay will automatically identify eligible mutual funds from the portfolio you connect. Not every fund may qualify for the same credit value.",
        headline: "Eligible funds are identified for you.",
      },
      {
        q: "Does it matter whether I invested through Groww, Zerodha or another platform?",
        a: "The investment platform itself isn't what determines the value of your mutual fund holding. LienPay can fetch supported mutual fund holdings through the available portfolio infrastructure rather than treating the platform as the investment itself.",
        headline: "The platform isn't what matters.",
      },
      {
        q: "Can I continue my SIP?",
        a: "Yes. Your existing SIP can continue. New units are not automatically treated as pledged collateral unless they are added through the applicable process.",
        headline: "Yes, your SIP can continue.",
      },
      {
        q: "Do pledged mutual funds still earn returns?",
        a: "Yes. They remain invested, so their value continues to rise or fall with the underlying fund.",
        headline: "Yes, they remain invested.",
      },
    ],
  },
] as const;

/** Builds the stable Learn-detail id for a topic's question at `index`. */
export function topicItemId(topicId: string, index: number): string {
  return `${topicId}-${index + 1}`;
}

/**
 * Resolves a Learn question by its detail id, searching the popular questions
 * first and then every topic's items. Returns the item plus the topic it
 * belongs to (undefined for popular questions).
 */
export function findFaqById(
  id: string
): { item: FaqItem; topic?: LearnTopic } | undefined {
  const popular = POPULAR_QUESTIONS.find((p) => p.id === id);
  if (popular) {
    return { item: popular };
  }
  for (const topic of LEARN_TOPICS) {
    const index = topic.items.findIndex(
      (_, i) => topicItemId(topic.id, i) === id
    );
    if (index >= 0) {
      return { item: topic.items[index], topic };
    }
  }
  return undefined;
}
