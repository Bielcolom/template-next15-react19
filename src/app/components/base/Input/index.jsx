import { useState } from "react";
import PropTypes from "prop-types";
import styles from "./input.module.scss";

const Input = ({
    disabled = false,
    error = false,
    errorText = "",
    infoText = "",
    icon,
    inputRef,
    isFocused = false,
    maxLength,
    maxRows,
    minRows,
    onChange,
    onFocus,
    placeholder = "",
    showPassword = false,
    text = "",
    textarea = false,
    value,
    validation,
}) => {
    const [passwordVisible, setPasswordVisible] = useState(!showPassword);
    const [focused, setFocused] = useState(isFocused);
    const [validationError, setValidationError] = useState("");

    const handleFocus = (e) => {
        setFocused(true);
        if (onFocus) onFocus(e);
    };

    const handleBlur = () => {
        setFocused(false);
        if (validation) {
            const error = validation(value);
            setValidationError(error || "");
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        if (onChange) onChange(value);

        if (validation) {
            const error = validation(value);
            setValidationError(error || "");
        }
    };

    const inputProps = {
        disabled,
        maxLength,
        placeholder,
        value,
        onChange: handleChange,
        onFocus: handleFocus,
        onBlur: handleBlur,
        ref: inputRef,
        className: `
      ${styles.input} 
      ${(error || validationError) ? styles.error : ""} 
      ${focused ? styles.focused : ""} 
      ${disabled ? styles.disabled : ""} 
      ${icon ? styles.withIcon : ""}
    `,
    };

    return (
        <div className={styles.container}>
            {text && <label className={styles.label}>{text}</label>}

            <div className={styles.inputWrapper}>
                {icon && <div className={styles.icon}>{icon}</div>}

                {textarea ? (
                    <textarea
                        {...inputProps}
                        rows={minRows}
                        style={{ resize: "none", maxHeight: maxRows ? `${maxRows * 1.5}rem` : undefined }}
                    />
                ) : (
                    <input
                        {...inputProps}
                        type={showPassword ? (passwordVisible ? "text" : "password") : "text"}
                    />
                )}

                {showPassword && (
                    <button
                        type="button"
                        onClick={() => setPasswordVisible((prev) => !prev)}
                        className={styles.togglePassword}
                    >
                        {passwordVisible ? "🙈" : "👁️"}
                    </button>
                )}
            </div>

            {(error || validationError) && (
                <p className={`${styles.textMessage} ${styles.errorText}`}>
                    {validationError || errorText}
                </p>
            )}

            {!validationError && !error && infoText && (
                <p className={`${styles.textMessage} ${styles.infoText}`}>{infoText}</p>
            )}
        </div>
    );
};

Input.propTypes = {
    disabled: PropTypes.bool,
    error: PropTypes.bool,
    errorText: PropTypes.string,
    infoText: PropTypes.string,
    icon: PropTypes.node,
    inputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
    isFocused: PropTypes.bool,
    maxLength: PropTypes.number,
    maxRows: PropTypes.number,
    minRows: PropTypes.number,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    placeholder: PropTypes.string,
    showPassword: PropTypes.bool,
    text: PropTypes.string,
    textarea: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    validation: PropTypes.func,
};

Input.defaultProps = {
    disabled: false,
    error: false,
    errorText: "",
    infoText: "",
    isFocused: false,
    placeholder: "",
    showPassword: false,
    text: "",
    textarea: false,
};

export default Input;
