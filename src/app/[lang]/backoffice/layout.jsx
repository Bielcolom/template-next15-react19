import PropTypes from "prop-types";
import { ROLES } from "@/utils/constants";
import { requireRoutePermission } from "@/app/lib/routeAuth";

export default async function BackofficeLayout({ children, params }) {
  const { lang } = await params;

  await requireRoutePermission([ROLES.ADMIN, ROLES.SUPERADMIN], lang);

  return children;
}

BackofficeLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
