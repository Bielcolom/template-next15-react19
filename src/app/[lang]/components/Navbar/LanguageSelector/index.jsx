"use client"; // Esto asegura que el componente solo se renderice en el cliente

import Button from "../../base/Button";
import styles from "./languageSelector.module.scss";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";

const LanguageSelector = () => {
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
                text="Español"
            />
            <Button
                className={appRouter.locale === "en" ? styles.active : ""}
                onClick={() => handleLanguageChange("en")}
                text="Ingles"
            />
        </div>
    );
};

export default LanguageSelector;
