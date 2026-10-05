import { FormEvent, useState } from "react";
import { usePermission } from "../../../shared/hooks/usePermission";
import { showToast } from "../../../shared/states/toast.slice";
import { useAppDispatch } from "../../../store/hooks";
import { Role } from "../interfaces/role.interface";
import { UpdateRoleRequest } from "../interfaces/role.request";
import { createRoleThunk, deleteRoleThunk, updateRoleThunk } from "../states/role.slice";
import { isValidRoleKey, slugifyRoleKey } from "../utils/role-key";

export interface RoleCreateValues {
    key: string;
    name: string;
    description: string;
}

export type RoleCreateErrors = Partial<Record<keyof RoleCreateValues, string>>;

const EMPTY: RoleCreateValues = { key: "", name: "", description: "" };

// UX-only mirror of auth-service's role rules (role.controller.ts / role.service.ts).
export const validateRoleCreate = ({ key, name, description }: RoleCreateValues): RoleCreateErrors => {
    const errors: RoleCreateErrors = {};
    if (!name.trim()) errors.name = "El nombre es obligatorio";
    else if (name.trim().length > 80) errors.name = "Máximo 80 caracteres";
    if (!key) errors.key = "El identificador es obligatorio";
    else if (!isValidRoleKey(key)) errors.key = "2–50 caracteres: minúsculas, números y _, empezando por una letra";
    if (description.length > 255) errors.description = "Máximo 255 caracteres";
    return errors;
};

// "Administrar roles" tab: the inline create form (key auto-generated from the name until edited),
// the edit modal and the delete confirmation.
export const useManageRoles = () => {
    const dispatch = useAppDispatch();
    const { can } = usePermission();
    const [values, setValues] = useState<RoleCreateValues>(EMPTY);
    const [keyEdited, setKeyEdited] = useState(false);
    const [errors, setErrors] = useState<RoleCreateErrors>({});
    const [editTarget, setEditTarget] = useState<Role | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);

    const toast = (type: "success" | "error", message: string) => dispatch(showToast(type, message));

    const setName = (name: string) => {
        setValues((current) => ({ ...current, name, key: keyEdited ? current.key : slugifyRoleKey(name) }));
        setErrors((current) => ({ ...current, name: undefined, ...(keyEdited ? {} : { key: undefined }) }));
    };

    const setKey = (key: string) => {
        // Typing an identifier stops the auto-slug; clearing it turns the auto-slug back on.
        setKeyEdited(key !== "");
        setValues((current) => ({ ...current, key: key === "" ? slugifyRoleKey(current.name) : key.toLowerCase() }));
        setErrors((current) => ({ ...current, key: undefined }));
    };

    const setDescription = (description: string) => {
        setValues((current) => ({ ...current, description }));
        setErrors((current) => ({ ...current, description: undefined }));
    };

    const submitCreate = async (event?: FormEvent) => {
        event?.preventDefault();
        const next = validateRoleCreate(values);
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        const description = values.description.trim();
        const action = await dispatch(
            createRoleThunk({ name: values.name.trim(), key: values.key, ...(description ? { description } : {}) }),
        );
        if (createRoleThunk.rejected.match(action)) {
            toast("error", action.payload ?? "No se pudo crear el rol");
            return;
        }
        toast("success", `Rol ${action.payload.name} creado. Asígnale permisos en «Roles y permisos».`);
        setValues(EMPTY);
        setKeyEdited(false);
    };

    // Returns the server's message on failure so the modal can show it; null on success.
    const saveEdit = async (changes: UpdateRoleRequest): Promise<string | null> => {
        if (!editTarget) return null;
        const action = await dispatch(updateRoleThunk({ id: editTarget.id, changes }));
        if (updateRoleThunk.rejected.match(action)) {
            const message = action.payload ?? "No se pudo actualizar el rol";
            toast("error", message);
            return message;
        }
        toast("success", `Rol ${action.payload.name} actualizado`);
        setEditTarget(null);
        return null;
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const action = await dispatch(deleteRoleThunk(deleteTarget.id));
        if (deleteRoleThunk.rejected.match(action)) {
            toast("error", action.payload ?? "No se pudo eliminar el rol");
            return;
        }
        toast("success", `Rol ${deleteTarget.name} eliminado`);
        setDeleteTarget(null);
    };

    return {
        canCreate: can("roles", "create"),
        canEdit: can("roles", "edit"),
        canDelete: can("roles", "delete"),
        values,
        errors,
        setName,
        setKey,
        setDescription,
        submitCreate,
        editTarget,
        openEdit: (role: Role) => setEditTarget(role),
        closeEdit: () => setEditTarget(null),
        saveEdit,
        deleteTarget,
        askDelete: (role: Role) => setDeleteTarget(role),
        cancelDelete: () => setDeleteTarget(null),
        confirmDelete,
    };
};
