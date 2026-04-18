"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";

const SessionContext = createContext();

export function SessionProvider({ children, permissions, userId, userName }) {
    return (
        <SessionContext.Provider value={{ permissions, userId, userName }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    return useContext(SessionContext);
}

SessionProvider.propTypes = {
    children: PropTypes.node.isRequired,
    permissions: PropTypes.arrayOf(PropTypes.string),
    userId: PropTypes.string,
    userName: PropTypes.string,
};

SessionProvider.defaultProps = {
    permissions: [],
    userId: null,
    userName: null,
};
