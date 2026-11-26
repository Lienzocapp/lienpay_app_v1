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
import { VISUALS } from "../../design-system/assets/visuals";
import { CardIcon } from "../pre-activation/preIcons";

/** Category label → 3D photo icon asset. */
const CATEGORY_IMAGES: ReadonlyArray<readonly [RegExp, string]> = [
  [/food|dining|restaurant|cafe/i, VISUALS.categoryFood],
  [/fuel|petrol|diesel/i, VISUALS.categoryFuel],
  [/grocer/i, VISUALS.categoryGrocery],
  [/travel|flight|trip/i, VISUALS.categoryTravel],
  [/pharmacy|medical|health/i, VISUALS.categoryMedical],
  [/bill|utility|recharge/i, VISUALS.categoryBills],
];

/**
 * Returns the icon element for a spend `category`.
 * Matches the colorful 3D photorealistic icons used across everyday needs,
 * falling back to a clean payment-card glyph if unclassified.
 */
export function categoryIcon(category: string): ReactNode {
  for (const [pattern, imageSrc] of CATEGORY_IMAGES) {
    if (pattern.test(category)) {
      return (
        <img
          src={imageSrc}
          alt=""
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scale(1.15)",
          }}
        />
      );
    }
  }
  return <CardIcon />;
}
