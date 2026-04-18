"use client";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslations } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Table from "@/app/[lang]/components/base/Table";
import TablePagination from "@/app/[lang]/components/base/Table/TablePagination";

const SEARCH_DEBOUNCE_MS = 300;

export default function UserRolesClient({ rawUserRoles, page, total, pageSize, query }) {
  const t = useTranslations("userRoles");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);

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

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === query) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      const normalizedSearchValue = searchValue.trim();

      if (normalizedSearchValue) {
        params.set("q", normalizedSearchValue);
      } else {
        params.delete("q");
      }

      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [pathname, query, router, searchParams, searchValue]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Table
      data={rawUserRoles}
      columns={columns}
      searchable
      searchValue={searchValue}
      onSearchChange={setSearchValue}
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
  query: PropTypes.string.isRequired,
};
