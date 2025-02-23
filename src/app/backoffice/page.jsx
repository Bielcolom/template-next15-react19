import { getUserCount } from "./users/actions";
import BackofficeCard from "@/app/components/backoffice/BackofficeCard";

export default async function BackofficePage() {
    const userCount = await getUserCount();

    return (
        <div>
            <div className="backoffice-client">
                <BackofficeCard
                    text="Users"
                    icon="icon"
                    number={userCount}
                />
            </div>
        </div>
    );
}
