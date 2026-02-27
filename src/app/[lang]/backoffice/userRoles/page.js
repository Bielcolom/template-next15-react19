import Table from "@/app/[lang]/components/base/Table";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import styles from "./userRoles.module.scss";

export default async function UserRolesPage() {
    const response = await getUserRoles();
    const userRoles = Array.isArray(response?.data) ? response.data : [];
    const errors = Array.isArray(response?.errors) ? response.errors : [];

    return (
        <div className={styles.userRolesPage}>
            {errors.length > 0 && <p>{errors[0]}</p>}
            <Table data={userRoles} loading={false} />
        </div>
    );
}
