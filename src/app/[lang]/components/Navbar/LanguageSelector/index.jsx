"use client"; // Esto asegura que el componente solo se renderice en el cliente

import { usePathname, useRouter } from "next/navigation";
import Button from "../../base/Button";
import styles from "./languageSelector.module.scss";

const LanguageSelector = () => {
    const router = useRouter(); // Aquí usamos useRouter directamente
    const pathname = usePathname(); // Obtenemos la ruta actual usando usePathname

    const handleLanguageChange = (newLocale) => {
        // Actualizar la URL para cambiar el idioma
        // Asegúrate de que la URL se actualice correctamente con el idioma y el pathname
        if (currentLocale !== newLocale) {
            const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
            router.push(newPathname); // Redirige a la nueva ruta con el idioma
        }
    };
    const currentLocale = pathname.split("/")[1]; // 'es' o 'en', según la URL

    return (

        <div className={styles.languageSelector}>
            <Button
                className={router.locale === "es" ? styles.active : ""}
                onClick={() => handleLanguageChange("es")}
                text="Español"
            />
            <Button
                className={router.locale === "en" ? styles.active : ""}
                onClick={() => handleLanguageChange("en")}
                text="Ingles"
            />
        </div>
    );
};

export default LanguageSelector;
