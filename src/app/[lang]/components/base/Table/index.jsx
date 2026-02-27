"use client";

import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon";
import styles from "./table.module.scss";

const Table = ({ data, visibleColumns = [], loading }) => {
    const [visibleRows, setVisibleRows] = useState(500);
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
        setVisibleRows(500);
    }, [data]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight) {
            setVisibleRows((prev) => prev + 500);
        }
    };

    const columns = data.length > 0 ? Object.keys(data[0]).map((key) => ({ value: key, label: key })) : [];

    const isColumnVisible = (column) => {
        return visibleColumns.length === 0 || visibleColumns.includes(column);
    };

    return (
        <>
            <div className={styles.tableContainer} onScroll={handleScroll} ref={containerRef}>
                <table className={styles.genericTable}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => isColumnVisible(col.value) && (
                                <th key={idx}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className={styles.loadingTd}>
                                    <div className={styles.loadingContainer}>
                                        Loading...
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr className={styles.noResults}>
                                <td colSpan={Math.max(columns.length, 1)}>
                                    <Icon icon="exclamation" />
                                    NoItems
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
                <p>totalRows: {data.length}</p>
            </div>
        </>
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
