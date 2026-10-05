import { Outlet } from "react-router-dom";
import styles from "../../styles/shared/components/AppLayout.module.scss";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ToastViewport } from "./ToastViewport";
import { useTheme } from "../hooks/useTheme";
import { useSession } from "../../features/auth/hooks/useSession";

export const AppLayout = () => {
    const { theme, toggleTheme } = useTheme();
    // Loads /auth/me for the header badge, the sidebar and every permission check.
    useSession();

    return (
        <div className={styles.layout} data-theme={theme}>
            <Sidebar />
            <div className={styles.column}>
                <Header theme={theme} toggleTheme={toggleTheme} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
            <ToastViewport />
        </div>
    );
};
