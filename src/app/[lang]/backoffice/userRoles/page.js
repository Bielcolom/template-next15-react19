"use client";

import { useState, useEffect } from "react";
import { getUserRoles } from "../../../backoffice/userRoles/actions";
import Table from "@/app/[lang]/components/base/Table";
import styles from "./userRoles.module.scss";

export default function UserRolesPage() {
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        const fetchUserRoles = async () => {
            try {
                setLoading(true);
                const response = await getUserRoles();
                setUserRoles(Array.isArray(response?.data) ? response.data : []);
                setErrors(Array.isArray(response?.errors) ? response.errors : []);
            } catch (error) {
                console.error("Error loading user roles:", error);
                setUserRoles([]);
                setErrors(["An unexpected error occurred while loading user roles."]);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRoles();
    }, []);

    return (
        <div className={styles.userRolesPage}>
            {errors.length > 0 && <p>{errors[0]}</p>}
            <Table data={userRoles} loading={loading} />
        </div>
    );
}
