"use client";

import PropTypes from "prop-types";
import Button from "../../base/Button";
import styles from "./languageSelector.module.scss";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";

const LanguageSelector = ({ labels }) => {
    const appRouter = useAppRouter();

    const handleLanguageChange = (newLocale) => {
        if (appRouter.locale !== newLocale) {
            appRouter.switchLocale(newLocale);
        }
    };

    return (
        <div className={styles.languageSelector}>
            <Button
                className={appRouter.locale === "es" ? styles.active : ""}
                onClick={() => handleLanguageChange("es")}
                text={labels?.es}
            />
            <Button
                className={appRouter.locale === "en" ? styles.active : ""}
                onClick={() => handleLanguageChange("en")}
                text={labels?.en}
            />
        </div>
    );
};

LanguageSelector.propTypes = {
    labels: PropTypes.object,
};

LanguageSelector.defaultProps = {
    labels: {},
};

export default LanguageSelector;
