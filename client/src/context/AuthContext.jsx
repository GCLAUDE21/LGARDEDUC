import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [user, setUser] = useState(undefined); // undefined = pas encore chargé

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch(`/api/auth/me`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            }
        };
        fetchMe();
    }, []);

    const logout = async () => {
        await fetch(`/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);