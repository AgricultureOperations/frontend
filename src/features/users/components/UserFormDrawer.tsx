import { useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff, FiSave, FiUserPlus } from "react-icons/fi";
import styles from "../../../styles/features/users/components/UserFormDrawer.module.scss";
import { Button } from "../../../shared/components/Button";
import { Drawer } from "../../../shared/components/Drawer";
import { FormField } from "../../../shared/components/form/FormField";
import { fieldA11y } from "../../../shared/components/form/fieldA11y";
import { useUserForm } from "../hooks/useUserForm";
import { UserFormValues } from "../interfaces/user-form.interface";
import { RoleOption, User } from "../interfaces/user.interface";
import { formatRoleLabel } from "../utils/user-filters";
import { MIN_PASSWORD_LENGTH } from "../validations/user.validation";

interface Props {
    user?: User;
    roleOptions: RoleOption[];
    // Role preselected for a new user (the reference defaults to "Solo lectura (viewer)").
    defaultRoleId: string;
    // Editing someone else's role needs users:edit; editing yourself never changes your own role.
    canChangeRole: boolean;
    saving: boolean;
    onSave: (values: UserFormValues) => Promise<string | null>;
    onClose: () => void;
}

// Reference: Admisiones "Nuevo asesor" / "Editar asesor" side panel (no photo: auth-service stores none).
export const UserFormDrawer = ({ user, roleOptions, defaultRoleId, canChangeRole, saving, onSave, onClose }: Props) => {
    const mode = user ? "edit" : "create";
    const form = useUserForm(
        mode,
        { name: user?.name ?? "", email: user?.email ?? "", password: "", roleId: user?.role.id ?? defaultRoleId },
        onSave,
    );
    const [showPassword, setShowPassword] = useState(false);
    const { values, errors } = form;

    // Keep the user's current role listed even if it's inactive or missing from the options.
    const choices = user && !roleOptions.some((r) => r.id === user.role.id) ? [{ ...user.role, isActive: true }, ...roleOptions] : roleOptions;

    return (
        <Drawer
            title={user ? "Editar usuario" : "Nuevo usuario"}
            subtitle={user ? "Actualiza la información del usuario" : "Completa los datos del nuevo usuario"}
            onClose={onClose}
            busy={saving}
            onSubmit={form.handleSubmit}
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
                    <Button
                        type="submit"
                        loading={saving}
                        disabled={!form.isValid}
                        icon={user ? <FiSave aria-hidden /> : <FiUserPlus aria-hidden />}
                    >
                        {user ? "Guardar cambios" : "Crear usuario"}
                    </Button>
                </>
            }
        >
            {form.submitError && (
                <div className={styles.alert} role="alert">
                    <FiAlertCircle aria-hidden />
                    <span>{form.submitError}</span>
                </div>
            )}

            <div className={styles.fields}>
                <FormField id="user-name" label="Nombre" required error={errors.name}>
                    <input
                        {...fieldA11y("user-name", errors.name, true)}
                        type="text"
                        placeholder="Juan Pérez"
                        autoComplete="off"
                        value={values.name}
                        onChange={(event) => form.setField("name", event.target.value)}
                        onBlur={() => form.blurField("name")}
                    />
                </FormField>

                <FormField
                    id="user-email"
                    label="Correo"
                    required
                    error={user ? undefined : errors.email}
                    hint={user ? "El correo no puede ser editado" : undefined}
                >
                    <input
                        {...fieldA11y("user-email", user ? undefined : errors.email, !user)}
                        aria-describedby={user ? "user-email-hint" : errors.email ? "user-email-error" : undefined}
                        type="email"
                        placeholder="usuario@agriops.io"
                        autoComplete="off"
                        value={values.email}
                        readOnly={!!user}
                        onChange={(event) => form.setField("email", event.target.value)}
                        onBlur={() => !user && form.blurField("email")}
                    />
                </FormField>

                {!user && (
                    <FormField id="user-password" label="Contraseña" required error={errors.password}>
                        <div className={styles.passwordWrap}>
                            <input
                                {...fieldA11y("user-password", errors.password, true)}
                                type={showPassword ? "text" : "password"}
                                placeholder={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`}
                                autoComplete="new-password"
                                value={values.password}
                                onChange={(event) => form.setField("password", event.target.value)}
                                onBlur={() => form.blurField("password")}
                            />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            >
                                {showPassword ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
                            </button>
                        </div>
                    </FormField>
                )}

                <FormField
                    id="user-role"
                    label="Rol"
                    required
                    error={errors.roleId}
                    hint={canChangeRole ? undefined : "No puedes cambiar tu propio rol"}
                >
                    <select
                        {...fieldA11y("user-role", errors.roleId, true)}
                        value={values.roleId}
                        disabled={!canChangeRole}
                        onChange={(event) => form.setField("roleId", event.target.value)}
                        onBlur={() => form.blurField("roleId")}
                    >
                        {!values.roleId && <option value="">Seleccione un rol</option>}
                        {choices.map((role) => (
                            <option key={role.id} value={role.id} disabled={!role.isActive && role.id !== user?.role.id}>
                                {formatRoleLabel(role)}
                            </option>
                        ))}
                    </select>
                </FormField>
            </div>
        </Drawer>
    );
};
