import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Icon from "../Icon";
import styles from "./table.module.scss";

const Table = ({ data, visibleColumns = [], loading }) => {
    const [visibleRows, setVisibleRows] = useState(500);

    useEffect(() => {
        document.querySelector(`.${styles.tableContainer}`).scrollTop = 0;
        setVisibleRows(500);
    }, [data]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight) {
            setVisibleRows((prev) => prev + 500);
        }
    };

    // Obtener las columnas automáticamente a partir de los datos
    const columns = data.length > 0 ? Object.keys(data[0]).map((key) => ({ value: key, label: key })) : [];

    const isColumnVisible = (column) => {
        // Si no se pasa visibleColumns, todas las columnas son visibles por defecto
        return visibleColumns.length === 0 || visibleColumns.includes(column);
    };

    return (
        <>
            <div className={styles.tableContainer} onScroll={handleScroll}>
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
                                <td colSpan={columns.length}>
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
    visibleColumns: [],  // Si no se pasa, todas las columnas son visibles
    loading: false,
};

Table.propTypes = {
    data: PropTypes.array,
    visibleColumns: PropTypes.array,
    loading: PropTypes.bool,
};

export default Table;
