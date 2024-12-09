"use client";
import styles from "./loginHeader.module.scss";


export const LoginHeader = () => {
    return (
        <div className={styles.loginHeader}>
            <h1 className={styles.loginText}>Login</h1>
        </div>
    );
};