import { getTranslations } from "next-intl/server";
import { LoginForm } from "./LoginForm/LoginForm";
import styles from "./login.module.scss";
import BrandMandala from "@/app/[lang]/components/base/BrandMandala";
import AuthBodyClass from "@/app/[lang]/components/AuthBodyClass";

export default async function Login({ params }) {
  const { lang } = await params;
  const t = await getTranslations({ locale: lang, namespace: "login" });

  return (
    <>
      <AuthBodyClass />
      <div className={styles.formPage}>
        <aside className={styles.brandPanel}>
          <div className={styles.brandPanelBg} aria-hidden="true">
            <BrandMandala size={520} color="#ffffff" />
          </div>
          <div className={styles.brandMark}>
            <BrandMandala size={28} color="#ffffff" />
            <span className={styles.brandText}>Colom Code</span>
          </div>
          <div className={styles.brandCopy}>
            <h2>
              {t.rich("brandTitle", {
                em: (c) => <em>{c}</em>,
                br: () => <br />,
              })}
            </h2>
            <p>{t("brandSubtitle")}</p>
          </div>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.formBody}>
            <header className={styles.formHeader}>
              <h1>{t("title")}</h1>
              <p>
                {t("noAccount")}{" "}
                <a href={`/${lang}/register`}>{t("signUp")}</a>
              </p>
            </header>
            <LoginForm />
            <div className={styles.helper}>{t("secured")}</div>
          </div>
        </section>
      </div>
    </>
  );
}
