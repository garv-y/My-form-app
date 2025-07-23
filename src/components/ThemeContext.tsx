import React, { createContext, useContext, useState, useEffect } from "react";

// ✅ Define the shape of the context: theme value + toggle function
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// ✅ Create the ThemeContext with default (light mode)
const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

// ✅ ThemeProvider wraps the app and provides theme context
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage or fallback to "light"
  const [theme, setTheme] = useState<"light" | "dark">(
    localStorage.getItem("theme") === "dark" ? "dark" : "light"
  );

  // ✅ Toggle function switches theme and saves to localStorage
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // ✅ Effect applies Tailwind dark class to root html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // ✅ Provide theme and toggleTheme to all children
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ✅ Custom hook for consuming theme context
export const useTheme = () => useContext(ThemeContext);
