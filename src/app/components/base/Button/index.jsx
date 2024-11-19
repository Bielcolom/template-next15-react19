import PropTypes from "prop-types";
import styles from "./button.module.scss";

const Button = ({
    text,
    type = "button",
    onClick,
    disabled = false,
    className,
    style = {},
    ...props
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${styles.button} ${className}`}
            style={style}
            {...props}
        >
            {text}
        </button>
    );
};

Button.propTypes = {
    text: PropTypes.node.isRequired,
    type: PropTypes.oneOf(["button", "submit", "reset"]),
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    style: PropTypes.object,
};

export default Button;
