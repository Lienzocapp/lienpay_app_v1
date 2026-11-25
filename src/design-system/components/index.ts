/**
 * LienPay Design System — reusable components barrel.
 *
 * Re-exports the shared, reusable components so screens can import from a single
 * entry point. Each component is authored exactly once under its own folder
 * (Req 14.1, 14.3, 14.6). This barrel currently exports the Phase 1 primitives
 * and frame components; later phases extend it with the remaining components.
 */

// Primitives (task 4.7)
export { PrimaryButton } from "./PrimaryButton";
export type { PrimaryButtonProps } from "./PrimaryButton";
export { SecondaryButton } from "./SecondaryButton";
export type { SecondaryButtonProps } from "./SecondaryButton";
export { InputField } from "./InputField";
export type { InputFieldProps } from "./InputField";
export { OTPInput } from "./OTPInput";
export type { OTPInputProps } from "./OTPInput";

// Layout / frame components (task 4.8)
export { AppShell } from "./AppShell";
export type { AppShellProps } from "./AppShell";
export { TopBar } from "./TopBar";
export type { TopBarProps } from "./TopBar";
export { BottomNavigation } from "./BottomNavigation";
export type {
  BottomNavigationProps,
  BottomNavigationItem,
} from "./BottomNavigation";

// Financial / content card components (task 4.9)
export { FinancialCard } from "./FinancialCard";
export type { FinancialCardProps } from "./FinancialCard";
export { MetricCard } from "./MetricCard";
export type { MetricCardProps } from "./MetricCard";
export { StatusCard } from "./StatusCard";
export type { StatusCardProps, StatusTone } from "./StatusCard";
export { FundCard } from "./FundCard";
export type { FundCardProps } from "./FundCard";
export { TransactionCard } from "./TransactionCard";
export type { TransactionCardProps } from "./TransactionCard";
export { RepaymentCard } from "./RepaymentCard";
export type { RepaymentCardProps } from "./RepaymentCard";
export { CreditHealthCard } from "./CreditHealthCard";
export type {
  CreditHealthCardProps,
  CreditHealthTone,
} from "./CreditHealthCard";
export { CardVisual, CARD_VISUAL_SRC } from "./CardVisual";
export type { CardVisualProps, CardVisualSize } from "./CardVisual";
export { ProgressStepper } from "./ProgressStepper";
export type { ProgressStepperProps } from "./ProgressStepper";
export { ProgressRing } from "./ProgressRing";
export type { ProgressRingProps } from "./ProgressRing";
export { ArcGauge } from "./ArcGauge";
export type { ArcGaugeProps } from "./ArcGauge";
export { LinearProgress } from "./LinearProgress";
export type { LinearProgressProps } from "./LinearProgress";
export { BrandAvatar } from "./BrandAvatar";
export type { BrandAvatarProps } from "./BrandAvatar";
export { ProcessTimeline } from "./ProcessTimeline";
export type {
  ProcessTimelineProps,
  ProcessStep,
  ProcessStepStatus,
} from "./ProcessTimeline";
export { StickySummary } from "./StickySummary";
export type { StickySummaryProps } from "./StickySummary";
export { NotificationItem } from "./NotificationItem";
export type { NotificationItemProps } from "./NotificationItem";

// Feedback / overlay components (task 4.10)
export { BottomSheet } from "./BottomSheet";
export type { BottomSheetProps } from "./BottomSheet";
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";
export { SuccessState } from "./SuccessState";
export type { SuccessStateProps } from "./SuccessState";
export { ErrorState } from "./ErrorState";
export type { ErrorStateProps } from "./ErrorState";
export { LoadingState } from "./LoadingState";
export type { LoadingStateProps } from "./LoadingState";
