import { FormEvent, useState } from "react";
import { FiAlertCircle } from "react-icons/fi";
import styles from "../../../styles/features/roles/components/ManageRolesPanel.module.scss";
import { Button } from "../../../shared/components/Button";
import { Modal } from "../../../shared/components/Modal";
import { FormField } from "../../../shared/components/form/FormField";
import { FormSection } from "../../../shared/components/form/FormSection";
import { Switch } from "../../../shared/components/form/Switch";
import { fieldA11y } from "../../../shared/components/form/fieldA11y";
import { Role } from "../interfaces/role.interface";
import { UpdateRoleRequest } from "../interfaces/role.request";

interface Props {
    role: Role;
    saving: boolean;
    onSave: (changes: UpdateRoleRequest) => Promise<string | null>;
    onClose: () => void;
}

// Name, description and active flag. The key never changes (tokens and code refer to it).
export const RoleEditModal = ({ role, saving, onSave, onClose }: Props) => {
    const [name, setName] = useState(role.name);
    const [description, setDescription] = useState(role.description ?? "");
    const [isActive, setIsActive] = useState(role.isActive);
    const [error, setError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Deactivation is refused by the backend (409) for system roles and roles with users; say so up front.
    const cannotDeactivate = role.isSystem
        ? "Los roles del sistema no se pueden desactivar"
        : role.userCount > 0
          ? "Reasigna sus usuarios antes de desactivarlo"
          : null;

    const handleSubmit = async (event?: FormEvent) => {
        event?.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return setError("El nombre es obligatorio");
        if (trimmed.length > 80) return setError("Máximo 80 caracteres");
        setError(null);

        const changes: UpdateRoleRequest = {};
        if (trimmed !== role.name) changes.name = trimmed;
        if (description.trim() !== (role.description ?? "")) changes.description = description.trim();
        if (isActive !== role.isActive) changes.isActive = isActive;
        if (Object.keys(changes).length === 0) return onClose();
        setSubmitError(await onSave(changes));
    };

    return (
        <Modal
            eyebrow={`Edición · ${role.key}`}
            title="Editar rol"
            subtitle="El identificador no se puede cambiar."
            onClose={onClose}
            busy={saving}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button onClick={() => handleSubmit()} loading={saving}>Guardar cambios</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate className={styles.editForm}>
                {submitError && (
                    <div className={styles.alert} role="alert">
                        <FiAlertCircle aria-hidden /> <span>{submitError}</span>
                    </div>
                )}
                <FormSection title="Datos del rol" badge={role.isSystem ? "Sistema" : undefined}>
                    <FormField id="edit-role-name" label="Nombre visible" required error={error ?? undefined}>
                        <input {...fieldA11y("edit-role-name", error ?? undefined, true)} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </FormField>
                    <FormField id="edit-role-key" label="Identificador">
                        <input {...fieldA11y("edit-role-key")} type="text" value={role.key} readOnly />
                    </FormField>
                    <FormField id="edit-role-description" label="Descripción" fullWidth>
                        <input
                            {...fieldA11y("edit-role-description")}
                            type="text"
                            maxLength={255}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </FormField>
                    <div className={styles.fullWidth}>
                        {cannotDeactivate && role.isActive ? (
                            <p className={styles.hintText}>{cannotDeactivate}.</p>
                        ) : (
                            <Switch
                                id="edit-role-active"
                                label="Rol activo"
                                description="Un rol inactivo no se puede asignar a nuevos usuarios."
                                checked={isActive}
                                onChange={setIsActive}
                            />
                        )}
                    </div>
                </FormSection>
            </form>
        </Modal>
    );
};
