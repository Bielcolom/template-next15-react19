"use client";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Table from "@/app/[lang]/components/base/Table";
import TablePagination from "@/app/[lang]/components/base/Table/TablePagination";
import Selector from "@/app/[lang]/components/base/Selector";
import { normalizeUser, userColumns } from "./userColumns";

const SEARCH_DEBOUNCE_MS = 300;

export default function UsersClient({ rawUsers, page, total, pageSize, query, roles, role }) {
  const t = useTranslations("users");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query);
  const [roleValue, setRoleValue] = useState(role);

  const users = useMemo(() => rawUsers.map(normalizeUser), [rawUsers]);
  const columns = useMemo(() => userColumns({ t, locale }), [t, locale]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    setRoleValue(role);
  }, [role]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue === query) return;

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

  const handleRoleChange = (newRole) => {
    setRoleValue(newRole);
    const params = new URLSearchParams(searchParams.toString());

    if (newRole) {
      params.set("role", newRole);
    } else {
      params.delete("role");
    }

    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const roleFilter = roles.length > 0 && (
    <Selector
      value={roleValue}
      onChange={handleRoleChange}
      options={roles}
      placeholder={t("filter.allRoles")}
    />
  );

  return (
    <Table
      data={users}
      columns={columns}
      searchable
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      toolbar={roleFilter}
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
  query: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  role: PropTypes.string.isRequired,
};
