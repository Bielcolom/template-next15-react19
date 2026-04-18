"use client";

import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import styles from "./table.module.scss";

export default function TablePagination({ page, totalPages, total, pageSize, onChange }) {
  const t = useTranslations("table");
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1);

  return (
    <div className={styles.pagination}>
      <div className={styles.pagInfo}>
        {t.rich("showing", {
          from, to, total,
          b: (chunks) => <b>{chunks}</b>,
        })}
      </div>
      <div className={styles.pagPages}>
        <button type="button" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>‹</button>
        {pages.map((n, i, arr) => (
          <span key={n} style={{ display: "contents" }}>
            {i > 0 && arr[i - 1] !== n - 1 && <span className={styles.pagEllipsis}>…</span>}
            <button
              type="button"
              onClick={() => onChange(n)}
              className={n === page ? styles.pagActive : ""}
            >{n}</button>
          </span>
        ))}
        <button type="button" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>›</button>
      </div>
    </div>
  );
}

TablePagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
