import { getTranslations } from "next-intl/server";
import RouteToastHandler from "./RouteToastHandler";
import styles from "./page.module.css";

export default async function Home({ params }) {
  const { lang } = await params;
  const homeT = await getTranslations({ locale: lang, namespace: "home" });
  const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });

  const toastMessages = {
    registrationSuccess: feedbackT("registrationSuccess"),
  };

  return (
    <div className={styles.page}>
      <RouteToastHandler toastMessages={toastMessages} />
      <p className={styles.text}>{homeT("centeredText")}</p>
    </div>
  );
}
