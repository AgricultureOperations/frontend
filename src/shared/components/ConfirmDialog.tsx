import type { ReactNode } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import styles from "../../styles/shared/components/Modal.module.scss";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface Props {
    title: string;
    message: ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

export const ConfirmDialog = ({ title, message, confirmLabel, onConfirm, onCancel, loading = false }: Props) => (
    <Modal
        title={title}
        onClose={onCancel}
        size="sm"
        role="alertdialog"
        busy={loading}
        footer={
            <>
                <Button variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
                <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
            </>
        }
    >
        <div className={styles.confirm}>
            <span className={styles.confirmIcon}><FiAlertTriangle aria-hidden /></span>
            <div className={styles.confirmMessage}>{message}</div>
        </div>
    </Modal>
);
