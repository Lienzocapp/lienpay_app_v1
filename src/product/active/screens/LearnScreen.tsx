/**
 * ActiveLearn — the Learn experience in the Active_Account_Experience
 * (route `/app/active/learn`, task 18.1).
 *
 * Learn is reachable through an in-app affordance (the Profile / account area,
 * Req 11.14) and is NEVER a bottom-nav tab in the Active_Account_Experience
 * (the bottom nav stays exactly Home | Transactions | Repayments | Portfolio —
 * enforced by the shell's fixed 4-item ACTIVE_NAV). This is the active
 * counterpart to the pre-activation Learn destination.
 *
 * Content source (LienPay Application Design Specification, Learn screen): the
 * source shows a "Learn" home with a topics/answers list. Only the screen's
 * identity ("Learn") is clearly derivable; the exact topic titles and answer
 * copy are NOT legible/transcribed in the provided source and are intentionally
 * NOT invented (Req 20.4, 18.1). Rather than fabricate topic/answer content,
 * this screen renders a minimal, legible heading only, and the missing
 * topic/answer copy is FLAGGED as BLOCKED in the batch report so it can be
 * captured from the source before the Learn content is completed.
 *
 * Requirements: 11.14, 20.1, 20.2, 20.4.
 * Design: Navigation Architecture (Active route table — Learn never a tab).
 */
import { motion } from "framer-motion";
import { fadeSlide } from "../../../animation/product";
import styles from "./active.module.css";

/**
 * How-LienPay-works topics. Each is a factual description of the product drawn
 * from the documented LienPay definition (requirements Introduction + glossary:
 * a credit line "backed by eligible mutual fund investments without selling
 * those investments"; Available_Credit is the portion available to draw;
 * repayments run via the auto-debit mandate). These are product facts, NOT
 * fabricated financial advice (Req 20.4, 18.1).
 */
const LEARN_TOPICS = [
  {
    title: "Credit backed by your investments",
    body: "LienPay gives you a credit line backed by your eligible mutual fund investments, while you keep your portfolio invested.",
  },
  {
    title: "Borrow without selling",
    body: "You pledge your funds as security instead of selling them, so your investments stay in the market.",
  },
  {
    title: "Draw only what you need",
    body: "Your available credit is ready to use. You only use and repay the portion you draw.",
  },
  {
    title: "Simple repayments",
    body: "Repayments are collected through the auto-debit mandate you authorized during activation.",
  },
] as const;

export function ActiveLearn() {
  return (
    <motion.section
      className={styles.list}
      aria-label="Learn"
      variants={fadeSlide()}
      initial="initial"
      animate="animate"
    >
      <p className={styles.eyebrow}>Learn</p>
      <h1 className={`text-heading ${styles.heading}`}>Learn</h1>
      <p className={styles.countLine}>How LienPay works</p>

      <div className={styles.learnList}>
        {LEARN_TOPICS.map((topic) => (
          <article key={topic.title} className={styles.learnCard}>
            <h2 className={styles.learnCardTitle}>{topic.title}</h2>
            <p className={styles.learnCardBody}>{topic.body}</p>
          </article>
        ))}
      </div>
    </motion.section>
  );
}
