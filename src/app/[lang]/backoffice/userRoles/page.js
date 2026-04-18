import { getTranslations } from "next-intl/server";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import styles from "./userRoles.module.scss";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import UserRolesClient from "./UserRolesClient";

export default async function UserRolesPage({ params }) {
    const { lang } = await params;
    const response = await getUserRoles(lang);
    const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
    const userRoles = Array.isArray(response?.data) ? response.data : [];
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
            <UserRolesClient rawUserRoles={userRoles} />
        </div>
    );
}
