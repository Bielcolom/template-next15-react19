"use client";

import PropTypes from "prop-types";
import { usePathname } from "next/navigation";

import Sidebar from "../backoffice/SideBar";
import { pathisSuperAdminProtected, stripLocaleFromPath } from "@/utils/helpers";
import Navbar from "../Navbar";
import { useSession } from "@/app/context/sessionProvider";
import { useState } from "react";

const PageWrapper = ({ children }) => {
    const pathname = stripLocaleFromPath(usePathname());
    const { permissions, userId } = useSession();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    return (
        <div className={`layout-general ${isSidebarVisible ? "with-sidebar" : "no-sidebar"}`}
        >
            {pathisSuperAdminProtected(pathname) && (
                <Sidebar
                    permissions={permissions}
                    userId={userId}
                    onVisibilityChange={setSidebarVisible}
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
