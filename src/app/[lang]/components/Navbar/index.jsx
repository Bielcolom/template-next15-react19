"use client";

import { useTransition } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./navbar.module.scss";
import Button, { BUTTON_STYLE_TYPES } from "../base/Button";
import { logout } from "@/app/(auth)/login/actions";
import { userIsAdminOrMore } from "@/utils/helpers";
import { ABOUT_URL, BACKOFFICE_URL, INDEX_URL, LOGIN_URL } from "@/utils/urls";
import Icon from "../base/Icon";
import LanguageSelector from "./LanguageSelector";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import AppLink from "../base/AppLink";
import { useToast } from "@/app/context/toastProvider";

export const Navbar = ({ userId, permissions, isSidebarVisible, isBackofficePath, onSidebarToggle }) => {
  const t = useTranslations("navbar");
  const appRouter = useAppRouter();
  const { showError } = useToast();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const pathWithoutLocale = appRouter.pathnameWithoutLocale;

  const handleLogout = () => {
    startLogoutTransition(async () => {
      const result = await logout(appRouter.locale);

      if (result?.errors?.general?.[0]) {
        showError(result.errors.general[0]);
        return;
      }

      appRouter.replace(LOGIN_URL);
    });
  };

  return (
    <nav
      className={`${styles.nav} ${isSidebarVisible ? styles.navWithSidebar : styles.navFullWidth}`}
    >
      <div className={styles.leftElements}>
        <AppLink href={INDEX_URL} className={styles.logoLink}>
          <Image
            src="/logo/rectangular.png"
            alt="Logo"
            height={32}
            width={120}
            className={styles.logo}
            priority
          />
        </AppLink>
        {isBackofficePath && (
          <Button
            className={styles.sidebarToggle}
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={() => onSidebarToggle(!isSidebarVisible)}
            text={<Icon icon="sidebar" />}
            aria-label="Toggle sidebar"
          />
        )}
        <AppLink
          href={INDEX_URL}
          className={`${styles.link} ${pathWithoutLocale === INDEX_URL ? styles.active : ""}`}
        >
          {t("home")}
        </AppLink>
        <AppLink
          href={ABOUT_URL}
          className={`${styles.link} ${pathWithoutLocale === ABOUT_URL ? styles.active : ""}`}
        >
          {t("about")}
        </AppLink>
      </div>
      <div className={styles.rightElements}>
        <LanguageSelector />
        {userIsAdminOrMore(permissions) &&
          <AppLink
            href={BACKOFFICE_URL}
            className={styles.link}
          >
            {t("backoffice")}
          </AppLink>
        }
        {userId ? (
          <Button
            aria-label={t("logout")}
            text={<Icon icon="logout" />}
            styleType={BUTTON_STYLE_TYPES.transparent}
            disabled={isLoggingOut}
            onClick={handleLogout}
          />
        ) : (
          <Button
            text={t("login")}
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={() => appRouter.push(LOGIN_URL)} />
        )}
      </div>
    </nav>
  );
};

Navbar.defaultProps = {
  userId: null,
  permissions: [],
  isBackofficePath: false,
  onSidebarToggle: () => {},
};

Navbar.propTypes = {
  permissions: PropTypes.array,
  userId: PropTypes.string,
  isSidebarVisible: PropTypes.bool.isRequired,
  isBackofficePath: PropTypes.bool,
  onSidebarToggle: PropTypes.func,
};

export default Navbar;
