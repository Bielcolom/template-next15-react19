import { getUserCount } from "./users/actions";
import PropTypes from "prop-types";
import BackofficeCard from "@/app/[lang]/components/backoffice/BackofficeCard";
import { getDictionary } from "../dictionaries";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../RouteToastHandler";

export default async function BackofficePage({ params }) {
    const { lang } = params;
    const { data: userCount, errors: countErrors } = await getUserCount(lang);
    const dict = await getDictionary(lang, "common");
    const safeUserCount = typeof userCount === "number" ? userCount : 0;
    const toastMessages = {
        userCreated: dict?.feedback?.userCreated,
        userUpdated: dict?.feedback?.userUpdated,
        userDeleted: dict?.feedback?.userDeleted,
    };

    return (
        <div>
            <RouteToastHandler toastMessages={toastMessages} />
            <ToastOnMount messages={countErrors} />
            <div className="backoffice-client">
                <BackofficeCard
                    text="Users"
                    icon="icon"
                    number={safeUserCount}
                />
            </div>
            <p>lang: {lang}</p>
            <p>translation: {dict.accept}</p>
        </div>
    );
}
BackofficePage.propTypes = {
    params: PropTypes.object,
};
