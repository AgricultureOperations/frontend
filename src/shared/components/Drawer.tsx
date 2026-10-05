import { useEffect, useId, type FormEvent, type ReactNode } from "react";
import { FiX } from "react-icons/fi";
import styles from "../../styles/shared/components/Drawer.module.scss";

interface Props {
    title: string;
    subtitle?: string;
    onClose: () => void;
    footer?: ReactNode;
    children: ReactNode;
    // Blocks Escape, backdrop and X while a request is in flight.
    busy?: boolean;
    // When set, the panel is a <form> so Enter submits and the footer's submit button works.
    onSubmit?: (event: FormEvent) => void;
}

/**
 * Right-side panel (reference: Admisiones "Nuevo asesor" / "Editar asesor"): same backdrop as Modal,
 * header with title, subtitle and X, a scrollable body and a footer. Rendered in place, not in a portal,
 * so it stays inside AppLayout's [data-theme].
 */
export const Drawer = ({ title, subtitle, onClose, footer, children, busy = false, onSubmit }: Props) => {
    const titleId = useId();
    const subtitleId = useId();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !busy) onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose, busy]);

    const content = (
        <>
            <header className={styles.header}>
                <div className={styles.headings}>
                    <h2 id={titleId} className={styles.title}>{title}</h2>
                    {subtitle && <p id={subtitleId} className={styles.subtitle}>{subtitle}</p>}
                </div>
                <button type="button" className={styles.close} onClick={onClose} disabled={busy} aria-label="Cerrar">
                    <FiX aria-hidden />
                </button>
            </header>
            <div className={styles.body}>{children}</div>
            {footer && <footer className={styles.footer}>{footer}</footer>}
        </>
    );

    const panelProps = {
        className: styles.panel,
        role: "dialog",
        "aria-modal": true,
        "aria-labelledby": titleId,
        "aria-describedby": subtitle ? subtitleId : undefined,
    } as const;

    return (
        <div
            className={styles.backdrop}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !busy) onClose();
            }}
        >
            {onSubmit ? (
                <form {...panelProps} onSubmit={onSubmit} noValidate>{content}</form>
            ) : (
                <div {...panelProps}>{content}</div>
            )}
        </div>
    );
};
