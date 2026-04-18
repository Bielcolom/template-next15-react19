"use client";

import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "../Icon";
import TableToolbar from "./TableToolbar";
import TablePagination from "./TablePagination";
import styles from "./table.module.scss";

const INITIAL_VISIBLE_ROWS = 500;

const formatCellValue = (value) => {
  if (value === null || typeof value === "undefined") return "";
  if (value instanceof Date) return value.toLocaleString();
  if (Array.isArray(value)) return value.map(formatCellValue).filter(Boolean).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Table generalizada.
 *
 * API retrocompatible: pasar solo `data` infiere columnas del primer objeto (modo legacy).
 *
 * API extendida:
 *   columns         [{ key, label, render?(row, index), width?, align? }]
 *   toolbar         ReactNode (chips, filtros extra, etc)
 *   searchable      bool — muestra buscador en el toolbar
 *   searchableKeys  ["name", "email"] — campos sobre los que filtra el buscador
 *   pageSize        number — activa paginación en cliente
 *   emptyMessage    string — override del mensaje vacío
 */
const Table = ({
  data = [],
  loading = false,
  columns: columnsProp,
  visibleColumns = [],
  toolbar,
  searchable,
  searchableKeys,
  searchValue,
  onSearchChange,
  pageSize,
  emptyMessage,
  footer,
}) => {
  const t = useTranslations("table");
  const [visibleRows, setVisibleRows] = useState(INITIAL_VISIBLE_ROWS);
  const [internalQuery, setInternalQuery] = useState("");
  const [page, setPage] = useState(1);
  const hasControlledSearch = typeof onSearchChange === "function";
  const query = hasControlledSearch ? (searchValue ?? "") : internalQuery;

  // Modo legacy: inferir columnas del primer row
  const columns = useMemo(() => {
    if (Array.isArray(columnsProp) && columnsProp.length > 0) return columnsProp;
    if (data.length === 0) return [];
    return Object.keys(data[0]).map((key) => ({ key, label: null }));
  }, [columnsProp, data]);

  const effectiveColumns = useMemo(() => {
    if (visibleColumns.length === 0) return columns;
    return columns.filter((c) => visibleColumns.includes(c.key));
  }, [columns, visibleColumns]);

  const showSearch = searchable || (Array.isArray(searchableKeys) && searchableKeys.length > 0);
  const handleSearchChange = hasControlledSearch
    ? onSearchChange
    : (value) => {
        setInternalQuery(value);
        setPage(1);
      };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !Array.isArray(searchableKeys) || searchableKeys.length === 0) return data;
    return data.filter((row) =>
      searchableKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [data, query, searchableKeys]);

  const usePagination = typeof pageSize === "number" && pageSize > 0;
  const totalPages = usePagination ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const currentPage = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    if (usePagination) return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return filtered.slice(0, visibleRows);
  }, [filtered, usePagination, currentPage, pageSize, visibleRows]);

  const handleScroll = (e) => {
    if (usePagination) return;
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight) {
      setVisibleRows((prev) => prev + INITIAL_VISIBLE_ROWS);
    }
  };

  const getLabel = (col) => {
    if (col.label) return col.label;
    const key = `columns.${col.key}`;
    return t.has(key) ? t(key) : col.key;
  };

  const renderCell = (col, row, idx) => {
    if (typeof col.render === "function") return col.render(row, idx);
    return formatCellValue(row[col.key]);
  };

  const showToolbar = toolbar || showSearch;

  return (
    <div className={styles.tableRoot}>
      {showToolbar && (
        <TableToolbar
          searchValue={showSearch ? query : undefined}
          onSearchChange={showSearch ? handleSearchChange : undefined}
        >
          {toolbar}
        </TableToolbar>
      )}

      <div className={styles.tableContainer} onScroll={handleScroll}>
        <table className={styles.genericTable}>
          <thead>
            <tr>
              {effectiveColumns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    width: col.width,
                    textAlign: col.align || "left",
                  }}
                >{getLabel(col)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={effectiveColumns.length} className={styles.loadingTd}>
                  <div className={styles.loadingContainer}>{t("loading")}</div>
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr className={styles.noResults}>
                <td colSpan={Math.max(effectiveColumns.length, 1)}>
                  <Icon icon="exclamation" />
                  {query ? t("noMatch") : (emptyMessage ?? t("empty"))}
                </td>
              </tr>
            ) : (
              pageRows.map((row, idx) => (
                <tr key={row.id ?? row._id ?? idx} className={styles.data}>
                  {effectiveColumns.map((col) => (
                    <td
                      key={col.key}
                      style={{ textAlign: col.align || undefined }}
                    >
                      {renderCell(col, row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer ?? (usePagination && filtered.length > 0 ? (
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      ) : (
        <div className={styles.footer}>
          <p>{t("totalRows")}: {filtered.length}</p>
        </div>
      ))}
    </div>
  );
};

Table.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node,
    render: PropTypes.func,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    align: PropTypes.oneOf(["left", "center", "right"]),
  })),
  visibleColumns: PropTypes.array,
  toolbar: PropTypes.node,
  searchable: PropTypes.bool,
  searchableKeys: PropTypes.arrayOf(PropTypes.string),
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  pageSize: PropTypes.number,
  emptyMessage: PropTypes.string,
  footer: PropTypes.node,
};

export default Table;
