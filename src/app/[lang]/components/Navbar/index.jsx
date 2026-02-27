"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./navbar.module.scss";
import Button, { BUTTON_STYLE_TYPES } from "../base/Button";
import { logout } from "@/app/(auth)/login/actions";
import PropTypes from "prop-types";
import { userIsAdminOrMore } from "@/utils/helpers";
import Icon from "../base/Icon";
import LanguageSelector from "./LanguageSelector";

export const Navbar = ({ userId, permissions, isSidebarVisible }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <nav
      className={`${styles.nav} ${isSidebarVisible ? styles.navWithSidebar : styles.navFullWidth
        }`}
    >
      <div className={styles.leftElements}>
        <Link
          href="/"
          className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        >
          Home
        </Link>
        <Link
          href="/about"
          className={`${styles.link} ${pathname === "/about" ? styles.active : ""}`}
        >
          About
        </Link>
        <Link
          href="/products/1"
          className={`${styles.link} ${pathname.startsWith("/products/1") ? styles.active : ""}`}
        >
          Product 1
        </Link>
      </div>
      <div className={styles.rightElements}>
        <LanguageSelector />
        {userIsAdminOrMore(permissions) &&
          <Link
            href="/backoffice"
            className={styles.link}
          >
            Backoffice
          </Link>
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
            onClick={() => router.push("/login")} />
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
