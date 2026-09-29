import styles from "../../../styles/features/products/components/ProductStatusBadge.module.scss";
import { ProductStatus } from "../interfaces/product.interface";
import { PRODUCT_STATUS_LABEL } from "../utils/product-options";

// Only the ends of the lifecycle take status colors: active → good, discontinued → critical.
const CLASS_BY_STATUS: Record<ProductStatus, string> = {
    active: styles.good,
    inactive: styles.neutral,
    discontinued: styles.critical,
};

export const ProductStatusBadge = ({ status }: { status: ProductStatus }) => (
    <span className={`${styles.badge} ${CLASS_BY_STATUS[status]}`}>
        <span className={styles.dot} aria-hidden />
        {PRODUCT_STATUS_LABEL[status]}
    </span>
);
