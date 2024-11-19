"use client";

import PropTypes from "prop-types";
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [userId, setUserId] = useState(() => {
        return localStorage.getItem("userId") || null;
    });

    const updateUserId = (newUserId) => {
        setUserId(newUserId);
        if (newUserId !== null) {
            localStorage.setItem("userId", newUserId);
        } else {
            localStorage.removeItem("userId");
        }
    };

    return (
        <UserContext.Provider value={{ userId, setUserId: updateUserId }}>
            {children}
        </UserContext.Provider>
    );
}

UserProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export function useUserContext() {
    return useContext(UserContext);
}
