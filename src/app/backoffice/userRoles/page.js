"use client";

import { useState, useEffect } from "react";
import { getUserRoles } from "./actions";
import Table from "@/app/components/base/Table";
import styles from "./userRoles.module.scss";

export default function UserRolesPage() {
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRoles = async () => {
            setLoading(true);
            const roles = await getUserRoles();
            setUserRoles(roles);
            setLoading(false);
        };

        fetchUserRoles();
    }, []);

    return (
        <div className={styles.formPage}>
            <Table data={userRoles} loading={loading} />
        </div>
    );
}
