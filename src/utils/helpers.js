import { ROLES } from "./constants";
import { PRIVATE_ADMIN_URLS, PRIVATE_SUPERADMIN_URLS, PRIVATE_USER_URLS, PUBLIC_SIGNED_OUT_URLS } from "./urls";

const SUPPORTED_LOCALES = ["es", "en"];

export const userIsSuperAdmin = (permissons) => permissons.includes(ROLES.SUPERADMIN);
export const userIsAdmin = (permissons) => permissons.includes(ROLES.ADMIN);
export const userIsAdminOrMore = (userRole) => userIsAdmin(userRole) || userIsSuperAdmin(userRole);
export const userIsUser = (permissons) => permissons.includes(ROLES.USER);
export const userIsUserOrMore = (userRole) => userIsUser(userRole) || userIsAdminOrMore(userRole);
export const normalizePermissions = (permissions) => {
    if (Array.isArray(permissions)) {
        return permissions;
    }

    if (!permissions) {
        return [];
    }

    return [permissions];
};
export const getLocaleFromPath = (url) => {
    const normalizedUrl = url?.startsWith("/") ? url : `/${url || ""}`;
    const firstSegment = normalizedUrl.split("/").filter(Boolean)[0];
    return SUPPORTED_LOCALES.includes(firstSegment) ? firstSegment : null;
};
export const stripLocaleFromPath = (url) => {
    const normalizedUrl = url?.startsWith("/") ? url : `/${url || ""}`;
    const segments = normalizedUrl.split("/").filter(Boolean);
    if (!SUPPORTED_LOCALES.includes(segments[0])) {
        return normalizedUrl === "" ? "/" : normalizedUrl;
    }

    const pathWithoutLocale = `/${segments.slice(1).join("/")}`.replace(/\/$/, "");
    return pathWithoutLocale || "/";
};
export const withLocalePath = (url, locale) => {
    const safePath = url?.startsWith("/") ? url : `/${url || ""}`;
    const cleanPath = stripLocaleFromPath(safePath);
    const safeLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "es";
    return cleanPath === "/" ? `/${safeLocale}` : `/${safeLocale}${cleanPath}`;
};

export const pathisAdminProtected = (url) => -1 !== PRIVATE_ADMIN_URLS.indexOf(url);
export const pathisSuperAdminProtected = (url) => -1 !== PRIVATE_SUPERADMIN_URLS.indexOf(url);
export const pathIsUserProtected = (url) => -1 !== PRIVATE_USER_URLS.indexOf(url);
export const pathIsPublicSignedOut = (url) => -1 !== PUBLIC_SIGNED_OUT_URLS.indexOf(url);
export const pathIsPrivate = (url) => pathIsUserProtected(url) || pathisSuperAdminProtected(url);

const getComparator = (element, param) => {
    if (!param) {
        return element;
    }

    const parameter = param && -1 < param.indexOf(".") ? param.split(".") : param;

    if (Array.isArray(parameter)) {
        for (let i = 0, { length } = parameter; i < length; ++i) {
            const elem = parameter[i];
            if ("object" === typeof element && elem in element) {
                element = element[elem];
            } else {
                return null;
            }
        }
        return element;
    }
    if (element && parameter) {
        return element[parameter];
    }
    return null;
};

export const sortArray = (elements, param, descending) => {
    let sortedElems = [];
    if (elements && elements.length) {
        sortedElems = [...elements];
        let elemA = null;
        let elemB = null;
        sortedElems.sort((a, b) => {
            elemA = getComparator(a, param);
            elemB = getComparator(b, param);

            if (elemA === elemB) {
                return 0;
            }

            const val = (descending && elemA < elemB) || (!descending && elemA > elemB) ? 1 : -1;
            return val;
        });
    }
    return sortedElems;
};
