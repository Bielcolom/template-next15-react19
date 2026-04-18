"use client";

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslations, useLocale } from "next-intl";
import Table from "@/app/[lang]/components/base/Table";
import tableStyles from "@/app/[lang]/components/base/Table/table.module.scss";
import { normalizeUser, statusMeta, userColumns } from "./userColumns";

const FILTERS = ["all", "active", "pending", "disabled"];

/**
 * Client shell para la página Users. Mantiene el estado de filtros y delega
 * todo el render de la tabla a <Table>.
 */
export default function UsersClient({ rawUsers }) {
  const t = useTranslations("users");
  const locale = useLocale();

  const users = useMemo(() => rawUsers.map(normalizeUser), [rawUsers]);
  const [filter, setFilter] = useState("all");

  const counts = useMemo(() => ({
    all: users.length,
    active: users.filter(u => statusMeta(u.status).key === "active").length,
    pending: users.filter(u => statusMeta(u.status).key === "pending").length,
    disabled: users.filter(u => statusMeta(u.status).key === "disabled").length,
  }), [users]);

  const filtered = useMemo(() => {
    if (filter === "all") return users;
    return users.filter(u => statusMeta(u.status).key === filter);
  }, [users, filter]);

  const columns = useMemo(() => userColumns({ t, locale }), [t, locale]);

  const chips = (
    <div className={tableStyles.chips}>
      {FILTERS.map(f => (
        <button
          key={f}
          type="button"
          onClick={() => setFilter(f)}
          className={`${tableStyles.chip} ${filter === f ? tableStyles.chipActive : ""}`}
        >
          {t(`filters.${f}`)}
          <span className={tableStyles.chipCount}>{counts[f]}</span>
        </button>
      ))}
    </div>
  );

  return (
    <Table
      data={filtered}
      columns={columns}
      searchableKeys={["name", "email"]}
      pageSize={10}
      toolbar={chips}
      emptyMessage={t("empty")}
    />
  );
}

UsersClient.propTypes = {
  rawUsers: PropTypes.array.isRequired,
};
