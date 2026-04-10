import PropTypes from "prop-types";
import { getTranslations } from "next-intl/server";
import { getUserCount } from "@/actions/user/actions.js";
import BackofficeCard from "@/app/[lang]/components/backoffice/BackofficeCard";
import ToastOnMount from "@/app/context/ToastOnMount";
import RouteToastHandler from "../RouteToastHandler";

export default async function BackofficePage({ params }) {
    const { lang } = await params;
    const { data: userCount, errors: countErrors } = await getUserCount(lang);

    const feedbackT = await getTranslations({ locale: lang, namespace: "common.feedback" });
    const backofficeT = await getTranslations({ locale: lang, namespace: "backoffice" });
    const safeUserCount = typeof userCount === "number" ? userCount : 0;
    const toastMessages = {
        userCreated: feedbackT("userCreated"),
        userUpdated: feedbackT("userUpdated"),
        userDeleted: feedbackT("userDeleted"),
    };

    return (
        <div>
            <RouteToastHandler toastMessages={toastMessages} />
            <ToastOnMount messages={countErrors} />
            <div className="backoffice-client">
                <BackofficeCard
                    text={backofficeT("cards.users")}
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
