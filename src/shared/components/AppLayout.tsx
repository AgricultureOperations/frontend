import { Outlet } from "react-router-dom";
import styles from "../../styles/shared/components/AppLayout.module.scss";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useTheme } from "../hooks/useTheme";

export const AppLayout = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className={styles.layout} data-theme={theme}>
            <Header theme={theme} toggleTheme={toggleTheme} />
            <div className={styles.body}>
                <Sidebar />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
