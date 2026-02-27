"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";

const SessionContext = createContext();

export function SessionProvider({ children, permissions, userId }) {
    return (
        <SessionContext.Provider value={{ permissions, userId }}>
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
};

SessionProvider.defaultProps = {
    permissions: [],
    userId: null,
};
