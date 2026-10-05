import { FiUserPlus } from "react-icons/fi";
import styles from "../../../styles/features/roles/components/ManageRolesPanel.module.scss";
import { Button } from "../../../shared/components/Button";
import { FormField } from "../../../shared/components/form/FormField";
import { fieldA11y } from "../../../shared/components/form/fieldA11y";
import type { useManageRoles } from "../hooks/useManageRoles";

type Manage = ReturnType<typeof useManageRoles>;

// Reference: "Nuevo rol" inline form. The identifier follows the name until it's edited by hand.
export const RoleCreateForm = ({ m, saving }: { m: Manage; saving: boolean }) => {
    const keyField = fieldA11y("role-key", m.errors.key, true);
    return (
    <form className={styles.createForm} onSubmit={m.submitCreate} noValidate aria-labelledby="new-role-title">
        <div>
            <h3 id="new-role-title" className={styles.sectionTitle}>
                <FiUserPlus aria-hidden className={styles.sectionIcon} /> Nuevo rol
            </h3>
            <p className={styles.sectionDescription}>
                El identificador se genera automáticamente desde el nombre, pero puedes editarlo. Luego asigna permisos en la pestaña «Roles y permisos».
            </p>
        </div>
        <div className={styles.createGrid}>
            <FormField id="role-name" label="Nombre visible" required error={m.errors.name}>
                <input
                    {...fieldA11y("role-name", m.errors.name, true)}
                    type="text"
                    placeholder="Ej. Supervisor de campo"
                    value={m.values.name}
                    onChange={(event) => m.setName(event.target.value)}
                />
            </FormField>
            <FormField id="role-key" label="Identificador" required error={m.errors.key} hint={m.errors.key ? undefined : "Minúsculas, números y _"}>
                <input
                    {...keyField}
                    aria-describedby={m.errors.key ? "role-key-error" : "role-key-hint"}
                    className={`${keyField.className} ${styles.mono}`}
                    type="text"
                    placeholder="ej. supervisor_campo"
                    value={m.values.key}
                    onChange={(event) => m.setKey(event.target.value)}
                />
            </FormField>
            <FormField id="role-description" label="Descripción" error={m.errors.description}>
                <input
                    {...fieldA11y("role-description", m.errors.description)}
                    type="text"
                    placeholder="Opcional"
                    value={m.values.description}
                    onChange={(event) => m.setDescription(event.target.value)}
                />
            </FormField>
            <div className={styles.createAction}>
                <Button type="submit" loading={saving}>Crear rol</Button>
            </div>
        </div>
    </form>
    );
};
