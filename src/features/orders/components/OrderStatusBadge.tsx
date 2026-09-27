import { FiCheckCircle, FiClock, FiTruck, FiXCircle } from "react-icons/fi";
import styles from "../../../styles/features/orders/components/OrderStatusBadge.module.scss";

interface Props {
    statusName: string;
}

// order-service seeds a fixed 5-status list (Pending, Paid, Shipped, Delivered, Cancelled).
// Only the terminal states map to a reserved status color (good/warning/critical);
// the two in-progress states stay neutral so status colors are never reused as series identity.
const STATUS_STYLE: Record<string, { className: string; icon: JSX.Element }> = {
    Pending: { className: styles.warning, icon: <FiClock aria-hidden /> },
    Paid: { className: styles.neutral, icon: <FiClock aria-hidden /> },
    Shipped: { className: styles.neutral, icon: <FiTruck aria-hidden /> },
    Delivered: { className: styles.good, icon: <FiCheckCircle aria-hidden /> },
    Cancelled: { className: styles.critical, icon: <FiXCircle aria-hidden /> },
};

export const OrderStatusBadge = ({ statusName }: Props) => {
    const style = STATUS_STYLE[statusName] ?? { className: styles.neutral, icon: <FiClock aria-hidden /> };
    return (
        <span className={`${styles.badge} ${style.className}`}>
            {style.icon}
            {statusName}
        </span>
    );
};
