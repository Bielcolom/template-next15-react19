import { getTranslations } from "next-intl/server";
import { getUsers } from "../../../backoffice/users/actions";
import UsersClient from "./UsersClient";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import styles from "./users.module.scss";

export default async function UsersPage({ params }) {
  const { lang } = await params;
  const response = await getUsers(lang);
  const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
  const t = await getTranslations({ locale: lang, namespace: "users" });

  const users = Array.isArray(response?.data) ? response.data : [];
  const errors = Array.isArray(response?.errors) ? response.errors : [];
  const toastMessages = {
    userCreated: feedbackT("userCreated"),
    userUpdated: feedbackT("userUpdated"),
    userDeleted: feedbackT("userDeleted"),
  };

  return (
    <div className={styles.usersPage}>
      <RouteToastHandler toastMessages={toastMessages} />
      <ToastOnMount messages={errors} />

      <header className={styles.head}>
        <div>
          <h1>{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </div>
        <div className={styles.headActions}>
          <button type="button" className={styles.btnGhost}>{t("exportCsv")}</button>
          <button type="button" className={styles.btnPrimary}>+ {t("invite")}</button>
        </div>
      </header>

      <UsersClient rawUsers={users} />
    </div>
  );
}
