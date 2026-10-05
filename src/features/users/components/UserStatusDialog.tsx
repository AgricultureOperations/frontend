import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { User } from "../interfaces/user.interface";

interface Props {
    user: User;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

// The reference toggles status without asking; we confirm first, since deactivating also ends the user's session.
export const UserStatusDialog = ({ user, loading, onConfirm, onCancel }: Props) =>
    user.isActive ? (
        <ConfirmDialog
            title="¿Inhabilitar este usuario?"
            confirmLabel="Inhabilitar"
            loading={loading}
            onConfirm={onConfirm}
            onCancel={onCancel}
            message={
                <>
                    <p><strong>{user.name}</strong> ({user.email}) no podrá iniciar sesión y su sesión actual se cerrará.</p>
                    <p>Puede volver a habilitarlo en cualquier momento.</p>
                </>
            }
        />
    ) : (
        <ConfirmDialog
            title="¿Habilitar este usuario?"
            confirmLabel="Habilitar"
            confirmVariant="primary"
            loading={loading}
            onConfirm={onConfirm}
            onCancel={onCancel}
            message={<p><strong>{user.name}</strong> ({user.email}) podrá volver a iniciar sesión con su rol {user.role.name}.</p>}
        />
    );
