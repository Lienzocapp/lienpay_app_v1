/**
 * LearnDetailScreen — a single Learn question opened as a readable answer page.
 *
 * Built to the design reference
 * (docs/Design/References/Original/Pre-activation/Learn+Learn Detail.jpeg):
 *  - back navigation to Learn;
 *  - the question as the page title;
 *  - a green-accented hero answer card (short affirmative headline + the full
 *    answer);
 *  - "What this means for you" — check-marked consequence points;
 *  - an "Important to know" caveat card.
 *
 * Content is resolved from `learnContent.ts` (sourced from the supplied FAQ
 * document). Questions that carry no enriched detail still render their
 * documented answer — nothing is fabricated to fill the layout (Req 20.4). An
 * unknown id returns to Learn rather than rendering an empty screen.
 */
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../../animation/product";
import { VISUALS } from "../../../design-system/assets/visuals";
import { ROUTES } from "../../../navigation/navConfig";
import { LEARN_TOPICS, findFaqById, topicItemId } from "../learnContent";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  ShieldCheckIcon,
} from "../preIcons";
import styles from "../preActivation.module.css";

export function LearnDetailScreen() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const found = questionId ? findFaqById(questionId) : undefined;
  const topicMatch = questionId
    ? LEARN_TOPICS.find((t) => t.id === questionId)
    : undefined;

  // A topic id lists that topic's documented questions, so every documented
  // Q&A stays reachable (not just the first one).
  if (!found && topicMatch) {
    return (
      <motion.section
        className={styles.screen}
        aria-label={topicMatch.title}
        variants={staggerContainer()}
        initial="initial"
        animate="animate"
      >
        <motion.div className={styles.ldTop} variants={staggerItem()}>
          <button
            type="button"
            className={styles.ldBack}
            aria-label="Back to Learn"
            onClick={() => navigate(ROUTES.pre.learn)}
          >
            <ChevronLeftIcon />
          </button>
        </motion.div>

        <motion.h1 className={styles.ldTitle} variants={staggerItem()}>
          {topicMatch.title}
        </motion.h1>
        <motion.p className={styles.ldTopicSummary} variants={staggerItem()}>
          {topicMatch.summary}
        </motion.p>

        <motion.ul className={styles.lnRows} variants={staggerItem()}>
          {topicMatch.items.map((item, i) => (
            <li key={item.q}>
              <button
                type="button"
                className={styles.lnRow}
                onClick={() =>
                  navigate(`/app/pre/learn/${topicItemId(topicMatch.id, i)}`)
                }
              >
                <span className={styles.lnRowIcon} aria-hidden="true">
                  <ShieldCheckIcon />
                </span>
                <span className={styles.lnRowText}>{item.q}</span>
                <span className={styles.lnRowChevron} aria-hidden="true">
                  <ChevronRightIcon />
                </span>
              </button>
            </li>
          ))}
        </motion.ul>
      </motion.section>
    );
  }

  // Unknown id: return to Learn (no dead end, no empty screen).
  if (!found) {
    return <Navigate to={ROUTES.pre.learn} replace />;
  }

  const { item, topic } = found;

  return (
    <motion.section
      className={styles.screen}
      aria-label={item.q}
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      <motion.div className={styles.ldTop} variants={staggerItem()}>
        <button
          type="button"
          className={styles.ldBack}
          aria-label="Back to Learn"
          onClick={() => navigate(ROUTES.pre.learn)}
        >
          <ChevronLeftIcon />
        </button>
        {topic ? <span className={styles.ldTopic}>{topic.title}</span> : null}
      </motion.div>

      <motion.h1 className={styles.ldTitle} variants={staggerItem()}>
        {item.q}
      </motion.h1>

      {/* Hero answer card */}
      <motion.section className={styles.ldHero} variants={staggerItem()}>
        <div className={styles.ldHeroGlow} aria-hidden="true" />
        {/* Reference answer-hero artwork (shield over coins). Decorative. */}
        <img
          className={styles.ldHeroArt}
          src={VISUALS.security}
          alt=""
          aria-hidden="true"
          decoding="async"
        />
        <span className={styles.ldHeroBadge} aria-hidden="true">
          <ShieldCheckIcon />
        </span>
        {item.headline ? (
          <p className={styles.ldHeadline}>{item.headline}</p>
        ) : null}
        <p className={styles.ldAnswer}>{item.a}</p>
      </motion.section>

      {/* What this means for you */}
      {item.bullets && item.bullets.length > 0 ? (
        <motion.section className={styles.learnSection} variants={staggerItem()}>
          <h2 className={styles.learnSectionTitle}>What this means for you</h2>
          <ul className={styles.ldPoints}>
            {item.bullets.map((point) => (
              <li key={point} className={styles.ldPoint}>
                <span className={styles.ldPointIcon} aria-hidden="true">
                  <CheckCircleIcon />
                </span>
                <span className={styles.ldPointText}>{point}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      ) : null}

      {/* Important to know */}
      {item.important ? (
        <motion.aside className={styles.ldImportant} variants={staggerItem()}>
          <span className={styles.ldImportantIcon} aria-hidden="true">
            <InfoIcon />
          </span>
          <div>
            <p className={styles.ldImportantTitle}>Important to know</p>
            <p className={styles.ldImportantText}>{item.important}</p>
          </div>
        </motion.aside>
      ) : null}
    </motion.section>
  );
}
