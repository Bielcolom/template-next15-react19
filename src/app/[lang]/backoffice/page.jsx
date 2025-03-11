import { getUserCount } from "./users/actions";
import PropTypes from "prop-types";
import BackofficeCard from "@/app/[lang]/components/backoffice/BackofficeCard";
import { getDictionary } from "../dictionaries";

export default async function BackofficePage({ params }) {
    const { lang } = await params;
    const userCount = await getUserCount();
    const dict = await getDictionary(lang, "common");

    return (
        <div>
            <div className="backoffice-client">
                <BackofficeCard
                    text="Users"
                    icon="icon"
                    number={userCount}
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
