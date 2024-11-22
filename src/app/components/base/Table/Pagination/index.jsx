// Pagination.js
import PropTypes from "prop-types";
import Button from "../../Button";
import styles from "./pagination.module.scss";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Handle page change
    const handlePageChange = (pageNumber) => {
        onPageChange(pageNumber);
    };

    return (
        <div className={styles.pagination}>
            <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                text={"<"}
            />
            {Array.from({ length: totalPages }, (_, index) => (
                <Button
                    key={index}
                    onClick={() => handlePageChange(index)}
                    className={currentPage === index ? styles.active : ""}
                    text={index + 1}
                />
            ))}
            <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                text=">"
            />
        </div>
    );
};

Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
