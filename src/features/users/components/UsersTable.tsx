import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FiEyeOff, FiEye, FiTrash2 } from "react-icons/fi";
import styles from "../../../styles/features/users/components/UsersTable.module.scss";
import { RoleOption, User } from "../interfaces/user.interface";
import { UserAvatar } from "./UserAvatar";
import { UserRoleSelect } from "./UserRoleSelect";
import { UserStatusBadge } from "./UserStatusBadge";

interface Props {
    data: User[];
    roleOptions: RoleOption[];
    roleChangePending: string[];
    // The signed-in user: their row can't change its own role, status or be deleted.
    currentUserId: string | null;
    // Each handler is omitted when the user lacks the permission, and its control isn't rendered.
    onEdit?: (user: User) => void;
    onToggleStatus?: (user: User) => void;
    onDelete?: (user: User) => void;
    onChangeRole?: (user: User, roleId: string) => void;
}

export const UsersTable = ({ data, roleOptions, roleChangePending, currentUserId, onEdit, onToggleStatus, onDelete, onChangeRole }: Props) => {
    const hasActions = !!onEdit || !!onToggleStatus || !!onDelete;

    const columns: ColumnDef<User>[] = [
        {
            header: "Usuario",
            accessorKey: "name",
            cell: ({ row }) => (
                <div className={styles.userCell}>
                    <UserAvatar name={row.original.name} />
                    <span className={styles.name}>{row.original.name}</span>
                    {row.original.id === currentUserId && <span className={styles.youTag}>Tú</span>}
                </div>
            ),
        },
        { header: "Correo", accessorKey: "email", cell: ({ row }) => <span className={styles.email}>{row.original.email}</span> },
        { header: "Estado", accessorKey: "isActive", cell: ({ row }) => <UserStatusBadge isActive={row.original.isActive} /> },
        {
            header: "Rol",
            id: "role",
            cell: ({ row }) => (
                <UserRoleSelect
                    user={row.original}
                    options={roleOptions}
                    onChange={row.original.id === currentUserId ? undefined : onChangeRole}
                    pending={roleChangePending.includes(row.original.id)}
                />
            ),
        },
    ];

    if (hasActions) {
        columns.push({
            id: "actions",
            header: "Acciones",
            meta: { actions: true },
            cell: ({ row }) => {
                const user = row.original;
                const isSelf = user.id === currentUserId;
                return (
                    <div className={styles.actions}>
                        {onEdit && (
                            <button type="button" className={`${styles.pill} ${styles.pillEdit}`} onClick={() => onEdit(user)} aria-label={`Editar ${user.email}`}>
                                Editar
                            </button>
                        )}
                        {onToggleStatus && !isSelf && (
                            <button
                                type="button"
                                className={`${styles.pill} ${user.isActive ? styles.pillDisable : styles.pillEnable}`}
                                onClick={() => onToggleStatus(user)}
                                aria-label={`${user.isActive ? "Inhabilitar" : "Habilitar"} ${user.email}`}
                            >
                                {user.isActive ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
                                {user.isActive ? "Inhabilitar" : "Habilitar"}
                            </button>
                        )}
                        {onDelete && !isSelf && (
                            <button type="button" className={styles.iconButton} onClick={() => onDelete(user)} aria-label={`Eliminar ${user.email}`} title="Eliminar">
                                <FiTrash2 aria-hidden />
                            </button>
                        )}
                    </div>
                );
            },
        });
    }

    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (row) => row.id });

    const cellClass = (meta: unknown) => ((meta as { actions?: boolean } | undefined)?.actions ? styles.actionsCell : undefined);

    return (
        <div className={styles.scroll}>
            <table className={styles.table}>
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} scope="col" className={cellClass(header.column.columnDef.meta)}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className={row.original.isActive ? undefined : styles.rowInactive}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className={cellClass(cell.column.columnDef.meta)}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
