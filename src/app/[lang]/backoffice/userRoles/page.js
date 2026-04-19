import { getTranslations } from "next-intl/server";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import styles from "./userRoles.module.scss";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import UserRolesClient from "./UserRolesClient";
import PageTitle from "@/app/[lang]/components/backoffice/PageTitle";

const PAGE_SIZE = 10;

export default async function UserRolesPage({ params, searchParams }) {
  const { lang } = await params;
  const { page: pageParam, q: queryParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const query = typeof queryParam === "string" ? queryParam : "";

  const response = await getUserRoles(lang, { page, pageSize: PAGE_SIZE, query });
  const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
  const t = await getTranslations({ locale: lang, namespace: "userRoles" });
  const userRoles = Array.isArray(response?.data?.userRoles) ? response.data.userRoles : [];
  const total = response?.data?.total ?? 0;
  const errors = Array.isArray(response?.errors) ? response.errors : [];
  const toastMessages = {
    userRoleCreated: feedbackT("userRoleCreated"),
    userRoleUpdated: feedbackT("userRoleUpdated"),
    userRoleDeleted: feedbackT("userRoleDeleted"),
  };

  return (
    <div className={styles.userRolesPage}>
      <RouteToastHandler toastMessages={toastMessages} />
      <ToastOnMount messages={errors} />
      <header className={styles.head}>
        <PageTitle title={t("title")} subtitle={t("subtitle")} />
      </header>
      <UserRolesClient rawUserRoles={userRoles} page={page} total={total} pageSize={PAGE_SIZE} query={query} />
    </div>
  );
}
