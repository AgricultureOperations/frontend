import { FiSettings } from "react-icons/fi";
import { EmptyState } from "../../../shared/components/EmptyState";
import styles from "../../../styles/features/maintainers/pages/MaintainersPage.module.scss";

const MaintainersPage = () => {
  return (
    <div className={styles.page}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Maintainers</h1>
        <p className={styles.subtitle}>Datos maestros y configuración del sistema</p>
      </div>
      <EmptyState
        icon={<FiSettings aria-hidden />}
        title="No maintainers yet"
        subtitle="Master data screens will appear here."
      />
    </div>
  )
};
export default MaintainersPage;
