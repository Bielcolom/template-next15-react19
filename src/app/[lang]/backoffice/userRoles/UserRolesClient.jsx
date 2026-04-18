"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import Table from "@/app/[lang]/components/base/Table";

export default function UserRolesClient({ rawUserRoles }) {
  const t = useTranslations("userRoles");

  const columns = useMemo(() => [
    {
      key: "name",
      label: t("columns.name"),
    },
    {
      key: "permissions",
      label: t("columns.permissions"),
      render: (role) => role.permissions?.length ?? 0,
    },
  ], [t]);

  return (
    <Table
      data={rawUserRoles}
      columns={columns}
      searchableKeys={["name"]}
      pageSize={10}
      emptyMessage={t("empty")}
    />
  );
}

UserRolesClient.propTypes = {
  rawUserRoles: PropTypes.array.isRequired,
};
