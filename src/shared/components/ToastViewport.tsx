import { useEffect } from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";
import styles from "../../styles/shared/components/Toast.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { dismissToast, Toast } from "../states/toast.slice";

const AUTO_DISMISS_MS = 4000;

const ToastItem = ({ toast }: { toast: Toast }) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), AUTO_DISMISS_MS);
        return () => window.clearTimeout(timer);
    }, [dispatch, toast.id]);

    const isError = toast.type === "error";
    return (
        <div className={`${styles.toast} ${isError ? styles.error : styles.success}`} role={isError ? "alert" : "status"}>
            <span className={styles.icon}>{isError ? <FiAlertCircle aria-hidden /> : <FiCheckCircle aria-hidden />}</span>
            <span className={styles.message}>{toast.message}</span>
            <button type="button" className={styles.close} onClick={() => dispatch(dismissToast(toast.id))} aria-label="Cerrar notificación">
                <FiX aria-hidden />
            </button>
        </div>
    );
};

// Rendered once by AppLayout. Dispatch showToast(type, message) from a hook to add one.
export const ToastViewport = () => {
    const toasts = useAppSelector((state) => state.toasts.toasts);
    return (
        <div className={styles.viewport}>
            {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} />)}
        </div>
    );
};
