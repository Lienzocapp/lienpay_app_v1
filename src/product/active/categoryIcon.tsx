/**
 * categoryIcon — maps a spend category to its line-art glyph.
 *
 * The Transactions design reference
 * (docs/Design/References/Original/Active account/Transactions.jpeg) shows each
 * row led by a CATEGORY line-art icon inside a lime circle, rather than a
 * merchant logo. This resolves the icon for the category label produced by
 * `merchantCategory`.
 *
 * The glyphs are REUSED from the shared pre-activation icon set (authored once)
 * so there is no duplicate SVG artwork in the codebase (Req 14.1, 14.3). Colour
 * comes from the consuming class's design token via `currentColor`.
 */
import type { ReactNode } from "react";
import {
  BillsIcon,
  CardIcon,
  CartIcon,
  CutleryIcon,
  FuelIcon,
  MedicalIcon,
  PlaneIcon,
} from "../pre-activation/preIcons";

/** Category label → glyph. Labels come from `merchantCategory`. */
const CATEGORY_GLYPHS: ReadonlyArray<readonly [RegExp, () => ReactNode]> = [
  [/food|dining/i, () => <CutleryIcon />],
  [/fuel|petrol/i, () => <FuelIcon />],
  [/grocer/i, () => <CartIcon />],
  [/travel/i, () => <PlaneIcon />],
  [/pharmacy|medical|health/i, () => <MedicalIcon />],
  [/bill|utility|recharge/i, () => <BillsIcon />],
];

/**
 * Returns the line-art icon for a spend `category`. Unknown categories fall
 * back to the payment-card glyph (a UPI/credit-line payment), so a row is never
 * left without its leading icon.
 */
export function categoryIcon(category: string): ReactNode {
  for (const [pattern, glyph] of CATEGORY_GLYPHS) {
    if (pattern.test(category)) {
      return glyph();
    }
  }
  return <CardIcon />;
}
