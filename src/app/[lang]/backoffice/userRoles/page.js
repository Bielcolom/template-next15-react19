import Table from "@/app/[lang]/components/base/Table";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import styles from "./userRoles.module.scss";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import { getDictionary } from "../../dictionaries";

export default async function UserRolesPage({ params }) {
    const { lang } = params;
    const response = await getUserRoles(lang);
    const dict = await getDictionary(lang, "common");
    const userRoles = Array.isArray(response?.data) ? response.data : [];
    const errors = Array.isArray(response?.errors) ? response.errors : [];
    const toastMessages = {
        userRoleCreated: dict?.feedback?.userRoleCreated,
        userRoleUpdated: dict?.feedback?.userRoleUpdated,
        userRoleDeleted: dict?.feedback?.userRoleDeleted,
    };

    return (
        <div className={styles.userRolesPage}>
            <RouteToastHandler toastMessages={toastMessages} />
            <ToastOnMount messages={errors} />
            <Table data={userRoles} loading={false} />
        </div>
    );
}
