"use client";

import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import {
  BACKOFFICE_URL,
  BACKOFFICE_USERROLES_URL,
} from "@/utils/urls";
import styles from "./sidebar.module.scss";
import { userIsAdminOrMore, userIsSuperAdmin } from "@/utils/helpers";
import Icon from "../../base/Icon";
import AppLink from "../../base/AppLink";

const NAV_ITEMS = [
  { key: "home", icon: "home", href: BACKOFFICE_URL, guard: userIsAdminOrMore },
  { key: "userRoles", icon: "shield", href: BACKOFFICE_USERROLES_URL, guard: userIsSuperAdmin },
];

export default function Sidebar({ isVisible, userName, permissions }) {
  const t = useTranslations("backoffice.sidebar");

  return (
    <div className={styles.containerSidebar}>
      <div className={`${styles.sidebar} ${isVisible ? "" : styles.collapsed}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.headerFull}>Backoffice</span>
          <span className={styles.headerShort}>BO</span>
        </div>
        <nav>
          <ul>
            {NAV_ITEMS.map(({ key, icon, href, guard }) =>
              guard(permissions) ? (
                <li key={key}>
                  <AppLink href={href}>
                    <span className={styles.navIcon}>
                      <Icon icon={icon} />
                    </span>
                    <span className={styles.navLabel}>{t(key)}</span>
                  </AppLink>
                </li>
              ) : null
            )}
          </ul>
        </nav>
        {userName && (
          <div className={styles.userNameContainer}>
            <p className={styles.userName}>{userName}</p>
          </div>
        )}
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  isVisible: PropTypes.bool,
  permissions: PropTypes.array,
  userName: PropTypes.string,
};

Sidebar.defaultProps = {
  isVisible: false,
  permissions: [],
  userName: null,
};
