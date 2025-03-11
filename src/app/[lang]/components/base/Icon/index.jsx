import PropTypes from "prop-types";

const Icon = ({ icon, className = "" }) => {
    return (
        <span className={`material-symbols-outlined ${className}`}>
            {icon}
        </span>
    );
};

Icon.propTypes = {
    icon: PropTypes.string.isRequired,
    className: PropTypes.string,
};

export default Icon;