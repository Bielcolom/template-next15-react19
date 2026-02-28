"use client";

import Button from "../../base/Button";
import styles from "./languageSelector.module.scss";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import { useTranslations } from "next-intl";

const LanguageSelector = () => {
    const t = useTranslations("navbar.languageSelector");
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
                text={t("es")}
            />
            <Button
                className={appRouter.locale === "en" ? styles.active : ""}
                onClick={() => handleLanguageChange("en")}
                text={t("en")}
            />
        </div>
    );
};

export default LanguageSelector;
