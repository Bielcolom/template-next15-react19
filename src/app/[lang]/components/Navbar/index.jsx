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

export const Navbar = ({ userId, permissions, isSidebarVisible, dictionary }) => {
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
          {dictionary?.home}
        </AppLink>
        <AppLink
          href={ABOUT_URL}
          className={`${styles.link} ${pathWithoutLocale === ABOUT_URL ? styles.active : ""}`}
        >
          {dictionary?.about}
        </AppLink>
        <AppLink
          href={PRODUCT_1_URL}
          className={`${styles.link} ${pathWithoutLocale.startsWith(PRODUCTS_URL) ? styles.active : ""}`}
        >
          {dictionary?.productOne}
        </AppLink>
      </div>
      <div className={styles.rightElements}>
        <LanguageSelector labels={dictionary?.languageSelector} />
        {userIsAdminOrMore(permissions) &&
          <AppLink
            href={BACKOFFICE_URL}
            className={styles.link}
          >
            {dictionary?.backoffice}
          </AppLink>
        }
        {userId ? (
          <Button
            aria-label={dictionary?.logout}
            text={<Icon icon="logout" />}
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={handleLogout}
          />

        ) : (
          <Button
            text={dictionary?.login}
            styleType={BUTTON_STYLE_TYPES.transparent}
            onClick={() => appRouter.push(LOGIN_URL)} />
        )}
      </div>
    </nav>
  );
};

Navbar.defaultProps = {
  dictionary: {},
  userId: null,
  permissions: [],
};

Navbar.propTypes = {
  dictionary: PropTypes.object,
  permissions: PropTypes.array,
  userId: PropTypes.string,
  isSidebarVisible: PropTypes.bool.isRequired,
};

export default Navbar;
