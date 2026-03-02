import PropTypes from "prop-types";
import { ROLES } from "@/utils/constants";
import { requireRoutePermission } from "@/app/lib/routeAuth";

export default async function UserRolesLayout({ children, params }) {
  const { lang } = await params;

  await requireRoutePermission(ROLES.SUPERADMIN, lang);

  return children;
}

UserRolesLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
