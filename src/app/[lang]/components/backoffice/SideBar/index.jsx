"use client";

import {
    BACKOFFICE_URL,
    BACKOFFICE_USERROLES_URL,
} from "@/utils/urls";
import styles from "./sidebar.module.scss";
import { userIsAdminOrMore, userIsSuperAdmin } from "@/utils/helpers";
import PropTypes from "prop-types";
import { useState } from "react";
import Button from "../../base/Button";
import Icon from "../../base/Icon";

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
                text={<Icon icon="chevron_left" />}
            />
            <div className={`${styles.sidebar} ${isVisible ? "" : styles.hidden}`}>
                <nav>
                    <ul>
                        {userIsAdminOrMore(permissions) && (
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
    permissions: PropTypes.array,
    cookies: PropTypes.object,
    onVisibilityChange: PropTypes.func,

};

Sidebar.defaultProps = {
    permissions: [],
    cookies: {},
    onVisibilityChange: () => { },
};
