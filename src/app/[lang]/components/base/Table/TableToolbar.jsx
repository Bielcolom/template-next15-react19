"use client";

import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import Icon from "../Icon";
import styles from "./table.module.scss";

export default function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  children,
}) {
  const t = useTranslations("table");
  const showSearch = typeof onSearchChange === "function";

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        {showSearch && (
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><Icon icon="search" /></span>
            <input
              type="search"
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder ?? t("search")}
              className={styles.searchInput}
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

TableToolbar.propTypes = {
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  children: PropTypes.node,
};
