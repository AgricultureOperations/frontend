import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { Role } from "../interfaces/role.interface";

interface Props {
    role: Role;
    loading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteRoleDialog = ({ role, loading, onConfirm, onCancel }: Props) => (
    <ConfirmDialog
        title="¿Está seguro de eliminar este rol?"
        confirmLabel="Eliminar"
        loading={loading}
        onConfirm={onConfirm}
        onCancel={onCancel}
        message={
            <>
                <p>Se eliminará el rol <strong>{role.name}</strong> ({role.key}) y sus permisos.</p>
                <p>Si solo quiere dejar de asignarlo, edítelo y desactívelo.</p>
            </>
        }
    />
);
