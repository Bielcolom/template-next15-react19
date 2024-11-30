
"use client";

import Table from "@/app/components/base/Table";
import PropTypes from "prop-types";

export default function UserRolesClient({ userRoles }) {
    return <Table elements={userRoles} />;
}

UserRolesClient.defaultProps = {
    userRoles: []
};
UserRolesClient.propTypes = {
    userRoles: PropTypes.array
};
