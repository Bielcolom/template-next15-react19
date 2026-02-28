import RouteToastHandler from "./RouteToastHandler";
import { getDictionaries } from "./dictionaries";
import styles from "./page.module.css";

export default async function Home({ params }) {
  const { lang } = await params;
  const dictionaries = await getDictionaries(lang, ["common", "home"]);
  const commonDictionary = dictionaries.common;
  const homeDictionary = dictionaries.home;

  const toastMessages = {
    registrationSuccess: commonDictionary?.feedback?.registrationSuccess,
  };

  return (
    <div className={styles.page}>
      <RouteToastHandler toastMessages={toastMessages} />
      <p className={styles.text}>{homeDictionary?.centeredText}</p>
    </div>
  );
}
