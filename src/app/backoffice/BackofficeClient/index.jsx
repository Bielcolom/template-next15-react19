import BackofficeCard from "@/app/components/backoffice/BackofficeCard";
import { getUserCount } from "../users/actions";

const BackofficeClient = async () => {
    const userCount = await getUserCount();
    return (
        <div className="backoffice-client">
            <BackofficeCard
                text="Users"
                icon="icon"
                number={userCount}
            />
        </div>
    );
};

export default BackofficeClient;