import Table from "@/app/[lang]/components/base/Table";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import styles from "./userRoles.module.scss";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";
import { getDictionaries } from "../../dictionaries";

export default async function UserRolesPage({ params }) {
    const { lang } = await params;
    const response = await getUserRoles(lang);
    const dictionaries = await getDictionaries(lang, ["common", "table"]);
    const commonDictionary = dictionaries.common;
    const tableDictionary = dictionaries.table;
    const userRoles = Array.isArray(response?.data) ? response.data : [];
    const errors = Array.isArray(response?.errors) ? response.errors : [];
    const toastMessages = {
        userRoleCreated: commonDictionary?.feedback?.userRoleCreated,
        userRoleUpdated: commonDictionary?.feedback?.userRoleUpdated,
        userRoleDeleted: commonDictionary?.feedback?.userRoleDeleted,
    };

    return (
        <div className={styles.userRolesPage}>
            <RouteToastHandler toastMessages={toastMessages} />
            <ToastOnMount messages={errors} />
            <Table data={userRoles} dictionary={tableDictionary} loading={false} />
        </div>
    );
}
