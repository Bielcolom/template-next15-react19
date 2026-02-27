import { getUserCount } from "./users/actions";
import PropTypes from "prop-types";
import BackofficeCard from "@/app/[lang]/components/backoffice/BackofficeCard";
import { getDictionary } from "../dictionaries";

export default async function BackofficePage({ params }) {
    const { lang } = params;
    const { data: userCount, errors: countErrors } = await getUserCount(lang);
    const dict = await getDictionary(lang, "common");
    const safeUserCount = typeof userCount === "number" ? userCount : 0;

    return (
        <div>
            {countErrors?.length > 0 && <p>{countErrors[0]}</p>}
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
