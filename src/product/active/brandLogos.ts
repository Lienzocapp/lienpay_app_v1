/**
 * brandLogos — resolves a LOCAL, bundled brand logo asset for a known merchant
 * or fund name.
 *
 * Logos are bundled `.svg` assets (imported below), so they are compiled into
 * the app and render fully OFFLINE — including inside the packaged native app —
 * with no network request. This maps the EXISTING canonical merchants and fund
 * houses to their brand marks; it invents no new transactions or funds. When a
 * name has no known mapping, `undefined` is returned and the shared
 * `BrandAvatar` falls back to a neon initial tile.
 */
import axis from "../../design-system/assets/logos/axis.svg";
import hdfc from "../../design-system/assets/logos/hdfc.svg";
import sbi from "../../design-system/assets/logos/sbi.svg";
import mirae from "../../design-system/assets/logos/mirae.svg";
import ppfas from "../../design-system/assets/logos/ppfas.svg";
import dmart from "../../design-system/assets/logos/dmart.svg";
import makemytrip from "../../design-system/assets/logos/makemytrip.svg";
import apollo from "../../design-system/assets/logos/apollo.svg";
import bharatpetroleum from "../../design-system/assets/logos/bharatpetroleum.svg";
import cafedelhiheights from "../../design-system/assets/logos/cafedelhiheights.svg";
import swiggy from "../../design-system/assets/logos/swiggy.svg";

/** Keyword → bundled brand asset (checked in order, case-insensitive). */
const BRAND_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  // Banks / fund houses
  [/axis/i, axis],
  [/hdfc/i, hdfc],
  [/\bsbi\b/i, sbi],
  [/mirae/i, mirae],
  [/parag|ppfas/i, ppfas],
  // Merchants
  [/dmart/i, dmart],
  [/makemytrip/i, makemytrip],
  [/apollo/i, apollo],
  [/bharat petroleum|bpcl/i, bharatpetroleum],
  [/cafe delhi/i, cafedelhiheights],
  [/swiggy/i, swiggy],
];

/**
 * Returns a bundled logo asset URL for a merchant/fund name, or `undefined`
 * when no known brand matches (the caller then shows an initial fallback).
 */
export function brandLogoUrl(name: string): string | undefined {
  for (const [pattern, asset] of BRAND_RULES) {
    if (pattern.test(name)) {
      return asset;
    }
  }
  return undefined;
}
