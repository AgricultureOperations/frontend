import type { ReactNode } from "react";
import { FiChevronRight, FiSettings } from "react-icons/fi";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../shared/components/EmptyState";
import styles from "../../../styles/features/maintainers/pages/MaintainersPage.module.scss";

interface MaintainerSection {
    to: string;
    title: string;
    description: string;
    service: string;
    icon: ReactNode;
}

// One card per maintained entity that has no top-level sidebar item. Each entity belongs to exactly one
// backend (see architecture.md). Products moved to its own sidebar item (/products), so this is empty for now.
const sections: MaintainerSection[] = [];

const MaintainersPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Maintainers</h1>
        <p className={styles.subtitle}>Datos maestros y configuración del sistema</p>
      </div>
      {sections.length === 0 ? (
        <EmptyState
          icon={<FiSettings aria-hidden />}
          title="No maintainers yet"
          subtitle="Master data screens will appear here."
        />
      ) : (
        <ul className={styles.grid} aria-label="Maintainer sections">
          {sections.map((section) => (
            <li key={section.to}>
              <Link to={section.to} className={styles.card}>
                <span className={styles.cardIcon}>{section.icon}</span>
                <span className={styles.cardText}>
                  <span className={styles.cardTitle}>{section.title}</span>
                  <span className={styles.cardDescription}>{section.description}</span>
                  <span className={styles.cardMeta}>{section.service}</span>
                </span>
                <FiChevronRight aria-hidden className={styles.cardChevron} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
};
export default MaintainersPage;
