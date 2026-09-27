import { useState } from "react";

export type Theme = "light" | "dark";

// Component state only: the architecture rules keep `localStorage` for the auth token,
// so the choice is not persisted and every visit starts in light mode.
export const useTheme = (initialTheme: Theme = "light") => {
    const [theme, setTheme] = useState<Theme>(initialTheme);
    const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));
    return { theme, toggleTheme };
}
