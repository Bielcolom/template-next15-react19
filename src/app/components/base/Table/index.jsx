// Table.js
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import Pagination from "./Pagination"; // Import the Pagination component
import styles from "./table.module.scss";

const Table = ({
    elements,
    showActions,
    extraActions,
    loading = false,
    itemsPerPage = 10,
    className = "",
    children,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [paginatedItems, setPaginatedItems] = useState([]);

    useEffect(() => {
        // Paginate the elements when the page or elements change
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedItems(elements.slice(startIndex, endIndex));
    }, [currentPage, elements, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(elements.length / itemsPerPage);

    // Get columns dynamically from the keys of the first object
    const columns = elements[0] ? Object.keys(elements[0]) : [];

    return (
        <div className={`${styles["table-container"]} ${className}`}>
            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col}</th>
                                ))}
                                {showActions && <th>Acciones</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map((item, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((col, cellIndex) => (
                                        <td key={cellIndex}>{item[col]}</td>
                                    ))}
                                    {showActions && (
                                        <td className={styles["actions-column"]}>
                                            <button onClick={() => console.log(`Editar ${item.nombre}`)}>Editar</button>
                                            <button onClick={() => console.log(`Eliminar ${item.nombre}`)}>Eliminar</button>
                                            {extraActions &&
                                                extraActions.map((action, index) => (
                                                    <button key={index} onClick={() => action.onClick(item)}>
                                                        {action.label}
                                                    </button>
                                                ))}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {children}

                    {/* Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage} // Pass the setter to handle page changes
                    />
                </>
            )}
        </div>
    );
};

Table.propTypes = {
    elements: PropTypes.arrayOf(PropTypes.object).isRequired,
    showActions: PropTypes.bool,
    extraActions: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            onClick: PropTypes.func.isRequired,
        })
    ),
    loading: PropTypes.bool,
    itemsPerPage: PropTypes.number,
    className: PropTypes.string,
    children: PropTypes.node,
};

Table.defaultProps = {
    showActions: true,
    extraActions: [],
    loading: false,
    itemsPerPage: 10,
    className: "",
    children: null,
};

export default Table;
