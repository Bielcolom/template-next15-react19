"use client";

import styles from "./navbar.module.scss";
import Button, { BUTTON_STYLE_TYPES } from "../base/Button";
import { logout } from "@/app/(auth)/login/actions";
import PropTypes from "prop-types";
import { userIsAdminOrMore } from "@/utils/helpers";
import Icon from "../base/Icon";
import LanguageSelector from "./LanguageSelector";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import AppLink from "../base/AppLink";

export const Navbar = ({ userId, permissions, isSidebarVisible }) => {
  const appRouter = useAppRouter();
  const pathWithoutLocale = appRouter.pathnameWithoutLocale;

  const handleLogout = async () => {
    await logout();
    appRouter.replace("/login");
  };

  return (
    <nav
      className={`${styles.nav} ${isSidebarVisible ? styles.navWithSidebar : styles.navFullWidth
        }`}
    >
      <div className={styles.leftElements}>
        <AppLink
          href="/"
          className={`${styles.link} ${pathWithoutLocale === "/" ? styles.active : ""}`}
        >
          Home
        </AppLink>
        <AppLink
          href="/about"
          className={`${styles.link} ${pathWithoutLocale === "/about" ? styles.active : ""}`}
        >
          About
        </AppLink>
        <AppLink
          href="/products/1"
          className={`${styles.link} ${pathWithoutLocale.startsWith("/products/1") ? styles.active : ""}`}
        >
          Product 1
        </AppLink>
      </div>
      <div className={styles.rightElements}>
        <LanguageSelector />
        {userIsAdminOrMore(permissions) &&
          <AppLink
            href="/backoffice"
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
            onClick={() => appRouter.push("/login")} />
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
