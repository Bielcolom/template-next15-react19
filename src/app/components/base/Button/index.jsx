import PropTypes from "prop-types";
import styles from "./button.module.scss";
import Icon from "../Icon";
import Link from "next/link";

export const BUTTON_STYLE_TYPES = {
    primary: "primary",
    primaryDark: "primaryDark",
    primaryDarker: "primaryDarker",
    primaryLight: "primaryLight",
    primaryLighter: "primaryLighter",
    secondary: "secondary",
    secondaryDark: "secondaryDark",
    secondaryDarker: "secondaryDarker",
    secondaryLight: "secondaryLight",
    secondaryLighter: "secondaryLighter",
    accent: "accent",
    gray: "gray",
    black: "black",
    white: "white",
    transparent: "transparent",
};

const Button = ({
    buttonRef,
    children,
    className,
    disableStyleType = false,
    disabled = false,
    target = "",
    iconLeft,
    iconRight,
    inverted = false,
    onClick = () => { },
    styleOnPress = false,
    text,
    to,
    type = "button",
    styleType,
    ...rest
}) => {
    let computedClassName = styles.button;

    if (styleOnPress) {

        computedClassName += ` ${styles.btnPress}`;
    }
    if (!disableStyleType && styleType) {
        computedClassName += ` ${styles[styleType]}`;
    }
    if (inverted) {
        computedClassName += ` ${styles.inverted}`;
    }
    if (className) {
        computedClassName += ` ${className}`;
    }
    if (disabled) {
        computedClassName += ` ${styles.disabled}`;
    }

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
        } else {
            onClick(e);
        }
    };

    const content = (
        <>
            {iconLeft && <Icon icon={`${iconLeft} left`} className={text ? styles.withMargin : ""} />}
            {text && <span>{text}</span>}
            {children}
            {iconRight && <Icon icon={`${iconRight} right`} className={text ? styles.withMargin : ""} />}
        </>
    );

    return to ? (
        <Link href={to} passHref>
            <a
                {...rest}
                ref={buttonRef}
                className={computedClassName}
                target={target}
                rel="noopener noreferrer"
                onClick={handleClick}
            >
                {content}
            </a>
        </Link>
    ) : (
        <button
            {...rest}
            ref={buttonRef}
            type={type}
            className={computedClassName}
            disabled={disabled}
            onClick={handleClick}
        >
            {content}
        </button>
    );
};

Button.propTypes = {
    buttonRef: PropTypes.any,
    children: PropTypes.node,
    className: PropTypes.string,
    disableStyleType: PropTypes.bool,
    disabled: PropTypes.bool,
    target: PropTypes.string,
    iconLeft: PropTypes.string,
    iconRight: PropTypes.string,
    inverted: PropTypes.bool,
    onClick: PropTypes.func,
    styleOnPress: PropTypes.bool,
    styleType: PropTypes.oneOf(Object.values(BUTTON_STYLE_TYPES)),
    text: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    to: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    type: PropTypes.string,
};

export default Button;
