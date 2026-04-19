import Avatar from "@/app/[lang]/components/base/Avatar";
import Badge from "@/app/[lang]/components/base/Badge";
import Icon from "@/app/[lang]/components/base/Icon";
import tableStyles from "@/app/[lang]/components/base/Table/table.module.scss";

export function normalizeUser(raw) {
  const role = raw.role ?? raw.userRole ?? raw.roleName ?? null;
  const roleName = typeof role === "object" && role !== null
    ? (role.name ?? role.label ?? "")
    : (role ?? "");

  return {
    id: raw.id ?? raw._id ?? raw.email,
    name: raw.name ?? raw.fullName ?? "",
    email: raw.email ?? "",
    roleName: String(roleName),
    lastLogin: raw.lastLogin ?? raw.lastLoginAt ?? null,
    createdAt: raw.createdAt ?? raw.created_at ?? null,
  };
}

export function translateRole(name, t) {
  const roleNames = t.raw("roles");
  return roleNames?.[name] ?? name;
}

export function roleVariant(roleName) {
  const r = (roleName || "").toLowerCase();
  if (r.includes("super")) return "dark";
  if (r.includes("admin")) return "danger";
  if (r.includes("edit")) return "primary";
  return "neutral";
}

export function formatRelative(iso, locale = "es") {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const min = Math.round(diffMs / 60000);
  const hour = Math.round(min / 60);
  const day = Math.round(hour / 24);

  if (locale.startsWith("es")) {
    if (min < 1) return "ahora";
    if (min < 60) return `hace ${min} min`;
    if (hour < 24) return `hace ${hour} h`;
    if (day < 7) return `hace ${day} d`;
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  }
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (hour < 24) return `${hour}h ago`;
  if (day < 7) return `${day}d ago`;
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Devuelve las columnas del Table para la vista Users.
 * - `t` es el translator del namespace "users"
 * - `locale` para fechas relativas
 */
export function userColumns({ t, locale = "es", onEdit, onMore }) {
  return [
    {
      key: "name",
      label: t("columns.user"),
      render: (u) => (
        <div className={tableStyles.userCell}>
          <Avatar name={u.name} email={u.email} seed={u.id} />
          <div className={tableStyles.userWho}>
            <b>{u.name || u.email}</b>
            <span>{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: "roleName",
      label: t("columns.role"),
      render: (u) => u.roleName
        ? <Badge variant={roleVariant(u.roleName)}>{translateRole(u.roleName, t)}</Badge>
        : <span className={tableStyles.muted}>—</span>,
    },
    {
      key: "lastLogin",
      label: t("columns.lastLogin"),
      render: (u) => <span className={tableStyles.muted}>{formatRelative(u.lastLogin, locale)}</span>,
    },
    {
      key: "createdAt",
      label: t("columns.registered"),
      render: (u) => <span className={tableStyles.muted}>{formatRelative(u.createdAt, locale)}</span>,
    },
    {
      key: "actions",
      label: "",
      width: 80,
      align: "right",
      render: (u) => (
        <div className={tableStyles.rowActions}>
          <button type="button" aria-label={t("actions.edit")} onClick={() => onEdit?.(u)}>
            <Icon icon="edit" />
          </button>
          <button type="button" aria-label={t("actions.more")} onClick={() => onMore?.(u)}>⋯</button>
        </div>
      ),
    },
  ];
}
