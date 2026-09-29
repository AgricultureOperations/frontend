import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "../../../styles/features/products/components/ProductsTable.module.scss";
import { PaginationMeta } from "../interfaces/product-list.interface";

interface Props {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

export const ProductsPagination = ({ meta, onPageChange }: Props) => {
    const { page, limit, total, totalPages } = meta;
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);

    return (
        <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
                Mostrando {from}–{to} de {total} productos
            </span>
            <div className={styles.paginationButtons}>
                <button type="button" className={styles.iconButton} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
                    <FiChevronLeft aria-hidden />
                </button>
                <span className={styles.paginationInfo}>
                    {page} / {Math.max(totalPages, 1)}
                </span>
                <button type="button" className={styles.iconButton} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
                    <FiChevronRight aria-hidden />
                </button>
            </div>
        </div>
    );
};
