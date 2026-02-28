"use client";

import {
    BACKOFFICE_URL,
    BACKOFFICE_USERROLES_URL,
} from "@/utils/urls";
import styles from "./sidebar.module.scss";
import { userIsAdminOrMore, userIsSuperAdmin } from "@/utils/helpers";
import PropTypes from "prop-types";
import Button from "../../base/Button";
import Icon from "../../base/Icon";
import AppLink from "../../base/AppLink";

export default function Sidebar({ isVisible, userId, permissions, onVisibilityChange }) {
    const toggleSidebar = () => {
        onVisibilityChange(!isVisible);
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
                                <AppLink href={BACKOFFICE_URL}>Home</AppLink>
                            </li>
                        )}
                        {userIsSuperAdmin(permissions) && (
                            <li>
                                <AppLink href={BACKOFFICE_USERROLES_URL}>User Roles</AppLink>
                            </li>
                        )}
                    </ul>
                    <p>{userId}</p>
                </nav>
            </div>
        </div>
    );
}

Sidebar.propTypes = {
    isVisible: PropTypes.bool,
    permissions: PropTypes.array,
    userId: PropTypes.string,
    onVisibilityChange: PropTypes.func,

};

Sidebar.defaultProps = {
    isVisible: false,
    permissions: [],
    userId: null,
    onVisibilityChange: () => { },
};
