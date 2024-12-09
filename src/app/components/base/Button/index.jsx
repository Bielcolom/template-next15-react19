import PropTypes from "prop-types";
import styles from "./button.module.scss";

const Button = ({
    text,
    type = "button",
    onClick,
    disabled = false,
    className,
    style = {},
    iconLeft,
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
            {iconLeft && <span className={styles.iconLeft}>{iconLeft}</span>}
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
    iconLeft: PropTypes.node,
};

export default Button;
