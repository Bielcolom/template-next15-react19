"use client";

import PropTypes from "prop-types";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import Sidebar from "../backoffice/SideBar";
import Navbar from "../Navbar";
import { useSession } from "@/app/context/sessionProvider";
import { stripLocaleFromPath } from "@/utils/helpers";
import { BACKOFFICE_URL } from "@/utils/urls";

const SIDEBAR_VISIBILITY_STORAGE_KEY = "backoffice-sidebar-visible";

const PageWrapper = ({ children }) => {
    const pathname = stripLocaleFromPath(usePathname());
    const { permissions, userId } = useSession();
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const isBackofficePath = pathname === BACKOFFICE_URL || pathname.startsWith(`${BACKOFFICE_URL}/`);

    useEffect(() => {
        if (!isBackofficePath) {
            setSidebarVisible(false);
            return;
        }

        const savedVisibility = window.localStorage.getItem(SIDEBAR_VISIBILITY_STORAGE_KEY);

        if (savedVisibility === null) {
            return;
        }

        setSidebarVisible(savedVisibility === "true");
    }, [isBackofficePath]);

    const handleSidebarVisibilityChange = (isVisible) => {
        setSidebarVisible(isVisible);
        window.localStorage.setItem(SIDEBAR_VISIBILITY_STORAGE_KEY, String(isVisible));
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
