"use client";

import { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Table from "@/app/[lang]/components/base/Table";
import TablePagination from "@/app/[lang]/components/base/Table/TablePagination";
import { normalizeUser, userColumns } from "./userColumns";

export default function UsersClient({ rawUsers, page, total, pageSize }) {
  const t = useTranslations("users");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const users = useMemo(() => rawUsers.map(normalizeUser), [rawUsers]);
  const columns = useMemo(() => userColumns({ t, locale }), [t, locale]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Table
      data={users}
      columns={columns}
      searchableKeys={["name", "email"]}
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

UsersClient.propTypes = {
  rawUsers: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
};
