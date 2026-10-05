import { useId } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import styles from "../../styles/shared/components/Pagination.module.scss";
import { getPageRange, getPageWindow } from "../utils/pagination";

interface Props {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

// Reference: Admisiones "Asesores" footer: "1–10 de 43", a page-size select and numbered pages.
export const Pagination = ({ page, pageSize, total, totalPages, pageSizeOptions, onPageChange, onPageSizeChange }: Props) => {
    const sizeId = useId();
    const { from, to } = getPageRange(page, pageSize, total);
    const pages = getPageWindow(page, totalPages);

    return (
        <nav className={styles.pagination} aria-label="Paginación">
            <div className={styles.left}>
                <span className={styles.info}>{from}–{to} de {total}</span>
                <label htmlFor={sizeId} className={styles.srOnly}>Filas por página</label>
                <select
                    id={sizeId}
                    className={styles.sizeSelect}
                    value={pageSize}
                    onChange={(event) => onPageSizeChange(Number(event.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>{size} por página</option>
                    ))}
                </select>
            </div>
            <div className={styles.pages}>
                <button type="button" className={styles.pageButton} onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Página anterior">
                    <FiChevronLeft aria-hidden />
                </button>
                {pages.map((n) => (
                    <button
                        key={n}
                        type="button"
                        className={`${styles.pageButton} ${n === page ? styles.pageActive : ""}`}
                        onClick={() => onPageChange(n)}
                        aria-label={`Página ${n}`}
                        aria-current={n === page ? "page" : undefined}
                    >
                        {n}
                    </button>
                ))}
                <button type="button" className={styles.pageButton} onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Página siguiente">
                    <FiChevronRight aria-hidden />
                </button>
            </div>
        </nav>
    );
};
