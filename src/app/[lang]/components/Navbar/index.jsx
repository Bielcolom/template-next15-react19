"use client";

import styles from "./navbar.module.scss";
import Button, { BUTTON_STYLE_TYPES } from "../base/Button";
import { logout } from "@/app/(auth)/login/actions";
import PropTypes from "prop-types";
import { userIsAdminOrMore } from "@/utils/helpers";
import { ABOUT_URL, BACKOFFICE_URL, INDEX_URL, LOGIN_URL, PRODUCT_1_URL, PRODUCTS_URL } from "@/utils/urls";
import Icon from "../base/Icon";
import LanguageSelector from "./LanguageSelector";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import AppLink from "../base/AppLink";

export const Navbar = ({ userId, permissions, isSidebarVisible }) => {
  const appRouter = useAppRouter();
  const pathWithoutLocale = appRouter.pathnameWithoutLocale;

  const handleLogout = async () => {
    await logout();
    appRouter.replace(LOGIN_URL);
  };

  return (
    <nav
      className={`${styles.nav} ${isSidebarVisible ? styles.navWithSidebar : styles.navFullWidth
        }`}
    >
      <div className={styles.leftElements}>
        <AppLink
          href={INDEX_URL}
          className={`${styles.link} ${pathWithoutLocale === INDEX_URL ? styles.active : ""}`}
        >
          Home
        </AppLink>
        <AppLink
          href={ABOUT_URL}
          className={`${styles.link} ${pathWithoutLocale === ABOUT_URL ? styles.active : ""}`}
        >
          About
        </AppLink>
        <AppLink
          href={PRODUCT_1_URL}
          className={`${styles.link} ${pathWithoutLocale.startsWith(PRODUCTS_URL) ? styles.active : ""}`}
        >
          Product 1
        </AppLink>
      </div>
      <div className={styles.rightElements}>
        <LanguageSelector />
        {userIsAdminOrMore(permissions) &&
          <AppLink
            href={BACKOFFICE_URL}
            className={styles.link}
          >
            Backoffice
          </AppLink>
        }
        {userId ? (
          <Button
            text={<Icon icon="logout" />}
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={handleLogout}
          />

        ) : (
          <Button
            text="Login"
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={() => appRouter.push(LOGIN_URL)} />
        )}
      </div>
    </nav>
  );
};

Navbar.defaultProps = {
  userId: null,
  permissions: PropTypes.array,
};

Navbar.propTypes = {
  permissions: [],
  userId: PropTypes.string,
  isSidebarVisible: PropTypes.bool.isRequired,
};

export default Navbar;
