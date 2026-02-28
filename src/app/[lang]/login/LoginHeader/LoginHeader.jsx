"use client";

import PropTypes from "prop-types";
import styles from "./loginHeader.module.scss";

export const LoginHeader = ({ title }) => {
    return (
        <div className={styles.loginHeader}>
            <h1 className={styles.loginText}>{title}</h1>
        </div>
    );
};

LoginHeader.propTypes = {
    title: PropTypes.string,
};

LoginHeader.defaultProps = {
    title: "",
};
