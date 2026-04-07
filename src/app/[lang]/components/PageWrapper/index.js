"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import Sidebar from "../backoffice/SideBar";
import Navbar from "../Navbar";
import { useSession } from "@/app/context/sessionProvider";
import { BACKOFFICE_URL } from "@/utils/urls";
import { usePathname } from "@/i18n/navigation";

const SIDEBAR_VISIBILITY_STORAGE_KEY = "backoffice-sidebar-visible";

const getStoredSidebarVisibility = () => {
    if ("undefined" === typeof window) {
        return false;
    }

    try {
        return window.localStorage.getItem(SIDEBAR_VISIBILITY_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
};

const PageWrapper = ({ children }) => {
    const pathname = usePathname();
    const { permissions, userId } = useSession();
    const [sidebarPreference, setSidebarPreference] = useState(getStoredSidebarVisibility);
    const isBackofficePath = pathname === BACKOFFICE_URL || pathname.startsWith(`${BACKOFFICE_URL}/`);
    const isSidebarVisible = isBackofficePath ? sidebarPreference : false;

    const handleSidebarVisibilityChange = (isVisible) => {
        setSidebarPreference(isVisible);
        try {
            window.localStorage.setItem(SIDEBAR_VISIBILITY_STORAGE_KEY, String(isVisible));
        } catch {
            // localStorage unavailable (e.g. private browsing mode)
        }
    };

    return (
        <div className={`layout-general ${isSidebarVisible ? "with-sidebar" : "no-sidebar"}`}
        >
            {isBackofficePath && (
                <Sidebar
                    isVisible={isSidebarVisible}
                    permissions={permissions}
                    userId={userId}
                    onVisibilityChange={handleSidebarVisibilityChange}
                />
            )}
            <main>
                <Navbar userId={userId} permissions={permissions} isSidebarVisible={isSidebarVisible} />
                <div className="content">
                    {children}
                </div>
            </main>
        </div>
    );
};

PageWrapper.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PageWrapper;
