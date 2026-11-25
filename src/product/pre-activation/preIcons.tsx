/**
 * preIcons — line-art icons for the pre-activation screens.
 *
 * Simple, consistent 24px stroke icons matching the design references
 * (docs/Design/References/Original/Pre-activation). They use `currentColor`
 * only, so the accent comes from the consuming class's design token (Req 1.2) —
 * no color literals here. Decorative by default; the consuming element carries
 * the accessible label.
 */
const S = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: "false" as const,
};

/** Person glyph for the header avatar. */
export function PersonIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" />
    </svg>
  );
}

/** Notification bell. */
export function BellIcon() {
  return (
    <svg {...S}>
      <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 17.5h15L18 15.5Z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}

/** Calendar with a "30" mark — the 30-days-interest-free tile. */
export function Calendar30Icon() {
  return (
    <svg {...S}>
      <rect x="3.2" y="5.2" width="17.6" height="15.6" rx="3" />
      <path d="M3.2 10h17.6M8 3.4v3.2M16 3.4v3.2" />
      <text
        x="12"
        y="17.4"
        textAnchor="middle"
        fontSize="6.4"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        30
      </text>
    </svg>
  );
}

/** Pie/donut chart — investments stay invested. */
export function PieIcon() {
  return (
    <svg {...S}>
      <path d="M12 3.2a8.8 8.8 0 1 0 8.8 8.8H12V3.2Z" />
      <path d="M13.8 3.4A8.8 8.8 0 0 1 20.6 10h-6.8V3.4Z" />
    </svg>
  );
}

/** Lightning bolt — instant UPI payments. */
export function BoltIcon() {
  return (
    <svg {...S}>
      <path d="M13.4 2.8 5.6 13.6h5.2l-.8 7.6 8-11.2h-5.2l.6-7.2Z" />
    </svg>
  );
}

/** Burger — the Food category. */
export function FoodIcon() {
  return (
    <svg {...S}>
      <path d="M4.4 9.6a7.6 7.6 0 0 1 15.2 0" />
      <path d="M3.8 13.2h16.4M4.6 16.6h14.8a2.6 2.6 0 0 1-2.6 2.6H7.2a2.6 2.6 0 0 1-2.6-2.6Z" />
    </svg>
  );
}

/** Fork + knife — the Food/dining category (Benefits reference). */
export function CutleryIcon() {
  return (
    <svg {...S}>
      <path d="M8 3.4v7.2M8 10.6v10M5.6 3.4v4a2.4 2.4 0 0 0 4.8 0v-4" />
      <path d="M16.4 3.4c1.8 0 2.8 1.4 2.8 3.6s-1 3.4-2.8 3.4-2.8-1.2-2.8-3.4 1-3.6 2.8-3.6ZM16.4 10.4v10.2" />
    </svg>
  );
}

/** Fuel pump — the Fuel category. */
export function FuelIcon() {
  return (
    <svg {...S}>
      <rect x="4.2" y="3.4" width="9.4" height="17.2" rx="2.4" />
      <path d="M4.6 9.4h8.6M16.4 7.4h1.8a2 2 0 0 1 2 2v7a1.6 1.6 0 0 1-3.2 0v-3.6h-3.4" />
    </svg>
  );
}

/** Shopping cart — the Grocery category. */
export function CartIcon() {
  return (
    <svg {...S}>
      <path d="M3 4.2h2.4l2.6 9.6h9.2l2.2-6.8H7" />
      <circle cx="9.4" cy="18.4" r="1.7" />
      <circle cx="16.6" cy="18.4" r="1.7" />
    </svg>
  );
}

/** Aeroplane — the Travel category. */
export function PlaneIcon() {
  return (
    <svg {...S}>
      <path d="M21 4.2c.6.6.3 1.6-.5 2.4l-3.6 3.4 1.2 8-2 1.2-3-6.6-3.2 3 .3 3.2-1.5.9-1.3-3.3-3.3-1.3.9-1.5 3.2.3 3-3.2L4.6 7.6l1.2-2 8 1.2 3.4-3.6c.8-.8 1.8-1.1 2.4-.5l1.4 1.5Z" />
    </svg>
  );
}

/** Medical cross in a rounded box — the Medical category. */
export function MedicalIcon() {
  return (
    <svg {...S}>
      <rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

/** Receipt — the Bills category. */
export function BillsIcon() {
  return (
    <svg {...S}>
      <path d="M5.4 3.4h13.2v17.2l-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4-2.2-1.4-2.2 1.4V3.4Z" />
      <path d="M8.6 8h6.8M8.6 12h6.8" />
    </svg>
  );
}

/** Rising bars — "stay invested for your goals". */
export function BarsIcon() {
  return (
    <svg {...S}>
      <path d="M5.6 20V13M12 20V6.4M18.4 20v-4.6" />
    </svg>
  );
}

/** Briefcase — "be ready when plans change". */
export function BriefcaseIcon() {
  return (
    <svg {...S}>
      <rect x="3.2" y="7.2" width="17.6" height="13" rx="3" />
      <path d="M9 7.2V5.4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.8" />
    </svg>
  );
}

/** Shield with a check — pledging / security. */
export function ShieldCheckIcon() {
  return (
    <svg {...S}>
      <path d="M12 3.2 5.2 5.8v5.6c0 4 2.8 7.6 6.8 9 4-1.4 6.8-5 6.8-9V5.8L12 3.2Z" />
      <path d="M8.8 12.2l2.4 2.3 4-4.4" />
    </svg>
  );
}

/** Graduation cap — the Learn header. */
export function CapIcon() {
  return (
    <svg {...S}>
      <path d="M12 4 2.8 8.2 12 12.4l9.2-4.2L12 4Z" />
      <path d="M6.2 10.4v4.4c0 1.8 2.6 3.2 5.8 3.2s5.8-1.4 5.8-3.2v-4.4" />
    </svg>
  );
}

/** Magnifier — the Learn search field. */
export function SearchIcon() {
  return (
    <svg {...S}>
      <circle cx="11" cy="11" r="6.6" />
      <path d="m16 16 4.4 4.4" />
    </svg>
  );
}

/** Headset — the "still need help?" card. */
export function HeadsetIcon() {
  return (
    <svg {...S}>
      <path d="M4.6 14.4v-2a7.4 7.4 0 0 1 14.8 0v2" />
      <rect x="2.8" y="13.4" width="3.8" height="6" rx="1.8" />
      <rect x="17.4" y="13.4" width="3.8" height="6" rx="1.8" />
      <path d="M19.4 19.4v.4a2.6 2.6 0 0 1-2.6 2.6H13" />
    </svg>
  );
}

/** Sliders — "can I choose how much credit". */
export function SlidersIcon() {
  return (
    <svg {...S}>
      <path d="M3.6 7.6h16.8M3.6 16.4h16.8" />
      <circle cx="9" cy="7.6" r="2.2" />
      <circle cx="15.4" cy="16.4" r="2.2" />
    </svg>
  );
}

/** Trend line — "what happens if the market falls". */
export function TrendIcon() {
  return (
    <svg {...S}>
      <path d="M3.4 16.6l4.4-4.6 3.2 2.8 6-6.6" />
      <path d="M13.4 8h4v4" />
    </svg>
  );
}

/** Network / nodes — "how LienPay works". */
export function NodesIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5.6" cy="18" r="2.2" />
      <circle cx="18.4" cy="18" r="2.2" />
      <path d="M12 7.2 6.8 15.8M12 7.2l5.2 8.6" />
    </svg>
  );
}

/** Percent — interest & repayment. */
export function PercentIcon() {
  return (
    <svg {...S}>
      <path d="M6 18 18 6" />
      <circle cx="7.6" cy="7.6" r="2.4" />
      <circle cx="16.4" cy="16.4" r="2.4" />
    </svg>
  );
}

/** Card — payments. */
export function CardIcon() {
  return (
    <svg {...S}>
      <rect x="2.8" y="5.4" width="18.4" height="13.2" rx="3" />
      <path d="M2.8 10h18.4" />
    </svg>
  );
}

/** Star — the Benefits hero badge. */
export function StarIcon() {
  return (
    <svg {...S}>
      <path d="m12 3.6 2.6 5.4 5.8.8-4.2 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8L12 3.6Z" />
    </svg>
  );
}

/** Right arrow — CTA affordance. */
export function ArrowRightIcon() {
  return (
    <svg {...S}>
      <path d="M4.4 12h15M13.4 6l6 6-6 6" />
    </svg>
  );
}

/** Chevron right — row affordance. */
export function ChevronRightIcon() {
  return (
    <svg {...S}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

/** Chevron left — back navigation. */
export function ChevronLeftIcon() {
  return (
    <svg {...S}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

/** Filled circular check — the Learn-detail bullet marks. */
export function CheckCircleIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="m8.2 12.2 2.6 2.6 5-5.4" />
    </svg>
  );
}

/** Info circle — "important to know". */
export function InfoIcon() {
  return (
    <svg {...S}>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 10.8v5.4M12 7.9v.2" />
    </svg>
  );
}
