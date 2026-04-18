"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Table from "@/app/[lang]/components/base/Table";
import TablePagination from "@/app/[lang]/components/base/Table/TablePagination";

export default function UserRolesClient({ rawUserRoles, page, total, pageSize }) {
  const t = useTranslations("userRoles");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Table
      data={rawUserRoles}
      columns={columns}
      searchableKeys={["name"]}
      emptyMessage={t("empty")}
      footer={
        total > 0 && (
          <TablePagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
          />
        )
      }
    />
  );
}

UserRolesClient.propTypes = {
  rawUserRoles: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};
