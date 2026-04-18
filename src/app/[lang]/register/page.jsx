import { getTranslations } from "next-intl/server";
import styles from "./register.module.scss";
import RegisterForm from "./RegisterForm/RegisterForm";
import BrandMandala from "@/app/[lang]/components/base/BrandMandala";
import AuthBodyClass from "@/app/[lang]/components/AuthBodyClass";

export default async function RegisterPage({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "register" });

  return (
    <>
      <AuthBodyClass />
      <div className={styles.registerPage}>
        <div className={styles.card}>
          <div className={styles.head}>
            <BrandMandala size={44} color="#086972" />
            <div>
              <h1 className={styles.title}>{t("title")}</h1>
              <p className={styles.subtitle}>{t("subtitle")}</p>
            </div>
          </div>

          <RegisterForm />

          <div className={styles.footer}>
            {t("haveAccount")}{" "}
            <a href={`/${lang}/login`}>{t("signIn")}</a>
          </div>
        </div>
      </div>
    </>
  );
}
