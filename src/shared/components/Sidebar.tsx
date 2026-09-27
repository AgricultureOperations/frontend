import { NavLink } from "react-router-dom";
import { FiHome, FiPackage, FiSettings, FiUsers } from "react-icons/fi";
import styles from "../../styles/shared/components/Sidebar.module.scss";

const navItems = [
    { to: "/dashboard", label: "Inicio", icon: <FiHome aria-hidden /> },
    { to: "/orders", label: "Orders", icon: <FiPackage aria-hidden /> },
    { to: "/users", label: "Users", icon: <FiUsers aria-hidden /> },
];

export const Sidebar = () => {
    return (
        <nav className={styles.sidebar} aria-label="Main navigation">
            <ul className={styles.navList}>
                {navItems.map(({ to, label, icon }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            className={({ isActive }) =>
                                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                            }
                        >
                            <span className={styles.navIcon}>{icon}</span>
                            <span className={styles.navLabel}>{label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
            <button
                type="button"
                className={styles.settingsButton}
                disabled
                title="Settings (coming soon)"
                aria-label="Settings (coming soon)"
            >
                <FiSettings aria-hidden />
                <span className={styles.navLabel}>Settings</span>
            </button>
        </nav>
    );
};
