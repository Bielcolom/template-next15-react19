"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Icon from "../Icon";
import styles from "./table.module.scss";

const INITIAL_VISIBLE_ROWS = 500;

const TableViewport = ({ columns, data, loading, visibleColumns }) => {
    const t = useTranslations("table");
    const [visibleRows, setVisibleRows] = useState(500);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight) {
            setVisibleRows((prev) => prev + INITIAL_VISIBLE_ROWS);
        }
    };

    const isColumnVisible = (column) => {
        return visibleColumns.length === 0 || visibleColumns.includes(column);
    };

    const getColumnLabel = (column) => {
        const key = `columns.${column}`;
        return t.has(key) ? t(key) : column;
    };

    return (
        <>
            <div className={styles.tableContainer} onScroll={handleScroll}>
                <table className={styles.genericTable}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => isColumnVisible(col.value) && (
                                <th key={idx}>{getColumnLabel(col.value)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.loadingTd}>
                                    <div className={styles.loadingContainer}>
                                        {t("loading")}
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr className={styles.noResults}>
                                <td colSpan={Math.max(columns.length, 1)}>
                                    <Icon icon="exclamation" />
                                    {t("empty")}
                                </td>
                            </tr>
                        ) : (
                            data.slice(0, visibleRows).map((row, idx) => (
                                <tr key={idx} className={`${styles.data} ${idx % 2 === 0 ? styles.evenRow : styles.oddRow}`}>
                                    {columns.map((col) => isColumnVisible(col.value) && (
                                        <td key={col.value}>
                                            {row[col.value]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className={styles.footer}>
                <p>{t("totalRows")}: {data.length}</p>
            </div>
        </>
    );
};

TableViewport.propTypes = {
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
    visibleColumns: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
};

const Table = ({ data, visibleColumns = [], loading }) => {
    const columns = data.length > 0 ? Object.keys(data[0]).map((key) => ({ value: key, label: key })) : [];
    const tableStateKey = `${data.length}:${columns.map((column) => column.value).join("|")}`;

    return (
        <TableViewport
            key={tableStateKey}
            columns={columns}
            data={data}
            loading={loading}
            visibleColumns={visibleColumns}
        />
    );
};

Table.defaultProps = {
    data: [],
    visibleColumns: [],
    loading: false,
};

Table.propTypes = {
    data: PropTypes.array,
    visibleColumns: PropTypes.array,
    loading: PropTypes.bool,
};

export default Table;
