import styles from "../../../styles/features/dashboard/pages/DashboardPage.module.scss";
import { StatCard } from "../components/StatCard";
import { useOrdersTable } from "../../orders/hooks/useOrdersTable";
import { useAppSelector } from "../../../store/hooks";
import { getDisplayNameFromEmail } from "../../../shared/utils/formatUserDisplay";

const DashboardPage = () => {
  const email = useAppSelector((state) => state.auth.email);
  const displayName = getDisplayNameFromEmail(email);
  const { orders } = useOrdersTable();

  const pendingCount = orders.filter((order) => order.status.name === "Pending").length;
  const deliveredCount = orders.filter((order) => order.status.name === "Delivered").length;
  const cancelledCount = orders.filter((order) => order.status.name === "Cancelled").length;

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1 className={styles.title}>Hola, {displayName ? displayName.toUpperCase() : "..."}</h1>
        <p className={styles.subtitle}>Panel de control AgriOPS</p>
      </div>
      <div className={styles.stats}>
        <StatCard label="Total orders" value={orders.length} />
        <StatCard label="Pending" value={pendingCount} />
        <StatCard label="Delivered" value={deliveredCount} />
        <StatCard label="Cancelled" value={cancelledCount} />
      </div>
    </div>
  )
};
export default DashboardPage;
