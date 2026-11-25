/**
 * LearnScreen — the pre-activation Learn tab.
 *
 * Rebuilt against the design reference
 * (docs/Design/References/Original/Pre-activation/Learn+Learn Detail.jpeg):
 *  - header: graduation-cap badge + "Learn" + "Understand LienPay clearly";
 *  - a working search field that filters every documented question;
 *  - "Popular questions" rows (each opening the Learn detail screen) with a
 *    "View all" affordance;
 *  - "Explore topics": a two-column grid of the six documented categories with
 *    their summaries;
 *  - a "Still need help?" card.
 *
 * All content comes from `learnContent.ts`, which is sourced from the supplied
 * `docs/LienPay_Learn_Section_FAQ.docx` — no FAQ copy is invented (Req 20.4).
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../../animation/product";
import {
  LEARN_TOPICS,
  POPULAR_QUESTIONS,
  topicItemId,
  type FaqItem,
} from "../learnContent";
import {
  CapIcon,
  CardIcon,
  ChevronRightIcon,
  HeadsetIcon,
  NodesIcon,
  PercentIcon,
  PieIcon,
  PersonIcon,
  SearchIcon,
  ShieldCheckIcon,
  SlidersIcon,
  TrendIcon,
} from "../preIcons";
import styles from "../preActivation.module.css";

/** Leading icon per popular question (order matches the reference). */
const POPULAR_ICONS = [
  <ShieldCheckIcon key="a" />,
  <SlidersIcon key="b" />,
  <TrendIcon key="c" />,
  <CardIcon key="d" />,
];

/** Leading icon per documented topic id. */
const TOPIC_ICONS: Record<string, React.ReactNode> = {
  "how-it-works": <NodesIcon />,
  pledging: <ShieldCheckIcon />,
  "limit-risk": <PieIcon />,
  payments: <CardIcon />,
  "interest-repayment": <PercentIcon />,
  "investments-eligibility": <PersonIcon />,
};

/** A search hit: the question plus the detail id to open. */
interface Hit {
  id: string;
  item: FaqItem;
}

/** Every documented question, flattened with its detail id (for search). */
function allQuestions(): Hit[] {
  const hits: Hit[] = POPULAR_QUESTIONS.map((p) => ({ id: p.id ?? p.q, item: p }));
  for (const topic of LEARN_TOPICS) {
    topic.items.forEach((item, i) => {
      hits.push({ id: topicItemId(topic.id, i), item });
    });
  }
  return hits;
}

export function LearnScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (trimmed === "") return [];
    return allQuestions().filter(
      ({ item }) =>
        item.q.toLowerCase().includes(trimmed) ||
        item.a.toLowerCase().includes(trimmed)
    );
  }, [trimmed]);

  const openDetail = (id: string) => navigate(`/app/pre/learn/${id}`);

  const popular = showAll ? POPULAR_QUESTIONS : POPULAR_QUESTIONS.slice(0, 4);

  return (
    <motion.section
      className={styles.screen}
      aria-label="Learn"
      variants={staggerContainer()}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.header className={styles.lnHead} variants={staggerItem()}>
        <span className={styles.lnHeadBadge} aria-hidden="true">
          <CapIcon />
        </span>
        <div>
          <h1 className={styles.lnHeadTitle}>Learn</h1>
          <p className={styles.lnHeadSub}>
            Understand <span className={styles.preBrand}>LienPay</span> clearly
          </p>
        </div>
      </motion.header>

      {/* Search */}
      <motion.div className={styles.learnSearch} variants={staggerItem()}>
        <span className={styles.learnSearchIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          className={styles.learnSearchInput}
          placeholder="Search a question"
          aria-label="Search a question"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </motion.div>

      {trimmed !== "" ? (
        /* Search results replace the browse sections while a query is active. */
        <motion.section className={styles.learnSection} variants={staggerItem()}>
          <h2 className={styles.learnSectionTitle}>
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? "" : "s"}`
              : "No results"}
          </h2>
          {results.length === 0 ? (
            <p className={styles.lnEmpty} role="status">
              No questions match &ldquo;{query.trim()}&rdquo;. Try a different
              word.
            </p>
          ) : (
            <ul className={styles.lnRows}>
              {results.map(({ id, item }) => (
                <li key={id}>
                  <button
                    type="button"
                    className={styles.lnRow}
                    onClick={() => openDetail(id)}
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
            </ul>
          )}
        </motion.section>
      ) : (
        <>
          {/* Popular questions */}
          <motion.section className={styles.learnSection} variants={staggerItem()}>
            <div className={styles.lnSectionHead}>
              <h2 className={styles.learnSectionTitle}>Popular questions</h2>
              <button
                type="button"
                className={styles.lnViewAll}
                onClick={() => setShowAll((v) => !v)}
              >
                {showAll ? "Show less" : "View all"}
              </button>
            </div>
            <ul className={styles.lnRows}>
              {popular.map((item, i) => (
                <li key={item.id ?? item.q}>
                  <button
                    type="button"
                    className={styles.lnRow}
                    onClick={() => openDetail(item.id ?? "")}
                  >
                    <span className={styles.lnRowIcon} aria-hidden="true">
                      {POPULAR_ICONS[i % POPULAR_ICONS.length]}
                    </span>
                    <span className={styles.lnRowText}>{item.q}</span>
                    <span className={styles.lnRowChevron} aria-hidden="true">
                      <ChevronRightIcon />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Explore topics — two-column grid */}
          <motion.section className={styles.learnSection} variants={staggerItem()}>
            <h2 className={styles.learnSectionTitle}>Explore topics</h2>
            <ul className={styles.lnTopicGrid}>
              {LEARN_TOPICS.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    className={styles.lnTopicTile}
                    onClick={() => openDetail(topic.id)}
                  >
                    <span className={styles.lnTopicIcon} aria-hidden="true">
                      {TOPIC_ICONS[topic.id]}
                    </span>
                    <span className={styles.lnTopicTitle}>{topic.title}</span>
                    <span className={styles.lnTopicSummary}>{topic.summary}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Still need help */}
          <motion.div className={styles.lnHelp} variants={staggerItem()}>
            <span className={styles.lnHelpIcon} aria-hidden="true">
              <HeadsetIcon />
            </span>
            <span className={styles.lnHelpBody}>
              <span className={styles.lnHelpTitle}>Still need help?</span>
              <span className={styles.lnHelpText}>Our team is here for you</span>
            </span>
          </motion.div>
        </>
      )}
    </motion.section>
  );
}
