import { getTranslations } from "next-intl/server";
import Table from "@/app/[lang]/components/base/Table";
import { getUsers } from "../../../backoffice/users/actions";
import styles from "./users.module.scss";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../../RouteToastHandler";

export default async function UsersPage({ params }) {
    const { lang } = await params;
    const response = await getUsers(lang);
    const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
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
            <Table data={users} loading={false} />
        </div>
    );
}
