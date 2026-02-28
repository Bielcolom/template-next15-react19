import RouteToastHandler from "./RouteToastHandler";
import { getDictionary } from "./dictionaries";
import styles from "./page.module.css";

export default async function Home({ params }) {
  const { lang } = await params;
  const dict = await getDictionary(lang, "common");

  const toastMessages = {
    registrationSuccess: dict?.feedback?.registrationSuccess,
  };

  return (
    <div className={styles.page}>
      <RouteToastHandler toastMessages={toastMessages} />
      <p className={styles.text}>Element on the center</p>
    </div>
  );
}
