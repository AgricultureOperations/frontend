import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { User } from "../interfaces/user.interface";

interface Props {
    user: User;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteUserDialog = ({ user, loading, onConfirm, onCancel }: Props) => (
    <ConfirmDialog
        title="¿Está seguro de eliminar este usuario?"
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message={
            <>
                <p>Se eliminará <strong>{user.name}</strong> ({user.email}) de forma permanente.</p>
                <p>Si solo desea impedir su acceso y conservar la cuenta, inhabilítelo en su lugar.</p>
            </>
        }
    />
);
