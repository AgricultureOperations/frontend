import { FiAlertTriangle, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";

interface Props {
    // /auth/me failed: we can't tell what the user may see, so offer a retry instead of "no access".
    error?: string | null;
    onRetry?: () => void;
}

// Shown in place of a page the signed-in user has no `view` permission for. The session stays.
export const NoAccess = ({ error, onRetry }: Props) => {
    const navigate = useNavigate();

    if (error) {
        return (
            <EmptyState
                icon={<FiAlertTriangle aria-hidden />}
                title="No se pudieron cargar tus permisos"
                subtitle={error}
                action={onRetry && <Button variant="outline" onClick={onRetry}>Reintentar</Button>}
            />
        );
    }

    return (
        <EmptyState
            icon={<FiLock aria-hidden />}
            title="No access"
            subtitle="Tu rol no tiene permiso para ver esta sección. Pide a un administrador que lo habilite."
            action={<Button variant="outline" onClick={() => navigate("/dashboard")}>Ir al inicio</Button>}
        />
    );
};
