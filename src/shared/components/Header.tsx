import { FiBell, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/shared/components/Header.module.scss";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../features/auth/states/auth.slice";
import { getDisplayNameFromEmail, getInitials } from "../utils/formatUserDisplay";
import type { Theme } from "../hooks/useTheme";

interface Props {
    theme: Theme;
    toggleTheme: () => void;
}

export const Header = ({ theme, toggleTheme }: Props) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const email = useAppSelector((state) => state.auth.email);
    const displayName = getDisplayNameFromEmail(email);
    const initials = getInitials(displayName);
    const isDark = theme === "dark";

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <header className={styles.header}>
            <span className={styles.title}>AgriOPS</span>
            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={toggleTheme}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? <FiSun aria-hidden /> : <FiMoon aria-hidden />}
                </button>
                <button type="button" className={styles.iconButton} aria-label="Notifications">
                    <FiBell aria-hidden />
                    <span className={styles.badge} aria-hidden />
                </button>
                {displayName && (
                    <div className={styles.userBadge}>
                        <span className={styles.avatar}>{initials}</span>
                        <span className={styles.userName}>{displayName.toUpperCase()}</span>
                    </div>
                )}
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={handleLogout}
                    aria-label="Log out"
                >
                    <FiLogOut aria-hidden />
                </button>
            </div>
        </header>
    );
};
