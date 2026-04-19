"use client";

import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./selector.module.scss";

const Selector = ({
  disabled = false,
  onChange,
  options = [],
  placeholder,
  text = "",
  value = "",
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value) ?? null;
  const isPlaceholder = !selected;

  const handleSelect = (optValue) => {
    setOpen(false);
    if (onChange) onChange(optValue);
  };

  return (
    <div className={styles.container} ref={ref}>
      {text && <label className={styles.label}>{text}</label>}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""} ${disabled ? styles.disabled : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={styles.triggerContent}>
          {selected?.variant && (
            <span className={`${styles.dot} ${styles[selected.variant]}`} />
          )}
          <span className={isPlaceholder ? styles.placeholder : styles.triggerLabel}>
            {selected?.label ?? placeholder}
          </span>
        </span>

        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {open && (
        <ul className={styles.dropdown} role="listbox">
          {placeholder !== undefined && (
            <li
              role="option"
              aria-selected={!value}
              className={`${styles.option} ${!value ? styles.optionActive : ""}`}
              onClick={() => handleSelect("")}
            >
              <span className={styles.optionLabel}>{placeholder}</span>
              {!value && (
                <svg className={styles.check} width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          )}

          {options.map((opt) => {
            const isActive = value === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isActive}
                className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.variant && (
                  <span className={`${styles.dot} ${styles[opt.variant]}`} />
                )}
                <span className={styles.optionLabel}>{opt.label}</span>
                {isActive && (
                  <svg className={styles.check} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

Selector.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(["success", "warn", "danger", "neutral", "primary", "dark"]),
    })
  ),
  placeholder: PropTypes.string,
  text: PropTypes.string,
  value: PropTypes.string,
};

export default Selector;
