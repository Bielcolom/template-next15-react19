import { getTranslations } from "next-intl/server";
import { getUsers, getRoles } from "../../../backoffice/users/actions";
import UsersClient from "./UsersClient";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import PageTitle from "@/app/[lang]/components/backoffice/PageTitle";
import styles from "./users.module.scss";

const PAGE_SIZE = 10;

export default async function UsersPage({ params, searchParams }) {
  const { lang } = await params;
  const { page: pageParam, q: queryParam, role: roleParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const query = typeof queryParam === "string" ? queryParam : "";
  const role = typeof roleParam === "string" ? roleParam : "";

  const [response, rolesResponse] = await Promise.all([
    getUsers(lang, { page, pageSize: PAGE_SIZE, query, role }),
    getRoles(),
  ]);

  const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
  const t = await getTranslations({ locale: lang, namespace: "users" });

  const users = Array.isArray(response?.data?.users) ? response.data.users : [];
  const total = response?.data?.total ?? 0;
  const roles = Array.isArray(rolesResponse?.data?.roles) ? rolesResponse.data.roles : [];
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
        <PageTitle title={t("title")} subtitle={t("subtitle")} />
        <div className={styles.headActions}>
          <button type="button" className={styles.btnGhost}>{t("exportCsv")}</button>
          <button type="button" className={styles.btnPrimary}>+ {t("add")}</button>
        </div>
      </header>

      <UsersClient
        rawUsers={users}
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        query={query}
        roles={roles}
        role={role}
      />
    </div>
  );
}
