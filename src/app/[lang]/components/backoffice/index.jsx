"use client";

import PropTypes from "prop-types";
import BackofficeCard from "./BackofficeCard";

const BackofficeClient = ({ userCount }) => {

    return (
        <div className="backoffice-client">
            <BackofficeCard
                text={"users"}
                icon="icon"
                number={userCount}
            />
            <div>
                <div>{"active"}</div>
            </div>
        </div>
    );
};

BackofficeClient.propTypes = {
    userCount: PropTypes.number.isRequired,
};

export default BackofficeClient;
