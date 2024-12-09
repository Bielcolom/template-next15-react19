"use client";

import {
    BACKOFFICE_URL,
    BACKOFFICE_USERROLES_URL,
} from "@/utils/urls";
import styles from "./sidebar.module.scss";
import { userIsAdmin, userIsSuperAdmin } from "@/utils/helpers";
import PropTypes from "prop-types";
import { useState } from "react";
import Button from "../../base/Button";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function Sidebar({ cookies, permissions, onVisibilityChange }) {
    const [isVisible, setIsVisible] = useState(false);
    const user = cookies?.user ? JSON.parse(cookies.user) : {};

    const toggleSidebar = () => {
        const newVisibility = !isVisible;
        setIsVisible(newVisibility);
        onVisibilityChange(newVisibility);
    };

    return (
        <div className={styles.containerSidebar}>
            <Button
                className={`${styles.buttonShowSidebar} ${isVisible ? styles.withSidebar : styles.noSidebar}`}
                onClick={toggleSidebar}
                text={<FaLongArrowAltRight />}
            />
            <div className={`${styles.sidebar} ${isVisible ? "" : styles.hidden}`}>
                <nav>
                    <ul>
                        {userIsAdmin(permissions) && (
                            <li>
                                <a href={BACKOFFICE_URL}>Home</a>
                            </li>
                        )}
                        {userIsSuperAdmin(permissions) && (
                            <li>
                                <a href={BACKOFFICE_USERROLES_URL}>User Roles</a>
                            </li>
                        )}
                    </ul>
                    <p>{user._id}</p>
                </nav>
            </div>
        </div>
    );
}

Sidebar.propTypes = {
    permissions: PropTypes.arrayOf(PropTypes.string),
    cookies: PropTypes.objectOf(PropTypes.string),
    onVisibilityChange: PropTypes.func,

};

Sidebar.defaultProps = {
    permissions: [],
    cookies: {},
    onVisibilityChange: () => { },
};
