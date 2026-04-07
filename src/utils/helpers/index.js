import { ROLES } from "../constants";
import {
    PRIVATE_ADMIN_URLS,
    PRIVATE_SUPERADMIN_URLS,
    PRIVATE_USER_URLS,
    PUBLIC_SIGNED_OUT_URLS,
    getLocaleFromPath,
    stripLocaleFromPath,
    getLocalizedPath,
} from "../urls";

export const normalizeFormPayload = (payload) => {
    if (payload instanceof FormData) {
        return Object.fromEntries(payload);
    }
    return payload || {};
};

export const userIsSuperAdmin = (permissons) => permissons.includes(ROLES.SUPERADMIN);
export const userIsAdmin = (permissons) => permissons.includes(ROLES.ADMIN);
export const userIsAdminOrMore = (userRole) => userIsAdmin(userRole) || userIsSuperAdmin(userRole);
export const userIsUser = (permissons) => permissons.includes(ROLES.USER);
export const userIsUserOrMore = (userRole) => userIsUser(userRole) || userIsAdminOrMore(userRole);
export const normalizePermissions = (permissions) => {
    if (Array.isArray(permissions)) {
        return permissions.filter(Boolean);
    }

    if (!permissions) {
        return [];
    }

    return [permissions];
};
export { getLocaleFromPath, stripLocaleFromPath };
export const withLocalePath = (url, locale) => getLocalizedPath(url, locale);

export const pathisAdminProtected = (url) => -1 !== PRIVATE_ADMIN_URLS.indexOf(url);
export const pathisSuperAdminProtected = (url) => -1 !== PRIVATE_SUPERADMIN_URLS.indexOf(url);
export const pathIsUserProtected = (url) => -1 !== PRIVATE_USER_URLS.indexOf(url);
export const pathIsPublicSignedOut = (url) => -1 !== PUBLIC_SIGNED_OUT_URLS.indexOf(url);
export const pathIsPrivate = (url) => pathIsUserProtected(url) || pathisSuperAdminProtected(url);

const getComparator = (element, sortKey) => {
    if (!sortKey) {
        return element;
    }

    const keys = sortKey.includes(".") ? sortKey.split(".") : sortKey;

    if (Array.isArray(keys)) {
        let current = element;
        for (const key of keys) {
            if (current !== null && typeof current === "object" && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }
        return current;
    }

    return element?.[keys] ?? null;
};

export const sortArray = (elements, sortKey, descending) => {
    if (!elements || !elements.length) {
        return [];
    }

    return [...elements].sort((a, b) => {
        const valueA = getComparator(a, sortKey);
        const valueB = getComparator(b, sortKey);

        if (valueA === valueB) return 0;
        return (descending && valueA < valueB) || (!descending && valueA > valueB) ? 1 : -1;
    });
};
