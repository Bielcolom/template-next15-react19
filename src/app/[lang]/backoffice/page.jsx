import { getUserCount } from "./users/actions";
import PropTypes from "prop-types";
import BackofficeCard from "@/app/[lang]/components/backoffice/BackofficeCard";
import { getDictionaries } from "../dictionaries";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../RouteToastHandler";

export default async function BackofficePage({ params }) {
    const { lang } = await params;
    const { data: userCount, errors: countErrors } = await getUserCount(lang);
    const dictionaries = await getDictionaries(lang, ["common", "backoffice"]);
    const commonDictionary = dictionaries.common;
    const backofficeDictionary = dictionaries.backoffice;
    const safeUserCount = typeof userCount === "number" ? userCount : 0;
    const toastMessages = {
        userCreated: commonDictionary?.feedback?.userCreated,
        userUpdated: commonDictionary?.feedback?.userUpdated,
        userDeleted: commonDictionary?.feedback?.userDeleted,
    };

    return (
        <div>
            <RouteToastHandler toastMessages={toastMessages} />
            <ToastOnMount messages={countErrors} />
            <div className="backoffice-client">
                <BackofficeCard
                    text={backofficeDictionary?.cards?.users}
                    icon="icon"
                    number={safeUserCount}
                />
            </div>
        </div>
    );
}
BackofficePage.propTypes = {
    params: PropTypes.object,
};
