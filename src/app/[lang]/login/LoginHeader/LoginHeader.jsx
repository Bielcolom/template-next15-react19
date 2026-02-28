"use client";

import { useTranslations } from "next-intl";
import styles from "./loginHeader.module.scss";

export const LoginHeader = () => {
    const t = useTranslations("login");

    return (
        <div className={styles.loginHeader}>
            <h1 className={styles.loginText}>{t("title")}</h1>
        </div>
    );
};
