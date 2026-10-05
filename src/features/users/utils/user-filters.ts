import { UserListQuery } from "../interfaces/user-list.interface";
import { RoleOption, User } from "../interfaces/user.interface";
import { USERS_DEFAULT_PAGE_SIZE, USERS_PAGE_SIZES } from "../states/user.slice";

export type StatusFilter = "all" | "active" | "inactive";

export interface UserFilters {
    search: string;
    status: StatusFilter;
    roleId: string;
    page: number;
    pageSize: number;
}

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
];

const positiveInt = (raw: string | null, fallback: number) => {
    const n = Number(raw);
    return Number.isInteger(n) && n > 0 ? n : fallback;
};

// URL (?q, status, role, page, size) → filters. Anything invalid falls back to the default instead of erroring.
export const parseUserFilters = (params: URLSearchParams): UserFilters => {
    const status = params.get("status");
    const size = positiveInt(params.get("size"), USERS_DEFAULT_PAGE_SIZE);
    return {
        search: (params.get("q") ?? "").trim(),
        status: status === "active" || status === "inactive" ? status : "all",
        roleId: params.get("role") ?? "",
        page: positiveInt(params.get("page"), 1),
        pageSize: USERS_PAGE_SIZES.includes(size) ? size : USERS_DEFAULT_PAGE_SIZE,
    };
};

// Filters → GET /api/v1/user params. Empty filters are left out rather than sent as "".
export const toUserListQuery = ({ search, status, roleId, page, pageSize }: UserFilters): UserListQuery => ({
    page,
    pageSize,
    ...(search ? { search } : {}),
    ...(roleId ? { roleId } : {}),
    ...(status !== "all" ? { isActive: status === "active" } : {}),
});

// Unique roles seen on the loaded users, sorted by name: the role select's options when GET /roles isn't allowed.
export const deriveRoleOptions = (users: User[]): RoleOption[] => {
    const byId = new Map<string, RoleOption>();
    users.forEach(({ role }) => byId.set(role.id, { ...role, isActive: true }));
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
};

// "Operator (operator)", as the reference shows roles.
export const formatRoleLabel = (role: { name: string; key: string }) => `${role.name} (${role.key})`;
