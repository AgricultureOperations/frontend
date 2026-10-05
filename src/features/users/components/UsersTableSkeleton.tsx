import styles from "../../../styles/features/users/components/UsersTable.module.scss";

const COLUMNS = ["Usuario", "Correo", "Estado", "Rol", "Acciones"];

// First load: the table's shape with shimmering placeholders instead of a spinner.
export const UsersTableSkeleton = ({ rows = 5 }: { rows?: number }) => (
    <div className={styles.scroll} role="status" aria-label="Cargando usuarios">
        <table className={styles.table} aria-hidden>
            <thead>
                <tr>
                    {COLUMNS.map((column) => <th key={column}>{column}</th>)}
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: rows }, (_, i) => (
                    <tr key={i}>
                        <td><div className={styles.userCell}><span className={`${styles.skeleton} ${styles.skeletonAvatar}`} /><span className={styles.skeleton} style={{ width: 140 }} /></div></td>
                        <td><span className={styles.skeleton} style={{ width: 170 }} /></td>
                        <td><span className={styles.skeleton} style={{ width: 70 }} /></td>
                        <td><span className={styles.skeleton} style={{ width: 150 }} /></td>
                        <td><span className={styles.skeleton} style={{ width: 120 }} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
