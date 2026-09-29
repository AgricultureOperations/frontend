import { useEffect, useId, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import styles from "../../styles/shared/components/Modal.module.scss";

interface Props {
    title: string;
    subtitle?: string;
    // Small uppercase label above the title (the reference's "ALTA MANUAL").
    eyebrow?: string;
    onClose: () => void;
    footer?: ReactNode;
    children: ReactNode;
    size?: "md" | "sm";
    role?: "dialog" | "alertdialog";
    // Blocks Escape, backdrop and X while a request is in flight.
    busy?: boolean;
}

/**
 * Admisiones-style dialog: dimmed + blurred backdrop, header (eyebrow, title, subtitle, X),
 * scrollable body and a footer for actions. Rendered in place, not in a portal, so it stays
 * inside AppLayout's [data-theme] and picks up the dark tokens.
 */
export const Modal = ({ title, subtitle, eyebrow, onClose, footer, children, size = "md", role = "dialog", busy = false }: Props) => {
    const titleId = useId();
    const subtitleId = useId();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose, busy]);

    return (
        <div
            className={styles.backdrop}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onClose();
            }}
        >
            <div
                className={`${styles.dialog} ${styles[size]}`}
                role={role}
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={subtitle ? subtitleId : undefined}
            >
                <header className={styles.header}>
                    <div className={styles.headings}>
                        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
                        <h2 id={titleId} className={styles.title}>{title}</h2>
                        {subtitle && <p id={subtitleId} className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    <button type="button" className={styles.close} onClick={onClose} disabled={busy} aria-label="Cerrar">
                        <FiX aria-hidden />
                    </button>
                </header>
                <div className={styles.body}>{children}</div>
                {footer && <footer className={styles.footer}>{footer}</footer>}
            </div>
        </div>
    );
};
