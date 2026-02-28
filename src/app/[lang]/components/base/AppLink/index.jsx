"use client";

import NextLink from "next/link";
import PropTypes from "prop-types";
import { Link as IntlLink } from "@/i18n/navigation";

const AppLink = ({ href, children, ...props }) => {
  const isInternalPath = typeof href === "string" && href.startsWith("/");

  return isInternalPath ? (
    <IntlLink href={href} {...props}>
      {children}
    </IntlLink>
  ) : (
    <NextLink href={href} {...props}>
      {children}
    </NextLink>
  );
};

AppLink.propTypes = {
  href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  children: PropTypes.node.isRequired,
};

export default AppLink;
