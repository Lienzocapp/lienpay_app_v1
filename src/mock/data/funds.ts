/**
 * LienPay — central mutual-fund demo data (single source).
 *
 * The list of eligible mutual-fund holdings the user can pledge on the Fund
 * Selection screen (Req 7.2), exposed exclusively through the centralized
 * `Mock_Service` (`getFunds`). This is the single central source for fund data;
 * no other module defines funds. A maximum of 50 funds is supported (Req 7.2);
 * this provisional demo set is well under that bound.
 *
 * NOTE: These are provisional, realistic demo holdings for the shared-core data
 * layer. The Fund Selection screen (task 9.2) MUST reconcile the exact fund
 * copy/values against the higher-precedence LienPay Application Design
 * Specification before that screen is built (Req 18.1, 20.1, 20.2, 20.4). No
 * screen consumes this data yet.
 *
 * Requirements: 7.2 (each fund as a FundCard, max 50), 12.5 (one central data
 * source).
 * Design: Mock Service Architecture, Data Models (Fund), Folder Structure
 * (mock/data/funds.ts).
 */
import type { Fund } from "../../state/types";

/**
 * The maximum number of funds the prototype supports on the Fund Selection
 * screen (Req 7.2). The `Mock_Service.getFunds` read enforces this bound.
 */
export const MAX_FUNDS = 50;

/**
 * The central demo fund holdings, in display order. Values use canonical INR
 * display strings (Indian lakh grouping) consistent with the formatter.
 */
export const FUNDS_DATA: readonly Fund[] = [
  {
    id: "fund-axis-bluechip",
    name: "Axis Bluechip Fund",
    value: "₹1,84,000",
    eligible: true,
    category: "Large Cap",
    eligibleValue: "₹92,000",
    currentNav: "₹152",
    lockedNav: "₹146.68",
    units: "1,210.53",
  },
  {
    id: "fund-mirae-largecap",
    name: "Mirae Asset Large Cap Fund",
    value: "₹1,26,000",
    eligible: true,
    category: "Large Cap",
    eligibleValue: "₹63,000",
    currentNav: "₹169",
    lockedNav: "₹163.09",
    units: "745.56",
  },
  {
    id: "fund-parag-flexicap",
    name: "Parag Parikh Flexi Cap Fund",
    value: "₹98,000",
    eligible: true,
    category: "Flexi Cap",
    eligibleValue: "₹44,100",
    currentNav: "₹186",
    lockedNav: "₹179.49",
    units: "526.88",
  },
  {
    id: "fund-sbi-smallcap",
    name: "SBI Small Cap Fund",
    value: "₹64,000",
    eligible: true,
    category: "Small Cap",
    eligibleValue: "₹22,400",
    currentNav: "₹203",
    lockedNav: "₹195.89",
    units: "315.27",
  },
];
