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

export default function Sidebar({ isVisible, userId, permissions, onVisibilityChange, dictionary }) {
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
                                <AppLink href={BACKOFFICE_URL}>{dictionary?.home}</AppLink>
                            </li>
                        )}
                        {userIsSuperAdmin(permissions) && (
                            <li>
                                <AppLink href={BACKOFFICE_USERROLES_URL}>{dictionary?.userRoles}</AppLink>
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
    dictionary: PropTypes.object,
    isVisible: PropTypes.bool,
    permissions: PropTypes.array,
    userId: PropTypes.string,
    onVisibilityChange: PropTypes.func,

};

Sidebar.defaultProps = {
    dictionary: {},
    isVisible: false,
    permissions: [],
    userId: null,
    onVisibilityChange: () => { },
};
