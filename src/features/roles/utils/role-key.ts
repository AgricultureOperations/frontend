// Mirrors auth-service role.service.ts: ROLE_KEY and slugify. The backend validates the key again.
export const ROLE_KEY_PATTERN = /^[a-z][a-z0-9_]{1,49}$/;
export const ADMIN_ROLE_KEY = "admin";

// "Coordinador de Admisión" → "coordinador_de_admision" (the reference's auto-generated "Identificador").
export const slugifyRoleKey = (name: string): string =>
    name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 50);

export const isValidRoleKey = (key: string) => ROLE_KEY_PATTERN.test(key);

// Why a role can't be deleted, mirrored from auth-service's 409 rules (the button is disabled with this as its title).
export const deleteBlockedReason = (role: { isSystem: boolean; userCount: number }): string | null => {
    if (role.isSystem) return "Los roles del sistema no se pueden eliminar";
    if (role.userCount > 0) return "Reasigna los usuarios de este rol antes de eliminarlo";
    return null;
};

// "Operator (operator)", as the reference's role select shows it.
export const formatRoleOption = (role: { name: string; key: string }) => `${role.name} (${role.key})`;
