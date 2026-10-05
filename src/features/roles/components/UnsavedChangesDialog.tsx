import { ConfirmDialog } from "../../../shared/components/ConfirmDialog";

interface Props {
    roleName: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Switching roles in the matrix with unsaved checks.
export const UnsavedChangesDialog = ({ roleName, onConfirm, onCancel }: Props) => (
    <ConfirmDialog
        title="¿Descartar los cambios sin guardar?"
        confirmLabel="Descartar"
        onConfirm={onConfirm}
        onCancel={onCancel}
        message={<p>Los permisos marcados para <strong>{roleName}</strong> no se han guardado y se perderán.</p>}
    />
);
