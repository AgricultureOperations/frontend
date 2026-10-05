import { NavLink } from "react-router-dom";
import { FiBox, FiHome, FiPackage, FiSettings, FiShield, FiUsers } from "react-icons/fi";
import styles from "../../styles/shared/components/Sidebar.module.scss";
import plantIcon from "../../assets/plant-icon.png";
import { usePermission } from "../hooks/usePermission";

// `permission` hides the item when the signed-in user can't view that resource (the route shows "No access" too).
const navItems = [
    { to: "/dashboard", label: "Inicio", icon: <FiHome aria-hidden /> },
    { to: "/orders", label: "Orders", icon: <FiPackage aria-hidden />, permission: "orders:view" },
    // FiBox, not FiPackage: Orders already uses the package icon.
    { to: "/products", label: "Products", icon: <FiBox aria-hidden />, permission: "products:view" },
    { to: "/users", label: "Users", icon: <FiUsers aria-hidden />, permission: "users:view" },
    { to: "/roles", label: "Roles", icon: <FiShield aria-hidden />, permission: "roles:view" },
];

const maintainersItem = { to: "/maintainers", label: "Maintainers", icon: <FiSettings aria-hidden /> };

const getNavItemClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem;

export const Sidebar = () => {
    const { canCode } = usePermission();
    const visibleItems = navItems.filter((item) => !item.permission || canCode(item.permission));

    return (
        <aside className={styles.sidebar}>
            <div className={styles.top}>
                <div className={styles.brand}>
                    <img src={plantIcon} alt="AgriOPS" className={styles.logo} />
                </div>
                <nav aria-label="Main navigation" className={styles.nav}>
                    <ul className={styles.navList}>
                        {visibleItems.map(({ to, label, icon }) => (
                            <li key={to}>
                                <NavLink to={to} className={getNavItemClass}>
                                    <span className={styles.navIcon}>{icon}</span>
                                    <span className={styles.navLabel}>{label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <nav aria-label="Secondary navigation" className={styles.bottom}>
                <NavLink to={maintainersItem.to} className={getNavItemClass}>
                    <span className={styles.navIcon}>{maintainersItem.icon}</span>
                    <span className={styles.navLabel}>{maintainersItem.label}</span>
                </NavLink>
            </nav>
        </aside>
    );
};
