# Requirements Document

## Introduction

LienPay is a premium, mobile-first fintech web application delivered as a fully interactive prototype. LienPay lets users access a credit line backed by their eligible mutual fund investments without selling those investments. The prototype presents two major experiences: a pre-activation onboarding flow (from splash through activation success) and an active account experience (Home, Transactions, Repayments, Portfolio, plus Profile and Notifications accessible from the top).

The prototype uses mock services and realistic demo data only. It MUST NOT integrate real banking, PAN, Aadhaar, UPI, mutual fund, pledge, or payment APIs. The visual design system, screen order, navigation rules, and key financial values/labels defined in the source specification are fixed and MUST be preserved exactly.

This document defines the requirements for the LienPay prototype. Implementation details (frameworks, libraries, file structure) are intentionally deferred to the design phase, except where the source specification names specific design tokens, values, screen order, or components that MUST be honored.

## Glossary

- **LienPay_App**: The complete mobile-first web application prototype, including landing page, pre-activation onboarding, and active account experience.
- **Landing_Page**: The public marketing/landing experience (Experience A) that presents LienPay before a user enters the onboarding flow, using the cinematic motion system.
- **Product_Application**: The product experience (Experience B) comprising the Pre_Activation_Flow and Active_Account_Experience, using the same visual identity as the Landing_Page with restrained, functional animations.
- **Pre_Activation_Flow**: The ordered sequence of onboarding screens from Splash through Activation Success.
- **Active_Account_Experience**: The set of screens available after a user's credit account is activated (Home, Transactions, Repayments, Portfolio, Profile, Notifications).
- **Design_System**: The centralized set of design tokens (colors, typography) and reusable UI components shared across the LienPay_App.
- **Bottom_Navigation**: The persistent bottom navigation bar shown in the Active_Account_Experience. Also referred to as the Active_Account Bottom_Navigation.
- **Pre_Activation_Nav**: The navigation shown on the Landing_Page / before activation (Home, Benefits, Learn).
- **Initial_Snapshot**: The canonical set of mandated fixed financial values (Portfolio Value, Credit_Limit, Available_Credit, Used_Credit, LTV, Credit_Health, transactions, repayments) displayed character-for-character on load, to which session-scoped state resets on reload.
- **Top_Bar**: The top navigation area that provides access to Profile and Notifications.
- **Animation_System**: The centralized, reusable set of motion behaviors (smooth scrolling, reveals, transitions, micro-interactions) used across the LienPay_App.
- **Mock_Service**: A simulated data/service layer that returns realistic demo data without calling any external API.
- **Application_State**: The centralized state store holding user, credit, portfolio, transaction, and navigation data for the prototype.
- **Credit_Limit**: The maximum credit available to the user, backed by pledged mutual fund investments.
- **Available_Credit**: The portion of the Credit_Limit currently available to draw.
- **Used_Credit**: The portion of the Credit_Limit currently drawn.
- **LTV**: Loan-to-Value ratio, the ratio of credit used against pledged portfolio value.
- **Credit_Health**: A qualitative status indicator describing the health of the user's credit position.
- **Reusable_Component**: A named, shared UI component intended for reuse across multiple screens.
- **Activate_Account_CTA**: The primary call-to-action button displayed on the Pre-Activation Home screen (screen 6 of the Pre_Activation_Flow) that starts or continues the activation journey while the account is not yet active.

## Requirements

### Requirement 1: Centralized Design Tokens (Color System)

**User Story:** As a product owner, I want a fixed, centralized color token system, so that every screen renders a consistent premium dark theme with neon green accents.

#### Acceptance Criteria

1. THE Design_System SHALL define color tokens with the exact values Background `#050505`, Panel `#111111`, Border `#252525`, Primary White `#FFFFFF`, Secondary Grey `#A0A0A0`, Primary Neon Green `#B6FF00`, and Bright Neon Green `#AFFF00`.
2. THE Design_System SHALL expose the color tokens from a single central source consumed by all screens and components.
3. IF any screen or component references a color value that is not one of the seven defined tokens, THEN THE Design_System SHALL treat it as a non-conforming value and surface a validation error indicating the disallowed color.
4. THE LienPay_App SHALL apply the Background token `#050505` as the base surface color for 100% of screens.
5. WHERE an element is a primary call-to-action, active navigation item, key financial number, highlight, progress indicator, selected state, or success state, THE LienPay_App SHALL apply a neon green token color (`#B6FF00` or `#AFFF00`) to that element.
6. THE LienPay_App SHALL apply the neon green glow effect to no more than 3 distinct elements visible on any single screen at one time, and SHALL reserve the glow effect for the single hero/primary financial figure and the primary call-to-action on that screen.
7. THE LienPay_App SHALL distinguish neon green color usage, which is permitted on all primary call-to-action controls, active navigation items, key financial figures, highlights, progress indicators, and selected or success states, from the neon green glow effect, which remains constrained by acceptance criterion 6.
8. THE LienPay_App SHALL NOT introduce blue, teal, purple, or cyan as a primary user-interface color on any screen or component.
9. WHEN rendering supporting or secondary text, THE LienPay_App SHALL apply the Secondary Grey token `#A0A0A0`.
10. WHEN rendering primary text, THE LienPay_App SHALL apply the Primary White token `#FFFFFF`.

### Requirement 2: Typography System

**User Story:** As a user, I want clear, premium typography, so that key financial figures stand out and content is easy to read.

#### Acceptance Criteria

1. THE Design_System SHALL define Satoshi as the sole primary brand and Landing_Page typeface and a single clean sans-serif family as the only fallback font family.
2. IF the Satoshi font fails to load within 3 seconds of a screen initiating rendering, THEN THE LienPay_App SHALL render all affected text using the defined sans-serif fallback family and SHALL preserve the same typographic scale, weight, and layout defined for Satoshi.
3. WHEN a screen displays Credit_Limit, Available_Credit, Portfolio Value, Outstanding Amount, or any other key financial metric, THE LienPay_App SHALL render each such value at a font size at least 1.5 times larger than the font size of the adjacent label and body text on the same screen.
4. THE Design_System SHALL expose all typographic scale definitions, including font size, weight, and line height for each defined text style, from a single central source consumed by all screens and components.
5. IF a screen or component references a text style not defined in the central typographic source, THEN THE LienPay_App SHALL render that text using the defined default body text style.
6. THE LienPay_App SHALL NOT introduce any font family other than Satoshi and its defined sans-serif fallback family across the Landing_Page and the Product_Application.
7. Because the prototype MUST NOT make external network or API calls, THE LienPay_App SHALL bundle the Satoshi font locally with the application and SHALL load Satoshi exclusively from the locally bundled font asset.
8. THE LienPay_App SHALL NOT load the Satoshi font from an external content delivery network or any external network source.

### Requirement 3: Application Visual Language

**User Story:** As a user, I want a cohesive premium interface, so that the application feels sophisticated, financial, and consistent with the landing page.

#### Acceptance Criteria

1. THE LienPay_App SHALL present a dark interface in which every card component uses rounded corners, dark borders, and near-black surface color tokens defined in the shared design system, with a text-to-surface contrast ratio of at least 4.5:1 for body text and 3:1 for large text.
2. THE LienPay_App SHALL apply the same color tokens, typography system, spacing principles, border and radius language, component language, and overall visual identity defined in the shared design system across the Landing_Page and the Product_Application, while permitting each experience to use different layouts and context-specific components such that the Landing_Page MAY use larger typography, cinematic compositions, parallax, and marketing-specific sections and the Product_Application MAY use denser financial user interface, navigation, forms, and data components.
3. WHEN the LienPay_App renders any application screen, THE LienPay_App SHALL display supporting text using the Secondary Grey token and primary text using the Primary White token so that primary text and supporting text are rendered in two distinct, consistently applied tokens.
4. THE LienPay_App SHALL apply neon green accent tokens and green glow effects only to primary action controls and key financial figures, and SHALL NOT apply neon green accents or glow to supporting text or secondary controls.
5. IF a screen cannot resolve a required shared design token, THEN THE LienPay_App SHALL fall back to the corresponding default token from the shared design system and record the unresolved-token condition, preserving the dark high-contrast presentation.
6. WHEN the LienPay_App renders an active navigation item or a selected state, THE LienPay_App SHALL indicate the active or selected condition using a non-color secondary indicator in addition to the neon green accent, such that the active or selected condition is not signaled by neon green color alone.
7. WHEN an interactive control receives keyboard focus, THE LienPay_App SHALL display a visible keyboard focus indicator on that control.
8. THE LienPay_App SHALL expose an accessible text label for each icon-only control, including the Top_Bar Profile control and the Top_Bar Notifications control.

### Requirement 4: Landing Page Motion and Presentation

**User Story:** As a prospective user, I want a cinematic, premium landing page, so that I understand and trust the LienPay product.

#### Acceptance Criteria

1. WHILE the user scrolls the Landing_Page, THE Animation_System SHALL provide smooth inertial scrolling that settles within 0.8 to 1.2 seconds and maintains a frame rate of at least 60fps, with the technical design determining the exact scrolling implementation.
2. WHEN a Landing_Page section becomes at least 10% visible in the viewport, THE Animation_System SHALL reveal the section by transitioning opacity from 0 to 1 and translate offset from between 16px and 32px to 0, over a duration between 400 and 800 milliseconds.
3. WHILE the user scrolls the Landing_Page, THE Animation_System SHALL apply parallax to designated elements with a maximum offset of 60px.
4. WHEN a financial number on the Landing_Page becomes at least 10% visible in the viewport, THE Animation_System SHALL animate the number to its exact final value over a duration between 1000 and 2000 milliseconds.
5. WHEN a user hovers or presses a Landing_Page button, THE Animation_System SHALL begin the button micro-interaction within 100 milliseconds and constrain scale between 0.95 and 1.05.
6. THE Animation_System SHALL restrain landing page motion to the effects defined in this requirement and SHALL exclude bouncing, cartoon-style, elastic, spring-back, and other distracting effects.
7. THE Landing_Page SHALL use the LienPay Background `#050505` and neon green token color system.
8. WHERE the operating environment reports a reduced-motion preference as enabled, THE Animation_System SHALL disable Landing_Page reveals, parallax, number animations, text reveals, card entrance animations, green-glow transitions, and pinned section motion, and SHALL present completed final states immediately.
9. WHEN a Landing_Page text block becomes at least 10% visible in the viewport, THE Animation_System SHALL reveal the text block using a transform and opacity transition.
10. WHEN a Landing_Page card becomes at least 10% visible in the viewport, THE Animation_System SHALL apply a card entrance animation using a transform and opacity transition.
11. WHERE a Landing_Page element uses a neon green glow, THE Animation_System SHALL apply a subtle green-glow transition to that element within the glow limits defined in Requirement 1.
12. WHILE the user scrolls the Landing_Page, THE Animation_System SHALL apply a smooth navbar transition to the Landing_Page navigation bar.
13. WHERE a Landing_Page section is designated as a storytelling section, THE Animation_System SHALL apply sticky or pinned behavior to that section during scroll.
14. THE Animation_System SHALL implement Landing_Page animations using transform-based and opacity-based motion, SHALL target a frame rate of at least 60fps, and WHERE the viewport width is below 768px SHALL reduce or disable parallax and glow effects.

### Requirement 5: Pre-Activation Screen Order

**User Story:** As a new user, I want a guided onboarding sequence, so that I can activate my credit line step by step.

#### Acceptance Criteria

1. THE Pre_Activation_Flow SHALL present screens in exactly this order: Splash, Mobile Verification, OTP Verification, Name Setup, Welcome, Pre-Activation Home, Portfolio / Credit Eligibility, Fund Selection, Pledge Consent, Pledge Processing, KYC, Aadhaar Verification, Selfie Verification, Bank Account, Auto-Debit / Mandate, Agreement, e-Sign, Final Credit Review, Activation, Activation Success, comprising exactly 20 screens.
2. WHEN a user provides all required inputs for the current Pre_Activation_Flow screen with valid values and confirms advancement, THE LienPay_App SHALL advance to the next screen in the defined order within 2 seconds.
3. THE LienPay_App SHALL NOT reorder, remove, or insert screens into the Pre_Activation_Flow sequence defined in acceptance criterion 1.
4. WHILE the user progresses through the Pre_Activation_Flow, THE LienPay_App SHALL display a progress indicator showing the current screen position as a number from 1 to 20 relative to the total of 20 screens.
5. IF a user attempts to advance from the current Pre_Activation_Flow screen while one or more required inputs are missing or invalid, THEN THE LienPay_App SHALL remain on the current screen, retain the user's entered values, and display an error indication identifying the missing or invalid inputs.
6. WHEN a user completes the final screen (Activation Success), THE LienPay_App SHALL terminate the Pre_Activation_Flow without advancing to any additional Pre_Activation_Flow screen.
7. WHILE the user is on any Pre_Activation_Flow screen other than the first screen (Splash), THE LienPay_App SHALL allow the user to navigate back to the immediately preceding screen in the defined order.
8. WHEN the user navigates back to a preceding Pre_Activation_Flow screen, THE LienPay_App SHALL display that screen with the values the user previously entered on it retained.
9. THE LienPay_App SHALL store Pre_Activation_Flow in-progress onboarding state as session-scoped, non-persistent state.
10. WHEN the user reloads the LienPay_App during the Pre_Activation_Flow, THE LienPay_App SHALL reset the in-progress onboarding state and return the user to the first screen (Splash).

### Requirement 6: Pre-Activation Verification and Setup Screens

**User Story:** As a new user, I want to verify my mobile number and set up my profile, so that I can begin the credit activation process.

#### Acceptance Criteria

1. WHEN the LienPay_App launches, THE LienPay_App SHALL display the Splash screen for a duration between 1 and 3 seconds and then advance to the Mobile Verification screen.
2. WHEN a user submits a mobile number consisting of 10 to 15 numeric digits on the Mobile Verification screen, THE Mock_Service SHALL simulate sending a one-time passcode and THE LienPay_App SHALL advance to the OTP Verification screen within 2 seconds.
3. WHEN a user enters a 6-digit one-time passcode on the OTP Verification screen, THE Mock_Service SHALL simulate verification and THE LienPay_App SHALL advance to the Name Setup screen within 2 seconds.
4. WHEN a user submits a name containing 1 to 50 characters on the Name Setup screen, THE LienPay_App SHALL store the name in Application_State and advance to the Welcome screen.
5. IF a user submits a mobile number that is not 10 to 15 numeric digits, or a one-time passcode that is not exactly 6 digits or does not match the value simulated by the Mock_Service, THEN THE LienPay_App SHALL display an error state indicating the input is invalid, retain the user's entered value, and remain on the current screen.
6. IF a user submits an empty mobile number, empty one-time passcode, or empty name on the respective screen, THEN THE LienPay_App SHALL display an error state indicating the field is required and remain on the current screen.

### Requirement 7: Eligibility, Fund Selection, and Pledge

**User Story:** As a user, I want to review my eligible investments and pledge selected funds, so that I can establish my credit line.

#### Acceptance Criteria

1. WHEN the user reaches the Portfolio / Credit Eligibility screen, THE LienPay_App SHALL display the portfolio value and the credit eligibility amount reproduced exactly as defined by the Mock_Service demo data, preserving Indian lakh digit grouping and each value's own decimal formatting, with no standard or Western digit grouping and no reformatting.
2. WHEN the user reaches the Fund Selection screen, THE LienPay_App SHALL display each fund provided by the Mock_Service demo data as an individual FundCard component, supporting a maximum of 50 funds.
3. WHEN a user selects or deselects a fund on the Fund Selection screen, THE LienPay_App SHALL toggle the selected state of the corresponding FundCard and update the displayed count of selected funds within 200 milliseconds.
4. WHEN a user confirms consent on the Pledge Consent screen AND at least one fund is selected, THE LienPay_App SHALL advance to the Pledge Processing screen.
5. IF the user attempts to proceed from the Pledge Consent screen without confirming consent OR with zero funds selected, THEN THE LienPay_App SHALL remain on the current screen and display a message indicating that consent and at least one selected fund are required.
6. WHILE the Pledge Processing screen is active, THE LienPay_App SHALL display a loading/processing indicator simulated by the Mock_Service for a duration between 2 and 5 seconds.
7. WHEN the Mock_Service completes the simulated Pledge Processing successfully, THE LienPay_App SHALL update Application_State with a successful pledge status and advance directly to the next screen in the 20-screen sequence, the KYC screen, without adding, removing, or reordering any screen.
8. IF the Mock_Service simulated pledge processing fails, THEN THE LienPay_App SHALL remain on the Pledge Processing screen and display an error message indicating the pledge could not be completed, while preserving the selected fund data.

### Requirement 8: KYC, Bank, Mandate, Agreement, and e-Sign

**User Story:** As a user, I want to complete identity verification and authorizations, so that my credit account can be activated.

#### Acceptance Criteria

1. WHEN the user submits each of the KYC, Aadhaar Verification, and Selfie Verification screens, THE Mock_Service SHALL simulate the verification step without calling any external identity API and return a simulated success result after a simulated delay between 500 and 2000 milliseconds, enabling the LienPay_App to advance to the next verification screen.
2. WHEN the user submits bank account details on the Bank Account screen, THE Mock_Service SHALL simulate account capture without calling any external banking API and return a simulated success result after a simulated delay between 500 and 2000 milliseconds.
3. IF the user submits bank account details on the Bank Account screen with any required field empty or malformed, THEN THE LienPay_App SHALL reject the submission, display an error indication identifying the invalid field, and retain the previously entered values.
4. WHEN the user authorizes the mandate on the Auto-Debit / Mandate screen, THE Mock_Service SHALL simulate mandate setup without calling any external payment API and return a simulated success result after a simulated delay between 500 and 2000 milliseconds.
5. WHEN the user completes the e-Sign screen after reviewing the Agreement screen, THE LienPay_App SHALL advance to the Final Credit Review screen.
6. IF the user attempts to proceed from the e-Sign screen without completing the e-Sign action, THEN THE LienPay_App SHALL prevent advancement and display an error indication that e-Sign completion is required.
7. WHEN the user confirms on the Final Credit Review and Activation screens, THE LienPay_App SHALL advance to the Activation Success screen and mark the account as active in Application_State.

### Requirement 9: Pre-Activation Navigation

**User Story:** As a prospective user, I want simple navigation before activation, so that I can explore the product.

#### Acceptance Criteria

1. WHILE the user is in the pre-activation experience, THE Pre_Activation_Nav SHALL present exactly three items in the order Home, Benefits, and Learn.
2. WHEN a user selects a Pre_Activation_Nav item, THE LienPay_App SHALL navigate to the corresponding pre-activation destination within 1000 milliseconds.
3. WHEN navigation to a Pre_Activation_Nav destination completes, THE Pre_Activation_Nav SHALL visually indicate the selected item as the active item and indicate exactly one active item at a time.
4. IF navigation to the selected Pre_Activation_Nav destination fails to complete within 1000 milliseconds, THEN THE LienPay_App SHALL retain the current destination and display an error indication that navigation was unsuccessful.
5. THE Pre_Activation_Nav SHALL NOT include the Active_Account_Experience navigation items (Transactions, Repayments, Portfolio).

### Requirement 10: Active Account Bottom Navigation

**User Story:** As an active user, I want consistent bottom navigation, so that I can move between my key account areas.

#### Acceptance Criteria

1. WHILE the account is active, THE Bottom_Navigation SHALL present exactly four items labeled Home, Transactions, Repayments, and Portfolio, displayed left-to-right in that order.
2. THE Bottom_Navigation SHALL NOT include a Profile item or a Notifications item.
3. WHEN a user selects a Bottom_Navigation item, THE LienPay_App SHALL navigate to the corresponding screen within 500 milliseconds of the selection.
4. WHEN navigation to a Bottom_Navigation item's screen completes, THE LienPay_App SHALL mark that item as the active navigation state using a neon green accent and SHALL render all other Bottom_Navigation items in their inactive (non-accent) state.
5. IF navigation to a selected Bottom_Navigation item's screen fails to complete within 500 milliseconds, THEN THE LienPay_App SHALL retain the previously active screen, keep the previously active item marked as active, and display an indication that the navigation did not complete.
6. THE Top_Bar SHALL provide a Profile control and a Notifications control that give access to the Profile and Notifications screens.
7. WHEN a user selects the Profile control or the Notifications control from the Top_Bar, THE LienPay_App SHALL navigate to the corresponding screen within 500 milliseconds of the selection.
8. WHEN the user reaches the Activation Success screen and the account is marked active in Application_State, THE LienPay_App SHALL switch the interface from the Pre_Activation_Nav (Home, Benefits, Learn) to the Active_Account Bottom_Navigation presenting exactly the four tabs Home, Transactions, Repayments, and Portfolio.
9. THE LienPay_App SHALL keep the Profile control and the Notifications control only in the Top_Bar and SHALL NOT add a Profile tab or a Notifications tab to the Bottom_Navigation.

### Requirement 11: Active Account Screen Purposes

**User Story:** As an active user, I want each account area to serve a clear purpose, so that I can quickly find the information I need.

#### Acceptance Criteria

1. WHEN the user opens the Home screen, THE Home screen SHALL display the complete active-home experience defined by the LienPay Application Design Specification, including the user's current credit position with Credit_Limit, Available_Credit, Used_Credit, current LTV, and Credit_Health.
2. WHEN the user opens the Transactions screen, THE Transactions screen SHALL display the transaction history defined by the LienPay Application Design Specification as a list of TransactionCard components ordered from most recent to oldest, together with the interaction behavior specified for the transaction history.
3. WHEN the user opens the Repayments screen, THE Repayments screen SHALL display the repayment experience defined by the LienPay Application Design Specification, including Outstanding Amount, Amount Due, the specified repayment actions, and repayment history, using RepaymentCard components.
4. WHEN the user opens the Portfolio screen, THE Portfolio screen SHALL display the complete portfolio and credit-limit experience including Total Portfolio Value, Eligible Portfolio and Credit Eligibility, Credit_Limit, Available_Credit, current LTV, Credit_Health, Pledged Investments, Fund Holdings, and Potential Credit Limit Increase.
5. WHEN the user opens the Profile screen, THE Profile screen SHALL display the account management responsibilities defined by the LienPay Application Design Specification.
6. WHEN the user opens the Notifications screen, THE Notifications screen SHALL display the items requiring the user's attention defined by the LienPay Application Design Specification using NotificationItem components.
7. IF a screen among Transactions, Repayments, or Notifications has no records in the mock demo data, THEN THE affected screen SHALL display an empty-state message indicating that no items are available.
8. IF the mock demo data for a screen fails to load, THEN THE affected screen SHALL display an error message indicating the data could not be loaded and SHALL retain any previously displayed values.
9. THE LienPay_App SHALL display the mandated fixed financial values as the canonical Initial_Snapshot on load, presenting them display-only until the user performs a simulated spend or payment action.
10. WHEN the user performs a simulated spend or payment action, THE LienPay_App SHALL update Used_Credit and Available_Credit in Application_State relative to the Initial_Snapshot without calling any real payment API.
11. WHEN a simulated spend or payment action updates Used_Credit or Available_Credit in Application_State, THE LienPay_App SHALL update every dependent UI element that reads those values automatically.
12. WHEN the user reloads the LienPay_App after a simulated spend or payment action, THE LienPay_App SHALL reset Application_State to the fixed Initial_Snapshot values.
13. THE LienPay_App SHALL present the Credit Limit Increase experience within the Portfolio screen and SHALL NOT present the Credit Limit Increase experience as a fifth Bottom_Navigation item.
14. THE LienPay_App SHALL make the Learn experience reachable through its specified access points and SHALL NOT add Learn as a Bottom_Navigation item in the Active_Account_Experience.

### Requirement 12: Mock Data and Fixed Financial Values

**User Story:** As a stakeholder, I want fixed, realistic demo data, so that the prototype demonstrates the product without real integrations.

#### Acceptance Criteria

1. THE Mock_Service SHALL provide portfolio and credit demo data with the exact values Portfolio Value ₹4,72,000, Credit_Limit ₹2,21,500, Available_Credit ₹2,21,500, Used_Credit ₹0, current LTV 34%, and Credit_Health "Healthy", with each value and label matching character-for-character.
2. THE Mock_Service SHALL provide the example transactions Cafe Delhi Heights ₹1,248, Bharat Petroleum ₹2,000, DMart ₹1,856, MakeMyTrip ₹6,350, and Apollo Pharmacy ₹743.50, exposing all 5 transactions with amounts and merchant labels matching character-for-character.
3. THE Mock_Service SHALL provide the example repayment data Outstanding ₹24,680 and Amount Due ₹8,240, with each value and label matching character-for-character.
4. WHEN any application screen renders a financial value or label defined in acceptance criteria 1 through 3, THE LienPay_App SHALL reproduce that value exactly as supplied by the Mock_Service, character-for-character, preserving Indian lakh digit grouping (for example `₹4,72,000` and `₹2,21,500`) and each value's own decimal formatting (for example `₹743.50` retaining two decimal places and `₹4,72,000` retaining none), with no rounding, no standard or Western digit grouping, no reformatting, and no relabeling of amounts.
5. THE Mock_Service SHALL supply all demo data referenced in acceptance criteria 1 through 3 from one central data source, such that every screen consuming a given field receives an identical value.
6. IF the Mock_Service demo data cannot be loaded when a screen requests it, THEN THE LienPay_App SHALL display an indication that demo data is unavailable and SHALL NOT display placeholder, blank, or partial financial values.

### Requirement 13: No Real External Integrations

**User Story:** As a stakeholder, I want the prototype to remain fully mock-based, so that it is safe to demonstrate without live financial systems.

#### Acceptance Criteria

1. THE LienPay_App SHALL operate entirely through Mock_Service data and SHALL NOT initiate any outbound network request to real banking, PAN, Aadhaar, UPI, mutual fund, pledge, or payment APIs.
2. WHEN any screen requires backend data or a backend action, THE LienPay_App SHALL obtain the data or simulate the action exclusively through the Mock_Service and SHALL NOT access any external network endpoint.
3. WHERE a screen simulates an asynchronous operation, THE Mock_Service SHALL return predefined demo results, drawn from the mock dataset, after a simulated delay between 500 milliseconds and 2000 milliseconds.
4. IF the Mock_Service receives a request for which no matching mock data is defined, THEN THE Mock_Service SHALL return a mock error response indicating the requested data is unavailable and SHALL leave existing screen data unchanged.
5. WHILE a simulated asynchronous operation is in progress, THE LienPay_App SHALL display a loading indicator until the Mock_Service returns a result or the 2000 millisecond maximum delay elapses.

### Requirement 14: Reusable Component Architecture

**User Story:** As a developer, I want a centralized architecture, so that the prototype is consistent and maintainable.

#### Acceptance Criteria

1. THE Design_System SHALL provide the following 23 Reusable_Components: AppShell, TopBar, BottomNavigation, PrimaryButton, SecondaryButton, FinancialCard, MetricCard, StatusCard, FundCard, TransactionCard, RepaymentCard, CreditHealthCard, ProgressStepper, ProcessTimeline, OTPInput, InputField, StickySummary, BottomSheet, Modal, SuccessState, ErrorState, LoadingState, and NotificationItem.
2. THE LienPay_App SHALL define each of design tokens, Application_State, mock data, navigation configuration, the Animation_System, and financial components in exactly one centralized source of truth, with no duplicate definitions of the same concern across modules.
3. WHEN a screen renders a UI element that matches an existing Reusable_Component, THE LienPay_App SHALL render that element using the corresponding Reusable_Component rather than a screen-specific duplicate.
4. THE LienPay_App SHALL manage all cross-screen data through the centralized Application_State, such that a data value updated on one screen is reflected on every other screen that reads that value.
5. WHEN a value in the centralized design tokens is updated, THE LienPay_App SHALL apply the updated value to every Reusable_Component that references that token.
6. WHEN the same Reusable_Component is rendered on two or more screens, THE LienPay_App SHALL produce identical visual appearance and interaction behavior for that component across those screens.

### Requirement 15: Responsive Layout

**User Story:** As a mobile-first user, I want the interface to adapt across devices, so that it looks premium on any screen.

#### Acceptance Criteria

1. WHEN rendering at viewport widths of 390px, 393px, and 430px, THE LienPay_App SHALL display all content within the visible viewport width without horizontal scrolling, with no clipped or overlapping elements, and SHALL render all interactive touch targets at a minimum size of 44px by 44px.
2. WHERE the viewport width is at least 768px, THE LienPay_App SHALL adapt the layout at 768px, 1024px, and widths up to 2560px such that no content is clipped, overlapping, or requires horizontal scrolling.
3. WHILE the viewport width is 1024px or greater, THE LienPay_App SHALL render the Landing_Page as full-width responsive sections and SHALL constrain the Landing_Page content to a maximum content width of 1280px, centered horizontally with equal left and right margins.
4. WHILE the viewport width is 1024px or greater, THE LienPay_App SHALL render the Product_Application within a narrow, phone-like centered column (mobile-first shell) rather than stretching the mobile user interface to full width.
5. WHERE the viewport width is below 390px, THE LienPay_App SHALL adapt the layout fluidly, SHALL display all content within the visible viewport width without horizontal page scrolling, SHALL NOT clip content, SHALL render all interactive touch targets at a minimum size of 44px by 44px, and SHALL preserve readable typography and usable controls.

### Requirement 16: Reusable Animation System

**User Story:** As a user, I want consistent, restrained motion throughout the app, so that the experience feels cohesive and premium.

#### Acceptance Criteria

1. THE Animation_System SHALL provide reusable motion behaviors for scroll reveals, section transitions, animated financial numbers, and button micro-interactions, and SHALL apply each behavior type consistently across all screens that use it.
2. WHEN the LienPay_App transitions between screens, THE Animation_System SHALL complete the screen transition within 200 to 400 milliseconds.
3. WHEN a financial figure updates in Application_State, THE Animation_System SHALL animate the displayed value from its previous value to its new value over a duration of 300 to 800 milliseconds.
4. WHEN a button micro-interaction is triggered, THE Animation_System SHALL complete the micro-interaction within 100 to 250 milliseconds.
5. THE Animation_System SHALL apply motion using linear or ease-based timing only and SHALL exclude overshoot, bounce, elastic, spring-back, rotation-based, and scale-pulse effects.
6. WHERE the operating environment reports a reduced-motion preference as enabled, THE Animation_System SHALL disable scroll reveals, section transitions, and value-change animations and SHALL display final states immediately without intermediate motion.

### Requirement 17: Two-Experience Architecture

**User Story:** As a product owner, I want two distinct experiences built on one shared design core, so that the marketing and product surfaces feel unified yet behave appropriately for their context.

#### Acceptance Criteria

1. THE LienPay_App SHALL comprise exactly two distinct experiences: the Marketing/Landing_Page experience and the Product_Application experience.
2. THE LienPay_App SHALL render both the Landing_Page and the Product_Application using the same centralized Design_System, sharing color tokens, typography system, spacing principles, border and radius language, component language, and overall visual identity, while permitting each experience to use different layouts and context-specific components appropriate to its purpose.
3. THE Landing_Page SHALL use the cinematic motion system defined in Requirement 4.
4. THE Product_Application SHALL use the same visual identity as the Landing_Page with restrained, functional animations as defined in Requirement 16.
5. THE Animation_System SHALL scope smooth inertial scrolling to the Landing_Page only, with the technical design determining the exact scrolling implementation.
6. THE Product_Application SHALL use native scrolling and SHALL NOT apply smooth inertial scrolling.

### Requirement 18: Source-of-Truth Hierarchy

**User Story:** As a product owner, I want a defined precedence order for design and requirement sources, so that conflicts are resolved consistently and never overridden silently.

#### Acceptance Criteria

1. THE LienPay_App SHALL treat design and requirement sources in the following precedence order, from highest to lowest: (1) the LienPay Application Design Specification, (2) the supplied LienPay application screenshots, (3) the user-approved LienPay color system, (4) the user-approved landing-page animation reference, (5) the approved technical design, and (6) general UX conventions.
2. THE LienPay_App SHALL NOT silently override an explicit product requirement defined by a higher-precedence source.
3. IF a conflict is detected between a lower-precedence source and a higher-precedence source, THEN THE LienPay_App SHALL flag and surface the conflict rather than resolving it silently.

### Requirement 19: Centralized State Model

**User Story:** As a developer, I want all shared prototype state managed centrally, so that every screen reflects a single consistent source of truth.

#### Acceptance Criteria

1. THE LienPay_App SHALL manage the following values in centralized Application_State: onboarding status, verification status, portfolio status, selected funds, pledge status, KYC status, bank verification status, mandate status, agreement status, e-sign status, activation status, Credit_Limit, Available_Credit, Used_Credit, portfolio value, LTV, Credit_Health, transactions, repayments, and notifications.
2. THE LienPay_App SHALL initialize Application_State from the canonical Initial_Snapshot and SHALL display the mandated fixed values character-for-character on load.
3. THE LienPay_App SHALL store LTV and Credit_Health as fixed display values and SHALL NOT compute them from other Application_State values.
4. WHEN any shared value in Application_State changes, THE LienPay_App SHALL update every dependent UI element that reads that value automatically.
5. THE LienPay_App SHALL treat the LTV value of 34% as a fixed display value, because it is not derivable from Used_Credit ₹0, Portfolio Value ₹4,72,000, and Credit_Limit ₹2,21,500, and SHALL surface this internal inconsistency as a flagged condition rather than recomputing the value.
6. WHEN the user performs a simulated spend or payment action, THE LienPay_App SHALL update Used_Credit and Available_Credit in Application_State from the Initial_Snapshot, session-scoped and non-persistent, without calling any real payment API.
7. WHEN the user reloads the LienPay_App, THE LienPay_App SHALL reset Application_State to the fixed Initial_Snapshot values.
8. WHEN a state-changing operation completes, including a successful payment, repayment, pledge, credit-limit change, or any other operation that modifies a shared value in Application_State, THE LienPay_App SHALL update Application_State centrally and update every dependent screen and UI element that reads the affected values automatically.

### Requirement 20: Screen Content Compliance

**User Story:** As a product owner, I want every screen to preserve the content and behavior defined by the source specification, so that the prototype faithfully reproduces the intended product.

#### Acceptance Criteria

1. FOR every screen in the Pre_Activation_Flow and the Active_Account_Experience, THE LienPay_App SHALL preserve the content and behavior defined by the LienPay Application Design Specification, including header, supporting copy, call-to-action labels, fields, cards, financial values, progress indicators, navigation, loading states, success states, error states, transitions, and conditional behavior.
2. THE LienPay_App SHALL treat the LienPay Application Design Specification as the primary source of truth for screen content and behavior.
3. THE LienPay_App SHALL NOT specify only that a screen exists without preserving the specified content and behavior of that screen defined by the LienPay Application Design Specification.
4. WHERE the detailed content of a screen defined by the LienPay Application Design Specification is not yet provided in text form, THE design phase SHALL capture that screen's content before implementation of that screen begins.

### Requirement 21: Payment (Pay) Flow

**User Story:** As an active user, I want to make a payment using my credit line, so that I can spend against my available credit within the app.

#### Acceptance Criteria

1. THE Active_Account_Experience SHALL provide a Pay experience comprising Scan QR, Enter UPI ID, Pay Contact, and Bills.
2. THE LienPay_App SHALL make the Pay experience reachable from within the Active_Account_Experience, such as from the Home screen, and SHALL NOT present the Pay experience as a fifth Bottom_Navigation item.
3. THE LienPay_App SHALL provide a demo payment with Merchant "DMart", Amount ₹1,856, and Payment Method "LienPay Credit Line".
4. WHEN the user completes the demo payment successfully, THE LienPay_App SHALL update Available_Credit, Used_Credit, and the transactions list in centralized Application_State, and THE LienPay_App SHALL update every dependent screen and UI element that reads those values automatically.
5. THE LienPay_App SHALL simulate the Pay experience entirely through the Mock_Service and SHALL NOT initiate any real UPI or payment API request.
6. WHEN the Pay experience displays any monetary amount, THE LienPay_App SHALL format that amount according to Requirement 12, preserving Indian lakh digit grouping and each value's own decimal formatting.

### Requirement 22: Activate Account CTA

**User Story:** As a prospective user, I want a prominent Activate Account button on the Pre-Activation Home screen, so that I can start or resume my credit activation journey from a single clear action.

#### Acceptance Criteria

1. WHILE the activation status in Application_State is not "active", THE LienPay_App SHALL display the Activate_Account_CTA on the Pre-Activation Home screen (screen 6 of the 20-screen Pre_Activation_Flow sequence defined in Requirement 5) as the primary call-to-action for starting or continuing activation.
2. THE LienPay_App SHALL position the Activate_Account_CTA below the main content of the Pre-Activation Home screen, with spacing separating the Activate_Account_CTA from the content above it and from the bottom mobile safe area.
3. THE LienPay_App SHALL render the Activate_Account_CTA as a visually prominent primary button that follows the Design_System.
4. THE LienPay_App SHALL render the Activate_Account_CTA using the Primary Neon Green token `#B6FF00` as the button background, dark text drawn from the Background token `#050505` on the green button, rounded premium button styling, and a minimum touch target of 44px by 44px.
5. THE LienPay_App SHALL apply a subtle hover and press interaction animation to the Activate_Account_CTA within the button micro-interaction limits defined in Requirement 16, SHALL NOT apply an excessive glow effect to the Activate_Account_CTA, and SHALL NOT apply any color to the Activate_Account_CTA outside the seven Design_System tokens defined in Requirement 1 (Background `#050505`, Panel `#111111`, Border `#252525`, Primary White `#FFFFFF`, Secondary Grey `#A0A0A0`, Primary Neon Green `#B6FF00`, Bright Neon Green `#AFFF00`).
6. THE LienPay_App SHALL NOT include the Activate_Account_CTA as an item of the Bottom_Navigation, the Active_Account_Experience navigation, or the Pre_Activation_Nav.
7. WHEN the user has not started the activation process, THE LienPay_App SHALL display the Activate_Account_CTA with the label "Activate Account".
8. WHEN the user selects the Activate_Account_CTA and no activation step is recorded as complete in Application_State, THE LienPay_App SHALL enter the Pre_Activation_Flow using the existing 20-screen sequence defined in Requirement 5 and SHALL NOT create a new activation screen.
9. THE LienPay_App SHALL NOT add, remove, reorder, or insert any screen in the 20-screen Pre_Activation_Flow sequence as a result of the Activate_Account_CTA.
10. IF one or more activation steps are recorded as complete in Application_State while the activation status is not "active", THEN WHEN the user selects the Activate_Account_CTA, THE LienPay_App SHALL continue from the next incomplete activation step determined by the onboarding, verification, pledge, KYC, bank verification, mandate, agreement, and e-sign status values in Application_State rather than restarting the Pre_Activation_Flow.
11. WHEN the user selects the Activate_Account_CTA to continue an in-progress activation, THE LienPay_App SHALL preserve the existing onboarding, verification, pledge, KYC, bank verification, mandate, agreement, and e-sign state stored in Application_State.
12. WHERE the product specification does not define a distinct continuation label, THE LienPay_App SHALL display the Activate_Account_CTA with the label "Activate Account" when the user continues an in-progress activation.
13. WHEN the Activation Success screen is completed and the activation status in Application_State is "active", THE LienPay_App SHALL NOT display the Activate_Account_CTA as an activation call-to-action.
14. WHEN the activation status in Application_State becomes "active", THE LienPay_App SHALL enter the Active_Account_Experience.
15. WHILE the account is active, THE LienPay_App SHALL keep the Active_Account Bottom_Navigation as exactly the four items Home, Transactions, Repayments, and Portfolio in that order, and SHALL keep the Profile control and the Notifications control accessible from the Top_Bar, consistent with Requirement 10.
16. WHEN rendering the Activate_Account_CTA at viewport widths of 390px, 393px, 430px, 768px, and 1024px and greater, THE LienPay_App SHALL display the Activate_Account_CTA fully within the visible viewport width without clipping or overlap, keep the Activate_Account_CTA above the mobile safe area, and SHALL NOT overlap the Bottom_Navigation or other fixed elements.
