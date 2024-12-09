"use client";

import PropTypes from "prop-types";
import { usePathname } from "next/navigation";

import Sidebar from "../backoffice/SideBar";
import { pathisSuperAdminProtected } from "@/utils/helpers";
import Navbar from "../Navbar";
import { useSession } from "@/app/context/sessionProvider";
import { useState } from "react";

const PageWrapper = ({ children }) => {
    const pathname = usePathname();
    const { permissions, cookies } = useSession();
    const [isSidebarVisible, setSidebarVisible] = useState(false);

    return (
        <div className={`layout-general ${isSidebarVisible ? "with-sidebar" : "no-sidebar"}`}
        >
            {pathisSuperAdminProtected(pathname) && (
                <Sidebar
                    permissions={permissions}
                    cookies={cookies}
                    onVisibilityChange={setSidebarVisible}
                />
            )}
            <main>
                <Navbar cookies={cookies} isSidebarVisible={isSidebarVisible} />
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
