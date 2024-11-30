"use client";

import { createContext, useContext } from "react";
import PropTypes from "prop-types";

const SessionContext = createContext();

export function SessionProvider({ children, permissions, cookies }) {
    return (
        <SessionContext.Provider value={{ permissions, cookies }}>
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
    cookies: PropTypes.objectOf(PropTypes.string),
};

SessionProvider.defaultProps = {
    permissions: [],
    cookies: {},
};
