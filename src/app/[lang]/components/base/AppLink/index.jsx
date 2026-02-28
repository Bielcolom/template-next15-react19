"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { useAppRouter } from "@/app/[lang]/hooks/useAppRouter";
import { getLocalizedPath } from "@/utils/urls";

const AppLink = ({ href, children, ...props }) => {
  const { locale } = useAppRouter();
  const isInternalPath = typeof href === "string" && href.startsWith("/");
  const localizedHref = isInternalPath ? getLocalizedPath(href, locale) : href;

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
};

AppLink.propTypes = {
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  children: PropTypes.node.isRequired,
};

export default AppLink;
