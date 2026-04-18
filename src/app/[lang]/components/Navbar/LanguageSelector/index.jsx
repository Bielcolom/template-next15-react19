"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./languageSelector.module.scss";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import { useTranslations } from "next-intl";
import Icon from "../../base/Icon";

const LOCALES = ["es", "en"];

const LanguageSelector = () => {
    const t = useTranslations("navbar.languageSelector");
    const appRouter = useAppRouter();
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

    const handleLanguageChange = (newLocale) => {
        setOpen(false);
        if (appRouter.locale !== newLocale) {
            appRouter.switchLocale(newLocale);
        }
    };

    return (
        <div className={styles.wrapper} ref={ref}>
            <button
                className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
                onClick={() => setOpen((prev) => !prev)}
                aria-label="Select language"
                aria-expanded={open}
            >
                <Icon icon="globe" className={styles.globeIcon} />
                <span className={styles.locale}>{appRouter.locale?.toUpperCase()}</span>
            </button>

            {open && (
                <div className={styles.dropdown} role="menu">
                    {LOCALES.map((locale) => (
                        <button
                            key={locale}
                            role="menuitem"
                            className={`${styles.item} ${appRouter.locale === locale ? styles.itemActive : ""}`}
                            onClick={() => handleLanguageChange(locale)}
                        >
                            <span className={styles.itemLocale}>{locale.toUpperCase()}</span>
                            <span className={styles.itemLabel}>{t(locale)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
